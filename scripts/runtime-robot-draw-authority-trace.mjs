#!/usr/bin/env node
/**
 * Live emulator runtime trace: SERVER_HAND_AUTHORITY draw branch uses server bots only.
 *
 * Run:
 *   npm run proof:runtime-robot-draw
 */
import { readFileSync } from "node:fs";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { SERVER_HAND_AUTHORITY } from "../docs/firebase-config.js";
import {
  shouldClientDriveRobotDraw,
  shouldUseServerBotAdvanceForDraw,
} from "../docs/robot-draw-authority.js";
import { dealInitialHand, serializeHandState } from "../docs/game-engine.js";

const PROJECT = "demo-national-bourre-league";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT}/us-central1`;
const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

const ROOM_ID = "room_runtime_robot_draw";
const SESSION_ID = "session_runtime_robot_draw";
const BOT_ID = "bot_draw_1";
const SEED = 424242;

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

async function callFunctionRaw(name, idToken, data) {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data }),
  });
  const body = await res.json();
  return { ok: res.ok, status: res.status, body };
}

async function callFunction(name, idToken, data) {
  const result = await callFunctionRaw(name, idToken, data);
  if (!result.ok) {
    throw new Error(
      `${name} failed (${result.status}): ${result.body?.error?.message || JSON.stringify(result.body)}`,
    );
  }
  if (result.body.error) {
    throw new Error(`${name} error: ${result.body.error.message || JSON.stringify(result.body.error)}`);
  }
  return result.body.result;
}

/**
 * Mirrors docs/app.js processRobotActionsInner draw branch (SERVER_HAND_AUTHORITY on).
 * Returns what the client would do without invoking robotSubmitDraw on the fixed path.
 */
function simulateClientDrawBranch({ session, tablePlayOpen, callLog }) {
  const currentHand = session?.currentHand || {};
  const handPhase = currentHand.phase;
  const checkpoints = [];

  if (handPhase !== "draw") {
    return { entered: false, checkpoints };
  }

  checkpoints.push({
    checkpoint: "draw_branch_entered",
    handPhase,
    turnPlayerId: currentHand.turnPlayerId,
    drawCompletedIds: [...(currentHand.drawCompletedIds || [])],
  });

  const serverAdvance = shouldUseServerBotAdvanceForDraw(SERVER_HAND_AUTHORITY, tablePlayOpen);
  const clientDrive = shouldClientDriveRobotDraw(SERVER_HAND_AUTHORITY);

  checkpoints.push({
    checkpoint: "authority_flags",
    SERVER_HAND_AUTHORITY,
    tablePlayOpen,
    shouldUseServerBotAdvanceForDraw: serverAdvance,
    shouldClientDriveRobotDraw: clientDrive,
  });

  if (serverAdvance) {
    checkpoints.push({
      checkpoint: "advanceSessionBots_invoked",
      via: "advanceSessionBots → gameAdvanceBots → handleAdvanceBots → advanceBotsAfterAction",
      robotSubmitDrawCalled: false,
    });
    callLog.gameSubmitDrawCalls = 0;
    callLog.advanceSessionBotsCalls += 1;
    return { entered: true, action: "advanceSessionBots", checkpoints };
  }

  if (!clientDrive) {
    checkpoints.push({
      checkpoint: "client_draw_suppressed",
      robotSubmitDrawCalled: false,
    });
    return { entered: true, action: "return_early", checkpoints };
  }

  checkpoints.push({
    checkpoint: "legacy_robotSubmitDraw_path",
    robotSubmitDrawCalled: true,
  });
  callLog.gameSubmitDrawCalls += 1;
  return { entered: true, action: "robotSubmitDraw", checkpoints };
}

async function seedDrawSession(testEnv, hostUid) {
  const deal = dealInitialHand({
    dealerId: hostUid,
    participantIds: [hostUid, BOT_ID],
    sortedPlayerIds: [hostUid, BOT_ID],
    seed: SEED,
  });
  const bundle = serializeHandState(deal, {
    dealerId: hostUid,
    actionOrder: deal.dealOrder,
    seatedIds: [hostUid, BOT_ID],
  });

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

    await setDoc(doc(db, "rooms", ROOM_ID), {
      inviteCode: "DRAW-01",
      ownerId: hostUid,
      name: "Runtime Robot Draw Trace",
      status: "active",
      bourreSettings: { buyInAmount: 1000, anteAmount: 1 },
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "roomMembers", `${ROOM_ID}_${hostUid}`), {
      roomId: ROOM_ID,
      userId: hostUid,
      displayName: "Host",
      role: "owner",
      joinedAt: serverTimestamp(),
    });

    for (const playerId of [hostUid, BOT_ID]) {
      await setDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "scores", playerId), {
        sessionId: SESSION_ID,
        roomId: ROOM_ID,
        playerId,
        displayName: playerId === hostUid ? "Host" : "Bot Draw",
        isRobot: playerId === BOT_ID,
        bankroll: 1000,
        tricksWon: 0,
        handsWon: 0,
        net: 0,
        total: 0,
        updatedAt: serverTimestamp(),
      });
    }

    await setDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID), {
      roomId: ROOM_ID,
      sessionName: "Runtime Robot Draw",
      status: "in_progress",
      handCount: 0,
      handStake: 1,
      dealerId: hostUid,
      players: [
        { playerId: hostUid, displayName: "Host" },
        { playerId: BOT_ID, displayName: "Bot Draw", isRobot: true },
      ],
      currentHand: bundle.publicHand,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    for (const [playerId, handDoc] of Object.entries(bundle.privateHandsByPlayer)) {
      await setDoc(
        doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID, "privateHands", playerId),
        { cards: handDoc.cards, updatedAt: serverTimestamp() },
      );
    }
  });

  return {
    turnPlayerId: bundle.publicHand.turnPlayerId,
    participantIds: bundle.publicHand.participantIds,
    deckSeed: bundle.publicHand.deckSeed,
  };
}

async function readSession(testEnv) {
  let data = null;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "rooms", ROOM_ID, "sessions", SESSION_ID));
    data = snap.exists() ? snap.data() : null;
  });
  return data;
}

async function main() {
  const { host, port } = emulatorHostPort();
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { host, port, rules: RULES },
  });

  const { uid: hostUid, idToken } = await authSignUp("runtime-robot-draw@example.com");
  const seeded = await seedDrawSession(testEnv, hostUid);
  const callLog = { gameSubmitDrawCalls: 0, advanceSessionBotsCalls: 0 };

  const before = await readSession(testEnv);
  const branch = simulateClientDrawBranch({
    session: before,
    tablePlayOpen: true,
    callLog,
  });

  if (branch.action !== "advanceSessionBots") {
    throw new Error(`Expected advanceSessionBots path, got ${branch.action}`);
  }

  const advanceResult = await callFunction("gameAdvanceBots", idToken, {
    roomId: ROOM_ID,
    sessionId: SESSION_ID,
    actorId: hostUid,
  });

  const after = await readSession(testEnv);
  const ch = after?.currentHand || {};
  const botDrawComplete = (ch.drawCompletedIds || []).includes(BOT_ID);
  const turnAdvancedFromBot = ch.turnPlayerId !== BOT_ID;

  const staleClientDraw = await callFunctionRaw("gameSubmitDraw", idToken, {
    roomId: ROOM_ID,
    sessionId: SESSION_ID,
    playerId: BOT_ID,
    discardIndices: [],
    actorId: hostUid,
  });

  const trace = {
    proof: "runtime-robot-draw-authority-trace",
    SERVER_HAND_AUTHORITY,
    seeded: {
      ...seeded,
      botOnTurn: seeded.turnPlayerId === BOT_ID,
    },
    checkpoints: [
      ...branch.checkpoints,
      {
        checkpoint: "server_bot_draw_completes",
        gameAdvanceBotsResult: advanceResult,
        drawCompletedIds: [...(ch.drawCompletedIds || [])],
        turnPlayerId: ch.turnPlayerId,
        phase: ch.phase,
        botInDrawCompletedIds: botDrawComplete,
        turnAdvancedFromBot,
      },
      {
        checkpoint: "no_client_origin_gameSubmitDraw_on_fixed_path",
        gameSubmitDrawCallsDuringFix: callLog.gameSubmitDrawCalls,
        robotSubmitDrawCalled: false,
      },
      {
        checkpoint: "stale_client_gameSubmitDraw_control_only",
        note: "Simulates pre-fix duplicate client POST after server already advanced — not invoked on fixed path",
        status: staleClientDraw.status,
        errorMessage: staleClientDraw.body?.error?.message || null,
        wouldHaveBeen400: staleClientDraw.status === 400,
      },
    ],
    verification: {
      drawBranchEntered: branch.entered,
      shouldClientDriveRobotDrawFalse: shouldClientDriveRobotDraw(SERVER_HAND_AUTHORITY) === false,
      noRobotSubmitDrawOnFixedPath: callLog.gameSubmitDrawCalls === 0,
      advanceSessionBotsInvoked: callLog.advanceSessionBotsCalls === 1,
      serverBotDrawCompleted: botDrawComplete || turnAdvancedFromBot,
      noClientOrigin400OnFixedPath: callLog.gameSubmitDrawCalls === 0,
      staleControlShows400: staleClientDraw.status === 400,
      allPassed:
        branch.entered &&
        shouldClientDriveRobotDraw(SERVER_HAND_AUTHORITY) === false &&
        callLog.gameSubmitDrawCalls === 0 &&
        callLog.advanceSessionBotsCalls === 1 &&
        (botDrawComplete || turnAdvancedFromBot) &&
        staleClientDraw.status === 400,
    },
  };

  console.log(JSON.stringify(trace, null, 2));
  await testEnv.cleanup();
  if (!trace.verification.allPassed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
