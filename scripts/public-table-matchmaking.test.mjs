/**
 * Public-table matchmaking integration tests (Phase 3).
 *
 * Run via:
 *   MIXED_PUBLIC_TABLES_SERVER_ENABLED=true npx firebase emulators:exec --only firestore \
 *     --project demo-national-bourre-league \
 *     "node --test scripts/public-table-matchmaking.test.mjs"
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleFindOrCreatePublicTable,
  handleJoinPublicTable,
  handleLeavePublicTable,
  rebuildPublicTableIndex,
} from "../functions/publicTable.js";
import {
  MATCH_QUEUE_COLLECTION,
  PUBLIC_TABLE_INDEX_COLLECTION,
  BOT_ROLE,
} from "../docs/public-table-schema.js";

const PROJECT_ID = "demo-national-bourre-league";
const HOST_UID = "pub_match_host";
const GUEST_UID = "pub_match_guest";
const HOST_JOIN_ID = "host-join-primary";
const GUEST_JOIN_ID = "guest-join-primary";

let db;
let emulatorAvailable = false;
let hostTable = null;

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
    await db.collection("_ping").doc("matchmaking").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn(
      "Skipping public-table-matchmaking tests — Firestore emulator not running.",
      err?.message ?? err,
    );
    emulatorAvailable = false;
  }
});

after(async () => {
  delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
});

async function clearPublicFixtures() {
  const collections = [
    MATCH_QUEUE_COLLECTION,
    PUBLIC_TABLE_INDEX_COLLECTION,
    "rooms",
    "roomMembers",
    "inviteLookups",
  ];
  for (const name of collections) {
    const snap = await db.collection(name).get();
    if (!snap.size) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

describe("public-table matchmaking integration", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await clearPublicFixtures();
  });

  it("creates a public table with fill bots when no candidate exists", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST_UID,
      joinId: HOST_JOIN_ID,
      displayName: "Host",
      targetSeatCount: 6,
      buyInAmount: 1000,
      anteAmount: 50,
    });
    assert.equal(hostTable.ok, true);
    assert.equal(hostTable.mode, "created");
    assert.equal(hostTable.status, "seated");
    assert.equal(hostTable.realPlayerCount, 1);
    assert.equal(hostTable.botFillCount, 5);
    assert.equal(hostTable.openSeats, 0);

    const scoresSnap = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .collection("scores")
      .get();
    const fillBots = scoresSnap.docs.filter((d) => d.data()?.botRole === BOT_ROLE.FILL);
    assert.equal(fillBots.length, 5);

    const roomSnap = await db.collection("rooms").doc(hostTable.roomId).get();
    assert.equal(roomSnap.data()?.visibility, "public");
    assert.equal(roomSnap.data()?.features?.mixedPublicTables, true);
  });

  it("returns the same result for the same joinId (idempotent)", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    const again = await handleFindOrCreatePublicTable(db, {
      actorId: HOST_UID,
      joinId: HOST_JOIN_ID,
      displayName: "Host",
    });
    assert.equal(again.roomId, hostTable.roomId);
    assert.equal(again.sessionId, hostTable.sessionId);
    assert.equal(again.status, "seated");
  });

  it("rejects a different joinId while an active queue exists", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await assert.rejects(
      () =>
        handleFindOrCreatePublicTable(db, {
          actorId: HOST_UID,
          joinId: "host-join-other",
          displayName: "Host",
        }),
      (err) => err.code === "already-exists",
    );
  });

  it("joins existing table as spectating without a score row", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    const joined = await handleJoinPublicTable(db, {
      actorId: GUEST_UID,
      joinId: GUEST_JOIN_ID,
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
      displayName: "Guest",
    });
    assert.equal(joined.status, "spectating");

    const guestScore = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .collection("scores")
      .doc(GUEST_UID)
      .get();
    assert.equal(guestScore.exists, false);

    const sessionSnap = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .get();
    assert.equal(sessionSnap.data()?.pendingJoins?.[GUEST_UID]?.status, "spectating");
  });

  it("leave clears spectating queue and pendingJoin; repeated leave is safe", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    const left = await handleLeavePublicTable(db, { actorId: GUEST_UID });
    assert.equal(left.cleared, true);

    const queueSnap = await db.collection(MATCH_QUEUE_COLLECTION).doc(GUEST_UID).get();
    assert.equal(queueSnap.exists, false);

    const sessionSnap = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .get();
    assert.equal(sessionSnap.data()?.pendingJoins?.[GUEST_UID], undefined);

    const leftAgain = await handleLeavePublicTable(db, { actorId: GUEST_UID });
    assert.equal(leftAgain.cleared, false);

    const hostScores = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .collection("scores")
      .doc(HOST_UID)
      .get();
    assert.equal(hostScores.exists, true);
  });

  it("rebuilds stale index from source-of-truth", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    const key = `${hostTable.roomId}_${hostTable.sessionId}`;
    await db.collection(PUBLIC_TABLE_INDEX_COLLECTION).doc(key).set({
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
      realPlayerCount: 0,
      botFillCount: 0,
      openSeats: 99,
      status: "open",
      stakesKey: "1000_50",
    });
    const rebuilt = await rebuildPublicTableIndex(db, hostTable.roomId, hostTable.sessionId);
    assert.equal(rebuilt.realPlayerCount, 1);
    assert.equal(rebuilt.botFillCount, 5);
    assert.equal(rebuilt.openSeats, 0);
  });
});
