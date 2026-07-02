#!/usr/bin/env node
/**
 * Emulator proof: duplicate gameRecordHand returns already_settled, not INTERNAL.
 */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

const PROJECT = "demo-national-bourre-league";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT}/us-central1`;
const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const ROOM = "room_double_record";
const SESSION = "session_double_record";
const BUY_IN = 100;
const ANTE = 20;

function emulatorHostPort() {
  const raw = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8088";
  const [host, port] = raw.split(":");
  return { host, port: Number(port) };
}

async function authSignUp(email) {
  const res = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "test-pass-123", returnSecureToken: true }),
    },
  );
  const data = await res.json();
  return { uid: data.localId, idToken: data.idToken };
}

async function callFunction(name, idToken, data) {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ data }),
  });
  const body = await res.json();
  if (body.error) {
    const err = new Error(body.error.message || JSON.stringify(body.error));
    err.code = body.error.status;
    throw err;
  }
  return body.result;
}

async function seedCompletedHand(testEnv, hostId, botId) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    const ids = [hostId, botId];
    await setDoc(doc(db, "rooms", ROOM), {
      inviteCode: "DREC-2P",
      ownerId: hostId,
      name: "Double Record",
      status: "active",
      bourreSettings: { buyInAmount: BUY_IN, anteAmount: ANTE },
      createdAt: serverTimestamp(),
    });
    for (const uid of ids) {
      await setDoc(doc(db, "roomMembers", `${ROOM}_${uid}`), {
        roomId: ROOM,
        userId: uid,
        displayName: uid,
        role: uid === hostId ? "owner" : "player",
        joinedAt: serverTimestamp(),
      });
      await setDoc(doc(db, "rooms", ROOM, "sessions", SESSION, "scores", uid), {
        sessionId: SESSION,
        roomId: ROOM,
        playerId: uid,
        displayName: uid,
        bankroll: BUY_IN - ANTE,
        tricksWon: 0,
        handsWon: 0,
        net: -ANTE,
        total: 0,
        updatedAt: serverTimestamp(),
      });
    }
    await setDoc(doc(db, "rooms", ROOM, "sessions", SESSION), {
      roomId: ROOM,
      sessionName: "Double Record Proof",
      status: "in_progress",
      handCount: 0,
      handStake: ANTE,
      handStakeLocked: false,
      limEnabled: false,
      carryOverPot: 0,
      dealerId: hostId,
      players: ids.map((id) => ({ playerId: id, displayName: id })),
      currentHand: {
        phase: "play",
        participantIds: ids,
        seatedIds: ids,
        dealerId: hostId,
        tricksByPlayer: { [hostId]: 4, [botId]: 1 },
        turnPlayerId: null,
      },
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      rounds: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

async function main() {
  const { host, port } = emulatorHostPort();
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: RULES, host, port },
  });
  try {
    const hostAuth = await authSignUp("double-record-host@test.local");
    const botAuth = await authSignUp("double-record-bot@test.local");
    await seedCompletedHand(testEnv, hostAuth.uid, botAuth.uid);

    const payload = {
      roomId: ROOM,
      sessionId: SESSION,
      winnerIds: [hostAuth.uid],
      participantIds: [hostAuth.uid, botAuth.uid],
      settlement: "win",
      recordedBy: hostAuth.uid,
      tricksByPlayer: { [hostAuth.uid]: 4, [botAuth.uid]: 1 },
    };

    const first = await callFunction("gameRecordHand", hostAuth.idToken, payload);
    assert.equal(first.status, "settled");

    const second = await callFunction("gameRecordHand", hostAuth.idToken, payload);
    assert.equal(second.status, "already_settled");

    console.log(JSON.stringify({ ok: true, first: first.status, second: second.status }, null, 2));
  } finally {
    await testEnv.cleanup();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
