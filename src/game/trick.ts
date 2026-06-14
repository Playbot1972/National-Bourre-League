import { isTrump, rankValue } from "./cardUtils";
import type { Card, Suit } from "../types";

export function resolveTrickWinner(
  plays: Array<{ playerId: string; card: Card }>,
  leadSuit: Suit,
  trumpSuit: Suit,
): string {
  if (!plays.length) throw new Error("No plays in trick");

  const trumps = plays.filter((p) => isTrump(p.card, trumpSuit));
  if (trumps.length) {
    const best = trumps.reduce((a, b) =>
      rankValue(b.card) > rankValue(a.card) ? b : a,
    );
    return best.playerId;
  }

  const led = plays.filter((p) => p.card.suit === leadSuit);
  const pool = led.length ? led : plays;
  const best = pool.reduce((a, b) =>
    rankValue(b.card) > rankValue(a.card) ? b : a,
  );
  return best.playerId;
}
