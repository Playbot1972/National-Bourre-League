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

/** Single gate for seat emphasis, ring, hero isMyTurn, and micro turn handoff. */
export function computeVisualSuppressTurn(input: VisualTurnGateInput): boolean {
  return (
    input.trickSuppressTurn ||
    input.handSuppressTurn ||
    input.trickPipelineActive ||
    isTrickPlayRevealCatchUp(input)
  );
}
