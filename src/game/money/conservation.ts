import type { ScoreById } from "./types";
import { sessionChipTotal } from "./core";

export interface ChipConservationContext {
  carryOverPot?: number;
  postedAntes?: Record<string, number>;
  buyInFallback?: number;
}

/**
 * Assert session chips are conserved. Throws if expectedTotal is provided and mismatches.
 */
export function assertChipConservation(
  scoreById: ScoreById,
  context: ChipConservationContext & { expectedTotal?: number; label?: string } = {},
): number {
  const total = sessionChipTotal(scoreById, context);
  if (context.expectedTotal != null && total !== context.expectedTotal) {
    const label = context.label ? `${context.label}: ` : "";
    throw new Error(
      `${label}chip conservation failed — total ${total}, expected ${context.expectedTotal}`,
    );
  }
  return total;
}

/** Non-throwing check for tests and diagnostics. */
export function isChipConserved(
  scoreById: ScoreById,
  context: ChipConservationContext & { expectedTotal: number },
): boolean {
  return sessionChipTotal(scoreById, context) === context.expectedTotal;
}
