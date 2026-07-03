import type { CardState } from "./PlayingCard";

export interface HandPlayInteractionInput {
  isPlayMode: boolean;
  isMyTurn: boolean;
  legalPlay: boolean;
  busy: boolean;
  allowPlayPreselect: boolean;
  cardState: CardState;
  playableHintFor?: (index: number) => boolean;
  showPlayableHint?: boolean;
  index: number;
}

export interface HandPlayInteractionResult {
  /** Tap/swipe/hold may fire onPlayCard — independent of visual tier. */
  playInteractive: boolean;
  /** Ambient tier-3 green outline only — must not gate gestures. */
  playableOutline: boolean;
}

/** Split play interaction eligibility from legal-play outline styling. */
export function resolveHandPlayCardInteraction(
  input: HandPlayInteractionInput,
): HandPlayInteractionResult {
  const legalPlayEligible =
    input.isPlayMode && input.isMyTurn && input.legalPlay && !input.busy;
  const preselectable =
    input.isPlayMode &&
    !input.isMyTurn &&
    input.allowPlayPreselect &&
    input.legalPlay &&
    !input.busy;
  const playInteractive = legalPlayEligible || preselectable;
  const reservedOutline =
    input.cardState === "play-preselected" || input.cardState === "play-recommended";
  const playableOutline =
    input.playableHintFor?.(input.index) ??
    (legalPlayEligible &&
      !reservedOutline &&
      input.showPlayableHint !== false);
  return { playInteractive, playableOutline };
}
