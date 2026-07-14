/** Minimum time tie / co-win result screens stay visible (readable floor). */
export const TIE_RESULT_MIN_MS = 3_000;

/** Default target duration when message length is short. */
export const TIE_RESULT_DEFAULT_MS = 4_000;

/** Upper cap so gameplay never feels stalled. */
export const TIE_RESULT_MAX_MS = 6_000;

/**
 * Clamp tie/co-win result visibility from message length.
 * Short copy → default ~4s; long copy → up to max 6s; never below min 3s.
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
