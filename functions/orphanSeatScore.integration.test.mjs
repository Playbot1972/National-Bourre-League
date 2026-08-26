/**
 * Orphan positive-balance score rows must fail settlement before any writes.
 *
 * Run via:
 *   cd functions && FIRESTORE_EMULATOR_HOST=127.0.0.1:8088 \
 *     node --test orphanSeatScore.integration.test.mjs
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleRecordHand,
  assertScoreRosterReconciled,
  seatPlayerIds,
} from "./gameHandlers.js";
import { MONEY_ENGINE_VERSION, processBuyIn } from "./vendor/money-engine.js";
import { initialSessionBaseline, baselineDocFromBaseline } from "./vendor/money-persistence.js";

const PROJECT_ID = "demo-national-bourre-league";
const ROOM_ID = "orphan_seat_room";
const SESSION_ID = "orphan_seat_session";
const RECORDER = "orphan_seat_host";
const ROSTER_PLAYER = "orphan_roster_bot";
const ORPHAN_PLAYER = "orphan_extra_human";
const BUY_IN = 100;
const ANTE = 20;

let db;
let emulatorAvailable = false;

async function probeFirestoreEmulator(docPath) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Firestore emulator probe timeout")), 2500),
  );
  await Promise.race([db.doc(docPath).set({ ok: true }), timeout]);
}

before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088";
  }
  try {
    if (!getApps().length) initializeApp({ projectId: PROJECT_ID });
    db = getFirestore();
    await probeFirestoreEmulator("_ping/orphan-seat-score");
    emulatorAvailable = true;
  } catch (err) {
    console.warn("Skipping orphan seat integration tests", err?.message ?? err);
    emulatorAvailable = false;
  }
});

async function clearFixtures() {
  await db.recursiveDelete(db.collection("rooms").doc(ROOM_ID));
  await db.doc(`roomMembers/${ROOM_ID}_${RECORDER}`).delete().catch(() => {});
}

async function seedOrphanScoreSession() {
  const rosterIds = [RECORDER, ROSTER_PLAYER];
  const buyInEvents = processBuyIn({
    actionId: `session:buyin:${SESSION_ID}`,
    playerIds: rosterIds,
    buyInAmount: BUY_IN,
  });
  const baseline = baselineDocFromBaseline(initialSessionBaseline(rosterIds.length, BUY_IN));

  await db.collection("rooms").doc(ROOM_ID).set({
    ownerId: RECORDER,
    name: "Orphan seat room",
    bourreSettings: { buyInAmount: BUY_IN, rebuyEnabled: true },
  });
  await db.doc(`roomMembers/${ROOM_ID}_${RECORDER}`).set({
    roomId: ROOM_ID,
    userId: RECORDER,
    displayName: "Host",
    role: "owner",
  });

  const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
  await sessionRef.set({
    roomId: ROOM_ID,
    status: "in_progress",
    handCount: 0,
    handStake: ANTE,
    handStakeLocked: true,
    limEnabled: false,
    carryOverPot: 0,
    dealerId: RECORDER,
    moneyEngineVersion: MONEY_ENGINE_VERSION,
    moneySequence: buyInEvents.newEvents.length,
    moneyLedgerBaseline: baseline,
    players: rosterIds.map((id) => ({ playerId: id, displayName: id })),
    currentHand: {
      phase: "play",
      participantIds: rosterIds,
      tricksByPlayer: { [RECORDER]: 4, [ROSTER_PLAYER]: 1 },
      postedAntes: { [RECORDER]: ANTE, [ROSTER_PLAYER]: ANTE },
      turnPlayerId: RECORDER,
    },
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    rounds: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const scoresCol = sessionRef.collection("scores");
  for (const playerId of rosterIds) {
    await scoresCol.doc(playerId).set({
      playerId,
      displayName: playerId,
      bankroll: BUY_IN - ANTE,
      net: -ANTE,
      tricksWon: 0,
      handsWon: 0,
      total: 0,
      joinedAtHandCount: 0,
      updatedAt: new Date(),
    });
  }
  await scoresCol.doc(ORPHAN_PLAYER).set({
    playerId: ORPHAN_PLAYER,
    displayName: "Orphan",
    bankroll: 60,
    net: -40,
    tricksWon: 0,
    handsWon: 0,
    total: 0,
    joinedAtHandCount: 0,
    updatedAt: new Date(),
  });

  const eventsCol = sessionRef.collection("moneyEvents");
  for (const event of buyInEvents.newEvents) {
    await eventsCol.doc(event.eventId).set(event);
  }
}

async function snapshotSessionState() {
  const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
  const sessionSnap = await sessionRef.get();
  const scoresSnap = await sessionRef.collection("scores").get();
  const eventsSnap = await sessionRef.collection("moneyEvents").get();
  const handsSnap = await sessionRef.collection("hands").get();
  return {
    session: sessionSnap.data(),
    scores: Object.fromEntries(scoresSnap.docs.map((doc) => [doc.id, doc.data()])),
    moneyEventIds: eventsSnap.docs.map((doc) => doc.id).sort(),
    handIds: handsSnap.docs.map((doc) => doc.id).sort(),
    roster: sessionSnap.data()?.players ?? [],
  };
}

describe("orphan seat score reconciliation", () => {
  it("seatPlayerIds includes orphan score docs not on session.players", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedOrphanScoreSession();
    const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
    const sessionSnap = await sessionRef.get();
    const scoresSnap = await sessionRef.collection("scores").get();
    const seatIds = seatPlayerIds(sessionSnap.data(), scoresSnap.docs);
    assert.deepEqual(seatIds, [RECORDER, ROSTER_PLAYER, ORPHAN_PLAYER]);
  });

  it("assertScoreRosterReconciled throws structured orphan-seat error", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedOrphanScoreSession();
    const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
    const sessionSnap = await sessionRef.get();
    const scoresSnap = await sessionRef.collection("scores").get();
    try {
      assertScoreRosterReconciled(sessionSnap.data(), scoresSnap.docs, BUY_IN);
      assert.fail("expected orphan-seat reconciliation error");
    } catch (err) {
      assert.equal(err.code, "failed-precondition");
      assert.equal(err.details?.code, "ORPHAN_SEAT_RECONCILIATION_REQUIRED");
      assert.deepEqual(err.details?.orphans, [{ playerId: ORPHAN_PLAYER, bankroll: 60 }]);
    }
  });

  it("handleRecordHand rejects orphan score rows with zero Firestore writes", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedOrphanScoreSession();
    const before = await snapshotSessionState();

    await assert.rejects(
      () =>
        handleRecordHand(db, {
          roomId: ROOM_ID,
          sessionId: SESSION_ID,
          winnerId: RECORDER,
          participantIds: [RECORDER, ROSTER_PLAYER],
          settlement: "win",
          tricksByPlayer: before.session.currentHand.tricksByPlayer,
          actorId: RECORDER,
        }),
      (err) => {
        assert.equal(err.code, "failed-precondition");
        assert.equal(err.details?.code, "ORPHAN_SEAT_RECONCILIATION_REQUIRED");
        assert.ok(
          err.message.includes("Orphan seat reconciliation") ||
            err.message.includes("session.players"),
        );
        return true;
      },
    );

    const after = await snapshotSessionState();
    assert.deepEqual(after.moneyEventIds, before.moneyEventIds);
    assert.deepEqual(after.handIds, before.handIds);
    assert.deepEqual(after.roster, before.roster);
    assert.equal(after.session.carryOverPot, before.session.carryOverPot);
    assert.equal(
      JSON.stringify(after.session.nextDealFunding ?? {}),
      JSON.stringify(before.session.nextDealFunding ?? {}),
    );
    assert.equal(
      JSON.stringify(after.session.moneyLedgerBaseline ?? {}),
      JSON.stringify(before.session.moneyLedgerBaseline ?? {}),
    );
    assert.equal(after.session.moneySequence, before.session.moneySequence);
    assert.equal(after.session.handCount, before.session.handCount);
    assert.equal(
      JSON.stringify(after.session.currentHand ?? {}),
      JSON.stringify(before.session.currentHand ?? {}),
    );
    for (const playerId of [RECORDER, ROSTER_PLAYER, ORPHAN_PLAYER]) {
      assert.deepEqual(after.scores[playerId], before.scores[playerId]);
    }
  });
});
