/**
 * Mixed stale-user eviction + bots-only fallback integration tests.
 *
 * Run via:
 *   cd functions && MIXED_PUBLIC_TABLES_SERVER_ENABLED=true FIRESTORE_EMULATOR_HOST=127.0.0.1:8088 \
 *     node --test publicTableStaleReconcile.integration.test.mjs
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  handleFindOrCreatePublicTable,
  rebuildPublicTableIndex,
} from "./publicTable.js";
import {
  MATCH_QUEUE_COLLECTION,
  PUBLIC_TABLE_INDEX_COLLECTION,
  PUBLIC_TABLE_IDLE_REMOVAL_MS,
  MIXED_ZERO_ACTIVE_GRACE_MS,
  PLAY_NOW_QUEUE_MODE,
} from "./vendor/public-table-schema.js";
import {
  applyMixedZeroActiveGrace,
  reconcileMixedTableStaleMembers,
} from "./publicTableStaleReconcile.js";
import {
  applyPendingReplacements,
  isHandoffWindow,
} from "./publicTableReplacement.js";

const PROJECT_ID = "demo-national-bourre-league";
const STALE_HOST = "stale_host_uid";
const JOINER = "stale_joiner_uid";
const ACTIVE_HOST = "active_host_uid";
const ACTIVE_GUEST = "active_guest_uid";
const REPLACER = "replacer_guest_uid";

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
    await db.collection("_ping").doc("stale-reconcile").set({ ok: true });
    emulatorAvailable = true;
  } catch (err) {
    console.warn(
      "Skipping publicTableStaleReconcile integration tests — Firestore emulator not running.",
      err?.message ?? err,
    );
    emulatorAvailable = false;
  }
});

after(async () => {
  delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
});

async function clearFixtures() {
  for (const name of [MATCH_QUEUE_COLLECTION, PUBLIC_TABLE_INDEX_COLLECTION, "rooms", "roomMembers"]) {
    const snap = await db.collection(name).get();
    if (!snap.size) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function markHostStale(roomId, sessionId, hostId) {
  const staleAt = Timestamp.fromMillis(Date.now() - PUBLIC_TABLE_IDLE_REMOVAL_MS - 60_000);
  await db
    .collection("rooms")
    .doc(roomId)
    .collection("sessions")
    .doc(sessionId)
    .collection("scores")
    .doc(hostId)
    .set({ lastActivityTimestamp: staleAt }, { merge: true });
}

describe("mixed stale reconcile integration", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await clearFixtures();
  });

  it("evicts 4min+ idle host on join reconcile and leaves only fill bots", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: STALE_HOST,
      joinId: "stale-host-join",
      displayName: "Stale Host",
    });
    await markHostStale(hostTable.roomId, hostTable.sessionId, STALE_HOST);

    const roomSnap = await db.collection("rooms").doc(hostTable.roomId).get();
    const sessionSnap = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .get();

    const result = await reconcileMixedTableStaleMembers(db, {
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
      trigger: "join",
      joiningActorId: JOINER,
      roomData: roomSnap.data(),
      sessionData: sessionSnap.data(),
    });

    assert.ok(result.evicted.includes(STALE_HOST), "stale host should be evicted");
    assert.equal(result.activeLiveHumanCount, 0);
    assert.equal(result.botsOnlyGraveyard, true);

    const hostScore = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .collection("scores")
      .doc(STALE_HOST)
      .get();
    assert.equal(hostScore.exists, false);
  });

  it("joiner gets bots-only table when only bot-graveyard mixed tables exist", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: STALE_HOST,
      joinId: "graveyard-host",
      displayName: "Graveyard Host",
    });
    await markHostStale(hostTable.roomId, hostTable.sessionId, STALE_HOST);
    await rebuildPublicTableIndex(db, hostTable.roomId, hostTable.sessionId);

    const joined = await handleFindOrCreatePublicTable(db, {
      actorId: JOINER,
      joinId: "graveyard-joiner",
      displayName: "Joiner",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(joined.mode, "created");
    assert.equal(joined.status, "seated");
    assert.notEqual(joined.roomId, hostTable.roomId);

    const roomSnap = await db.collection("rooms").doc(joined.roomId).get();
    assert.equal(roomSnap.data()?.features?.botsOnlyPublicTables, true);
  });

  it("active host + joining guest keeps mixed flow (handoff seats immediately)", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: ACTIVE_HOST,
      joinId: "active-host",
      displayName: "Active Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const joined = await handleFindOrCreatePublicTable(db, {
      actorId: ACTIVE_GUEST,
      joinId: "active-guest",
      displayName: "Active Guest",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(joined.mode, "joined-existing");
    assert.equal(joined.status, "seated");
    assert.equal(joined.canPromoteAtNextBoundary, true);
    assert.equal(joined.roomId, hostTable.roomId);
    assert.equal(joined.sessionId, hostTable.sessionId);

    const guestScore = await db
      .collection("rooms")
      .doc(hostTable.roomId)
      .collection("sessions")
      .doc(hostTable.sessionId)
      .collection("scores")
      .doc(ACTIVE_GUEST)
      .get();
    assert.ok(guestScore.exists, "guest should be seated between hands");

    const roomSnap = await db.collection("rooms").doc(hostTable.roomId).get();
    assert.equal(roomSnap.data()?.features?.mixedPublicTables, true);
    assert.notEqual(roomSnap.data()?.features?.botsOnlyPublicTables, true);
  });

  it("zero-active grace converts mixed room to bots-only after 60 seconds", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: ACTIVE_HOST,
      joinId: "grace-host",
      displayName: "Grace Host",
    });

    const roomRef = db.collection("rooms").doc(hostTable.roomId);
    const sessionRef = roomRef.collection("sessions").doc(hostTable.sessionId);
    const scoreRef = sessionRef.collection("scores").doc(ACTIVE_HOST);

    await scoreRef.set(
      {
        sitOut: true,
        lastActivityTimestamp: Timestamp.fromMillis(Date.now() - 120_000),
      },
      { merge: true },
    );

    const nowMs = Date.now();
    const graceStart = nowMs - MIXED_ZERO_ACTIVE_GRACE_MS - 5_000;
    await sessionRef.set(
      { mixedZeroActiveGraceStartedAt: Timestamp.fromMillis(graceStart) },
      { merge: true },
    );

    const roomSnap = await roomRef.get();
    const sessionSnap = await sessionRef.get();
    const scoreSnap = await sessionRef.collection("scores").get();
    const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));

    const grace = await applyMixedZeroActiveGrace(db, {
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
      roomData: roomSnap.data(),
      sessionData: sessionSnap.data(),
      scoreById,
      nowMs,
    });

    assert.equal(grace.status, "bots_only_fallback");

    const postRoom = await roomRef.get();
    assert.equal(postRoom.data()?.features?.botsOnlyPublicTables, true);
    assert.notEqual(postRoom.data()?.features?.mixedPublicTables, true);
  });

  it("queued spectator replaces fill bot only at hand boundary", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();

    const hostTable = await handleFindOrCreatePublicTable(db, {
      actorId: ACTIVE_HOST,
      joinId: "replace-host",
      displayName: "Replace Host",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    const roomRef = db.collection("rooms").doc(hostTable.roomId);
    const sessionRef = roomRef.collection("sessions").doc(hostTable.sessionId);

    await sessionRef.update({
      currentHand: {
        phase: "play",
        tricksByPlayer: { [ACTIVE_HOST]: 1 },
        participantIds: [ACTIVE_HOST, "bot_placeholder"],
        turnPlayerId: ACTIVE_HOST,
      },
    });

    const joined = await handleFindOrCreatePublicTable(db, {
      actorId: REPLACER,
      joinId: "replace-guest",
      displayName: "Replacer",
      queueMode: PLAY_NOW_QUEUE_MODE.MIXED,
    });

    assert.equal(joined.status, "spectating");
    const midHandScore = await sessionRef.collection("scores").doc(REPLACER).get();
    assert.equal(midHandScore.exists, false, "mid-hand join must stay watch-only");

    await sessionRef.update({
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    });

    let sessionSnap = await sessionRef.get();
    let sessionData = sessionSnap.data();
    const roomSnap = await roomRef.get();

    assert.ok(isHandoffWindow(sessionData), "replacement requires handoff window");

    const beforeScores = await sessionRef.collection("scores").get();
    const botIds = beforeScores.docs
      .map((d) => d.id)
      .filter((id) => id.startsWith("bot_"));
    assert.ok(botIds.length > 0, "table should have fill bots");

    const replacement = await applyPendingReplacements(db, {
      roomId: hostTable.roomId,
      sessionId: hostTable.sessionId,
      roomData: roomSnap.data(),
      sessionData,
    });

    assert.equal(replacement.status, "applied");
    assert.ok(replacement.replacedCount >= 1);

    const afterScores = await sessionRef.collection("scores").get();
    const replacerScore = afterScores.docs.find((d) => d.id === REPLACER);
    assert.ok(replacerScore, "replacer should be seated after boundary replacement");
  });
});
