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
//   { roomId, status: "in_progress" | "final", rounds,
//     players: [{ playerId, displayName }],
//     notes,                          // informational ONLY — never money
//     totals: { byPlayer: { [playerId]: tricks }, tricks },
//     createdAt, updatedAt }
//
// rooms/{roomId}/sessions/{sessionId}/scores/{playerId}   (one row per player)
//   { sessionId, roomId, playerId, displayName, tricksWon, riskPoints, total,
//     updatedAt }
//
// Sessions + scores are nested UNDER the room so security rules can authorize
// them by the {roomId} path wildcard. (Top-level collections with a roomId
// field cannot be used in `list` rules — Firestore evaluates list/query rules
// without per-document `resource.data`, so `resource.data.roomId` is undefined
// there. Subcollections avoid that entirely and scale cleanly.)
//
// NOTE: `notes`, `riskPoints`, `tricksWon`, and `total` are for scorekeeping and
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
//   }
// ---------------------------------------------------------------------------

import { app } from "./auth.js";
import { FIREBASE_SDK_VERSION, FIRESTORE_EMULATOR } from "./firebase-config.js";

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
} = await import(`${CDN}/firebase-firestore.js`);

// Initial TrueSkill rating for a brand-new player (kept in sync with
// ranking.js; duplicated here so the data layer has no UI/logic dependency).
const RATING_INITIAL = { mu: 25, sigma: 25 / 3, matchesPlayed: 0 };
const RATING_INITIAL_APE = Math.round(Math.max(0, 25 - 3 * (25 / 3))); // = 0

const db = getFirestore(app);

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

export const DEFAULT_HOUSE_RULES = {
  ante: "1 chip (bragging rights only)",
  forcedPlay: "Dealer must play",
  ties: "Tied pots carry over",
  dealing: "5 cards, trump from dealer's last card",
};

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
    houseRules: houseRules || DEFAULT_HOUSE_RULES,
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
  await updateDoc(doc(db, "rooms", roomId), { houseRules });
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
const sessionDoc = (roomId, sessionId) =>
  doc(db, "rooms", roomId, "sessions", sessionId);
const scoreDoc = (roomId, sessionId, playerId) =>
  doc(db, "rooms", roomId, "sessions", sessionId, "scores", playerId);

export async function createSession(roomId, players) {
  const sessionRef = doc(sessionsCol(roomId));
  const batch = writeBatch(db);
  batch.set(sessionRef, {
    roomId,
    status: "in_progress",
    rounds: 0,
    players: players.map((p) => ({ playerId: p.playerId, displayName: p.displayName })),
    notes: "",
    totals: { byPlayer: {}, tricks: 0 },
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
      riskPoints: 1,
      total: 0,
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

export function subscribeScores(roomId, sessionId, callback) {
  return onSnapshot(scoresCol(roomId, sessionId), (snap) => {
    callback(snap.docs.map(withId).sort((a, b) => b.total - a.total));
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
  let tricks = 0;
  snap.docs.forEach((d) => {
    const s = d.data();
    byPlayer[s.playerId] = s.tricksWon || 0;
    tricks += s.tricksWon || 0;
  });
  await updateDoc(sessionDoc(roomId, sessionId), {
    totals: { byPlayer, tricks },
    rounds: tricks, // each trick won counts as a played round in this simple model
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

/** Add a (guest) player to an in-progress session, with a fresh score row. */
export async function addSessionPlayer(roomId, sessionId, playerId, displayName) {
  await ensurePlayerDoc(playerId, displayName);
  const batch = writeBatch(db);
  batch.update(sessionDoc(roomId, sessionId), {
    players: arrayUnion({ playerId, displayName }),
    updatedAt: serverTimestamp(),
  });
  batch.set(scoreDoc(roomId, sessionId, playerId), {
    sessionId,
    roomId,
    playerId,
    displayName,
    tricksWon: 0,
    riskPoints: 1,
    total: 0,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
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

// Firestore Timestamp | server placeholder | undefined → comparable seconds.
function seconds(ts) {
  if (ts && typeof ts.seconds === "number") return ts.seconds;
  return 0;
}
