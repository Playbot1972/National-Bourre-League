import type { SerializedCard } from "./types";
import { resolveTrumpHolderPresentation } from "./trumpHolderPresentation";

export interface HeroHandDisplayInput {
  rawHeroCards: SerializedCard[];
  effectiveHeroCards: SerializedCard[];
  playerId: string | null;
  trumpHolderId: string | null;
  trumpUpcard: SerializedCard | null;
  trumpSuit: string | null;
  phase: string | null;
  handPresentation: {
    trumpRevealActive: boolean;
    trumpMergeActive: boolean;
    trumpMergedIntoHand: boolean;
  };
}

export interface HeroHandDisplayState {
  displayCards: SerializedCard[];
  revealedTrumpIndex: number | null;
  trumpMergeActive: boolean;
  trumpMergedIntoHand: boolean;
  hideCenterTrumpForHolder: boolean;
  showTrumpSuitReminder: boolean;
  trumpDisabledIndex: number | null;
  indexMode: "effective" | "display";
}

function cardKey(card: SerializedCard): string {
  return `${card.rank}-${card.suit}`;
}

export function findTrumpDisplayIndex(
  rawCards: SerializedCard[],
  trumpUpcard: SerializedCard | null,
): number | null {
  if (!trumpUpcard?.rank || !trumpUpcard?.suit) return null;
  const key = cardKey(trumpUpcard);
  const idx = rawCards.findIndex((c) => cardKey(c) === key);
  return idx >= 0 ? idx : null;
}

export function effectiveIndexToDisplayIndex(
  effectiveIndex: number,
  _trumpDisplayIndex: number | null,
): number {
  return effectiveIndex;
}

export function displayIndexToEffectiveIndex(
  displayIndex: number,
  _trumpDisplayIndex: number | null,
): number {
  return displayIndex;
}

export function mapEffectiveIndicesToDisplay(
  effectiveIndices: number[],
  _trumpDisplayIndex: number | null,
): number[] {
  return [...effectiveIndices];
}

export function mapDisplayIndicesToEffective(
  displayIndices: number[],
  _trumpDisplayIndex: number | null,
): number[] {
  return [...displayIndices].sort((a, b) => a - b);
}

/**
 * Presentation-only hero hand: trump holder sees five private cards with the
 * trump as the face-up fifth card during reveal, then a merged five-card fan.
 */
export function resolveHeroHandDisplay(input: HeroHandDisplayInput): HeroHandDisplayState {
  const isHolder = Boolean(
    input.playerId && input.trumpHolderId && input.playerId === input.trumpHolderId,
  );
  const hasTrumpOnTable = Boolean(input.trumpUpcard);
  const trumpIndex =
    isHolder && hasTrumpOnTable
      ? findTrumpDisplayIndex(input.rawHeroCards, input.trumpUpcard) ??
        findTrumpDisplayIndex(input.effectiveHeroCards, input.trumpUpcard)
      : null;

  const defaultReminder =
    !hasTrumpOnTable && Boolean(input.trumpSuit) && input.phase === "play";

  if (!isHolder || !hasTrumpOnTable) {
    return {
      displayCards: input.effectiveHeroCards,
      revealedTrumpIndex: null,
      trumpMergeActive: false,
      trumpMergedIntoHand: false,
      hideCenterTrumpForHolder: false,
      showTrumpSuitReminder: defaultReminder,
      trumpDisabledIndex: null,
      indexMode: "effective",
    };
  }

  const { trumpRevealActive, trumpMergeActive, trumpMergedIntoHand } = input.handPresentation;
  const holderPresentation = resolveTrumpHolderPresentation({
    trumpHolderId: input.trumpHolderId,
    trumpUpcard: input.trumpUpcard,
    trumpSuit: input.trumpSuit,
    phase: input.phase,
    handPresentation: input.handPresentation,
  });
  const rawCards =
    input.rawHeroCards.length > 0 ? input.rawHeroCards : input.effectiveHeroCards;
  const holderUsesRawFan =
    trumpRevealActive ||
    trumpMergeActive ||
    !trumpMergedIntoHand ||
    input.rawHeroCards.length >= input.effectiveHeroCards.length;
  const displayCards = holderUsesRawFan ? rawCards : input.effectiveHeroCards;
  const showRevealedTrump = trumpRevealActive || trumpMergeActive;

  return {
    displayCards,
    revealedTrumpIndex: showRevealedTrump && trumpIndex !== null ? trumpIndex : null,
    trumpMergeActive,
    trumpMergedIntoHand,
    hideCenterTrumpForHolder: holderPresentation.hideCenterTrump,
    showTrumpSuitReminder: holderPresentation.showTrumpSuitReminder,
    trumpDisabledIndex:
      input.phase === "draw" &&
      !trumpRevealActive &&
      !trumpMergeActive
        ? null
        : trumpIndex,
    indexMode: "display",
  };
}
