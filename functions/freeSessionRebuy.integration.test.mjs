/**
 * Free session rebuy handler tests (atomic ledger + fail-closed invariant).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { handleApplyFreeSessionRebuy } from "./chipPurchase.js";
import {
  MONEY_ENGINE_VERSION,
  processBuyIn,
  initialSessionBaseline,
  baselineDocFromBaseline,
} from "./vendor/money-persistence.js";

const PROJECT_ID = "demo-national-bourre-league";
const ROOM_ID = "free_rebuy_room";
const SESSION_ID = "free_rebuy_session";
const PLAYER_ID = "free_rebuy_player";
const BUY_IN = 1000;

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
    await probeFirestoreEmulator("_ping/free-rebuy");
    emulatorAvailable = true;
  } catch {
    emulatorAvailable = false;
  }
});

async function clearFixtures() {
  await db.recursiveDelete(db.collection("rooms").doc(ROOM_ID));
}

async function seedConservedSession({ bankroll = 0, out = true, drift = false } = {}) {
  const playerIds = drift
    ? ["p1", "p2"]
    : [PLAYER_ID, "seat_two"];
  const bankrolls = drift
    ? { p1: 500, p2: 0 }
    : { [PLAYER_ID]: bankroll, seat_two: bankroll > 0 ? BUY_IN : BUY_IN * 2 };

  const buyInEvents = processBuyIn({
    actionId: `session:buyin:${SESSION_ID}`,
    playerIds,
    buyInAmount: BUY_IN,
  });
  const baseline = baselineDocFromBaseline(
    initialSessionBaseline(playerIds.length, BUY_IN),
  );

  await db.collection("rooms").doc(ROOM_ID).set({
    ownerId: PLAYER_ID,
    name: "Rebuy test",
    bourreSettings: { buyInAmount: BUY_IN, rebuyEnabled: true },
  });

  const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
  await sessionRef.set({
    roomId: ROOM_ID,
    status: "in_progress",
    handCount: 2,
    buyInAmount: BUY_IN,
    handStake: 50,
    carryOverPot: drift ? 100 : 0,
    moneyEngineVersion: MONEY_ENGINE_VERSION,
    moneySequence: buyInEvents.newEvents.length,
    moneyLedgerBaseline: baseline,
    players: playerIds.map((id) => ({ playerId: id, displayName: id })),
    currentHand: {
      phase: "draw",
      participantIds: playerIds,
      postedAntes: drift ? { p1: 50, p2: 50 } : {},
      tricksByPlayer: {},
    },
  });

  for (const playerId of playerIds) {
    const br = bankrolls[playerId] ?? 0;
    const row = {
      playerId,
      displayName: playerId,
      bankroll: br,
      net: br - BUY_IN,
    };
    if (br <= 0 || (playerId === PLAYER_ID && out)) {
      row.out = true;
    }
    await sessionRef.collection("scores").doc(playerId).set(row);
  }

  for (const event of buyInEvents.newEvents) {
    await sessionRef.collection("moneyEvents").doc(event.eventId).set(event);
  }
}

describe("handleApplyFreeSessionRebuy", () => {
  it("applies rebuy atomically with ledger baseline bump", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedConservedSession({ bankroll: 0, out: true });

    const result = await handleApplyFreeSessionRebuy(db, {
      actorId: PLAYER_ID,
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      playerId: PLAYER_ID,
    });
    assert.equal(result.status, "applied");
    assert.equal(result.bankroll, BUY_IN);
    assert.equal(result.chipsGranted, BUY_IN);

    const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
    const session = (await sessionRef.get()).data();
    const score = (await sessionRef.collection("scores").doc(PLAYER_ID).get()).data();
    const events = await sessionRef.collection("moneyEvents").get();

    assert.equal(score.bankroll, BUY_IN);
    assert.equal(score.out, undefined);
    assert.equal(session.moneyLedgerBaseline.tableStartingTotal, BUY_IN * 2);
    assert.equal(session.moneyLedgerBaseline.netCashIn, BUY_IN);
    assert.equal(events.docs.length, 3);
    assert.ok(events.docs.some((doc) => doc.data().type === "REBUY_APPLIED"));
  });

  it("duplicate rebuy returns prior result without new writes", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedConservedSession({ bankroll: 0, out: true });

    const first = await handleApplyFreeSessionRebuy(db, {
      actorId: PLAYER_ID,
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      playerId: PLAYER_ID,
    });
    const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
    const afterFirstSession = (await sessionRef.get()).data();
    const afterFirstEvents = await sessionRef.collection("moneyEvents").get();

    const second = await handleApplyFreeSessionRebuy(db, {
      actorId: PLAYER_ID,
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      playerId: PLAYER_ID,
    });

    assert.equal(second.status, "applied");
    assert.equal(second.idempotent, true);
    assert.equal(second.bankroll, first.bankroll);
    assert.equal(second.chipsGranted, first.chipsGranted);

    const afterSecondSession = (await sessionRef.get()).data();
    const afterSecondEvents = await sessionRef.collection("moneyEvents").get();
    assert.equal(afterSecondEvents.docs.length, afterFirstEvents.docs.length);
    assert.deepEqual(afterSecondSession.moneyLedgerBaseline, afterFirstSession.moneyLedgerBaseline);
    assert.equal(afterSecondSession.moneySequence, afterFirstSession.moneySequence);
  });

  it("rejects rebuy when table invariant would drift (fail-closed)", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedConservedSession({ drift: true });

    const sessionRef = db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID);
    await sessionRef.collection("scores").doc("p2").set({
      playerId: "p2",
      displayName: "p2",
      bankroll: 0,
      net: -BUY_IN,
      out: true,
    });

    await assert.rejects(
      () =>
        handleApplyFreeSessionRebuy(db, {
          actorId: "p2",
          roomId: ROOM_ID,
          sessionId: SESSION_ID,
          playerId: "p2",
        }),
      /fail-closed|Table chip invariant/,
    );

    const events = await sessionRef.collection("moneyEvents").get();
    assert.equal(events.docs.length, 2);
    const score = (await sessionRef.collection("scores").doc("p2").get()).data();
    assert.equal(score.bankroll, 0);
    assert.equal(score.out, true);
  });
});
