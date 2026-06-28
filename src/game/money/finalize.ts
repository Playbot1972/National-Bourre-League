import type {
  FinalBankrollResult,
  MoneyEvent,
  MoneyLedgerState,
  ScoreById,
} from "./types";
import { MONEY_ENGINE_VERSION } from "./types";
import { sessionChipTotal, scoreBankroll } from "./core";
import { ledgerChipTotal, ledgerFromScoreById, replayEvents } from "./replay";
import { explainMoneyEvents } from "./explain";

export interface ComputeFinalBankrollsInput {
  events: MoneyEvent[];
  initialLedger?: MoneyLedgerState;
  /** Current persisted score rows for drift detection. */
  scoreById?: ScoreById;
  buyInFallback?: number;
  carryOverPot?: number;
  postedAntes?: Record<string, number>;
  playerCount?: number;
}

/**
 * Canonical end-of-game bankroll finalization — replay events only.
 * Validates against persisted score rows when provided.
 */
export function computeFinalBankrolls(
  input: ComputeFinalBankrollsInput,
): FinalBankrollResult {
  const buyInFallback = input.buyInFallback ?? 100;
  const initial =
    input.initialLedger ??
    ledgerFromScoreById(input.scoreById ?? {}, {
      buyInFallback,
      carryOverPot: input.carryOverPot ?? 0,
      postedAntes: input.postedAntes ?? {},
    });

  const replayed = replayEvents(input.events, initial);
  const chipTotal = ledgerChipTotal(replayed);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (input.scoreById) {
    for (const [pid, row] of Object.entries(input.scoreById)) {
      const stored = scoreBankroll(row, buyInFallback);
      const fromReplay = replayed.bankrolls[pid];
      if (fromReplay != null && stored !== fromReplay) {
        errors.push(
          `bankroll drift for ${pid}: stored=${stored}, replay=${fromReplay}`,
        );
      }
    }
  }

  const expectedFromSession =
    input.playerCount != null
      ? input.playerCount * buyInFallback
      : input.scoreById
        ? sessionChipTotal(input.scoreById, {
            carryOverPot: input.carryOverPot ?? 0,
            postedAntes: input.postedAntes ?? {},
            buyInFallback,
          })
        : undefined;

  if (expectedFromSession != null && chipTotal !== expectedFromSession) {
    warnings.push(
      `chip total ${chipTotal} differs from session snapshot ${expectedFromSession} (may include rebuys)`,
    );
  }

  const explanation = explainMoneyEvents(input.events, buyInFallback);

  return {
    bankrolls: replayed.bankrolls,
    nets: replayed.nets,
    carryOverPot: replayed.carryOverPot,
    chipTotal,
    invariants: {
      ok: errors.length === 0,
      chipTotal,
      expectedChipTotal: expectedFromSession,
      errors,
      warnings,
    },
    explanation,
  };
}

/** True when session should use v1 money engine. */
export function isMoneyEngineV1(sessionData: { moneyEngineVersion?: string } | null | undefined): boolean {
  return sessionData?.moneyEngineVersion === MONEY_ENGINE_VERSION;
}

/** Block mixed old/new mutation on legacy sessions. */
export function assertMoneyEngineCompatible(
  sessionData: { moneyEngineVersion?: string; status?: string } | null | undefined,
  operation: string,
): void {
  if (!sessionData) throw new Error("Session not found");
  if (sessionData.status === "final") throw new Error("Session is final");
  if (sessionData.moneyEngineVersion && sessionData.moneyEngineVersion !== MONEY_ENGINE_VERSION) {
    throw new Error(
      `Session uses money engine ${sessionData.moneyEngineVersion}; cannot ${operation} with ${MONEY_ENGINE_VERSION}`,
    );
  }
}

export function validateReplayMatchesDerived(
  events: MoneyEvent[],
  scoreById: ScoreById,
  opts: {
    buyInFallback?: number;
    carryOverPot?: number;
    postedAntes?: Record<string, number>;
  } = {},
): { ok: boolean; mismatches: string[] } {
  const buyIn = opts.buyInFallback ?? 100;
  const final = computeFinalBankrolls({
    events,
    scoreById,
    buyInFallback: buyIn,
    carryOverPot: opts.carryOverPot,
    postedAntes: opts.postedAntes,
  });
  return { ok: final.invariants.ok, mismatches: final.invariants.errors };
}
