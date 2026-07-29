import { isTrump, rankValue } from "./cardUtils";
import { getLegalPlayIndices, type PlayContext } from "./legal";
import { resolveTrickWinner } from "./trick";
import type { Card, Suit } from "../types";

/** Lowest non-trump discard heuristic (legacy opponent / fallback). */
export function heuristicDrawDiscardIndices(
  hand: Card[],
  trumpSuit: Suit,
  maxDiscards: number,
  deckReplacementsAvailable = Number.POSITIVE_INFINITY,
): number[] {
  const cap = Math.min(maxDiscards, Math.max(0, deckReplacementsAvailable));
  if (cap <= 0) return [];
  const ranked = hand
    .map((card, index) => ({
      card,
      index,
      value: rankValue(card),
      trump: isTrump(card, trumpSuit),
    }))
    .sort((a, b) => {
      if (a.trump !== b.trump) return a.trump ? 1 : -1;
      return a.value - b.value;
    });
  return ranked.slice(0, cap).map((x) => x.index);
}

/** Lead high / cheapest winner / dump low (legacy opponent / fallback). */
export function heuristicPlayCardIndex(hand: Card[], ctx: PlayContext): number {
  const legal = getLegalPlayIndices(ctx);
  if (!legal.length) return 0;

  if (ctx.isLeading || !ctx.trickPlays.length) {
    return legal.reduce((best, idx) =>
      rankValue(hand[idx]) > rankValue(hand[best]) ? idx : best,
    );
  }

  const leadSuit = ctx.leadSuit ?? ctx.trickPlays[0]?.suit;
  if (!leadSuit) {
    return legal.reduce((best, idx) =>
      rankValue(hand[idx]) < rankValue(hand[best]) ? idx : best,
    );
  }

  const winners = legal.filter((idx) => {
    const plays = [
      ...ctx.trickPlays.map((card, i) => ({ playerId: `_${i}`, card })),
      { playerId: "_bot", card: hand[idx] },
    ];
    return resolveTrickWinner(plays, leadSuit, ctx.trumpSuit) === "_bot";
  });

  const pool = winners.length ? winners : legal;
  return pool.reduce((best, idx) =>
    rankValue(hand[idx]) < rankValue(hand[best]) ? idx : best,
  );
}

/** Random legal play — varied opponent baseline. */
export function randomLegalPlayCardIndex(_hand: Card[], ctx: PlayContext, rng: () => number): number {
  const legal = getLegalPlayIndices(ctx);
  if (!legal.length) return 0;
  return legal[Math.floor(rng() * legal.length)]!;
}

/** Random legal discard subset up to cap (includes pat). */
export function randomLegalDrawDiscardIndices(
  hand: Card[],
  maxDiscards: number,
  deckReplacementsAvailable: number,
  rng: () => number,
): number[] {
  const cap = Math.min(maxDiscards, Math.max(0, deckReplacementsAvailable));
  const combos: number[][] = [[]];
  for (let k = 1; k <= cap; k += 1) {
    const buf: number[] = [];
    const walk = (start: number, left: number) => {
      if (left === 0) {
        combos.push([...buf]);
        return;
      }
      for (let i = start; i <= hand.length - left; i += 1) {
        buf.push(i);
        walk(i + 1, left - 1);
        buf.pop();
      }
    };
    walk(0, k);
  }
  return combos[Math.floor(rng() * combos.length)] ?? [];
}
