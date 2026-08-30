/**
 * handleRecordHand settlement invariant integration — pre-commit fail-closed + clean success.
 *
 * Run via:
 *   cd functions && FIRESTORE_EMULATOR_HOST=127.0.0.1:8088 \
 *     node --test recordHandInvariant.integration.test.mjs
 */

import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { handleRecordHand } from "./gameHandlers.js";
import { MONEY_ENGINE_VERSION, processBuyIn } from "./vendor/money-engine.js";
import {
  initialSessionBaseline,
  baselineDocFromBaseline,
  buildSessionChipSnapshot,
  checkTableChipInvariant,
  baselineFromSessionDoc,
} from "./vendor/money-persistence.js";
import {
  checkSettlementTableInvariant,
  throwPostCommitInvariantDrift,
} from "./settlementInvariant.js";

const PROJECT_ID = "demo-national-bourre-league";
const ROOM_ID = "record_hand_invariant_room";
const SESSION_ID = "record_hand_invariant_session";
const SESSION_CLEAN_ID = "record_hand_invariant_clean_session";
const RECORDER = "record_hand_host";
const BUY_IN = 1000;
const ANTE = 50;

const PLAYER_IDS = ["p1", "p2", "p3"];
const TRICKS = { p1: 3, p2: 2, p3: 0 };
const POSTED_ANTES = Object.fromEntries(PLAYER_IDS.map((id) => [id, ANTE]));
const DRIFT_BANKROLLS = {
  p1: 2400,
  p2: 150,
  p3: 550,
};
const CLEAN_BANKROLLS = {
  p1: 950,
  p2: 950,
  p3: 950,
};

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

async function seedSession({
  sessionId,
  bankrolls,
  carryOverPot = 150,
  rebuyEnabled = false,
  includeBot = false,
}) {
  const roster = [...PLAYER_IDS];
  if (includeBot) roster.push("bot_1");

  const buyInEvents = processBuyIn({
    actionId: `session:buyin:${sessionId}`,
    playerIds: roster,
    buyInAmount: BUY_IN,
  });
  const baseline = baselineDocFromBaseline(initialSessionBaseline(roster.length, BUY_IN));

  await db.collection("rooms").doc(ROOM_ID).set({
    ownerId: RECORDER,
    name: "Invariant room",
    bourreSettings: { buyInAmount: BUY_IN, rebuyEnabled },
  });
  await db.doc(`roomMembers/${ROOM_ID}_${RECORDER}`).set({
    roomId: ROOM_ID,
    userId: RECORDER,
    displayName: "Host",
    role: "owner",
  });

  const participants = includeBot ? roster : PLAYER_IDS;
  const tricksByPlayer = includeBot
    ? { ...TRICKS, bot_1: 0 }
    : TRICKS;

  const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(sessionId);
  await sessionRef.set({
    roomId: ROOM_ID,
    status: "in_progress",
    handCount: 0,
    handStake: ANTE,
    handStakeLocked: true,
    limEnabled: false,
    carryOverPot,
    dealerId: "p1",
    moneyEngineVersion: MONEY_ENGINE_VERSION,
    moneySequence: buyInEvents.newEvents.length,
    moneyLedgerBaseline: baseline,
    players: roster.map((id) => ({
      playerId: id,
      displayName: id,
      isRobot: id.startsWith("bot_"),
    })),
    currentHand: {
      phase: "play",
      participantIds: participants,
      tricksByPlayer,
      trumpSuit: "hearts",
      turnPlayerId: "p1",
      actionOrder: participants,
      postedAntes: Object.fromEntries(participants.map((id) => [id, ANTE])),
      deckSeed: 42,
      deckNextIndex: 20,
      handNumber: 1,
    },
    liveEnrollment: {
      active: false,
      deal: {
        publicHand: {
          phase: "play",
          participantIds: participants,
          tricksByPlayer,
          trumpSuit: "hearts",
        },
        sortedPlayerIds: participants,
      },
    },
    nextDealFunding: { byPlayer: {} },
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    rounds: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const scoresCol = sessionRef.collection("scores");
  for (const playerId of roster) {
    const bankroll = bankrolls[playerId] ?? (playerId.startsWith("bot_") ? 0 : BUY_IN);
    const row = {
      playerId,
      displayName: playerId,
      bankroll,
      net: bankroll - BUY_IN,
      tricksWon: 0,
      handsWon: 0,
      total: 0,
      joinedAtHandCount: 0,
      isRobot: playerId.startsWith("bot_"),
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

async function snapshotSessionState(sessionId) {
  const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(sessionId);
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

function invariantOk(sessionData, scoreById, events, playerIds) {
  const baseline = baselineFromSessionDoc(sessionData.moneyLedgerBaseline, events);
  const snapshot = buildSessionChipSnapshot(scoreById, sessionData, {
    buyInFallback: BUY_IN,
    playerIds,
  });
  return checkTableChipInvariant(snapshot, baseline).ok;
}

describe("handleRecordHand pre-commit invariant (3-player 3/2/0)", () => {
  it("rejects drifted ledger with TABLE_CHIP_INVARIANT_MISMATCH and zero writes", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedSession({ sessionId: SESSION_ID, bankrolls: DRIFT_BANKROLLS });
    const before = await snapshotSessionState(SESSION_ID);

    let err;
    try {
      await handleRecordHand(db, {
        roomId: ROOM_ID,
        sessionId: SESSION_ID,
        winnerId: "p1",
        participantIds: PLAYER_IDS,
        settlement: "win",
        tricksByPlayer: TRICKS,
        actorId: RECORDER,
      });
    } catch (caught) {
      err = caught;
    }

    assert.ok(err instanceof HttpsError);
    assert.equal(err.code, "failed-precondition");
    assert.match(err.message, /settlement was not applied/i);
    assert.equal(err.details.code, "TABLE_CHIP_INVARIANT_MISMATCH");
    assert.equal(err.details.committed, false);
    assert.equal(err.details.sessionId, SESSION_ID);
    assert.equal(err.details.handNumber, 1);
    assert.equal(err.details.actionId, `settle:${SESSION_ID}:1`);
    assert.equal(typeof err.details.expected, "number");
    assert.equal(typeof err.details.actual, "number");
    assert.equal(err.details.delta, err.details.actual - err.details.expected);

    const after = await snapshotSessionState(SESSION_ID);
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

  it("settles a clean equivalent 3-player 3/2/0 hand", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedSession({ sessionId: SESSION_CLEAN_ID, bankrolls: CLEAN_BANKROLLS, carryOverPot: 0 });
    const sessionRef = db
      .collection("rooms")
      .doc(ROOM_ID)
      .collection("sessions")
      .doc(SESSION_CLEAN_ID);
    const sessionSnap = await sessionRef.get();
    const scoresSnap = await sessionRef.collection("scores").get();
    const eventsSnap = await sessionRef.collection("moneyEvents").get();
    const scoreById = Object.fromEntries(scoresSnap.docs.map((d) => [d.id, d.data()]));
    const events = eventsSnap.docs.map((d) => d.data());
    assert.equal(
      invariantOk(sessionSnap.data(), scoreById, events, PLAYER_IDS),
      true,
      "seed must be invariant-clean before settlement",
    );

    const result = await handleRecordHand(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_CLEAN_ID,
      winnerId: "p1",
      participantIds: PLAYER_IDS,
      settlement: "win",
      tricksByPlayer: TRICKS,
      actorId: RECORDER,
    });

    assert.equal(result.status, "settled");
    assert.equal(result.handNumber, 1);
    const after = await snapshotSessionState(SESSION_CLEAN_ID);
    assert.equal(after.session.handCount, 1);
    assert.ok(after.handIds.includes("1"));
    assert.ok(after.moneyEventIds.length > events.length);
  });
});

describe("post-commit invariant drift (bot-rebuy path)", () => {
  it("surfaces POST_COMMIT_INVARIANT_DRIFT distinct from pre-commit", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedSession({
      sessionId: SESSION_ID,
      bankrolls: CLEAN_BANKROLLS,
      carryOverPot: 0,
      rebuyEnabled: true,
      includeBot: true,
    });

    const sessionRef = db
      .collection("rooms")
      .doc(ROOM_ID)
      .collection("sessions")
      .doc(SESSION_ID);
    const sessionSnap = await sessionRef.get();
    const scoresSnap = await sessionRef.collection("scores").get();
    const eventsSnap = await sessionRef.collection("moneyEvents").get();
    const sessionData = sessionSnap.data();
    const scoreById = Object.fromEntries(scoresSnap.docs.map((d) => [d.id, d.data()]));
    const existingEvents = eventsSnap.docs.map((d) => d.data());

    const driftedScores = {
      ...scoreById,
      p1: { ...scoreById.p1, bankroll: scoreById.p1.bankroll + 500 },
    };
    const checkOutcome = checkSettlementTableInvariant({
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      sessionData,
      scoreById: driftedScores,
      label: "after-bot-auto-rebuy:1",
      handId: 1,
      existingEvents,
      buyIn: BUY_IN,
      playerIds: Object.keys(scoreById),
    });

    assert.equal(checkOutcome.ok, false);

    assert.throws(
      () => throwPostCommitInvariantDrift(checkOutcome),
      (err) => {
        assert.equal(err.code, "failed-precondition");
        assert.equal(err.details.code, "POST_COMMIT_INVARIANT_DRIFT");
        assert.equal(err.details.committed, true);
        assert.notEqual(err.details.code, "TABLE_CHIP_INVARIANT_MISMATCH");
        return true;
      },
    );
  });
});
