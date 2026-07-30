import { cardsEqual, isTrump, rankValue } from "./cardUtils";
import { calculateHandStrength, isHighCard } from "./botPlayFold";
import type { Card, Suit } from "../types";

function shouldKeepCard(card: Card, trumpSuit: Suit, handWeak: boolean): boolean {
  const rv = rankValue(card);
  if (isTrump(card, trumpSuit)) {
    if (card.rank === "A") return true;
    if (rv >= 11) return true;
    return false;
  }
  if (rv >= 13) return true;
  if (rv >= 12 && handWeak) return true;
  return false;
}

/** Cards to discard (0–5). Stand pat when hand is already strong. */
export function chooseCardsToDiscard(hand: Card[], trumpSuit: Suit): Card[] {
  const trumpAce = hand.some((c) => isTrump(c, trumpSuit) && c.rank === "A");
  const faceCount = hand.filter(isHighCard).length;
  if (trumpAce && faceCount >= 3) return [];

  const strength = calculateHandStrength(hand, trumpSuit);
  const handWeak = strength < 3.0;

  return hand
    .filter((card) => !shouldKeepCard(card, trumpSuit, handWeak))
    .sort((a, b) => {
      const aTrump = isTrump(a, trumpSuit);
      const bTrump = isTrump(b, trumpSuit);
      if (aTrump !== bTrump) return aTrump ? 1 : -1;
      return rankValue(a) - rankValue(b);
    })
    .slice(0, 5);
}

export function mapCardsToIndices(discardCards: Card[], hand: Card[]): number[] {
  const used = new Set<number>();
  const indices: number[] = [];
  for (const card of discardCards) {
    const idx = hand.findIndex((h, i) => !used.has(i) && cardsEqual(h, card));
    if (idx >= 0) {
      used.add(idx);
      indices.push(idx);
    }
  }
  return indices.sort((a, b) => a - b);
}
