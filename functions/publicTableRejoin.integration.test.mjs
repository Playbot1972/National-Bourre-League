/**
 * Public-table seat vacate + rejoin integration tests (Firestore emulator).
 *
 * Run from functions/:
 *   MIXED_PUBLIC_TABLES_SERVER_ENABLED=true npx firebase emulators:exec --only firestore \
 *     --project demo-national-bourre-league \
 *     "node --test publicTableRejoin.integration.test.mjs"
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  handleFindOrCreatePublicTable,
  handleJoinPublicTable,
  handleLeavePublicTable,
  handlePublicTableMemberRemoved,
} from "./publicTable.js";
import {
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  PUBLIC_TABLE_INDEX_COLLECTION,
} from "./vendor/public-table-schema.js";

const PROJECT_ID = "demo-national-bourre-league";
const HOST_UID = "rejoin_host";
const GUEST_UID = "rejoin_guest";

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
    await db.collection("_ping").doc("rejoin").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn("Skipping rejoin integration tests — emulator unavailable.", err?.message ?? err);
    emulatorAvailable = false;
  }
});

after(async () => {
  delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
});

async function clearFixtures() {
  for (const name of [
    MATCH_QUEUE_COLLECTION,
    PUBLIC_TABLE_INDEX_COLLECTION,
    "rooms",
    "roomMembers",
    "inviteLookups",
  ]) {
    const snap = await db.collection(name).get();
    if (!snap.size) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function createHostTable(joinId = "rejoin-host-join") {
  return handleFindOrCreatePublicTable(db, {
    actorId: HOST_UID,
    joinId,
    displayName: "Host",
    targetSeatCount: 4,
  });
}

async function seatGuestDirectly(roomId, sessionId, guestJoinId = "rejoin-guest-join") {
  await handleJoinPublicTable(db, {
    actorId: GUEST_UID,
    joinId: guestJoinId,
    displayName: "Guest",
    roomId,
    sessionId,
  });

  const sessionRef = db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId);
  const sessionSnap = await sessionRef.get();
  const sessionData = sessionSnap.data();
  const buyIn = sessionData.buyInAmount ?? 1000;

  await sessionRef.collection("scores").doc(GUEST_UID).set({
    sessionId,
    roomId,
    playerId: GUEST_UID,
    displayName: "Guest",
    bankroll: buyIn,
    tricksWon: 0,
    handsWon: 0,
    net: 0,
    total: 0,
    joinedAtHandCount: sessionData.handCount ?? 0,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const players = [...(sessionData.players ?? [])];
  const botIndex = players.findIndex((p) => String(p?.playerId ?? "").startsWith("bot_"));
  if (botIndex >= 0) {
    const botId = players[botIndex]?.playerId;
    players[botIndex] = { playerId: GUEST_UID, displayName: "Guest" };
    if (botId) {
      await sessionRef.collection("scores").doc(botId).delete().catch(() => {});
    }
  } else {
    players.push({ playerId: GUEST_UID, displayName: "Guest" });
  }

  await sessionRef.update({
    players,
    pendingJoins: {
      ...(sessionData.pendingJoins ?? {}),
      [GUEST_UID]: {
        joinId: guestJoinId,
        status: PENDING_JOIN_STATUS.SEATED,
        queuedAtHandCount: sessionData.handCount ?? 0,
        displayName: "Guest",
      },
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection(MATCH_QUEUE_COLLECTION).doc(GUEST_UID).set({
    sessionKey: `${roomId}_${sessionId}`,
    roomId,
    sessionId,
    activeJoinId: guestJoinId,
    status: MATCH_QUEUE_STATUS.SEATED,
    requestedAt: FieldValue.serverTimestamp(),
  });
}

function memberDocId(roomId, userId) {
  return `${roomId}_${userId}`;
}

describe("public-table seat vacate + rejoin", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await clearFixtures();
  });

  it("seated host leave then Play Now succeeds", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    await clearFixtures();

    const hostTable = await createHostTable("host-leave-join-1");
    assert.equal(hostTable.status, "seated");

    const left = await handleLeavePublicTable(db, { actorId: HOST_UID });
    assert.equal(left.cleared, true);
    assert.equal(left.seatVacated, true);

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    const hostScore = await sessionRef.collection("scores").doc(HOST_UID).get();
    assert.equal(hostScore.exists, false);

    const sessionSnap = await sessionRef.get();
    assert.ok(!(sessionSnap.data()?.players ?? []).some((p) => p.playerId === HOST_UID));

    const replay = await handleFindOrCreatePublicTable(db, {
      actorId: HOST_UID,
      joinId: "host-leave-join-2",
      displayName: "Host",
      targetSeatCount: 4,
    });
    assert.equal(replay.ok, true);
    assert.ok(["seated", "spectating"].includes(replay.status));
  });

  it("seated guest leave then Play Now succeeds", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    await clearFixtures();

    const hostTable = await createHostTable("guest-leave-host-join");
    await seatGuestDirectly(hostTable.roomId, hostTable.sessionId, "guest-leave-join-1");

    const left = await handleLeavePublicTable(db, { actorId: GUEST_UID });
    assert.equal(left.cleared, true);
    assert.equal(left.seatVacated, true);

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    const guestScore = await sessionRef.collection("scores").doc(GUEST_UID).get();
    assert.equal(guestScore.exists, false);

    const replay = await handleFindOrCreatePublicTable(db, {
      actorId: GUEST_UID,
      joinId: "guest-leave-join-2",
      displayName: "Guest",
      targetSeatCount: 4,
    });
    assert.equal(replay.ok, true);
    assert.ok(["seated", "spectating"].includes(replay.status));
  });

  it("seated kick then Play Now succeeds", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    await clearFixtures();

    const hostTable = await createHostTable("kick-host-join");
    await seatGuestDirectly(hostTable.roomId, hostTable.sessionId, "kick-guest-join-1");

    await db.collection("roomMembers").doc(memberDocId(hostTable.roomId, GUEST_UID)).delete();
    const removed = await handlePublicTableMemberRemoved(db, {
      roomId: hostTable.roomId,
      userId: GUEST_UID,
    });
    assert.equal(removed.handled, true);

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    const guestScore = await sessionRef.collection("scores").doc(GUEST_UID).get();
    assert.equal(guestScore.exists, false);

    const queueSnap = await db.collection(MATCH_QUEUE_COLLECTION).doc(GUEST_UID).get();
    assert.equal(queueSnap.exists, false);

    const replay = await handleFindOrCreatePublicTable(db, {
      actorId: GUEST_UID,
      joinId: "kick-guest-join-2",
      displayName: "Guest",
      targetSeatCount: 4,
    });
    assert.equal(replay.ok, true);
    assert.ok(["seated", "spectating"].includes(replay.status));
  });

  it("spectator leave unchanged", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    await clearFixtures();

    const hostTable = await createHostTable("spectator-host-join");
    await handleJoinPublicTable(db, {
      actorId: GUEST_UID,
      joinId: "spectator-guest-join",
      displayName: "Guest",
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
    });

    const left = await handleLeavePublicTable(db, { actorId: GUEST_UID });
    assert.equal(left.cleared, true);
    assert.equal(left.seatVacated, false);

    const sessionRef = db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId);
    const hostScore = await sessionRef.collection("scores").doc(HOST_UID).get();
    assert.equal(hostScore.exists, true);
    const sessionSnap = await sessionRef.get();
    assert.equal(sessionSnap.data()?.pendingJoins?.[GUEST_UID], undefined);
  });

  it("active queue + same joinId idempotency unchanged", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    await clearFixtures();

    const hostTable = await createHostTable("idem-host-join");
    const guestJoinId = "idem-guest-join";
    const first = await handleJoinPublicTable(db, {
      actorId: GUEST_UID,
      joinId: guestJoinId,
      displayName: "Guest",
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
    });
    assert.equal(first.status, "spectating");

    const second = await handleFindOrCreatePublicTable(db, {
      actorId: GUEST_UID,
      joinId: guestJoinId,
      displayName: "Guest",
      targetSeatCount: 4,
    });
    assert.equal(second.ok, true);
    assert.equal(second.status, "spectating");
    assert.equal(second.roomId, hostTable.roomId);
    assert.equal(second.sessionId, hostTable.sessionId);

    const queueSnap = await db.collection(MATCH_QUEUE_COLLECTION).doc(GUEST_UID).get();
    assert.equal(queueSnap.data()?.status, MATCH_QUEUE_STATUS.SPECTATING);
    assert.equal(queueSnap.data()?.activeJoinId, guestJoinId);
  });

  it("stale self-table candidate is vacated instead of fatal already-seated", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    await clearFixtures();

    const hostTable = await createHostTable("stale-host-join");
    const staleRoomId = hostTable.roomId;
    const staleSessionId = hostTable.sessionId;

    await db.collection(MATCH_QUEUE_COLLECTION).doc(HOST_UID).delete();
    await db.collection("roomMembers").doc(memberDocId(staleRoomId, HOST_UID)).delete();

    const staleScore = await db
      .collection("rooms")
      .doc(staleRoomId)
      .collection("sessions")
      .doc(staleSessionId)
      .collection("scores")
      .doc(HOST_UID)
      .get();
    assert.equal(staleScore.exists, true);

    const replay = await handleFindOrCreatePublicTable(db, {
      actorId: HOST_UID,
      joinId: "stale-host-join-2",
      displayName: "Host",
      targetSeatCount: 4,
    });
    assert.equal(replay.ok, true);
    assert.ok(["seated", "spectating"].includes(replay.status));

    const oldScore = await db
      .collection("rooms")
      .doc(staleRoomId)
      .collection("sessions")
      .doc(staleSessionId)
      .collection("scores")
      .doc(HOST_UID)
      .get();
    assert.equal(oldScore.exists, false);
  });
});
