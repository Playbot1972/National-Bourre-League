/**
 * Phase 3 leave-flow integration tests (Firestore emulator).
 *
 * Run from functions/:
 *   MIXED_PUBLIC_TABLES_SERVER_ENABLED=true npx firebase emulators:exec --only firestore \
 *     --project demo-national-bourre-league \
 *     "node --test publicTableLeave.integration.test.mjs"
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleFindOrCreatePublicTable,
  handleJoinPublicTable,
  handleLeavePublicTable,
} from "./publicTable.js";
import { MATCH_QUEUE_COLLECTION, PUBLIC_TABLE_INDEX_COLLECTION } from "./vendor/public-table-schema.js";

const PROJECT_ID = "demo-national-bourre-league";
const HOST_UID = "leave_host";
const GUEST_UID = "leave_guest";
const HOST_JOIN_ID = "leave-host-join";
const GUEST_JOIN_ID = "leave-guest-join";

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
    await db.collection("_ping").doc("leave").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn("Skipping public-table leave tests — Firestore emulator not running.", err?.message ?? err);
    emulatorAvailable = false;
  }
});

after(async () => {
  delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
});

async function clearFixtures() {
  for (const name of [MATCH_QUEUE_COLLECTION, PUBLIC_TABLE_INDEX_COLLECTION, "rooms", "roomMembers", "inviteLookups"]) {
    const snap = await db.collection(name).get();
    if (!snap.size) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

describe("public-table leave integration", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await clearFixtures();

    hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST_UID,
      joinId: HOST_JOIN_ID,
      displayName: "Host",
      targetSeatCount: 6,
    });
    assert.equal(hostTable.ok, true);

    const joined = await handleJoinPublicTable(db, {
      actorId: GUEST_UID,
      joinId: GUEST_JOIN_ID,
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
      displayName: "Guest",
    });
    assert.equal(joined.status, "spectating");
  });

  it("leave clears queue and pendingJoins without transaction error", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }

    const left = await handleLeavePublicTable(db, { actorId: GUEST_UID });
    assert.equal(left.ok, true);
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

  it("repeated leave is safe and idempotent", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }

    const leftAgain = await handleLeavePublicTable(db, { actorId: GUEST_UID });
    assert.equal(leftAgain.ok, true);
    assert.equal(leftAgain.cleared, false);
  });

  it("leave with no queue doc is safe", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }

    const result = await handleLeavePublicTable(db, { actorId: "never_queued" });
    assert.equal(result.ok, true);
    assert.equal(result.cleared, false);
  });
});
