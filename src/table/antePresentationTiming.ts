/**
 * Ante fly-in timing — fast per-player stagger, compressed for 6–8 seats.
 */

import { prefersReducedMotion } from "./trickTiming";

/** Arc travel from avatar to pot (ms). */
export const ANTE_MONEY_TRAVEL_MS = 200;

/** Pile merge / fade into pot after last chip lands (ms). */
export const ANTE_PILE_MERGE_MS = 160;

/** Per-player launch stagger — 80–140 ms, tighter on large tables. */
export function computeAnteStaggerMs(
  playerCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  const count = Math.max(1, Math.min(8, playerCount));
  let base = 100;
  if (count >= 7) base = 72;
  else if (count >= 6) base = 80;
  else if (count <= 3) base = 110;
  const clamped = Math.min(140, Math.max(72, base));
  return reducedMotion ? Math.max(44, Math.round(clamped * 0.55)) : clamped;
}

/** Total ante presentation hold before hand presentation advances. */
export function anteSequenceDurationMs(
  playerCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  const count = Math.max(1, Math.min(8, playerCount));
  const stagger = computeAnteStaggerMs(count, reducedMotion);
  const travel = reducedMotion ? 110 : ANTE_MONEY_TRAVEL_MS;
  const merge = reducedMotion ? 90 : ANTE_PILE_MERGE_MS;
  return Math.max(travel + merge, (count - 1) * stagger + travel + merge);
}
