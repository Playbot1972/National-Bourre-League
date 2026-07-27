/**
 * Public-table join status copy (client). Server result is authoritative.
 */

import { playNowQueueModeShortLabel } from "./play-now-queue-mode.js";

/**
 * @param {object|null|undefined} result — gameFindOrCreatePublicTable / gameJoinPublicTable payload
 * @returns {string|null}
 */
export function publicTableJoinStatusMessage(result) {
  if (!result) return null;
  const label = playNowQueueModeShortLabel(result.queueMode ?? "mixed");

  if (result.status === "seated") {
    if (result.joinDisposition === "immediate_open") {
      return `${label} table — you are seated.`;
    }
    if (result.joinDisposition === "immediate_fill_bot") {
      return `${label} table — you are seated (replaced a fill bot).`;
    }
    return `${label} table — you are seated.`;
  }

  if (result.status === "spectating") {
    if (result.canPromoteAtNextBoundary === true) {
      return `${label} table — watching this hand; you'll join the next deal.`;
    }
    return `${label} table — watching this hand; waiting for an open seat at the next deal.`;
  }

  return null;
}

/**
 * Watch-only banner while at the table (spectator without score row).
 * @param {object} [opts]
 * @param {string} [opts.mode]
 * @param {boolean} [opts.canPromoteAtNextBoundary]
 */
export function publicTableWatchOnlyBannerMessage({ mode = "mixed", canPromoteAtNextBoundary = false } = {}) {
  const label = playNowQueueModeShortLabel(mode);
  if (canPromoteAtNextBoundary) {
    return `${label} table — watching this hand; you'll join the next deal.`;
  }
  return `${label} table — watching this hand; waiting for an open seat at the next deal.`;
}

let lastJoinResult = null;

/** Remember latest server join disposition for banner hints before scores refresh. */
export function rememberPublicTableJoinResult(result) {
  lastJoinResult = result ?? null;
}

export function peekPublicTableJoinResult() {
  return lastJoinResult;
}

export function clearPublicTableJoinResult() {
  lastJoinResult = null;
}

/**
 * Resolve watch-only banner promotion hint: prefer live score scan, fall back to join result.
 */
export function resolveCanPromoteAtNextBoundary({ scoreBased = false, joinResult = null } = {}) {
  if (scoreBased) return true;
  const jr = joinResult ?? lastJoinResult;
  if (jr?.canPromoteAtNextBoundary === true) return true;
  if (jr?.canPromoteAtNextBoundary === false) return false;
  return null;
}
