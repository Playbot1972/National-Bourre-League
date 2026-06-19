import type { SerializedCard } from "./types";

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
  trumpDisplayIndex: number | null,
): number {
  if (trumpDisplayIndex === null) return effectiveIndex;
  return effectiveIndex >= trumpDisplayIndex ? effectiveIndex + 1 : effectiveIndex;
}

export function displayIndexToEffectiveIndex(
  displayIndex: number,
  trumpDisplayIndex: number | null,
): number | null {
  if (trumpDisplayIndex === null) return displayIndex;
  if (displayIndex === trumpDisplayIndex) return null;
  return displayIndex > trumpDisplayIndex ? displayIndex - 1 : displayIndex;
}

export function mapEffectiveIndicesToDisplay(
  effectiveIndices: number[],
  trumpDisplayIndex: number | null,
): number[] {
  if (trumpDisplayIndex === null) return [...effectiveIndices];
  return effectiveIndices.map((i) => effectiveIndexToDisplayIndex(i, trumpDisplayIndex));
}

export function mapDisplayIndicesToEffective(
  displayIndices: number[],
  trumpDisplayIndex: number | null,
): number[] {
  if (trumpDisplayIndex === null) return [...displayIndices].sort((a, b) => a - b);
  return displayIndices
    .map((i) => displayIndexToEffectiveIndex(i, trumpDisplayIndex))
    .filter((i): i is number => i !== null)
    .sort((a, b) => a - b);
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
      ? findTrumpDisplayIndex(input.rawHeroCards, input.trumpUpcard)
      : null;

  const defaultReminder =
    !hasTrumpOnTable && Boolean(input.trumpSuit) && input.phase === "play";

  if (!isHolder || !hasTrumpOnTable || trumpIndex === null) {
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
  const rawCards =
    input.rawHeroCards.length > 0 ? input.rawHeroCards : input.effectiveHeroCards;
  const showRevealedTrump = trumpRevealActive || trumpMergeActive;

  return {
    displayCards: rawCards,
    revealedTrumpIndex: showRevealedTrump ? trumpIndex : null,
    trumpMergeActive,
    trumpMergedIntoHand,
    hideCenterTrumpForHolder: true,
    showTrumpSuitReminder:
      trumpMergedIntoHand &&
      hasTrumpOnTable &&
      (input.phase === "draw" || input.phase === "play"),
    trumpDisabledIndex: trumpIndex,
    indexMode: "display",
  };
}
