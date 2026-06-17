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
//   { inviteCode, ownerId, name, houseRules, bourreSettings,
//     sessionNamePool: [4 regional preset names in room-locked order],
//     claimedSessionNames: [preset names currently used by open/final sessions],
//     status: "open" | "active" | "closed", createdAt }
//
// roomMembers/{roomId}_{uid}        (flat collection for easy membership queries)
//   { roomId, userId, displayName, role: "owner" | "player", joinedAt }
//
// inviteLookups/{inviteCode}          (doc id = normalized code, e.g. ABC-D23)
//   { roomId, ownerId, createdAt }
//
// rooms/{roomId}/sessions/{sessionId}     (sessions are a subcollection of room)
//   { roomId, sessionName, status: "in_progress" | "final", handCount, handStake, handStakeLocked,
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
import { tiesHouseRuleAllowsSplit } from "./house-rules.js";
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
import {
  MAX_ROOM_SESSIONS,
  assignSessionNamesForMigration,
  isValidSessionNamePool,
  nextAvailableSessionName,
  pickClaimedNamesForCreate,
  randomizePresetOrder,
  seededPresetOrder,
} from "./session-presets.js";

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
  arrayRemove,
  deleteField,
  runTransaction,
} = await import(`${CDN}/firebase-firestore.js`);

// Initial TrueSkill rating for a brand-new player (kept in sync with
// ranking.js; duplicated here so the data layer has no UI/logic dependency).
const RATING_INITIAL = { mu: 25, sigma: 25 / 3, matchesPlayed: 0 };
const RATING_INITIAL_APE = Math.round(Math.max(0, 25 - 3 * (25 / 3))); // = 0

const db = getFirestore(app);

/** Cloud Functions may be unavailable in production — fall back to client transactions. */
function isPermissionDenied(err) {
  const code = err?.code ?? "";
  return code === "permission-denied" || code === "PERMISSION_DENIED";
}

function isEnrollmentPermissionError(err) {
  if (isPermissionDenied(err)) return true;
  const code = String(err?.code ?? "");
  const msg = String(err?.message ?? err).toLowerCase();
  return (
    code === "functions/permission-denied" ||
    msg.includes("missing or insufficient permissions") ||
    msg.includes("insufficient permissions")
  );
}

function describeEnrollmentStartError(err) {
  if (isEnrollmentPermissionError(err)) {
    return new Error(
      "Missing or insufficient permissions to open the join window. Refresh and tap Go to Table again. If it persists, deploy Firestore rules and Cloud Functions (npm run deploy).",
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

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

/** Normalize enrollment deadline (Firestore may return Timestamp objects). */
export function enrollmentDeadlineMs(enrollment) {
  const raw = enrollment?.turnDeadlineMs;
  if (raw == null) return 0;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw.toMillis === "function") return raw.toMillis();
  if (typeof raw === "object" && typeof raw.seconds === "number") {
    return raw.seconds * 1000 + Math.floor((raw.nanoseconds || 0) / 1e6);
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Enrollment uses client Firestore first — works when callables are missing or return noop. */
async function callEnrollmentAction(clientFn, serverFn) {
  try {
    return await clientFn();
  } catch (clientErr) {
    if (!SERVER_HAND_AUTHORITY) throw describeEnrollmentStartError(clientErr);
    console.warn("Client enrollment write failed, trying Cloud Function.", clientErr?.code || clientErr);
    try {
      return await serverFn();
    } catch (serverErr) {
      throw describeEnrollmentStartError(isEnrollmentPermissionError(serverErr) ? serverErr : clientErr);
    }
  }
}

/** Draw/play/settlement — client Firestore first (works when callables are missing). */
async function callGameOrClient(clientFn, serverFn) {
  try {
    return await clientFn();
  } catch (clientErr) {
    if (!SERVER_HAND_AUTHORITY) throw clientErr;
    console.warn(
      "Client game write failed, trying Cloud Function.",
      clientErr?.code || clientErr?.message || clientErr,
    );
    try {
      return await serverFn();
    } catch (serverErr) {
      if (isCloudFunctionUnavailable(serverErr)) throw clientErr;
      throw serverErr;
    }
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
    sessionNamePool: randomizePresetOrder(),
    claimedSessionNames: [],
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
  const membershipRef = doc(db, "roomMembers", memberId(roomId, user.uid));
  const displayName =
    user.displayName?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "Player";
  // Create membership first — room reads require isMember(); verifying the room doc
  // before join always fails with permission-denied for non-owners.
  await setDoc(
    membershipRef,
    {
      roomId,
      userId: user.uid,
      displayName,
      role: "player",
      joinedAt: serverTimestamp(),
    },
    { merge: true },
  );
  const membershipSnap = await getDoc(membershipRef);
  if (!membershipSnap.exists()) {
    throw new Error("Could not confirm room membership — try Join room again.");
  }
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  if (!roomSnap.exists()) {
    try {
      await deleteDoc(membershipRef);
    } catch (err) {
      console.warn("rollback membership after stale join:", err);
    }
    try {
      await deleteDoc(doc(db, "inviteLookups", inviteCode));
    } catch (err) {
      if (err?.code !== "permission-denied" && err?.code !== "not-found") {
        console.warn("stale inviteLookup delete skipped:", err);
      }
    }
    throw new Error(
      "That invite code is no longer valid — the room was deleted. Ask the host for a new code.",
    );
  }
  // Clear legacy ban entries so rejoin after an old kick works.
  if (Array.isArray(roomSnap.data().bannedUserIds) && roomSnap.data().bannedUserIds.includes(user.uid)) {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        bannedUserIds: arrayRemove(user.uid),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("clear legacy ban on join:", err);
    }
  }
  return roomId;
}

/** Remove this user from a room (hides it from their list). */
export async function leaveRoom(roomId, user) {
  if (!user?.uid) throw new Error("Not signed in");
  await deleteDoc(doc(db, "roomMembers", memberId(roomId, user.uid)));
}

/** Room owner removes another member from the room. Session scores stay so tricks
 *  and winnings for the current hand/session are preserved. They may rejoin with the invite code. */
export async function kickRoomMember(roomId, targetUserId, actor) {
  if (!actor?.uid) throw new Error("Not signed in");
  if (!targetUserId) throw new Error("Missing member");
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  if (!roomSnap.exists()) throw new Error("Room not found");
  const ownerId = roomSnap.data().ownerId;
  if (ownerId !== actor.uid) {
    throw new Error("Only the room owner can remove members.");
  }
  if (targetUserId === actor.uid) {
    throw new Error("Use Leave room to remove yourself.");
  }
  if (targetUserId === ownerId) {
    throw new Error("Cannot remove the room owner.");
  }

  await deleteDoc(doc(db, "roomMembers", memberId(roomId, targetUserId)));

  // Best-effort: clear legacy ban flag from earlier builds (kick no longer bans).
  if (Array.isArray(roomSnap.data().bannedUserIds) && roomSnap.data().bannedUserIds.includes(targetUserId)) {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        bannedUserIds: arrayRemove(targetUserId),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("clear legacy ban on kick:", err);
    }
  }
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

/** Remove a player from enrollment rotation when they leave mid-signup. */
function removePlayerFromEnrollment(enrollment, removedId, dealerId, sortedPlayerIds) {
  if (!enrollment?.active) return enrollment;
  const orderedPlayerIds = enrollmentOrderFromDealer(dealerId, sortedPlayerIds);
  const enrolledIds = (enrollment.enrolledIds || []).filter((id) => id !== removedId);
  const declinedIds = (enrollment.declinedIds || []).filter((id) => id !== removedId);
  const previousId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
  let currentIndex =
    previousId === removedId ? 0 : orderedPlayerIds.indexOf(previousId ?? "");
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= orderedPlayerIds.length) currentIndex = 0;
  return {
    ...enrollment,
    orderedPlayerIds,
    currentIndex,
    enrolledIds,
    declinedIds,
  };
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

/** Clockwise seat order from session roster (join order), then any extra score rows. */
export function seatPlayerIds(sessionData, scoreSnap) {
  const scoreById = Object.fromEntries(
    scoreSnap.docs.map((d) => [d.id, d.data()?.displayName || ""]),
  );
  const fromSession = (sessionData?.players || [])
    .map((p) => p?.playerId)
    .filter((id) => id && id in scoreById);
  const seen = new Set(fromSession);
  const extras = Object.keys(scoreById)
    .filter((id) => !seen.has(id))
    .sort((a, b) => scoreById[a].localeCompare(scoreById[b]));
  return [...fromSession, ...extras];
}

/** Clockwise order starting with the first seat after the dealer. */
export function enrollmentOrderFromDealer(dealerId, sortedPlayerIds) {
  return playerOrderFromDealer(dealerId, sortedPlayerIds);
}

/** Writable on legacy Firestore rules (not in sessionGameFieldsChanged). */
export const LIVE_ENROLLMENT_FIELD = "liveEnrollment";

/** Prefer liveEnrollment (client-writable); fall back to handEnrollment (Cloud Functions / create). */
export function getSessionEnrollment(sessionData) {
  const live = sessionData?.liveEnrollment;
  const livePhase = live?.deal?.publicHand?.phase ?? null;
  if (live?.active) return live;
  if (livePhase === "draw" || livePhase === "play") return null;
  if (sessionData?.handEnrollment?.active) return sessionData.handEnrollment;
  return sessionData?.handEnrollment ?? null;
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] };
}

/** Public hand from session.currentHand or legacy liveEnrollment.deal (writable without rules deploy). */
export function getSessionCurrentHand(sessionData) {
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  if (livePublic?.phase) return livePublic;
  return sessionData?.currentHand ?? emptyPreDealHand();
}

function publicHandSessionUpdate(sessionData, nextPublicHand) {
  if (sessionData?.liveEnrollment?.deal) {
    return {
      "liveEnrollment.deal.publicHand": nextPublicHand,
      updatedAt: serverTimestamp(),
    };
  }
  return { currentHand: nextPublicHand, updatedAt: serverTimestamp() };
}

function embeddedPrivateHandData(sessionData, playerId) {
  const hand = sessionData?.liveEnrollment?.deal?.privateHandsByPlayer?.[playerId];
  if (!hand?.cards) return null;
  return { cards: hand.cards };
}

async function readPrivateHandInTransaction(tx, roomId, sessionId, sessionData, playerId) {
  const embedded = embeddedPrivateHandData(sessionData, playerId);
  if (embedded) return embedded;
  const privateSnap = await tx.get(privateHandDoc(roomId, sessionId, playerId));
  return privateSnap.exists() ? privateSnap.data() : null;
}

function writePrivateHandInTransaction(tx, ref, sessionData, roomId, sessionId, playerId, serializedCards) {
  if (sessionData?.liveEnrollment?.deal?.privateHandsByPlayer) {
    tx.update(ref, {
      [`liveEnrollment.deal.privateHandsByPlayer.${playerId}.cards`]: serializedCards,
      updatedAt: serverTimestamp(),
    });
    return;
  }
  tx.set(privateHandDoc(roomId, sessionId, playerId), {
    cards: serializedCards,
    updatedAt: serverTimestamp(),
  });
}

function applyEnrollmentDealInTransaction(tx, ref, patch) {
  tx.update(ref, {
    [LIVE_ENROLLMENT_FIELD]: {
      active: false,
      deal: {
        publicHand: patch.currentHand,
        sortedPlayerIds: patch.sortedPlayerIds,
        privateHandsByPlayer: patch.privateHandsByPlayer,
      },
    },
    updatedAt: serverTimestamp(),
  });
}

/** After client deal, mirror publicHand to currentHand when rules allow (trump UI on prod). */
async function syncDealPublicHandBestEffort(roomId, sessionId, publicHand) {
  if (!publicHand?.phase) return;
  try {
    await updateDoc(sessionDoc(roomId, sessionId), {
      currentHand: publicHand,
      handEnrollment: deleteField(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    if (!isPermissionDenied(err)) console.warn("currentHand sync after deal:", err);
  }
}

function applyEnrollmentStepLegacy(tx, ref, patch) {
  if (patch.privateHandsByPlayer) {
    applyEnrollmentDealInTransaction(tx, ref, patch);
    return;
  }
  tx.update(ref, {
    handEnrollment: patch.handEnrollment,
    [LIVE_ENROLLMENT_FIELD]: patch.handEnrollment,
    ...(patch.currentHand ? { currentHand: patch.currentHand } : {}),
    updatedAt: serverTimestamp(),
  });
}

function applyEnrollmentStepInTransaction(tx, ref, roomId, sessionId, patch, mode = "live") {
  if (mode === "legacy") {
    applyEnrollmentStepLegacy(tx, ref, patch);
    return;
  }
  if (patch.privateHandsByPlayer) {
    // Embed private hands on the session (liveEnrollment is client-writable on prod rules).
    // Subcollection privateHands requires a rules deploy; sync best-effort after commit.
    applyEnrollmentDealInTransaction(tx, ref, patch);
    return;
  }
  tx.update(ref, {
    [LIVE_ENROLLMENT_FIELD]: patch.handEnrollment,
    ...(patch.currentHand ? { currentHand: patch.currentHand } : {}),
    updatedAt: serverTimestamp(),
  });
}

async function runEnrollmentStepTransaction(roomId, sessionId, buildPatch, { requirePatch = false } = {}) {
  const ref = sessionDoc(roomId, sessionId);
  let dealPrivateHands = null;
  let dealPublicHand = null;
  let applied = false;

  async function attempt(mode) {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Session not found");
      const patch = buildPatch(snap.data());
      if (!patch) {
        if (requirePatch) throw new Error("Enrollment step did not apply");
        return;
      }
      applied = true;
      if (patch.privateHandsByPlayer) {
        dealPrivateHands = patch.privateHandsByPlayer;
        dealPublicHand = patch.currentHand ?? null;
      }
      applyEnrollmentStepInTransaction(tx, ref, roomId, sessionId, patch, mode);
    });
  }

  try {
    await attempt("live");
  } catch (err) {
    if (!isPermissionDenied(err) && err?.message !== "Enrollment step did not apply") throw err;
    applied = false;
    dealPrivateHands = null;
    dealPublicHand = null;
    await attempt("legacy");
  }
  if (requirePatch && !applied) throw new Error("Enrollment step did not apply");
  if (dealPrivateHands) {
    writePrivateHandsBestEffort(roomId, sessionId, dealPrivateHands);
    await syncDealPublicHandBestEffort(roomId, sessionId, dealPublicHand);
  }
}

function writePrivateHandsBestEffort(roomId, sessionId, privateHandsByPlayer) {
  if (!privateHandsByPlayer) return;
  const batch = writeBatch(db);
  for (const [playerId, hand] of Object.entries(privateHandsByPlayer)) {
    batch.set(privateHandDoc(roomId, sessionId, playerId), {
      cards: hand.cards,
      updatedAt: serverTimestamp(),
    });
  }
  batch.commit().catch((err) => {
    if (err?.code !== "permission-denied") console.warn("privateHands sync:", err);
  });
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

function enrollmentFieldsForCreate(_sortedIds, _dealerId) {
  /** Enrollment (I'm in timer) starts only when a member opens Go to Table — not on create/settle. */
  return {};
}

/** Clear join window between hands; next window opens from Go to Table. */
function clearedEnrollmentBetweenHands() {
  return {
    handEnrollment: deleteField(),
    [LIVE_ENROLLMENT_FIELD]: deleteField(),
  };
}

function clearLiveEnrollmentDealPatch() {
  return { "liveEnrollment.deal": deleteField() };
}

function isClearedPreDealHand(hand) {
  const h = hand ?? emptyPreDealHand();
  if (h.phase === "draw" || h.phase === "play") return false;
  if ((h.participantIds?.length ?? 0) > 0) return false;
  const tricks = h.tricksByPlayer ?? {};
  return !Object.values(tricks).some((n) => (n || 0) > 0);
}

/** True when the session is between hands (enrollment / pre-deal), not mid draw or play. */
function isHandoffState(sessionData) {
  return isClearedPreDealHand(sessionData?.currentHand);
}

/** Leftover liveEnrollment.deal after settlement — safe to clear before reopening join window. */
function isStaleLiveDealSnapshot(sessionData) {
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  if (!livePublic?.phase) return false;
  if (getSessionEnrollment(sessionData)?.active) return false;
  if (sessionData?.pendingCoWinSettlement) return false;
  if (!isClearedPreDealHand(sessionData?.currentHand)) return false;
  return isHandComplete(livePublic.tricksByPlayer || {}, livePublic.participantIds || []);
}

/** Clear leftover liveEnrollment.deal between hands without touching an active draw/play hand. */
function shouldClearStaleLiveEnrollment(sessionData) {
  if (!sessionData?.liveEnrollment?.deal) return false;
  if (isStaleLiveDealSnapshot(sessionData)) return true;
  const livePhase = sessionData.liveEnrollment.deal.publicHand?.phase ?? null;
  if (livePhase === "draw" || livePhase === "play") return false;
  return isHandoffState(sessionData);
}

function clearStaleLiveEnrollmentPatch() {
  /** liveEnrollment is not in sessionGameFieldsChanged — members can clear stale deal snapshots. */
  return {
    [LIVE_ENROLLMENT_FIELD]: deleteField(),
    updatedAt: serverTimestamp(),
  };
}

function writeLiveEnrollmentOpenPatch(enrollment) {
  /** Open/refresh join window without touching handEnrollment/currentHand (works on prod rules). */
  return {
    [LIVE_ENROLLMENT_FIELD]: enrollment,
    updatedAt: serverTimestamp(),
  };
}

function clearedHandoffEnrollmentPatch() {
  return {
    ...clearStaleLiveEnrollmentPatch(),
    handEnrollment: deleteField(),
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  };
}

async function clearStaleHandoffArtifacts(roomId, sessionId) {
  try {
    await updateDoc(sessionDoc(roomId, sessionId), clearStaleLiveEnrollmentPatch());
  } catch (err) {
    if (!isPermissionDenied(err)) throw err;
    await updateDoc(sessionDoc(roomId, sessionId), clearedHandoffEnrollmentPatch());
  }
}

function writeEnrollmentPatch(enrollment) {
  return {
    [LIVE_ENROLLMENT_FIELD]: enrollment,
    handEnrollment: enrollment,
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  };
}

async function writeEnrollmentOpenWithFallback(sessionRef, enrollment) {
  try {
    await updateDoc(sessionRef, writeLiveEnrollmentOpenPatch(enrollment));
  } catch (err) {
    if (!isPermissionDenied(err)) throw err;
    await updateDoc(sessionRef, writeEnrollmentPatch(enrollment));
  }
}

function logHandLifecycleTransition(transition) {
  if (typeof console !== "undefined" && console.info) {
    console.info(
      `[hand-lifecycle] ${transition.from} → ${transition.to}: ${transition.reason}${
        transition.blockedBy ? ` blockedBy=${transition.blockedBy}` : ""
      }`,
    );
  }
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
    sortedPlayerIds,
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
  const currentHand = getSessionCurrentHand(sessionData);
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

  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const allowSplitVote = tiesHouseRuleAllowsSplit(roomSnap.data()?.houseRules);
  if (allowSplitVote) {
    const pending = sessionData.pendingCoWinSettlement;
    const proposal = { participantIds, winnerIds };
    const nextPending = sameCoWinProposal(pending, proposal)
      ? pending
      : { ...proposal, votes: {}, updatedAt: serverTimestamp() };

    await updateDoc(sessionDoc(roomId, sessionId), {
      pendingCoWinSettlement: nextPending,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await recordHand(roomId, sessionId, {
    winnerIds,
    participantIds,
    settlement: "co_win_carry",
    recordedBy,
    tricksByPlayer,
  });
}

/** Draw/discard during the draw phase — server-validated via Cloud Function. */
export async function submitHandDraw(roomId, sessionId, { playerId, discardIndices, actorId }) {
  return callGameOrClient(
    () => submitHandDrawClient(roomId, sessionId, { playerId, discardIndices, actorId }),
    () => gameSubmitDraw(roomId, sessionId, { playerId, discardIndices, actorId }),
  );
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

    const currentHand = getSessionCurrentHand(sessionData);
    if (currentHand.phase !== HAND_PHASE.DRAW) throw new Error("Not in draw phase");
    if (currentHand.turnPlayerId !== playerId) throw new Error("Not your turn to draw");
    if ((currentHand.drawCompletedIds || []).includes(playerId)) {
      throw new Error("Draw already completed");
    }

    const handData = await readPrivateHandInTransaction(tx, roomId, sessionId, sessionData, playerId);
    if (!handData) throw new Error("Private hand not found");

    const hand = deserializeCards(handData.cards || []);
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

    writePrivateHandInTransaction(
      tx,
      ref,
      sessionData,
      roomId,
      sessionId,
      playerId,
      serializeCards(drawResult.privateHand),
    );
    tx.update(ref, publicHandSessionUpdate(sessionData, nextPublic));
  });
}

/** Play one card during trick play — server-validated via Cloud Function. */
export async function playHandCard(roomId, sessionId, { playerId, cardIndex, actorId }) {
  return callGameOrClient(
    () => playHandCardClient(roomId, sessionId, { playerId, cardIndex, actorId }),
    () => gamePlayCard(roomId, sessionId, { playerId, cardIndex, actorId }),
  );
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

    const currentHand = getSessionCurrentHand(sessionData);
    if (currentHand.phase !== HAND_PHASE.PLAY) throw new Error("Not in trick-play phase");

    const handData = await readPrivateHandInTransaction(tx, roomId, sessionId, sessionData, playerId);
    if (!handData) throw new Error("Private hand not found");

    const hand = deserializeCards(handData.cards || []);
    const result = applyPlayerPlayCard({
      publicHand: currentHand,
      privateHand: hand,
      playerId,
      cardIndex,
      actionOrder: actionOrderFromHand(currentHand),
      cinchEnabled: currentHand.cinchEnabled === true,
    });

    handComplete = result.handComplete;

    writePrivateHandInTransaction(
      tx,
      ref,
      sessionData,
      roomId,
      sessionId,
      playerId,
      serializeCards(result.privateHand),
    );
    tx.update(ref, publicHandSessionUpdate(sessionData, result.publicHand));
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
  const sessionData = sessionSnap.data() || {};
  const ch = getSessionCurrentHand(sessionData);
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
  const ch = getSessionCurrentHand(sessionSnap.data() || {});
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

/** Best-effort removal of hole-card docs before the session doc is deleted. */
async function purgePrivateHandsForSession(roomId, sessionId) {
  const snap = await getDocs(privateHandsCol(roomId, sessionId));
  if (snap.empty) return;
  try {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    if (!isPermissionDenied(err)) throw err;
    for (const d of snap.docs) {
      try {
        await deleteDoc(d.ref);
      } catch {
        try {
          await updateDoc(d.ref, { cards: [], updatedAt: serverTimestamp() });
        } catch {
          /* leave orphaned doc — session delete can still proceed */
        }
      }
    }
  }
}

/** Clear hole-card docs after settlement once enrollment is active on the session. */
async function clearPrivateHandsAfterSettlement(roomId, sessionId) {
  const snap = await getDocs(privateHandsCol(roomId, sessionId));
  if (snap.empty) return;
  try {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    if (!isPermissionDenied(err)) throw err;
    const batch = writeBatch(db);
    snap.docs.forEach((d) =>
      batch.update(d.ref, { cards: [], updatedAt: serverTimestamp() }),
    );
    await batch.commit();
  }
}

function settlementError(err) {
  if (isPermissionDenied(err)) {
    return new Error(
      "Hand settlement was blocked (missing or insufficient permissions). Sign in again, confirm you are still in this room, and ask the host to deploy updated Firestore rules if it persists.",
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

/** Live subscription to the signed-in player's private hand for the session. */
export function subscribePrivateHand(roomId, sessionId, playerId, callback, onError) {
  if (!roomId || !sessionId || !playerId) return () => {};

  const sessionRef = sessionDoc(roomId, sessionId);
  let privateSub = null;

  const unsubSession = onSnapshot(
    sessionRef,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const embedded = embeddedPrivateHandData(snap.data(), playerId);
      if (embedded) {
        if (privateSub) {
          privateSub();
          privateSub = null;
        }
        callback(embedded);
        return;
      }
      if (!privateSub) {
        privateSub = onSnapshot(
          privateHandDoc(roomId, sessionId, playerId),
          (privSnap) => callback(privSnap.exists() ? privSnap.data() : null),
          onError,
        );
      }
    },
    onError,
  );

  return () => {
    unsubSession();
    privateSub?.();
  };
}

/** One-shot read of a player's private hand (own hand only per security rules). */
export async function getPrivateHand(roomId, sessionId, playerId) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (sessionSnap.exists()) {
    const embedded = embeddedPrivateHandData(sessionSnap.data(), playerId);
    if (embedded) return embedded;
  }
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

function nextDealerId(scoreSnap, currentDealerId, sessionData) {
  const ids = seatPlayerIds(sessionData, scoreSnap);
  if (ids.length === 0) return null;
  const idx = ids.indexOf(currentDealerId);
  const base = idx >= 0 ? idx : 0;
  return ids[(base + 1) % ids.length];
}

export async function ensureRoomSessionNamePool(roomId) {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return null;

  let pool = roomSnap.data().sessionNamePool;
  const needsPool = !isValidSessionNamePool(pool);
  if (needsPool) {
    pool = seededPresetOrder(roomId);
  }

  const sessionsSnap = await getDocs(sessionsCol(roomId));
  const sessions = sessionsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: seconds(d.data().createdAt),
  }));
  const assignments = assignSessionNamesForMigration(pool, sessions);
  await Promise.all(
    [...assignments.entries()].map(([sessionId, sessionName]) =>
      updateDoc(sessionDoc(roomId, sessionId), {
        sessionName,
        updatedAt: serverTimestamp(),
      }),
    ),
  );

  const claimedSessionNames = [
    ...new Set(
      sessions
        .map((s) => s.sessionName || assignments.get(s.id))
        .filter(Boolean),
    ),
  ];

  const storedClaimed = Array.isArray(roomSnap.data().claimedSessionNames)
    ? roomSnap.data().claimedSessionNames.filter(Boolean)
    : [];
  const storedKey = [...storedClaimed].sort().join("\0");
  const claimedKey = [...claimedSessionNames].sort().join("\0");
  const needsClaimedPatch = storedKey !== claimedKey;

  if (needsPool || needsClaimedPatch || assignments.size > 0) {
    await updateDoc(roomRef, {
      ...(needsPool ? { sessionNamePool: pool } : {}),
      ...(needsClaimedPatch ? { claimedSessionNames } : {}),
      updatedAt: serverTimestamp(),
    });
  }
  return pool;
}

/** Sync room.claimedSessionNames with live sessions (repairs stale cap after deletes). */
export async function reconcileClaimedSessionNames(roomId) {
  const roomRef = doc(db, "rooms", roomId);
  const [roomSnap, sessionsSnap] = await Promise.all([
    getDoc(roomRef),
    getDocs(sessionsCol(roomId)),
  ]);
  if (!roomSnap.exists()) return [];

  const fromSessions = [
    ...new Set(
      sessionsSnap.docs.map((d) => d.data().sessionName).filter(Boolean),
    ),
  ];
  const stored = Array.isArray(roomSnap.data().claimedSessionNames)
    ? roomSnap.data().claimedSessionNames.filter(Boolean)
    : [];
  const storedKey = [...stored].sort().join("\0");
  const liveKey = [...fromSessions].sort().join("\0");
  if (storedKey !== liveKey) {
    await updateDoc(roomRef, {
      claimedSessionNames: fromSessions,
      updatedAt: serverTimestamp(),
    });
  }
  return fromSessions;
}

/** Read preset cap state without mutating the room doc (avoids tx version conflicts). */
export async function refreshRoomSessionCap(roomId) {
  const roomRef = doc(db, "rooms", roomId);
  const [roomSnap, sessionsSnap] = await Promise.all([
    getDoc(roomRef),
    getDocs(sessionsCol(roomId)),
  ]);
  const liveClaimed = [
    ...new Set(
      sessionsSnap.docs.map((d) => d.data().sessionName).filter(Boolean),
    ),
  ];
  return {
    room: roomSnap.exists() ? withId(roomSnap) : null,
    pool: roomSnap.exists() ? roomSnap.data().sessionNamePool : null,
    liveClaimed,
  };
}

export async function createSession(roomId, players, handStake = 1, bourreOpts = {}) {
  const preSessionsSnap = await getDocs(sessionsCol(roomId));
  const liveClaimed = [
    ...new Set(
      preSessionsSnap.docs.map((d) => d.data().sessionName).filter(Boolean),
    ),
  ];
  const stake = Math.max(1, Number(handStake) || 1);
  const limEnabled = bourreOpts.limEnabled === true;
  const rosterPlayers = players.filter((p) => p?.playerId);
  const sortedIds = rosterPlayers.map((p) => p.playerId);
  const initialDealer = sortedIds[0] ?? null;
  const sessionRef = doc(sessionsCol(roomId));
  let createdSessionId = null;
  let createdSessionName = null;

  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    const roomData = roomSnap.data();

    let pool = roomData.sessionNamePool;
    if (!isValidSessionNamePool(pool)) {
      pool = seededPresetOrder(roomId);
    }

    const docClaimed = Array.isArray(roomData.claimedSessionNames)
      ? roomData.claimedSessionNames.filter(Boolean)
      : [];
    const claimedNames = pickClaimedNamesForCreate(liveClaimed, docClaimed);

    const sessionName = nextAvailableSessionName(pool, claimedNames);
    if (!sessionName) {
      throw new Error("All 4 regional sessions already created for this room.");
    }

    const roomPatch = {
      claimedSessionNames: [...new Set([...liveClaimed, sessionName])],
      updatedAt: serverTimestamp(),
    };
    if (!isValidSessionNamePool(roomData.sessionNamePool)) {
      roomPatch.sessionNamePool = pool;
    }
    tx.update(roomRef, roomPatch);

    tx.set(sessionRef, {
      roomId,
      sessionName,
      status: "in_progress",
      handCount: 0,
      handStake: stake,
      handStakeLocked: false,
      limEnabled,
      carryOverPot: 0,
      dealerId: initialDealer,
      ...enrollmentFieldsForCreate(sortedIds, initialDealer),
      currentHand: emptyPreDealHand(),
      rounds: 0,
      players: rosterPlayers.map((p) => ({
        playerId: p.playerId,
        displayName: p.displayName || "Player",
      })),
      notes: "",
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    rosterPlayers.forEach((p) => {
      tx.set(scoreDoc(roomId, sessionRef.id, p.playerId), {
        sessionId: sessionRef.id,
        roomId,
        playerId: p.playerId,
        displayName: p.displayName || "Player",
        tricksWon: 0,
        handsWon: 0,
        net: 0,
        total: 0,
        joinedAtHandCount: 0,
        updatedAt: serverTimestamp(),
      });
    });
    createdSessionId = sessionRef.id;
    createdSessionName = sessionName;
  });

  return { id: createdSessionId, sessionName: createdSessionName };
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
  return callGameOrClient(
    () =>
      recordHandClient(roomId, sessionId, {
        winnerId,
        winnerIds,
        participantIds,
        settlement,
        recordedBy,
        tricksByPlayer,
      }),
    () =>
      gameRecordHand(roomId, sessionId, {
        winnerId,
        winnerIds,
        participantIds,
        settlement,
        recordedBy,
        tricksByPlayer,
      }),
  );
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
  const potCarryMode =
    mode === "push" || mode === "non_winner_ante_up" || mode === "co_win_carry";
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
  const handLedger = {
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
  };

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
    if (bourreIds.includes(pid)) {
      patch.skipNextAnte = true;
    }
    if (
      winners.includes(pid) &&
      winners.length >= 2 &&
      (mode === "co_win_carry" || mode === "non_winner_ante_up" || mode === "split")
    ) {
      patch.skipNextAnte = true;
    }
    if (isWinner && (mode === "split" || mode === "win")) {
      patch.handsWon = (current.handsWon || 0) + 1;
      patch.tricksWon = tricksWon;
      patch.total = Math.max(0, tricksWon);
    }
    if (mode === "non_winner_ante_up" || mode === "co_win_carry") {
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

  const newDealerId = nextDealerId(scoreSnap, sessionData.dealerId, sessionData);
  const seatIds = seatPlayerIds(sessionData, scoreSnap);
  batch.update(sessionDoc(roomId, sessionId), {
    handCount: handNumber,
    handStakeLocked: true,
    carryOverPot,
    dealerId: newDealerId,
    pendingCoWinSettlement: deleteField(),
    ...clearedEnrollmentBetweenHands(),
    ...clearLiveEnrollmentDealPatch(),
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (err) {
    throw settlementError(err);
  }

  try {
    await clearPrivateHandsAfterSettlement(roomId, sessionId);
  } catch (err) {
    console.warn("recordHand: privateHands cleanup deferred", err);
  }

  try {
    const handBatch = writeBatch(db);
    handBatch.set(doc(handsCol(roomId, sessionId)), handLedger);
    await handBatch.commit();
  } catch (err) {
    if (!isPermissionDenied(err)) throw err;
    console.warn("recordHand: hand ledger skipped (rules deploy pending)", err);
  }

  await recomputeSessionTotals(roomId, sessionId);
  logHandLifecycleTransition({
    from: "settle",
    to: "handoffToNextDeal",
    reason: "recordHand cleared hand; next join window opens on live table or Go to Table",
  });
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
  return callGameOrClient(
    () =>
      voteCoWinSettlementClient(roomId, sessionId, {
        participantIds,
        winnerIds,
        voterId,
        choice,
        recordedBy,
      }),
    () =>
      gameVoteCoWinSettlement(roomId, sessionId, {
        participantIds,
        winnerIds,
        voterId,
        choice,
        recordedBy,
      }),
  );
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

  const tricksByPlayer = getSessionCurrentHand(sessionData)?.tricksByPlayer || {};
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

  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const allowSplitVote = tiesHouseRuleAllowsSplit(roomSnap.data()?.houseRules);
  if (allowSplitVote) {
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
    return;
  }

  await recordHand(roomId, sessionId, {
    winnerIds,
    participantIds,
    settlement: "co_win_carry",
    recordedBy,
    tricksByPlayer,
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

/** Fetch score rows for a session (one-shot, for cleanup / completion). */
export async function getSessionScores(roomId, sessionId) {
  const snap = await getDocs(scoresCol(roomId, sessionId));
  return snap.docs
    .map(withId)
    .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
}

/** Fetch a session doc, or null if missing. */
export async function getSession(roomId, sessionId) {
  const snap = await getDoc(sessionDoc(roomId, sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Remove a completed session and its subcollections from the room. */
export async function deleteSession(roomId, sessionId) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) return;
  if (sessionSnap.data().status !== "final") {
    throw new Error("Only completed sessions can be removed");
  }

  const sessionName = sessionSnap.data().sessionName;

  const [scoresSnap, handsSnap] = await Promise.all([
    getDocs(scoresCol(roomId, sessionId)),
    getDocs(handsCol(roomId, sessionId)),
  ]);

  // Delete private hands while the session doc still exists (rules reference session state).
  await purgePrivateHandsForSession(roomId, sessionId);

  const batch = writeBatch(db);
  scoresSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(sessionDoc(roomId, sessionId));
  if (sessionName) {
    batch.update(doc(db, "rooms", roomId), {
      claimedSessionNames: arrayRemove(sessionName),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();

  if (handsSnap.empty) return;
  try {
    const handsBatch = writeBatch(db);
    handsSnap.docs.forEach((d) => handsBatch.delete(d.ref));
    await handsBatch.commit();
  } catch (err) {
    if (err?.code !== "permission-denied") throw err;
    console.warn("deleteSession: hand ledger retained (rules deploy pending)", err);
  }
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
  return ensureSessionPlayer(roomId, sessionId, playerId, displayName, { joinCurrentHand: false });
}

/** Add a robot seat — joins via enrollment and auto-plays tricks when the hand is live. */
export async function addSessionRobot(roomId, sessionId, displayName) {
  const playerId = createRobotPlayerId();
  return ensureSessionPlayer(roomId, sessionId, playerId, displayName, {
    joinCurrentHand: false,
    isRobot: true,
  });
}

/** Room owner removes a guest or robot from the open session score sheet. */
export async function removeSessionPlayer(roomId, sessionId, playerId, actor) {
  if (!actor?.uid) throw new Error("Not signed in");
  if (!playerId) throw new Error("Missing player");

  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  if (!roomSnap.exists()) throw new Error("Room not found");
  if (roomSnap.data().ownerId !== actor.uid) {
    throw new Error("Only the room owner can remove a guest or robot.");
  }

  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) throw new Error("Session not found");
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") throw new Error("Session is final");

  const currentHand = getSessionCurrentHand(sessionData);
  const phase = currentHand?.phase;
  if (phase === "draw" || phase === "play") {
    throw new Error("Cannot remove a player during draw or play — finish the hand first.");
  }

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  if (!scoreSnap.docs.some((d) => d.id === playerId)) {
    throw new Error("Player is not on this session.");
  }
  if (scoreSnap.size <= 2) {
    throw new Error("Need at least two players on the session.");
  }

  const remainingSorted = scoreSnap.docs
    .filter((d) => d.id !== playerId)
    .map((d) => ({ id: d.id, displayName: d.data()?.displayName || "" }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((r) => r.id);

  const sessionPatch = {
    players: (sessionData.players || []).filter((p) => p?.playerId !== playerId),
    updatedAt: serverTimestamp(),
  };

  const activeEnrollment = getSessionEnrollment(sessionData);
  if (activeEnrollment?.active) {
    sessionPatch[LIVE_ENROLLMENT_FIELD] = removePlayerFromEnrollment(
      activeEnrollment,
      playerId,
      sessionData.dealerId,
      remainingSorted,
    );
  }

  const batch = writeBatch(db);
  batch.delete(scoreDoc(roomId, sessionId, playerId));
  batch.update(sessionDoc(roomId, sessionId), sessionPatch);
  await batch.commit();
  return true;
}

/** Add a (guest or member) player to an in-progress session, with a fresh score row. */
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
  const currentHand = getSessionCurrentHand(sessionData);
  const activeEnrollment = getSessionEnrollment(sessionData);

  const allScoresSnap = await getDocs(scoresCol(roomId, sessionId));
  const rosterIds = seatPlayerIds(sessionData, allScoresSnap);
  const sortedIds = rosterIds.includes(playerId) ? rosterIds : [...rosterIds, playerId];

  const sessionPatch = {
    players: arrayUnion({ playerId, displayName }),
    updatedAt: serverTimestamp(),
  };
  if (activeEnrollment?.active) {
    sessionPatch[LIVE_ENROLLMENT_FIELD] = mergePlayerIntoEnrollment(
      activeEnrollment,
      sessionData.dealerId,
      sortedIds,
    );
  } else if (joinCurrentHand) {
    const participantIds = [...new Set([...(currentHand.participantIds || []), playerId])];
    sessionPatch.currentHand = {
      tricksByPlayer: currentHand.tricksByPlayer || {},
      participantIds,
    };
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
  if (SERVER_HAND_AUTHORITY) {
    try {
      const serverResult = await gameEnsureHandEnrollment(roomId, sessionId);
      if (serverResult?.status === "started" || serverResult?.status === "refreshed") {
        return serverResult;
      }
    } catch (serverErr) {
      console.warn(
        "gameEnsureHandEnrollment failed, trying client enrollment write.",
        serverErr?.code || serverErr?.message || serverErr,
      );
    }
  }

  await callEnrollmentAction(
    () => ensureHandEnrollmentClient(roomId, sessionId),
    () => gameEnsureHandEnrollment(roomId, sessionId),
  );

  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) return;
  if (!getSessionEnrollment(sessionSnap.data())?.active) {
    throw new Error(
      "Join window could not start — refresh and tap Go to Table again. If you see permission errors, deploy rules and functions (npm run deploy).",
    );
  }
}

async function ensureHandEnrollmentClient(roomId, sessionId) {
  const sessionRef = sessionDoc(roomId, sessionId);
  let sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists()) return;
  let data = sessionSnap.data();
  if (data.status === "final") return;

  if (shouldClearStaleLiveEnrollment(data)) {
    await clearStaleHandoffArtifacts(roomId, sessionId);
    sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) return;
    data = sessionSnap.data();
  }

  const existing = getSessionEnrollment(data);
  if (existing?.active) {
    const refreshedEnrollment = {
      ...existing,
      turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
    };
    await writeEnrollmentOpenWithFallback(sessionRef, refreshedEnrollment);
    logHandLifecycleTransition({
      from: "opening",
      to: "opening",
      reason: "ensureHandEnrollment refreshed join window (Go to Table)",
    });
    return;
  }

  const currentHand = getSessionCurrentHand(data);
  const phase = currentHand?.phase;
  if (phase === "draw" || phase === "play") return;
  const participantIds = currentHand?.participantIds || [];
  const tricks = currentHand?.tricksByPlayer || {};
  if (participantIds.length > 0 || Object.values(tricks).some((n) => (n || 0) > 0)) {
    if (isHandoffState(data)) {
      await clearStaleHandoffArtifacts(roomId, sessionId);
      sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) return;
      data = sessionSnap.data();
    } else {
      return;
    }
  }

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedIds = seatPlayerIds(data, scoreSnap);
  if (sortedIds.length < 2) return;

  const enrollment = buildHandEnrollment(sortedIds, data.dealerId);
  try {
    await writeEnrollmentOpenWithFallback(sessionRef, enrollment);
  } catch (err) {
    if (!isEnrollmentPermissionError(err)) throw err;
    await clearStaleHandoffArtifacts(roomId, sessionId);
    await writeEnrollmentOpenWithFallback(sessionRef, enrollment);
  }
  logHandLifecycleTransition({
    from: "handoffToNextDeal",
    to: "opening",
    reason: "ensureHandEnrollment opened join window",
  });
}

/** Auto sit-out when the current player's enrollment window expires. */
export async function timeoutHandEnrollmentTurn(roomId, sessionId) {
  return callEnrollmentAction(
    () => timeoutHandEnrollmentTurnClient(roomId, sessionId),
    () => gameTimeoutEnrollment(roomId, sessionId),
  );
}

async function timeoutHandEnrollmentTurnClient(roomId, sessionId) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedPlayerIds = seatPlayerIds(sessionSnap.data(), scoreSnap);
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;

  await runEnrollmentStepTransaction(roomId, sessionId, (sessionData) => {
    const enrollment = getSessionEnrollment(sessionData);
    if (!enrollment?.active) return null;
    if (Date.now() < enrollmentDeadlineMs(enrollment)) return null;

    const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
    const enrolledIds = [...(enrollment.enrolledIds || [])];
    const declinedIds = [...(enrollment.declinedIds || []), currentId];
    return enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
      dealerId: sessionData.dealerId,
      sortedPlayerIds,
      seed: Date.now(),
      dealingRule,
    });
  });
}

/** Each signed-in player toggles only their own participation in the current hand. */
export async function setHandParticipation(roomId, sessionId, { playerId, inHand, actorId }) {
  return callEnrollmentAction(
    () => setHandParticipationClient(roomId, sessionId, { playerId, inHand, actorId }),
    () => gameSetHandParticipation(roomId, sessionId, { playerId, inHand, actorId }),
  );
}

async function setHandParticipationClient(roomId, sessionId, { playerId, inHand, actorId }) {
  if (!playerId || !actorId) throw new Error("Missing player");
  if (playerId !== actorId && !isRobotPlayerId(playerId)) {
    throw new Error("You can only change your own hand participation");
  }

  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) throw new Error("Session not found");
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") throw new Error("Session is final");

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedPlayerIds = seatPlayerIds(sessionData, scoreSnap);
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;

  const enrollment = getSessionEnrollment(sessionData);
  if (enrollment?.active) {
    if (!inHand) throw new Error("Wait for your turn or let the timer run out");
    const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
    if (playerId !== currentId) throw new Error("Not your turn to join yet");
    if ((enrollment.enrolledIds || []).includes(playerId)) return;

    await runEnrollmentStepTransaction(
      roomId,
      sessionId,
      (data) => {
        const activeEnrollment = getSessionEnrollment(data);
        if (!activeEnrollment?.active) return null;
        const turnId = activeEnrollment.orderedPlayerIds[activeEnrollment.currentIndex];
        if (playerId !== turnId) return null;
        if ((activeEnrollment.enrolledIds || []).includes(playerId)) return null;
        const enrolledIds = [...(activeEnrollment.enrolledIds || []), playerId];
        const declinedIds = [...(activeEnrollment.declinedIds || [])];
        return enrollmentPatchAfterStep(activeEnrollment, enrolledIds, declinedIds, {
          dealerId: data.dealerId,
          sortedPlayerIds,
          seed: Date.now(),
          dealingRule,
        });
      },
      { requirePatch: true },
    );
    return;
  }

  const ref = sessionDoc(roomId, sessionId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Session not found");
    const data = snap.data();
    if (data.status === "final") throw new Error("Session is final");

    const currentHand = data.currentHand || emptyPreDealHand();
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
