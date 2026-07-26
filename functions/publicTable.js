/**
 * Server-authoritative public mixed-table matchmaking (Phase 3).
 *
 * Callable handlers: find-or-create, join, leave.
 * publicTableIndex is derived — session/scores/pendingJoins/matchQueue are source of truth.
 *
 * Phase 5: hand-boundary bot replacement — see publicTableReplacement.js.
 */

import { HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import {
  BOT_ROLE,
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  PUBLIC_TABLE_DEFAULT_TARGET_SEATS,
  PUBLIC_TABLE_INDEX_COLLECTION,
  PUBLIC_TABLE_MAX_SEATS,
  PUBLIC_TABLE_MIN_SEATS,
  ROOM_VISIBILITY,
  publicTableIndexKey,
  isPublicVisibility,
  roomHasMixedPublicTables,
} from "./vendor/public-table-schema.js";
import {
  isMixedPublicTablesServerEnabled,
  isPublicTableSession,
} from "./vendor/public-table-rollout.js";
import {
  PLAY_NOW_ANTE,
  PLAY_NOW_BUY_IN,
  pickUniqueRobotNames,
  pickVacationRoomName,
} from "./vendor/play-now.js";
import { buildSessionBuyInMoney } from "./vendor/money-persistence.js";
import { MONEY_ENGINE_VERSION } from "./vendor/bourre-rules.js";
import {
  isValidSessionNamePool,
  nextAvailableSessionName,
  randomizePresetOrder,
} from "./vendor/session-presets.js";
import { isRobotPlayerId, scoresCol, sessionRef } from "./gameHandlers.js";

const ACTIVE_QUEUE_STATUSES = new Set([
  MATCH_QUEUE_STATUS.QUEUED,
  MATCH_QUEUE_STATUS.SPECTATING,
  MATCH_QUEUE_STATUS.SEATED,
]);

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const DEFAULT_HOUSE_RULES = {
  ante: "Equal ante each hand (set in room Bourré settings)",
  forcedPlay: "Dealer must play when turned trump is an ace",
  ties: "Tie for most tricks — pot carries to next deal; tied leaders skip that ante; no split",
  dealing: "5 cards each; dealer's last card face up is trump · draw up to 5 (2–5 players)",
};

// ---------------------------------------------------------------------------
// Validation + pure helpers (exported for tests)
// ---------------------------------------------------------------------------

export function assertJoinIdFormat(joinId) {
  if (typeof joinId !== "string" || !joinId.trim()) {
    throw new HttpsError("invalid-argument", "joinId is required");
  }
  const trimmed = joinId.trim();
  if (trimmed.length > 128) {
    throw new HttpsError("invalid-argument", "joinId is too long");
  }
  return trimmed;
}

export function clampTargetSeatCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return PUBLIC_TABLE_DEFAULT_TARGET_SEATS;
  return Math.min(
    PUBLIC_TABLE_MAX_SEATS,
    Math.max(PUBLIC_TABLE_MIN_SEATS, Math.floor(n)),
  );
}

export function normalizeStakes({ buyInAmount, anteAmount } = {}) {
  const buyIn = Math.max(1, Number(buyInAmount) || PLAY_NOW_BUY_IN);
  const ante = Math.max(1, Number(anteAmount) || PLAY_NOW_ANTE);
  return { buyInAmount: buyIn, anteAmount: ante };
}

export function stakesKey(buyInAmount, anteAmount) {
  return `${buyInAmount}_${anteAmount}`;
}

export function isActiveQueueStatus(status) {
  return ACTIVE_QUEUE_STATUSES.has(status);
}

/** True when a live hand is in progress (draw/play/reveal/decision or dealt participants). */
export function isSessionInHand(sessionData) {
  if (!sessionData || sessionData.status === "final") return false;
  const hand = sessionData.currentHand ?? {};
  const phase = hand.phase ?? null;
  if (phase === "draw" || phase === "play" || phase === "reveal" || phase === "decision") {
    return true;
  }
  return (hand.participantIds?.length ?? 0) > 0;
}

export function deriveIndexStatus(sessionData) {
  if (!sessionData || sessionData.status === "final") return "closed";
  if (isSessionInHand(sessionData)) return "in_hand";
  return "open";
}

/**
 * Build derived publicTableIndex fields from authoritative docs.
 * @param {object} params
 */
export function computePublicTableIndexDoc({
  roomId,
  sessionId,
  roomData,
  sessionData,
  scoreRows = [],
  pendingJoins = {},
}) {
  const targetSeatCount = clampTargetSeatCount(
    roomData?.targetSeatCount ?? PUBLIC_TABLE_DEFAULT_TARGET_SEATS,
  );
  let realPlayerCount = 0;
  let botFillCount = 0;
  for (const row of scoreRows) {
    const id = row.playerId ?? row.id;
    if (!id || row.spectator === true) continue;
    if (isRobotPlayerId(id)) {
      if (row.botRole === BOT_ROLE.FILL) botFillCount += 1;
    } else {
      realPlayerCount += 1;
    }
  }
  const seatedCount = realPlayerCount + botFillCount;
  const openSeats = Math.max(0, targetSeatCount - seatedCount);
  const spectatorCount = Object.values(pendingJoins ?? {}).filter(
    (entry) => entry?.status === PENDING_JOIN_STATUS.SPECTATING,
  ).length;
  const buyInAmount = Math.max(
    1,
    Number(sessionData?.buyInAmount ?? roomData?.bourreSettings?.buyInAmount) || PLAY_NOW_BUY_IN,
  );
  const anteAmount = Math.max(
    1,
    Number(sessionData?.handStake ?? roomData?.bourreSettings?.anteAmount) || PLAY_NOW_ANTE,
  );
  return {
    roomId,
    sessionId,
    sessionKey: publicTableIndexKey(roomId, sessionId),
    targetSeatCount,
    openSeats,
    realPlayerCount,
    botFillCount,
    spectatorCount,
    status: deriveIndexStatus(sessionData),
    buyInAmount,
    anteAmount,
    stakesKey: stakesKey(buyInAmount, anteAmount),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/**
 * Rank joinable public tables: more humans, fewer open seats, fresher updatedAt.
 * @param {object[]} candidates
 */
export function rankPublicTableCandidates(candidates) {
  return [...candidates].sort((a, b) => {
    const realDiff = (b.realPlayerCount ?? 0) - (a.realPlayerCount ?? 0);
    if (realDiff !== 0) return realDiff;
    const openDiff = (a.openSeats ?? 0) - (b.openSeats ?? 0);
    if (openDiff !== 0) return openDiff;
    const aTs = a.updatedAt?.toMillis?.() ?? a.updatedAt ?? 0;
    const bTs = b.updatedAt?.toMillis?.() ?? b.updatedAt ?? 0;
    return bTs - aTs;
  });
}

/**
 * Whether matchmaking may route a new player to this table.
 * Seated capacity uses openSeats; spectators may queue when humans are already present.
 */
export function isJoinableIndexDoc(indexDoc) {
  if (!indexDoc || indexDoc.status === "closed") return false;
  if ((indexDoc.openSeats ?? 0) > 0) return true;
  return (indexDoc.realPlayerCount ?? 0) > 0;
}

export function buildPublicTableResult({
  mode,
  status,
  roomId,
  sessionId,
  joinId,
  targetSeatCount,
  realPlayerCount,
  botFillCount,
  openSeats,
  spectatorCount = 0,
}) {
  return {
    ok: true,
    mode,
    status,
    roomId,
    sessionId,
    joinId,
    targetSeatCount,
    realPlayerCount,
    botFillCount,
    openSeats,
    spectatorCount,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function assertServerPublicTablesEnabled() {
  if (!isMixedPublicTablesServerEnabled()) {
    throw new HttpsError(
      "failed-precondition",
      "Mixed public tables are disabled.",
    );
  }
}

function memberDocId(roomId, uid) {
  return `${roomId}_${uid}`;
}

function generateInviteCode() {
  let s = "";
  for (let i = 0; i < 6; i += 1) {
    s += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
  }
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}

function createBotPlayerId() {
  return `bot_${Math.random().toString(36).slice(2, 10)}`;
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] };
}

function matchQueueRef(db, userId) {
  return db.collection(MATCH_QUEUE_COLLECTION).doc(userId);
}

function publicTableIndexRef(db, roomId, sessionId) {
  return db.collection(PUBLIC_TABLE_INDEX_COLLECTION).doc(publicTableIndexKey(roomId, sessionId));
}

async function loadUserDisplayName(db, userId, fallback = "Player") {
  const userSnap = await db.collection("users").doc(userId).get();
  const name = userSnap.data()?.displayName?.trim();
  if (name) return name;
  const playerSnap = await db.collection("players").doc(userId).get();
  const playerName = playerSnap.data()?.displayName?.trim();
  return playerName || fallback;
}

async function loadMatchQueue(db, userId) {
  const snap = await matchQueueRef(db, userId).get();
  return snap.exists ? { ref: snap.ref, data: snap.data() } : null;
}

function assertCompatibleActiveQueue(queueData, joinId) {
  if (!queueData || !isActiveQueueStatus(queueData.status)) return null;
  if (queueData.activeJoinId === joinId) {
    return queueData;
  }
  throw new HttpsError(
    "already-exists",
    "You already have an active public table queue with a different joinId.",
  );
}

async function loadAuthoritativeTableContext(db, roomId, sessionId) {
  const roomSnap = await db.collection("rooms").doc(roomId).get();
  if (!roomSnap.exists) {
    throw new HttpsError("not-found", "Room not found");
  }
  const roomData = roomSnap.data();
  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  if (!sessionSnap.exists) {
    throw new HttpsError("not-found", "Session not found");
  }
  const sessionData = sessionSnap.data();
  const scoresSnap = await scoresCol(db, roomId, sessionId).get();
  const scoreRows = scoresSnap.docs.map((d) => ({ id: d.id, playerId: d.id, ...d.data() }));
  return {
    roomData,
    sessionData,
    scoreRows,
    pendingJoins: sessionData.pendingJoins ?? {},
  };
}

function assertPublicTableEligible(roomData, sessionData) {
  if (!isPublicVisibility(roomData) || !roomHasMixedPublicTables(roomData)) {
    throw new HttpsError("failed-precondition", "Not a public mixed table.");
  }
  if (!isPublicTableSession(sessionData)) {
    throw new HttpsError("failed-precondition", "Session is not a public table.");
  }
  if (sessionData.status === "final") {
    throw new HttpsError("failed-precondition", "Session is closed.");
  }
}

async function rebuildPublicTableIndexFromSource(db, roomId, sessionId) {
  const ctx = await loadAuthoritativeTableContext(db, roomId, sessionId);
  assertPublicTableEligible(ctx.roomData, ctx.sessionData);
  const indexDoc = computePublicTableIndexDoc({
    roomId,
    sessionId,
    roomData: ctx.roomData,
    sessionData: ctx.sessionData,
    scoreRows: ctx.scoreRows,
    pendingJoins: ctx.pendingJoins,
  });
  await publicTableIndexRef(db, roomId, sessionId).set(indexDoc, { merge: true });
  return indexDoc;
}

/** Phase 3 export — rebuild derived index from source-of-truth docs. */
export async function rebuildPublicTableIndex(db, roomId, sessionId) {
  return rebuildPublicTableIndexFromSource(db, roomId, sessionId);
}

export { applyPendingReplacements } from "./publicTableReplacement.js";

async function ensureRoomMembership(db, roomId, userId, displayName) {
  const ref = db.collection("roomMembers").doc(memberDocId(roomId, userId));
  const snap = await ref.get();
  if (snap.exists) return;
  await ref.set({
    roomId,
    userId,
    displayName,
    role: "player",
    joinedAt: FieldValue.serverTimestamp(),
  });
}

async function attemptJoinJoinableCandidates(
  db,
  { actorId, displayName, joinId, buyInAmount, anteAmount },
) {
  const candidates = await queryJoinableIndexCandidates(db, buyInAmount, anteAmount);
  for (const candidate of candidates) {
    const verified = await verifyCandidateFromSource(db, candidate);
    if (!verified) {
      await rebuildPublicTableIndexFromSource(db, candidate.roomId, candidate.sessionId).catch(
        () => {},
      );
      continue;
    }
    try {
      return await joinPublicTableAsSpectator(db, {
        actorId,
        displayName,
        joinId,
        roomId: candidate.roomId,
        sessionId: candidate.sessionId,
        mode: "joined-existing",
      });
    } catch (err) {
      if (err?.code === "already-exists") throw err;
      continue;
    }
  }
  return null;
}

async function queryJoinableIndexCandidates(db, buyInAmount, anteAmount) {
  const key = stakesKey(buyInAmount, anteAmount);
  const snap = await db
    .collection(PUBLIC_TABLE_INDEX_COLLECTION)
    .where("stakesKey", "==", key)
    .limit(32)
    .get();
  const candidates = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!isJoinableIndexDoc(data)) continue;
    candidates.push({ id: doc.id, ...data });
  }
  return rankPublicTableCandidates(candidates);
}

async function verifyCandidateFromSource(db, candidate) {
  try {
    const ctx = await loadAuthoritativeTableContext(db, candidate.roomId, candidate.sessionId);
    assertPublicTableEligible(ctx.roomData, ctx.sessionData);
    const indexDoc = computePublicTableIndexDoc({
      roomId: candidate.roomId,
      sessionId: candidate.sessionId,
      roomData: ctx.roomData,
      sessionData: ctx.sessionData,
      scoreRows: ctx.scoreRows,
      pendingJoins: ctx.pendingJoins,
    });
    if (!isJoinableIndexDoc(indexDoc)) return null;
    if (indexDoc.stakesKey !== candidate.stakesKey) return null;
    return { ctx, indexDoc };
  } catch {
    return null;
  }
}

/**
 * Phase 3: all non-creator joins are spectating/pending only — no score row, no session.players.
 */
async function joinPublicTableAsSpectator(
  db,
  {
    actorId,
    displayName,
    joinId,
    roomId,
    sessionId,
    mode = "joined-existing",
  },
) {
  const sessionKey = publicTableIndexKey(roomId, sessionId);
  const ctx = await loadAuthoritativeTableContext(db, roomId, sessionId);
  assertPublicTableEligible(ctx.roomData, ctx.sessionData);

  const existingPending = ctx.pendingJoins[actorId];
  if (existingPending?.joinId === joinId && existingPending?.status === PENDING_JOIN_STATUS.SPECTATING) {
    const indexDoc = await rebuildPublicTableIndexFromSource(db, roomId, sessionId);
    return buildPublicTableResult({
      mode,
      status: "spectating",
      roomId,
      sessionId,
      joinId,
      targetSeatCount: indexDoc.targetSeatCount,
      realPlayerCount: indexDoc.realPlayerCount,
      botFillCount: indexDoc.botFillCount,
      openSeats: indexDoc.openSeats,
      spectatorCount: indexDoc.spectatorCount,
    });
  }

  if (ctx.scoreRows.some((row) => row.playerId === actorId && row.spectator !== true)) {
    throw new HttpsError("already-exists", "You are already seated at this table.");
  }

  await ensureRoomMembership(db, roomId, actorId, displayName);

  const handCount = ctx.sessionData.handCount ?? 0;
  const pendingEntry = {
    joinId,
    status: PENDING_JOIN_STATUS.SPECTATING,
    queuedAtHandCount: handCount,
    displayName,
    queuedAt: FieldValue.serverTimestamp(),
  };

  await db.runTransaction(async (tx) => {
    const queueSnap = await tx.get(matchQueueRef(db, actorId));
    if (queueSnap.exists) {
      const q = queueSnap.data();
      if (isActiveQueueStatus(q.status) && q.activeJoinId !== joinId) {
        throw new HttpsError(
          "already-exists",
          "You already have an active public table queue with a different joinId.",
        );
      }
      if (
        isActiveQueueStatus(q.status) &&
        q.activeJoinId === joinId &&
        q.sessionKey === sessionKey &&
        q.status === MATCH_QUEUE_STATUS.SPECTATING
      ) {
        return;
      }
    }

    const sessionRefDoc = sessionRef(db, roomId, sessionId);
    const sessionSnap = await tx.get(sessionRefDoc);
    if (!sessionSnap.exists) {
      throw new HttpsError("not-found", "Session not found");
    }
    const sessionData = sessionSnap.data();
    const pendingJoins = { ...(sessionData.pendingJoins ?? {}) };
    pendingJoins[actorId] = pendingEntry;

    tx.set(
      matchQueueRef(db, actorId),
      {
        sessionKey,
        roomId,
        sessionId,
        activeJoinId: joinId,
        status: MATCH_QUEUE_STATUS.SPECTATING,
        requestedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    tx.update(sessionRefDoc, {
      pendingJoins,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  const indexDoc = await rebuildPublicTableIndexFromSource(db, roomId, sessionId);
  return buildPublicTableResult({
    mode,
    status: "spectating",
    roomId,
    sessionId,
    joinId,
    targetSeatCount: indexDoc.targetSeatCount,
    realPlayerCount: indexDoc.realPlayerCount,
    botFillCount: indexDoc.botFillCount,
    openSeats: indexDoc.openSeats,
    spectatorCount: indexDoc.spectatorCount,
  });
}

async function createPublicTable(
  db,
  { actorId, displayName, joinId, targetSeatCount, buyInAmount, anteAmount },
) {
  const existingQueue = await loadMatchQueue(db, actorId);
  if (
    existingQueue?.data &&
    isActiveQueueStatus(existingQueue.data.status) &&
    existingQueue.data.activeJoinId === joinId &&
    existingQueue.data.status === MATCH_QUEUE_STATUS.SEATED &&
    existingQueue.data.roomId &&
    existingQueue.data.sessionId
  ) {
    const { roomId, sessionId } = existingQueue.data;
    const indexDoc = await rebuildPublicTableIndexFromSource(db, roomId, sessionId);
    return buildPublicTableResult({
      mode: "created",
      status: "seated",
      roomId,
      sessionId,
      joinId,
      targetSeatCount: indexDoc.targetSeatCount,
      realPlayerCount: indexDoc.realPlayerCount,
      botFillCount: indexDoc.botFillCount,
      openSeats: indexDoc.openSeats,
      spectatorCount: indexDoc.spectatorCount,
    });
  }

  const roomRef = db.collection("rooms").doc();
  const sessionRefDoc = roomRef.collection("sessions").doc();
  const roomId = roomRef.id;
  const sessionId = sessionRefDoc.id;
  const sessionKey = publicTableIndexKey(roomId, sessionId);
  const inviteCode = generateInviteCode();
  const botCount = Math.max(0, targetSeatCount - 1);
  const botNames = pickUniqueRobotNames(botCount, [displayName]);
  const botIds = botNames.map(() => createBotPlayerId());

  const rosterPlayers = [
    { playerId: actorId, displayName },
    ...botIds.map((id, i) => ({ playerId: id, displayName: botNames[i] })),
  ];
  const sortedIds = rosterPlayers.map((p) => p.playerId);
  const buyInMoney = buildSessionBuyInMoney(sessionId, [actorId], buyInAmount);

  await db.runTransaction(async (tx) => {
    const queueSnap = await tx.get(matchQueueRef(db, actorId));
    if (queueSnap.exists) {
      const q = queueSnap.data();
      if (isActiveQueueStatus(q.status) && q.activeJoinId !== joinId) {
        throw new HttpsError(
          "already-exists",
          "You already have an active public table queue with a different joinId.",
        );
      }
      if (
        isActiveQueueStatus(q.status) &&
        q.activeJoinId === joinId &&
        q.status === MATCH_QUEUE_STATUS.SEATED &&
        q.sessionKey
      ) {
        return;
      }
    }

    tx.set(roomRef, {
      inviteCode,
      ownerId: actorId,
      name: pickVacationRoomName([]),
      houseRules: DEFAULT_HOUSE_RULES,
      bourreSettings: {
        buyInAmount,
        anteAmount,
        limEnabled: false,
        rebuyEnabled: false,
      },
      sessionNamePool: randomizePresetOrder(),
      claimedSessionNames: [],
      status: "open",
      visibility: ROOM_VISIBILITY.PUBLIC,
      features: { mixedPublicTables: true },
      targetSeatCount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(db.collection("inviteLookups").doc(inviteCode), {
      roomId,
      ownerId: actorId,
      createdAt: FieldValue.serverTimestamp(),
    });

    tx.set(db.collection("roomMembers").doc(memberDocId(roomId, actorId)), {
      roomId,
      userId: actorId,
      displayName,
      role: "owner",
      joinedAt: FieldValue.serverTimestamp(),
    });

    const pool = randomizePresetOrder();
    const sessionName = nextAvailableSessionName(pool, []) ?? "Public Table";

    tx.set(sessionRefDoc, {
      roomId,
      sessionName,
      status: "in_progress",
      handCount: 0,
      buyInAmount,
      handStake: anteAmount,
      handStakeLocked: false,
      limEnabled: false,
      carryOverPot: 0,
      moneyEngineVersion: MONEY_ENGINE_VERSION,
      moneySequence: buyInMoney.newEvents.length,
      dealerId: actorId,
      publicTable: true,
      pendingJoins: {},
      currentHand: emptyPreDealHand(),
      rounds: 0,
      players: rosterPlayers.map((p) => ({
        playerId: p.playerId,
        displayName: p.displayName,
      })),
      notes: "",
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.update(roomRef, {
      claimedSessionNames: [sessionName],
      sessionNamePool: pool,
    });

    tx.set(scoresCol(db, roomId, sessionId).doc(actorId), {
      sessionId,
      roomId,
      playerId: actorId,
      displayName,
      bankroll: buyInAmount,
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
      joinedAtHandCount: 0,
      lastActivityTimestamp: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    for (let i = 0; i < botIds.length; i += 1) {
      const botId = botIds[i];
      tx.set(scoresCol(db, roomId, sessionId).doc(botId), {
        sessionId,
        roomId,
        playerId: botId,
        displayName: botNames[i],
        bankroll: buyInAmount,
        tricksWon: 0,
        handsWon: 0,
        net: 0,
        total: 0,
        joinedAtHandCount: 0,
        isRobot: true,
        botRole: BOT_ROLE.FILL,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    for (const event of buyInMoney.newEvents) {
      tx.set(sessionRefDoc.collection("moneyEvents").doc(event.eventId), {
        ...event,
        metadata: event.metadata || {},
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    tx.set(matchQueueRef(db, actorId), {
      sessionKey,
      roomId,
      sessionId,
      activeJoinId: joinId,
      status: MATCH_QUEUE_STATUS.SEATED,
      requestedAt: FieldValue.serverTimestamp(),
    });
  });

  const indexDoc = await rebuildPublicTableIndexFromSource(db, roomId, sessionId);
  return buildPublicTableResult({
    mode: "created",
    status: "seated",
    roomId,
    sessionId,
    joinId,
    targetSeatCount: indexDoc.targetSeatCount,
    realPlayerCount: indexDoc.realPlayerCount,
    botFillCount: indexDoc.botFillCount,
    openSeats: indexDoc.openSeats,
    spectatorCount: indexDoc.spectatorCount,
  });
}

// ---------------------------------------------------------------------------
// Callable handlers
// ---------------------------------------------------------------------------

export async function handleFindOrCreatePublicTable(db, data) {
  assertServerPublicTablesEnabled();
  const actorId = data?.actorId;
  if (!actorId) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }
  const joinId = assertJoinIdFormat(data?.joinId);
  const targetSeatCount = clampTargetSeatCount(data?.targetSeatCount);
  const { buyInAmount, anteAmount } = normalizeStakes(data);
  const displayName =
    (typeof data?.displayName === "string" && data.displayName.trim()) ||
    (await loadUserDisplayName(db, actorId));

  const existingQueue = await loadMatchQueue(db, actorId);
  if (existingQueue?.data) {
    const compatible = assertCompatibleActiveQueue(existingQueue.data, joinId);
    if (compatible) {
      const { roomId, sessionId, status } = compatible;
      if (roomId && sessionId) {
        const indexDoc = await rebuildPublicTableIndexFromSource(db, roomId, sessionId);
        return buildPublicTableResult({
          mode: compatible.status === MATCH_QUEUE_STATUS.SEATED ? "created" : "joined-existing",
          status: compatible.status === MATCH_QUEUE_STATUS.SEATED ? "seated" : "spectating",
          roomId,
          sessionId,
          joinId,
          targetSeatCount: indexDoc.targetSeatCount,
          realPlayerCount: indexDoc.realPlayerCount,
          botFillCount: indexDoc.botFillCount,
          openSeats: indexDoc.openSeats,
          spectatorCount: indexDoc.spectatorCount,
        });
      }
    }
  }

  const joinArgs = { actorId, displayName, joinId, buyInAmount, anteAmount };
  const joined = await attemptJoinJoinableCandidates(db, joinArgs);
  if (joined) return joined;

  // Race: a concurrent Play Now may have created a table after our first index read.
  const lateJoined = await attemptJoinJoinableCandidates(db, joinArgs);
  if (lateJoined) return lateJoined;

  return createPublicTable(db, {
    actorId,
    displayName,
    joinId,
    targetSeatCount,
    buyInAmount,
    anteAmount,
  });
}

export async function handleJoinPublicTable(db, data) {
  assertServerPublicTablesEnabled();
  const actorId = data?.actorId;
  if (!actorId) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }
  const joinId = assertJoinIdFormat(data?.joinId);
  const roomId = typeof data?.roomId === "string" ? data.roomId.trim() : "";
  const sessionId = typeof data?.sessionId === "string" ? data.sessionId.trim() : "";
  if (!roomId || !sessionId) {
    throw new HttpsError("invalid-argument", "roomId and sessionId are required");
  }

  const displayName =
    (typeof data?.displayName === "string" && data.displayName.trim()) ||
    (await loadUserDisplayName(db, actorId));

  const existingQueue = await loadMatchQueue(db, actorId);
  if (existingQueue?.data) {
    assertCompatibleActiveQueue(existingQueue.data, joinId);
    const q = existingQueue.data;
    if (
      isActiveQueueStatus(q.status) &&
      q.activeJoinId === joinId &&
      q.roomId === roomId &&
      q.sessionId === sessionId
    ) {
      const indexDoc = await rebuildPublicTableIndexFromSource(db, roomId, sessionId);
      return buildPublicTableResult({
        mode: "joined-existing",
        status: q.status === MATCH_QUEUE_STATUS.SEATED ? "seated" : "spectating",
        roomId,
        sessionId,
        joinId,
        targetSeatCount: indexDoc.targetSeatCount,
        realPlayerCount: indexDoc.realPlayerCount,
        botFillCount: indexDoc.botFillCount,
        openSeats: indexDoc.openSeats,
        spectatorCount: indexDoc.spectatorCount,
      });
    }
  }

  return joinPublicTableAsSpectator(db, {
    actorId,
    displayName,
    joinId,
    roomId,
    sessionId,
    mode: "joined-existing",
  });
}

export async function handleLeavePublicTable(db, data) {
  assertServerPublicTablesEnabled();
  const actorId = data?.actorId;
  if (!actorId) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const queue = await loadMatchQueue(db, actorId);
  if (!queue?.data || !isActiveQueueStatus(queue.data.status)) {
    return { ok: true, cleared: false };
  }

  const { roomId, sessionId, status } = queue.data;

  await db.runTransaction(async (tx) => {
    const queueSnap = await tx.get(matchQueueRef(db, actorId));
    if (!queueSnap.exists) return;
    const q = queueSnap.data();
    if (!isActiveQueueStatus(q.status)) return;

    let sessionRefDoc = null;
    let pendingJoinsUpdate = null;
    if (q.roomId && q.sessionId && q.status === MATCH_QUEUE_STATUS.SPECTATING) {
      sessionRefDoc = sessionRef(db, q.roomId, q.sessionId);
      const sessionSnap = await tx.get(sessionRefDoc);
      if (sessionSnap.exists) {
        const pendingJoins = { ...(sessionSnap.data().pendingJoins ?? {}) };
        if (pendingJoins[actorId]) {
          delete pendingJoins[actorId];
          pendingJoinsUpdate = pendingJoins;
        }
      }
    }

    tx.delete(matchQueueRef(db, actorId));

    if (sessionRefDoc && pendingJoinsUpdate) {
      tx.update(sessionRefDoc, {
        pendingJoins: pendingJoinsUpdate,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  });

  if (roomId && sessionId && status === MATCH_QUEUE_STATUS.SPECTATING) {
    await rebuildPublicTableIndexFromSource(db, roomId, sessionId).catch(() => {});
  }

  return { ok: true, cleared: true, roomId: roomId ?? null, sessionId: sessionId ?? null };
}
