#!/usr/bin/env node
/**
 * Live emulator proof: production Cloud Functions settlement → enrollment chain.
 *
 * Mirrors the real app when SERVER_HAND_AUTHORITY=true:
 *   recordHand() → gameRecordHand → handleRecordHand
 *   ensureHandEnrollment() → gameEnsureHandEnrollment → handleEnsureHandEnrollment
 *     → mergeNextDealFundingIntoScoreById → collectNextHandAntes → dealInitialHand
 *
 * Run: npm run proof:live-settlement
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

const ROOM = "room_live_settle";
const SESSION = "session_live_settle";
const BUY_IN = 1000;
const ANTE = 1;
const CARRY_IN = 17;
const SETTLED_POT = CARRY_IN + 3 * ANTE; // 20

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

async function seedBase(testEnv, ids) {
  const { HOST, P2, P3, P4, ALL, ACTIVE } = ids;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

    await setDoc(doc(db, "rooms", ROOM), {
      inviteCode: "LIVE-01",
      ownerId: HOST,
      name: "Live Settlement Proof",
      status: "active",
      bourreSettings: { buyInAmount: BUY_IN, anteAmount: ANTE },
      createdAt: serverTimestamp(),
    });

    for (const uid of ALL) {
      await setDoc(doc(db, "roomMembers", `${ROOM}_${uid}`), {
        roomId: ROOM,
        userId: uid,
        displayName: uid,
        role: uid === HOST ? "owner" : "player",
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
      sessionName: "Live Proof Table",
      status: "in_progress",
      handCount: 0,
      handStake: ANTE,
      handStakeLocked: false,
      limEnabled: false,
      carryOverPot: CARRY_IN,
      dealerId: HOST,
      players: ALL.map((id) => ({ playerId: id, displayName: id })),
      currentHand: {
        phase: "play",
        participantIds: ACTIVE,
        seatedIds: ALL,
        dealerId: HOST,
        tricksByPlayer: { [HOST]: 3, [P2]: 2, [P3]: 0 },
        postedAntes: { [HOST]: ANTE, [P2]: ANTE, [P3]: ANTE },
      },
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      rounds: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

async function readState(testEnv) {
  let result = null;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, getDoc, getDocs, collection } = await import("firebase/firestore");
    const sessionSnap = await getDoc(doc(db, "rooms", ROOM, "sessions", SESSION));
    const scoreSnap = await getDocs(collection(db, "rooms", ROOM, "sessions", SESSION, "scores"));
    const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
    result = {
      session: sessionSnap.exists() ? sessionSnap.data() : null,
      scoreById,
    };
  });
  return result;
}

async function stripScoreBourreFlags(testEnv, allIds) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, updateDoc, deleteField } = await import("firebase/firestore");
    for (const pid of allIds) {
      await updateDoc(doc(db, "rooms", ROOM, "sessions", SESSION, "scores", pid), {
        bourreReplacementDue: deleteField(),
        skipNextAnte: deleteField(),
      });
    }
  });
}

function labelPlayer(pid, ids) {
  if (pid === ids.HOST) return "A(host)";
  if (pid === ids.P2) return "B";
  if (pid === ids.P3) return "C";
  if (pid === ids.P4) return "D";
  return pid;
}

function mapByLabel(obj, ids) {
  return Object.fromEntries(
    Object.entries(obj).map(([pid, val]) => [labelPlayer(pid, ids), val]),
  );
}

async function main() {
  const { host, port } = emulatorHostPort();
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: RULES, host, port },
  });

  const trace = {
    environment: "firebase-emulator-local (auth + firestore + functions)",
    project: PROJECT,
    productionPath: [
      "recordHand() → gameRecordHand → handleRecordHand",
      "ensureHandEnrollment() → gameEnsureHandEnrollment → handleEnsureHandEnrollment",
      "runEnrollmentStepTransaction → mergeNextDealFundingIntoScoreById",
      "buildPagatHandStartPatch → collectNextHandAntes → dealInitialHand",
    ],
    scenario: {
      settledPotTarget: SETTLED_POT,
      carryIn: CARRY_IN,
      activeAntes: 3,
      activePlayers: ["A(host)", "B", "C"],
      foldedPlayers: ["D"],
      tricksWon: { A: 3, B: 2, C: 0 },
      bourreExpected: ["C"],
      historicalBugWouldChargeC: ANTE,
      fixedFlowShouldChargeC: SETTLED_POT,
    },
    checkpoints: {},
  };

  try {
    const hostAuth = await authSignUp("live-p1@test.local");
    const p2Auth = await authSignUp("live-p2@test.local");
    const p3Auth = await authSignUp("live-p3@test.local");
    const p4Auth = await authSignUp("live-p4@test.local");
    const ids = {
      HOST: hostAuth.uid,
      P2: p2Auth.uid,
      P3: p3Auth.uid,
      P4: p4Auth.uid,
      ALL: [hostAuth.uid, p2Auth.uid, p3Auth.uid, p4Auth.uid],
      ACTIVE: [hostAuth.uid, p2Auth.uid, p3Auth.uid],
      FOLDED: [p4Auth.uid],
    };

    await seedBase(testEnv, ids);

    const { HOST, P2, P3, P4, ALL, ACTIVE, FOLDED } = ids;
    const before = await readState(testEnv);

    trace.checkpoints[1] = {
      label: "settled pot amount (pre-settlement inputs)",
      settledPot: SETTLED_POT,
      carryOverPot: before.session.carryOverPot,
      postedAntes: mapByLabel(before.session.currentHand?.postedAntes ?? {}, ids),
    };

    trace.checkpoints[2] = {
      label: "active players and folded players",
      activePlayers: ACTIVE.map((pid) => labelPlayer(pid, ids)),
      foldedPlayers: FOLDED.map((pid) => labelPlayer(pid, ids)),
      tricksWon: mapByLabel(before.session.currentHand?.tricksByPlayer ?? {}, ids),
    };

    await callFunction("gameRecordHand", hostAuth.idToken, {
      roomId: ROOM,
      sessionId: SESSION,
      winnerIds: [HOST],
      participantIds: ACTIVE,
      settlement: "win",
      recordedBy: HOST,
      tricksByPlayer: { [HOST]: 3, [P2]: 2, [P3]: 0 },
    });

    const afterSettle = await readState(testEnv);
    const bourrePlayers = afterSettle.session.nextDealFunding?.bourreIds ?? [];

    trace.checkpoints[3] = {
      label: "bourré players after settlement",
      bourrePlayers: bourrePlayers.map((pid) => labelPlayer(pid, ids)),
      bourreReplacementDueOnScores: mapByLabel(
        Object.fromEntries(
          ALL.map((pid) => [pid, afterSettle.scoreById[pid]?.bourreReplacementDue ?? null]),
        ),
        ids,
      ),
    };

    trace.checkpoints[4] = {
      label: "written session.nextDealFunding",
      sessionNextDealFunding: {
        settledPot: afterSettle.session.nextDealFunding?.settledPot,
        bourreIds: (afterSettle.session.nextDealFunding?.bourreIds ?? []).map((pid) =>
          labelPlayer(pid, ids),
        ),
        byPlayer: mapByLabel(afterSettle.session.nextDealFunding?.byPlayer ?? {}, ids),
      },
      carryOverPotAfterWin: afterSettle.session.carryOverPot,
    };

    await stripScoreBourreFlags(testEnv, ALL);
    const staleRead = await readState(testEnv);

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
      ),
      sessionNextDealFundingStillPresent: {
        settledPot: staleRead.session.nextDealFunding?.settledPot,
        bourreIds: (staleRead.session.nextDealFunding?.bourreIds ?? []).map((pid) =>
          labelPlayer(pid, ids),
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
      ),
      collectNextHandAntesPreview: mapByLabel(simulatedAntes.postedAntes, ids),
      nextHandPotPreview: simulatedAntes.nextHandPot,
    };

    await callFunction("gameEnsureHandEnrollment", hostAuth.idToken, {
      roomId: ROOM,
      sessionId: SESSION,
    });

    const afterDeal = await readState(testEnv);
    const posted = afterDeal.session.currentHand?.postedAntes ?? {};

    trace.checkpoints[7] = {
      label: "final ante charged by collectNextHandAntes (live deal via gameEnsureHandEnrollment)",
      postedAntes: mapByLabel(posted, ids),
      nextHandPot:
        (afterDeal.session.carryOverPot || 0) +
        Object.values(posted).reduce((s, n) => s + Number(n || 0), 0),
      dealPhase: afterDeal.session.currentHand?.phase,
    };

    trace.verification = {
      bourrePlayerCChargedFullPot: posted[P3] === SETTLED_POT,
      bourrePlayerCNotChargedOne: posted[P3] !== ANTE,
      foldedDChargedNormalAnte: posted[P4] === ANTE,
      foldedDNotBourre: !bourrePlayers.includes(P4),
      historicalBugWouldBe: { C: ANTE },
      actualCharge: { C: posted[P3] },
      allPassed:
        posted[P3] === SETTLED_POT &&
        posted[P3] !== ANTE &&
        posted[P4] === ANTE &&
        !bourrePlayers.includes(P4),
    };
  } finally {
    await testEnv.cleanup();
  }

  console.log(JSON.stringify(trace, null, 2));
  if (!trace.verification?.allPassed) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
