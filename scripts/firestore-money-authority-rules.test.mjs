/**
 * Emulator-backed Firestore rules tests — PR1 server money authority.
 *
 * Run with Firestore emulator:
 *   npx firebase emulators:exec --only firestore --project demo-national-bourre-league \
 *     "node --test scripts/firestore-money-authority-rules.test.mjs"
 */

import { readFileSync } from "node:fs";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

const PROJECT_ID = "demo-national-bourre-league";
const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

const ROOM_ID = "room_money_auth";
const SESSION_ID = "session_money_auth";
const HOST_UID = "host_money_auth";
const MEMBER_UID = "member_money_auth";
const OUTSIDER_UID = "outsider_money_auth";

function memberDocId(roomId, uid) {
  return `${roomId}_${uid}`;
}

function baseSession(extra = {}) {
  return {
    roomId: ROOM_ID,
    sessionName: "Money authority test",
    status: "in_progress",
    handCount: 1,
    handStake: 50,
    handStakeLocked: true,
    limEnabled: false,
    carryOverPot: 0,
    moneyEngineVersion: "v1",
    moneySequence: 2,
    moneyLedgerBaseline: {
      tableStartingTotal: 2000,
      netCashIn: 0,
      netCashOut: 0,
      netBourreMint: 0,
    },
    nextDealFunding: {
      byPlayer: { [HOST_UID]: { fundingReason: "normal_ante" } },
    },
    dealerId: HOST_UID,
    players: [
      { playerId: HOST_UID, displayName: "Host" },
      { playerId: MEMBER_UID, displayName: "Member" },
    ],
    currentHand: {
      phase: "draw",
      participantIds: [HOST_UID, MEMBER_UID],
      tricksByPlayer: { [HOST_UID]: 0, [MEMBER_UID]: 0 },
      trumpSuit: "hearts",
      turnPlayerId: HOST_UID,
      actionOrder: [HOST_UID, MEMBER_UID],
      postedAntes: { [HOST_UID]: 50, [MEMBER_UID]: 50 },
      deckSeed: 42,
      deckNextIndex: 10,
    },
    liveEnrollment: {
      active: false,
      deal: {
        publicHand: {
          phase: "draw",
          participantIds: [HOST_UID, MEMBER_UID],
          tricksByPlayer: { [HOST_UID]: 0, [MEMBER_UID]: 0 },
          trumpSuit: "hearts",
          turnPlayerId: HOST_UID,
          actionOrder: [HOST_UID, MEMBER_UID],
        },
        sortedPlayerIds: [HOST_UID, MEMBER_UID],
      },
    },
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    rounds: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...extra,
  };
}

function scoreRow(playerId, displayName, bankroll = 1000) {
  return {
    sessionId: SESSION_ID,
    roomId: ROOM_ID,
    playerId,
    displayName,
    bankroll,
    tricksWon: 0,
    handsWon: 0,
    net: 0,
    total: 0,
    joinedAtHandCount: 0,
    updatedAt: new Date(),
  };
}

let testEnv;
let emulatorAvailable = false;

before(async () => {
  const firestoreConfig = { rules: RULES };
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":");
    firestoreConfig.host = host;
    firestoreConfig.port = Number(port);
  } else {
    firestoreConfig.host = "127.0.0.1";
    firestoreConfig.port = 8088;
  }
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: firestoreConfig,
    });
    emulatorAvailable = true;
  } catch (err) {
    console.warn(
      "Skipping firestore-money-authority-rules tests — Firestore emulator not running.",
      err?.message ?? err,
    );
    emulatorAvailable = false;
  }
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

async function seedBaseRoom() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const admin = ctx.firestore();
    await admin.doc(`rooms/${ROOM_ID}`).set({
      inviteCode: "MNY-123",
      ownerId: HOST_UID,
      name: "Money authority room",
      status: "open",
      createdAt: new Date(),
    });
    await admin.doc(`roomMembers/${memberDocId(ROOM_ID, HOST_UID)}`).set({
      roomId: ROOM_ID,
      userId: HOST_UID,
      displayName: "Host",
      role: "owner",
      joinedAt: new Date(),
    });
    await admin.doc(`roomMembers/${memberDocId(ROOM_ID, MEMBER_UID)}`).set({
      roomId: ROOM_ID,
      userId: MEMBER_UID,
      displayName: "Member",
      role: "player",
      joinedAt: new Date(),
    });
    await admin.doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}`).set(baseSession());
    await admin
      .doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}/scores/${HOST_UID}`)
      .set(scoreRow(HOST_UID, "Host"));
    await admin
      .doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}/scores/${MEMBER_UID}`)
      .set(scoreRow(MEMBER_UID, "Member"));
    await admin
      .doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}/moneyEvents/event_buyin_host`)
      .set({
        eventId: "event_buyin_host",
        actionId: "session:buyin",
        type: "BUY_IN_APPLIED",
        sequence: 1,
        phase: "session_start",
        playerId: HOST_UID,
        amount: 1000,
      });
  });
}

function skipUnlessEmulator(t) {
  if (!emulatorAvailable) {
    t.skip("Firestore emulator not running — use npm run test:rules:firestore");
    return true;
  }
  return false;
}

describe("money authority — client writes denied", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await testEnv.clearFirestore();
    await seedBaseRoom();
  });

  it("denies direct score bankroll update", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "scores", MEMBER_UID), {
        bankroll: 5000,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies direct score net / out ledger fields", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "scores", MEMBER_UID), {
        net: -100,
        out: true,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies direct carryOverPot update", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        carryOverPot: 999,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies direct nextDealFunding update", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        nextDealFunding: { byPlayer: { [MEMBER_UID]: { fundingReason: "bourre_bust" } } },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies direct moneyLedgerBaseline update", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        moneyLedgerBaseline: {
          tableStartingTotal: 9999,
          netCashIn: 0,
          netCashOut: 0,
          netBourreMint: 0,
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies direct moneySequence update", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        moneySequence: 99,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies moneyEvents create", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { setDoc, doc } = await import("firebase/firestore");
    await assertFails(
      setDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "moneyEvents", "evil_event"), {
        eventId: "evil_event",
        actionId: "evil",
        type: "WINNER_CREDITED",
        sequence: 99,
        phase: "hand_settlement",
        playerId: MEMBER_UID,
        amount: 1000,
      }),
    );
  });

  it("denies moneyEvents update and delete", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, deleteDoc, doc } = await import("firebase/firestore");
    const ref = doc(
      db,
      "rooms",
      ROOM_ID,
      "sessions",
      SESSION_ID,
      "moneyEvents",
      "event_buyin_host",
    );
    await assertFails(updateDoc(ref, { amount: 0 }));
    await assertFails(deleteDoc(ref));
  });

  it("denies direct dealerId rotation", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        dealerId: MEMBER_UID,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies currentHand postedAntes money-state update during draw", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertFails(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          postedAntes: { [MEMBER_UID]: 500 },
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies currentHand deckSeed / deckNextIndex update during draw", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertFails(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          deckSeed: 1,
          deckNextIndex: 0,
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe("money authority — non-money member behavior allowed", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await testEnv.clearFirestore();
    await seedBaseRoom();
  });

  it("allows scorekeeping tricksWon / total update (no ledger fields)", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertSucceeds(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "scores", MEMBER_UID), {
        tricksWon: 2,
        total: 2,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("allows roster patch (players list) without money fields", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertSucceeds(
      updateDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        players: [
          { playerId: HOST_UID, displayName: "Host" },
          { playerId: MEMBER_UID, displayName: "Member" },
          { playerId: "guest_bot_1", displayName: "Bot" },
        ],
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("allows currentHand turn/draw fields during draw (non-money)", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertSucceeds(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          turnPlayerId: MEMBER_UID,
          drawCompletedIds: [HOST_UID],
          foldedIds: [HOST_UID],
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies currentHand actionOrder change during draw", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertFails(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          actionOrder: [MEMBER_UID, HOST_UID],
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies currentHand participantIds change during draw", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertFails(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          participantIds: [MEMBER_UID],
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies currentHand dealerId change during draw", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertFails(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          dealerId: MEMBER_UID,
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies currentHand handNumber change during draw", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertFails(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          handNumber: 99,
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies mixed currentHand update (permitted turn + protected participantIds)", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const hand = snap.data()?.currentHand ?? {};
    await assertFails(
      updateDoc(sessionRef, {
        currentHand: {
          ...hand,
          turnPlayerId: MEMBER_UID,
          participantIds: [MEMBER_UID],
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("allows member read of session money fields and moneyEvents", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { getDoc, doc } = await import("firebase/firestore");
    const sessionSnap = await assertSucceeds(
      getDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID)),
    );
    assert.equal(sessionSnap.data()?.carryOverPot, 0);
    assert.ok(sessionSnap.data()?.moneyLedgerBaseline);
    const eventSnap = await assertSucceeds(
      getDoc(
        doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "moneyEvents", "event_buyin_host"),
      ),
    );
    assert.equal(eventSnap.data()?.type, "BUY_IN_APPLIED");
  });

  it("allows room member read of room doc", async (t) => {
    if (skipUnlessEmulator(t)) return;
    const db = testEnv.authenticatedContext(MEMBER_UID).firestore();
    const { getDoc, doc } = await import("firebase/firestore");
    const snap = await assertSucceeds(getDoc(doc(db, "rooms", ROOM_ID)));
    assert.equal(snap.data()?.ownerId, HOST_UID);
  });
});
