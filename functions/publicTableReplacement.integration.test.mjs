/**
 * Phase 5 integration tests (Firestore emulator).
 *
 * Run from functions/:
 *   MIXED_PUBLIC_TABLES_SERVER_ENABLED=true npx firebase emulators:exec --only firestore \
 *     --project demo-national-bourre-league \
 *     "node --test publicTableReplacement.integration.test.mjs"
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  handleFindOrCreatePublicTable,
  handleJoinPublicTable,
  rebuildPublicTableIndex,
} from "./publicTable.js";
import { applyPendingReplacements } from "./publicTableReplacement.js";
import { handleEnsureHandEnrollment } from "./gameHandlers.js";
import {
  BOT_ROLE,
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  PUBLIC_TABLE_INDEX_COLLECTION,
} from "./vendor/public-table-schema.js";

const PROJECT_ID = "demo-national-bourre-league";
const HOST_UID = "repl_host";
const GUEST_UID = "repl_guest";
const HOST_JOIN_ID = "repl-host-join";
const GUEST_JOIN_ID = "repl-guest-join";

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
    await db.collection("_ping").doc("replacement").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn("Skipping replacement integration tests — emulator unavailable.", err?.message ?? err);
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

describe("public-table hand-boundary replacement (integration)", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await clearFixtures();

    hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: HOST_UID,
      joinId: HOST_JOIN_ID,
      displayName: "Host",
      targetSeatCount: 4,
    });
    assert.equal(hostTable.status, "seated");

    await handleJoinPublicTable(db, {
      actorId: GUEST_UID,
      joinId: GUEST_JOIN_ID,
      displayName: "Guest",
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
    });
  });

  it("seats queued spectator at handoff via applyPendingReplacements", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    const { roomId, sessionId } = hostTable;
    const sessionRef = db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId);
    const roomRef = db.collection("rooms").doc(roomId);

    await sessionRef.update({
      handCount: 1,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
      updatedAt: FieldValue.serverTimestamp(),
    });

    const roomSnap = await roomRef.get();
    const sessionSnap = await sessionRef.get();

    const first = await applyPendingReplacements(db, {
      roomId,
      sessionId,
      roomData: roomSnap.data(),
      sessionData: sessionSnap.data(),
    });
    assert.equal(first.status, "applied");
    assert.equal(first.replacedCount, 1);

    const scoresAfter = await sessionRef.collection("scores").get();
    assert.ok(scoresAfter.docs.some((d) => d.id === GUEST_UID));
    const guestScore = scoresAfter.docs.find((d) => d.id === GUEST_UID).data();
    assert.ok(guestScore.bankroll > 0);

    const sessionAfter = (await sessionRef.get()).data();
    assert.ok((sessionAfter.players ?? []).some((p) => p.playerId === GUEST_UID));
    assert.equal(sessionAfter.pendingJoins?.[GUEST_UID]?.status, PENDING_JOIN_STATUS.SEATED);
    assert.ok(sessionAfter.replacementPlan?.appliedJoinIds?.includes(GUEST_JOIN_ID));

    const retry = await applyPendingReplacements(db, {
      roomId,
      sessionId,
      roomData: roomSnap.data(),
      sessionData: sessionAfter,
    });
    assert.equal(retry.status, "noop");
    assert.equal(retry.replacedCount, 0);
  });

  it("includes replaced human in next deal via handleEnsureHandEnrollment", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not available");
      return;
    }
    await clearFixtures();

    const created = await handleFindOrCreatePublicTable(db, {
      actorId: HOST_UID,
      joinId: "enroll-host",
      displayName: "Host",
      targetSeatCount: 3,
    });
    await handleJoinPublicTable(db, {
      actorId: GUEST_UID,
      joinId: "enroll-guest",
      displayName: "Guest",
      roomId: created.roomId,
      sessionId: created.sessionId,
    });

    const sessionRef = db
      .collection("rooms")
      .doc(created.roomId)
      .collection("sessions")
      .doc(created.sessionId);
    await sessionRef.update({
      handCount: 0,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    });

    await db.collection("roomMembers").doc(`${created.roomId}_${GUEST_UID}`).set({
      roomId: created.roomId,
      userId: GUEST_UID,
      displayName: "Guest",
      role: "player",
      joinedAt: FieldValue.serverTimestamp(),
    });

    await applyPendingReplacements(db, {
      roomId: created.roomId,
      sessionId: created.sessionId,
      roomData: (await db.collection("rooms").doc(created.roomId).get()).data(),
      sessionData: (await sessionRef.get()).data(),
    });

    const dealResult = await handleEnsureHandEnrollment(db, {
      roomId: created.roomId,
      sessionId: created.sessionId,
      actorId: HOST_UID,
    });
    assert.ok(dealResult.status === "auto_dealt" || dealResult.status === "solo_win");

    const participants = (await sessionRef.get()).data().currentHand?.participantIds ?? [];
    assert.ok(participants.includes(GUEST_UID));
  });
});
