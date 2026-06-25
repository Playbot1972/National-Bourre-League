#!/usr/bin/env node
/**
 * Live emulator proof: production Cloud Functions settlement → enrollment chain.
 *
 * Scenarios:
 *   single-bourre  — A wins, C bourrés, D folded (default)
 *   multi-bourre   — A wins 5 tricks, B and C bourrés, D folded (pot $20)
 *
 * Run:
 *   npm run proof:live-settlement
 *   npm run proof:live-settlement:multi
 */
import { readFileSync } from "node:fs";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  mergeNextDealFundingIntoScoreById,
  collectNextHandAntes,
} from "../docs/bourre-rules.js";

const PROJECT = "demo-national-bourre-league";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT}/us-central1`;
const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

const BUY_IN = 1000;
const ANTE = 1;

const SCENARIOS = {
  "single-bourre": {
    room: "room_live_single",
    session: "session_live_single",
    emailPrefix: "single",
    carryIn: 17,
    settledPot: 17 + 3 * ANTE,
    tricksByPlayer: (ids) => ({ [ids.HOST]: 3, [ids.P2]: 2, [ids.P3]: 0 }),
    postedAntes: (ids) => ({ [ids.HOST]: ANTE, [ids.P2]: ANTE, [ids.P3]: ANTE }),
    active: (ids) => [ids.HOST, ids.P2, ids.P3],
    folded: (ids) => [ids.P4],
    all: (ids) => [ids.HOST, ids.P2, ids.P3, ids.P4],
    labels: { host: "A(host)", p2: "B", p3: "C", p4: "D" },
    bourreExpected: ["C"],
    historicalBugCharges: { C: ANTE },
    verify: (posted, ids, bourrePlayers, settledPot) => ({
      bourreCharges: { C: posted[ids.P3] },
      foldedDChargedNormalAnte: posted[ids.P4] === ANTE,
      allPassed:
        posted[ids.P3] === settledPot &&
        posted[ids.P3] !== ANTE &&
        posted[ids.P4] === ANTE &&
        !bourrePlayers.includes(ids.P4),
    }),
  },
  "multi-bourre": {
    room: "room_live_multi",
    session: "session_live_multi",
    emailPrefix: "multi",
    carryIn: 17,
    settledPot: 17 + 3 * ANTE,
    potComposition: { carryIn: 17, activeAntes: { A: 1, B: 1, C: 1 }, formula: "17 + 1 + 1 + 1 = 20" },
    tricksByPlayer: (ids) => ({ [ids.HOST]: 5, [ids.P2]: 0, [ids.P3]: 0 }),
    postedAntes: (ids) => ({ [ids.HOST]: ANTE, [ids.P2]: ANTE, [ids.P3]: ANTE }),
    active: (ids) => [ids.HOST, ids.P2, ids.P3],
    folded: (ids) => [ids.P4],
    all: (ids) => [ids.HOST, ids.P2, ids.P3, ids.P4],
    labels: { host: "A(host)", p2: "B", p3: "C", p4: "D" },
    bourreExpected: ["B", "C"],
    historicalBugCharges: { B: ANTE, C: ANTE },
    verify: (posted, ids, bourrePlayers, settledPot) => ({
      bourreCharges: { B: posted[ids.P2], C: posted[ids.P3] },
      foldedDChargedNormalAnte: posted[ids.P4] === ANTE,
      foldedDNotBourre: !bourrePlayers.includes(ids.P4),
      nextHandPotExpected: settledPot + settledPot + settledPot + ANTE + ANTE,
      allPassed:
        posted[ids.P2] === settledPot &&
        posted[ids.P3] === settledPot &&
        posted[ids.P2] !== ANTE &&
        posted[ids.P3] !== ANTE &&
        posted[ids.P4] === ANTE &&
        !bourrePlayers.includes(ids.P4) &&
        bourrePlayers.includes(ids.P2) &&
        bourrePlayers.includes(ids.P3),
    }),
  },
};

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

function labelPlayer(pid, ids, scenario) {
  if (pid === ids.HOST) return scenario.labels.host;
  if (pid === ids.P2) return scenario.labels.p2;
  if (pid === ids.P3) return scenario.labels.p3;
  if (ids.P4 && pid === ids.P4) return scenario.labels.p4;
  return pid;
}

function mapByLabel(obj, ids, scenario) {
  return Object.fromEntries(
    Object.entries(obj).map(([pid, val]) => [labelPlayer(pid, ids, scenario), val]),
  );
}

async function seedBase(testEnv, scenario, ids) {
  const { HOST, ALL, ACTIVE } = ids;
  const tricksByPlayer = scenario.tricksByPlayer(ids);
  const postedAntes = scenario.postedAntes(ids);

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

    await setDoc(doc(db, "rooms", scenario.room), {
      inviteCode: "LIVE-01",
      ownerId: HOST,
      name: "Live Settlement Proof",
      status: "active",
      bourreSettings: { buyInAmount: BUY_IN, anteAmount: ANTE },
      createdAt: serverTimestamp(),
    });

    for (const uid of ALL) {
      await setDoc(doc(db, "roomMembers", `${scenario.room}_${uid}`), {
        roomId: scenario.room,
        userId: uid,
        displayName: uid,
        role: uid === HOST ? "owner" : "player",
        joinedAt: serverTimestamp(),
      });
      await setDoc(doc(db, "rooms", scenario.room, "sessions", scenario.session, "scores", uid), {
        sessionId: scenario.session,
        roomId: scenario.room,
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

    await setDoc(doc(db, "rooms", scenario.room, "sessions", scenario.session), {
      roomId: scenario.room,
      sessionName: "Live Proof Table",
      status: "in_progress",
      handCount: 0,
      handStake: ANTE,
      handStakeLocked: false,
      limEnabled: false,
      carryOverPot: scenario.carryIn,
      dealerId: HOST,
      players: ALL.map((id) => ({ playerId: id, displayName: id })),
      currentHand: {
        phase: "play",
        participantIds: ACTIVE,
        seatedIds: ALL,
        dealerId: HOST,
        tricksByPlayer,
        postedAntes,
      },
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      rounds: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

async function readState(testEnv, scenario) {
  let result = null;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, getDoc, getDocs, collection } = await import("firebase/firestore");
    const sessionSnap = await getDoc(
      doc(db, "rooms", scenario.room, "sessions", scenario.session),
    );
    const scoreSnap = await getDocs(
      collection(db, "rooms", scenario.room, "sessions", scenario.session, "scores"),
    );
    const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
    result = {
      session: sessionSnap.exists() ? sessionSnap.data() : null,
      scoreById,
    };
  });
  return result;
}

async function stripScoreBourreFlags(testEnv, scenario, allIds) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, updateDoc, deleteField } = await import("firebase/firestore");
    for (const pid of allIds) {
      await updateDoc(
        doc(db, "rooms", scenario.room, "sessions", scenario.session, "scores", pid),
        {
          bourreReplacementDue: deleteField(),
          skipNextAnte: deleteField(),
        },
      );
    }
  });
}

async function runScenario(scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) {
    throw new Error(`Unknown scenario "${scenarioKey}". Use: ${Object.keys(SCENARIOS).join(", ")}`);
  }

  const { host, port } = emulatorHostPort();
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: RULES, host, port },
  });

  const trace = {
    scenarioKey,
    environment: "firebase-emulator-local (auth + firestore + functions)",
    project: PROJECT,
    productionPath: [
      "recordHand() → gameRecordHand → handleRecordHand",
      "ensureHandEnrollment() → gameEnsureHandEnrollment → handleEnsureHandEnrollment",
      "runEnrollmentStepTransaction → mergeNextDealFundingIntoScoreById",
      "buildPagatHandStartPatch → collectNextHandAntes → dealInitialHand",
    ],
    scenario: {
      settledPotTarget: scenario.settledPot,
      carryIn: scenario.carryIn,
      bourreExpected: scenario.bourreExpected,
      historicalBugWouldCharge: scenario.historicalBugCharges,
      fixedFlowShouldChargeEachBourre: scenario.settledPot,
    },
    checkpoints: {},
  };

  try {
    const hostAuth = await authSignUp(`${scenario.emailPrefix}-p1@test.local`);
    const p2Auth = await authSignUp(`${scenario.emailPrefix}-p2@test.local`);
    const p3Auth = await authSignUp(`${scenario.emailPrefix}-p3@test.local`);
    const p4Auth = await authSignUp(`${scenario.emailPrefix}-p4@test.local`);

    const ids = {
      HOST: hostAuth.uid,
      P2: p2Auth.uid,
      P3: p3Auth.uid,
      P4: p4Auth.uid,
      ALL: scenario.all({
        HOST: hostAuth.uid,
        P2: p2Auth.uid,
        P3: p3Auth.uid,
        P4: p4Auth.uid,
      }),
      ACTIVE: scenario.active({
        HOST: hostAuth.uid,
        P2: p2Auth.uid,
        P3: p3Auth.uid,
        P4: p4Auth.uid,
      }),
      FOLDED: scenario.folded({
        HOST: hostAuth.uid,
        P2: p2Auth.uid,
        P3: p3Auth.uid,
        P4: p4Auth.uid,
      }),
    };

    await seedBase(testEnv, scenario, ids);

    const { HOST, ALL, ACTIVE, FOLDED } = ids;
    const before = await readState(testEnv, scenario);
    const tricksWon = mapByLabel(before.session.currentHand?.tricksByPlayer ?? {}, ids, scenario);

    trace.checkpoints[1] = {
      label: "settled pot amount (pre-settlement inputs)",
      settledPot: scenario.settledPot,
      carryOverPot: before.session.carryOverPot,
      postedAntes: mapByLabel(before.session.currentHand?.postedAntes ?? {}, ids, scenario),
      ...(scenario.potComposition ? { composition: scenario.potComposition } : {}),
    };

    trace.checkpoints[2] = {
      label: "active players and folded players",
      activePlayers: ACTIVE.map((pid) => labelPlayer(pid, ids, scenario)),
      foldedPlayers: FOLDED.map((pid) => labelPlayer(pid, ids, scenario)),
      tricksWon,
    };

    await callFunction("gameRecordHand", hostAuth.idToken, {
      roomId: scenario.room,
      sessionId: scenario.session,
      winnerIds: [HOST],
      participantIds: ACTIVE,
      settlement: "win",
      recordedBy: HOST,
      tricksByPlayer: scenario.tricksByPlayer(ids),
    });

    const afterSettle = await readState(testEnv, scenario);
    const bourrePlayers = afterSettle.session.nextDealFunding?.bourreIds ?? [];

    trace.checkpoints[3] = {
      label: "bourré players after settlement",
      bourrePlayers: bourrePlayers.map((pid) => labelPlayer(pid, ids, scenario)),
      bourreReplacementDueOnScores: mapByLabel(
        Object.fromEntries(
          ALL.map((pid) => [pid, afterSettle.scoreById[pid]?.bourreReplacementDue ?? null]),
        ),
        ids,
        scenario,
      ),
    };

    trace.checkpoints[4] = {
      label: "written session.nextDealFunding",
      sessionNextDealFunding: {
        settledPot: afterSettle.session.nextDealFunding?.settledPot,
        bourreIds: (afterSettle.session.nextDealFunding?.bourreIds ?? []).map((pid) =>
          labelPlayer(pid, ids, scenario),
        ),
        byPlayer: mapByLabel(afterSettle.session.nextDealFunding?.byPlayer ?? {}, ids, scenario),
      },
      carryOverPotAfterWin: afterSettle.session.carryOverPot,
    };

    await stripScoreBourreFlags(testEnv, scenario, ALL);
    const staleRead = await readState(testEnv, scenario);

    trace.checkpoints[5] = {
      label: "score rows as read at enrollment time (stale — bourré flags stripped)",
      scoreRowsAsReadAtEnrollment: mapByLabel(
        Object.fromEntries(
          ALL.map((pid) => [
            pid,
            {
              bankroll: staleRead.scoreById[pid]?.bankroll,
              bourreReplacementDue: staleRead.scoreById[pid]?.bourreReplacementDue ?? null,
            },
          ]),
        ),
        ids,
        scenario,
      ),
      sessionNextDealFundingStillPresent: {
        settledPot: staleRead.session.nextDealFunding?.settledPot,
        bourreIds: (staleRead.session.nextDealFunding?.bourreIds ?? []).map((pid) =>
          labelPlayer(pid, ids, scenario),
        ),
      },
    };

    const mergedScoreById = mergeNextDealFundingIntoScoreById(
      staleRead.scoreById,
      staleRead.session.nextDealFunding,
    );

    const simulatedAntes = collectNextHandAntes({
      carryOverPot: staleRead.session.carryOverPot || 0,
      participantIds: ALL,
      scoreById: mergedScoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });

    trace.checkpoints[6] = {
      label: "merged rows after mergeNextDealFundingIntoScoreById",
      mergedScoreById: mapByLabel(
        Object.fromEntries(
          ALL.map((pid) => [
            pid,
            {
              bankroll: mergedScoreById[pid]?.bankroll,
              bourreReplacementDue: mergedScoreById[pid]?.bourreReplacementDue ?? null,
              skipNextAnte: mergedScoreById[pid]?.skipNextAnte ?? null,
            },
          ]),
        ),
        ids,
        scenario,
      ),
      collectNextHandAntesPreview: mapByLabel(simulatedAntes.postedAntes, ids, scenario),
      nextHandPotPreview: simulatedAntes.nextHandPot,
    };

    await callFunction("gameEnsureHandEnrollment", hostAuth.idToken, {
      roomId: scenario.room,
      sessionId: scenario.session,
    });

    const afterDeal = await readState(testEnv, scenario);
    const posted = afterDeal.session.currentHand?.postedAntes ?? {};

    trace.checkpoints[7] = {
      label: "final ante charged by collectNextHandAntes (live deal via gameEnsureHandEnrollment)",
      postedAntes: mapByLabel(posted, ids, scenario),
      nextHandPot:
        (afterDeal.session.carryOverPot || 0) +
        Object.values(posted).reduce((s, n) => s + Number(n || 0), 0),
      dealPhase: afterDeal.session.currentHand?.phase,
    };

    trace.verification = {
      historicalBugWouldBe: scenario.historicalBugCharges,
      actualCharge: mapByLabel(
        Object.fromEntries(
          bourrePlayers.map((pid) => [pid, posted[pid]]),
        ),
        ids,
        scenario,
      ),
      ...scenario.verify(posted, ids, bourrePlayers, scenario.settledPot),
    };
  } finally {
    await testEnv.cleanup();
  }

  return trace;
}

async function main() {
  const scenarioKey = process.argv[2] || "single-bourre";
  const trace = await runScenario(scenarioKey);
  console.log(JSON.stringify(trace, null, 2));
  if (!trace.verification?.allPassed) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
