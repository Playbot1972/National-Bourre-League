/** Resolve the dealer seat shown for the current table view. */

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
