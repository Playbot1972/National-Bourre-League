/**
 * Mixed public-table two-player matchmaking integration tests.
 *
 * Run via:
 *   cd functions && MIXED_PUBLIC_TABLES_SERVER_ENABLED=true FIRESTORE_EMULATOR_HOST=127.0.0.1:8088 \
 *     node --test publicTableMatchmaking.integration.test.mjs
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { handleFindOrCreatePublicTable } from "./publicTable.js";
import {
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PUBLIC_TABLE_INDEX_COLLECTION,
  PUBLIC_TABLE_MATCHMAKING_POOL_COLLECTION,
  PLAY_NOW_QUEUE_MODE,
  publicTableIndexKey,
} from "./vendor/public-table-schema.js";

const PROJECT_ID = "demo-national-bourre-league";
const PLAYER_A = "mixed_player_a";
const PLAYER_B = "mixed_player_b";

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
    await db.collection("_ping").doc("matchmaking").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn(
      "Skipping publicTableMatchmaking integration tests — Firestore emulator not running.",
      err?.message ?? err,
    );
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
    PUBLIC_TABLE_MATCHMAKING_POOL_COLLECTION,
    "rooms",
    "roomMembers",
  ]) {
    const snap = await db.collection(name).get();
    if (!snap.size) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

describe("mixed public-table matchmaking", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await clearFixtures();
  });

  it("first device creates a mixed public table", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const created = await handleFindOrCreatePublicTable(db, {
      actorId: PLAYER_A,
      joinId: "mixed-a-join",
      displayName: "Player A",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(created.mode, "created");
    assert.equal(created.status, "seated");
    assert.ok(created.roomId);
    assert.ok(created.sessionId);

    const indexSnap = await db
      .collection(PUBLIC_TABLE_INDEX_COLLECTION)
      .doc(publicTableIndexKey(created.roomId, created.sessionId))
      .get();
    assert.equal(indexSnap.exists, true);
    assert.equal(indexSnap.data()?.realPlayerCount, 1);
  });

  it("second device joins the same eligible mixed table", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const host = await handleFindOrCreatePublicTable(db, {
      actorId: PLAYER_A,
      joinId: "mixed-host-join",
      displayName: "Player A",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const guest = await handleFindOrCreatePublicTable(db, {
      actorId: PLAYER_B,
      joinId: "mixed-guest-join",
      displayName: "Player B",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(guest.mode, "joined-existing");
    assert.equal(guest.status, "spectating");
    assert.equal(guest.roomId, host.roomId);
    assert.equal(guest.sessionId, host.sessionId);

    const memberSnap = await db.collection("roomMembers").doc(`${host.roomId}_${PLAYER_B}`).get();
    assert.equal(memberSnap.exists, true);

    const sessionSnap = await db
      .collection("rooms")
      .doc(host.roomId)
      .collection("sessions")
      .doc(host.sessionId)
      .get();
    assert.equal(sessionSnap.data()?.pendingJoins?.[PLAYER_B]?.status, "spectating");

    const queueSnap = await db.collection(MATCH_QUEUE_COLLECTION).doc(PLAYER_B).get();
    assert.equal(queueSnap.data()?.status, MATCH_QUEUE_STATUS.SPECTATING);
    assert.equal(queueSnap.data()?.roomId, host.roomId);
  });

  it("concurrent Play Now requests land on the same mixed table", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const [resultA, resultB] = await Promise.all([
      handleFindOrCreatePublicTable(db, {
        actorId: PLAYER_A,
        joinId: "mixed-race-a",
        displayName: "Player A",
        queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
      }),
      handleFindOrCreatePublicTable(db, {
        actorId: PLAYER_B,
        joinId: "mixed-race-b",
        displayName: "Player B",
        queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
      }),
    ]);

    assert.ok(resultA?.roomId && resultB?.roomId);
    assert.equal(
      resultA.roomId,
      resultB.roomId,
      "concurrent mixed Play Now should not split into separate rooms",
    );
    assert.equal(resultA.sessionId, resultB.sessionId);

    const statuses = new Set([resultA.status, resultB.status]);
    assert.ok(statuses.has("seated"));
    assert.ok(statuses.has("spectating"));

    const indexCount = await db.collection(PUBLIC_TABLE_INDEX_COLLECTION).get();
    const mixedTables = indexCount.docs.filter(
      (d) => d.data()?.queueMode !== PLAY_NOW_QUEUE_MODE.BOTS_ONLY,
    );
    assert.equal(mixedTables.length, 1, "only one mixed public index entry should exist");
  });
});
