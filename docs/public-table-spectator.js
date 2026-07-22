/**
 * Minimal public-table spectator guardrails (pre-launch).
 * Full spectator UX is v1.1 — this module only prevents accidental seating.
 */

import { PENDING_JOIN_STATUS } from "./public-table-schema.js";
import { isPublicTableSession } from "./public-table-rollout.js";

export const PUBLIC_TABLE_WATCH_ONLY_MESSAGE =
  "Watching this hand — you'll join the next deal.";

/**
 * True when the server kept this user in pendingJoins as a spectator (not seated).
 * A score row means authoritative promotion already happened.
 *
 * @param {object|null|undefined} sessionData
 * @param {string|null|undefined} userId
 * @param {{ hasScoreRow?: boolean }} [opts]
 * @returns {boolean}
 */
export function isPublicTableSpectator(sessionData, userId, { hasScoreRow = false } = {}) {
  if (!userId || !isPublicTableSession(sessionData)) return false;
  if (hasScoreRow) return false;
  const status = sessionData?.pendingJoins?.[userId]?.status;
  return status === PENDING_JOIN_STATUS.SPECTATING;
}

/**
 * Watch-only table mode for the viewing user on a public-table session.
 *
 * @param {object|null|undefined} sessionData
 * @param {string|null|undefined} userId
 * @param {{ scorePlayerIds?: Iterable<string> }} [opts]
 * @returns {boolean}
 */
export function isPublicTableWatchOnly(sessionData, userId, { scorePlayerIds = [] } = {}) {
  if (!userId) return false;
  const scoreIds = new Set(scorePlayerIds);
  return isPublicTableSpectator(sessionData, userId, { hasScoreRow: scoreIds.has(userId) });
}

/**
 * No-op table intents — blocks client play actions while spectating.
 */
export function createWatchOnlyTableIntentHandlers() {
  const noop = () => {};
  const noopAsync = async () => {};
  return {
    onToggleInHand: noop,
    onPassEnrollment: noopAsync,
    onDecisionPlay: noopAsync,
    onAdvanceReveal: noopAsync,
    onTrickDelta: noop,
    onSettle: noop,
    onSettleCarryover: noopAsync,
    onRebuy: noopAsync,
    onSubmitDraw: noopAsync,
    onPassDraw: noopAsync,
    onFoldDraw: noopAsync,
    onPlayCard: noopAsync,
  };
}
