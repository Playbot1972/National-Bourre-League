import type { TrickPresentationPhase } from "./trickTiming";

export interface VisualTurnGateInput {
  trickSuppressTurn: boolean;
  handSuppressTurn: boolean;
  trickPipelineActive: boolean;
  trickPhase: TrickPresentationPhase;
  revealedCount: number;
  revealTarget: number;
}

/** Live trick still revealing cards — server turn may have advanced. */
export function isTrickPlayRevealCatchUp(
  input: Pick<VisualTurnGateInput, "trickPhase" | "revealedCount" | "revealTarget">,
): boolean {
  return input.trickPhase === "live" && input.revealedCount < input.revealTarget;
}

/**
 * Ring-only suppress — hand deal/trump/draw presentation is visual; server turn stays live.
 * Seat emphasis / hero cues still use computeVisualSuppressTurn.
 */
export function computeRingSuppressTurn(
  input: Pick<VisualTurnGateInput, "trickSuppressTurn" | "trickPipelineActive">,
): boolean {
  return input.trickSuppressTurn || input.trickPipelineActive;
}

/**
 * Single gate for seat emphasis, ring, hero isMyTurn, and micro turn handoff.
 * Reveal catch-up is excluded — server turn may advance before staggered cards land,
 * but hiding the ring for the whole catch-up window made bot timers invisible.
 * Trick resolution still suppresses via trickSuppressTurn + trickPipelineActive.
 */
export function computeVisualSuppressTurn(input: VisualTurnGateInput): boolean {
  return (
    input.trickSuppressTurn ||
    input.handSuppressTurn ||
    input.trickPipelineActive
  );
}
