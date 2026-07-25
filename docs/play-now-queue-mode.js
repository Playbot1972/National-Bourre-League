/**
 * Play Now matchmaking mode — client selection + labels (pure, no Firebase).
 */

import {
  PLAY_NOW_QUEUE_MODE,
  normalizePlayNowQueueMode,
} from "./public-table-schema.js";

export { PLAY_NOW_QUEUE_MODE, normalizePlayNowQueueMode };

const STORAGE_KEY = "nbl-play-now-queue-mode";

/** Short label for table banners and compact UI. */
export function playNowQueueModeShortLabel(mode) {
  const normalized = normalizePlayNowQueueMode(mode);
  return normalized === PLAY_NOW_QUEUE_MODE.BOTS_ONLY ? "Bots only" : "Mixed";
}

/** Descriptive copy for the mode selector. */
export function playNowQueueModeDescription(mode) {
  const normalized = normalizePlayNowQueueMode(mode);
  if (normalized === PLAY_NOW_QUEUE_MODE.BOTS_ONLY) {
    return "Instant seat vs bots — no live-player matchmaking.";
  }
  return "Join live players when available; bots fill empty seats.";
}

/** Status line while matchmaking is in flight. */
export function playNowMatchmakingStatusMessage(mode) {
  const normalized = normalizePlayNowQueueMode(mode);
  if (normalized === PLAY_NOW_QUEUE_MODE.BOTS_ONLY) {
    return "Starting a bots-only table…";
  }
  return "Finding a mixed public table…";
}

/** Watch-only banner prefix for mixed public tables. */
export function playNowWatchOnlyMessage(mode) {
  const label = playNowQueueModeShortLabel(mode);
  return `${label} table — watching this hand; you'll join the next deal.`;
}

/** @returns {typeof PLAY_NOW_QUEUE_MODE[keyof typeof PLAY_NOW_QUEUE_MODE]} */
export function loadPlayNowQueueMode() {
  if (typeof localStorage === "undefined") return PLAY_NOW_QUEUE_MODE.MIXED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizePlayNowQueueMode(raw);
  } catch {
    return PLAY_NOW_QUEUE_MODE.MIXED;
  }
}

/** @param {typeof PLAY_NOW_QUEUE_MODE[keyof typeof PLAY_NOW_QUEUE_MODE]} mode */
export function savePlayNowQueueMode(mode) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, normalizePlayNowQueueMode(mode));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Read selected mode from the rooms UI (falls back to persisted value).
 * @returns {typeof PLAY_NOW_QUEUE_MODE[keyof typeof PLAY_NOW_QUEUE_MODE]}
 */
export function readPlayNowQueueModeFromDom() {
  if (typeof document === "undefined") return loadPlayNowQueueMode();
  const selected = document.querySelector('input[name="play-now-mode"]:checked');
  const value = selected?.value;
  return normalizePlayNowQueueMode(value ?? loadPlayNowQueueMode());
}
