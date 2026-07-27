/**
 * Canonical public-table join integration tests (mixed matchmaking + room-code).
 *
 * Run via:
 *   cd functions && MIXED_PUBLIC_TABLES_SERVER_ENABLED=true FIRESTORE_EMULATOR_HOST=127.0.0.1:8088 \
 *     node --test publicTableJoin.integration.test.mjs
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleFindOrCreatePublicTable,
  handleJoinPublicTable,
  isSessionInHand,
} from "./publicTable.js";
import { applyPendingReplacements } from "./publicTableReplacement.js";
import {
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  PLAY_NOW_QUEUE_MODE,
} from "./vendor/public-table-schema.js";

const PROJECT_ID = "demo-national-bourre-league";
const HOST = "join_host_uid";
const GUEST = "join_guest_uid";
const ROOM_GUEST = "room_code_guest_uid";

let db;
let emulatorAvailable = false;

before(async () => {
  process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088";
  }
  try {
    if (!getApps().length) {
      initializeApp({ projectId: PROJECT_ID });
    }
    db = getFirestore();
    await db.collection("_ping").doc("join").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn("Skipping publicTableJoin integration tests", err?.message ?? err);
    emulatorAvailable = false;
  }
});

after(async () => {
  delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
});

async function clearFixtures() {
  for (const name of [MATCH_QUEUE_COLLECTION, "rooms", "roomMembers", "publicTableIndex", "inviteLookups"]) {
    const snap = await db.collection(name).get();
    if (!snap.size) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

describe("canonical public-table join", () => {
  it("mixed join prefers existing table with real humans over creating a new one", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST,
      joinId: "join-host",
      displayName: "Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const guest = await handleFindOrCreatePublicTable(db, {
      actorId: GUEST,
      joinId: "join-guest",
      displayName: "Guest",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(guest.roomId, hostTable.roomId);
    assert.equal(guest.sessionId, hostTable.sessionId);
    assert.notEqual(guest.mode, "created");
  });

  it("mixed handoff join seats immediately when between hands", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST,
      joinId: "handoff-host",
      displayName: "Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    await sessionRef.update({
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    });

    const guest = await handleFindOrCreatePublicTable(db, {
      actorId: GUEST,
      joinId: "handoff-guest",
      displayName: "Guest",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(guest.status, "seated");
    assert.equal(guest.canPromoteAtNextBoundary, true);
    const scoreSnap = await sessionRef.collection("scores").doc(GUEST).get();
    assert.ok(scoreSnap.exists);
  });

  it("mixed mid-hand join is watch-only and promotes at next hand boundary", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST,
      joinId: "mid-host",
      displayName: "Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    await sessionRef.update({
      currentHand: {
        phase: "play",
        tricksByPlayer: { [HOST]: 1 },
        participantIds: [HOST, "bot_placeholder"],
        turnPlayerId: HOST,
      },
    });

    const guest = await handleFindOrCreatePublicTable(db, {
      actorId: GUEST,
      joinId: "mid-guest",
      displayName: "Guest",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(guest.status, "spectating");
    assert.equal(guest.canPromoteAtNextBoundary, true);
    const guestScore = await sessionRef.collection("scores").doc(GUEST).get();
    assert.equal(guestScore.exists, false);

    await sessionRef.update({
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    });
    const roomSnap = await db.collection("rooms").doc(hostTable.roomId).get();
    const sessionSnap = await sessionRef.get();
    const replacement = await applyPendingReplacements(db, {
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
      roomData: roomSnap.data(),
      sessionData: sessionSnap.data(),
    });
    assert.equal(replacement.status, "applied");
    const seatedScore = await sessionRef.collection("scores").doc(GUEST).get();
    assert.ok(seatedScore.exists);
  });

  it("room-code join targets only the specified table via handleJoinPublicTable", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST,
      joinId: "code-host",
      displayName: "Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    await db.collection("roomMembers").doc(`${hostTable.roomId}_${ROOM_GUEST}`).set({
      roomId: hostTable.roomId,
      userId: ROOM_GUEST,
      displayName: "Code Guest",
      role: "player",
      joinedAt: new Date(),
    });

    const joined = await handleJoinPublicTable(db, {
      actorId: ROOM_GUEST,
      joinId: "code-guest",
      displayName: "Code Guest",
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
    });

    assert.equal(joined.roomId, hostTable.roomId);
    assert.equal(joined.sessionId, hostTable.sessionId);
    assert.ok(joined.status === "seated" || joined.status === "spectating");
  });

  it("room-code mid-hand join is watch-only without immediate score row", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST,
      joinId: "code-mid-host",
      displayName: "Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    await sessionRef.update({
      currentHand: {
        phase: "draw",
        tricksByPlayer: {},
        participantIds: [HOST, "bot_x"],
      },
    });

    const joined = await handleJoinPublicTable(db, {
      actorId: ROOM_GUEST,
      joinId: "code-mid-guest",
      displayName: "Code Guest",
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
    });

    assert.equal(joined.status, "spectating");
    const sessionSnap = await sessionRef.get();
    assert.ok(isSessionInHand(sessionSnap.data()));
    const scoreSnap = await sessionRef.collection("scores").doc(ROOM_GUEST).get();
    assert.equal(scoreSnap.exists, false);
    assert.equal(sessionSnap.data()?.pendingJoins?.[ROOM_GUEST]?.status, PENDING_JOIN_STATUS.SPECTATING);

    const queueSnap = await db.collection(MATCH_QUEUE_COLLECTION).doc(ROOM_GUEST).get();
    assert.equal(queueSnap.data()?.status, MATCH_QUEUE_STATUS.SPECTATING);
  });

  it("does not seat mid-hand even when fill bots are available", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST,
      joinId: "illegal-host",
      displayName: "Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    await sessionRef.update({
      currentHand: {
        phase: "play",
        tricksByPlayer: {},
        participantIds: [HOST, "bot_y"],
      },
    });

    const guest = await handleFindOrCreatePublicTable(db, {
      actorId: GUEST,
      joinId: "illegal-guest",
      displayName: "Guest",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(guest.status, "spectating");
    assert.equal(guest.joinDisposition, "pending");
    const scoreSnap = await sessionRef.collection("scores").doc(GUEST).get();
    assert.equal(scoreSnap.exists, false);
  });
});
