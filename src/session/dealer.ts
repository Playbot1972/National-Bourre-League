/** Resolve the dealer seat shown for the current table view. */

import type { ScoreById } from "../game/money/types";
import {
  countEligibleForNextHand,
  eligiblePlayerIdsForNextHand,
} from "./sessionSolvency";

export interface HandDealerView {
  dealerId?: string | null;
  phase?: string | null;
  participantIds?: string[];
}

const LIVE_HAND_PHASES = new Set(["reveal", "decision", "draw", "play"]);

export function isLiveHandPhase(phase: string | null | undefined): boolean {
  return LIVE_HAND_PHASES.has(phase ?? "");
}

/**
 * Prefer explicit per-hand dealer while a hand is live; otherwise use session dealer
 * (rotated between hands at settlement).
 */
export function resolveHandDealerId(
  sessionDealerId: string | null | undefined,
  currentHand: HandDealerView | null | undefined,
): string | null {
  if (currentHand?.dealerId && isLiveHandPhase(currentHand.phase)) {
    return currentHand.dealerId;
  }
  return sessionDealerId ?? currentHand?.dealerId ?? null;
}

/**
 * Dealer badge target: bankroll-positive, non-out seat only.
 * When the stored dealer is broke/out, advance clockwise to the next eligible seat.
 * Returns null when fewer than two eligible players remain (sole survivor / endgame).
 */
export function resolveDisplayDealerId(
  dealerId: string | null | undefined,
  sortedPlayerIds: string[],
  scoreById: ScoreById,
  buyInFallback = 0,
): string | null {
  if (!sortedPlayerIds.length) return null;
  if (countEligibleForNextHand(sortedPlayerIds, scoreById, buyInFallback) < 2) {
    return null;
  }

  const eligible = new Set(
    eligiblePlayerIdsForNextHand(sortedPlayerIds, scoreById, buyInFallback),
  );
  if (!dealerId) {
    return sortedPlayerIds.find((pid) => eligible.has(pid)) ?? null;
  }

  const idx = sortedPlayerIds.indexOf(dealerId);
  const ring =
    idx >= 0
      ? [...sortedPlayerIds.slice(idx), ...sortedPlayerIds.slice(0, idx)]
      : [...sortedPlayerIds];

  for (const pid of ring) {
    if (eligible.has(pid)) return pid;
  }

  return null;
}
