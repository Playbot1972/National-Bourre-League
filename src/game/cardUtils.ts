import { RANK_VALUE, type Card, type Rank, type Suit } from "../types";

export function cardKey(card: Card): string {
  return `${card.rank}:${card.suit}`;
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function rankValue(card: Card): number {
  return RANK_VALUE[card.rank as Rank];
}

export function isTrump(card: Card, trumpSuit: Suit): boolean {
  return card.suit === trumpSuit;
}

export function cardsOfSuit(hand: Card[], suit: Suit): Card[] {
  return hand.filter((c) => c.suit === suit);
}

export function indexOfCard(hand: Card[], card: Card): number {
  return hand.findIndex((c) => cardsEqual(c, card));
}

export function removeCardAt(hand: Card[], index: number): Card[] {
  return hand.filter((_, i) => i !== index);
}

export function removeCardsAtIndices(hand: Card[], indices: number[]): Card[] {
  const sorted = [...new Set(indices)].sort((a, b) => b - a);
  const out = [...hand];
  for (const idx of sorted) {
    if (idx < 0 || idx >= out.length) continue;
    out.splice(idx, 1);
  }
  return out;
}
