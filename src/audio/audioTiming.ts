/**
 * Per-event audio sync offsets — named constants, not one global delay.
 * Positive values delay playback after the visual milestone.
 */

/** Base card-place thock — card visually lands in trick area. */
export const CARD_PLAYED_OFFSET_MS = 0;

/** Lead-change sweetener — legacy dispatch path (superseded by winning-card cycle). */
export const LEAD_CHANGE_OFFSET_MS = 0;

/** Delay after card-place thock before winning-card sweetener layer. */
export const WINNING_CARD_SWEETENER_OFFSET_MS = 220;

/** Trick-win stinger — winnerReveal phase entry (after read pause). */
export const TRICK_WON_OFFSET_MS = 0;

/** Collection whoosh — GSAP packet fly starts (after inline rake). */
export const TRICK_COLLECTED_OFFSET_MS = 0;

/** Dedupe keys expire after this window to allow future tricks. */
export const AUDIO_DEDUPE_TTL_MS = 90_000;
