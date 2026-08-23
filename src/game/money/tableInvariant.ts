/**
 * Production-safe table chip invariant — bankrolls + pot + carry conservation.
 *
 * Hard invariant:
 *   sum(bankrolls) + sum(postedAntes) + carryOverPot
 *     == tableStartingTotal + netCashIn + netBourreMint − netCashOut
 */
import type { MoneyEvent, ScoreById } from "./types";
import { scoreBankroll } from "./core";
import { tableChipTotal, type TableChipSnapshot } from "./conservation";
import { dedupeEventsById } from "./idempotency";

export const OPEN_RULE_CASH_OUT =
  "No cash-out API exists in production — netCashOut is always 0; elimination sets out:true only.";

export const OPEN_RULE_BOURRE_MINT =
  "When bourré penalty exceeds available bankroll, the engine mints chips into the next pot; tracked via netBourreMint.";

export interface TableLedgerBaseline {
  tableStartingTotal: number;
  netCashIn: number;
  netCashOut: number;
  netBourreMint: number;
}

export interface TableInvariantContext {
  tableId?: string;
  roomId?: string;
  sessionId?: string;
  handId?: string | number | null;
  label: string;
}

export interface TableInvariantResult {
  ok: boolean;
  actual: number;
  expected: number;
  bankrollSum: number;
  potSum: number;
  carryPot: number;
  errors: string[];
  snapshot: TableChipSnapshot;
  baseline: TableLedgerBaseline;
}

export function emptyLedgerBaseline(): TableLedgerBaseline {
  return {
    tableStartingTotal: 0,
    netCashIn: 0,
    netCashOut: 0,
    netBourreMint: 0,
  };
}

export function expectedChipTotalFromBaseline(baseline: TableLedgerBaseline): number {
  return (
    Math.max(0, baseline.tableStartingTotal) +
    Math.max(0, baseline.netCashIn) +
    Math.max(0, baseline.netBourreMint) -
    Math.max(0, baseline.netCashOut)
  );
}

export function ledgerPostedPotSum(postedAntes: Record<string, number> = {}): number {
  return Object.values(postedAntes).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );
}

/** Carry input for ante/settlement when pending posted antes must not be dropped. */
export function computeCarryForAnte(
  carryOverPot: number,
  postedAntes?: Record<string, number> | null,
): number {
  return Math.max(0, Number(carryOverPot) || 0) + ledgerPostedPotSum(postedAntes ?? {});
}

export function ledgerBankrollSum(bankrolls: Record<string, number>): number {
  return Object.values(bankrolls).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );
}

export function buildTableChipSnapshot(
  scoreById: ScoreById,
  opts: {
    carryOverPot?: number;
    postedAntes?: Record<string, number>;
    buyInFallback?: number;
    playerIds?: string[];
  } = {},
): TableChipSnapshot {
  const buyInFallback = opts.buyInFallback ?? 100;
  const ids =
    opts.playerIds ??
    Object.keys(scoreById || {}).filter((pid) => scoreById[pid] != null);
  const bankrolls: Record<string, number> = {};
  for (const pid of ids) {
    bankrolls[pid] = scoreBankroll(scoreById[pid], buyInFallback);
  }
  return {
    bankrolls,
    carryOverPot: Math.max(0, Number(opts.carryOverPot) || 0),
    postedAntes: { ...(opts.postedAntes ?? {}) },
  };
}

export function computeLedgerBaselineFromEvents(
  events: MoneyEvent[],
): TableLedgerBaseline {
  const baseline = emptyLedgerBaseline();
  for (const event of dedupeEventsById(events)) {
    const amount = Math.max(0, Number(event.amount) || 0);
    switch (event.type) {
      case "BUY_IN_APPLIED":
        baseline.tableStartingTotal += amount;
        break;
      case "REBUY_APPLIED":
        baseline.netCashIn += amount;
        break;
      case "CASH_OUT_APPLIED":
        baseline.netCashOut += amount;
        break;
      default:
        break;
    }
    const mint = Number(event.metadata?.bourrePotMint);
    if (Number.isFinite(mint) && mint > 0) {
      baseline.netBourreMint += mint;
    }
  }
  return baseline;
}

export function mergeLedgerBaseline(
  base: TableLedgerBaseline,
  delta: Partial<TableLedgerBaseline>,
): TableLedgerBaseline {
  return {
    tableStartingTotal: base.tableStartingTotal + (delta.tableStartingTotal ?? 0),
    netCashIn: base.netCashIn + (delta.netCashIn ?? 0),
    netCashOut: base.netCashOut + (delta.netCashOut ?? 0),
    netBourreMint: base.netBourreMint + (delta.netBourreMint ?? 0),
  };
}

export function checkTableChipInvariant(
  snapshot: TableChipSnapshot,
  baseline: TableLedgerBaseline,
  tolerance = 0.001,
): TableInvariantResult {
  const bankrollSum = ledgerBankrollSum(snapshot.bankrolls);
  const potSum = ledgerPostedPotSum(snapshot.postedAntes);
  const carryPot = Math.max(0, Number(snapshot.carryOverPot) || 0);
  const actual = bankrollSum + potSum + carryPot;
  const expected = expectedChipTotalFromBaseline(baseline);
  const errors: string[] = [];

  if (Math.abs(actual - expected) > tolerance) {
    errors.push(
      `invariant failed: actual=${actual} expected=${expected} ` +
        `(bankrolls=${bankrollSum} posted=${potSum} carry=${carryPot})`,
    );
  }

  for (const [pid, br] of Object.entries(snapshot.bankrolls)) {
    if (br < -tolerance) {
      errors.push(`negative bankroll ${pid}=${br}`);
    }
  }

  return {
    ok: errors.length === 0,
    actual,
    expected,
    bankrollSum,
    potSum,
    carryPot,
    errors,
    snapshot,
    baseline: { ...baseline },
  };
}

function isInvariantStrict(): boolean {
  const g = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  if (g.process?.env?.NBL_INVARIANTS === "1") return true;
  if (g.process?.env?.NODE_ENV === "test") return true;
  if (typeof window !== "undefined") {
    try {
      if (window.localStorage?.getItem("nbl-invariants") === "1") return true;
      return new URLSearchParams(window.location.search).has("invariants");
    } catch {
      return false;
    }
  }
  return false;
}

/** Structured log — always non-throwing in production. */
export function logTableChipInvariant(
  ctx: TableInvariantContext,
  result: TableInvariantResult,
): void {
  const payload = {
    ok: result.ok,
    label: ctx.label,
    tableId: ctx.tableId ?? ctx.roomId ?? null,
    sessionId: ctx.sessionId ?? null,
    handId: ctx.handId ?? null,
    actual: result.actual,
    expected: result.expected,
    bankrollSum: result.bankrollSum,
    potSum: result.potSum,
    carryPot: result.carryPot,
    baseline: result.baseline,
    errors: result.errors,
  };
  if (result.ok) {
    if (typeof console !== "undefined" && console.info) {
      console.info("[nbl-table-invariant]", payload);
    }
    return;
  }
  if (typeof console !== "undefined" && console.error) {
    console.error("[nbl-table-invariant]", payload);
  }
}

/**
 * Production-safe invariant guard — logs on mismatch; throws only in strict mode.
 * Flags table via structured error log (ok:false).
 */
export function assertTableChipInvariant(
  snapshot: TableChipSnapshot,
  baseline: TableLedgerBaseline,
  ctx: TableInvariantContext,
  tolerance = 0.001,
): TableInvariantResult {
  const result = checkTableChipInvariant(snapshot, baseline, tolerance);
  logTableChipInvariant(ctx, result);
  if (!result.ok && isInvariantStrict()) {
    throw new Error(
      `[${ctx.label}] ${result.errors.join("; ")} ` +
        JSON.stringify({
          tableId: ctx.tableId ?? ctx.roomId,
          sessionId: ctx.sessionId,
          handId: ctx.handId,
        }),
    );
  }
  return result;
}

/**
 * Server money authority — always throws on invariant mismatch (Cloud Functions).
 * Clients use assertTableChipInvariant (log-only unless strict dev flags).
 */
export function assertTableChipInvariantFailClosed(
  snapshot: TableChipSnapshot,
  baseline: TableLedgerBaseline,
  ctx: TableInvariantContext,
  tolerance = 0.001,
): TableInvariantResult {
  const result = checkTableChipInvariant(snapshot, baseline, tolerance);
  logTableChipInvariant(ctx, result);
  if (!result.ok) {
    throw new Error(
      `[fail-closed:${ctx.label}] ${result.errors.join("; ")} ` +
        JSON.stringify({
          tableId: ctx.tableId ?? ctx.roomId,
          sessionId: ctx.sessionId,
          handId: ctx.handId,
        }),
    );
  }
  return result;
}

/** Alias for runtime callers that prefer "log" naming. */
export function logTableInvariant(
  snapshot: TableChipSnapshot,
  baseline: TableLedgerBaseline,
  ctx: TableInvariantContext,
): TableInvariantResult {
  return assertTableChipInvariant(snapshot, baseline, ctx);
}
