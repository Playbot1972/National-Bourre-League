#!/usr/bin/env node
/**
 * Proof: single server-owner bot advancement path (step 3).
 * Run: node scripts/proof-bot-orchestrator.mjs
 */
import { readFileSync } from "node:fs";
import {
  shouldClientDriveBotsDirectly,
  shouldRequestServerBotAdvance,
} from "../docs/bot-orchestrator.js";

const appSource = readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");

function innerBranchCheck(source) {
  const idx = source.indexOf("function processRobotActionsInner");
  if (idx < 0) return { ok: false, reason: "processRobotActionsInner missing" };
  const slice = source.slice(idx, idx + 4000);
  const serverGate = slice.indexOf("shouldRequestServerBotAdvance");
  const schedule = slice.indexOf("scheduleServerBotAdvance");
  const legacyEnroll = slice.indexOf("setHandParticipation");
  return {
    ok:
      serverGate >= 0 &&
      schedule >= 0 &&
      (legacyEnroll < 0 || schedule < legacyEnroll),
    serverGateBeforeLegacy: legacyEnroll < 0 || schedule < legacyEnroll,
  };
}

const trace = {
  proof: "bot-orchestrator-single-owner",
  rootCause: {
    duplicatePaths: [
      "processRobotActionsInner called robotSubmitDraw / robotPlayCard / setHandParticipation on client while server advanceBotsAfterAction executed the same bot turns",
      "advanceSessionBots fired from enrollment branch AND draw branch AND every renderRoomDetail snapshot",
      "enrollment timer called client timeoutHandEnrollmentTurn while server handleTimeoutEnrollment also ran",
      "post-play processRobotActions raced server advanceBotsAfterAction after human gamePlayCard",
    ],
    symptom: "Duplicate gameSubmitDraw / gamePlayCard for bot seats → 400 Not your turn",
  },
  afterFix: {
    clientRole: "scheduleServerBotAdvance → advanceSessionBots (request only)",
    serverRole: "gameAdvanceBots → handleAdvanceBots → advanceBotsAfterAction (sole executor)",
    legacyPreserved: "!SERVER_HAND_AUTHORITY → client robotSubmitDraw / robotPlayCard unchanged",
    humanUnchanged: "onSubmitDraw / onPlayCard → submitHandDraw / playHandCard → Cloud Functions",
  },
  logging: {
    client: "[bot-orchestrator] schedule-request | request | complete | skip-request",
    firestore: "[bot-orchestrator] invoke-gameAdvanceBots | gameAdvanceBots-result",
    server: "[bot-advance] request | execute | skip | complete",
  },
  staticChecks: innerBranchCheck(appSource),
  authority: {
    shouldRequestServerBotAdvance: shouldRequestServerBotAdvance(true, true),
    shouldClientDriveBotsDirectly: shouldClientDriveBotsDirectly(true),
    legacyClientDrive: shouldClientDriveBotsDirectly(false),
  },
  allPassed:
    innerBranchCheck(appSource).ok &&
    shouldRequestServerBotAdvance(true, true) &&
    !shouldClientDriveBotsDirectly(true) &&
    shouldClientDriveBotsDirectly(false),
};

console.log(JSON.stringify(trace, null, 2));
if (!trace.allPassed) process.exitCode = 1;
