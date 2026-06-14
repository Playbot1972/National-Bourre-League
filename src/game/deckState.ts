import type { Card } from "../types";
import { createDeck, shuffleDeck } from "./deck";

export function shuffledDeckFromSeed(seed: number): Card[] {
  return shuffleDeck(createDeck(), seed);
}

export function drawCardsFromDeck(
  deck: Card[],
  deckNextIndex: number,
  count: number,
): { cards: Card[]; deckNextIndex: number } {
  const cards = deck.slice(deckNextIndex, deckNextIndex + count);
  if (cards.length < count) {
    throw new Error("Not enough cards left in deck");
  }
  return { cards, deckNextIndex: deckNextIndex + count };
}

export function remainingDeckCount(deck: Card[], deckNextIndex: number): number {
  return Math.max(0, deck.length - deckNextIndex);
}
