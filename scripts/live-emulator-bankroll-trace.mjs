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
 *   G — bourré bust mint (netBourreMint) + bot auto-rebuy (netCashIn) via bot_1
 *
 * Run:
 *   npm run proof:live-bankroll
 *   npm run proof:live-bankroll -- scenario-d
 *   npm run proof:live-bankroll -- scenario-g
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  mergeNextDealFundingIntoScoreById,
  collectFundingForHandStart,
  assertTableChipInvariant,
  baselineFromSessionDoc,
  buildSessionChipSnapshot,
  initialSessionBaseline,
  baselineDocFromBaseline,
  compareUiToLedgerSnapshot,
  computeNextHandFundingMintDelta,
} from "../docs/money-persistence.js";

const PROJECT = "demo-national-bourre-league";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT}/us-central1`;
const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

const BUY_IN = 100;
const ANTE = 20;
/** Set per run in main() so emulator replays do not reuse stale session docs. */
let ROOM = "room_bankroll_e2e";
let SESSION = "session_bankroll_e2e";
/** Scenario G uses a larger stake so bourré full-pot penalty exceeds a broke bot bankroll. */
const SCENARIO_G_STAKE = 30;
/** Internal bot id for scenario G (triggers ledger-aware auto-rebuy). */
const SCENARIO_G_BOT = "bot_1";
const SCENARIO_G_LOW_BOT_BANKROLL = 10;

function potFromPosted(postedAntes = {}) {
  return Object.values(postedAntes).reduce((sum, raw) => sum + Math.max(0, Number(raw) || 0), 0);
}

function sessionPostedAntes(session) {
  const current = session?.currentHand ?? {};
  const live = session?.liveEnrollment?.deal?.publicHand ?? {};
  const hand =
    current?.phase && current.phase !== null ? current : live?.phase ? live : current;
  return hand?.postedAntes ?? {};
}

function assertFullBaselineInvariant(label, session, scoreById, playerIds) {
  const ids = playerIds;
  const carryOverPot = session?.carryOverPot ?? 0;
  const postedAntes = sessionPostedAntes(session);
  const baseline = baselineFromSessionDoc(session?.moneyLedgerBaseline, []);
  if (!session?.moneyLedgerBaseline) {
    baseline.tableStartingTotal = BUY_IN * ids.length;
  }
  const snapshot = buildSessionChipSnapshot(
    scoreById,
    {
      carryOverPot,
      currentHand: { postedAntes },
    },
    { buyInFallback: BUY_IN, playerIds: ids },
  );
  const result = assertTableChipInvariant(snapshot, baseline, {
    roomId: ROOM,
    sessionId: SESSION,
    label,
    handId: session?.handCount ?? 0,
  });
  const potSum = Object.values(postedAntes).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );
  const ui = {
    bankrolls: Object.fromEntries(ids.map((pid) => [pid, scoreById[pid]?.bankroll ?? 0])),
    pot: potSum,
    carryPot: carryOverPot,
  };
  const uiMatchesLedger = compareUiToLedgerSnapshot(ui, snapshot);
  const row = {
    label,
    ok: result.ok,
    actual: result.actual,
    expected: result.expected,
    bankrollSum: result.bankrollSum,
    potSum: result.potSum,
    carryPot: result.carryPot,
    netBourreMint: baseline.netBourreMint,
    netCashIn: baseline.netCashIn,
    netCashOut: baseline.netCashOut,
    uiMatchesLedger,
  };
  console.info(`[bankroll-invariant] ${label}`, JSON.stringify(row));
  console.info(
    JSON.stringify({
      tableId: ROOM,
      sessionId: SESSION,
      handId: session?.handCount ?? 0,
      label,
      ok: result.ok,
      uiMatchesLedger,
    }),
  );
  assert.equal(result.ok, true, `${label}: full baseline invariant`);
  assert.equal(uiMatchesLedger, true, `${label}: uiMatchesLedger`);
  return result;
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
  assertFullBaselineInvariant(label, session, scoreById, [hostId, botId]);
}

function assertSettled(label, scoreById, hostId, botId, expected, session = null) {
  traceBankrolls(label, scoreById, hostId, botId, session);
  assert.equal(scoreById[hostId]?.bankroll, expected.human, `${label}: human settled`);
  assert.equal(scoreById[botId]?.bankroll, expected.bot, `${label}: bot settled`);
  if (session) {
    assertFullBaselineInvariant(label, session, scoreById, [hostId, botId]);
  }
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
      moneyLedgerBaseline: baselineDocFromBaseline(initialSessionBaseline(2, BUY_IN)),
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

/** Scenario G: host + internal bot_1 with rebuyEnabled for bourré mint + auto-rebuy. */
async function seedScenarioGSession(testEnv, hostId, botPlayerId) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

    await setDoc(doc(db, "rooms", ROOM), {
      inviteCode: "BNKR-G",
      ownerId: hostId,
      name: "Bankroll E2E G",
      status: "active",
      bourreSettings: {
        buyInAmount: BUY_IN,
        anteAmount: SCENARIO_G_STAKE,
        rebuyEnabled: true,
      },
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "roomMembers", `${ROOM}_${hostId}`), {
      roomId: ROOM,
      userId: hostId,
      displayName: "host",
      role: "owner",
      joinedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "rooms", ROOM, "sessions", SESSION, "scores", hostId), {
      sessionId: SESSION,
      roomId: ROOM,
      playerId: hostId,
      displayName: "host",
      bankroll: BUY_IN,
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "rooms", ROOM, "sessions", SESSION, "scores", botPlayerId), {
      sessionId: SESSION,
      roomId: ROOM,
      playerId: botPlayerId,
      displayName: "Bot Alpha",
      bankroll: BUY_IN,
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
      isRobot: true,
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "rooms", ROOM, "sessions", SESSION), {
      roomId: ROOM,
      sessionName: "Bankroll Proof G",
      status: "in_progress",
      handCount: 0,
      handStake: SCENARIO_G_STAKE,
      handStakeLocked: false,
      limEnabled: false,
      carryOverPot: 0,
      moneyEngineVersion: "v1",
      moneySequence: 0,
      moneyLedgerBaseline: baselineDocFromBaseline(initialSessionBaseline(2, BUY_IN)),
      dealerId: hostId,
      players: [
        { playerId: hostId, displayName: "host" },
        { playerId: botPlayerId, displayName: "Bot Alpha" },
      ],
      tableOptInIds: [hostId, botPlayerId],
      currentHand: { phase: null, participantIds: [], seatedIds: [], tricksByPlayer: {} },
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      rounds: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

async function patchLowBotBankrolls(hostId, botPlayerId, hostBankroll, botBankroll) {
  const db = await getAdminDb();
  await db.doc(`rooms/${ROOM}/sessions/${SESSION}/scores/${hostId}`).update({
    bankroll: hostBankroll,
    net: hostBankroll - BUY_IN,
  });
  await db.doc(`rooms/${ROOM}/sessions/${SESSION}/scores/${botPlayerId}`).update({
    bankroll: botBankroll,
    net: botBankroll - BUY_IN,
  });
}

/** Post-ante play state with bourré setup: bot posts all remaining chips as ante. */
async function seedBourrePlayState(hostId, botPlayerId, hostBeforeAnte, botBeforeAnte) {
  const state = await readStateUnified(globalThis.__testEnv);
  const stake = state.session?.handStake ?? SCENARIO_G_STAKE;
  const hostPosted = stake;
  const botPosted = Math.min(stake, botBeforeAnte);
  const hostBankroll = hostBeforeAnte - hostPosted;
  const botBankrollAfterAnte = Math.max(0, botBeforeAnte - botPosted);
  const db = await getAdminDb();
  const require = createRequire(import.meta.url);
  const admin = require("../functions/node_modules/firebase-admin");
  const handCount = (state.session?.handCount ?? 0) + 1;
  await db.doc(`rooms/${ROOM}/sessions/${SESSION}/scores/${hostId}`).update({
    bankroll: hostBankroll,
    net: hostBankroll - BUY_IN,
  });
  await db.doc(`rooms/${ROOM}/sessions/${SESSION}/scores/${botPlayerId}`).update({
    bankroll: botBankrollAfterAnte,
    net: botBankrollAfterAnte - BUY_IN,
    out: botBankrollAfterAnte <= 0,
  });
  await db.doc(`rooms/${ROOM}/sessions/${SESSION}`).update({
    handCount,
    handStakeLocked: true,
    currentHand: {
      phase: "play",
      participantIds: [hostId, botPlayerId],
      seatedIds: [hostId, botPlayerId],
      dealerId: state.session?.dealerId ?? hostId,
      tricksByPlayer: { [hostId]: 5, [botPlayerId]: 0 },
      postedAntes: { [hostId]: hostPosted, [botPlayerId]: botPosted },
      turnPlayerId: null,
    },
    liveEnrollment: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function readStateFromAdmin() {
  const db = await getAdminDb();
  const sessionRef = db.doc(`rooms/${ROOM}/sessions/${SESSION}`);
  const sessionSnap = await sessionRef.get();
  const scoresSnap = await sessionRef.collection("scores").get();
  return {
    session: sessionSnap.exists ? sessionSnap.data() : null,
    scoreById: Object.fromEntries(scoresSnap.docs.map((d) => [d.id, d.data()])),
  };
}

/** Prefer admin reads after Cloud Function writes (shared emulator). */
async function readStateUnified(testEnv) {
  return readStateFromAdmin();
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
  let state = await readStateUnified(globalThis.__testEnv);
  const phase = state.session?.currentHand?.phase;
  if (phase === "reveal") {
    await callFunction("gameAdvanceHandReveal", token, {
      roomId: ROOM,
      sessionId: SESSION,
    });
    state = await readStateUnified(globalThis.__testEnv);
  }
  return state;
}

async function seedPostAntePlayState(hostId, botId) {
  const pre = await readStateUnified(globalThis.__testEnv);
  const stake = pre.session?.handStake ?? ANTE;
  await globalThis.__testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, updateDoc, serverTimestamp } = await import("firebase/firestore");
    for (const pid of [hostId, botId]) {
      await updateDoc(doc(db, "rooms", ROOM, "sessions", SESSION, "scores", pid), {
        bankroll: BUY_IN - stake,
        net: BUY_IN - stake - BUY_IN,
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
          postedAntes: { [hostId]: stake, [botId]: stake },
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
  const state = await readStateUnified(globalThis.__testEnv);
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

async function recordHandWin(token, hostId, opponentId, tricksByPlayer) {
  await callFunction("gameRecordHand", token, {
    roomId: ROOM,
    sessionId: SESSION,
    winnerIds: [hostId],
    participantIds: [hostId, opponentId],
    settlement: "win",
    recordedBy: hostId,
    tricksByPlayer,
  });
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

async function runScenarioG(token, hostId, botPlayerId) {
  console.info(
    "\n=== Scenario G — bourré bust mint + bot auto-rebuy ===\n" +
      JSON.stringify({
        scenario: "G",
        roomId: ROOM,
        sessionId: SESSION,
        description: "bourré bust mint (netBourreMint) + ledger-aware bot auto-rebuy (netCashIn)",
        buyIn: BUY_IN,
        ante: SCENARIO_G_STAKE,
        botPlayerId,
        lowBotBankroll: SCENARIO_G_LOW_BOT_BANKROLL,
        rebuyEnabled: true,
      }),
  );

  await seedScenarioGSession(globalThis.__testEnv, hostId, botPlayerId);

  await seedPostAntePlayState(hostId, botPlayerId);
  let state = await readStateUnified(globalThis.__testEnv);
  traceBankrolls("G hand 1 ante", state.scoreById, hostId, botPlayerId, state.session);
  assertFullBaselineInvariant(
    "G hand 1 ante",
    state.session,
    state.scoreById,
    [hostId, botPlayerId],
  );

  await recordHandWin(token, hostId, botPlayerId, { [hostId]: 4, [botPlayerId]: 1 });
  state = await readStateUnified(globalThis.__testEnv);
  traceBankrolls("G hand 1 settled", state.scoreById, hostId, botPlayerId, state.session);
  assertFullBaselineInvariant(
    "G hand 1 settled",
    state.session,
    state.scoreById,
    [hostId, botPlayerId],
  );

  await patchLowBotBankrolls(hostId, botPlayerId, 190, SCENARIO_G_LOW_BOT_BANKROLL);
  traceBankrolls(
    "G after low-stack patch",
    (await readStateUnified(globalThis.__testEnv)).scoreById,
    hostId,
    botPlayerId,
  );

  await seedBourrePlayState(hostId, botPlayerId, 190, SCENARIO_G_LOW_BOT_BANKROLL);
  state = await readStateUnified(globalThis.__testEnv);
  assertFullBaselineInvariant(
    "G bourré hand post-ante",
    state.session,
    state.scoreById,
    [hostId, botPlayerId],
  );

  await recordHandWin(token, hostId, botPlayerId, { [hostId]: 5, [botPlayerId]: 0 });
  state = await readStateUnified(globalThis.__testEnv);

  const db = await getAdminDb();
  const handSnap = await db
    .collection(`rooms/${ROOM}/sessions/${SESSION}/hands`)
    .doc(String(state.session?.handCount ?? 0))
    .get();
  const handLedger = handSnap.data() ?? {};
  console.info("[bankroll-trace] G bourré hand ledger", JSON.stringify(handLedger.bourreIds ?? []));
  assert.ok(
    (handLedger.bourreIds ?? []).includes(botPlayerId),
    "G: bourré bust recorded on hand ledger",
  );
  console.info(
    "[bankroll-trace] G nextDealFunding",
    JSON.stringify(state.session?.nextDealFunding ?? null),
  );

  const stake = state.session?.handStake ?? SCENARIO_G_STAKE;
  const hostSettled = state.scoreById[hostId]?.bankroll ?? 0;
  const expectedMint = computeNextHandFundingMintDelta({
    scoreById: {
      [hostId]: { bankroll: hostSettled },
      [botPlayerId]: { bankroll: 0, out: true },
    },
    nextDealFunding: state.session?.nextDealFunding ?? null,
    carryOverPot: state.session?.carryOverPot ?? 0,
    participantIds: [hostId, botPlayerId],
    sessionStake: stake,
    buyInFallback: BUY_IN,
  });
  console.info("[bankroll-trace] G computeNextHandFundingMintDelta", expectedMint);

  const baseline = state.session?.moneyLedgerBaseline ?? {};
  console.info("[bankroll-trace] G moneyLedgerBaseline", JSON.stringify(baseline));
  if (expectedMint > 0) {
    assert.ok(
      Number(baseline.netBourreMint) > 0,
      `G: netBourreMint must increase after bourré bust mint (expected ~${expectedMint})`,
    );
  } else {
    console.info(
      "G: bourré bust covered via ledger-aware bot auto-rebuy (netCashIn) — netBourreMint unchanged",
    );
    assert.ok(
      Number(baseline.netCashIn) >= BUY_IN,
      "G: netCashIn must reflect bot auto-rebuy when mint delta is 0",
    );
  }
  assert.equal(Number(baseline.netCashOut) || 0, 0, "G: netCashOut remains 0 (cash-out not implemented)");
  assert.equal(
    state.scoreById[botPlayerId]?.bankroll,
    BUY_IN,
    "G: bot auto-rebuy restores buyIn bankroll",
  );
  assert.ok(!state.scoreById[botPlayerId]?.out, "G: bot out flag cleared after rebuy");

  assertSettled(
    "G bourré settled + auto-rebuy",
    state.scoreById,
    hostId,
    botPlayerId,
    { human: state.scoreById[hostId]?.bankroll, bot: BUY_IN },
    state.session,
  );

  console.info("Scenario G: bourré bust mint + bot auto-rebuy — all invariant checks ok:true");
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
  assertSettled("B hand 1 settled", state.scoreById, hostId, botId, { human: 120, bot: 80 }, state.session);
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
  assertSettled("C hand 2 settled", state.scoreById, hostId, botId, { human: 140, bot: 60 }, state.session);

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
  }, state.session);

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
  assertSettled("F hand 1 settled", state.scoreById, hostId, botId, { human: 120, bot: 80 }, state.session);
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
  g: runScenarioG,
};

async function main() {
  const filter = (process.argv[2] || "all").toLowerCase();
  const { host, port } = emulatorHostPort();
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: RULES, host, port },
  });
  globalThis.__testEnv = testEnv;
  const runId = Date.now();
  ROOM = `room_bankroll_${runId}`;
  SESSION = `session_bankroll_${runId}`;

  try {
    const hostAuth = await authSignUp(`bankroll-host-${runId}@test.local`);
    const botAuth = await authSignUp(`bankroll-bot-${runId}@test.local`);
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
      console.info(`\n=== Scenario ${key.toUpperCase()} ===`);
      if (key === "g") {
        await runScenarioG(token, hostId, SCENARIO_G_BOT);
      } else {
        await seedFreshSession(testEnv, hostId, botId);
        await fn(token, hostId, botId);
      }
      results.push({ scenario: key.toUpperCase(), ok: true });
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          scenarios: results,
          productionPath: [
            "gameEnsureHandEnrollment → mergeNextDealFundingIntoScoreById → collectFundingForHandStart",
            "gameRecordHand → nextDealFunding → bumpBaselineForNextHandFunding (netBourreMint)",
            "gameRecordHand → executeBotRebuyPlanLedgerAware (netCashIn, bot_*)",
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
