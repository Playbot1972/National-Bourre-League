import { resolveActionOrder } from "./playerOrder";

/** Public hand fields that define the canonical in-hand participant set. */
export interface CanonicalHandShape {
  participantIds?: string[];
  drawCompletedIds?: string[];
  actionOrder?: string[];
  dealerId?: string | null;
  seatedIds?: string[];
}

/** Active players still in the deal — single source for draw/play eligibility. */
export function handEligibleParticipantIds(
  hand: Pick<CanonicalHandShape, "participantIds">,
): readonly string[] {
  return hand.participantIds ?? [];
}

export function drawTotalEligible(hand: Pick<CanonicalHandShape, "participantIds">): number {
  return handEligibleParticipantIds(hand).length;
}

/**
 * Draw completions among still-eligible participants only.
 * Folded/removed seats may remain in drawCompletedIds for server history.
 */
export function drawCompletedAmongEligible(
  hand: Pick<CanonicalHandShape, "participantIds" | "drawCompletedIds">,
): number {
  const eligible = new Set(handEligibleParticipantIds(hand));
  return (hand.drawCompletedIds ?? []).filter((id) => eligible.has(id)).length;
}

/** drawCompletedIds entries for players no longer in participantIds. */
export function staleDrawCompletedIds(
  hand: Pick<CanonicalHandShape, "participantIds" | "drawCompletedIds">,
): string[] {
  const eligible = new Set(handEligibleParticipantIds(hand));
  return (hand.drawCompletedIds ?? []).filter((id) => !eligible.has(id));
}

export function allEligibleDrawsComplete(
  hand: Pick<CanonicalHandShape, "participantIds" | "drawCompletedIds">,
): boolean {
  const done = new Set(hand.drawCompletedIds ?? []);
  return handEligibleParticipantIds(hand).every((id) => done.has(id));
}

export function canonicalHandDrawMetrics(hand: CanonicalHandShape): {
  eligibleIds: readonly string[];
  drawCompleted: number;
  drawTotal: number;
  actionOrder: string[];
} {
  const eligibleIds = handEligibleParticipantIds(hand);
  return {
    eligibleIds,
    drawCompleted: drawCompletedAmongEligible(hand),
    drawTotal: eligibleIds.length,
    actionOrder: resolveActionOrder({
      participantIds: [...eligibleIds],
      actionOrder: hand.actionOrder,
      dealerId: hand.dealerId,
      seatedIds: hand.seatedIds,
    }),
  };
}
