/**
 * Minimal public-table spectator guardrails (pre-launch).
 * Full spectator UX is v1.1 — this module only prevents accidental seating.
 */

import { PENDING_JOIN_STATUS, BOT_ROLE } from "./public-table-schema.js";
import { isPublicTableSession } from "./public-table-rollout.js";

export const PUBLIC_TABLE_WATCH_ONLY_MESSAGE =
  "Watching this hand — you'll join the next deal.";

export const PUBLIC_TABLE_WATCH_ONLY_NO_SEAT_MESSAGE =
  "Watching this hand — waiting for an open seat at the next deal.";

function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

/**
 * Count fill bots eligible for hand-boundary spectator replacement.
 * Mirrors server selectEligibleFillBots (publicTableReplacement.js).
 *
 * @param {Array<{ playerId?: string }>|null|undefined} sessionPlayers
 * @param {Array<{ playerId?: string, botRole?: string, spectator?: boolean, out?: boolean, bankroll?: number }>} scoreRows
 */
export function countEligibleFillBotSeats(sessionPlayers, scoreRows) {
  const scoreById = Object.fromEntries(
    (scoreRows ?? []).map((row) => [row.playerId, row]).filter(([id]) => Boolean(id)),
  );
  let count = 0;
  for (const p of sessionPlayers ?? []) {
    const playerId = p?.playerId;
    if (!playerId || !isRobotPlayerId(playerId)) continue;
    const row = scoreById[playerId];
    if (!row || row.botRole !== BOT_ROLE.FILL) continue;
    if (row.spectator === true || row.out === true) continue;
    if ((row.bankroll ?? 0) <= 0) continue;
    count += 1;
  }
  return count;
}

/**
 * True when a queued spectator can replace a fill bot at the next hand boundary.
 */
export function spectatorCanJoinNextDeal(sessionData, scoreRows) {
  if (!isPublicTableSession(sessionData)) return false;
  return countEligibleFillBotSeats(sessionData?.players, scoreRows) > 0;
}

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
 * Client watch-only mode — spectator queue without a score row, unless the user
 * is an active participant in the current hand (scores may lag on mixed bot tables).
 */
export function resolveTableWatchOnly(
  sessionData,
  userId,
  { scorePlayerIds = [], handParticipantIds = [] } = {},
) {
  if (!userId) return false;
  let watchOnly = isPublicTableWatchOnly(sessionData, userId, { scorePlayerIds });
  if (handParticipantIds.includes(userId)) {
    watchOnly = false;
  }
  return watchOnly;
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
