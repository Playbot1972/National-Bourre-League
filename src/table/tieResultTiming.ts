/** Minimum readable hold — tie/co-win result stays visible at least this long. */
export const TIE_RESULT_MIN_MS = 5_000;

/** Default target duration when message length is short. */
export const TIE_RESULT_DEFAULT_MS = 5_500;

/** Upper cap so gameplay never feels stalled. */
export const TIE_RESULT_MAX_MS = 7_000;

/** Continue button guard floor (local users). */
export const TIE_RESULT_CONTINUE_GUARD_MIN_MS = 750;

/** Continue button guard ceiling. */
export const TIE_RESULT_CONTINUE_GUARD_MAX_MS = 1_000;

/** Continue guard duration (midpoint of guard band). */
export const TIE_RESULT_CONTINUE_GUARD_MS = 875;

/**
 * Clamp tie/co-win result visibility from message length.
 * Short copy → default ~5.5s; long copy → up to max 7s; never below min 5s.
 */
export function getTieResultDurationMs(message = ""): number {
  const len = String(message).trim().length;
  const estimated =
    TIE_RESULT_MIN_MS + Math.min(len * 35, TIE_RESULT_MAX_MS - TIE_RESULT_MIN_MS);
  return Math.max(TIE_RESULT_MIN_MS, Math.min(estimated, TIE_RESULT_MAX_MS));
}

/** Default duration when no message is available (split-pot toast, compact tie UI). */
export function defaultTieResultDurationMs(): number {
  return TIE_RESULT_DEFAULT_MS;
}

/** Whether manual Continue may be enabled for the current tie episode. */
export function isTieContinueGuardComplete(
  shownAt: number,
  now = Date.now(),
  guardMs = TIE_RESULT_CONTINUE_GUARD_MS,
): boolean {
  return now - shownAt >= guardMs;
}

/** Remaining readable hold before automatic latch release (never below min hold). */
export function tieResultAutoHideRemainingMs(
  shownAt: number,
  durationMs: number,
  now = Date.now(),
): number {
  const elapsed = now - shownAt;
  const remaining = durationMs - elapsed;
  return Math.max(0, remaining);
}
