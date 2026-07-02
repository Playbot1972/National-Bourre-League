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
