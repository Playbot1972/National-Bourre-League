/**
 * Session-level ledger helpers — baseline tracking and production snapshot assembly.
 */
import type { MoneyEvent, MoneyLedgerState, ScoreById } from "./types";
import { deriveScoreNet } from "./core";
import { processRebuy } from "./processor";
import { scoreBankroll } from "./core";
import { bourrePotMintByPlayer, type FundingReason } from "./canonical";
import type { NextDealFundingSnapshot } from "./types";
import { collectFundingForHandStart } from "./pipeline";
import { MONEY_ENGINE_VERSION } from "./types";
import {
  buildTableChipSnapshot,
  computeLedgerBaselineFromEvents,
  emptyLedgerBaseline,
  mergeLedgerBaseline,
  type TableLedgerBaseline,
} from "./tableInvariant";

export interface SessionLedgerBaselineDoc {
  tableStartingTotal?: number;
  netCashIn?: number;
  netCashOut?: number;
  netBourreMint?: number;
}

export function baselineFromSessionDoc(
  doc: SessionLedgerBaselineDoc | null | undefined,
  events: MoneyEvent[] = [],
): TableLedgerBaseline {
  if (doc && doc.tableStartingTotal != null) {
    return {
      tableStartingTotal: Math.max(0, Number(doc.tableStartingTotal) || 0),
      netCashIn: Math.max(0, Number(doc.netCashIn) || 0),
      netCashOut: Math.max(0, Number(doc.netCashOut) || 0),
      netBourreMint: Math.max(0, Number(doc.netBourreMint) || 0),
    };
  }
  return computeLedgerBaselineFromEvents(events);
}

export function baselineDocFromBaseline(baseline: TableLedgerBaseline): SessionLedgerBaselineDoc {
  return { ...baseline };
}

export function initialSessionBaseline(playerCount: number, buyInAmount: number): TableLedgerBaseline {
  return {
    tableStartingTotal: Math.max(0, playerCount) * Math.max(0, buyInAmount),
    netCashIn: 0,
    netCashOut: 0,
    netBourreMint: 0,
  };
}

export function detectBourreMintDelta(
  beforeBankrolls: Record<string, number>,
  afterBankrolls: Record<string, number>,
  fundingReasons: Record<string, FundingReason>,
  postedAntes: Record<string, number> = {},
): number {
  const mintByPlayer = bourrePotMintByPlayer(
    beforeBankrolls,
    afterBankrolls,
    fundingReasons,
    postedAntes,
  );
  return Object.values(mintByPlayer).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
}

export function buildSessionChipSnapshot(
  scoreById: ScoreById,
  sessionData: {
    carryOverPot?: number;
    currentHand?: { postedAntes?: Record<string, number> } | null;
  },
  opts: { buyInFallback?: number; playerIds?: string[] } = {},
): ReturnType<typeof buildTableChipSnapshot> {
  const postedAntes =
    sessionData.currentHand?.postedAntes ??
    ({} as Record<string, number>);
  return buildTableChipSnapshot(scoreById, {
    carryOverPot: sessionData.carryOverPot ?? 0,
    postedAntes,
    buyInFallback: opts.buyInFallback,
    playerIds: opts.playerIds,
  });
}

export function applyRebuyToBaseline(
  baseline: TableLedgerBaseline,
  minted: number,
): TableLedgerBaseline {
  return mergeLedgerBaseline(baseline, { netCashIn: Math.max(0, minted) });
}

export function applyBourreMintToBaseline(
  baseline: TableLedgerBaseline,
  minted: number,
): TableLedgerBaseline {
  return mergeLedgerBaseline(baseline, { netBourreMint: Math.max(0, minted) });
}

export function applyCashOutToBaseline(
  baseline: TableLedgerBaseline,
  amount: number,
): TableLedgerBaseline {
  return mergeLedgerBaseline(baseline, { netCashOut: Math.max(0, amount) });
}

/** Dev-only: compare UI-visible chip totals to ledger snapshot. */
export function compareUiToLedgerSnapshot(
  ui: { bankrolls: Record<string, number>; pot: number; carryPot: number },
  snapshot: ReturnType<typeof buildTableChipSnapshot>,
  tolerance = 0.001,
): boolean {
  const uiBankrollSum = Object.values(ui.bankrolls).reduce(
    (s, n) => s + Math.max(0, Number(n) || 0),
    0,
  );
  const ledgerBankrollSum = Object.values(snapshot.bankrolls).reduce(
    (s, n) => s + Math.max(0, Number(n) || 0),
    0,
  );
  const uiPot = Math.max(0, Number(ui.pot) || 0);
  const ledgerPot =
    Object.values(snapshot.postedAntes ?? {}).reduce(
      (s, n) => s + Math.max(0, Number(n) || 0),
      0,
    ) + Math.max(0, Number(snapshot.carryOverPot) || 0);
  return (
    Math.abs(uiBankrollSum - ledgerBankrollSum) <= tolerance &&
    Math.abs(uiPot - ledgerPot) <= tolerance
  );
}

/** Build money ledger state from session + score rows (preserves carry/posted). */
export function buildLedgerStateFromSession(
  sessionData: {
    carryOverPot?: number;
    currentHand?: { postedAntes?: Record<string, number> } | null;
    moneySequence?: number;
  },
  scoreById: ScoreById,
  buyInFallback = 100,
): MoneyLedgerState {
  const bankrolls: Record<string, number> = {};
  for (const [pid, row] of Object.entries(scoreById || {})) {
    bankrolls[pid] = scoreBankroll(row, buyInFallback);
  }
  return {
    version: MONEY_ENGINE_VERSION,
    buyInFallback,
    bankrolls,
    nets: {},
    carryOverPot: Math.max(0, Number(sessionData.carryOverPot) || 0),
    postedAntes: { ...(sessionData.currentHand?.postedAntes ?? {}) },
    scoreFlags: {},
    sequence: Number(sessionData.moneySequence) || 0,
  };
}

/** Simulate next-hand funding and return bourré bust mint delta (chip creation). */
export function computeNextHandFundingMintDelta(input: {
  scoreById: ScoreById;
  nextDealFunding: NextDealFundingSnapshot | null;
  carryOverPot: number;
  participantIds: string[];
  sessionStake: number;
  buyInFallback: number;
}): number {
  const {
    scoreById,
    nextDealFunding,
    carryOverPot,
    participantIds,
    sessionStake,
    buyInFallback,
  } = input;
  const beforeBankrolls: Record<string, number> = {};
  for (const pid of participantIds) {
    beforeBankrolls[pid] = scoreBankroll(scoreById[pid], buyInFallback);
  }
  const collected = collectFundingForHandStart({
    scoreById,
    nextDealFunding,
    carryOverPot,
    participantIds,
    sessionStake,
    buyInFallback,
  });
  const fundingReasons = Object.fromEntries(
    participantIds.map((pid) => [
      pid,
      (nextDealFunding?.byPlayer?.[pid]?.fundingReason as FundingReason) ?? "normal_ante",
    ]),
  ) as Record<string, FundingReason>;
  return detectBourreMintDelta(
    beforeBankrolls,
    collected.bankrolls,
    fundingReasons,
    collected.postedAntes ?? {},
  );
}

/** Bump session baseline when next-hand funding mints bourré bust chips. */
export function bumpBaselineForNextHandFunding(
  baseline: TableLedgerBaseline,
  input: {
    scoreById: ScoreById;
    nextDealFunding: NextDealFundingSnapshot | null;
    carryOverPot: number;
    participantIds: string[];
    sessionStake: number;
    buyInFallback: number;
  },
): TableLedgerBaseline {
  const mint = computeNextHandFundingMintDelta(input);
  return mint > 0 ? applyBourreMintToBaseline(baseline, mint) : baseline;
}

export interface BotRebuyPlanItem {
  playerId: string;
  displayName?: string;
}

/** Ledger-aware bot auto-rebuy — same path as manual rebuySessionPlayer. */
export function executeBotRebuyPlanLedgerAware(input: {
  plan: BotRebuyPlanItem[];
  sessionId: string;
  handNumber: number;
  buyInAmount: number;
  ledger: MoneyLedgerState;
  baseline: TableLedgerBaseline;
  existingEvents: MoneyEvent[];
}): {
  rebuyEvents: MoneyEvent[];
  scorePatches: Record<string, { bankroll: number; net: number; displayName?: string }>;
  ledger: MoneyLedgerState;
  baseline: TableLedgerBaseline;
} {
  const {
    plan,
    sessionId,
    handNumber,
    buyInAmount,
    ledger: startLedger,
    baseline: startBaseline,
    existingEvents,
  } = input;
  const rebuyEvents: MoneyEvent[] = [];
  const scorePatches: Record<string, { bankroll: number; net: number; displayName?: string }> =
    {};
  let ledger: MoneyLedgerState = {
    ...startLedger,
    bankrolls: { ...startLedger.bankrolls },
    postedAntes: { ...startLedger.postedAntes },
  };
  let baseline = startBaseline;

  for (const item of plan) {
    const rebuy = processRebuy({
      actionId: `rebuy:${sessionId}:${item.playerId}:${handNumber}`,
      playerId: item.playerId,
      buyInAmount,
      handId: String(handNumber),
      existingEvents: [...existingEvents, ...rebuyEvents],
      ledger: { ...ledger },
    });
    rebuyEvents.push(...rebuy.newEvents);
    const bankroll = rebuy.newBankrolls[item.playerId] ?? buyInAmount;
    ledger.bankrolls[item.playerId] = bankroll;
    const minted = rebuy.newEvents[0]?.amount ?? buyInAmount;
    baseline = applyRebuyToBaseline(baseline, minted);
    scorePatches[item.playerId] = {
      bankroll,
      net: deriveScoreNet(bankroll, buyInAmount),
      displayName: item.displayName,
    };
  }

  return { rebuyEvents, scorePatches, ledger, baseline };
}
