import type { ScoreById } from "./types";
import { sessionChipTotal } from "./core";

export interface ChipConservationContext {
  carryOverPot?: number;
  postedAntes?: Record<string, number>;
  /** Post-funding active pot (carry-in + posted antes). */
  nextHandPot?: number;
  buyInFallback?: number;
}

/** Bankrolls plus active table pot (carry + posted antes). */
export interface TableChipSnapshot {
  bankrolls: Record<string, number>;
  carryOverPot?: number;
  postedAntes?: Record<string, number>;
  nextHandPot?: number;
}

export interface MoneyInvariantResult {
  ok: boolean;
  errors: string[];
}

export function tableChipTotal(snapshot: TableChipSnapshot): number {
  const bankrollSum = Object.values(snapshot.bankrolls || {}).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0,
  );
  const resolvedNextHandPot = Number(snapshot.nextHandPot);
  if (Number.isFinite(resolvedNextHandPot) && resolvedNextHandPot >= 0) {
    return bankrollSum + resolvedNextHandPot;
  }
  const carry = Math.max(0, Number(snapshot.carryOverPot) || 0);
  const antePot = Object.values(snapshot.postedAntes || {}).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0,
  );
  return bankrollSum + carry + antePot;
}

export interface ValidateChipGrowthInput {
  before: TableChipSnapshot;
  after: TableChipSnapshot;
  /** Explicit rebuy minted into bankrolls between snapshots. */
  rebuyContributionByPlayer?: Record<string, number>;
  /** Posted pot funding attributed to bourré penalties (actual collected, not nominal). */
  bourrePenaltyToPotByPlayer?: Record<string, number>;
  participantIds?: string[];
  label?: string;
  tolerance?: number;
}

/**
 * Total chips (bankrolls + active pot) may only increase via bourré penalties
 * added to the next pot and explicit rebuy contributions.
 */
export function validateChipGrowthInvariant(
  input: ValidateChipGrowthInput,
): MoneyInvariantResult {
  const tolerance = input.tolerance ?? 0.001;
  const errors: string[] = [];
  const beforeTotal = tableChipTotal(input.before);
  const afterTotal = tableChipTotal(input.after);
  const growth = afterTotal - beforeTotal;

  const rebuySum = Object.values(input.rebuyContributionByPlayer ?? {}).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0,
  );

  const bourreToPot = Object.values(input.bourrePenaltyToPotByPlayer ?? {}).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0,
  );

  if (growth <= tolerance) {
    return { ok: true, errors };
  }

  const allowedGrowth = rebuySum + bourreToPot;
  if (Math.abs(growth - allowedGrowth) > tolerance) {
    const prefix = input.label ? `${input.label}: ` : "";
    errors.push(
      `${prefix}chip total grew by ${growth} (allowed ${allowedGrowth} = rebuy ${rebuySum} + bourré-to-pot ${bourreToPot})`,
    );
  }

  return { ok: errors.length === 0, errors };
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
