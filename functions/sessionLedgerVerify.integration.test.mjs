/**
 * gameVerifySessionLedger — auth matrix + read-only guarantees.
 *
 * Run via:
 *   cd functions && FIRESTORE_EMULATOR_HOST=127.0.0.1:8088 \
 *     node --test sessionLedgerVerify.integration.test.mjs
 */

import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleVerifySessionLedger,
  assertLedgerVerifierAccess,
} from "./sessionLedgerVerify.js";
import { MONEY_ENGINE_VERSION, processBuyIn } from "./vendor/money-engine.js";
import { initialSessionBaseline, baselineDocFromBaseline } from "./vendor/money-persistence.js";

const PROJECT_ID = "demo-national-bourre-league";
const ROOM_ID = "ledger_verify_room";
const SESSION_ID = "ledger_verify_session";
const OWNER = "ledger_verify_owner";
const MEMBER = "ledger_verify_member";
const OUTSIDER = "ledger_verify_outsider";
const BUY_IN = 100;

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
    await probeFirestoreEmulator("_ping/ledger-verify");
    emulatorAvailable = true;
  } catch (err) {
    console.warn("Skipping sessionLedgerVerify integration tests", err?.message ?? err);
    emulatorAvailable = false;
  }
});

async function clearFixtures() {
  await db.recursiveDelete(db.collection("rooms").doc(ROOM_ID));
  for (const uid of [OWNER, MEMBER, OUTSIDER]) {
    await db.doc(`roomMembers/${ROOM_ID}_${uid}`).delete().catch(() => {});
  }
}

async function seedSession() {
  const rosterIds = [OWNER, MEMBER];
  const buyInEvents = processBuyIn({
    actionId: `session:buyin:${SESSION_ID}`,
    playerIds: rosterIds,
    buyInAmount: BUY_IN,
  });
  const baseline = baselineDocFromBaseline(initialSessionBaseline(rosterIds.length, BUY_IN));

  await db.collection("rooms").doc(ROOM_ID).set({
    ownerId: OWNER,
    name: "Ledger verify room",
    bourreSettings: { buyInAmount: BUY_IN, rebuyEnabled: false },
  });
  await db.doc(`roomMembers/${ROOM_ID}_${OWNER}`).set({
    roomId: ROOM_ID,
    userId: OWNER,
    displayName: "Owner",
    role: "owner",
  });
  await db.doc(`roomMembers/${ROOM_ID}_${MEMBER}`).set({
    roomId: ROOM_ID,
    userId: MEMBER,
    displayName: "Member",
    role: "player",
  });

  const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
  await sessionRef.set({
    roomId: ROOM_ID,
    status: "in_progress",
    handCount: 0,
    handStake: 20,
    handStakeLocked: false,
    limEnabled: false,
    carryOverPot: 0,
    dealerId: OWNER,
    moneyEngineVersion: MONEY_ENGINE_VERSION,
    moneySequence: buyInEvents.newEvents.length,
    moneyLedgerBaseline: baseline,
    players: rosterIds.map((id) => ({ playerId: id, displayName: id })),
    currentHand: {
      phase: "play",
      participantIds: rosterIds,
      tricksByPlayer: { [OWNER]: 3, [MEMBER]: 2 },
      postedAntes: { [OWNER]: 20, [MEMBER]: 20 },
      handNumber: 1,
    },
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const scoresCol = sessionRef.collection("scores");
  for (const id of rosterIds) {
    await scoresCol.doc(id).set({
      playerId: id,
      displayName: id,
      bankroll: BUY_IN,
      net: 0,
      tricksWon: 0,
      handsWon: 0,
      total: 0,
      joinedAtHandCount: 0,
      updatedAt: new Date(),
    });
  }

  const eventsCol = sessionRef.collection("moneyEvents");
  for (const event of buyInEvents.newEvents) {
    await eventsCol.doc(event.eventId).set(event);
  }
}

async function snapshotAll() {
  const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
  const sessionSnap = await sessionRef.get();
  const scoresSnap = await sessionRef.collection("scores").get();
  const eventsSnap = await sessionRef.collection("moneyEvents").get();
  const handsSnap = await sessionRef.collection("hands").get();
  return {
    room: (await db.collection("rooms").doc(ROOM_ID).get()).data(),
    session: sessionSnap.data(),
    scores: Object.fromEntries(scoresSnap.docs.map((d) => [d.id, d.data()])),
    moneyEventIds: eventsSnap.docs.map((d) => d.id).sort(),
    handIds: handsSnap.docs.map((d) => d.id).sort(),
  };
}

describe("sessionLedgerVerify authorization", () => {
  it("denies unauthenticated callers", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedSession();
    await assert.rejects(
      () => assertLedgerVerifierAccess(db, ROOM_ID, null, {}),
      (err) => err.code === "unauthenticated",
    );
  });

  it("denies non-members and ordinary members", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await assert.rejects(
      () => assertLedgerVerifierAccess(db, ROOM_ID, OUTSIDER, {}),
      (err) => err.code === "permission-denied",
    );
    await assert.rejects(
      () => assertLedgerVerifierAccess(db, ROOM_ID, MEMBER, {}),
      (err) => err.code === "permission-denied",
    );
  });

  it("allows room owner and ledgerOps", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await assertLedgerVerifierAccess(db, ROOM_ID, OWNER, {});
    await assertLedgerVerifierAccess(db, ROOM_ID, OUTSIDER, { ledgerOps: true });
  });
});

describe("sessionLedgerVerify read-only report", () => {
  it("returns schema v1 report without mutating Firestore", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedSession();
    const before = await snapshotAll();

    const report = await handleVerifySessionLedger(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      actorId: OWNER,
      authToken: {},
    });

    const after = await snapshotAll();

    assert.equal(report.schemaVersion, 1);
    assert.equal(report.roomId, ROOM_ID);
    assert.equal(report.sessionId, SESSION_ID);
    assert.equal(report.sessionStatus, "in_progress");
    assert.equal(report.handCount, 0);
    assert.equal(report.cardsExposed, false);
    assert.equal(typeof report.generatedAt, "string");
    assert.equal(report.rosterCount, 2);
    assert.equal(report.scoreDocumentCount, 2);
    assert.deepEqual(report.positiveBalanceOrphanRows, []);
    assert.equal(report.invariant.label, "verify:current-state");
    assert.equal(report.settlementAction.exists, false);
    assert.deepEqual(before.room, after.room);
    assert.deepEqual(before.session, after.session);
    assert.deepEqual(before.scores, after.scores);
    assert.deepEqual(before.moneyEventIds, after.moneyEventIds);
    assert.deepEqual(before.handIds, after.handIds);
  });

  it("requires roomId and sessionId", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await assert.rejects(
      () =>
        handleVerifySessionLedger(db, {
          roomId: ROOM_ID,
          sessionId: "",
          actorId: OWNER,
          authToken: {},
        }),
      (err) => err.code === "invalid-argument",
    );
  });
});
