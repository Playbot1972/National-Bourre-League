#!/usr/bin/env node
/**
 * Live emulator proof: 2-player hand ends 4/5 → settlement → next hand enrollment.
 *
 * Run:
 *   npm run proof:live-handoff
 */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

const MAX_TRICKS = 5;

function totalTricks(tricksByPlayer = {}, participantIds = []) {
  return participantIds.reduce((sum, id) => sum + (tricksByPlayer[id] || 0), 0);
}

function isHandAwaitingSettlement(sessionData) {
  const hand = sessionData?.currentHand ?? {};
  const participantIds = hand.participantIds ?? [];
  if (participantIds.length < 2) return false;
  const phase = hand.phase ?? null;
  if (phase !== "play" && phase !== "draw") return false;
  return totalTricks(hand.tricksByPlayer ?? {}, participantIds) >= MAX_TRICKS;
}

function isClearedPreDealHand(hand = {}) {
  const phase = hand.phase ?? null;
  if (phase === "draw" || phase === "play" || phase === "reveal" || phase === "decision") {
    return false;
  }
  if ((hand.participantIds?.length ?? 0) > 0) return false;
  const tricks = hand.tricksByPlayer ?? {};
  return !Object.values(tricks).some((n) => (n || 0) > 0);
}

function sessionHandDealStarted(sessionData) {
  if (!sessionData) return false;
  if (isHandAwaitingSettlement(sessionData)) return false;
  const hand = sessionData.currentHand ?? {};
  const phase = hand.phase ?? null;
  return phase === "reveal" || phase === "decision" || phase === "draw" || phase === "play";
}

const PROJECT = "demo-national-bourre-league";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT}/us-central1`;
const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

const BUY_IN = 100;
const ANTE = 20;
const ROOM = "room_handoff_2p";
const SESSION = "session_handoff_2p";

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
      body: JSON.stringify({
        email,
        password: "test-pass-123",
        returnSecureToken: true,
      }),
    },
  );
  if (!res.ok) throw new Error(`Auth signUp failed: ${await res.text()}`);
  const data = await res.json();
  return { uid: data.localId, idToken: data.idToken };
}

async function callFunction(name, idToken, data) {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      `${name} failed (${res.status}): ${body?.error?.message || JSON.stringify(body)}`,
    );
  }
  if (body.error) {
    throw new Error(`${name} error: ${body.error.message || JSON.stringify(body.error)}`);
  }
  return body.result;
}

async function seedCompletedHand(testEnv, hostId, botId) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    const ids = [hostId, botId];

    await setDoc(doc(db, "rooms", ROOM), {
      inviteCode: "HOFF-2P",
      ownerId: hostId,
      name: "Handoff 2P",
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
      sessionName: "Handoff Proof",
      status: "in_progress",
      handCount: 1,
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

async function readSession(testEnv) {
  let data = null;
  let scoreById = {};
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, getDoc, getDocs, collection } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "rooms", ROOM, "sessions", SESSION));
    data = snap.exists() ? snap.data() : null;
    const scoreSnap = await getDocs(
      collection(db, "rooms", ROOM, "sessions", SESSION, "scores"),
    );
    scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  });
  return { session: data, scoreById };
}

async function main() {
  const { host, port } = emulatorHostPort();
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: RULES, host, port },
  });

  try {
    const hostAuth = await authSignUp("handoff-host@test.local");
    const botAuth = await authSignUp("handoff-bot@test.local");
    const hostId = hostAuth.uid;
    const botId = botAuth.uid;

    await seedCompletedHand(testEnv, hostId, botId);

    const pre = await readSession(testEnv);
    assert.equal(isHandAwaitingSettlement(pre.session), true);
    assert.equal(sessionHandDealStarted(pre.session), false);

    await callFunction("gameRecordHand", hostAuth.idToken, {
      roomId: ROOM,
      sessionId: SESSION,
      winnerIds: [hostId],
      participantIds: [hostId, botId],
      settlement: "win",
      recordedBy: hostId,
      tricksByPlayer: { [hostId]: 4, [botId]: 1 },
    });

    const settled = await readSession(testEnv);
    assert.ok(settled.session.nextDealFunding, "nextDealFunding should exist after settlement");
    assert.equal(settled.scoreById[hostId]?.bankroll, 120);
    assert.equal(settled.scoreById[botId]?.bankroll, 80);
    assert.ok(isClearedPreDealHand(settled.session.currentHand ?? {}));
    assert.equal(sessionHandDealStarted(settled.session), false);

    await callFunction("gameEnsureHandEnrollment", hostAuth.idToken, {
      roomId: ROOM,
      sessionId: SESSION,
    });

    const after = await readSession(testEnv);
    const phase = after.session.currentHand?.phase ?? null;
    assert.ok(
      phase === "reveal" || phase === "decision" || phase === "draw",
      `expected next hand to start, got phase=${phase}`,
    );
    assert.equal(sessionHandDealStarted(after.session), true);

    console.log(
      JSON.stringify(
        {
          ok: true,
          scenario: "two-player-4-5-handoff",
          handCount: after.session.handCount,
          phase,
          bankrolls: {
            host: after.scoreById[hostId]?.bankroll,
            bot: after.scoreById[botId]?.bankroll,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    await testEnv.cleanup();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
