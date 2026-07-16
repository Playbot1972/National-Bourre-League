export type TrickSlotFlyMode = "pending" | "travel" | "settle" | "land" | "static";

/** Hide trick card until fly travel begins (all seats, including hero). */
export function trickSlotAwaitingFly(input: {
  isLivePhase: boolean;
  hasLanded: boolean;
  flyMode: TrickSlotFlyMode;
}): boolean {
  return input.isLivePhase && !input.hasLanded && input.flyMode !== "travel";
}

/** Hero handoff highlight only during visible travel — not while priming vars. */
export function trickSlotHeroHandoffClass(input: {
  isLocalHeroPlay: boolean;
  flyMode: TrickSlotFlyMode;
}): boolean {
  return input.isLocalHeroPlay && input.flyMode === "travel";
}
