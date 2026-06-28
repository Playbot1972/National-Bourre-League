import type {
  MoneyEvent,
  MoneyLedgerState,
  MoneyPhase,
  ScoreById,
} from "./types";
import { MONEY_ENGINE_VERSION } from "./types";
import { dedupeEventsById } from "./idempotency";
import { scoreBankroll } from "./core";

const PHASE_ORDER: Record<MoneyPhase, number> = {
  session_start: 0,
  ante_collect: 1,
  hand_settlement: 2,
  rebuy: 3,
  next_deal: 4,
  session_finalize: 5,
};

function handIdSortKey(handId: string | null): string {
  if (handId == null) return "00000000";
  const n = Number(handId);
  if (Number.isFinite(n)) return String(n).padStart(8, "0");
  return handId;
}

/** Deterministic ordering: handId → phase → sequence (never timestamps). */
export function sortMoneyEvents(events: MoneyEvent[]): MoneyEvent[] {
  return [...events].sort((a, b) => {
    const ha = handIdSortKey(a.handId);
    const hb = handIdSortKey(b.handId);
    if (ha !== hb) return ha.localeCompare(hb);
    const pa = PHASE_ORDER[a.phase] ?? 99;
    const pb = PHASE_ORDER[b.phase] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.sequence - b.sequence;
  });
}

export function emptyLedgerState(buyInFallback = 100): MoneyLedgerState {
  return {
    version: MONEY_ENGINE_VERSION,
    buyInFallback,
    bankrolls: {},
    nets: {},
    carryOverPot: 0,
    postedAntes: {},
    scoreFlags: {},
    sequence: 0,
  };
}

export function ledgerFromScoreById(
  scoreById: ScoreById,
  opts: {
    buyInFallback?: number;
    carryOverPot?: number;
    postedAntes?: Record<string, number>;
  } = {},
): MoneyLedgerState {
  const buyInFallback = opts.buyInFallback ?? 100;
  const bankrolls: Record<string, number> = {};
  const nets: Record<string, number> = {};
  const scoreFlags: MoneyLedgerState["scoreFlags"] = {};

  for (const [pid, row] of Object.entries(scoreById || {})) {
    bankrolls[pid] = scoreBankroll(row, buyInFallback);
    nets[pid] = Number(row?.net) || 0;
    scoreFlags[pid] = {
      skipNextAnte: row?.skipNextAnte === true,
      bourreReplacementDue: row?.bourreReplacementDue,
      out: row?.out === true,
      perHandStake: row?.perHandStake,
    };
  }

  return {
    version: MONEY_ENGINE_VERSION,
    buyInFallback,
    bankrolls,
    nets,
    carryOverPot: Math.max(0, Number(opts.carryOverPot) || 0),
    postedAntes: { ...(opts.postedAntes || {}) },
    scoreFlags,
    sequence: 0,
  };
}

function applySingleEvent(state: MoneyLedgerState, event: MoneyEvent): MoneyLedgerState {
  const next: MoneyLedgerState = {
    ...state,
    bankrolls: { ...state.bankrolls },
    nets: { ...state.nets },
    postedAntes: { ...state.postedAntes },
    scoreFlags: { ...state.scoreFlags },
    sequence: Math.max(state.sequence, event.sequence),
  };

  const pid = event.playerId;
  const amt = Number(event.amount) || 0;

  switch (event.type) {
    case "BUY_IN_APPLIED":
      if (pid) {
        next.bankrolls[pid] = amt;
        next.nets[pid] = 0;
        next.scoreFlags[pid] = { ...next.scoreFlags[pid], out: false };
      }
      break;
    case "ANTE_DEDUCTED":
      if (pid) {
        const br = next.bankrolls[pid] ?? 0;
        next.bankrolls[pid] = Math.max(0, br - amt);
        next.postedAntes[pid] = (next.postedAntes[pid] ?? 0) + amt;
      }
      break;
    case "POT_FUNDED":
      next.carryOverPot = Math.max(0, next.carryOverPot + amt);
      break;
    case "SETTLEMENT_DEBIT":
    case "BOURRE_LIABILITY":
      if (pid) {
        const br = next.bankrolls[pid] ?? 0;
        next.bankrolls[pid] = Math.max(0, br - amt);
        next.nets[pid] = (next.nets[pid] ?? 0) - amt;
        if (next.bankrolls[pid] <= 0) {
          next.scoreFlags[pid] = { ...next.scoreFlags[pid], out: true };
        }
      }
      break;
    case "WINNER_CREDITED":
    case "SPLIT_POT_APPLIED":
    case "REBUY_APPLIED":
      if (pid) {
        const br = next.bankrolls[pid] ?? 0;
        next.bankrolls[pid] = br + amt;
        if (event.type === "REBUY_APPLIED") {
          next.nets[pid] = 0;
          next.scoreFlags[pid] = { ...next.scoreFlags[pid], out: false };
        } else {
          next.nets[pid] = (next.nets[pid] ?? 0) + amt;
        }
      }
      break;
    case "CARRY_OVER_SET":
      next.carryOverPot = Math.max(0, amt);
      next.postedAntes = {};
      break;
    case "NEXT_DEAL_FUNDING":
      if (pid) {
        const meta = event.metadata || {};
        next.scoreFlags[pid] = {
          ...next.scoreFlags[pid],
          skipNextAnte: meta.skipNextAnte === true,
          bourreReplacementDue:
            meta.bourreReplacementDue != null
              ? Number(meta.bourreReplacementDue)
              : undefined,
        };
      }
      break;
    case "ADJUSTMENT_RECONCILIATION":
      if (pid && event.metadata?.bankroll != null) {
        next.bankrolls[pid] = Math.max(0, Number(event.metadata.bankroll));
      }
      if (event.metadata?.carryOverPot != null) {
        next.carryOverPot = Math.max(0, Number(event.metadata.carryOverPot));
      }
      break;
    default:
      break;
  }

  return next;
}

/**
 * Replay money events into ledger state. Idempotent on eventId duplicates.
 * Ordering uses handId / phase / sequence only.
 */
export function replayEvents(
  events: MoneyEvent[],
  initialState: MoneyLedgerState,
): MoneyLedgerState {
  const sorted = sortMoneyEvents(dedupeEventsById(events));
  return sorted.reduce(applySingleEvent, initialState);
}

export function ledgerChipTotal(state: MoneyLedgerState): number {
  const bankrollSum = Object.values(state.bankrolls).reduce((s, n) => s + n, 0);
  const antePot = Object.values(state.postedAntes).reduce(
    (s, n) => s + Math.max(0, Number(n) || 0),
    0,
  );
  return bankrollSum + state.carryOverPot + antePot;
}
