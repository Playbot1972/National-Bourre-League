import { isTrump, rankValue } from "./cardUtils";
import type { Card, Suit } from "../types";

/** Rough trick-taking potential for join/fold heuristics (higher = stronger). */
export function estimateHandStrength(hand: Card[], trumpSuit: Suit): number {
  let score = 0;
  for (const card of hand) {
    const rv = rankValue(card);
    if (isTrump(card, trumpSuit)) {
      score += 2.5 + rv / 13;
    } else if (rv >= 12) {
      score += 1.8;
    } else if (rv >= 11) {
      score += 1.2;
    } else if (rv >= 10) {
      score += 0.8;
    } else if (rv >= 9) {
      score += 0.4;
    } else if (rv >= 7) {
      score += 0.15;
    }
  }
  return score;
}

export { botShouldFoldDraw, botShouldPassDecision } from "./botSearch";
