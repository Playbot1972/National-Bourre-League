// firestore.js — Firestore data models + persistence for private Bourré rooms.
//
// Modular vanilla JS. Loads the Firestore SDK from the gstatic CDN and reuses
// the shared FirebaseApp created in auth.js.
//
// ---------------------------------------------------------------------------
// DATA MODEL (simple + scalable)
// ---------------------------------------------------------------------------
// users/{uid}
//   { displayName, email, photoURL, createdAt, updatedAt }
//
// rooms/{roomId}
//   { inviteCode, ownerId, name, houseRules: { ante, forcedPlay, ties, dealing },
//     status: "open" | "active" | "closed", createdAt }
//
// roomMembers/{roomId}_{uid}        (flat collection for easy membership queries)
//   { roomId, userId, displayName, role: "owner" | "player", joinedAt }
//
// inviteLookups/{inviteCode}          (doc id = normalized code, e.g. ABC-D23)
//   { roomId, ownerId, createdAt }
//
// rooms/{roomId}/sessions/{sessionId}     (sessions are a subcollection of room)
//   { roomId, status: "in_progress" | "final", handCount, handStake, handStakeLocked,
//     players: [{ playerId, displayName }],
//     notes,                          // informational ONLY — never money
//     totals: { byPlayer: { [playerId]: tricks }, netByPlayer: { [playerId]: net }, tricks },
//     createdAt, updatedAt }
//
// rooms/{roomId}/sessions/{sessionId}/scores/{playerId}   (one row per player)
//   { sessionId, roomId, playerId, displayName, tricksWon, handsWon, net, total,
//     updatedAt }
//
//   rooms/{roomId}/sessions/{sessionId}/hands/{handId}
//     per-hand ledger (informational)
//
//   rooms/{roomId}/sessions/{sessionId}/privateHands/{playerId}
//     { cards: [{ rank, suit }] } — owner-read only (see firestore.rules)
//
// Public live hand state: session.currentHand (phase, trump, tricks — no hidden cards).
// Play mutations: Cloud Functions (gameSubmitDraw, gamePlayCard, …) — see game-functions.js.
// Deal engine: src/game/ → npm run build:game → docs/game-engine.js
//
// Sessions + scores are nested UNDER the room so security rules can authorize
// them by the {roomId} path wildcard. (Top-level collections with a roomId
// field cannot be used in `list` rules — Firestore evaluates list/query rules
// without per-document `resource.data`, so `resource.data.roomId` is undefined
// there. Subcollections avoid that entirely and scale cleanly.)
//
// NOTE: `notes`, `handStake`, `net`, `tricksWon`, and `total` are for scorekeeping and
// bragging rights only. Nothing in this schema represents currency, wallets, or
// money transfers, and the security rules below intentionally keep it that way.
//
// ---------------------------------------------------------------------------
// SAMPLE SECURITY RULES (see firestore.rules for the full, deployable file)
// ---------------------------------------------------------------------------
//   match /rooms/{roomId} {
//     allow read:   if isMember(roomId);
//     allow create: if request.auth.uid == request.resource.data.ownerId;
//     allow update, delete: if isOwner(roomId);
//   }
//   match /roomMembers/{memberId} {
//     allow read: if isSignedIn();
//     // a user may add/remove only their own membership row
//     allow create, delete: if request.auth.uid == request.resource.data.userId
//                              || request.auth.uid == resource.data.userId;
//   }
//   match /rooms/{roomId}/sessions/{sessionId} {
//     allow read, write: if isMember(roomId);          // roomId from the PATH
//     match /scores/{scoreId} {
//       allow read, write: if isMember(roomId);
//     }
//     match /hands/{handId} {
//       allow read, write: if isMember(roomId);
//     }
//   }
// ---------------------------------------------------------------------------

import { app } from "./auth.js";
import { nextRiskStake } from "./risk-stakes.js";
import { settleHandDeltas, DEFAULT_BOURRE_SETTINGS, normalizeBourreSettings } from "./bourre-rules.js";
import { DEFAULT_HOUSE_RULES, normalizeHouseRules } from "./house-rules.js";
import { FIREBASE_SDK_VERSION, FIRESTORE_EMULATOR, SERVER_HAND_AUTHORITY } from "./firebase-config.js";
import {
  gameEnsureHandEnrollment,
  gamePlayCard,
  gameRecordHand,
  gameSetHandParticipation,
  gameSubmitDraw,
  gameTimeoutEnrollment,
  gameVoteCoWinSettlement,
  gameAdvanceBots,
} from "./game-functions.js";
import {
  dealInitialHand,
  playerOrderFromDealer,
  serializeHandState,
  deserializeCards,
  serializeCards,
  shuffledDeckFromSeed,
  remainingDeckCount,
  applyPlayerDraw,
  advanceAfterDraw,
  applyPlayerPlayCard,
  maxDrawDiscards,
  botDrawDiscardIndices,
  botPlayCardIndex,
  getLegalPlayIndices,
  effectivePlayerHand,
  HAND_PHASE,
} from "./game-engine.js";

const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

const {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  deleteField,
  runTransaction,
} = await import(`${CDN}/firebase-firestore.js`);

// Initial TrueSkill rating for a brand-new player (kept in sync with
// ranking.js; duplicated here so the data layer has no UI/logic dependency).
const RATING_INITIAL = { mu: 25, sigma: 25 / 3, matchesPlayed: 0 };
const RATING_INITIAL_APE = Math.round(Math.max(0, 25 - 3 * (25 / 3))); // = 0

const db = getFirestore(app);

/** Cloud Functions may be unavailable in production — fall back to client transactions. */
function isCloudFunctionUnavailable(err) {
  const code = err?.code ?? "";
  if (
    code === "functions/not-found" ||
    code === "functions/unavailable" ||
    code === "functions/deadline-exceeded"
  ) {
    return true;
  }
  const msg = String(err?.message ?? err).toLowerCase();
  return (
    msg.includes("not found") ||
    msg.includes("404") ||
    msg.includes("failed to fetch") ||
    msg.includes("internal")
  );
}

async function callGameOrClient(serverFn, clientFn) {
  if (!SERVER_HAND_AUTHORITY) return clientFn();
  try {
    return await serverFn();
  } catch (err) {
    if (!isCloudFunctionUnavailable(err)) throw err;
    console.warn(
      "Cloud Function unavailable — using client fallback for this action.",
      err?.code || err,
    );
    return clientFn();
  }
}

/** Five tricks per hand; winner is whoever takes the most (plurality). */
export const MAX_TRICKS_PER_HAND = 5;

/** Smallest count that can still win with n players in a full hand (plurality hint). */
export function tricksToWinHint(playerCount, totalTricks = MAX_TRICKS_PER_HAND) {
  const n = Math.max(2, playerCount || 2);
  return Math.ceil(totalTricks / n);
}

export function totalTricksPlayed(tricksByPlayer, participantIds) {
  return (participantIds || []).reduce(
    (sum, pid) => sum + (tricksByPlayer?.[pid] || 0),
    0,
  );
}

export function isHandComplete(tricksByPlayer, participantIds) {
  return totalTricksPlayed(tricksByPlayer, participantIds) >= MAX_TRICKS_PER_HAND;
}

/** Tricks taken this hand; missing entries count as 0 (never tapped +). */
export function tricksForPlayer(tricksByPlayer, playerId) {
  return tricksByPlayer?.[playerId] ?? 0;
}

function bourrePlayerIds(tricksByPlayer, participants) {
  if (!tricksByPlayer) return [];
  return participants.filter((pid) => tricksForPlayer(tricksByPlayer, pid) === 0);
}

/** Who leads or wins from trick counts — most tricks wins (ties share top). */
export function deriveWinnersFromTricks(tricksByPlayer, participantIds) {
  const participants = [...new Set((participantIds || []).filter(Boolean))];
  if (participants.length < 2) {
    return { ready: false, winnerIds: [], maxTricks: 0 };
  }
  let maxTricks = 0;
  for (const pid of participants) {
    maxTricks = Math.max(maxTricks, tricksByPlayer?.[pid] || 0);
  }
  if (maxTricks === 0) {
    return { ready: false, winnerIds: [], maxTricks };
  }
  const winnerIds = participants.filter((pid) => (tricksByPlayer?.[pid] || 0) === maxTricks);
  return { ready: true, winnerIds, maxTricks };
}

function sameCoWinProposal(a, b) {
  if (!a || !b) return false;
  const ap = [...(a.participantIds || [])].sort().join(",");
  const bp = [...(b.participantIds || [])].sort().join(",");
  const aw = [...(a.winnerIds || [])].sort().join(",");
  const bw = [...(b.winnerIds || [])].sort().join(",");
  return ap === bp && aw === bw;
}

if (FIRESTORE_EMULATOR) {
  try {
    connectFirestoreEmulator(db, FIRESTORE_EMULATOR.host, FIRESTORE_EMULATOR.port);
  } catch (err) {
    console.warn("Could not connect to the Firestore emulator:", err);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode() {
  let s = "";
  for (let i = 0; i < 6; i += 1) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}

function normalizeInviteCode(code) {
  let c = code.trim().toUpperCase().replace(/\s+/g, "");
  if (/^[A-Z0-9]{6}$/.test(c)) {
    c = `${c.slice(0, 3)}-${c.slice(3)}`;
  }
  return c;
}

const memberId = (roomId, uid) => `${roomId}_${uid}`;

function withId(snap) {
  return { id: snap.id, ...snap.data() };
}

/** Per-player ante override (non-winners after co-win split fails). */
function stakeForPlayer(scoreById, playerId, sessionStake) {
  const row = scoreById[playerId];
  const n = row?.perHandStake ?? sessionStake;
  return Math.max(1, Number(n) || sessionStake);
}

/** Ante for the current hand (0 when bourré carry-over waived the next ante). */
export function playerHandStake(scoreById, playerId, sessionStake) {
  const row = scoreById[playerId];
  if (row?.skipNextAnte) return 0;
  return stakeForPlayer(scoreById, playerId, sessionStake);
}

export { DEFAULT_BOURRE_SETTINGS, normalizeBourreSettings, computeHandPotState } from "./bourre-rules.js";
export { DEFAULT_HOUSE_RULES, normalizeHouseRules, HOUSE_RULE_FIELDS, readHouseRulesFromForm } from "./house-rules.js";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function ensureUserDoc(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const base = {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
  };
  if (!snap.exists()) base.createdAt = serverTimestamp();
  await setDoc(ref, base, { merge: true });
}

// ---------------------------------------------------------------------------
// Rooms + membership
// ---------------------------------------------------------------------------
export async function createRoom({ owner, name, houseRules }) {
  const roomRef = doc(collection(db, "rooms"));
  const inviteCode = generateInviteCode();
  const batch = writeBatch(db);
  batch.set(roomRef, {
    inviteCode,
    ownerId: owner.uid,
    name: name || `${owner.displayName.split(" ")[0]}'s Room`,
    houseRules: normalizeHouseRules(houseRules),
    bourreSettings: { ...DEFAULT_BOURRE_SETTINGS },
    status: "open",
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "inviteLookups", inviteCode), {
    roomId: roomRef.id,
    ownerId: owner.uid,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "roomMembers", memberId(roomRef.id, owner.uid)), {
    roomId: roomRef.id,
    userId: owner.uid,
    displayName: owner.displayName,
    role: "owner",
    joinedAt: serverTimestamp(),
  });
  await batch.commit();
  await ensureInviteLookupForRoom(roomRef.id);
  return roomRef.id;
}

/** Ensure inviteLookups/{code} exists (repairs rooms created before the join fix). */
export async function ensureInviteLookupForRoom(roomId) {
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  if (!roomSnap.exists()) return false;
  const data = roomSnap.data();
  const inviteCode = normalizeInviteCode(data.inviteCode || "");
  if (!inviteCode) return false;
  await setDoc(
    doc(db, "inviteLookups", inviteCode),
    {
      roomId,
      ownerId: data.ownerId,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  return true;
}

/** Join an existing room by invite code. Returns the roomId or null. */
export async function joinRoomByCode(code, user) {
  const inviteCode = normalizeInviteCode(code);
  const lookupSnap = await getDoc(doc(db, "inviteLookups", inviteCode));
  if (!lookupSnap.exists()) return null;
  const roomId = lookupSnap.data().roomId;
  await setDoc(
    doc(db, "roomMembers", memberId(roomId, user.uid)),
    {
      roomId,
      userId: user.uid,
      displayName: user.displayName,
      role: "player",
      joinedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return roomId;
}

/** Remove this user from a room (hides it from their list). */
export async function leaveRoom(roomId, user) {
  if (!user?.uid) throw new Error("Not signed in");
  await deleteDoc(doc(db, "roomMembers", memberId(roomId, user.uid)));
}

/** Delete a room entirely (owner only). Cleans up orphan membership if room is already gone. */
export async function deleteRoom(roomId, user) {
  if (!user?.uid) throw new Error("Not signed in");
  let roomSnap;
  try {
    roomSnap = await getDoc(doc(db, "rooms", roomId));
  } catch (err) {
    if (err?.code === "permission-denied") {
      throw new Error("Only the room owner can delete this room. Try Leave instead.");
    }
    throw err;
  }
  if (!roomSnap.exists()) {
    await leaveRoom(roomId, user);
    return;
  }
  const data = roomSnap.data();
  if (data.ownerId !== user.uid) {
    throw new Error("Only the room owner can delete this room. Use Leave to remove it from your list.");
  }
  const inviteCode = normalizeInviteCode(data.inviteCode || "");
  await deleteDoc(doc(db, "roomMembers", memberId(roomId, user.uid)));
  await deleteDoc(doc(db, "rooms", roomId));
  if (inviteCode) {
    try {
      await deleteDoc(doc(db, "inviteLookups", inviteCode));
    } catch (err) {
      // Lookup may be missing or owned by stale data — room is already deleted.
      if (err?.code !== "permission-denied" && err?.code !== "not-found") {
        console.warn("inviteLookup delete skipped:", err);
      }
    }
  }
}

export async function updateRoomStatus(roomId, status) {
  await updateDoc(doc(db, "rooms", roomId), { status });
}

export async function updateRoomHouseRules(roomId, houseRules) {
  const normalized = normalizeHouseRules(houseRules);
  await updateDoc(doc(db, "rooms", roomId), {
    houseRules: normalized,
    updatedAt: serverTimestamp(),
  });
  return normalized;
}

export async function updateRoomBourreSettings(roomId, bourreSettings) {
  const normalized = normalizeBourreSettings(bourreSettings);
  await updateDoc(doc(db, "rooms", roomId), {
    bourreSettings: {
      anteAmount: normalized.anteAmount,
      limEnabled: normalized.limEnabled,
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * Real-time list of the signed-in user's rooms. Listens to that user's
 * membership rows, then loads each referenced room document.
 * @returns {() => void} unsubscribe
 */
export function subscribeMyRooms(uid, callback) {
  const q = query(collection(db, "roomMembers"), where("userId", "==", uid));
  return onSnapshot(q, async (snap) => {
    const memberships = snap.docs.map(withId);
    const rooms = await Promise.all(
      memberships.map(async (m) => {
        const roomSnap = await getDoc(doc(db, "rooms", m.roomId));
        if (!roomSnap.exists()) return null;
        return { ...withId(roomSnap), role: m.role };
      }),
    );
    callback(
      rooms
        .filter(Boolean)
        .sort((a, b) => seconds(b.createdAt) - seconds(a.createdAt)),
    );
  });
}

export function subscribeRoom(roomId, callback) {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    callback(snap.exists() ? withId(snap) : null);
  });
}

export function subscribeRoomMembers(roomId, callback) {
  const q = query(collection(db, "roomMembers"), where("roomId", "==", roomId));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs
        .map(withId)
        .sort((a, b) => seconds(a.joinedAt) - seconds(b.joinedAt)),
    );
  });
}

// ---------------------------------------------------------------------------
// Sessions + scores (subcollections under each room)
// ---------------------------------------------------------------------------
const sessionsCol = (roomId) => collection(db, "rooms", roomId, "sessions");
const scoresCol = (roomId, sessionId) =>
  collection(db, "rooms", roomId, "sessions", sessionId, "scores");
const handsCol = (roomId, sessionId) =>
  collection(db, "rooms", roomId, "sessions", sessionId, "hands");
const sessionDoc = (roomId, sessionId) =>
  doc(db, "rooms", roomId, "sessions", sessionId);
const scoreDoc = (roomId, sessionId, playerId) =>
  doc(db, "rooms", roomId, "sessions", sessionId, "scores", playerId);
const privateHandsCol = (roomId, sessionId) =>
  collection(db, "rooms", roomId, "sessions", sessionId, "privateHands");
const privateHandDoc = (roomId, sessionId, playerId) =>
  doc(privateHandsCol(roomId, sessionId), playerId);

/** Seconds each player has to tap I'm in, clockwise from first seat after dealer. */
export const HAND_ENROLLMENT_SECONDS = 12;
export const HAND_ENROLLMENT_MS = HAND_ENROLLMENT_SECONDS * 1000;

export function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

export function createRobotPlayerId() {
  return `bot_${Math.random().toString(36).slice(2, 10)}`;
}

/** Keep enrollment rotation when a new seat joins mid-signup. */
function mergePlayerIntoEnrollment(enrollment, dealerId, sortedPlayerIds) {
  if (!enrollment?.active) return enrollment;
  const currentId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
  const orderedPlayerIds = enrollmentOrderFromDealer(dealerId, sortedPlayerIds);
  let currentIndex = currentId != null ? orderedPlayerIds.indexOf(currentId) : 0;
  if (currentIndex < 0) currentIndex = 0;
  return { ...enrollment, orderedPlayerIds, currentIndex };
}

function sortedScorePlayerIds(scoreSnap) {
  return scoreSnap.docs
    .map((d) => ({ id: d.id, displayName: d.data()?.displayName || "" }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((r) => r.id);
}

/** Clockwise order starting with the first seat after the dealer. */
export function enrollmentOrderFromDealer(dealerId, sortedPlayerIds) {
  return playerOrderFromDealer(dealerId, sortedPlayerIds);
}

function buildHandEnrollment(sortedPlayerIds, dealerId) {
  const orderedPlayerIds = enrollmentOrderFromDealer(dealerId, sortedPlayerIds);
  return {
    active: true,
    orderedPlayerIds,
    currentIndex: 0,
    turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
    enrolledIds: [],
    declinedIds: [],
  };
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] };
}

function buildDealCompletionPatch(dealerId, enrolledIds, sortedPlayerIds, seed, dealingRule) {
  const deal = dealInitialHand({
    dealerId,
    participantIds: enrolledIds,
    sortedPlayerIds,
    seed: seed ?? Date.now(),
  });
  const { publicHand, privateHandsByPlayer } = serializeHandState(deal, {
    dealerId,
    actionOrder: deal.dealOrder,
    maxDrawDiscards: maxDrawDiscards(enrolledIds.length, dealingRule),
  });
  return {
    handEnrollment: deleteField(),
    currentHand: publicHand,
    privateHandsByPlayer,
  };
}

function canActForPlayer(playerId, actorId) {
  if (!playerId || !actorId) return false;
  if (playerId === actorId) return true;
  return isRobotPlayerId(playerId);
}

function actionOrderFromHand(currentHand) {
  if (currentHand?.actionOrder?.length) return currentHand.actionOrder;
  return currentHand?.participantIds || [];
}

async function finalizeHandFromCardPlay(roomId, sessionId, recordedBy) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) return;
  const sessionData = sessionSnap.data();
  const currentHand = sessionData.currentHand || {};
  const participantIds = currentHand.participantIds || [];
  const tricksByPlayer = currentHand.tricksByPlayer || {};
  const { ready, winnerIds } = deriveWinnersFromTricks(tricksByPlayer, participantIds);

  if (!ready) {
    await recordHand(roomId, sessionId, {
      winnerIds: [],
      participantIds,
      settlement: "push",
      recordedBy,
      tricksByPlayer,
    });
    return;
  }

  if (winnerIds.length === 1) {
    await recordHand(roomId, sessionId, {
      winnerIds,
      participantIds,
      settlement: "win",
      recordedBy,
      tricksByPlayer,
    });
    return;
  }

  const pending = sessionData.pendingCoWinSettlement;
  const proposal = { participantIds, winnerIds };
  const nextPending = sameCoWinProposal(pending, proposal)
    ? pending
    : { ...proposal, votes: {}, updatedAt: serverTimestamp() };

  await updateDoc(sessionDoc(roomId, sessionId), {
    pendingCoWinSettlement: nextPending,
    updatedAt: serverTimestamp(),
  });
}

/** Draw/discard during the draw phase — server-validated via Cloud Function. */
export async function submitHandDraw(roomId, sessionId, { playerId, discardIndices, actorId }) {
  if (!SERVER_HAND_AUTHORITY) {
    return submitHandDrawClient(roomId, sessionId, { playerId, discardIndices, actorId });
  }
  return gameSubmitDraw(roomId, sessionId, { playerId, discardIndices, actorId });
}

async function submitHandDrawClient(roomId, sessionId, { playerId, discardIndices, actorId }) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new Error("You can only draw for yourself (or drive a robot)");
  }

  const ref = sessionDoc(roomId, sessionId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new Error("Session is final");

    const currentHand = sessionData.currentHand || {};
    if (currentHand.phase !== HAND_PHASE.DRAW) throw new Error("Not in draw phase");
    if (currentHand.turnPlayerId !== playerId) throw new Error("Not your turn to draw");
    if ((currentHand.drawCompletedIds || []).includes(playerId)) {
      throw new Error("Draw already completed");
    }

    const privateRef = privateHandDoc(roomId, sessionId, playerId);
    const privateSnap = await tx.get(privateRef);
    if (!privateSnap.exists()) throw new Error("Private hand not found");

    const hand = deserializeCards(privateSnap.data().cards || []);
    const deckSeed = currentHand.deckSeed;
    if (deckSeed == null) throw new Error("Missing deck seed on session");

    const deck = shuffledDeckFromSeed(deckSeed);
    const deckNextIndex = currentHand.deckNextIndex ?? 0;
    const maxDraw =
      currentHand.maxDrawDiscards ?? maxDrawDiscards(currentHand.participantIds?.length ?? 2);

    const drawResult = applyPlayerDraw({
      playerId,
      privateHand: hand,
      publicHand: currentHand,
      discardIndices: discardIndices || [],
      deck,
      deckNextIndex,
      maxDiscards: maxDraw,
    });

    let nextPublic = advanceAfterDraw(drawResult.publicHand, actionOrderFromHand(currentHand), playerId);
    nextPublic = {
      ...nextPublic,
      remainingDeckCount: remainingDeckCount(deck, drawResult.deckNextIndex),
    };

    tx.set(privateRef, {
      cards: serializeCards(drawResult.privateHand),
      updatedAt: serverTimestamp(),
    });
    tx.update(ref, { currentHand: nextPublic, updatedAt: serverTimestamp() });
  });
}

/** Play one card during trick play — server-validated via Cloud Function. */
export async function playHandCard(roomId, sessionId, { playerId, cardIndex, actorId }) {
  if (!SERVER_HAND_AUTHORITY) {
    return playHandCardClient(roomId, sessionId, { playerId, cardIndex, actorId });
  }
  return gamePlayCard(roomId, sessionId, { playerId, cardIndex, actorId });
}

async function playHandCardClient(roomId, sessionId, { playerId, cardIndex, actorId }) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new Error("You can only play for yourself (or drive a robot)");
  }

  const ref = sessionDoc(roomId, sessionId);
  let handComplete = false;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new Error("Session is final");

    const currentHand = sessionData.currentHand || {};
    if (currentHand.phase !== HAND_PHASE.PLAY) throw new Error("Not in trick-play phase");

    const privateRef = privateHandDoc(roomId, sessionId, playerId);
    const privateSnap = await tx.get(privateRef);
    if (!privateSnap.exists()) throw new Error("Private hand not found");

    const hand = deserializeCards(privateSnap.data().cards || []);
    const result = applyPlayerPlayCard({
      publicHand: currentHand,
      privateHand: hand,
      playerId,
      cardIndex,
      actionOrder: actionOrderFromHand(currentHand),
      cinchEnabled: currentHand.cinchEnabled === true,
    });

    handComplete = result.handComplete;

    tx.set(privateRef, {
      cards: serializeCards(result.privateHand),
      updatedAt: serverTimestamp(),
    });
    tx.update(ref, { currentHand: result.publicHand, updatedAt: serverTimestamp() });
  });

  if (handComplete) {
    await finalizeHandFromCardPlay(roomId, sessionId, actorId);
  }
}

/** Robot draw/play helpers — room member drives bot using bot private hand doc. */
export async function robotSubmitDraw(roomId, sessionId, { playerId, actorId, dealingRule }) {
  const handData = await getPrivateHand(roomId, sessionId, playerId);
  if (!handData) {
    throw new Error(`Bot private hand missing (${playerId}) — redeal or nudge bots`);
  }
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  const ch = sessionSnap.data()?.currentHand || {};
  const trumpSuit = ch.trumpSuit;
  const maxDraw = ch.maxDrawDiscards ?? maxDrawDiscards(ch.participantIds?.length ?? 2, dealingRule);
  const privateHand = deserializeCards(handData.cards || []);
  const hand = effectivePlayerHand(playerId, privateHand, ch);
  if (!hand.length) return;
  const indices = botDrawDiscardIndices(hand, trumpSuit, maxDraw);
  await submitHandDraw(roomId, sessionId, { playerId, discardIndices: indices, actorId });
}

export async function robotPlayCard(roomId, sessionId, { playerId, actorId }) {
  const handData = await getPrivateHand(roomId, sessionId, playerId);
  if (!handData) {
    throw new Error(`Bot private hand missing (${playerId}) — redeal or nudge bots`);
  }
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  const ch = sessionSnap.data()?.currentHand || {};
  const privateHand = deserializeCards(handData?.cards || []);
  const hand = effectivePlayerHand(playerId, privateHand, ch);
  if (!hand.length) return;
  const trick = ch.currentTrick;
  const trickPlays = (trick?.plays || []).map((p) => p.card);
  const isLeading = trickPlays.length === 0;
  const ctx = {
    hand,
    trumpSuit: ch.trumpSuit,
    leadSuit: isLeading ? null : ch.leadSuit || trickPlays[0]?.suit,
    trickPlays,
    isLeading,
    cinchEnabled: ch.cinchEnabled === true,
  };
  const idx = botPlayCardIndex(hand, ctx);
  await playHandCard(roomId, sessionId, { playerId, cardIndex: idx, actorId });
}

function writePrivateHandsToTransaction(tx, roomId, sessionId, privateHandsByPlayer) {
  if (!privateHandsByPlayer) return;
  for (const [playerId, hand] of Object.entries(privateHandsByPlayer)) {
    tx.set(privateHandDoc(roomId, sessionId, playerId), {
      cards: hand.cards,
      updatedAt: serverTimestamp(),
    });
  }
}

async function deletePrivateHandsForSession(roomId, sessionId, batch) {
  const snap = await getDocs(privateHandsCol(roomId, sessionId));
  snap.docs.forEach((d) => batch.delete(d.ref));
}

/** Live subscription to the signed-in player's private hand for the session. */
export function subscribePrivateHand(roomId, sessionId, playerId, callback, onError) {
  if (!roomId || !sessionId || !playerId) return () => {};
  return onSnapshot(
    privateHandDoc(roomId, sessionId, playerId),
    (snap) => {
      callback(snap.exists() ? snap.data() : null);
    },
    (err) => {
      if (onError) onError(err);
      else console.error("subscribePrivateHand:", err);
    },
  );
}

/** One-shot read of a player's private hand (own hand only per security rules). */
export async function getPrivateHand(roomId, sessionId, playerId) {
  const snap = await getDoc(privateHandDoc(roomId, sessionId, playerId));
  return snap.exists() ? snap.data() : null;
}

function enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, dealContext = null) {
  const nextIndex = enrollment.currentIndex + 1;
  if (nextIndex < enrollment.orderedPlayerIds.length) {
    return {
      handEnrollment: {
        ...enrollment,
        enrolledIds,
        declinedIds,
        currentIndex: nextIndex,
        turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
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
        turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
      },
      currentHand: emptyPreDealHand(),
    };
  }
  if (!dealContext?.sortedPlayerIds?.length) {
    throw new Error("Missing deal context for enrollment completion");
  }
  return buildDealCompletionPatch(
    dealContext.dealerId,
    enrolledIds,
    dealContext.sortedPlayerIds,
    dealContext.seed,
    dealContext.dealingRule,
  );
}

function nextDealerId(scoreSnap, currentDealerId) {
  const ids = sortedScorePlayerIds(scoreSnap);
  if (ids.length === 0) return null;
  const idx = ids.indexOf(currentDealerId);
  const base = idx >= 0 ? idx : 0;
  return ids[(base + 1) % ids.length];
}

export async function createSession(roomId, players, handStake = 1, bourreOpts = {}) {
  const stake = Math.max(1, Number(handStake) || 1);
  const limEnabled = bourreOpts.limEnabled === true;
  const sessionRef = doc(sessionsCol(roomId));
  const sortedIds = [...players]
    .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""))
    .map((p) => p.playerId);
  const initialDealer = sortedIds[0] ?? null;
  const batch = writeBatch(db);
  batch.set(sessionRef, {
    roomId,
    status: "in_progress",
    handCount: 0,
    handStake: stake,
    handStakeLocked: false,
    limEnabled,
    carryOverPot: 0,
    dealerId: initialDealer,
    handEnrollment: buildHandEnrollment(sortedIds, initialDealer),
    currentHand: emptyPreDealHand(),
    rounds: 0,
    players: players.map((p) => ({ playerId: p.playerId, displayName: p.displayName })),
    notes: "",
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  players.forEach((p) => {
    batch.set(scoreDoc(roomId, sessionRef.id, p.playerId), {
      sessionId: sessionRef.id,
      roomId,
      playerId: p.playerId,
      displayName: p.displayName,
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
      joinedAtHandCount: 0,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return sessionRef.id;
}

export function subscribeSessions(roomId, callback) {
  return onSnapshot(sessionsCol(roomId), (snap) => {
    callback(
      snap.docs
        .map(withId)
        .sort((a, b) => seconds(b.createdAt) - seconds(a.createdAt)),
    );
  });
}

export function sortScoresForDisplay(scores, players = []) {
  const order = new Map(players.map((p, i) => [p.playerId, i]));
  return [...scores].sort((a, b) => {
    const ai = order.has(a.playerId) ? order.get(a.playerId) : 999;
    const bi = order.has(b.playerId) ? order.get(b.playerId) : 999;
    if (ai !== bi) return ai - bi;
    return (a.displayName || "").localeCompare(b.displayName || "");
  });
}

export function subscribeScores(roomId, sessionId, callback) {
  return onSnapshot(scoresCol(roomId, sessionId), (snap) => {
    callback(
      snap.docs
        .map(withId)
        .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || "")),
    );
  });
}

export function subscribeHands(roomId, sessionId, callback) {
  return onSnapshot(handsCol(roomId, sessionId), (snap) => {
    callback(
      snap.docs
        .map(withId)
        .sort((a, b) => (b.handNumber ?? 0) - (a.handNumber ?? 0)),
    );
  });
}

/** Room owner may change hand stake until the first hand is recorded. */
export async function updateSessionHandStake(roomId, sessionId, handStake) {
  const snap = await getDoc(sessionDoc(roomId, sessionId));
  if (!snap.exists()) throw new Error("Session not found");
  const data = snap.data();
  if (data.status === "final") throw new Error("Session is final");
  if (data.handStakeLocked) throw new Error("Hand stake is locked after the first hand");
  const stake = Number(handStake);
  if (!Number.isFinite(stake) || stake <= 0) throw new Error("Invalid hand stake");
  await updateDoc(sessionDoc(roomId, sessionId), {
    handStake: stake,
    updatedAt: serverTimestamp(),
  });
}

/** Toggle LmT (20× pot cap + overflow carry) until the first hand is recorded. */
export async function updateSessionLimEnabled(roomId, sessionId, limEnabled) {
  const snap = await getDoc(sessionDoc(roomId, sessionId));
  if (!snap.exists()) throw new Error("Session not found");
  const data = snap.data();
  if (data.status === "final") throw new Error("Session is final");
  if (data.handStakeLocked) throw new Error("LmT is locked after the first hand");
  await updateDoc(sessionDoc(roomId, sessionId), {
    limEnabled: limEnabled === true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Record one hand. Single winner takes the pot. Co-winners must pass settlement
 * 'push' (pot carries) or 'split' (divide among winners).
 */
export async function recordHand(
  roomId,
  sessionId,
  { winnerId, winnerIds, participantIds, settlement, recordedBy, tricksByPlayer },
) {
  if (SERVER_HAND_AUTHORITY) {
    return gameRecordHand(roomId, sessionId, {
      winnerId,
      winnerIds,
      participantIds,
      settlement,
      recordedBy,
      tricksByPlayer,
    });
  }
  return recordHandClient(roomId, sessionId, {
    winnerId,
    winnerIds,
    participantIds,
    settlement,
    recordedBy,
    tricksByPlayer,
  });
}

async function recordHandClient(
  roomId,
  sessionId,
  { winnerId, winnerIds, participantIds, settlement, recordedBy, tricksByPlayer },
) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) throw new Error("Session not found");
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") throw new Error("Session is final");

  const winners = [
    ...new Set((winnerIds?.length ? winnerIds : winnerId ? [winnerId] : []).filter(Boolean)),
  ];
  const participants = [...new Set(participantIds.filter(Boolean))];
  if (participants.length < 2) throw new Error("At least two players must be in the hand");

  let mode = settlement || (winners.length === 1 ? "win" : null);
  if (winners.length >= 2 && !mode) {
    throw new Error("Co-winners must choose push or split");
  }
  if (winners.length === 1 && mode !== "win") mode = "win";
  if (winners.length >= 2 && mode === "win") {
    throw new Error("Use push or split when there are co-winners");
  }
  const potCarryMode = mode === "push" || mode === "non_winner_ante_up";
  if (!potCarryMode && winners.length === 0) throw new Error("Select at least one winner");
  for (const wid of winners) {
    if (!participants.includes(wid)) throw new Error("Every winner must be in the hand");
  }

  const stake = sessionData.handStake ?? 1;
  const limEnabled = sessionData.limEnabled === true;
  const carryIn = sessionData.carryOverPot || 0;
  const handNumber = (sessionData.handCount || 0) + 1;

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  for (const pid of participants) {
    if (!scoreById[pid]) throw new Error("Unknown player in hand");
  }

  const handSettlement = settleHandDeltas({
    mode,
    winners,
    participants,
    tricksByPlayer,
    anteAmount: stake,
    limEnabled,
    carryIn,
    stakeForPlayer: (pid) => playerHandStake(scoreById, pid, stake),
  });

  const {
    deltas,
    carryOverPot,
    bourreIds,
    bourreMatch,
    potState,
    pot: grossPot,
    cappedPot,
    overflow,
  } = handSettlement;

  const batch = writeBatch(db);
  batch.set(doc(handsCol(roomId, sessionId)), {
    handNumber,
    winnerId: winners.length === 1 ? winners[0] : null,
    winnerIds: winners,
    settlement: mode,
    participantIds: participants,
    tricksByPlayer: tricksByPlayer || null,
    bourreIds: tricksByPlayer ? bourreIds : [],
    bourreCarryOver: bourreMatch,
    stake,
    pot: grossPot,
    cappedPot,
    potCap: potState.potCap,
    overflow,
    carryIn,
    deltas,
    recordedBy: recordedBy || null,
    createdAt: serverTimestamp(),
  });

  participants.forEach((pid) => {
    const current = scoreById[pid];
    const isWinner = winners.includes(pid);
    const tricksWon =
      (current.tricksWon || 0) + (isWinner && mode === "split" ? 1 : mode === "win" && isWinner ? 1 : 0);
    const patch = {
      net: (current.net || 0) + deltas[pid],
      updatedAt: serverTimestamp(),
    };
    if (current.skipNextAnte) {
      patch.skipNextAnte = deleteField();
    }
    if (bourreIds.length > 0 && tricksByPlayer) {
      const tricks = tricksForPlayer(tricksByPlayer, pid);
      if (tricks >= 1 || bourreIds.includes(pid)) {
        patch.skipNextAnte = true;
      }
    }
    if (isWinner && (mode === "split" || mode === "win")) {
      patch.handsWon = (current.handsWon || 0) + 1;
      patch.tricksWon = tricksWon;
      patch.total = Math.max(0, tricksWon);
    }
    if (mode === "non_winner_ante_up") {
      if (winners.includes(pid)) {
        patch.perHandStake = deleteField();
      } else {
        patch.perHandStake = nextRiskStake(stakeForPlayer(scoreById, pid, stake));
      }
    }
    batch.update(scoreDoc(roomId, sessionId, pid), patch);
  });

  for (const scoreDocSnap of scoreSnap.docs) {
    const pid = scoreDocSnap.id;
    if (scoreDocSnap.data().skipNextAnte && !participants.includes(pid)) {
      batch.update(scoreDoc(roomId, sessionId, pid), {
        skipNextAnte: deleteField(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  const newDealerId = nextDealerId(scoreSnap, sessionData.dealerId);
  await deletePrivateHandsForSession(roomId, sessionId, batch);
  batch.update(sessionDoc(roomId, sessionId), {
    handCount: handNumber,
    handStakeLocked: true,
    carryOverPot,
    dealerId: newDealerId,
    pendingCoWinSettlement: deleteField(),
    handEnrollment: buildHandEnrollment(sortedScorePlayerIds(scoreSnap), newDealerId),
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  await recomputeSessionTotals(roomId, sessionId);
}

/**
 * Co-winners vote to split or decline. One decline settles immediately (non-winners
 * ante up). Split only when every co-winner has agreed to split.
 */
export async function voteCoWinSettlement(
  roomId,
  sessionId,
  { participantIds, winnerIds, voterId, choice, recordedBy },
) {
  if (SERVER_HAND_AUTHORITY) {
    return gameVoteCoWinSettlement(roomId, sessionId, {
      participantIds,
      winnerIds,
      voterId,
      choice,
      recordedBy,
    });
  }
  return voteCoWinSettlementClient(roomId, sessionId, {
    participantIds,
    winnerIds,
    voterId,
    choice,
    recordedBy,
  });
}

async function voteCoWinSettlementClient(
  roomId,
  sessionId,
  { participantIds, winnerIds, voterId, choice, recordedBy },
) {
  if (choice !== "push" && choice !== "split") {
    throw new Error("Vote must be decline or agree to split");
  }

  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) throw new Error("Session not found");
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") throw new Error("Session is final");

  const winners = [...new Set(winnerIds.filter(Boolean))];
  const participants = [...new Set(participantIds.filter(Boolean))];
  if (winners.length < 2) throw new Error("Co-winners only");
  if (!winners.includes(voterId)) throw new Error("Only co-winners can vote");

  const tricksByPlayer = sessionData.currentHand?.tricksByPlayer || {};
  const recordArgs = {
    winnerIds: winners,
    participantIds: participants,
    recordedBy,
    tricksByPlayer,
  };

  if (choice === "push") {
    await recordHand(roomId, sessionId, {
      ...recordArgs,
      settlement: "non_winner_ante_up",
    });
    return { status: "settled", settlement: "non_winner_ante_up", votes: { [voterId]: "push" } };
  }

  const pending = sessionData.pendingCoWinSettlement;
  const sameProposal =
    pending &&
    pending.winnerIds?.length === winners.length &&
    pending.winnerIds.every((w) => winners.includes(w)) &&
    pending.participantIds?.length === participants.length &&
    pending.participantIds.every((p) => participants.includes(p));

  const votes = sameProposal ? { ...(pending.votes || {}), [voterId]: "split" } : { [voterId]: "split" };

  const allAgreeSplit = winners.every((w) => votes[w] === "split");
  if (!allAgreeSplit) {
    await updateDoc(sessionDoc(roomId, sessionId), {
      pendingCoWinSettlement: {
        participantIds: participants,
        winnerIds: winners,
        votes,
        updatedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
    return { status: "pending", votes };
  }

  await recordHand(roomId, sessionId, {
    ...recordArgs,
    settlement: "split",
  });
  return { status: "settled", settlement: "split", votes };
}

/**
 * Track tricks within the current hand (0–5 per player, 5 total). Leader is
 * whoever has the most tricks; hand plays out to 5 so bourré (0 tricks) can settle.
 */
export async function updateHandTrick(roomId, sessionId, playerId, delta, recordedBy) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) throw new Error("Session not found");
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") throw new Error("Session is final");

  if (recordedBy && recordedBy !== playerId && !isRobotPlayerId(playerId)) {
    throw new Error("You can only update your own tricks");
  }

  const currentHand = sessionData.currentHand || { tricksByPlayer: {}, participantIds: [] };
  if (currentHand.phase === HAND_PHASE.DRAW || currentHand.phase === HAND_PHASE.PLAY) {
    throw new Error("Tricks are tracked automatically during card play");
  }
  const participantIds = [...(currentHand.participantIds || [])];
  if (!participantIds.includes(playerId)) {
    throw new Error("You must be in this hand to record tricks");
  }

  const tricksByPlayer = { ...(currentHand.tricksByPlayer || {}) };
  const current = tricksByPlayer[playerId] || 0;
  const totalBefore = totalTricksPlayed(tricksByPlayer, participantIds);

  if (delta > 0 && totalBefore >= MAX_TRICKS_PER_HAND) {
    throw new Error("All 5 tricks have been played this hand");
  }

  const next = Math.max(0, Math.min(MAX_TRICKS_PER_HAND, current + delta));
  if (next === current && delta !== 0) return;

  tricksByPlayer[playerId] = next;

  const handComplete = isHandComplete(tricksByPlayer, participantIds);

  if (!handComplete) {
    const patch = {
      currentHand: { ...currentHand, tricksByPlayer, participantIds },
      updatedAt: serverTimestamp(),
    };
    if (sessionData.pendingCoWinSettlement) {
      patch.pendingCoWinSettlement = deleteField();
    }
    await updateDoc(sessionDoc(roomId, sessionId), patch);
    return;
  }

  const { ready, winnerIds } = deriveWinnersFromTricks(tricksByPlayer, participantIds);

  if (participantIds.length < 2) {
    throw new Error("At least two players must be in the hand");
  }

  if (!ready) {
    await recordHand(roomId, sessionId, {
      winnerIds: [],
      participantIds,
      settlement: "push",
      recordedBy,
      tricksByPlayer,
    });
    return;
  }

  if (winnerIds.length === 1) {
    await recordHand(roomId, sessionId, {
      winnerIds,
      participantIds,
      settlement: "win",
      recordedBy,
      tricksByPlayer,
    });
    return;
  }

  const pending = sessionData.pendingCoWinSettlement;
  const proposal = { participantIds, winnerIds };
  const nextPending = sameCoWinProposal(pending, proposal)
    ? pending
    : { ...proposal, votes: {}, updatedAt: serverTimestamp() };

  await updateDoc(sessionDoc(roomId, sessionId), {
    currentHand: { ...currentHand, tricksByPlayer, participantIds },
    pendingCoWinSettlement: nextPending,
    updatedAt: serverTimestamp(),
  });
}

/** Update one player's score row, then recompute the session totals. */
export async function updateScore(roomId, sessionId, playerId, fields) {
  const patch = { ...fields, updatedAt: serverTimestamp() };
  if (typeof fields.tricksWon === "number") {
    patch.total = Math.max(0, fields.tricksWon); // bragging-rights total only
  }
  await updateDoc(scoreDoc(roomId, sessionId, playerId), patch);
  await recomputeSessionTotals(roomId, sessionId);
}

export async function recomputeSessionTotals(roomId, sessionId) {
  const snap = await getDocs(scoresCol(roomId, sessionId));
  const byPlayer = {};
  const netByPlayer = {};
  let tricks = 0;
  snap.docs.forEach((d) => {
    const s = d.data();
    byPlayer[s.playerId] = s.tricksWon || 0;
    netByPlayer[s.playerId] = s.net || 0;
    tricks += s.tricksWon || 0;
  });
  await updateDoc(sessionDoc(roomId, sessionId), {
    totals: { byPlayer, netByPlayer, tricks },
    rounds: tricks,
    updatedAt: serverTimestamp(),
  });
}

/** Notes are informational only — never money. */
export async function updateSessionNotes(roomId, sessionId, notes) {
  await updateDoc(sessionDoc(roomId, sessionId), {
    notes: String(notes).slice(0, 2000),
    updatedAt: serverTimestamp(),
  });
}

export async function finalizeSession(roomId, sessionId) {
  await updateDoc(sessionDoc(roomId, sessionId), {
    status: "final",
    updatedAt: serverTimestamp(),
  });
}

/** Remove a session and its score/hand subcollections from the room. */
export async function deleteSession(roomId, sessionId) {
  const [scoresSnap, handsSnap] = await Promise.all([
    getDocs(scoresCol(roomId, sessionId)),
    getDocs(handsCol(roomId, sessionId)),
  ]);
  const batch = writeBatch(db);
  scoresSnap.docs.forEach((d) => batch.delete(d.ref));
  handsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(sessionDoc(roomId, sessionId));
  await batch.commit();
}

// ---------------------------------------------------------------------------
// Players + Ape Score ranking (TrueSkill). See docs/ranking.js for the math.
// players/{playerId}: { displayName, mu, sigma, matchesPlayed, apeScore,
//                       apeClass, apeStatus, momentum, updatedAt }
// playerId is the auth uid for signed-in users, or a generated id for guests
// added to a table. Rankings are entertainment-only — never money.
// ---------------------------------------------------------------------------
const playerDoc = (playerId) => doc(db, "players", playerId);

/** Create a player ranking doc with the initial rating if it doesn't exist. */
export async function ensurePlayerDoc(playerId, displayName) {
  const ref = playerDoc(playerId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName,
      mu: RATING_INITIAL.mu,
      sigma: RATING_INITIAL.sigma,
      matchesPlayed: 0,
      apeScore: RATING_INITIAL_APE,
      momentum: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (displayName && snap.data().displayName !== displayName) {
    await updateDoc(ref, { displayName, updatedAt: serverTimestamp() });
  }
  return playerId;
}

/** Fetch current ratings for a set of player ids → { [id]: ratingData }. */
export async function getPlayers(ids) {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const snap = await getDoc(playerDoc(id));
      return [id, snap.exists() ? snap.data() : null];
    }),
  );
  return Object.fromEntries(entries);
}

/** Real-time leaderboard: all players, sorted by Ape Score (desc). */
export function subscribeLeaderboard(callback) {
  return onSnapshot(collection(db, "players"), (snap) => {
    callback(
      snap.docs
        .map(withId)
        .sort(
          (a, b) =>
            (b.apeScore ?? 0) - (a.apeScore ?? 0) ||
            (b.matchesPlayed ?? 0) - (a.matchesPlayed ?? 0),
        ),
    );
  });
}

/** Add a (guest or member) player to an in-progress session, with a fresh score row. */
export async function addSessionPlayer(roomId, sessionId, playerId, displayName) {
  return ensureSessionPlayer(roomId, sessionId, playerId, displayName, { joinCurrentHand: true });
}

/** Add a robot seat — joins via enrollment and auto-plays tricks when the hand is live. */
export async function addSessionRobot(roomId, sessionId, displayName) {
  const playerId = createRobotPlayerId();
  return ensureSessionPlayer(roomId, sessionId, playerId, displayName, {
    joinCurrentHand: false,
    isRobot: true,
  });
}

/** Add player to session only if they are not already on the score sheet. */
export async function ensureSessionPlayer(
  roomId,
  sessionId,
  playerId,
  displayName,
  { joinCurrentHand = false, isRobot = false } = {},
) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) return false;
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") return false;

  const scoreRef = scoreDoc(roomId, sessionId, playerId);
  const scoreSnap = await getDoc(scoreRef);
  if (scoreSnap.exists()) {
    if (displayName && scoreSnap.data().displayName !== displayName) {
      await updateDoc(scoreRef, { displayName, updatedAt: serverTimestamp() });
    }
    return false;
  }

  const handCount = sessionData.handCount || 0;
  const currentHand = sessionData.currentHand || { tricksByPlayer: {}, participantIds: [] };
  const participantIds = joinCurrentHand
    ? [...new Set([...(currentHand.participantIds || []), playerId])]
    : currentHand.participantIds || [];

  const allScoresSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedIds = [
    ...allScoresSnap.docs.map((d) => ({
      id: d.id,
      displayName: d.data()?.displayName || "",
    })),
    { id: playerId, displayName: displayName || "" },
  ]
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((r) => r.id);

  const sessionPatch = {
    players: arrayUnion({ playerId, displayName }),
    currentHand: {
      tricksByPlayer: currentHand.tricksByPlayer || {},
      participantIds,
    },
    updatedAt: serverTimestamp(),
  };
  if (sessionData.handEnrollment?.active && !joinCurrentHand) {
    sessionPatch.handEnrollment = mergePlayerIntoEnrollment(
      sessionData.handEnrollment,
      sessionData.dealerId,
      sortedIds,
    );
  }

  if (!isRobot) {
    await ensurePlayerDoc(playerId, displayName);
  }
  const batch = writeBatch(db);
  batch.update(sessionDoc(roomId, sessionId), sessionPatch);
  batch.set(scoreRef, {
    sessionId,
    roomId,
    playerId,
    displayName,
    tricksWon: 0,
    handsWon: 0,
    net: 0,
    total: 0,
    joinedAtHandCount: handCount,
    ...(isRobot ? { isRobot: true } : {}),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return true;
}

/**
 * When someone joins the room mid-session, add them to every in-progress session
 * so they appear in the score table and record-hand checkboxes.
 */
export async function syncSessionWithRoomMembers(roomId, sessionId, members) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists() || sessionSnap.data().status === "final") return;

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const existingIds = new Set(scoreSnap.docs.map((d) => d.id));

  const missing = members.filter((m) => m.userId && !existingIds.has(m.userId));
  await Promise.all(
    missing.map((m) =>
      ensureSessionPlayer(roomId, sessionId, m.userId, m.displayName, { joinCurrentHand: false }),
    ),
  );
  await ensureCurrentHandParticipants(roomId, sessionId);
}

/** Backfill participantIds for sessions created before v1.00.08. */
export async function ensureCurrentHandParticipants(roomId, sessionId) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists() || sessionSnap.data().status === "final") return;
  const currentHand = sessionSnap.data().currentHand || {};
  if (Array.isArray(currentHand.participantIds)) return;

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  await updateDoc(sessionDoc(roomId, sessionId), {
    currentHand: {
      tricksByPlayer: currentHand.tricksByPlayer || {},
      participantIds: [],
    },
    updatedAt: serverTimestamp(),
  });
}

/** Start enrollment when a session has an empty hand but no active enrollment. */
export async function ensureHandEnrollment(roomId, sessionId) {
  return callGameOrClient(
    () => gameEnsureHandEnrollment(roomId, sessionId),
    () => ensureHandEnrollmentClient(roomId, sessionId),
  );
}

async function ensureHandEnrollmentClient(roomId, sessionId) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) return;
  const data = sessionSnap.data();
  if (data.status === "final" || data.handEnrollment?.active) return;
  const phase = data.currentHand?.phase;
  if (phase === "draw" || phase === "play") return;
  const participantIds = data.currentHand?.participantIds || [];
  const tricks = data.currentHand?.tricksByPlayer || {};
  if (participantIds.length > 0 || Object.values(tricks).some((n) => (n || 0) > 0)) return;

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedIds = sortedScorePlayerIds(scoreSnap);
  if (sortedIds.length < 2) return;

  await updateDoc(sessionDoc(roomId, sessionId), {
    handEnrollment: buildHandEnrollment(sortedIds, data.dealerId),
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  });
}

/** Auto sit-out when the current player's enrollment window expires. */
export async function timeoutHandEnrollmentTurn(roomId, sessionId) {
  return callGameOrClient(
    () => gameTimeoutEnrollment(roomId, sessionId),
    () => timeoutHandEnrollmentTurnClient(roomId, sessionId),
  );
}

async function timeoutHandEnrollmentTurnClient(roomId, sessionId) {
  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedPlayerIds = sortedScorePlayerIds(scoreSnap);
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  const ref = sessionDoc(roomId, sessionId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const sessionData = snap.data();
    const enrollment = sessionData.handEnrollment;
    if (!enrollment?.active || Date.now() < enrollment.turnDeadlineMs) return;

    const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
    const enrolledIds = [...(enrollment.enrolledIds || [])];
    const declinedIds = [...(enrollment.declinedIds || []), currentId];
    const patch = enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
      dealerId: sessionData.dealerId,
      sortedPlayerIds,
      seed: Date.now(),
      dealingRule,
    });
    writePrivateHandsToTransaction(tx, roomId, sessionId, patch.privateHandsByPlayer);
    const { privateHandsByPlayer: _omit, ...sessionPatch } = patch;
    tx.update(ref, { ...sessionPatch, updatedAt: serverTimestamp() });
  });
}

/** Each signed-in player toggles only their own participation in the current hand. */
export async function setHandParticipation(roomId, sessionId, { playerId, inHand, actorId }) {
  return callGameOrClient(
    () => gameSetHandParticipation(roomId, sessionId, { playerId, inHand, actorId }),
    () => setHandParticipationClient(roomId, sessionId, { playerId, inHand, actorId }),
  );
}

async function setHandParticipationClient(roomId, sessionId, { playerId, inHand, actorId }) {
  if (!playerId || !actorId) throw new Error("Missing player");
  if (playerId !== actorId && !isRobotPlayerId(playerId)) {
    throw new Error("You can only change your own hand participation");
  }

  const ref = sessionDoc(roomId, sessionId);
  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedPlayerIds = sortedScorePlayerIds(scoreSnap);
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new Error("Session is final");

    const enrollment = sessionData.handEnrollment;
    if (enrollment?.active) {
      if (!inHand) throw new Error("Wait for your turn or let the timer run out");
      const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
      if (playerId !== currentId) throw new Error("Not your turn to join yet");
      const enrolledIds = [...(enrollment.enrolledIds || []), playerId];
      const declinedIds = [...(enrollment.declinedIds || [])];
      const patch = enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
        dealerId: sessionData.dealerId,
        sortedPlayerIds,
        seed: Date.now(),
        dealingRule,
      });
      writePrivateHandsToTransaction(tx, roomId, sessionId, patch.privateHandsByPlayer);
      const { privateHandsByPlayer: _omit, ...sessionPatch } = patch;
      tx.update(ref, { ...sessionPatch, updatedAt: serverTimestamp() });
      return;
    }

    const currentHand = sessionData.currentHand || emptyPreDealHand();
    const tricksByPlayer = { ...(currentHand.tricksByPlayer || {}) };
    let participantIds = [...(currentHand.participantIds || [])];

    if (inHand) {
      if (!participantIds.includes(playerId)) participantIds.push(playerId);
    } else {
      participantIds = participantIds.filter((id) => id !== playerId);
      delete tricksByPlayer[playerId];
    }

    tx.update(ref, {
      currentHand: { ...currentHand, tricksByPlayer, participantIds },
      updatedAt: serverTimestamp(),
    });
  });
}

/** @deprecated Use setHandParticipation — kept for compatibility. */
export async function updateSessionHandParticipants(roomId, sessionId, participantIds) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) throw new Error("Session not found");
  if (sessionSnap.data().status === "final") throw new Error("Session is final");

  const ids = [...new Set(participantIds.filter(Boolean))];
  const currentHand = sessionSnap.data().currentHand || { tricksByPlayer: {} };
  await updateDoc(sessionDoc(roomId, sessionId), {
    currentHand: {
      tricksByPlayer: currentHand.tricksByPlayer || {},
      participantIds: ids,
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * Persist ranking results from a completed session and finalize it.
 * @param {string} roomId
 * @param {string} sessionId
 * @param {{id, displayName, placement, mu, sigma, matchesPlayed, apeScore,
 *          apeClass, apeStatus, momentum}[]} results
 */
export async function applyRankingResults(roomId, sessionId, results) {
  const batch = writeBatch(db);
  results.forEach((r) => {
    batch.set(
      playerDoc(r.id),
      {
        displayName: r.displayName,
        mu: r.mu,
        sigma: r.sigma,
        matchesPlayed: r.matchesPlayed,
        apeScore: r.apeScore,
        apeClass: r.apeClass,
        apeStatus: r.apeStatus,
        momentum: r.momentum,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
  batch.update(sessionDoc(roomId, sessionId), {
    status: "final",
    results: results.map((r) => ({
      playerId: r.id,
      displayName: r.displayName,
      placement: r.placement,
      apeScore: r.apeScore,
      momentum: r.momentum,
    })),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

/** Ask Cloud Functions to run bot enrollment / draw / play through robot turns. */
export async function advanceSessionBots(roomId, sessionId) {
  if (!SERVER_HAND_AUTHORITY) return { status: "skipped" };
  return gameAdvanceBots(roomId, sessionId);
}

// Firestore Timestamp | server placeholder | undefined → comparable seconds.
function seconds(ts) {
  if (ts && typeof ts.seconds === "number") return ts.seconds;
  return 0;
}
