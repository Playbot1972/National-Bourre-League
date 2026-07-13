/**
 * Ante fly-in timing — centralized pacing for motion + phase scheduler.
 */

import { anteTimingMultiplier, isAnteDebugSlowMode } from "./anteTimingDebug";
import { prefersReducedMotion } from "./trickTiming";

/** Arc travel from avatar to pot (ms) — readable but still brisk. */
export const ANTE_MONEY_TRAVEL_MS = 260;

/** Pop-in before chip launches (matches GSAP first tween). */
export const ANTE_LAUNCH_POP_MS = 90;

/** Land bounce tail after travel (GSAP yoyo bounce). */
export const ANTE_LAND_BOUNCE_MS = 140;

/** GSAP bounce overlap with travel end. */
export const ANTE_BOUNCE_OVERLAP_MS = 50;

/** Pile merge / fade after last chip lands (ms). */
export const ANTE_PILE_MERGE_MS = 200;

/** Minimum readable hold after ante motion before deal may begin (ms). */
export const ANTE_POST_SEQUENCE_HOLD_MS = 180;

/** Gap between each participant's ante — one clear beat at a time. */
export const ANTE_PARTICIPANT_STAGGER_MS = 500;

/** One chip: pop + travel + bounce (with overlap). */
export const ANTE_PER_PLAYER_MOTION_MS =
  ANTE_LAUNCH_POP_MS + ANTE_MONEY_TRAVEL_MS + ANTE_LAND_BOUNCE_MS - ANTE_BOUNCE_OVERLAP_MS;

/** Debug slow mode extras (hold only — motion uses multiplier). */
export const ANTE_DEBUG_SLOW_EXTRA_HOLD_MS = 320;

function scaleMs(ms: number, reducedMotion: boolean): number {
  const motionScale = reducedMotion ? 0.55 : 1;
  const slowScale = anteTimingMultiplier();
  return Math.round(ms * motionScale * slowScale);
}

/** Per-participant gap — fixed ~500ms so each ante is distinct and readable. */
export function computeAnteStaggerMs(
  _playerCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  return scaleMs(ANTE_PARTICIPANT_STAGGER_MS, reducedMotion);
}

/**
 * Total ante presentation hold before hand presentation advances to deal.
 * Matches GSAP: last stagger + per-player motion + merge + post hold.
 */
export function anteSequenceDurationMs(
  playerCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  const count = Math.max(1, Math.min(8, playerCount));
  const stagger = computeAnteStaggerMs(count, reducedMotion);
  const travel = scaleMs(ANTE_MONEY_TRAVEL_MS, reducedMotion);
  const perPlayerMotion =
    scaleMs(ANTE_LAUNCH_POP_MS, reducedMotion) +
    travel +
    scaleMs(ANTE_LAND_BOUNCE_MS, reducedMotion) -
    scaleMs(ANTE_BOUNCE_OVERLAP_MS, reducedMotion);
  const merge = scaleMs(ANTE_PILE_MERGE_MS, reducedMotion);
  const postHold = scaleMs(ANTE_POST_SEQUENCE_HOLD_MS, reducedMotion);
  const debugHold = isAnteDebugSlowMode() ? ANTE_DEBUG_SLOW_EXTRA_HOLD_MS : 0;
  const gaps = Math.max(0, count - 1) * stagger;
  return count * perPlayerMotion + gaps + merge + postHold + debugHold;
}
