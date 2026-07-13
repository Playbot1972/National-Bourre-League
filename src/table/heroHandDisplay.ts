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

/** Map effective (4-card) index to stable display fan when trump occupies a display slot. */
export function effectiveIndexToDisplayIndex(
  effectiveIndex: number,
  trumpDisplayIndex: number | null,
): number {
  if (trumpDisplayIndex == null) return effectiveIndex;
  if (effectiveIndex < trumpDisplayIndex) return effectiveIndex;
  return effectiveIndex + 1;
}

/** Map display fan index back to effective hand; trump slot is not playable. */
export function displayIndexToEffectiveIndex(
  displayIndex: number,
  trumpDisplayIndex: number | null,
): number | null {
  if (trumpDisplayIndex == null) return displayIndex;
  if (displayIndex === trumpDisplayIndex) return null;
  if (displayIndex > trumpDisplayIndex) return displayIndex - 1;
  return displayIndex;
}

export function mapEffectiveIndicesToDisplay(
  effectiveIndices: number[],
  trumpDisplayIndex: number | null,
): number[] {
  return effectiveIndices.map((index) =>
    effectiveIndexToDisplayIndex(index, trumpDisplayIndex),
  );
}

export function mapDisplayIndicesToEffective(
  displayIndices: number[],
  trumpDisplayIndex: number | null,
): number[] {
  return displayIndices
    .map((index) => displayIndexToEffectiveIndex(index, trumpDisplayIndex))
    .filter((index): index is number => index != null)
    .sort((a, b) => a - b);
}

/**
 * Presentation-only hero hand.
 * While trump is on the table the holder shows four cards; center trump stays public.
 * After the first opening action the server clears trumpUpcard and we fly it into slot 5.
 */
export function resolveHeroHandDisplay(input: HeroHandDisplayInput): HeroHandDisplayState {
  const isHolder = Boolean(
    input.playerId && input.trumpHolderId && input.playerId === input.trumpHolderId,
  );
  const hasTrumpOnTable = Boolean(input.trumpUpcard);
  const { trumpMergeActive, trumpMergedIntoHand } = input.handPresentation;

  const defaultReminder =
    !hasTrumpOnTable && Boolean(input.trumpSuit) && input.phase === "play";

  if (!isHolder) {
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

  if (trumpMergeActive && !hasTrumpOnTable) {
    const trumpDisplayIndex = Math.max(0, input.effectiveHeroCards.length - 1);
    return {
      displayCards: input.effectiveHeroCards,
      revealedTrumpIndex: trumpDisplayIndex,
      trumpMergeActive: true,
      trumpMergedIntoHand: false,
      hideCenterTrumpForHolder: false,
      showTrumpSuitReminder: false,
      trumpDisabledIndex: trumpDisplayIndex,
      indexMode: "display",
    };
  }

  if (hasTrumpOnTable) {
    return {
      displayCards: input.effectiveHeroCards,
      revealedTrumpIndex: null,
      trumpMergeActive: false,
      trumpMergedIntoHand,
      hideCenterTrumpForHolder: false,
      showTrumpSuitReminder: false,
      trumpDisabledIndex: null,
      indexMode: "effective",
    };
  }

  return {
    displayCards: input.effectiveHeroCards,
    revealedTrumpIndex: null,
    trumpMergeActive: false,
    trumpMergedIntoHand,
    hideCenterTrumpForHolder: false,
    showTrumpSuitReminder: defaultReminder,
    trumpDisabledIndex: null,
    indexMode: "effective",
  };
}
