import { isTrump, rankValue } from "./cardUtils";
import { estimateHandStrength } from "./botDecisions";
import type { Card, Suit } from "../types";
import { SUIT_SYMBOL } from "../types";

/** J, Q, K, or A. */
export function isHighCard(card: Card): boolean {
  return rankValue(card) >= 11;
}

/** Builds on estimateHandStrength with trump and face-card weighting. */
export function calculateHandStrength(hand: Card[], trumpSuit: Suit): number {
  const base = estimateHandStrength(hand, trumpSuit);
  const trumpCount = hand.filter((c) => isTrump(c, trumpSuit)).length;
  const highCount = hand.filter(isHighCard).length;
  return base + trumpCount * 0.4 + highCount * 0.25;
}

export function formatHandForLog(hand: Card[]): string {
  return hand.map((c) => `${c.rank}${SUIT_SYMBOL[c.suit]}`).join(" ");
}

/**
 * Post-reveal play/fold — true = PLAY, false = FOLD (pass/out).
 */
export function evaluatePlayOrFold(hand: Card[], trumpSuit: Suit): boolean {
  if (hand.length < 5) return true;

  const hasTrumpAce = hand.some((c) => isTrump(c, trumpSuit) && c.rank === "A");
  if (hasTrumpAce) return true;

  const highCards = hand.filter(isHighCard);
  const strength = calculateHandStrength(hand, trumpSuit);

  if (highCards.length >= 2) {
    return strength >= 1.8;
  }

  return strength >= 2.5;
}
