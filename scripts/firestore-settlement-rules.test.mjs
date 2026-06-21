/**
 * Emulator-backed Firestore rules tests for hand settlement.
 *
 * Run with Firestore emulator already up, or via:
 *   npx firebase emulators:exec --only firestore --project demo-national-bourre-league \
 *     "node --test scripts/firestore-settlement-rules.test.mjs"
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

const ROOM_ID = "room_settle_test";
const SESSION_ID = "session_settle_test";
const HOST_UID = "host_uid_settle";
const GUEST_UID = "guest_uid_settle";
const OUTSIDER_UID = "outsider_uid_settle";

function memberDocId(roomId, uid) {
  return `${roomId}_${uid}`;
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] };
}

/** Session state after play via legacy liveEnrollment.deal path (prod rules workaround). */
function sessionWithLegacyDeal() {
  return {
    roomId: ROOM_ID,
    sessionName: "Test Table",
    status: "in_progress",
    handCount: 0,
    handStake: 1,
    handStakeLocked: false,
    limEnabled: false,
    carryOverPot: 0,
    dealerId: HOST_UID,
    players: [
      { playerId: HOST_UID, displayName: "Host" },
      { playerId: GUEST_UID, displayName: "Guest" },
    ],
    liveEnrollment: {
      active: false,
      deal: {
        publicHand: {
          phase: "play",
          participantIds: [HOST_UID, GUEST_UID],
          tricksByPlayer: { [HOST_UID]: 3, [GUEST_UID]: 2 },
          trumpSuit: "hearts",
        },
        sortedPlayerIds: [HOST_UID, GUEST_UID],
      },
    },
    currentHand: emptyPreDealHand(),
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    rounds: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function scoreRow(playerId, displayName, buyIn = 20) {
  return {
    sessionId: SESSION_ID,
    roomId: ROOM_ID,
    playerId,
    displayName,
    bankroll: buyIn,
    tricksWon: 0,
    handsWon: 0,
    net: 0,
    total: 0,
    updatedAt: new Date(),
  };
}

/** Mirrors recordHandClient session + score patches for a single-winner settle. */
async function commitSettlementBatch(db, actorUid) {
  const { deleteField, writeBatch, doc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  const batch = writeBatch(db);
  const sessionRef = doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID);

  batch.update(sessionRef, {
    handCount: 1,
    handStakeLocked: true,
    carryOverPot: 0,
    dealerId: GUEST_UID,
    pendingCoWinSettlement: deleteField(),
    handEnrollment: deleteField(),
    liveEnrollment: deleteField(),
    currentHand: emptyPreDealHand(),
    updatedAt: serverTimestamp(),
  });

  for (const pid of [HOST_UID, GUEST_UID]) {
    const patch = {
      net: pid === HOST_UID ? 2 : -2,
      bankroll: pid === HOST_UID ? 22 : 18,
      updatedAt: serverTimestamp(),
    };
    if (pid === GUEST_UID) {
      patch.out = deleteField();
    }
    if (pid === HOST_UID) {
      patch.handsWon = 1;
      patch.tricksWon = 1;
      patch.total = 1;
    }
    batch.update(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "scores", pid), patch);
  }

  await batch.commit();

  const { updateDoc } = await import("firebase/firestore");
  await assertSucceeds(
    updateDoc(sessionRef, {
      totals: {
        byPlayer: { [HOST_UID]: 1, [GUEST_UID]: 0 },
        netByPlayer: { [HOST_UID]: 2, [GUEST_UID]: -2 },
        tricks: 1,
      },
      rounds: 1,
      updatedAt: serverTimestamp(),
    }),
  );
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
      "Skipping firestore-settlement-rules tests — Firestore emulator not running.",
      err?.message ?? err,
    );
    emulatorAvailable = false;
  }
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

describe("hand settlement Firestore rules", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const admin = ctx.firestore();
      await admin.doc(`rooms/${ROOM_ID}`).set({
        inviteCode: "ABC-D23",
        ownerId: HOST_UID,
        name: "Settlement test room",
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
      await admin.doc(`roomMembers/${memberDocId(ROOM_ID, GUEST_UID)}`).set({
        roomId: ROOM_ID,
        userId: GUEST_UID,
        displayName: "Guest",
        role: "player",
        joinedAt: new Date(),
      });
      await admin.doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}`).set(sessionWithLegacyDeal());
      await admin
        .doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}/scores/${HOST_UID}`)
        .set(scoreRow(HOST_UID, "Host"));
      await admin
        .doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}/scores/${GUEST_UID}`)
        .set(scoreRow(GUEST_UID, "Guest"));
    });
  });

  it("host (room creator) can settle after legacy liveEnrollment.deal play", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    await assertSucceeds(commitSettlementBatch(hostDb, HOST_UID));
  });

  it("guest who joined by invite code can settle the same hand", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const admin = ctx.firestore();
      await admin.doc(`rooms/${ROOM_ID}`).set({
        inviteCode: "ABC-D23",
        ownerId: HOST_UID,
        name: "Settlement test room",
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
      await admin.doc(`roomMembers/${memberDocId(ROOM_ID, GUEST_UID)}`).set({
        roomId: ROOM_ID,
        userId: GUEST_UID,
        displayName: "Guest",
        role: "player",
        joinedAt: new Date(),
      });
      await admin.doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}`).set(sessionWithLegacyDeal());
      await admin
        .doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}/scores/${HOST_UID}`)
        .set(scoreRow(HOST_UID, "Host"));
      await admin
        .doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}/scores/${GUEST_UID}`)
        .set(scoreRow(GUEST_UID, "Guest"));
    });

    const guestDb = testEnv.authenticatedContext(GUEST_UID).firestore();
    await assertSucceeds(commitSettlementBatch(guestDb, GUEST_UID));
  });

  it("non-member cannot perform settlement writes", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const outsiderDb = testEnv.authenticatedContext(OUTSIDER_UID).firestore();
    const { deleteField, writeBatch, doc, serverTimestamp } = await import("firebase/firestore");
    const batch = writeBatch(outsiderDb);
    batch.update(doc(outsiderDb, "rooms", ROOM_ID, "sessions", SESSION_ID), {
      handCount: 1,
      handStakeLocked: true,
      carryOverPot: 0,
      dealerId: GUEST_UID,
      pendingCoWinSettlement: deleteField(),
      handEnrollment: deleteField(),
      liveEnrollment: deleteField(),
      currentHand: emptyPreDealHand(),
      updatedAt: serverTimestamp(),
    });
    await assertFails(batch.commit());
  });

  it("rejects settlement batch that touches disallowed session fields", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const guestDb = testEnv.authenticatedContext(GUEST_UID).firestore();
    const { writeBatch, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
    const sessionRef = doc(guestDb, "rooms", ROOM_ID, "sessions", SESSION_ID);
    const snap = await getDoc(sessionRef);
    const nextHand = (snap.data()?.handCount || 0) + 1;
    const batch = writeBatch(guestDb);
    batch.update(sessionRef, {
      handCount: nextHand,
      status: "final",
      updatedAt: serverTimestamp(),
    });
    await assertFails(batch.commit());
  });
});

describe("draw phase Firestore rules", () => {
  const DRAW_SESSION_ID = "session_draw_fold_test";

  function sessionInDrawPhase() {
    const publicHand = {
      phase: "draw",
      participantIds: [HOST_UID, GUEST_UID],
      tricksByPlayer: { [HOST_UID]: 0, [GUEST_UID]: 0 },
      trumpSuit: "hearts",
      turnPlayerId: HOST_UID,
      drawCompletedIds: [],
      actionOrder: [HOST_UID, GUEST_UID],
    };
    return {
      roomId: ROOM_ID,
      sessionName: "Draw test",
      status: "in_progress",
      handCount: 0,
      handStake: 1,
      dealerId: GUEST_UID,
      players: [
        { playerId: HOST_UID, displayName: "Host" },
        { playerId: GUEST_UID, displayName: "Guest" },
      ],
      liveEnrollment: {
        active: false,
        deal: {
          publicHand,
          sortedPlayerIds: [HOST_UID, GUEST_UID],
        },
      },
      currentHand: publicHand,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  before(async () => {
    if (!emulatorAvailable) return;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const admin = ctx.firestore();
      await admin.doc(`rooms/${ROOM_ID}/sessions/${DRAW_SESSION_ID}`).set(sessionInDrawPhase());
      await admin
        .doc(`rooms/${ROOM_ID}/sessions/${DRAW_SESSION_ID}/scores/${HOST_UID}`)
        .set(scoreRow(HOST_UID, "Host"));
      await admin
        .doc(`rooms/${ROOM_ID}/sessions/${DRAW_SESSION_ID}/scores/${GUEST_UID}`)
        .set(scoreRow(GUEST_UID, "Guest"));
      await admin
        .doc(`rooms/${ROOM_ID}/sessions/${DRAW_SESSION_ID}/privateHands/${HOST_UID}`)
        .set({ cards: [{ rank: "A", suit: "hearts" }], updatedAt: new Date() });
    });
  });

  it("member can fold out during draw (session + embedded private hand mirror)", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { runTransaction, doc, serverTimestamp } = await import("firebase/firestore");
    const sessionRef = doc(hostDb, "rooms", ROOM_ID, "sessions", DRAW_SESSION_ID);

    await assertSucceeds(
      runTransaction(hostDb, async (tx) => {
        const snap = await tx.get(sessionRef);
        const data = snap.data();
        const hand = data.currentHand;
        tx.update(sessionRef, {
          "liveEnrollment.deal.privateHandsByPlayer.host_uid_settle.cards": [],
          "liveEnrollment.deal.publicHand": {
            ...hand,
            foldedIds: [HOST_UID],
            drawCompletedIds: [HOST_UID],
            participantIds: [GUEST_UID],
            turnPlayerId: GUEST_UID,
          },
          currentHand: {
            ...hand,
            foldedIds: [HOST_UID],
            drawCompletedIds: [HOST_UID],
            participantIds: [GUEST_UID],
            turnPlayerId: GUEST_UID,
          },
          updatedAt: serverTimestamp(),
        });
      }),
    );
  });

  it("member can write privateHands subcollection during draw phase", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    const privateRef = doc(
      hostDb,
      "rooms",
      ROOM_ID,
      "sessions",
      DRAW_SESSION_ID,
      "privateHands",
      HOST_UID,
    );
    await assertSucceeds(
      setDoc(privateRef, { cards: [], updatedAt: serverTimestamp() }),
    );
  });
});
