import { botDrawDiscardIndices, botPlayCardIndex } from "../game/play";
import { isTrump } from "../game/cardUtils";
import { buildPlayValidationState } from "../game/playContext";
import type { PublicHandState } from "../game/types";
import type { Card, Suit } from "../types";

/** Readable beat after turn activation before a queued pre-play submits. */
export const QUEUED_PLAY_TURN_BEAT_MS = 420;

export function queuedPlaySubmitDelayMs(reducedMotion = false): number {
  const scale = reducedMotion ? 0.55 : 1;
  return Math.max(160, Math.round(QUEUED_PLAY_TURN_BEAT_MS * scale));
}

/** True when a queued legal card should auto-submit after the hero's turn activates. */
export function shouldSubmitQueuedPlayOnTurnActivation(input: {
  becameMine: boolean;
  inPlayPhase: boolean;
  selectedPlay: number | null;
  playLocked: boolean;
  busy: boolean;
  isLegal: boolean;
}): boolean {
  return (
    input.becameMine &&
    input.inPlayPhase &&
    input.selectedPlay !== null &&
    !input.playLocked &&
    !input.busy &&
    input.isLegal
  );
}

/**
 * Keep the queued-submit timer when the turn advances to the hero within the same trick.
 * Other activity changes still cancel stale autoplay timers.
 */
export function shouldPreserveQueuedPlayTimerOnActivityChange(input: {
  prev: PlayActivityContext;
  next: PlayActivityContext;
  isMyTurn: boolean;
  selectedPlay: number | null;
  isLegal: boolean;
}): boolean {
  if (shouldClearQueuedPlayOnActivityChange(input.prev, input.next)) return false;
  return (
    input.isMyTurn &&
    input.selectedPlay !== null &&
    input.isLegal &&
    input.prev.turnPlayerId !== input.next.turnPlayerId &&
    (input.next.phase ?? "") === "play"
  );
}

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
  /** On-turn legal tap — submit immediately (no preselect timer). */
  shouldImmediatePlay: boolean;
  /** Out-of-turn legal tap — queue selection only. */
  shouldQueueSelection: boolean;
  shouldCancelAutoplay: boolean;
  isDeselect: boolean;
}

/** Pure tap selection + play plan for hero hand play phase. */
export function planTapAutoplay(input: TapAutoplayPlanInput): TapAutoplayPlan {
  const nextSelection = togglePlayPreselectIndex(input.selectedPlay, input.tappedIndex);
  const isDeselect = nextSelection === null && input.selectedPlay === input.tappedIndex;
  const shouldImmediatePlay =
    nextSelection !== null && input.isMyTurn && input.isLegal && !isDeselect;
  const shouldQueueSelection =
    nextSelection !== null && !input.isMyTurn && input.isLegal && !isDeselect;
  const shouldCancelAutoplay = isDeselect || nextSelection !== input.selectedPlay;
  return {
    nextSelection,
    shouldImmediatePlay,
    shouldQueueSelection,
    shouldCancelAutoplay,
    isDeselect,
  };
}

/** Swipe should submit immediately only when on-turn and legal. */
export function shouldSwipeImmediatePlay(isMyTurn: boolean, isLegal: boolean): boolean {
  return isMyTurn && isLegal;
}

export interface PlayActivityContext {
  handNumber: number;
  trickNumber: number | null;
  turnPlayerId: string | null;
  phase: string | null;
}

export function buildPlayActivityKey(ctx: PlayActivityContext): string {
  return `${ctx.handNumber}:${ctx.trickNumber ?? 0}:${ctx.turnPlayerId ?? ""}:${ctx.phase ?? ""}`;
}

/**
 * Out-of-turn pre-play queue survives opponent turn/trick advances.
 * Clear only on hand or phase boundaries (new hand or leaving play context).
 */
export function shouldClearQueuedPlayOnActivityChange(
  prev: PlayActivityContext,
  next: PlayActivityContext,
): boolean {
  return prev.handNumber !== next.handNumber || (prev.phase ?? "") !== (next.phase ?? "");
}

export function parsePlayActivityKey(key: string): PlayActivityContext {
  const [handNumber, trickNumber, turnPlayerId, phase] = key.split(":");
  return {
    handNumber: Number(handNumber) || 0,
    trickNumber: trickNumber === "" || trickNumber === "0" ? null : Number(trickNumber),
    turnPlayerId: turnPlayerId || null,
    phase: phase || null,
  };
}

/** Best Play highlight gate — independent of manual selectedPlay / preselect state. */
export function shouldShowBestPlayRecommendation(input: {
  showBestPlayControl: boolean;
  inPlayPhase: boolean;
  bestPlayEnabled: boolean;
  recommendedPlayIndex: number | null;
}): boolean {
  return (
    input.showBestPlayControl &&
    input.inPlayPhase &&
    input.bestPlayEnabled &&
    input.recommendedPlayIndex !== null &&
    input.recommendedPlayIndex >= 0
  );
}

export type HeroPlayCardVisualTier =
  | "play-preselected"
  | "play-recommended"
  | "legal-playable"
  | null;

/**
 * Hero play-phase card styling precedence:
 * 1. selectedPlay (manual tap / queue)
 * 2. best-play recommendation
 * 3. legal-play green outline (ambient hint)
 * 4. default / muted
 */
export function resolveHeroPlayCardVisualTier(input: {
  inPlayPhase: boolean;
  isMyTurn: boolean;
  busy: boolean;
  cardIndex: number;
  selectedPlay: number | null;
  isLegal: boolean;
  showBestPlayRecommendation: boolean;
  recommendedPlayIndex: number | null;
}): HeroPlayCardVisualTier {
  if (!input.inPlayPhase) return null;
  if (input.selectedPlay === input.cardIndex) return "play-preselected";
  if (
    input.showBestPlayRecommendation &&
    input.recommendedPlayIndex === input.cardIndex
  ) {
    return "play-recommended";
  }
  if (input.isMyTurn && input.isLegal && !input.busy) return "legal-playable";
  return null;
}

/** @deprecated Use resolveHeroPlayCardVisualTier */
export function resolveManualOrRecommendedPlayState(input: {
  cardIndex: number;
  selectedPlay: number | null;
  showBestPlayRecommendation: boolean;
  recommendedPlayIndex: number | null;
}): "play-preselected" | "play-recommended" | null {
  const tier = resolveHeroPlayCardVisualTier({
    inPlayPhase: true,
    isMyTurn: true,
    busy: false,
    cardIndex: input.cardIndex,
    selectedPlay: input.selectedPlay,
    isLegal: true,
    showBestPlayRecommendation: input.showBestPlayRecommendation,
    recommendedPlayIndex: input.recommendedPlayIndex,
  });
  if (tier === "play-preselected" || tier === "play-recommended") return tier;
  return null;
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

/** Indices submitted on Draw — manual picks win when touched; otherwise live Best Play hints. */
export function effectiveDrawDiscardIndices(input: DrawDiscardSelectionInput): number[] {
  if (input.drawSelectionTouched) {
    return [...input.selectedDraw].sort((a, b) => a - b);
  }
  if (input.bestPlayEnabled) {
    return [...input.recommendedDiscardIndices].sort((a, b) => a - b);
  }
  return [...input.selectedDraw].sort((a, b) => a - b);
}
