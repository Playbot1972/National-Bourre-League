import { botDrawDiscardIndices, botPlayCardIndex } from "../game/play";
import { isTrump } from "../game/cardUtils";
import { buildPlayValidationState } from "../game/playContext";
import type { PublicHandState } from "../game/types";
import type { Card, Suit } from "../types";

/** Toggle play preselection — click same card to clear, different card to switch. */
export function togglePlayPreselectIndex(
  current: number | null,
  clicked: number,
): number | null {
  return current === clicked ? null : clicked;
}

export interface TapAutoplayPlanInput {
  selectedPlay: number | null;
  tappedIndex: number;
  isMyTurn: boolean;
  isLegal: boolean;
}

export interface TapAutoplayPlan {
  nextSelection: number | null;
  shouldArmAutoplay: boolean;
  shouldCancelAutoplay: boolean;
  isDeselect: boolean;
}

/** Pure tap selection + autoplay arm plan for hero hand play phase. */
export function planTapAutoplay(input: TapAutoplayPlanInput): TapAutoplayPlan {
  const nextSelection = togglePlayPreselectIndex(input.selectedPlay, input.tappedIndex);
  const isDeselect = nextSelection === null && input.selectedPlay === input.tappedIndex;
  const shouldArmAutoplay =
    nextSelection !== null && input.isMyTurn && input.isLegal && !isDeselect;
  const shouldCancelAutoplay = isDeselect || nextSelection !== input.selectedPlay;
  return { nextSelection, shouldArmAutoplay, shouldCancelAutoplay, isDeselect };
}

/** Swipe should submit immediately only when on-turn and legal. */
export function shouldSwipeImmediatePlay(isMyTurn: boolean, isLegal: boolean): boolean {
  return isMyTurn && isLegal;
}

/** True when index is in the server-derived legal play set (Pagat Bourré rules). */
export function isLegalPlayIndex(index: number, legalPlayIndices?: number[]): boolean {
  if (!legalPlayIndices) return true;
  return legalPlayIndices.includes(index);
}

/** Table/session snapshot — compatible with Firestore string card fields. */
export type RecommendationPublicHand = {
  trumpSuit: Suit;
  currentTrick: {
    trickNumber: number;
    leadPlayerId: string;
    leadSuit: string | null;
    plays: Array<{ playerId: string; card: { rank: string; suit: string } }>;
  } | null;
  leadSuit: Suit | null;
  cinchEnabled?: boolean;
};

/**
 * Best-play hint from existing bot/heuristic logic — same engine as botPlayCardIndex.
 * Returns null when legality is unknown or no legal plays exist.
 */
export function computeRecommendedPlayIndex(
  hand: Card[],
  publicHand: RecommendationPublicHand,
  legalPlayIndices?: number[] | null,
): number | null {
  if (!legalPlayIndices?.length || !hand.length) return null;
  const ctx = buildPlayValidationState({
    hand,
    publicHand: publicHand as Pick<
      PublicHandState,
      "trumpSuit" | "currentTrick" | "leadSuit" | "cinchEnabled"
    >,
  });
  const idx = botPlayCardIndex(hand, ctx);
  if (legalPlayIndices.includes(idx)) return idx;
  return legalPlayIndices[0] ?? null;
}

/**
 * Discard assist from existing bot/heuristic logic — same engine as botDrawDiscardIndices.
 * Maps recommendations back to the caller's hand indices; skips excluded (non-discardable) slots.
 */
export function computeRecommendedDiscardIndices(
  hand: Card[],
  trumpSuit: Suit,
  maxDiscards: number,
  deckReplacementsAvailable: number = Number.POSITIVE_INFINITY,
  excludedIndices: number[] = [],
): number[] {
  if (!hand.length || maxDiscards <= 0) return [];
  const excluded = new Set(excludedIndices);
  const eligibleOriginalIndices = hand
    .map((_, index) => index)
    .filter((index) => !excluded.has(index))
    .filter((index) => !isTrump(hand[index]!, trumpSuit))
    .filter((index) => hand[index]!.rank !== "A");
  if (!eligibleOriginalIndices.length) return [];

  const eligibleHand = eligibleOriginalIndices.map((index) => hand[index]!);
  const localIndices = botDrawDiscardIndices(
    eligibleHand,
    trumpSuit,
    maxDiscards,
    deckReplacementsAvailable,
  );
  return localIndices.map((localIndex) => eligibleOriginalIndices[localIndex]!);
}

export interface DrawDiscardSelectionInput {
  selectedDraw: ReadonlySet<number>;
  drawSelectionTouched: boolean;
  bestPlayEnabled: boolean;
  recommendedDiscardIndices: number[];
}

/** Indices submitted on Draw — uses selectedDraw (including Best Play preselection). */
export function effectiveDrawDiscardIndices(input: DrawDiscardSelectionInput): number[] {
  const manual = [...input.selectedDraw].sort((a, b) => a - b);
  if (input.drawSelectionTouched || manual.length > 0) return manual;
  if (input.bestPlayEnabled) {
    return [...input.recommendedDiscardIndices].sort((a, b) => a - b);
  }
  return [];
}
