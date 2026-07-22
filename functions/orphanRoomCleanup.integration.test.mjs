/**
 * Orphan-room cleanup integration tests (Firestore emulator).
 *
 * Run from functions/:
 *   npx firebase emulators:exec --only firestore \
 *     --project demo-national-bourre-league \
 *     "node --test orphanRoomCleanup.integration.test.mjs"
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  ORPHAN_ROOM_GRACE_MS,
  handleRoomMemberCreated,
  handleRoomMemberDeleted,
  runOrphanRoomGc,
} from "./orphanRoomCleanup.js";
import { PUBLIC_TABLE_INDEX_COLLECTION } from "./vendor/public-table-schema.js";

const PROJECT_ID = "demo-national-bourre-league";
const ROOM_ID = "orphan_room_it";
const SESSION_ID = "orphan_sess_it";
const OWNER_UID = "orphan_owner";
const GUEST_UID = "orphan_guest";
const INVITE_CODE = "ORP-HAN";

let db;
let emulatorAvailable = false;

before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088";
  }
  try {
    if (!getApps().length) {
      initializeApp({ projectId: PROJECT_ID });
    }
    db = getFirestore();
    await db.collection("_ping").doc("orphan").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn(
      "Skipping orphan-room integration tests — Firestore emulator not running.",
      err?.message ?? err,
    );
    emulatorAvailable = false;
  }
});

after(async () => {
  if (!emulatorAvailable) return;
  await clearCollections();
});

async function clearCollections() {
  for (const name of ["rooms", "roomMembers", "inviteLookups", PUBLIC_TABLE_INDEX_COLLECTION]) {
    const snap = await db.collection(name).get();
    if (snap.empty) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function seedRoomWithArtifacts({ lastMemberLeftAt = null } = {}) {
  await clearCollections();

  const roomPayload = {
    inviteCode: INVITE_CODE,
    ownerId: OWNER_UID,
    name: "Orphan IT Room",
    status: "open",
    createdAt: FieldValue.serverTimestamp(),
  };
  if (lastMemberLeftAt) {
    roomPayload.lastMemberLeftAt = lastMemberLeftAt;
  }

  await db.collection("rooms").doc(ROOM_ID).set(roomPayload);
  await db.collection("inviteLookups").doc(INVITE_CODE).set({ roomId: ROOM_ID, ownerId: OWNER_UID });
  await db
    .collection("rooms")
    .doc(ROOM_ID)
    .collection("sessions")
    .doc(SESSION_ID)
    .set({
      roomId: ROOM_ID,
      sessionName: "Test",
      status: "in_progress",
      createdAt: FieldValue.serverTimestamp(),
    });
  await db.collection(PUBLIC_TABLE_INDEX_COLLECTION).doc(`${ROOM_ID}_${SESSION_ID}`).set({
    roomId: ROOM_ID,
    sessionId: SESSION_ID,
    status: "open",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

describe("orphan-room integration", () => {
  it("sets lastMemberLeftAt only when the final member leaves", async () => {
    if (!emulatorAvailable) return;
    await seedRoomWithArtifacts();
    await db.collection("roomMembers").doc(`${ROOM_ID}_${OWNER_UID}`).set({
      roomId: ROOM_ID,
      userId: OWNER_UID,
      role: "owner",
    });
    await db.collection("roomMembers").doc(`${ROOM_ID}_${GUEST_UID}`).set({
      roomId: ROOM_ID,
      userId: GUEST_UID,
      role: "player",
    });

    await db.collection("roomMembers").doc(`${ROOM_ID}_${GUEST_UID}`).delete();
    await handleRoomMemberDeleted(db, { roomId: ROOM_ID });

    let roomSnap = await db.collection("rooms").doc(ROOM_ID).get();
    assert.equal(roomSnap.data().lastMemberLeftAt, undefined);

    await db.collection("roomMembers").doc(`${ROOM_ID}_${OWNER_UID}`).delete();
    await handleRoomMemberDeleted(db, { roomId: ROOM_ID });

    roomSnap = await db.collection("rooms").doc(ROOM_ID).get();
    assert.ok(roomSnap.data().lastMemberLeftAt);
  });

  it("clears lastMemberLeftAt when a member rejoins", async () => {
    if (!emulatorAvailable) return;
    await seedRoomWithArtifacts({
      lastMemberLeftAt: Timestamp.fromMillis(Date.now() - 1_000),
    });

    await db.collection("roomMembers").doc(`${ROOM_ID}_${OWNER_UID}`).set({
      roomId: ROOM_ID,
      userId: OWNER_UID,
      role: "owner",
    });
    await handleRoomMemberCreated(db, { roomId: ROOM_ID, userId: OWNER_UID });

    const roomSnap = await db.collection("rooms").doc(ROOM_ID).get();
    assert.equal(roomSnap.data().lastMemberLeftAt, undefined);
  });

  it("scheduled GC deletes expired orphan artifacts and skips active rooms", async () => {
    if (!emulatorAvailable) return;
    const now = Date.now();
    const expiredAt = Timestamp.fromMillis(now - ORPHAN_ROOM_GRACE_MS - 60_000);

    await seedRoomWithArtifacts({ lastMemberLeftAt: expiredAt });

    await db.collection("rooms").doc("active_room").set({
      inviteCode: "ACT-IVE",
      ownerId: "active_owner",
      status: "open",
      createdAt: FieldValue.serverTimestamp(),
    });
    await db.collection("roomMembers").doc("active_room_active_owner").set({
      roomId: "active_room",
      userId: "active_owner",
      role: "owner",
    });

    const result = await runOrphanRoomGc(db, { nowMs: now });
    assert.equal(result.deleted, 1);

    const orphanRoom = await db.collection("rooms").doc(ROOM_ID).get();
    assert.equal(orphanRoom.exists, false);
    const orphanSession = await db
      .collection("rooms")
      .doc(ROOM_ID)
      .collection("sessions")
      .doc(SESSION_ID)
      .get();
    assert.equal(orphanSession.exists, false);
    const lookup = await db.collection("inviteLookups").doc(INVITE_CODE).get();
    assert.equal(lookup.exists, false);
    const index = await db
      .collection(PUBLIC_TABLE_INDEX_COLLECTION)
      .doc(`${ROOM_ID}_${SESSION_ID}`)
      .get();
    assert.equal(index.exists, false);

    const activeRoom = await db.collection("rooms").doc("active_room").get();
    assert.equal(activeRoom.exists, true);
  });
});
