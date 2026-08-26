/**
 * handleRecordHand fail-closed integration — drifted session must reject with zero writes.
 *
 * Run via:
 *   cd functions && FIRESTORE_EMULATOR_HOST=127.0.0.1:8088 \
 *     node --test recordHandInvariant.integration.test.mjs
 */

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { handleRecordHand } from "./gameHandlers.js";
import { MONEY_ENGINE_VERSION, processBuyIn } from "./vendor/money-engine.js";
import { initialSessionBaseline, baselineDocFromBaseline } from "./vendor/money-persistence.js";

const PROJECT_ID = "demo-national-bourre-league";
const ROOM_ID = "record_hand_invariant_room";
const SESSION_ID = "record_hand_invariant_session";
const RECORDER = "record_hand_host";
const BUY_IN = 1000;
const ANTE = 50;

const PLAYER_IDS = ["p1", "p2", "p3", "p4", "p5", "p6"];
const DRIFT_BANKROLLS = {
  p1: 2400,
  p2: 150,
  p3: 550,
  p4: 0,
  p5: 0,
  p6: 0,
};
const POSTED_ANTES = Object.fromEntries(PLAYER_IDS.map((id) => [id, ANTE]));

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
    await probeFirestoreEmulator("_ping/record-hand-invariant");
    emulatorAvailable = true;
  } catch (err) {
    console.warn("Skipping recordHandInvariant integration tests", err?.message ?? err);
    emulatorAvailable = false;
  }
});

async function clearFixtures() {
  await db.recursiveDelete(db.collection("rooms").doc(ROOM_ID));
  await db.doc(`roomMembers/${ROOM_ID}_${RECORDER}`).delete().catch(() => {});
}

async function seedDriftedSession() {
  const buyInEvents = processBuyIn({
    actionId: `session:buyin:${SESSION_ID}`,
    playerIds: PLAYER_IDS,
    buyInAmount: BUY_IN,
  });
  const baseline = baselineDocFromBaseline(initialSessionBaseline(PLAYER_IDS.length, BUY_IN));

  await db.collection("rooms").doc(ROOM_ID).set({
    ownerId: RECORDER,
    name: "Invariant drift room",
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
    carryOverPot: 150,
    dealerId: "p1",
    moneyEngineVersion: MONEY_ENGINE_VERSION,
    moneySequence: buyInEvents.newEvents.length,
    moneyLedgerBaseline: baseline,
    players: PLAYER_IDS.map((id) => ({ playerId: id, displayName: id })),
    currentHand: {
      phase: "play",
      participantIds: PLAYER_IDS,
      tricksByPlayer: {
        p1: 3,
        p2: 1,
        p3: 1,
        p4: 0,
        p5: 0,
        p6: 0,
      },
      trumpSuit: "hearts",
      turnPlayerId: "p1",
      actionOrder: PLAYER_IDS,
      postedAntes: POSTED_ANTES,
      deckSeed: 42,
      deckNextIndex: 20,
      handNumber: 1,
    },
    liveEnrollment: {
      active: false,
      deal: {
        publicHand: {
          phase: "play",
          participantIds: PLAYER_IDS,
          tricksByPlayer: {
            p1: 3,
            p2: 1,
            p3: 1,
            p4: 0,
            p5: 0,
            p6: 0,
          },
          trumpSuit: "hearts",
        },
        sortedPlayerIds: PLAYER_IDS,
      },
    },
    nextDealFunding: { byPlayer: {} },
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    rounds: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const scoresCol = sessionRef.collection("scores");
  for (const [playerId, bankroll] of Object.entries(DRIFT_BANKROLLS)) {
    const row = {
      playerId,
      displayName: playerId,
      bankroll,
      net: bankroll - BUY_IN,
      tricksWon: 0,
      handsWon: 0,
      total: 0,
      joinedAtHandCount: 0,
      updatedAt: new Date(),
    };
    if (bankroll <= 0) row.out = true;
    await scoresCol.doc(playerId).set(row);
  }

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

describe("handleRecordHand fail-closed on drifted session", () => {
  it("rejects settlement and performs zero Firestore writes", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedDriftedSession();
    const before = await snapshotSessionState();

    await assert.rejects(
      () =>
        handleRecordHand(db, {
          roomId: ROOM_ID,
          sessionId: SESSION_ID,
          winnerId: "p1",
          participantIds: PLAYER_IDS,
          settlement: "win",
          tricksByPlayer: before.session.currentHand.tricksByPlayer,
          actorId: RECORDER,
        }),
      /fail-closed|Table chip invariant/,
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
    assert.equal(after.session.dealerId, before.session.dealerId);
    assert.equal(after.session.handCount, before.session.handCount);
    assert.equal(
      JSON.stringify(after.session.currentHand ?? {}),
      JSON.stringify(before.session.currentHand ?? {}),
    );
    for (const playerId of PLAYER_IDS) {
      assert.deepEqual(after.scores[playerId], before.scores[playerId]);
    }
  });
});
