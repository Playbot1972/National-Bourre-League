#!/usr/bin/env node
/**
 * Live emulator E2E: bankroll / ante / settlement / enrollment through production Cloud Functions.
 *
 * Scenarios:
 *   A — normal post-funding hand 1 start (80/80/40)
 *   B — single win progression (120/80 → 100/60/40)
 *   C — consecutive wins (hand 3 start 120/40/40)
 *   D — decision "I'm out" (80/120 → 60/100/40)
 *   E — idempotent funding merge replay
 *   F — 4/5 trick handoff to next hand
 *
 * Run:
 *   npm run proof:live-bankroll
 *   npm run proof:live-bankroll -- scenario-d
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  mergeNextDealFundingIntoScoreById,
  collectFundingForHandStart,
} from "../docs/bourre-rules.js";

const PROJECT = "demo-national-bourre-league";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT}/us-central1`;
const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

const BUY_IN = 100;
const ANTE = 20;
const ROOM = "room_bankroll_e2e";
const SESSION = "session_bankroll_e2e";

function potFromPosted(postedAntes = {}) {
  return Object.values(postedAntes).reduce((sum, raw) => sum + Math.max(0, Number(raw) || 0), 0);
}

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

function traceBankrolls(label, scoreById, hostId, botId, session = null) {
  const posted = session?.currentHand?.postedAntes ?? {};
  const pot = potFromPosted(posted);
  const row = {
    label,
    human: scoreById[hostId]?.bankroll,
    bot: scoreById[botId]?.bankroll,
    pot,
    phase: session?.currentHand?.phase ?? null,
    handCount: session?.handCount ?? 0,
    nextDealFunding: session?.nextDealFunding ? "present" : null,
  };
  console.info(`[bankroll-trace] ${label}`, JSON.stringify(row));
  return row;
}

function assertPostFunding(label, scoreById, hostId, botId, session, expected) {
  const posted = session?.currentHand?.postedAntes ?? {};
  const pot = potFromPosted(posted);
  traceBankrolls(label, scoreById, hostId, botId, session);
  assert.equal(scoreById[hostId]?.bankroll, expected.human, `${label}: human`);
  assert.equal(scoreById[botId]?.bankroll, expected.bot, `${label}: bot`);
  assert.equal(pot, expected.pot, `${label}: pot`);
}

function assertSettled(label, scoreById, hostId, botId, expected) {
  traceBankrolls(label, scoreById, hostId, botId);
  assert.equal(scoreById[hostId]?.bankroll, expected.human, `${label}: human settled`);
  assert.equal(scoreById[botId]?.bankroll, expected.bot, `${label}: bot settled`);
}

async function seedFreshSession(testEnv, hostId, botId) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    const ids = [hostId, botId];

    await setDoc(doc(db, "rooms", ROOM), {
      inviteCode: "BNKR-E2E",
      ownerId: hostId,
      name: "Bankroll E2E",
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
        bankroll: BUY_IN,
        tricksWon: 0,
        handsWon: 0,
        net: 0,
        total: 0,
        updatedAt: serverTimestamp(),
      });
    }

    await setDoc(doc(db, "rooms", ROOM, "sessions", SESSION), {
      roomId: ROOM,
      sessionName: "Bankroll Proof",
      status: "in_progress",
      handCount: 0,
      handStake: ANTE,
      handStakeLocked: false,
      limEnabled: false,
      carryOverPot: 0,
      moneyEngineVersion: "v1",
      moneySequence: 0,
      dealerId: hostId,
      players: ids.map((id) => ({ playerId: id, displayName: id })),
      currentHand: { phase: null, participantIds: [], seatedIds: [], tricksByPlayer: {} },
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      rounds: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

async function readState(testEnv) {
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

async function dealNextHand(token, hostId) {
  await callFunction("gameEnsureHandEnrollment", token, {
    roomId: ROOM,
    sessionId: SESSION,
  });
  let state = await readState(globalThis.__testEnv);
  const phase = state.session?.currentHand?.phase;
  if (phase === "reveal") {
    await callFunction("gameAdvanceHandReveal", token, {
      roomId: ROOM,
      sessionId: SESSION,
    });
    state = await readState(globalThis.__testEnv);
  }
  return state;
}

async function seedPostAntePlayState(hostId, botId) {
  await globalThis.__testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, updateDoc, serverTimestamp } = await import("firebase/firestore");
    for (const pid of [hostId, botId]) {
      await updateDoc(doc(db, "rooms", ROOM, "sessions", SESSION, "scores", pid), {
        bankroll: BUY_IN - ANTE,
        net: -ANTE,
        updatedAt: serverTimestamp(),
      });
    }
    await setDoc(
      doc(db, "rooms", ROOM, "sessions", SESSION),
      {
        handCount: 1,
        currentHand: {
          phase: "play",
          participantIds: [hostId, botId],
          seatedIds: [hostId, botId],
          dealerId: hostId,
          tricksByPlayer: { [hostId]: 4, [botId]: 1 },
          postedAntes: { [hostId]: ANTE, [botId]: ANTE },
          turnPlayerId: null,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

async function getAdminDb() {
  if (!globalThis.__adminDb) {
    process.env.FIRESTORE_EMULATOR_HOST =
      process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8088";
  const require = createRequire(import.meta.url);
    const admin = require("../functions/node_modules/firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: PROJECT });
    }
    globalThis.__adminDb = admin.firestore();
  }
  return globalThis.__adminDb;
}

/** Writes visible to Cloud Functions (not rules-unit-testing isolated context). */
async function patchSessionForSettlement(hostId, botId, tricks = null) {
  const trickMap = tricks ?? { [hostId]: 4, [botId]: 1 };
  const state = await readState(globalThis.__testEnv);
  const postedAntes =
    state.session?.currentHand?.postedAntes ?? { [hostId]: ANTE, [botId]: ANTE };
  const db = await getAdminDb();
  const require = createRequire(import.meta.url);
  const admin = require("../functions/node_modules/firebase-admin");
  const ref = db.doc(`rooms/${ROOM}/sessions/${SESSION}`);
  const handCount = state.session?.handCount ?? 1;
  const playHand = {
    phase: "play",
    participantIds: [hostId, botId],
    seatedIds: [hostId, botId],
    dealerId: state.session?.dealerId ?? hostId,
    tricksByPlayer: trickMap,
    postedAntes,
    turnPlayerId: null,
  };
  await ref.update({
    handCount,
    currentHand: playHand,
    liveEnrollment: admin.firestore.FieldValue.delete(),
  });
  const verify = await ref.get();
  const phase = verify.data()?.currentHand?.phase;
  const tricksTotal = Object.values(verify.data()?.currentHand?.tricksByPlayer ?? {}).reduce(
    (s, n) => s + (n || 0),
    0,
  );
  console.info(
    `[bankroll-trace] patchSessionForSettlement emulator=${process.env.FIRESTORE_EMULATOR_HOST} phase=${phase} tricks=${tricksTotal}`,
  );
  assert.equal(phase, "play", "admin patch: phase must be play");
  assert.ok(tricksTotal >= 5, `admin patch: expected 5 tricks, got ${tricksTotal}`);
}

async function recordHumanWin(token, hostId, botId, tricks = null, { fromCurrent = false } = {}) {
  if (fromCurrent) {
    await patchSessionForSettlement(hostId, botId, tricks);
  } else {
    await seedPostAntePlayState(hostId, botId);
  }
  await callFunction("gameRecordHand", token, {
    roomId: ROOM,
    sessionId: SESSION,
    winnerIds: [hostId],
    participantIds: [hostId, botId],
    settlement: "win",
    recordedBy: hostId,
    tricksByPlayer: tricks ?? { [hostId]: 4, [botId]: 1 },
  });
}

async function runScenarioA(token, hostId, botId) {
  const state = await dealNextHand(token, hostId);
  assertPostFunding("A hand 1 start", state.scoreById, hostId, botId, state.session, {
    human: 80,
    bot: 80,
    pot: 40,
  });
  return state;
}

async function runScenarioB(token, hostId, botId) {
  await seedPostAntePlayState(hostId, botId);
  let state = await readState(globalThis.__testEnv);
  assertPostFunding("B hand 1 start (seeded)", state.scoreById, hostId, botId, state.session, {
    human: 80,
    bot: 80,
    pot: 40,
  });

  await recordHumanWin(token, hostId, botId);
  state = await readState(globalThis.__testEnv);
  assertSettled("B hand 1 settled", state.scoreById, hostId, botId, { human: 120, bot: 80 });
  assert.ok(state.session.nextDealFunding, "B: nextDealFunding after settlement");

  state = await dealNextHand(token, hostId);
  assertPostFunding("B hand 2 start", state.scoreById, hostId, botId, state.session, {
    human: 100,
    bot: 60,
    pot: 40,
  });
}

async function runScenarioC(token, hostId, botId) {
  await runScenarioB(token, hostId, botId);
  await recordHumanWin(token, hostId, botId, null, { fromCurrent: true });
  let state = await readState(globalThis.__testEnv);
  assertSettled("C hand 2 settled", state.scoreById, hostId, botId, { human: 140, bot: 60 });

  state = await dealNextHand(token, hostId);
  assertPostFunding("C hand 3 start", state.scoreById, hostId, botId, state.session, {
    human: 120,
    bot: 40,
    pot: 40,
  });
}

async function runScenarioD(token, hostId, botId) {
  await seedFreshSession(globalThis.__testEnv, hostId, botId);
  let state = await dealNextHand(token, hostId);
  assertPostFunding("D hand 1 start", state.scoreById, hostId, botId, state.session, {
    human: 80,
    bot: 80,
    pot: 40,
  });

  // Human folds during draw ("I'm out") — bot wins prefunded pot.
  const db = await getAdminDb();
  await db.doc(`rooms/${ROOM}/sessions/${SESSION}`).update({
    "currentHand.turnPlayerId": hostId,
    "liveEnrollment.deal.publicHand.turnPlayerId": hostId,
  });

  await callFunction("gameFoldDraw", token, {
    roomId: ROOM,
    sessionId: SESSION,
    playerId: hostId,
    actorId: hostId,
  });

  state = await readState(globalThis.__testEnv);
  assertSettled("D hand 1 settled (I'm out)", state.scoreById, hostId, botId, {
    human: 80,
    bot: 120,
  });

  state = await dealNextHand(token, hostId);
  assertPostFunding("D hand 2 start", state.scoreById, hostId, botId, state.session, {
    human: 60,
    bot: 100,
    pot: 40,
  });
}

async function runScenarioE(token, hostId, botId) {
  await seedFreshSession(globalThis.__testEnv, hostId, botId);
  await runScenarioB(token, hostId, botId);

  const state = await readState(globalThis.__testEnv);
  const merged1 = mergeNextDealFundingIntoScoreById(
    state.scoreById,
    state.session.nextDealFunding,
  );
  const merged2 = mergeNextDealFundingIntoScoreById(merged1, state.session.nextDealFunding);
  assert.deepEqual(merged1, merged2, "E: double merge is idempotent");

  const funded1 = collectFundingForHandStart({
    scoreById: merged1,
    nextDealFunding: state.session.nextDealFunding,
    carryOverPot: 0,
    participantIds: [hostId, botId],
    sessionStake: ANTE,
    buyInFallback: BUY_IN,
  });
  const funded2 = collectFundingForHandStart({
    scoreById: merged1,
    nextDealFunding: state.session.nextDealFunding,
    carryOverPot: 0,
    participantIds: [hostId, botId],
    sessionStake: ANTE,
    buyInFallback: BUY_IN,
  });
  assert.deepEqual(funded1.bankrolls, funded2.bankrolls, "E: replay funding stable");
  assert.deepEqual(funded1.postedAntes, funded2.postedAntes, "E: replay antes stable");
}

async function runScenarioF(token, hostId, botId) {
  await seedFreshSession(globalThis.__testEnv, hostId, botId);
  await runScenarioA(token, hostId, botId);
  await recordHumanWin(token, hostId, botId, null, { fromCurrent: true });
  let state = await readState(globalThis.__testEnv);
  assertSettled("F hand 1 settled", state.scoreById, hostId, botId, { human: 120, bot: 80 });
  assert.ok(state.session.nextDealFunding, "F: nextDealFunding written");

  state = await dealNextHand(token, hostId);
  const phase = state.session?.currentHand?.phase;
  assert.ok(
    phase === "reveal" || phase === "decision" || phase === "draw",
    `F: next hand enrolled, phase=${phase}`,
  );
  assertPostFunding("F hand 2 start", state.scoreById, hostId, botId, state.session, {
    human: 100,
    bot: 60,
    pot: 40,
  });
}

const SCENARIOS = {
  a: runScenarioA,
  b: runScenarioB,
  c: runScenarioC,
  d: runScenarioD,
  e: runScenarioE,
  f: runScenarioF,
};

async function main() {
  const filter = (process.argv[2] || "all").toLowerCase();
  const { host, port } = emulatorHostPort();
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: RULES, host, port },
  });
  globalThis.__testEnv = testEnv;

  try {
    const hostAuth = await authSignUp("bankroll-host@test.local");
    const botAuth = await authSignUp("bankroll-bot@test.local");
    const hostId = hostAuth.uid;
    const botId = botAuth.uid;
    const token = hostAuth.idToken;

    const toRun =
      filter === "all"
        ? Object.keys(SCENARIOS)
        : [filter.replace(/^scenario-/, "")];

    const results = [];
    for (const key of toRun) {
      const fn = SCENARIOS[key];
      if (!fn) {
        throw new Error(`Unknown scenario "${key}". Use: ${Object.keys(SCENARIOS).join(", ")}`);
      }
      await seedFreshSession(testEnv, hostId, botId);
      console.info(`\n=== Scenario ${key.toUpperCase()} ===`);
      await fn(token, hostId, botId);
      results.push({ scenario: key.toUpperCase(), ok: true });
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          scenarios: results,
          productionPath: [
            "gameEnsureHandEnrollment → mergeNextDealFundingIntoScoreById → collectFundingForHandStart",
            "gameRecordHand → nextDealFunding",
            "gameSetHandParticipation (I'm out) → buildSoloWinSettlement (prefunded pot)",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await testEnv.cleanup();
    globalThis.__testEnv = null;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
