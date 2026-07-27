/**
 * Canonical join policy for mixed public tables.
 *
 * Two entry paths share promotion/replacement infrastructure but differ in
 * table selection (see publicTable.js vs handleJoinPublicTable).
 */

import {
  PUBLIC_TABLE_DEFAULT_TARGET_SEATS,
  PUBLIC_TABLE_MAX_SEATS,
  PUBLIC_TABLE_MIN_SEATS,
} from "./vendor/public-table-schema.js";
import {
  isHandoffWindow,
  selectEligibleFillBots,
} from "./publicTableReplacement.js";

function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

/** Mirror of publicTable.isSessionInHand — avoid circular import. */
function isSessionInHand(sessionData) {
  if (!sessionData || sessionData.status === "final") return false;
  const hand = sessionData.currentHand ?? {};
  const phase = hand.phase ?? null;
  if (phase === "draw" || phase === "play" || phase === "reveal" || phase === "decision") {
    return true;
  }
  return (hand.participantIds?.length ?? 0) > 0;
}

function scoreRowsToById(scoreRows) {
  return Object.fromEntries(
    (scoreRows ?? [])
      .map((row) => {
        const id = row.playerId ?? row.id;
        return id ? [id, row] : null;
      })
      .filter(Boolean),
  );
}

function seatedCount(scoreRows) {
  let count = 0;
  for (const row of scoreRows ?? []) {
    const id = row.playerId ?? row.id;
    if (!id || row.spectator === true) continue;
    count += 1;
  }
  return count;
}

function clampTargetSeatCount(value) {
  const n = Number(value) || PUBLIC_TABLE_DEFAULT_TARGET_SEATS;
  return Math.max(PUBLIC_TABLE_MIN_SEATS, Math.min(PUBLIC_TABLE_MAX_SEATS, n));
}

/** Derived open capacity (matches publicTableIndex openSeats). */
export function computeOpenSeatCount(roomData, sessionData, scoreRows) {
  const targetSeatCount = clampTargetSeatCount(
    roomData?.targetSeatCount ?? PUBLIC_TABLE_DEFAULT_TARGET_SEATS,
  );
  return Math.max(0, targetSeatCount - seatedCount(scoreRows));
}

/** True when at least one fill bot can be replaced at a hand boundary. */
export function hasFillBotReplacementPath(sessionPlayers, scoreRows) {
  const scoreById = scoreRowsToById(scoreRows);
  return selectEligibleFillBots(sessionPlayers ?? [], scoreById).length > 0;
}

/**
 * Safe hand-boundary window — no live draw/play/reveal/decision and no dealt roster.
 * @see isHandoffWindow
 */
export function isSafeSeatingWindow(sessionData) {
  return isHandoffWindow(sessionData);
}

/**
 * Immediate seating: between hands AND a seat path exists now.
 * Paths: open capacity (vacated seat) or fill-bot replacement at handoff.
 */
export function canSeatJoinerImmediately(sessionData, roomData, scoreRows) {
  if (!isSafeSeatingWindow(sessionData)) return false;
  if (computeOpenSeatCount(roomData, sessionData, scoreRows) > 0) return true;
  return hasFillBotReplacementPath(sessionData?.players, scoreRows);
}

/**
 * Next-hand promotion path for a pending joiner.
 * Mid-hand: true when a fill bot or open capacity will be available at boundary.
 * At handoff: same as immediate seating.
 */
export function canPromoteJoinerAtNextBoundary(sessionData, roomData, scoreRows) {
  if (!sessionData || sessionData.status === "final") return false;
  if (isSafeSeatingWindow(sessionData)) {
    return canSeatJoinerImmediately(sessionData, roomData, scoreRows);
  }
  if (!isSessionInHand(sessionData)) return false;
  return (
    computeOpenSeatCount(roomData, sessionData, scoreRows) > 0 ||
    hasFillBotReplacementPath(sessionData?.players, scoreRows)
  );
}

/**
 * Mixed matchmaking candidate tier (higher = prefer routing here).
 * 3 = humans + immediate seat at handoff
 * 2 = humans + next-boundary promotion path (mid-hand or handoff)
 * 1 = humans present (spectate only — no guaranteed seat path)
 * 0 = no seated humans
 */
export function mixedJoinCandidateTier(indexDoc, sessionData, roomData, scoreRows) {
  const humans = indexDoc?.realPlayerCount ?? 0;
  if (humans <= 0) return 0;
  if (canSeatJoinerImmediately(sessionData, roomData, scoreRows)) return 3;
  if (canPromoteJoinerAtNextBoundary(sessionData, roomData, scoreRows)) return 2;
  return 1;
}

/**
 * Rank mixed public-table candidates for matchmaking.
 * Prefers: active humans → immediate seat → promotion path → fuller tables.
 */
export function rankMixedJoinCandidates(candidates, contextByKey) {
  return [...candidates].sort((a, b) => {
    const ctxA = contextByKey?.[a.id ?? `${a.roomId}_${a.sessionId}`] ?? {};
    const ctxB = contextByKey?.[b.id ?? `${b.roomId}_${b.sessionId}`] ?? {};
    const tierA = mixedJoinCandidateTier(a, ctxA.sessionData, ctxA.roomData, ctxA.scoreRows);
    const tierB = mixedJoinCandidateTier(b, ctxB.sessionData, ctxB.roomData, ctxB.scoreRows);
    if (tierB !== tierA) return tierB - tierA;

    const realDiff = (b.realPlayerCount ?? 0) - (a.realPlayerCount ?? 0);
    if (realDiff !== 0) return realDiff;

    const openDiff = (a.openSeats ?? 0) - (b.openSeats ?? 0);
    if (openDiff !== 0) return openDiff;

    const aTs = a.updatedAt?.toMillis?.() ?? a.updatedAt ?? 0;
    const bTs = b.updatedAt?.toMillis?.() ?? b.updatedAt ?? 0;
    return bTs - aTs;
  });
}
