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
//   { roomId, sessionName, status: "in_progress" | "final", handCount, buyInAmount, handStake, handStakeLocked,
//     players: [{ playerId, displayName }],
//     notes,                          // informational ONLY — never money
//     totals: { byPlayer: { [playerId]: tricks }, netByPlayer: { [playerId]: net }, tricks },
//     createdAt, updatedAt }
//
// rooms/{roomId}/sessions/{sessionId}/scores/{playerId}   (one row per player)
//   { sessionId, roomId, playerId, displayName, bankroll, tricksWon, handsWon, net, total,
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
import {
  settleHandDeltas,
  applySolventSettlement,
  scoreBankroll,
  canEnrollWithBankroll,
  collectHandAntes,
  anteAlreadyPosted,
  settleSoloDefaultWin,
  resolveSessionBuyIn,
  handAnteContribution,
  sumProjectedHandAntes,
  bourrePlayerIds,
  nextDealFundingFlags,
  buildNextDealFundingSnapshot,
  mergeNextDealFundingIntoScoreById,
  collectNextHandAntes,
  logBourreAccounting,
  DEFAULT_BOURRE_SETTINGS,
  normalizeBourreSettings,
} from "./bourre-rules.js";
import { tiesHouseRuleAllowsSplit } from "./house-rules.js";
import { DEFAULT_HOUSE_RULES, normalizeHouseRules } from "./house-rules.js";
import { FIREBASE_SDK_VERSION, FIRESTORE_EMULATOR, SERVER_HAND_AUTHORITY } from "./firebase-config.js";
import {
  gameEnsureHandEnrollment,
  gameAdvanceHandReveal,
  gamePlayCard,
  gameRecordHand,
  gameSetHandParticipation,
  gameSubmitDraw,
  gameFoldDraw,
  gameTimeoutEnrollment,
  gameVoteCoWinSettlement,
  gameAdvanceBots,
} from "./game-functions.js";
import { removePlayerFromEnrollment } from "./enrollment-roster.js";
import {
  dealInitialHand,
  playerOrderFromDealer,
  serializeHandState,
  serializePagatRevealHand,
  deserializeCards,
  serializeCards,
  shuffledDeckFromSeed,
  pileFromPublicHand,
  totalAvailableReplacements,
  applyPlayerDraw,
  advanceAfterDraw,
  applyDrawFold,
  revealToDraw,
  applyPlayerPlayCard,
  maxDrawDiscards,
  botDrawDiscardIndices,
  botPlayCardIndex,
  getLegalPlayIndices,
  buildPlayValidationState,
  effectivePlayerHand,
  HAND_PHASE,
  activateHandDecision,
  applyDecisionPlay,
  applyDecisionPass,
  applyDecisionTimeout,
  currentDecisionPlayer,
  decisionAsEnrollmentView,
  resolveActionOrder,
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
import {
  analyzeTableStartup,
  authoritativeCurrentHand,
  sessionHandDealStarted,
  shouldClearOrphanLiveEnrollment,
  tableStartupUserMessage,
} from "./session-startup.js";

const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

const {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  getDocFromServer,
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
  increment,
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
      "This table could not be opened because of a permissions problem. Refresh the page and try Go to Table again.",
    );
  }
  const friendly = formatClientGameError(
    err,
    "This table could not be opened. Refresh the page and try Go to Table again.",
  );
  if (friendly && friendly !== String(err?.message ?? "")) {
    return new Error(friendly);
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

/** Enrollment — server Cloud Functions first when SERVER_HAND_AUTHORITY is on. */
async function callEnrollmentAction(clientFn, serverFn) {
  if (SERVER_HAND_AUTHORITY) {
    try {
      return await serverFn();
    } catch (serverErr) {
      if (isCloudFunctionUnavailable(serverErr)) {
        console.warn(
          "Enrollment Cloud Function unavailable, trying client write.",
          serverErr?.code || serverErr?.message || serverErr,
        );
        try {
          return await clientFn();
        } catch (clientErr) {
          throw describeEnrollmentStartError(
            isEnrollmentPermissionError(clientErr) ? clientErr : serverErr,
          );
        }
      }
      throw describeEnrollmentStartError(
        isEnrollmentPermissionError(serverErr) ? serverErr : serverErr,
      );
    }
  }
  try {
    return await clientFn();
  } catch (clientErr) {
    throw describeEnrollmentStartError(clientErr);
  }
}

/** Draw/play — client Firestore first (works when callables are missing). */
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

/** Settlement — Cloud Functions first when enabled; client batch is the fallback. */
async function callSettlementOrClient(clientFn, serverFn) {
  if (SERVER_HAND_AUTHORITY) {
    try {
      return await serverFn();
    } catch (serverErr) {
      if (isCloudFunctionUnavailable(serverErr)) {
        console.warn(
          "Settlement Cloud Function unavailable, trying client batch.",
          serverErr?.code || serverErr?.message || serverErr,
        );
        try {
          return await clientFn();
        } catch (clientErr) {
          throw settlementError(clientErr, "client-batch", serverErr);
        }
      }
      console.warn(
        "Settlement Cloud Function failed, trying client batch.",
        serverErr?.code || serverErr?.message || serverErr,
      );
      try {
        return await clientFn();
      } catch (clientErr) {
        throw settlementError(clientErr, "client-batch", serverErr);
      }
    }
  }
  try {
    return await clientFn();
  } catch (clientErr) {
    throw settlementError(clientErr, "client-batch");
  }
}

function isSettlementDevLogging() {
  return (
    FIRESTORE_EMULATOR != null ||
    (typeof location !== "undefined" &&
      (location.hostname === "localhost" || location.hostname === "127.0.0.1"))
  );
}

function logBourreSettlementTrace(event, payload = {}) {
  if (!isSettlementDevLogging()) return;
  if (typeof console !== "undefined" && console.info) {
    console.info(`[bourre-settlement] ${event}`, payload);
  }
}

async function readScoreByIdInTransaction(tx, roomId, sessionId) {
  const snap = await tx.get(scoresCol(roomId, sessionId));
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
}

function logSettlementFailure(source, err, relatedErr = null) {
  const detail = {
    source,
    code: err?.code ?? null,
    message: err?.message ?? String(err),
  };
  if (relatedErr) {
    detail.related = {
      code: relatedErr?.code ?? null,
      message: relatedErr?.message ?? String(relatedErr),
    };
  }
  if (isSettlementDevLogging()) {
    console.error("[settlement] Firestore operation failed", detail, err);
  } else {
    console.warn("[settlement] failed", detail.code || detail.message);
  }
}

function isAuthExpiredError(err) {
  const code = String(err?.code ?? "");
  return code === "unauthenticated" || code === "functions/unauthenticated";
}

function isRoomMembershipError(err) {
  const msg = String(err?.message ?? err).toLowerCase();
  return msg.includes("not a room member");
}

/** Five tricks per hand; winner is whoever takes the most (plurality). */
export const MAX_TRICKS_PER_HAND = 5;

/** Full table — host + guests + robots (matches table UI and deck layout). */
export const MAX_TABLE_PLAYERS = 8;

/** Map Firebase / callable errors to player-friendly copy. */
export function formatClientGameError(err, fallback = "Something went wrong — try again.") {
  const code = String(err?.code ?? "");
  const msg = String(err?.message ?? err ?? "").trim();
  const lower = msg.toLowerCase();
  if (
    code === "functions/internal" ||
    code === "functions/unknown" ||
    lower === "internal" ||
    lower.includes("internal error")
  ) {
    return "The server could not finish that table action. Refresh the page and try again.";
  }
  if (isCloudFunctionUnavailable(err)) {
    return "The game server is temporarily unavailable. Refresh and try again.";
  }
  if (isEnrollmentPermissionError(err) || isPermissionDenied(err)) {
    return "Permission denied — refresh the page and try again.";
  }
  if (lower.includes("not in reveal phase")) {
    return fallback;
  }
  return msg || fallback;
}

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

/** Prefer per-hand dealer while cards are live; otherwise session dealer (rotates between hands). */
export function resolveHandDealerId(sessionDealerId, currentHand) {
  const phase = currentHand?.phase ?? null;
  if (
    currentHand?.dealerId &&
    (phase === "reveal" || phase === "decision" || phase === "draw" || phase === "play")
  ) {
    return currentHand.dealerId;
  }
  return sessionDealerId ?? currentHand?.dealerId ?? null;
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

export { formatInviteCodeDisplay, isValidInviteCodeFormat, normalizeInviteCode } from "./invite-code.js";
import { isValidInviteCodeFormat, normalizeInviteCode } from "./invite-code.js";

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

/** Ante for the current hand (0 when waived; bourré replacement when due). */
export function playerHandStake(scoreById, playerId, sessionStake) {
  return handAnteContribution(scoreById[playerId], sessionStake);
}

export {
  DEFAULT_BOURRE_SETTINGS,
  DEFAULT_HAND_ANTE,
  normalizeBourreSettings,
  resolveSessionBuyIn,
  computeHandPotState,
  scoreBankroll,
  applyBankrollDelta,
  canEnrollWithBankroll,
  collectHandAntes,
  anteAlreadyPosted,
  applySolventSettlement,
  handAnteContribution,
  sumProjectedHandAntes,
  bourrePlayerIds,
  projectNextHandPot,
} from "./bourre-rules.js";
export { resolveActionOrder, openingLeaderId } from "./game-engine.js";
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
export async function createRoom({ owner, name, houseRules, bourreSettings }) {
  const roomRef = doc(collection(db, "rooms"));
  const inviteCode = generateInviteCode();
  const batch = writeBatch(db);
  batch.set(roomRef, {
    inviteCode,
    ownerId: owner.uid,
    name: name || `${owner.displayName.split(" ")[0]}'s Room`,
    houseRules: normalizeHouseRules(houseRules),
    bourreSettings: normalizeBourreSettings(bourreSettings ?? DEFAULT_BOURRE_SETTINGS),
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
  try {
    await ensureInviteLookupForRoom(roomRef.id);
  } catch (err) {
    console.warn("ensureInviteLookupForRoom after create:", err);
  }
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

/** Join an existing room by invite code. Returns the roomId. */
export async function joinRoomByCode(code, user) {
  if (!user?.uid) throw new Error("Sign in to join a room.");
  const inviteCode = normalizeInviteCode(code);
  if (!isValidInviteCodeFormat(inviteCode)) {
    throw new Error("Invalid invite code — enter 6 characters like ABC-D23.");
  }
  const lookupSnap = await getDoc(doc(db, "inviteLookups", inviteCode));
  if (!lookupSnap.exists()) {
    throw new Error(
      `No room found for code ${inviteCode}. Double-check with the host. If they just created the room, ask them to open Private Rooms once, then try again.`,
    );
  }
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
      buyInAmount: normalized.buyInAmount,
      anteAmount: normalized.anteAmount,
      limEnabled: normalized.limEnabled,
      rebuyEnabled: normalized.rebuyEnabled,
    },
    updatedAt: serverTimestamp(),
  });
}

/** Manual top-up when rebuy house rule is enabled and bankroll is empty. */
export async function rebuySessionPlayer(roomId, sessionId, { playerId, actorId }) {
  if (!playerId || !actorId) throw new Error("Missing player");
  if (playerId !== actorId) throw new Error("You can only rebuy for yourself");

  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  if (!roomSnap.exists()) throw new Error("Room not found");
  const bourre = normalizeBourreSettings(roomSnap.data()?.bourreSettings);

  if (!bourre.rebuyEnabled) throw new Error("Rebuy is not enabled for this room");

  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists()) throw new Error("Session not found");
  if (sessionSnap.data().status === "final") throw new Error("Session is final");

  const buyIn = resolveSessionBuyIn(sessionSnap.data(), bourre);
  const scoreRef = scoreDoc(roomId, sessionId, playerId);
  const scoreSnap = await getDoc(scoreRef);
  if (!scoreSnap.exists()) throw new Error("Player not in session");

  await updateDoc(scoreRef, {
    bankroll: buyIn,
    out: deleteField(),
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

export { removePlayerFromEnrollment } from "./enrollment-roster.js";

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

/** Seats eligible for a new hand — excludes broke/out players. */
export function eligibleSeatPlayerIds(sessionData, scoreSnap, buyIn) {
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  return seatPlayerIds(sessionData, scoreSnap).filter((id) => {
    const row = scoreById[id];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyIn));
  });
}

/** Clockwise order starting with the first seat after the dealer. */
export function enrollmentOrderFromDealer(dealerId, sortedPlayerIds) {
  return playerOrderFromDealer(dealerId, sortedPlayerIds);
}

/** Writable on legacy Firestore rules (not in sessionGameFieldsChanged). */
export const LIVE_ENROLLMENT_FIELD = "liveEnrollment";

/** Prefer liveEnrollment (client-writable); fall back to handEnrollment (Cloud Functions / create). */
export function getSessionEnrollment(sessionData) {
  const hand = getSessionCurrentHand(sessionData);
  const phase = hand?.phase;
  if (
    phase === HAND_PHASE.REVEAL ||
    phase === HAND_PHASE.DRAW ||
    phase === HAND_PHASE.PLAY
  ) {
    return null;
  }
  if (phase === HAND_PHASE.DECISION) {
    const view = decisionAsEnrollmentView(hand.handDecision);
    return view?.active ? view : null;
  }
  const live = sessionData?.liveEnrollment;
  const livePhase = live?.deal?.publicHand?.phase ?? null;
  if (live?.active) return live;
  if (
    livePhase === HAND_PHASE.DRAW ||
    livePhase === HAND_PHASE.PLAY ||
    livePhase === HAND_PHASE.REVEAL ||
    livePhase === HAND_PHASE.DECISION
  ) {
    return null;
  }
  if (sessionData?.handEnrollment?.active) return sessionData.handEnrollment;
  return sessionData?.handEnrollment ?? null;
}

/** Active Pagat decision clock on currentHand (post-reveal). */
export function getSessionHandDecision(sessionData) {
  const hand = getSessionCurrentHand(sessionData);
  if (hand?.phase === HAND_PHASE.DECISION && hand?.handDecision?.active) {
    return hand.handDecision;
  }
  return null;
}

function decisionContextFromSession(data, sortedPlayerIds, scoreById, dealingRule, buyIn, sessionStake) {
  return {
    dealerId: data.dealerId,
    sortedPlayerIds,
    dealingRule,
    scoreById,
    buyIn,
    sessionStake,
    carryIn: data.carryOverPot || 0,
    handCount: data.handCount || 0,
  };
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] };
}

/** Public hand from session.currentHand or legacy liveEnrollment.deal (writable without rules deploy). */
export function getSessionCurrentHand(sessionData) {
  return authoritativeCurrentHand(sessionData);
}

function publicHandSessionUpdate(sessionData, nextPublicHand) {
  if (sessionData?.liveEnrollment?.deal) {
    // Keep currentHand and liveEnrollment.deal.publicHand in sync — reads prefer currentHand
    // once deal mirrors, so draw/play must update both or the table stalls in draw.
    return {
      "liveEnrollment.deal.publicHand": nextPublicHand,
      currentHand: nextPublicHand,
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
  const phase = getSessionCurrentHand(sessionData)?.phase ?? null;
  const hasDealMirror = Boolean(sessionData?.liveEnrollment?.deal);
  const inDrawOrPlay = phase === HAND_PHASE.DRAW || phase === HAND_PHASE.PLAY;
  // Keep draw/play card writes on the session doc — privateHands subcollection rules
  // only allow writes while enrollment is active (draw/play were excluded until v1.01.76).
  if (hasDealMirror || sessionData?.liveEnrollment?.deal?.privateHandsByPlayer || inDrawOrPlay) {
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

function applyEnrollmentDealInTransaction(tx, ref, patch, roomId, sessionId) {
  if (patch.scorePatches) {
    for (const [playerId, scorePatch] of Object.entries(patch.scorePatches)) {
      tx.update(scoreDoc(roomId, sessionId, playerId), {
        ...scorePatch,
        updatedAt: serverTimestamp(),
      });
    }
  }
  const sessionUpdate = {
    [LIVE_ENROLLMENT_FIELD]: {
      active: false,
      deal: {
        publicHand: patch.currentHand,
        sortedPlayerIds: patch.sortedPlayerIds,
        privateHandsByPlayer: patch.privateHandsByPlayer,
      },
    },
    currentHand: patch.currentHand,
    handEnrollment: deleteField(),
    updatedAt: serverTimestamp(),
  };
  if (patch.carryOverPotAdjust > 0) {
    sessionUpdate.carryOverPot = increment(patch.carryOverPotAdjust);
  }
  sessionUpdate.nextDealFunding = deleteField();
  tx.update(ref, sessionUpdate);
}

/** Firestore transactions require every read before any write on touched docs. */
async function primeClientPatchReads(tx, roomId, sessionId, patch) {
  if (patch?.scorePatches) {
    for (const playerId of Object.keys(patch.scorePatches)) {
      await tx.get(scoreDoc(roomId, sessionId, playerId));
    }
  }
  if (patch?.privateHandsByPlayer) {
    for (const playerId of Object.keys(patch.privateHandsByPlayer)) {
      await tx.get(privateHandDoc(roomId, sessionId, playerId));
    }
  }
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

function applySoloWinInTransaction(tx, ref, patch, roomId, sessionId) {
  if (patch.scorePatches) {
    for (const [playerId, scorePatch] of Object.entries(patch.scorePatches)) {
      tx.update(scoreDoc(roomId, sessionId, playerId), {
        ...scorePatch,
        updatedAt: serverTimestamp(),
      });
    }
  }
  tx.update(ref, {
    handCount: patch.handNumber,
    handStakeLocked: true,
    carryOverPot: patch.carryOverPot ?? 0,
    ...(patch.newDealerId ? { dealerId: patch.newDealerId } : {}),
    handEnrollment: deleteField(),
    [LIVE_ENROLLMENT_FIELD]: deleteField(),
    currentHand: patch.currentHand ?? emptyPreDealHand(),
    pendingCoWinSettlement: deleteField(),
    nextDealFunding: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

function applyEnrollmentStepLegacy(tx, ref, patch, roomId, sessionId) {
  if (patch.soloWin) {
    applySoloWinInTransaction(tx, ref, patch, roomId, sessionId);
    return;
  }
  if (patch.privateHandsByPlayer) {
    applyEnrollmentDealInTransaction(tx, ref, patch, roomId, sessionId);
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
  if (patch.soloWin) {
    applySoloWinInTransaction(tx, ref, patch, roomId, sessionId);
    return;
  }
  if (mode === "legacy") {
    applyEnrollmentStepLegacy(tx, ref, patch, roomId, sessionId);
    return;
  }
  if (patch.privateHandsByPlayer) {
    applyEnrollmentDealInTransaction(tx, ref, patch, roomId, sessionId);
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
      const sessionData = snap.data();
      const scoreById = mergeNextDealFundingIntoScoreById(
        await readScoreByIdInTransaction(tx, roomId, sessionId),
        sessionData.nextDealFunding,
      );
      const patch = buildPatch(sessionData, scoreById);
      if (!patch) {
        if (requirePatch) throw new Error("Enrollment step did not apply");
        return;
      }
      applied = true;
      if (patch.privateHandsByPlayer) {
        dealPrivateHands = patch.privateHandsByPlayer;
        dealPublicHand = patch.currentHand ?? null;
      }
      await primeClientPatchReads(tx, roomId, sessionId, patch);
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

function buildSoloWinPatch(winnerId, sessionData, dealContext) {
  const { scoreById = {}, sessionStake = 1, buyIn = 1 } = dealContext;
  const stakeFor = (pid) => playerHandStake(scoreById, pid, sessionStake);
  const settled = settleSoloDefaultWin({
    winnerId,
    carryIn: sessionData.carryOverPot || 0,
    scoreById,
    buyInFallback: buyIn,
    stakeForPlayer: stakeFor,
  });
  if (!settled.ready) {
    return buildPagatHandStartPatch(
      dealContext.dealerId,
      dealContext.sortedPlayerIds,
      dealContext.sortedPlayerIds,
      Date.now(),
      null,
      {
        scoreById,
        sessionStake,
        buyIn,
        carryIn: sessionData.carryOverPot || 0,
        handCount: sessionData.handCount || 0,
      },
    );
  }
  const handNumber = (sessionData.handCount || 0) + 1;
  const currentDealer = dealContext.dealerId ?? sessionData.dealerId ?? null;
  const newDealerId = rotateDealerSeat(dealContext.sortedPlayerIds ?? [], currentDealer);
  const scorePatches = {};
  const br = settled.bankrolls[winnerId];
  scorePatches[winnerId] = {
    bankroll: br,
    net:
      (scoreById[winnerId]?.net || 0) +
      settled.pot -
      (settled.postedAntes[winnerId] ?? 0),
    handsWon: (scoreById[winnerId]?.handsWon || 0) + 1,
    tricksWon: scoreById[winnerId]?.tricksWon || 0,
    out: br <= 0 ? true : deleteField(),
  };
  return {
    soloWin: true,
    winnerId,
    handNumber,
    pot: settled.pot,
    postedAntes: settled.postedAntes,
    scorePatches,
    carryOverPot: 0,
    handEnrollment: deleteField(),
    currentHand: emptyPreDealHand(),
    sortedPlayerIds: dealContext.sortedPlayerIds,
    newDealerId,
  };
}

function buildHandEnrollment(sortedPlayerIds, dealerId, scoreById = {}, buyIn = 1) {
  const activeIds = sortedPlayerIds.filter((id) => {
    const row = scoreById[id];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyIn));
  });
  const orderedPlayerIds = enrollmentOrderFromDealer(dealerId, activeIds);
  return {
    active: true,
    orderedPlayerIds,
    currentIndex: 0,
    turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
    enrolledIds: [],
    declinedIds: [],
  };
}

function tryAutoEnrollmentDeal(sessionData, sortedIds, scoreById, buyIn, sessionStake, dealingRule) {
  const optIn = sessionData?.tableOptInIds || [];
  if (!optIn.length) return null;
  const eligible = sortedIds.filter((id) => {
    if (!optIn.includes(id)) return false;
    const row = scoreById[id];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyIn));
  });
  if (eligible.length < 2) return null;
  return buildDealCompletionPatch(
    sessionData.dealerId,
    eligible,
    sortedIds,
    Date.now(),
    dealingRule,
    { scoreById, sessionStake, buyIn },
  );
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
  return shouldClearOrphanLiveEnrollment(sessionData);
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

function buildPagatHandStartPatch(
  dealerId,
  seatedIds,
  sortedPlayerIds,
  seed,
  dealingRule,
  dealContextExtras = {},
) {
  const { scoreById = {}, sessionStake = 1, buyIn = 1, carryIn = 0, handCount = 0 } =
    dealContextExtras;
  const collected = collectNextHandAntes({
    carryOverPot: carryIn,
    participantIds: seatedIds,
    scoreById,
    sessionStake,
    buyInFallback: buyIn,
  });
  logBourreAccounting("next-hand-antes", {
    handCount,
    carryIn,
    nextHandPot: collected.nextHandPot,
    postedAntes: collected.postedAntes,
    bankrolls: collected.bankrolls,
    bourreReplacementDue: Object.fromEntries(
      seatedIds.map((pid) => [pid, scoreById[pid]?.bourreReplacementDue ?? null]),
    ),
  });
  const dealIds = collected.activeParticipants;
  if (dealIds.length < 2) {
    if (dealIds.length === 1) {
      return buildSoloWinPatch(
        dealIds[0],
        { carryOverPot: carryIn, handCount },
        {
          ...dealContextExtras,
          dealerId,
          sortedPlayerIds,
          sessionStake,
          buyIn,
          scoreById,
        },
      );
    }
    return {
      handEnrollment: deleteField(),
      [LIVE_ENROLLMENT_FIELD]: deleteField(),
      currentHand: emptyPreDealHand(),
      scorePatches: buildScorePatchesFromAnteCollection(collected, dealIds),
    };
  }

  const deal = dealInitialHand({
    dealerId,
    participantIds: dealIds,
    sortedPlayerIds,
    seed: seed ?? Date.now(),
  });
  const bundle = serializePagatRevealHand(deal, {
    dealerId,
    actionOrder: deal.dealOrder,
    seatedIds: sortedPlayerIds,
    maxDrawDiscards: maxDrawDiscards(dealIds.length, dealingRule),
  });
  return {
    handEnrollment: deleteField(),
    [LIVE_ENROLLMENT_FIELD]: deleteField(),
    currentHand: {
      ...bundle.publicHand,
      postedAntes: collected.postedAntes,
    },
    privateHandsByPlayer: bundle.privateHandsByPlayer,
    sortedPlayerIds,
    scorePatches: buildScorePatchesFromAnteCollection(collected, dealIds),
    carryOverPotAdjust: collected.uncollectedPenalties ?? 0,
  };
}

function buildDealCompletionPatch(
  dealerId,
  enrolledIds,
  sortedPlayerIds,
  seed,
  dealingRule,
  dealContextExtras = {},
) {
  return buildPagatHandStartPatch(
    dealerId,
    enrolledIds,
    sortedPlayerIds,
    seed,
    dealingRule,
    dealContextExtras,
  );
}

function buildScorePatchesFromAnteCollection(collected, dealIds) {
  const patches = {};
  const touched = new Set([...collected.outIds, ...dealIds]);
  for (const pid of touched) {
    if (collected.bankrolls[pid] == null) continue;
    const patch = { bankroll: collected.bankrolls[pid] };
    if (collected.outIds.includes(pid)) {
      patch.out = true;
    } else if (dealIds.includes(pid)) {
      patch.out = deleteField();
    }
    if (collected.postedAntes[pid] != null) {
      patch.bourreReplacementDue = deleteField();
      patch.skipNextAnte = deleteField();
    }
    patches[pid] = patch;
  }
  return patches;
}

function canActForPlayer(playerId, actorId) {
  if (!playerId || !actorId) return false;
  if (playerId === actorId) return true;
  return isRobotPlayerId(playerId);
}

function actionOrderFromHand(currentHand, sortedPlayerIds) {
  return resolveActionOrder(currentHand ?? {}, sortedPlayerIds);
}

function sortedPlayerIdsFromSession(sessionData) {
  const fromEnrollment = sessionData?.liveEnrollment?.deal?.sortedPlayerIds;
  if (fromEnrollment?.length) return fromEnrollment;
  return getSessionCurrentHand(sessionData)?.seatedIds ?? null;
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
    const maxDraw =
      currentHand.maxDrawDiscards ?? maxDrawDiscards(currentHand.participantIds?.length ?? 2);

    const drawResult = applyPlayerDraw({
      playerId,
      privateHand: hand,
      publicHand: currentHand,
      discardIndices: discardIndices || [],
      deck,
      maxDiscards: maxDraw,
    });

    const nextPublic = advanceAfterDraw(
      drawResult.publicHand,
      actionOrderFromHand(currentHand, sortedPlayerIdsFromSession(sessionData)),
      playerId,
    );

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

/** Fold out during draw — forfeit ante, skip trick play for this hand. */
export async function foldHandDraw(roomId, sessionId, { playerId, actorId }) {
  return callGameOrClient(
    () => foldHandDrawClient(roomId, sessionId, { playerId, actorId }),
    () => gameFoldDraw(roomId, sessionId, { playerId, actorId }),
  );
}

async function foldHandDrawClient(roomId, sessionId, { playerId, actorId }) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new Error("You can only fold for yourself (or drive a robot)");
  }

  const ref = sessionDoc(roomId, sessionId);
  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;

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

    const foldResult = applyDrawFold(
      currentHand,
      actionOrderFromHand(currentHand, sortedPlayerIdsFromSession(sessionData)),
      playerId,
    );

    if (foldResult.kind === "soloWin") {
      const sortedPlayerIds = seatPlayerIds(sessionData, scoreSnap);
      const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
      const buyIn = resolveSessionBuyIn(sessionData, roomSnap.data()?.bourreSettings);
      const sessionStake = sessionData.handStake ?? 1;
      const patch = buildSoloWinPatch(foldResult.winnerId, sessionData, {
        dealerId: sessionData.dealerId,
        sortedPlayerIds,
        dealingRule,
        scoreById,
        sessionStake,
        buyIn,
      });
      await primeClientPatchReads(tx, roomId, sessionId, patch);
      writePrivateHandInTransaction(tx, ref, sessionData, roomId, sessionId, playerId, []);
      applySoloWinInTransaction(tx, ref, patch, roomId, sessionId);
      return;
    }

    writePrivateHandInTransaction(tx, ref, sessionData, roomId, sessionId, playerId, []);
    tx.update(ref, publicHandSessionUpdate(sessionData, foldResult.publicHand));
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
      actionOrder: actionOrderFromHand(currentHand, sortedPlayerIdsFromSession(sessionData)),
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
  const deckSeed = ch.deckSeed;
  const deck = deckSeed != null ? shuffledDeckFromSeed(deckSeed) : undefined;
  const pile = pileFromPublicHand(ch, deck);
  const deckRemaining = totalAvailableReplacements(pile);
  const indices = botDrawDiscardIndices(hand, trumpSuit, maxDraw, deckRemaining);
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
  const ctx = buildPlayValidationState({ hand, publicHand: ch });
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

function settlementError(err, source = "client", relatedErr = null) {
  logSettlementFailure(source, err, relatedErr);
  if (isAuthExpiredError(err)) {
    return new Error(
      "Hand settlement was blocked — your sign-in expired. Sign in again and retry.",
    );
  }
  if (isRoomMembershipError(err)) {
    return new Error(
      "Hand settlement was blocked — you are not listed as a member of this room. Rejoin with the invite code or ask the host to confirm you are in the room.",
    );
  }
  if (isPermissionDenied(err) || isEnrollmentPermissionError(err)) {
    return new Error(
      "Hand settlement was blocked (room permissions). Confirm you are still in this room. If you joined by invite code, ask the host to deploy updated Firestore rules.",
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
    if (enrolledIds.length === 1 && dealContext) {
      return buildSoloWinPatch(enrolledIds[0], {
        carryOverPot: dealContext.carryIn ?? 0,
        handCount: dealContext.handCount ?? 0,
      }, dealContext);
    }
    return buildPagatHandStartPatch(
      dealContext?.dealerId ?? null,
      dealContext?.sortedPlayerIds ?? [],
      dealContext?.sortedPlayerIds ?? [],
      Date.now(),
      dealContext?.dealingRule ?? null,
      {
        scoreById: dealContext?.scoreById ?? {},
        sessionStake: dealContext?.sessionStake ?? 1,
        buyIn: dealContext?.buyIn ?? 1,
        carryIn: dealContext?.carryIn ?? 0,
        handCount: dealContext?.handCount ?? 0,
      },
    );
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
    {
      scoreById: dealContext.scoreById ?? {},
      sessionStake: dealContext.sessionStake ?? 1,
      buyIn: dealContext.buyIn ?? 1,
      carryIn: dealContext.carryIn ?? 0,
      handCount: dealContext.handCount ?? 0,
    },
  );
}

function patchFromDecisionStep(sessionData, step, dealContext) {
  if (step.kind === "continue") {
    return { currentHand: step.publicHand };
  }
  if (step.kind === "draw") {
    return { currentHand: step.publicHand };
  }
  if (step.kind === "restart") {
    return { currentHand: step.publicHand };
  }
  if (step.kind === "soloWin") {
    return buildSoloWinPatch(step.winnerId, sessionData, dealContext);
  }
  return null;
}

async function runDecisionStepTransaction(roomId, sessionId, buildPatch, { requirePatch = false } = {}) {
  const ref = sessionDoc(roomId, sessionId);
  let applied = false;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Session not found");
    const patch = buildPatch(snap.data());
    if (!patch) {
      if (requirePatch) throw new Error("Decision step did not apply");
      return;
    }
    applied = true;
    await primeClientPatchReads(tx, roomId, sessionId, patch);
    if (patch.soloWin) {
      applySoloWinInTransaction(tx, ref, patch, roomId, sessionId);
      return;
    }
    if (patch.scorePatches) {
      for (const [playerId, scorePatch] of Object.entries(patch.scorePatches)) {
        tx.update(scoreDoc(roomId, sessionId, playerId), {
          ...scorePatch,
          updatedAt: serverTimestamp(),
        });
      }
    }
    if (patch.privateHandsByPlayer) {
      applyEnrollmentDealInTransaction(tx, ref, patch, roomId, sessionId);
      return;
    }
    if (patch.currentHand) {
      tx.update(ref, publicHandSessionUpdate(snap.data(), patch.currentHand));
    }
    if (patch.handEnrollment === deleteField()) {
      tx.update(ref, { handEnrollment: deleteField(), [LIVE_ENROLLMENT_FIELD]: deleteField() });
    }
  });
  if (requirePatch && !applied) throw new Error("Decision step did not apply");
}

function nextDealerId(scoreSnap, currentDealerId, sessionData) {
  const ids = seatPlayerIds(sessionData, scoreSnap);
  return rotateDealerSeat(ids, currentDealerId);
}

function rotateDealerSeat(sortedIds, currentDealerId) {
  if (!sortedIds?.length) return null;
  const idx = sortedIds.indexOf(currentDealerId);
  const base = idx >= 0 ? idx : 0;
  return sortedIds[(base + 1) % sortedIds.length];
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

export async function createSession(roomId, players, buyInAmount = 1, bourreOpts = {}) {
  const preSessionsSnap = await getDocs(sessionsCol(roomId));
  const liveClaimed = [
    ...new Set(
      preSessionsSnap.docs.map((d) => d.data().sessionName).filter(Boolean),
    ),
  ];
  const buyIn = Math.max(1, Number(buyInAmount) || 1);
  const handStake = Math.max(
    1,
    Number(bourreOpts.handStake ?? bourreOpts.anteAmount) || 1,
  );
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
      buyInAmount: buyIn,
      handStake,
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
        bankroll: buyIn,
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
  return callSettlementOrClient(
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

  const postedAntes = getSessionCurrentHand(sessionData)?.postedAntes ?? {};
  const antePot = participants.reduce(
    (sum, pid) => sum + (postedAntes[pid] ?? playerHandStake(scoreById, pid, stake)),
    0,
  );
  const stakeForPot = (pid) => postedAntes[pid] ?? playerHandStake(scoreById, pid, stake);
  const stakeForSettlement = (pid) =>
    anteAlreadyPosted(postedAntes, pid) ? 0 : playerHandStake(scoreById, pid, stake);

  const handSettlement = settleHandDeltas({
    mode,
    winners,
    participants,
    tricksByPlayer,
    anteAmount: stake,
    limEnabled,
    carryIn,
    antePot,
    stakeForPlayer: stakeForSettlement,
  });

  const {
    deltas: nominalDeltas,
    carryOverPot: nominalCarry,
    bourreIds,
    bourreMatch,
    potState,
    pot: grossPot,
    cappedPot,
    overflow,
  } = handSettlement;

  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const roomBourre = roomSnap.data()?.bourreSettings ?? DEFAULT_BOURRE_SETTINGS;
  const buyIn = resolveSessionBuyIn(sessionData, roomBourre);

  const solvent = applySolventSettlement({
    mode,
    winners,
    participants,
    nominalDeltas,
    scoreById,
    carryOverPot: nominalCarry,
    buyInFallback: buyIn,
    stakeForPlayer: stakeForSettlement,
  });

  const deltas = solvent.appliedDeltas;
  const carryOverPot = solvent.carryOverPot;

  logBourreSettlementTrace("hand-settled", {
    handNumber,
    mode,
    previousPot: grossPot,
    settledPot: potState.currentPot,
    carryOverPot,
    bourreIds,
    bourreMatch,
    tricksByPlayer: tricksByPlayer || null,
    bankrollsBefore: Object.fromEntries(
      participants.map((pid) => [pid, scoreBankroll(scoreById[pid], buyIn)]),
    ),
    bankrollsAfter: solvent.bankrolls,
    postedAntes,
    antePot,
  });

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
      bankroll: solvent.bankrolls[pid] ?? scoreBankroll(current, buyIn),
      updatedAt: serverTimestamp(),
    };
    if ((solvent.bankrolls[pid] ?? 0) <= 0) {
      patch.out = true;
    } else {
      patch.out = deleteField();
    }
    if (current.skipNextAnte) {
      patch.skipNextAnte = deleteField();
    }
    if (current.bourreReplacementDue != null) {
      patch.bourreReplacementDue = deleteField();
    }
    const funding = nextDealFundingFlags({
      playerId: pid,
      mode,
      winners,
      bourreIds,
      settledPot: potState.currentPot,
    });
    if (funding.bourreReplacementDue != null) {
      patch.bourreReplacementDue = funding.bourreReplacementDue;
    }
    if (funding.skipNextAnte) {
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
  const nextDealFunding = buildNextDealFundingSnapshot({
    settledPot: potState.currentPot,
    bourreIds,
    participants,
    mode,
    winners,
  });
  batch.update(sessionDoc(roomId, sessionId), {
    handCount: handNumber,
    handStakeLocked: true,
    carryOverPot,
    dealerId: newDealerId,
    pendingCoWinSettlement: deleteField(),
    nextDealFunding,
    ...clearedEnrollmentBetweenHands(),
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (err) {
    throw settlementError(err, "client-batch");
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

  try {
    await recomputeSessionTotals(roomId, sessionId);
  } catch (err) {
    throw settlementError(err, "client-totals");
  }
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
  return callSettlementOrClient(
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
  if (
    currentHand.phase === HAND_PHASE.DRAW ||
    currentHand.phase === HAND_PHASE.PLAY ||
    currentHand.phase === HAND_PHASE.REVEAL ||
    currentHand.phase === HAND_PHASE.DECISION
  ) {
    throw new Error("Tricks are tracked automatically during live card play");
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
  if (scoreSnap.size <= 1) {
    throw new Error("Cannot remove the last player on this session.");
  }

  const remainingSorted = scoreSnap.docs
    .filter((d) => d.id !== playerId)
    .map((d) => ({ id: d.id, displayName: d.data()?.displayName || "" }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((r) => r.id);

  const sessionPatch = {
    players: (sessionData.players || []).filter((p) => {
      const id = typeof p === "string" ? p : p?.playerId;
      return id !== playerId;
    }),
    updatedAt: serverTimestamp(),
  };

  const activeEnrollment = getSessionEnrollment(sessionData);
  if (activeEnrollment?.active) {
    sessionPatch[LIVE_ENROLLMENT_FIELD] = {
      ...removePlayerFromEnrollment(
        activeEnrollment,
        playerId,
        sessionData.dealerId,
        remainingSorted,
      ),
      active: true,
    };
  }

  const batch = writeBatch(db);
  batch.delete(scoreDoc(roomId, sessionId, playerId));
  batch.delete(privateHandDoc(roomId, sessionId, playerId));
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
  if (!rosterIds.includes(playerId) && rosterIds.length >= MAX_TABLE_PLAYERS) {
    throw new Error(`This table is full (${MAX_TABLE_PLAYERS} players max). Remove a guest or robot first.`);
  }
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
  const buyIn = Math.max(
    1,
    Number(sessionData.buyInAmount ?? sessionData.handStake) || 1,
  );
  const batch = writeBatch(db);
  batch.update(sessionDoc(roomId, sessionId), sessionPatch);
  batch.set(scoreRef, {
    sessionId,
    roomId,
    playerId,
    displayName,
    bankroll: buyIn,
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

/** Ensure every seated player on the score sheet (guests, robots) has a Firestore score row. */
export async function syncSessionScoreRoster(roomId, sessionId, roster = []) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (!sessionSnap.exists() || sessionSnap.data().status === "final") return;

  await Promise.all(
    roster
      .filter((p) => p?.playerId)
      .map((p) =>
        ensureSessionPlayer(roomId, sessionId, p.playerId, p.displayName || "Player", {
          joinCurrentHand: false,
          isRobot: p.isRobot === true || isRobotPlayerId(p.playerId),
        }),
      ),
  );
  await ensureCurrentHandParticipants(roomId, sessionId);
}

async function waitForMinSeatedPlayers(
  roomId,
  sessionId,
  minPlayers,
  { members, roster } = {},
  maxMs = 6000,
) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (members?.length) {
      await syncSessionWithRoomMembers(roomId, sessionId, members);
    }
    if (roster?.length) {
      await syncSessionScoreRoster(roomId, sessionId, roster);
    }
    const [sessionSnap, scoreSnap] = await Promise.all([
      getDoc(sessionDoc(roomId, sessionId)),
      getDocs(scoresCol(roomId, sessionId)),
    ]);
    if (!sessionSnap.exists()) return 0;
    const seated = seatPlayerIds(sessionSnap.data(), scoreSnap).length;
    if (seated >= minPlayers) return seated;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  const [sessionSnap, scoreSnap] = await Promise.all([
    getDoc(sessionDoc(roomId, sessionId)),
    getDocs(scoresCol(roomId, sessionId)),
  ]);
  if (!sessionSnap.exists()) return 0;
  return seatPlayerIds(sessionSnap.data(), scoreSnap).length;
}

async function attemptAutoDeal(roomId, sessionId) {
  let clientErr = null;
  try {
    await ensureHandEnrollmentClient(roomId, sessionId);
  } catch (err) {
    clientErr = err;
    const data = await readSessionDataForHandVerify(roomId, sessionId);
    if (sessionHandDealStarted(data)) return;
    if (!SERVER_HAND_AUTHORITY) throw err;
    console.warn(
      "Client deal did not complete, trying Cloud Function.",
      err?.code || err?.message || err,
    );
  }

  let data = await readSessionDataForHandVerify(roomId, sessionId);
  if (sessionHandDealStarted(data)) return;

  if (SERVER_HAND_AUTHORITY) {
    try {
      await gameEnsureHandEnrollment(roomId, sessionId);
    } catch (serverErr) {
      data = await readSessionDataForHandVerify(roomId, sessionId);
      if (sessionHandDealStarted(data)) return;
      if (!isCloudFunctionUnavailable(serverErr)) {
        throw describeEnrollmentStartError(serverErr);
      }
      console.warn(
        "Enrollment Cloud Function unavailable.",
        serverErr?.code || serverErr?.message || serverErr,
      );
      if (clientErr) throw clientErr;
      throw describeEnrollmentStartError(serverErr);
    }
  } else if (clientErr) {
    throw clientErr;
  }
}

async function waitForSessionHandDeal(roomId, sessionId, maxMs = 15000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const data = await readSessionDataForHandVerify(roomId, sessionId);
    if (sessionHandDealStarted(data)) return data;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return readSessionDataForHandVerify(roomId, sessionId);
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

/** Reset stale participantIds / enrollment that block auto-deal on Go to Table. */
async function clearPreDealBlockingState(roomId, sessionId, data) {
  const hand = data.currentHand || emptyPreDealHand();
  const phase = hand.phase ?? null;
  const participantIds = hand.participantIds || [];
  const tricks = hand.tricksByPlayer || {};
  const hasTrickProgress = Object.values(tricks).some((n) => (n || 0) > 0);
  const enrollmentActive = Boolean(
    getSessionEnrollment(data)?.active ||
      data.handEnrollment?.active ||
      data.liveEnrollment?.active,
  );
  const staleRoster = participantIds.length > 0 && !phase && !hasTrickProgress;
  const needsClear =
    shouldClearOrphanLiveEnrollment(data) ||
    shouldClearStaleLiveEnrollment(data) ||
    enrollmentActive ||
    staleRoster ||
    (participantIds.length > 0 && !handPhaseStarted(hand) && !hasTrickProgress);

  if (!needsClear) return data;

  await clearStaleHandoffArtifacts(roomId, sessionId);
  const patch = {
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  };
  if (enrollmentActive || data.handEnrollment || data.liveEnrollment) {
    patch.handEnrollment = deleteField();
    patch[LIVE_ENROLLMENT_FIELD] = deleteField();
  }
  try {
    await updateDoc(sessionDoc(roomId, sessionId), patch);
  } catch (err) {
    if (!isPermissionDenied(err)) throw err;
  }
  const snap = await getDoc(sessionDoc(roomId, sessionId));
  return snap.exists() ? snap.data() : data;
}

/** Repair stale handoff artifacts before opening the live table overlay. */
export async function prepareSessionForTableOpen(roomId, sessionId) {
  const sessionRef = sessionDoc(roomId, sessionId);
  let sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists()) {
    const err = new Error("This session is no longer available.");
    err.code = "session-missing";
    throw err;
  }
  let data = sessionSnap.data();
  if (data.status === "final") return data;

  data = await clearPreDealBlockingState(roomId, sessionId, data);

  await ensureCurrentHandParticipants(roomId, sessionId);
  return data;
}

/** True when the public hand has entered deal / draw / play (not pre-deal handoff). */
function handPhaseStarted(hand) {
  const phase = hand?.phase ?? null;
  return (
    phase === HAND_PHASE.REVEAL ||
    phase === HAND_PHASE.DECISION ||
    phase === HAND_PHASE.DRAW ||
    phase === HAND_PHASE.PLAY
  );
}

async function readSessionDataForHandVerify(roomId, sessionId) {
  const ref = sessionDoc(roomId, sessionId);
  try {
    const snap = await getDocFromServer(ref);
    if (!snap.exists()) throw new Error("Session not found");
    return snap.data();
  } catch {
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Session not found");
    return snap.data();
  }
}

function enrollmentStartFailure(sessionData, scoreSnap, kind = "enrollment_failed") {
  const readyCount = Math.max(2, seatPlayerIds(sessionData, scoreSnap).length);
  const analysis = analyzeTableStartup(sessionData, readyCount);
  const err = new Error(tableStartupUserMessage({ ...analysis, kind }));
  err.code = kind === "insufficient_players" ? "insufficient-players" : "enrollment-failed";
  return err;
}

/** Start enrollment when a session has an empty hand but no active enrollment. */
export async function ensureHandEnrollment(roomId, sessionId, { members, roster } = {}) {
  await prepareSessionForTableOpen(roomId, sessionId);

  const minPlayers = 2;
  const seated = await waitForMinSeatedPlayers(roomId, sessionId, minPlayers, {
    members,
    roster,
  });
  if (seated < minPlayers) {
    const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
    const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
    throw enrollmentStartFailure(
      sessionSnap.exists() ? sessionSnap.data() : null,
      scoreSnap,
      "insufficient_players",
    );
  }

  const retryDelaysMs = [0, 1500, 3500];
  let data = null;
  for (const delayMs of retryDelaysMs) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await waitForMinSeatedPlayers(roomId, sessionId, minPlayers, { members, roster }, 2000);
    }
    await attemptAutoDeal(roomId, sessionId);
    data = await waitForSessionHandDeal(roomId, sessionId);
    if (sessionHandDealStarted(data)) return;
  }

  if (!sessionHandDealStarted(data)) {
    const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
    const seatedNow = seatPlayerIds(data, scoreSnap).length;
    throw enrollmentStartFailure(
      data,
      scoreSnap,
      seatedNow < minPlayers ? "insufficient_players" : "enrollment_failed",
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

  let hand = data.currentHand || emptyPreDealHand();
  let phase = hand.phase;
  if (sessionHandDealStarted(data)) {
    return;
  }

  const existing = getSessionEnrollment(data);
  if (existing?.active) {
    await updateDoc(sessionRef, {
      handEnrollment: deleteField(),
      [LIVE_ENROLLMENT_FIELD]: deleteField(),
    });
    sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) return;
    data = sessionSnap.data();
  }
  hand = data.currentHand || emptyPreDealHand();
  phase = hand.phase;
  const participantIds = hand.participantIds || [];
  const tricks = hand.tricksByPlayer || {};
  const hasTrickProgress = Object.values(tricks).some((n) => (n || 0) > 0);
  if (participantIds.length > 0 || hasTrickProgress) {
    const staleRoster = participantIds.length > 0 && !phase && !hasTrickProgress;
    if (isHandoffState(data) || staleRoster) {
      await clearStaleHandoffArtifacts(roomId, sessionId);
      if (staleRoster) {
        await updateDoc(sessionRef, {
          currentHand: emptyPreDealHand(),
          updatedAt: serverTimestamp(),
        });
      }
      sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) return;
      data = sessionSnap.data();
    } else if (!handPhaseStarted(hand)) {
      await updateDoc(sessionRef, {
        currentHand: emptyPreDealHand(),
        handEnrollment: deleteField(),
        [LIVE_ENROLLMENT_FIELD]: deleteField(),
        updatedAt: serverTimestamp(),
      });
      sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) return;
      data = sessionSnap.data();
    } else {
      return;
    }
  }

  const scoreSnap = await getDocs(scoresCol(roomId, sessionId));
  const sortedIds = seatPlayerIds(data, scoreSnap);
  if (sortedIds.length < 2) {
    throw enrollmentStartFailure(data, scoreSnap, "insufficient_players");
  }

  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  const buyIn = resolveSessionBuyIn(data, roomSnap.data()?.bourreSettings);
  const sessionStake = data.handStake ?? 1;
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));

  const eligibleIds = sortedIds.filter((id) => {
    const row = scoreById[id];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyIn));
  });
  if (eligibleIds.length < 1) {
    throw enrollmentStartFailure(data, scoreSnap, "enrollment_failed");
  }

  const dealContextBase = {
    sessionStake,
    buyIn,
  };
  await runEnrollmentStepTransaction(
    roomId,
    sessionId,
    (freshData, freshScoreById) => {
      if (sessionHandDealStarted(freshData)) return null;
      const freshHand = freshData.currentHand || emptyPreDealHand();
      const freshPhase = freshHand.phase ?? null;
      const freshPids = freshHand.participantIds || [];
      const freshTricks = freshHand.tricksByPlayer || {};
      const freshTrickProgress = Object.values(freshTricks).some((n) => (n || 0) > 0);
      if (freshPids.length > 0 && !freshPhase && !freshTrickProgress) return null;
      if (freshPids.length > 0 && handPhaseStarted(freshHand)) return null;
      return buildDealCompletionPatch(
        freshData.dealerId,
        eligibleIds,
        sortedIds,
        Date.now(),
        dealingRule,
        {
          ...dealContextBase,
          scoreById: freshScoreById,
          carryIn: freshData.carryOverPot || 0,
          handCount: freshData.handCount || 0,
        },
      );
    },
    { requirePatch: true },
  );
  logHandLifecycleTransition({
    from: "handoffToNextDeal",
    to: "reveal",
    reason: "Go to Table — deal all seated players, trump reveal, then draw",
  });
}

/** Advance reveal → draw after trump/hand presentation completes. */
export async function advanceHandReveal(roomId, sessionId) {
  return callEnrollmentAction(
    () => advanceHandRevealClient(roomId, sessionId),
    () => gameAdvanceHandReveal(roomId, sessionId),
  );
}

async function advanceHandRevealClient(roomId, sessionId) {
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  await runDecisionStepTransaction(
    roomId,
    sessionId,
    (sessionData) => {
      const hand = getSessionCurrentHand(sessionData);
      if (hand?.phase !== HAND_PHASE.REVEAL) return null;
      return { currentHand: revealToDraw(hand, dealingRule) };
    },
    { requirePatch: true },
  );
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
  const sessionData = sessionSnap.data();
  const sortedPlayerIds = seatPlayerIds(sessionData, scoreSnap);
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  const buyIn = resolveSessionBuyIn(sessionData, roomSnap.data()?.bourreSettings);
  const sessionStake = sessionData.handStake ?? 1;
  const dealContext = decisionContextFromSession(
    sessionData,
    sortedPlayerIds,
    scoreById,
    dealingRule,
    buyIn,
    sessionStake,
  );

  const hand = getSessionCurrentHand(sessionData);
  const decision = hand?.handDecision;
  if (hand?.phase === HAND_PHASE.DECISION && decision?.active) {
    if (Date.now() < enrollmentDeadlineMs(decision)) return;
    await runDecisionStepTransaction(roomId, sessionId, (data) => {
      const activeHand = getSessionCurrentHand(data);
      const activeDecision = activeHand?.handDecision;
      if (activeHand?.phase !== HAND_PHASE.DECISION || !activeDecision?.active) return null;
      if (Date.now() < enrollmentDeadlineMs(activeDecision)) return null;
      const step = applyDecisionTimeout(activeHand, activeDecision, dealContext);
      return patchFromDecisionStep(data, step, dealContext);
    });
    return;
  }

  await runEnrollmentStepTransaction(roomId, sessionId, (data, freshScoreById) => {
    const enrollment = getSessionEnrollment(data);
    if (!enrollment?.active) return null;
    if (Date.now() < enrollmentDeadlineMs(enrollment)) return null;

    const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
    const enrolledIds = [...(enrollment.enrolledIds || [])];
    const declinedIds = [...(enrollment.declinedIds || []), currentId];
    return enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
      dealerId: data.dealerId,
      sortedPlayerIds,
      seed: Date.now(),
      dealingRule,
      scoreById: freshScoreById,
      buyIn,
      sessionStake,
      carryIn: data.carryOverPot || 0,
      handCount: data.handCount || 0,
    });
  });
}

/** Pagat play/pass during the post-reveal decision window. */
export async function setHandDecision(
  roomId,
  sessionId,
  { playerId, inHand, discardCount = 0, actorId },
) {
  return callEnrollmentAction(
    () => setHandDecisionClient(roomId, sessionId, { playerId, inHand, discardCount, actorId }),
    () => gameSetHandParticipation(roomId, sessionId, { playerId, inHand, actorId, discardCount }),
  );
}

async function setHandDecisionClient(roomId, sessionId, { playerId, inHand, discardCount = 0, actorId }) {
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
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const buyIn = resolveSessionBuyIn(sessionData, roomSnap.data()?.bourreSettings);
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  const sessionStake = sessionData.handStake ?? 1;
  const dealContext = decisionContextFromSession(
    sessionData,
    sortedPlayerIds,
    scoreById,
    dealingRule,
    buyIn,
    sessionStake,
  );

  const hand = getSessionCurrentHand(sessionData);
  const decision = getSessionHandDecision(sessionData);
  if (!hand || !decision) throw new Error("Not in play/pass decision phase");

  const currentId = currentDecisionPlayer(decision);
  if (playerId !== currentId) throw new Error(inHand ? "Not your turn to play yet" : "Not your turn to pass yet");

  await runDecisionStepTransaction(
    roomId,
    sessionId,
    (data) => {
      const activeHand = getSessionCurrentHand(data);
      const activeDecision = getSessionHandDecision(data);
      if (!activeHand || !activeDecision) return null;
      const turnId = currentDecisionPlayer(activeDecision);
      if (playerId !== turnId) return null;
      const step = inHand
        ? applyDecisionPlay(activeHand, activeDecision, playerId, discardCount, dealContext)
        : applyDecisionPass(activeHand, activeDecision, playerId, dealContext);
      return patchFromDecisionStep(data, step, dealContext);
    },
    { requirePatch: true },
  );
}

/** Each signed-in player toggles only their own participation in the current hand. */
export async function setHandParticipation(roomId, sessionId, { playerId, inHand, actorId, discardCount = 0 }) {
  const sessionSnap = await getDoc(sessionDoc(roomId, sessionId));
  if (sessionSnap.exists()) {
    const hand = getSessionCurrentHand(sessionSnap.data());
    if (hand?.phase === HAND_PHASE.REVEAL && hand?.handDecision) {
      await advanceHandReveal(roomId, sessionId);
      const refreshed = await getDoc(sessionDoc(roomId, sessionId));
      const nextPhase = getSessionCurrentHand(refreshed.data())?.phase ?? null;
      if (nextPhase === HAND_PHASE.DRAW || nextPhase === HAND_PHASE.PLAY) {
        return;
      }
      return setHandDecision(roomId, sessionId, { playerId, inHand, discardCount, actorId });
    }
    if (hand?.phase === HAND_PHASE.DECISION && hand?.handDecision?.active) {
      return setHandDecision(roomId, sessionId, { playerId, inHand, discardCount, actorId });
    }
    const inProgress =
      hand?.phase === HAND_PHASE.REVEAL ||
      hand?.phase === HAND_PHASE.DECISION ||
      hand?.phase === HAND_PHASE.DRAW ||
      hand?.phase === HAND_PHASE.PLAY;
    if (inProgress && !getSessionEnrollment(sessionSnap.data())?.active) {
      throw new Error("This hand is already in progress — use Play, Pass, or Stay pat.");
    }
  }
  return callEnrollmentAction(
    () => setHandParticipationClient(roomId, sessionId, { playerId, inHand, actorId }),
    () => gameSetHandParticipation(roomId, sessionId, { playerId, inHand, actorId, discardCount }),
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
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const buyIn = resolveSessionBuyIn(sessionData, roomSnap.data()?.bourreSettings);

  if (inHand) {
    const row = scoreById[playerId];
    if (!canEnrollWithBankroll(scoreBankroll(row, buyIn))) {
      throw new Error("You're out — bankroll is empty. Rebuy is required before joining.");
    }
  }

  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  const sessionStake = sessionData.handStake ?? 1;

  const enrollment = getSessionEnrollment(sessionData);
  if (enrollment?.active) {
    const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
    if (!inHand) {
      if (playerId !== currentId) throw new Error("Not your turn to pass yet");
      if ((enrollment.declinedIds || []).includes(playerId)) return;
      await runEnrollmentStepTransaction(
        roomId,
        sessionId,
        (data, freshScoreById) => {
          const activeEnrollment = getSessionEnrollment(data);
          if (!activeEnrollment?.active) return null;
          const turnId = activeEnrollment.orderedPlayerIds[activeEnrollment.currentIndex];
          if (playerId !== turnId) return null;
          if ((activeEnrollment.declinedIds || []).includes(playerId)) return null;
          const enrolledIds = [...(activeEnrollment.enrolledIds || [])];
          const declinedIds = [...(activeEnrollment.declinedIds || []), playerId];
          return enrollmentPatchAfterStep(activeEnrollment, enrolledIds, declinedIds, {
            dealerId: data.dealerId,
            sortedPlayerIds,
            seed: Date.now(),
            dealingRule,
            scoreById: freshScoreById,
            buyIn,
            sessionStake,
            carryIn: data.carryOverPot || 0,
            handCount: data.handCount || 0,
          });
        },
        { requirePatch: true },
      );
      return;
    }
    if (playerId !== currentId) throw new Error("Not your turn to join yet");
    if ((enrollment.enrolledIds || []).includes(playerId)) return;

    await runEnrollmentStepTransaction(
      roomId,
      sessionId,
      (data, freshScoreById) => {
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
          scoreById: freshScoreById,
          buyIn,
          sessionStake,
          carryIn: data.carryOverPot || 0,
          handCount: data.handCount || 0,
        });
      },
      { requirePatch: true },
    );
    await updateDoc(sessionDoc(roomId, sessionId), {
      tableOptInIds: arrayUnion(playerId),
      updatedAt: serverTimestamp(),
    });
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
