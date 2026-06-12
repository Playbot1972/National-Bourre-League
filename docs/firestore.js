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
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
} = await import(`${CDN}/firebase-firestore.js`);

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
  const batch = writeBatch(db);
  batch.set(roomRef, {
    inviteCode: generateInviteCode(),
    ownerId: owner.uid,
    name: name || `${owner.displayName.split(" ")[0]}'s Room`,
    houseRules: houseRules || DEFAULT_HOUSE_RULES,
    status: "open",
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
  return roomRef.id;
}

/** Join an existing room by invite code. Returns the roomId or null. */
export async function joinRoomByCode(code, user) {
  const q = query(
    collection(db, "rooms"),
    where("inviteCode", "==", code.trim().toUpperCase()),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const room = snap.docs[0];
  await setDoc(
    doc(db, "roomMembers", memberId(room.id, user.uid)),
    {
      roomId: room.id,
      userId: user.uid,
      displayName: user.displayName,
      role: "player",
      joinedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return room.id;
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

// Firestore Timestamp | server placeholder | undefined → comparable seconds.
function seconds(ts) {
  if (ts && typeof ts.seconds === "number") return ts.seconds;
  return 0;
}
