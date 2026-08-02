/**
 * Session-level ledger helpers — baseline tracking and production snapshot assembly.
 */
import type { MoneyEvent, ScoreById } from "./types";
import { bourrePotMintByPlayer, type FundingReason } from "./canonical";
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
