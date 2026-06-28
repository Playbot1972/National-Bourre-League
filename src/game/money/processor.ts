import type {
  MoneyEvent,
  MoneyEngineResult,
  MoneyInvariantReport,
  MoneyLedgerState,
  RecordHandSettlementInput,
  ScoreById,
} from "./types";
import { MONEY_ENGINE_VERSION } from "./types";
import { hasActionBeenApplied, makeEventId } from "./idempotency";
import { ledgerChipTotal, replayEvents } from "./replay";
import { recordHandSettlement, startNextHandFunding } from "./pipeline";
import { scoreBankroll, sessionChipTotal } from "./core";

function nextSequence(state: MoneyLedgerState, events: MoneyEvent[]): number {
  const maxIn = events.reduce((m, e) => Math.max(m, e.sequence), 0);
  return Math.max(state.sequence, maxIn) + 1;
}

function buildInvariantReport(
  state: MoneyLedgerState,
  expectedTotal?: number,
): MoneyInvariantReport {
  const chipTotal = ledgerChipTotal(state);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (expectedTotal != null && chipTotal !== expectedTotal) {
    errors.push(`chip total ${chipTotal} !== expected ${expectedTotal}`);
  }
  for (const [pid, br] of Object.entries(state.bankrolls)) {
    if (br < 0) errors.push(`negative bankroll for ${pid}: ${br}`);
  }
  return { ok: errors.length === 0, chipTotal, expectedChipTotal: expectedTotal, errors, warnings };
}

export interface ProcessBuyInInput {
  actionId: string;
  playerIds: string[];
  buyInAmount: number;
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

/** Session create — initial buy-in per player. */
export function processBuyIn(input: ProcessBuyInInput): MoneyEngineResult {
  const {
    actionId,
    playerIds,
    buyInAmount,
    existingEvents = [],
    ledger = {
      version: MONEY_ENGINE_VERSION,
      buyInFallback: buyInAmount,
      bankrolls: {},
      nets: {},
      carryOverPot: 0,
      postedAntes: {},
      scoreFlags: {},
      sequence: 0,
    },
  } = input;

  if (hasActionBeenApplied(existingEvents, actionId)) {
    const replayed = replayEvents(existingEvents, ledger);
    return {
      delta: {},
      newEvents: [],
      newBankrolls: replayed.bankrolls,
      carryOverPot: replayed.carryOverPot,
      postedAntes: replayed.postedAntes,
      invariants: buildInvariantReport(replayed, playerIds.length * buyInAmount),
      version: MONEY_ENGINE_VERSION,
    };
  }

  let seq = nextSequence(ledger, existingEvents);
  const newEvents: MoneyEvent[] = playerIds.map((pid) => ({
    eventId: makeEventId(actionId, "BUY_IN_APPLIED", pid),
    actionId,
    handId: null,
    phase: "session_start",
    sequence: seq++,
    type: "BUY_IN_APPLIED",
    playerId: pid,
    amount: buyInAmount,
    metadata: {},
    timestamp: Date.now(),
  }));

  const replayed = replayEvents([...existingEvents, ...newEvents], ledger);
  const expected = playerIds.length * buyInAmount;
  return {
    delta: Object.fromEntries(playerIds.map((pid) => [pid, buyInAmount])),
    newEvents,
    newBankrolls: replayed.bankrolls,
    carryOverPot: 0,
    postedAntes: {},
    invariants: buildInvariantReport(replayed, expected),
    version: MONEY_ENGINE_VERSION,
  };
}

export interface ProcessAnteInput {
  actionId: string;
  handId: string;
  carryOverPot: number;
  participantIds: string[];
  scoreById: ScoreById;
  sessionStake: number;
  buyInFallback: number;
  nextDealFunding?: import("./types").RecordHandSettlementResult["nextDealFunding"] | null;
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

/** Deal start — collect antes and fund pot from carry. */
export function processAnte(input: ProcessAnteInput): MoneyEngineResult & {
  collected: import("./types").CollectAntesResult;
} {
  const {
    actionId,
    handId,
    carryOverPot,
    participantIds,
    scoreById,
    sessionStake,
    buyInFallback,
    nextDealFunding = null,
    existingEvents = [],
    ledger = {
      version: MONEY_ENGINE_VERSION,
      buyInFallback,
      bankrolls: Object.fromEntries(
        Object.entries(scoreById).map(([pid, row]) => [
          pid,
          scoreBankroll(row, buyInFallback),
        ]),
      ),
      nets: Object.fromEntries(
        Object.entries(scoreById).map(([pid, row]) => [pid, Number(row?.net) || 0]),
      ),
      carryOverPot,
      postedAntes: {},
      scoreFlags: {},
      sequence: 0,
    },
  } = input;

  if (hasActionBeenApplied(existingEvents, actionId)) {
    const deal = startNextHandFunding({
      scoreById,
      nextDealFunding: nextDealFunding!,
      carryOverPot,
      participantIds,
      sessionStake,
      buyInFallback,
    });
    const replayed = replayEvents(existingEvents, ledger);
    return {
      delta: {},
      newEvents: [],
      newBankrolls: replayed.bankrolls,
      carryOverPot: replayed.carryOverPot,
      postedAntes: replayed.postedAntes,
      invariants: buildInvariantReport(replayed),
      version: MONEY_ENGINE_VERSION,
      collected: deal.collected,
    };
  }

  const beforeTotal = sessionChipTotal(scoreById, {
    carryOverPot,
    buyInFallback,
  });

  const deal = startNextHandFunding({
    scoreById,
    nextDealFunding: nextDealFunding ?? {
      settledPot: 0,
      bourreIds: [],
      byPlayer: {},
    },
    carryOverPot,
    participantIds,
    sessionStake,
    buyInFallback,
  });

  let seq = nextSequence(ledger, existingEvents);
  const newEvents: MoneyEvent[] = [];

  for (const [pid, posted] of Object.entries(deal.collected.postedAntes)) {
    const amt = Math.max(0, Number(posted) || 0);
    if (amt > 0) {
      newEvents.push({
        eventId: makeEventId(actionId, "ANTE_DEDUCTED", pid),
        actionId,
        handId,
        phase: "ante_collect",
        sequence: seq++,
        type: "ANTE_DEDUCTED",
        playerId: pid,
        amount: amt,
        metadata: { sessionStake },
        timestamp: Date.now(),
      });
    }
  }

  const replayed = replayEvents([...existingEvents, ...newEvents], {
    ...ledger,
    carryOverPot,
  });
  const invariants = buildInvariantReport(replayed, beforeTotal);

  return {
    delta: Object.fromEntries(
      Object.entries(deal.collected.bankrolls).map(([pid, br]) => {
        const before = scoreBankroll(scoreById[pid], buyInFallback);
        return [pid, br - before];
      }),
    ),
    newEvents,
    newBankrolls: deal.collected.bankrolls,
    carryOverPot: 0,
    postedAntes: deal.collected.postedAntes,
    invariants,
    version: MONEY_ENGINE_VERSION,
    collected: deal.collected,
  };
}

export interface ProcessHandSettlementInput extends RecordHandSettlementInput {
  actionId: string;
  handId: string;
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

/** Hand end — settlement, bourré liability, winner credit, carry, next-deal flags. */
export function processHandSettlement(
  input: ProcessHandSettlementInput,
): MoneyEngineResult & { settlement: ReturnType<typeof recordHandSettlement> } {
  const {
    actionId,
    handId,
    existingEvents = [],
    ledger,
    ...settlementInput
  } = input;
  const buyInFallback = settlementInput.buyInFallback ?? 100;

  if (hasActionBeenApplied(existingEvents, actionId)) {
    const settlement = recordHandSettlement(settlementInput);
    const base =
      ledger ??
      ({
        version: MONEY_ENGINE_VERSION,
        buyInFallback,
        bankrolls: {},
        nets: {},
        carryOverPot: settlementInput.carryIn ?? 0,
        postedAntes: settlementInput.postedAntes ?? {},
        scoreFlags: {},
        sequence: 0,
      } satisfies MoneyLedgerState);
    const replayed = replayEvents(existingEvents, base);
    return {
      delta: {},
      newEvents: [],
      newBankrolls: replayed.bankrolls,
      carryOverPot: replayed.carryOverPot,
      postedAntes: {},
      invariants: buildInvariantReport(replayed),
      version: MONEY_ENGINE_VERSION,
      settlement,
    };
  }

  const beforeTotal = sessionChipTotal(settlementInput.scoreById, {
    carryOverPot: settlementInput.carryIn ?? 0,
    postedAntes: settlementInput.postedAntes ?? {},
    buyInFallback,
  });

  const settlement = recordHandSettlement(settlementInput);
  let seq = nextSequence(
    ledger ?? {
      version: MONEY_ENGINE_VERSION,
      buyInFallback,
      bankrolls: {},
      nets: {},
      carryOverPot: 0,
      postedAntes: {},
      scoreFlags: {},
      sequence: 0,
    },
    existingEvents,
  );

  const newEvents: MoneyEvent[] = [];

  for (const pid of settlement.participants) {
    const applied = settlement.appliedDeltas[pid] ?? 0;
    const isBourre = settlement.bourreIds.includes(pid);
    if (applied < 0) {
      const abs = Math.abs(applied);
      if (isBourre) {
        newEvents.push({
          eventId: makeEventId(actionId, "BOURRE_LIABILITY", pid),
          actionId,
          handId,
          phase: "hand_settlement",
          sequence: seq++,
          type: "BOURRE_LIABILITY",
          playerId: pid,
          amount: abs,
          metadata: { mode: settlement.mode },
          timestamp: Date.now(),
        });
      } else {
        newEvents.push({
          eventId: makeEventId(actionId, "SETTLEMENT_DEBIT", pid),
          actionId,
          handId,
          phase: "hand_settlement",
          sequence: seq++,
          type: "SETTLEMENT_DEBIT",
          playerId: pid,
          amount: abs,
          metadata: { mode: settlement.mode },
          timestamp: Date.now(),
        });
      }
    } else if (applied > 0) {
      const type =
        settlement.mode === "split" ? "SPLIT_POT_APPLIED" : "WINNER_CREDITED";
      newEvents.push({
        eventId: makeEventId(actionId, type, pid),
        actionId,
        handId,
        phase: "hand_settlement",
        sequence: seq++,
        type,
        playerId: pid,
        amount: applied,
        metadata: { mode: settlement.mode },
        timestamp: Date.now(),
      });
    }
  }

  newEvents.push({
    eventId: makeEventId(actionId, "CARRY_OVER_SET", null),
    actionId,
    handId,
    phase: "hand_settlement",
    sequence: seq++,
    type: "CARRY_OVER_SET",
    playerId: null,
    amount: settlement.carryOverPot,
    metadata: { bourreMatch: settlement.bourreMatch },
    timestamp: Date.now(),
  });

  for (const pid of settlement.participants) {
    const flags = settlement.nextDealFunding.byPlayer[pid];
    if (!flags) continue;
    newEvents.push({
      eventId: makeEventId(actionId, "NEXT_DEAL_FUNDING", pid),
      actionId,
      handId,
      phase: "next_deal",
      sequence: seq++,
      type: "NEXT_DEAL_FUNDING",
      playerId: pid,
      amount: 0,
      metadata: {
        skipNextAnte: flags.skipNextAnte,
        bourreReplacementDue: flags.bourreReplacementDue,
      },
      timestamp: Date.now(),
    });
  }

  const baseLedger =
    ledger ??
    ({
      version: MONEY_ENGINE_VERSION,
      buyInFallback,
      bankrolls: Object.fromEntries(
        settlement.participants.map((pid) => [
          pid,
          scoreBankroll(settlementInput.scoreById[pid], buyInFallback),
        ]),
      ),
      nets: Object.fromEntries(
        settlement.participants.map((pid) => [
          pid,
          Number(settlementInput.scoreById[pid]?.net) || 0,
        ]),
      ),
      carryOverPot: settlementInput.carryIn ?? 0,
      postedAntes: { ...(settlementInput.postedAntes ?? {}) },
      scoreFlags: {},
      sequence: 0,
    } satisfies MoneyLedgerState);

  const replayed = replayEvents([...existingEvents, ...newEvents], baseLedger);
  const invariants = buildInvariantReport(replayed, beforeTotal);

  return {
    delta: settlement.appliedDeltas,
    newEvents,
    newBankrolls: settlement.bankrolls,
    carryOverPot: settlement.carryOverPot,
    postedAntes: {},
    invariants,
    version: MONEY_ENGINE_VERSION,
    settlement,
  };
}

export interface ProcessRebuyInput {
  actionId: string;
  playerId: string;
  buyInAmount: number;
  handId?: string | null;
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

export function processRebuy(input: ProcessRebuyInput): MoneyEngineResult {
  const {
    actionId,
    playerId,
    buyInAmount,
    handId = null,
    existingEvents = [],
    ledger = {
      version: MONEY_ENGINE_VERSION,
      buyInFallback: buyInAmount,
      bankrolls: {},
      nets: {},
      carryOverPot: 0,
      postedAntes: {},
      scoreFlags: {},
      sequence: 0,
    },
  } = input;

  if (hasActionBeenApplied(existingEvents, actionId)) {
    const replayed = replayEvents(existingEvents, ledger);
    return {
      delta: {},
      newEvents: [],
      newBankrolls: replayed.bankrolls,
      carryOverPot: replayed.carryOverPot,
      postedAntes: replayed.postedAntes,
      invariants: buildInvariantReport(replayed),
      version: MONEY_ENGINE_VERSION,
    };
  }

  const beforeTotal = ledgerChipTotal(ledger);
  let seq = nextSequence(ledger, existingEvents);
  const newEvents: MoneyEvent[] = [
    {
      eventId: makeEventId(actionId, "REBUY_APPLIED", playerId),
      actionId,
      handId,
      phase: "rebuy",
      sequence: seq,
      type: "REBUY_APPLIED",
      playerId,
      amount: buyInAmount,
      metadata: {},
      timestamp: Date.now(),
    },
  ];

  const replayed = replayEvents([...existingEvents, ...newEvents], ledger);
  const invariants = buildInvariantReport(replayed, beforeTotal + buyInAmount);

  return {
    delta: { [playerId]: buyInAmount },
    newEvents,
    newBankrolls: replayed.bankrolls,
    carryOverPot: replayed.carryOverPot,
    postedAntes: replayed.postedAntes,
    invariants,
    version: MONEY_ENGINE_VERSION,
  };
}

/** Alias for next-deal funding merge validation. */
export const processNextDealFunding = processAnte;

/** Bourré liability is emitted inside processHandSettlement. */
export const processBourreLiability = processHandSettlement;
