/**
 * Firestore rules tests for public mixed-table Phase 2 guards.
 *
 * Run via:
 *   npx firebase emulators:exec --only firestore --project demo-national-bourre-league \
 *     "node --test scripts/firestore-public-table-rules.test.mjs"
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

const ROOM_ID = "room_public_phase2";
const SESSION_ID = "session_public_phase2";
const HOST_UID = "host_public_phase2";
const GUEST_UID = "guest_public_phase2";
const QUEUE_UID = "queue_user_phase2";

function memberDocId(roomId, uid) {
  return `${roomId}_${uid}`;
}

function privateRoomDoc() {
  return {
    inviteCode: "PUB-D22",
    ownerId: HOST_UID,
    name: "Private roster test",
    status: "open",
    createdAt: new Date(),
  };
}

function privateSessionDoc() {
  return {
    roomId: ROOM_ID,
    sessionName: "Test",
    status: "in_progress",
    handCount: 0,
    handStake: 1,
    dealerId: HOST_UID,
    players: [{ playerId: HOST_UID, displayName: "Host" }],
    currentHand: { tricksByPlayer: {}, participantIds: [] },
    createdAt: new Date(),
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
      "Skipping firestore-public-table-rules tests — Firestore emulator not running.",
      err?.message ?? err,
    );
    emulatorAvailable = false;
  }
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

async function seedPrivateFixtures() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const admin = ctx.firestore();
    await admin.doc(`rooms/${ROOM_ID}`).set(privateRoomDoc());
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
    await admin.doc(`rooms/${ROOM_ID}/sessions/${SESSION_ID}`).set(privateSessionDoc());
  });
}

describe("public-table Phase 2 Firestore rules", () => {
  before(async () => {
    if (!emulatorAvailable) return;
    await testEnv.clearFirestore();
    await seedPrivateFixtures();
  });

  it("blocks client writes to matchQueue", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const db = testEnv.authenticatedContext(QUEUE_UID).firestore();
    const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      setDoc(doc(db, "matchQueue", QUEUE_UID), {
        sessionKey: `${ROOM_ID}_${SESSION_ID}`,
        roomId: ROOM_ID,
        sessionId: SESSION_ID,
        activeJoinId: "join-1",
        status: "spectating",
        requestedAt: serverTimestamp(),
      }),
    );
  });

  it("blocks client writes to publicTableIndex", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const db = testEnv.authenticatedContext(HOST_UID).firestore();
    const { setDoc, doc } = await import("firebase/firestore");
    await assertFails(
      setDoc(doc(db, "publicTableIndex", `${ROOM_ID}_${SESSION_ID}`), {
        roomId: ROOM_ID,
        sessionId: SESSION_ID,
        openSeats: 3,
        realPlayerCount: 1,
        botFillCount: 2,
        status: "open",
      }),
    );
  });

  it("allows signed-in read of publicTableIndex", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const key = `${ROOM_ID}_${SESSION_ID}`;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`publicTableIndex/${key}`).set({
        roomId: ROOM_ID,
        sessionId: SESSION_ID,
        openSeats: 1,
        status: "open",
      });
    });
    const db = testEnv.authenticatedContext(QUEUE_UID).firestore();
    const { getDoc, doc } = await import("firebase/firestore");
    await assertSucceeds(getDoc(doc(db, "publicTableIndex", key)));
  });

  it("blocks client session pendingJoins writes", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      updateDoc(doc(hostDb, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        pendingJoins: {
          [QUEUE_UID]: {
            joinId: "join-1",
            status: "spectating",
            queuedAtHandCount: 0,
          },
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("blocks client score create with botRole", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertFails(
      setDoc(doc(hostDb, "rooms", ROOM_ID, "sessions", SESSION_ID, "scores", "bot_test1"), {
        sessionId: SESSION_ID,
        roomId: ROOM_ID,
        playerId: "bot_test1",
        displayName: "Bot",
        bankroll: 1000,
        isRobot: true,
        botRole: "fill",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("blocks client room create with public visibility", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { setDoc, doc } = await import("firebase/firestore");
    await assertFails(
      setDoc(doc(hostDb, "rooms", "room_public_create_blocked"), {
        inviteCode: "PUB-X99",
        ownerId: HOST_UID,
        name: "Public attempt",
        visibility: "public",
        features: { mixedPublicTables: true },
        status: "open",
        createdAt: new Date(),
      }),
    );
  });

  it("still allows private roster session update (players only)", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    // Mirrors ensureSessionPlayer session patch when enrollment is not active.
    await assertSucceeds(
      updateDoc(doc(hostDb, "rooms", ROOM_ID, "sessions", SESSION_ID), {
        players: [
          { playerId: HOST_UID, displayName: "Host" },
          { playerId: GUEST_UID, displayName: "Guest" },
        ],
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("still allows private score create without public markers", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
    await assertSucceeds(
      setDoc(doc(hostDb, "rooms", ROOM_ID, "sessions", SESSION_ID, "scores", GUEST_UID), {
        sessionId: SESSION_ID,
        roomId: ROOM_ID,
        playerId: GUEST_UID,
        displayName: "Guest",
        bankroll: 1000,
        tricksWon: 0,
        handsWon: 0,
        net: 0,
        total: 0,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("still allows legacy private room create without visibility field", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running — use npm run test:rules:firestore");
      return;
    }
    const hostDb = testEnv.authenticatedContext(HOST_UID).firestore();
    const { setDoc, doc } = await import("firebase/firestore");
    const legacyRoomId = "room_legacy_private_create";
    await assertSucceeds(
      setDoc(doc(hostDb, "rooms", legacyRoomId), {
        inviteCode: "LEG-D23",
        ownerId: HOST_UID,
        name: "Legacy private room",
        status: "open",
        createdAt: new Date(),
      }),
    );
    assert.ok(true);
  });
});
