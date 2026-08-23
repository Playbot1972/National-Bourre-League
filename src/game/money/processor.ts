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
import { emptyLedgerState, ledgerChipTotal, replayEvents, ledgerFromScoreById } from "./replay";
import { recordHandSettlement, startNextHandFunding } from "./pipeline";
import { computeRebuyContributions } from "./canonical";
import {
  buildSoloWinSettlement,
  scoreBankroll,
  sessionChipTotal,
} from "./core";
import { tableChipTotal, validateChipGrowthInvariant } from "./conservation";

function nextSequence(state: MoneyLedgerState, events: MoneyEvent[]): number {
  const maxIn = events.reduce((m, e) => Math.max(m, e.sequence), 0);
  return Math.max(state.sequence, maxIn) + 1;
}

function buildInvariantReport(
  state: MoneyLedgerState,
  expectedTotal?: number,
  growthContext?: {
    before: Parameters<typeof tableChipTotal>[0];
    rebuyContributionByPlayer?: Record<string, number>;
    bourrePenaltyToPotByPlayer?: Record<string, number>;
    label?: string;
  },
): MoneyInvariantReport {
  const chipTotal = ledgerChipTotal(state);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (expectedTotal != null && chipTotal !== expectedTotal) {
    errors.push(`chip total ${chipTotal} !== expected ${expectedTotal}`);
  }
  if (growthContext) {
    const after = {
      bankrolls: state.bankrolls,
      carryOverPot: state.carryOverPot,
      postedAntes: state.postedAntes,
    };
    const growth = validateChipGrowthInvariant({
      before: growthContext.before,
      after,
      rebuyContributionByPlayer: growthContext.rebuyContributionByPlayer,
      bourrePenaltyToPotByPlayer: growthContext.bourrePenaltyToPotByPlayer,
      label: growthContext.label,
    });
    errors.push(...growth.errors);
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

  const beforeState = replayEvents(existingEvents, ledger);
  const beforeTotal = ledgerChipTotal(beforeState);

  if (hasActionBeenApplied(existingEvents, actionId)) {
    const replayed = replayEvents(existingEvents, ledger);
    return {
      delta: {},
      newEvents: [],
      newBankrolls: replayed.bankrolls,
      carryOverPot: replayed.carryOverPot,
      postedAntes: replayed.postedAntes,
      invariants: buildInvariantReport(replayed, beforeTotal),
      version: MONEY_ENGINE_VERSION,
    };
  }

  let seq = nextSequence(beforeState, existingEvents);
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
  const expected = beforeTotal + playerIds.length * buyInAmount;
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
      // Authoritative post-funding stacks from settled score rows — not replay snapshot
      // (replay can lag when settlement events committed without a matching score write).
      newBankrolls: deal.collected.bankrolls,
      carryOverPot: replayed.carryOverPot,
      postedAntes: deal.collected.postedAntes,
      invariants: buildInvariantReport(replayed),
      version: MONEY_ENGINE_VERSION,
      collected: deal.collected,
    };
  }

  const beforeTotal = sessionChipTotal(scoreById, {
    carryOverPot,
    buyInFallback,
  });

  const beforeSnapshot = {
    bankrolls: Object.fromEntries(
      participantIds.map((pid) => [pid, scoreBankroll(scoreById[pid], buyInFallback)]),
    ),
    carryOverPot,
    postedAntes: {},
  };

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
  const invariants = buildInvariantReport(replayed, beforeTotal, {
    before: beforeSnapshot,
    label: "ante_collect",
  });

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
  /** Session id — used to align deal-ante and settlement-ante action ids. */
  sessionId?: string;
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

/** Same action id as runV1AnteCollection / deal start. */
export function dealAnteActionId(sessionId: string | undefined, handId: string): string {
  return sessionId ? `ante:${sessionId}:${handId}` : `ante:${handId}`;
}

/**
 * When antes were collected at deal time without v1 events, backfill ANTE_DEDUCTED
 * before settlement credits so replay matches stored bankrolls (symmetric for all winners).
 */
export function buildMissingDealAnteEvents(
  existingEvents: MoneyEvent[],
  opts: {
    sessionId?: string;
    handId: string;
    postedAntes: Record<string, number>;
    sessionStake: number;
    startSequence: number;
  },
): MoneyEvent[] {
  const { sessionId, handId, postedAntes, sessionStake, startSequence } = opts;
  const anteActionId = dealAnteActionId(sessionId, handId);
  if (hasActionBeenApplied(existingEvents, anteActionId)) {
    return [];
  }

  const postedTotal = Object.values(postedAntes || {}).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );
  if (postedTotal <= 0) {
    return [];
  }

  const loggedForHand = existingEvents.filter(
    (e) => e.type === "ANTE_DEDUCTED" && e.handId === handId,
  );
  if (loggedForHand.length > 0) {
    return [];
  }

  const events: MoneyEvent[] = [];
  let seq = startSequence;
  for (const [pid, raw] of Object.entries(postedAntes || {})) {
    const amt = Math.max(0, Number(raw) || 0);
    if (amt <= 0) continue;
    const eventId = makeEventId(anteActionId, "ANTE_DEDUCTED", pid);
    if (existingEvents.some((e) => e.eventId === eventId)) continue;
    events.push({
      eventId,
      actionId: anteActionId,
      handId,
      phase: "ante_collect",
      sequence: seq++,
      type: "ANTE_DEDUCTED",
      playerId: pid,
      amount: amt,
      metadata: { sessionStake, source: "settlement_sync" },
      timestamp: Date.now(),
    });
  }
  return events;
}

/** Hand end — settlement, bourré liability, winner credit, carry, next-deal flags. */
export function processHandSettlement(
  input: ProcessHandSettlementInput,
): MoneyEngineResult & { settlement: ReturnType<typeof recordHandSettlement> } {
  const {
    actionId,
    handId,
    sessionId,
    existingEvents = [],
    ledger,
    ...settlementInput
  } = input;
  const buyInFallback = settlementInput.buyInFallback ?? 100;
  const replayBase = ledger ?? emptyLedgerState(buyInFallback);

  if (hasActionBeenApplied(existingEvents, actionId)) {
    const settlement = recordHandSettlement(settlementInput);
    const replayed = replayEvents(existingEvents, replayBase);
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

  const beforeReplayed = replayEvents(existingEvents, replayBase);
  const beforeTotal = ledgerChipTotal(beforeReplayed);

  const settlement = recordHandSettlement(settlementInput);
  let seq = nextSequence(replayBase, existingEvents);

  const anteSyncEvents = buildMissingDealAnteEvents(existingEvents, {
    sessionId,
    handId,
    postedAntes: settlementInput.postedAntes ?? {},
    sessionStake: settlementInput.sessionStake ?? 1,
    startSequence: seq,
  });
  seq += anteSyncEvents.length;

  const newEvents: MoneyEvent[] = [...anteSyncEvents];

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

  const replayed = replayEvents([...existingEvents, ...newEvents], replayBase);
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

  const { rebuyContributionByPlayer } = computeRebuyContributions({
    stackByPlayer: ledger.bankrolls,
    participantIds: [playerId],
    rebuyEnabled: true,
    rebuyAmount: buyInAmount,
    rebuyPlayerIds: [playerId],
  });
  const rebuyAmount = rebuyContributionByPlayer[playerId] ?? buyInAmount;

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
      amount: rebuyAmount,
      metadata: { fundingReason: "rebuy" },
      timestamp: Date.now(),
    },
  ];

  const beforeSnapshot = {
    bankrolls: Object.fromEntries(
      Object.keys(ledger.bankrolls).map((pid) => [pid, ledger.bankrolls[pid] ?? 0]),
    ),
    carryOverPot: ledger.carryOverPot,
    postedAntes: { ...ledger.postedAntes },
  };

  const replayed = replayEvents([...existingEvents, ...newEvents], ledger);
  const invariants = buildInvariantReport(replayed, beforeTotal + rebuyAmount, {
    before: beforeSnapshot,
    rebuyContributionByPlayer: { [playerId]: rebuyAmount },
    label: "rebuy",
  });

  return {
    delta: { [playerId]: rebuyAmount },
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

export interface ProcessCashOutInput {
  actionId: string;
  playerId: string;
  amount: number;
  handId?: string | null;
  reason?: string;
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

/** Balanced cash-out — debits bankroll; baseline netCashOut bumped by caller. */
export function processCashOut(input: ProcessCashOutInput): MoneyEngineResult {
  const {
    actionId,
    playerId,
    amount,
    handId = null,
    reason = "player_removal",
    existingEvents = [],
    ledger = emptyLedgerState(100),
  } = input;

  const cashOutAmount = Math.max(0, Number(amount) || 0);
  if (cashOutAmount <= 0) {
    throw new Error("cash-out amount must be positive");
  }

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

  const bankroll = ledger.bankrolls[playerId] ?? 0;
  if (cashOutAmount > bankroll) {
    throw new Error(
      `cash-out overdraft: ${playerId} has ${bankroll}, requested ${cashOutAmount}`,
    );
  }

  const beforeTotal = ledgerChipTotal(ledger);
  let seq = nextSequence(ledger, existingEvents);
  const newEvents: MoneyEvent[] = [
    {
      eventId: makeEventId(actionId, "CASH_OUT_APPLIED", playerId),
      actionId,
      handId,
      phase: "session_finalize",
      sequence: seq,
      type: "CASH_OUT_APPLIED",
      playerId,
      amount: cashOutAmount,
      metadata: { reason },
      timestamp: Date.now(),
    },
  ];

  const replayed = replayEvents([...existingEvents, ...newEvents], ledger);
  const expectedTotal = beforeTotal - cashOutAmount;
  const invariants = buildInvariantReport(replayed, expectedTotal);

  return {
    delta: { [playerId]: -cashOutAmount },
    newEvents,
    newBankrolls: replayed.bankrolls,
    carryOverPot: replayed.carryOverPot,
    postedAntes: replayed.postedAntes,
    invariants,
    version: MONEY_ENGINE_VERSION,
  };
}

export interface ProcessSoloWinSettlementInput {
  actionId: string;
  handId: string;
  sessionId: string;
  winnerId: string;
  carryIn?: number;
  postedAntes?: Record<string, number>;
  scoreById: ScoreById;
  buyInFallback?: number;
  participants: string[];
  sessionStake?: number;
  limEnabled?: boolean;
  stakeForPlayer?: (pid: string) => number;
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

/** Ledger-backed solo-win — same settlement events as a contested hand win. */
export function processSoloWinSettlement(
  input: ProcessSoloWinSettlementInput,
): MoneyEngineResult & { settlement: ReturnType<typeof recordHandSettlement> } {
  const {
    actionId,
    handId,
    winnerId,
    carryIn = 0,
    postedAntes = {},
    scoreById,
    buyInFallback = 100,
    participants,
    sessionStake = 1,
    limEnabled = false,
    stakeForPlayer,
    existingEvents = [],
    ledger,
  } = input;

  const settled = buildSoloWinSettlement({
    winnerId,
    carryIn,
    postedAntes,
    scoreById,
    buyInFallback,
    participants,
    sessionStake,
    stakeForPlayer,
  });

  if (!settled.ready && !settled.prefunded) {
    throw new Error(
      `solo win not ready: ${(settled as { reason?: string }).reason ?? "unknown"}`,
    );
  }

  const settlementPostedAntes = settled.prefunded
    ? postedAntes
    : settled.postedAntes ?? {};
  const settlementParticipants =
    settled.prefunded
      ? Object.keys(settlementPostedAntes).filter(
          (pid) => (settlementPostedAntes[pid] || 0) > 0,
        )
      : [winnerId];
  const trickParticipants =
    settlementParticipants.length > 0 ? settlementParticipants : [winnerId];
  const settlementLedger =
    ledger ??
    ledgerFromScoreById(scoreById, {
      buyInFallback,
      carryOverPot: carryIn,
      postedAntes: {},
    });

  return processHandSettlement({
    actionId,
    handId,
    sessionId: input.sessionId,
    mode: "win",
    winners: [winnerId],
    participants: trickParticipants,
    tricksByPlayer: Object.fromEntries(trickParticipants.map((pid) => [pid, 0])),
    scoreById,
    sessionStake,
    limEnabled,
    carryIn,
    postedAntes: settlementPostedAntes,
    buyInFallback,
    splitPotEnabled: false,
    existingEvents,
    ledger: settlementLedger,
  });
}

export interface ProcessSoleSurvivorEndInput {
  actionId: string;
  winnerId: string;
  carryIn?: number;
  postedAntes?: Record<string, number>;
  scoreById: ScoreById;
  buyInFallback?: number;
  sortedPlayerIds: string[];
  existingEvents?: MoneyEvent[];
  ledger?: MoneyLedgerState;
}

/** Sole survivor — award carry + posted pot via canonical settlement ledger path. */
export function processSoleSurvivorEnd(
  input: ProcessSoleSurvivorEndInput,
): MoneyEngineResult & { potAwarded: number } {
  const {
    actionId,
    winnerId,
    carryIn = 0,
    postedAntes = {},
    scoreById,
    buyInFallback = 100,
    sortedPlayerIds,
    existingEvents = [],
    ledger = ledgerFromScoreById(scoreById, {
      buyInFallback,
      carryOverPot: carryIn,
      postedAntes,
    }),
  } = input;

  const carry = Math.max(0, Number(carryIn) || 0);
  const postedTotal = Object.values(postedAntes).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );
  const potAwarded = carry + postedTotal;

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
      potAwarded,
    };
  }

  const beforeTotal = ledgerChipTotal(ledger);
  let seq = nextSequence(ledger, existingEvents);
  const newEvents: MoneyEvent[] = [];

  if (potAwarded > 0) {
    newEvents.push({
      eventId: makeEventId(actionId, "WINNER_CREDITED", winnerId),
      actionId,
      handId: null,
      phase: "session_finalize",
      sequence: seq++,
      type: "WINNER_CREDITED",
      playerId: winnerId,
      amount: potAwarded,
      metadata: { reason: "sole_survivor" },
      timestamp: Date.now(),
    });
  }

  newEvents.push({
    eventId: makeEventId(actionId, "CARRY_OVER_SET", null),
    actionId,
    handId: null,
    phase: "session_finalize",
    sequence: seq++,
    type: "CARRY_OVER_SET",
    playerId: null,
    amount: 0,
    metadata: { reason: "sole_survivor" },
    timestamp: Date.now(),
  });

  const replayed = replayEvents([...existingEvents, ...newEvents], ledger);
  const invariants = buildInvariantReport(replayed, beforeTotal);

  return {
    delta: potAwarded > 0 ? { [winnerId]: potAwarded } : {},
    newEvents,
    newBankrolls: replayed.bankrolls,
    carryOverPot: 0,
    postedAntes: {},
    invariants,
    version: MONEY_ENGINE_VERSION,
    potAwarded,
  };
}
