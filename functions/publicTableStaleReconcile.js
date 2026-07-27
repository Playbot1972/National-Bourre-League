/**
 * Mixed public-table stale human reconciliation + zero-active grace fallback.
 *
 * Stale rule (presence-based, server-backed):
 * - Uses score-row lastActivityTimestamp (heartbeat + game moves) via classifyIdleStage.
 * - Reconnect grace = PUBLIC_TABLE_IDLE_SIT_OUT_MS (45s): activity within that window is active.
 * - 45s+ idle → sitOut (demoted, does not block deal).
 * - 4min+ idle → evict seated human → fill bot (immediate at join/matchmaking; handoff otherwise).
 *
 * Zero-active grace (mixed tables only):
 * - When active live human count hits 0, start MIXED_ZERO_ACTIVE_GRACE_MS (60s).
 * - Reconnect or new active human clears grace immediately.
 * - After grace expires with active count still 0, convert room to bots-only fallback.
 */

import { FieldValue } from "firebase-admin/firestore";
import {
  PLAY_NOW_QUEUE_MODE,
  MIXED_ZERO_ACTIVE_GRACE_MS,
  roomHasBotsOnlyPublicTables,
  roomHasMixedPublicTables,
} from "./vendor/public-table-schema.js";
import { isPublicTableSession } from "./vendor/public-table-rollout.js";
import {
  applyIdleRemovals,
  classifyIdleStage,
  enforcePublicTableIdlePolicy,
  evaluateIdlePolicyForSeatedHumans,
  listSeatedHumanIds,
  timestampMs,
} from "./publicTableIdle.js";
import { resolveSessionBuyIn } from "./vendor/bourre-rules.js";

function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

function scoresCollection(db, roomId, sessionId) {
  return db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId).collection("scores");
}

function sessionDocRef(db, roomId, sessionId) {
  return db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId);
}

/** Reconnect grace — matches idle sit-out threshold (server heartbeat). */
export { PUBLIC_TABLE_IDLE_SIT_OUT_MS as STALE_RECONNECT_GRACE_MS } from "./vendor/public-table-schema.js";
export { MIXED_ZERO_ACTIVE_GRACE_MS };

/**
 * True when a seated human is actively participating (not idle/sit-out).
 * @param {object} scoreRow
 * @param {number} [nowMs]
 */
export function isActiveLiveHuman(scoreRow, nowMs = Date.now()) {
  const playerId = scoreRow?.playerId ?? scoreRow?.id;
  if (!playerId || isRobotPlayerId(playerId)) return false;
  if (scoreRow?.spectator === true) return false;
  if (scoreRow?.sitOut === true) return false;
  return classifyIdleStage({ ...scoreRow, playerId }, nowMs) === "active";
}

/**
 * Count seated humans who are actively participating.
 * @param {object} sessionData
 * @param {Record<string, object>} scoreById
 * @param {number} [nowMs]
 * @param {{ excludePlayerIds?: string[] }} [opts]
 */
export function countActiveLiveHumans(
  sessionData,
  scoreById,
  nowMs = Date.now(),
  { excludePlayerIds = [] } = {},
) {
  const exclude = new Set(excludePlayerIds);
  let count = 0;
  for (const pid of listSeatedHumanIds(sessionData, scoreById)) {
    if (exclude.has(pid)) continue;
    if (isActiveLiveHuman({ ...scoreById[pid], playerId: pid }, nowMs)) count += 1;
  }
  return count;
}

/**
 * Pure grace evaluation for zero active live humans on mixed tables.
 * @returns {{ shouldStartGrace: boolean, shouldClearGrace: boolean, graceExpired: boolean, graceRemainingMs: number|null }}
 */
export function evaluateZeroActiveGraceState(sessionData, activeLiveHumanCount, nowMs = Date.now()) {
  const startedAt = timestampMs(sessionData?.mixedZeroActiveGraceStartedAt);

  if (activeLiveHumanCount > 0) {
    return {
      shouldStartGrace: false,
      shouldClearGrace: startedAt > 0,
      graceExpired: false,
      graceRemainingMs: null,
    };
  }

  if (startedAt <= 0) {
    return {
      shouldStartGrace: true,
      shouldClearGrace: false,
      graceExpired: false,
      graceRemainingMs: MIXED_ZERO_ACTIVE_GRACE_MS,
    };
  }

  const elapsed = nowMs - startedAt;
  const graceExpired = elapsed >= MIXED_ZERO_ACTIVE_GRACE_MS;
  return {
    shouldStartGrace: false,
    shouldClearGrace: false,
    graceExpired,
    graceRemainingMs: graceExpired ? 0 : MIXED_ZERO_ACTIVE_GRACE_MS - elapsed,
  };
}

function shouldReconcileMixedTable(roomData, sessionData) {
  if (!isPublicTableSession(sessionData)) return false;
  if (roomHasBotsOnlyPublicTables(roomData)) return false;
  return roomHasMixedPublicTables(roomData);
}

function logStaleReconcile(payload) {
  console.info("[mixed-stale-reconcile]", payload);
}

/**
 * Convert a mixed public table to bots-only fallback after grace expires.
 */
export async function convertMixedRoomToBotsOnly(db, { roomId, sessionId, nowMs = Date.now() }) {
  const roomRef = db.collection("rooms").doc(roomId);
  const sessionRef = sessionDocRef(db, roomId, sessionId);

  await db.runTransaction(async (tx) => {
    const roomSnap = await tx.get(roomRef);
    const sessionSnap = await tx.get(sessionRef);
    if (!roomSnap.exists || !sessionSnap.exists) return;
    const roomData = roomSnap.data() ?? {};
    const sessionData = sessionSnap.data() ?? {};
    if (!roomHasMixedPublicTables(roomData) || roomHasBotsOnlyPublicTables(roomData)) return;

    const features = { ...(roomData.features ?? {}) };
    features.mixedPublicTables = false;
    features.botsOnlyPublicTables = true;

    tx.update(roomRef, {
      features,
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.update(sessionRef, {
      queueMode: PLAY_NOW_QUEUE_MODE.BOTS_ONLY,
      mixedZeroActiveGraceStartedAt: FieldValue.delete(),
      mixedBotsOnlyFallbackAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  try {
    const { rebuildPublicTableIndex, clearPublicTableMatchmakingPool } = await import(
      "./publicTable.js"
    );
    await rebuildPublicTableIndex(db, roomId, sessionId);
    const roomSnap = await db.collection("rooms").doc(roomId).get();
    const sessionSnap = await sessionDocRef(db, roomId, sessionId).get();
    const roomData = roomSnap.data() ?? {};
    const sessionData = sessionSnap.data() ?? {};
    const buyIn = Math.max(
      1,
      Number(sessionData.buyInAmount ?? roomData?.bourreSettings?.buyInAmount) || 1000,
    );
    const ante = Math.max(
      1,
      Number(sessionData.handStake ?? roomData?.bourreSettings?.anteAmount) || 50,
    );
    await clearPublicTableMatchmakingPool(db, buyIn, ante);
  } catch (err) {
    console.warn("[mixed-stale-reconcile] index rebuild after bots-only fallback deferred", err?.message ?? err);
  }

  logStaleReconcile({
    phase: "bots_only_fallback",
    roomId,
    sessionId,
    nowMs,
  });

  return { converted: true };
}

/**
 * Start, clear, or expire the zero-active grace window on a mixed table.
 */
export async function applyMixedZeroActiveGrace(
  db,
  { roomId, sessionId, roomData, sessionData, scoreById, nowMs = Date.now() },
) {
  if (!shouldReconcileMixedTable(roomData, sessionData)) {
    return { status: "skipped", reason: "not_mixed_public_table" };
  }

  const activeLiveHumanCount = countActiveLiveHumans(sessionData, scoreById, nowMs);
  const grace = evaluateZeroActiveGraceState(sessionData, activeLiveHumanCount, nowMs);
  const sessionRef = sessionDocRef(db, roomId, sessionId);

  if (grace.shouldClearGrace) {
    await sessionRef.update({
      mixedZeroActiveGraceStartedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {
      status: "grace_cleared",
      activeLiveHumanCount,
      graceRemainingMs: null,
    };
  }

  if (grace.shouldStartGrace) {
    await sessionRef.update({
      mixedZeroActiveGraceStartedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {
      status: "grace_started",
      activeLiveHumanCount,
      graceRemainingMs: MIXED_ZERO_ACTIVE_GRACE_MS,
    };
  }

  if (grace.graceExpired) {
    await convertMixedRoomToBotsOnly(db, { roomId, sessionId, nowMs });
    return {
      status: "bots_only_fallback",
      activeLiveHumanCount,
      graceRemainingMs: 0,
    };
  }

  return {
    status: "grace_active",
    activeLiveHumanCount,
    graceRemainingMs: grace.graceRemainingMs,
  };
}

function buildReconcileResult(
  sessionData,
  scoreById,
  nowMs,
  joiningActorId,
  { status, reason, sitOut = [], evicted = [], botsOnlyGraveyard = false, grace = null } = {},
) {
  const activeLiveHumanCount = countActiveLiveHumans(sessionData, scoreById, nowMs);
  const otherActiveLiveHumanCount = joiningActorId
    ? countActiveLiveHumans(sessionData, scoreById, nowMs, {
        excludePlayerIds: [joiningActorId],
      })
    : activeLiveHumanCount;
  return {
    status,
    reason,
    activeLiveHumanCount,
    otherActiveLiveHumanCount,
    seatedHumanCount: listSeatedHumanIds(sessionData, scoreById).length,
    sitOut,
    evicted,
    botsOnlyGraveyard,
    grace,
  };
}

/**
 * Reconcile stale/inactive humans and zero-active grace before join or matchmaking routing.
 */
export async function reconcileMixedTableStaleMembers(
  db,
  {
    roomId,
    sessionId,
    trigger = "unknown",
    joiningActorId = null,
    roomData,
    sessionData,
    nowMs = Date.now(),
  },
) {
  const scoreSnap = await scoresCollection(db, roomId, sessionId).get();
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));

  if (!shouldReconcileMixedTable(roomData, sessionData)) {
    return buildReconcileResult(sessionData, scoreById, nowMs, joiningActorId, {
      status: "skipped",
      reason: "not_mixed_public_table",
    });
  }

  const staleBefore = evaluateIdlePolicyForSeatedHumans(sessionData, scoreById, nowMs);

  logStaleReconcile({
    phase: "detect",
    trigger,
    roomId,
    sessionId,
    joiningActorId,
    staleDetected: staleBefore,
    activeLiveHumanCountBefore: countActiveLiveHumans(sessionData, scoreById, nowMs),
  });

  const idleResult = await enforcePublicTableIdlePolicy(db, {
    roomId,
    sessionId,
    roomData,
    sessionData,
    nowMs,
    skipGrace: true,
  });

  let joinEvicted = [];
  const forceJoinRemoval = trigger === "join" || trigger === "matchmaking";
  if (forceJoinRemoval && staleBefore.remove.length) {
    const buyIn = resolveSessionBuyIn(sessionData, roomData?.bourreSettings ?? {});
    const removeResult = await applyIdleRemovals(db, {
      roomId,
      sessionId,
      playerIds: staleBefore.remove,
      sessionData,
      buyIn,
      nowMs,
      forceAtJoin: true,
    });
    joinEvicted = removeResult.removed;
    if (joinEvicted.length) {
      logStaleReconcile({
        phase: "evict",
        trigger,
        roomId,
        sessionId,
        joiningActorId,
        evicted: joinEvicted,
        reason: "join_time_stale_removal",
      });
    }
  }

  const postScoreSnap = await scoresCollection(db, roomId, sessionId).get();
  const postScoreById = Object.fromEntries(postScoreSnap.docs.map((d) => [d.id, d.data()]));
  const postSessionSnap = await sessionDocRef(db, roomId, sessionId).get();
  const postSession = postSessionSnap.data() ?? sessionData;
  const postRoomSnap = await db.collection("rooms").doc(roomId).get();
  const postRoomData = postRoomSnap.data() ?? roomData;

  const graceResult = await applyMixedZeroActiveGrace(db, {
    roomId,
    sessionId,
    roomData: postRoomData,
    sessionData: postSession,
    scoreById: postScoreById,
    nowMs,
  });

  const refreshedRoomSnap = await db.collection("rooms").doc(roomId).get();
  const refreshedRoomData = refreshedRoomSnap.data() ?? postRoomData;
  const refreshedSessionSnap = await sessionDocRef(db, roomId, sessionId).get();
  const refreshedSession = refreshedSessionSnap.data() ?? postSession;
  const refreshedScores = await scoresCollection(db, roomId, sessionId).get();
  const refreshedScoreById = Object.fromEntries(refreshedScores.docs.map((d) => [d.id, d.data()]));

  const activeLiveHumanCount = countActiveLiveHumans(refreshedSession, refreshedScoreById, nowMs);
  const postSeatedHumans = listSeatedHumanIds(refreshedSession, refreshedScoreById);
  const botsOnlyGraveyard =
    roomHasBotsOnlyPublicTables(refreshedRoomData) ||
    (postSeatedHumans.length === 0 && activeLiveHumanCount === 0);

  const evicted = [...new Set([...(idleResult.removed ?? []), ...joinEvicted])];
  const sitOut = idleResult.sitOut ?? [];

  logStaleReconcile({
    phase: "decision",
    trigger,
    roomId,
    sessionId,
    joiningActorId,
    activeLiveHumanCount,
    seatedHumanCount: postSeatedHumans.length,
    sitOut,
    evicted,
    botsOnlyGraveyard,
    grace: graceResult,
  });

  return {
    status: evicted.length || sitOut.length || graceResult.status !== "skipped" ? "applied" : "noop",
    activeLiveHumanCount,
    otherActiveLiveHumanCount: joiningActorId
      ? countActiveLiveHumans(refreshedSession, refreshedScoreById, nowMs, {
          excludePlayerIds: [joiningActorId],
        })
      : activeLiveHumanCount,
    seatedHumanCount: postSeatedHumans.length,
    sitOut,
    evicted,
    botsOnlyGraveyard,
    grace: graceResult,
  };
}
