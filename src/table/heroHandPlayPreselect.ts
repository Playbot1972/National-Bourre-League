import { botDrawDiscardIndices, botPlayCardIndex } from "../game/play";
import { isTrump } from "../game/cardUtils";
import { buildPlayValidationState } from "../game/playContext";
import type { PublicHandState } from "../game/types";
import type { Card, Suit } from "../types";

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

/** Indices submitted on Draw — manual picks win over Best Play hints. */
export function effectiveDrawDiscardIndices(input: DrawDiscardSelectionInput): number[] {
  const manual = [...input.selectedDraw].sort((a, b) => a - b);
  if (input.drawSelectionTouched || manual.length > 0) return manual;
  if (input.bestPlayEnabled) {
    return [...input.recommendedDiscardIndices].sort((a, b) => a - b);
  }
  return [];
}

export interface DrawRecommendationInput {
  showBestPlayControl: boolean;
  inDrawPhase: boolean;
  drawCompleted: boolean;
  bestPlayEnabled: boolean;
  drawSelectionTouched: boolean;
  recommendedDiscardIndices: number[];
  selectedDraw: ReadonlySet<number>;
}

/** Green Best Play hint — never overlaps user selection styling. */
export function isDrawRecommendationIndex(index: number, input: DrawRecommendationInput): boolean {
  if (!input.showBestPlayControl || !input.inDrawPhase || input.drawCompleted) return false;
  if (!input.bestPlayEnabled || input.drawSelectionTouched) return false;
  if (input.selectedDraw.has(index)) return false;
  return input.recommendedDiscardIndices.includes(index);
}
