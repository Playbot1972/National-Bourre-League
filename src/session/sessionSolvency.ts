import type { ScoreById, ScoreRow } from "../game/money/types";

function scoreBankroll(score: ScoreRow | undefined, buyInFallback = 0): number {
  if (score?.bankroll != null && Number.isFinite(Number(score.bankroll))) {
    return Math.max(0, Number(score.bankroll));
  }
  const buyIn = Math.max(0, Number(buyInFallback) || 0);
  const net = Number(score?.net) || 0;
  return buyIn > 0 ? Math.max(0, buyIn + net) : Math.max(0, net);
}

function deriveScoreNet(bankroll: number, buyInFallback = 0): number {
  const buyIn = Math.max(0, Number(buyInFallback) || 0);
  const br = Math.max(0, Number(bankroll) || 0);
  return br - buyIn;
}

function eligibleIdsForAnteCollection(
  participantIds: string[],
  scoreById: ScoreById,
  buyInFallback = 0,
): string[] {
  return (participantIds || []).filter((pid) => {
    const row = scoreById?.[pid];
    if (row?.out === true) return false;
    return scoreBankroll(row, buyInFallback) > 0;
  });
}

/** Bankroll-positive, non-out seats (same gate as next-hand ante collection). */
export function eligiblePlayerIdsForNextHand(
  sortedPlayerIds: string[],
  scoreById: ScoreById,
  buyInFallback = 0,
): string[] {
  return eligibleIdsForAnteCollection(sortedPlayerIds, scoreById, buyInFallback);
}

/** Bankroll-positive, non-out seats that may fund a contested next hand. */
export function countEligibleForNextHand(
  participantIds: string[],
  scoreById: ScoreById,
  buyInFallback = 0,
): number {
  return eligiblePlayerIdsForNextHand(participantIds, scoreById, buyInFallback).length;
}

/** True when a normal next-hand enrollment/deal may proceed. */
export function shouldOpenNextHandEnrollment(eligibleCount: number): boolean {
  return eligibleCount >= 2;
}

/** True when only one solvent player remains — session should end. */
export function shouldFinalizeForSoleSurvivor(eligibleCount: number): boolean {
  return eligibleCount === 1;
}

export interface SoleSurvivorEndInput {
  winnerId: string;
  carryIn?: number;
  postedAntes?: Record<string, number>;
  scoreById: ScoreById;
  buyInFallback?: number;
  sortedPlayerIds: string[];
}

export interface SoleSurvivorEndResult {
  winnerId: string;
  potAwarded: number;
  scorePatches: Record<string, { bankroll: number; net: number; handsWon?: number }>;
}

/**
 * Award remaining carry / already-posted pot to the sole survivor without
 * collecting a new contested-hand ante. Does not bump handCount.
 */
export function buildSoleSurvivorSessionEnd(input: SoleSurvivorEndInput): SoleSurvivorEndResult {
  const {
    winnerId,
    carryIn = 0,
    postedAntes = {},
    scoreById,
    buyInFallback = 0,
    sortedPlayerIds,
  } = input;

  const carry = Math.max(0, Number(carryIn) || 0);
  const postedTotal = Object.values(postedAntes).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );
  const potAwarded = carry + postedTotal;

  const scorePatches: SoleSurvivorEndResult["scorePatches"] = {};
  for (const pid of sortedPlayerIds) {
    const base = scoreBankroll(scoreById[pid], buyInFallback);
    const bankroll = pid === winnerId ? base + potAwarded : base;
    const patch: { bankroll: number; net: number; handsWon?: number } = {
      bankroll,
      net: deriveScoreNet(bankroll, buyInFallback),
    };
    if (pid === winnerId && potAwarded > 0) {
      patch.handsWon = (scoreById[pid]?.handsWon ?? 0) + 1;
    }
    scorePatches[pid] = patch;
  }

  return { winnerId, potAwarded, scorePatches };
}
