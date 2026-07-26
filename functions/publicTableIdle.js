/**
 * Public-table idle policy — server-authoritative two-stage enforcement.
 *
 * Stage 1 (45s): sitOut on score row; skips enrollment/deal; unblocks progression.
 * Stage 2 (4min, hand boundary): evict seated human → fill bot; frees seat for queue.
 */

import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import {
  BOT_ROLE,
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PUBLIC_IDLE_REMOVAL_REASON,
  PUBLIC_IDLE_SIT_OUT_REASON,
  PUBLIC_TABLE_IDLE_REMOVAL_MS,
  PUBLIC_TABLE_IDLE_SIT_OUT_MS,
  publicTableIndexKey,
  isPublicVisibility,
  roomHasMixedPublicTables,
} from "./vendor/public-table-schema.js";
import {
  isMixedPublicTablesServerEnabled,
  isPublicTableSession,
} from "./vendor/public-table-rollout.js";
import { pickUniqueRobotNames } from "./vendor/play-now.js";
import { deriveScoreNet, resolveSessionBuyIn } from "./vendor/bourre-rules.js";
import { isHandoffWindow } from "./publicTableReplacement.js";
import { buildHandFlowSnapshot, HAND_FLOW_PHASE } from "./vendor/session-startup.js";
import { HAND_PHASE } from "./vendor/game-engine.js";

function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

export function timestampMs(value) {
  if (value == null) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return 0;
}

/** Resolve authoritative last-activity instant for idle policy. */
export function resolveLastActivityMs(scoreRow, nowMs = Date.now()) {
  const direct = timestampMs(scoreRow?.lastActivityTimestamp);
  if (direct > 0) return direct;
  const updated = timestampMs(scoreRow?.updatedAt);
  if (updated > 0) return updated;
  return nowMs;
}

/** @returns {'active'|'sit_out'|'remove'} */
export function classifyIdleStage(scoreRow, nowMs = Date.now()) {
  if (!scoreRow || isRobotPlayerId(scoreRow.playerId)) return "active";
  const idleMs = nowMs - resolveLastActivityMs(scoreRow, nowMs);
  if (idleMs >= PUBLIC_TABLE_IDLE_REMOVAL_MS) return "remove";
  if (idleMs >= PUBLIC_TABLE_IDLE_SIT_OUT_MS) return "sit_out";
  return "active";
}

export function listSeatedHumanIds(sessionData, scoreById) {
  const players = sessionData?.players ?? [];
  return players
    .map((p) => p?.playerId)
    .filter((pid) => pid && !isRobotPlayerId(pid) && scoreById[pid]);
}

export function evaluateIdlePolicyForSeatedHumans(sessionData, scoreById, nowMs = Date.now()) {
  const seatedHumans = listSeatedHumanIds(sessionData, scoreById);
  const sitOut = [];
  const remove = [];
  for (const pid of seatedHumans) {
    const row = { ...scoreById[pid], playerId: pid };
    const stage = classifyIdleStage(row, nowMs);
    if (stage === "remove") remove.push(pid);
    else if (stage === "sit_out" && row.sitOut !== true) sitOut.push(pid);
  }
  return { sitOut, remove, seatedHumans };
}

function sessionDocRef(db, roomId, sessionId) {
  return db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId);
}

function scoresCollection(db, roomId, sessionId) {
  return sessionDocRef(db, roomId, sessionId).collection("scores");
}

function privateHandDocRef(db, roomId, sessionId, playerId) {
  return sessionDocRef(db, roomId, sessionId).collection("privateHands").doc(playerId);
}

function matchQueueDocRef(db, userId) {
  return db.collection(MATCH_QUEUE_COLLECTION).doc(userId);
}

function createBotPlayerId() {
  return `bot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] };
}

/**
 * Patch enrollment when a player is idle-sit-out: decline + advance if blocking turn.
 * Pure — safe for unit tests.
 */
export function buildEnrollmentPatchForIdleSitOut(enrollment, playerId, dealContext, nowMs = Date.now()) {
  if (!enrollment?.active) return null;
  const ordered = enrollment.orderedPlayerIds ?? [];
  if (!ordered.includes(playerId)) return null;

  const enrolledIds = [...(enrollment.enrolledIds ?? [])];
  let declinedIds = [...(enrollment.declinedIds ?? [])];
  if (!declinedIds.includes(playerId) && !enrolledIds.includes(playerId)) {
    declinedIds.push(playerId);
  }

  const currentId = ordered[enrollment.currentIndex ?? 0];
  if (currentId !== playerId) {
    return {
      handEnrollment: {
        ...enrollment,
        enrolledIds,
        declinedIds,
      },
      currentHand: emptyPreDealHand(),
    };
  }

  const nextIndex = (enrollment.currentIndex ?? 0) + 1;
  if (nextIndex < ordered.length) {
    return {
      handEnrollment: {
        ...enrollment,
        enrolledIds,
        declinedIds,
        currentIndex: nextIndex,
        turnDeadlineMs: nowMs + 12_000,
      },
      currentHand: emptyPreDealHand(),
    };
  }

  if (enrolledIds.length < 2) {
    return {
      handEnrollment: {
        ...enrollment,
        enrolledIds: [],
        declinedIds: [],
        currentIndex: 0,
        turnDeadlineMs: nowMs + 12_000,
      },
      currentHand: emptyPreDealHand(),
    };
  }

  return {
    handEnrollment: {
      ...enrollment,
      enrolledIds,
      declinedIds,
      currentIndex: nextIndex,
      turnDeadlineMs: nowMs + 12_000,
    },
    currentHand: emptyPreDealHand(),
  };
}

export function shouldEnforcePublicTableIdle(roomData, sessionData) {
  if (!isMixedPublicTablesServerEnabled()) return false;
  if (!isPublicTableSession(sessionData)) return false;
  if (!isPublicVisibility(roomData) || !roomHasMixedPublicTables(roomData)) return false;
  return true;
}

/** Build Firestore patch for a successful activity touch (clears idle sit-out). */
export function buildActivityTouchPatch(scoreRow = {}) {
  const patch = {
    lastActivityTimestamp: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (scoreRow?.sitOut === true) {
    patch.sitOut = FieldValue.delete();
    patch.idleSitOutAt = FieldValue.delete();
    patch.idleSitOutReason = FieldValue.delete();
  }
  return patch;
}

/**
 * Record seated human activity on a public table (game moves + heartbeat).
 * Does not throw — safe to call from hot paths.
 */
export async function recordPublicTablePlayerActivity(db, { roomId, sessionId, playerId }) {
  if (!roomId || !sessionId || !playerId || isRobotPlayerId(playerId)) {
    return { ok: false, reason: "skipped" };
  }

  const sessionSnap = await sessionDocRef(db, roomId, sessionId).get();
  const sessionData = sessionSnap.data();
  if (!sessionData) return { ok: false, reason: "session_missing" };

  const roomSnap = await db.collection("rooms").doc(roomId).get();
  if (!shouldEnforcePublicTableIdle(roomSnap.data(), sessionData)) {
    return { ok: false, reason: "not_public_table" };
  }

  const scoreRef = scoresCollection(db, roomId, sessionId).doc(playerId);
  const scoreSnap = await scoreRef.get();
  if (!scoreSnap.exists) return { ok: false, reason: "not_seated" };

  const row = scoreSnap.data() ?? {};
  if (row.idleRemovedAt) return { ok: false, reason: "removed_rejoin_required" };

  await scoreRef.set(buildActivityTouchPatch(row), { merge: true });
  return { ok: true, sitOut: false };
}

/**
 * Record player activity; clears idle sit-out when player returns before removal.
 * Also piggybacks idle-policy enforcement for the whole table (launch-safe sweeper).
 */
export async function handleTouchPublicTableActivity(db, { roomId, sessionId, actorId }) {
  if (!roomId || !sessionId || !actorId) {
    throw new HttpsError("invalid-argument", "roomId, sessionId, and auth are required");
  }

  const { assertRoomMember } = await import("./gameHandlers.js");
  await assertRoomMember(db, roomId, actorId);

  const sessionSnap = await sessionDocRef(db, roomId, sessionId).get();
  const roomSnap = await db.collection("rooms").doc(roomId).get();
  const sessionData = sessionSnap.data() ?? {};
  const roomData = roomSnap.data() ?? {};

  if (!shouldEnforcePublicTableIdle(roomData, sessionData)) {
    return { ok: false, reason: "not_public_table" };
  }

  const touch = await recordPublicTablePlayerActivity(db, { roomId, sessionId, playerId: actorId });
  if (touch.reason === "removed_rejoin_required") return touch;

  const idlePolicy = await enforcePublicTableIdlePolicy(db, {
    roomId,
    sessionId,
    roomData,
    sessionData,
  }).catch((err) => {
    console.warn("[public-table-idle] enforce on touch skipped", err?.message ?? err);
    return null;
  });

  return { ...touch, idlePolicy: idlePolicy?.status ?? null };
}

async function applyIdleSitOuts(db, { roomId, sessionId, playerIds, nowMs }) {
  if (!playerIds.length) return { applied: [] };

  const sessionRef = sessionDocRef(db, roomId, sessionId);
  const applied = [];

  await db.runTransaction(async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) return;
    const sessionData = sessionSnap.data();
    const enrollment = sessionData.handEnrollment?.active
      ? sessionData.handEnrollment
      : sessionData.liveEnrollment?.active
        ? sessionData.liveEnrollment
        : null;

    let enrollmentPatch = null;
    for (const pid of playerIds) {
      const scoreRef = scoresCollection(db, roomId, sessionId).doc(pid);
      const scoreSnap = await tx.get(scoreRef);
      if (!scoreSnap.exists) continue;
      const row = scoreSnap.data();
      if (row.sitOut === true) continue;

      tx.set(
        scoreRef,
        {
          sitOut: true,
          idleSitOutAt: FieldValue.serverTimestamp(),
          idleSitOutReason: PUBLIC_IDLE_SIT_OUT_REASON,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      applied.push(pid);

      if (enrollment && !enrollmentPatch) {
        enrollmentPatch = buildEnrollmentPatchForIdleSitOut(enrollment, pid, null, nowMs);
      }
    }

    if (enrollmentPatch?.handEnrollment) {
      const sessionUpdate = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (sessionData.handEnrollment?.active) {
        sessionUpdate.handEnrollment = enrollmentPatch.handEnrollment;
      } else if (sessionData.liveEnrollment?.active) {
        sessionUpdate.liveEnrollment = enrollmentPatch.handEnrollment;
      }
      tx.update(sessionRef, sessionUpdate);
    }
  });

  return { applied };
}

async function applyIdleRemovals(db, { roomId, sessionId, playerIds, sessionData, buyIn, nowMs }) {
  if (!playerIds.length) return { removed: [] };

  const sessionRef = sessionDocRef(db, roomId, sessionId);
  const removed = [];

  await db.runTransaction(async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) return;
    const freshSession = sessionSnap.data();
    if (!isHandoffWindow(freshSession)) return;

    const scoreSnap = await tx.get(scoresCollection(db, roomId, sessionId));
    const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
    let players = [...(freshSession.players ?? [])];
    let tableOptInIds = [...(freshSession.tableOptInIds ?? [])];
    const takenNames = players.map((p) => p.displayName).filter(Boolean);

    for (const humanId of playerIds) {
      const seatIndex = players.findIndex((p) => p?.playerId === humanId);
      if (seatIndex < 0) continue;
      const humanRow = scoreById[humanId];
      if (!humanRow || isRobotPlayerId(humanId)) continue;

      const botId = createBotPlayerId();
      const [botName] = pickUniqueRobotNames(1, takenNames);
      takenNames.push(botName);

      tx.delete(scoresCollection(db, roomId, sessionId).doc(humanId));
      tx.delete(privateHandDocRef(db, roomId, sessionId, humanId));

      tx.set(
        scoresCollection(db, roomId, sessionId).doc(botId),
        {
          sessionId,
          roomId,
          playerId: botId,
          displayName: botName,
          bankroll: buyIn,
          tricksWon: 0,
          handsWon: 0,
          net: deriveScoreNet(buyIn, buyIn),
          total: 0,
          joinedAtHandCount: freshSession.handCount ?? 0,
          isRobot: true,
          botRole: BOT_ROLE.FILL,
          lastActivityTimestamp: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      players[seatIndex] = { playerId: botId, displayName: botName };
      tableOptInIds = tableOptInIds.map((id) => (id === humanId ? botId : id));

      const queueRef = matchQueueDocRef(db, humanId);
      const queueSnap = await tx.get(queueRef);
      if (queueSnap.exists) {
        tx.set(
          queueRef,
          {
            status: MATCH_QUEUE_STATUS.CANCELLED,
            cancelledAt: FieldValue.serverTimestamp(),
            cancelReason: PUBLIC_IDLE_REMOVAL_REASON,
            sessionKey: publicTableIndexKey(roomId, sessionId),
            roomId,
            sessionId,
          },
          { merge: true },
        );
      }

      removed.push(humanId);
    }

    if (!removed.length) return;

    const pendingJoins = { ...(freshSession.pendingJoins ?? {}) };
    for (const humanId of removed) {
      if (pendingJoins[humanId]) delete pendingJoins[humanId];
    }

    tx.update(sessionRef, {
      players,
      tableOptInIds,
      pendingJoins,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  if (removed.length) {
    try {
      const { rebuildPublicTableIndex } = await import("./publicTable.js");
      await rebuildPublicTableIndex(db, roomId, sessionId);
    } catch (err) {
      console.warn("[public-table-idle] index rebuild deferred", err?.message ?? err);
    }
  }

  return { removed };
}

/**
 * Enforce idle sit-out (anytime) and removal (hand boundary only).
 */
export async function enforcePublicTableIdlePolicy(
  db,
  { roomId, sessionId, roomData, sessionData, nowMs = Date.now() },
) {
  if (!shouldEnforcePublicTableIdle(roomData, sessionData)) {
    return { status: "skipped", reason: "not_enabled", sitOut: [], removed: [] };
  }

  const scoreSnap = await scoresCollection(db, roomId, sessionId).get();
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  const { sitOut, remove } = evaluateIdlePolicyForSeatedHumans(sessionData, scoreById, nowMs);

  const atHandoff = isHandoffWindow(sessionData);
  const toRemove = atHandoff ? remove : [];

  const sitOutResult = await applyIdleSitOuts(db, { roomId, sessionId, playerIds: sitOut, nowMs });

  let removeResult = { removed: [] };
  if (toRemove.length) {
    const buyIn = resolveSessionBuyIn(sessionData, roomData?.bourreSettings ?? {});
    removeResult = await applyIdleRemovals(db, {
      roomId,
      sessionId,
      playerIds: toRemove,
      sessionData,
      buyIn,
      nowMs,
    });
  }

  return {
    status: sitOutResult.applied.length || removeResult.removed.length ? "applied" : "noop",
    sitOut: sitOutResult.applied,
    removed: removeResult.removed,
    atHandoff,
  };
}

/**
 * When a sitOut human holds the current turn during draw/decision/play, return the auto-action.
 * Pre-deal enrollment sit-out is handled separately via isIdleSitOutBlockingEnrollment.
 *
 * @returns {{ action: 'draw_fold'|'decision_pass'|'play_bot', playerId: string, phase: string } | null}
 */
export function resolveIdleSitOutMidHandAction(sessionData, scoreById) {
  const snapshot = buildHandFlowSnapshot({ session: sessionData });
  const turnPlayerId = snapshot.turnPlayerId;
  if (!turnPlayerId || isRobotPlayerId(turnPlayerId)) return null;

  const row = scoreById[turnPlayerId];
  if (row?.sitOut !== true) return null;

  if (snapshot.pagatDecisionActive && snapshot.handPhase === HAND_PHASE.DECISION) {
    const decision = sessionData?.currentHand?.handDecision;
    const playing = decision?.playingIds ?? [];
    const passed = decision?.passedIds ?? [];
    if (playing.includes(turnPlayerId) || passed.includes(turnPlayerId)) return null;
    return { action: "decision_pass", playerId: turnPlayerId, phase: "decision" };
  }

  if (snapshot.phase === HAND_FLOW_PHASE.ENROLLMENT && !snapshot.pagatDecisionActive) {
    return null;
  }

  if (snapshot.phase === HAND_FLOW_PHASE.DRAW) {
    const hand = sessionData?.currentHand ?? {};
    if (!hand.participantIds?.includes(turnPlayerId)) return null;
    if (hand.turnPlayerId !== turnPlayerId) return null;
    const drawDone = hand.drawCompletedIds ?? [];
    if (drawDone.includes(turnPlayerId)) return null;
    return { action: "draw_fold", playerId: turnPlayerId, phase: "draw" };
  }

  if (snapshot.phase === HAND_FLOW_PHASE.PLAY) {
    if (snapshot.handComplete) return null;
    const hand = sessionData?.currentHand ?? {};
    if (!hand.participantIds?.includes(turnPlayerId)) return null;
    if (hand.turnPlayerId !== turnPlayerId) return null;
    return { action: "play_bot", playerId: turnPlayerId, phase: "play" };
  }

  return null;
}

/** True when a seated human blocks enrollment progression on their turn. */
export function isIdleSitOutBlockingEnrollment(enrollment, scoreById, nowMs = Date.now()) {
  if (!enrollment?.active) return false;
  const currentId = enrollment.orderedPlayerIds?.[enrollment.currentIndex ?? 0];
  if (!currentId || isRobotPlayerId(currentId)) return false;
  const row = scoreById[currentId];
  if (row?.sitOut === true) return true;
  return classifyIdleStage({ ...row, playerId: currentId }, nowMs) === "sit_out";
}
