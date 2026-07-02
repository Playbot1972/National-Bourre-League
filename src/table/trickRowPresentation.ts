import type { TrickPresentationPhase } from "./trickTiming";

export interface TrickRowPresentationClasses {
  isHold: boolean;
  isRake: boolean;
  isEcho: boolean;
}

/** Hold/rake/echo classes for TrickRow — must stay aligned with trick FSM phases. */
export function resolveTrickRowPresentationClasses(
  presentationPhase: TrickPresentationPhase,
  variant: "live" | "echo" = "live",
): TrickRowPresentationClasses {
  return {
    isHold:
      presentationPhase === "trickComplete" || presentationPhase === "winnerReveal",
    isRake: presentationPhase === "collectTrick",
    isEcho: variant === "echo",
  };
}
