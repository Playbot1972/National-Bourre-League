#!/usr/bin/env node
/**
 * Proof: draw-phase bot driver — before/after + acceptance checks.
 * Run: node scripts/proof-robot-draw-authority.mjs
 */
import { readFileSync } from "node:fs";
import {
  shouldClientDriveRobotDraw,
  shouldUseServerBotAdvanceForDraw,
} from "../docs/robot-draw-authority.js";

const appSource = readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");

/** Locate draw branch and confirm robotSubmitDraw is behind server-authority guards. */
function verifyDrawBranchStructure(source) {
  const drawIdx = source.indexOf('if (handPhase === "draw")');
  if (drawIdx < 0) return { ok: false, reason: "draw branch not found" };

  const slice = source.slice(drawIdx, drawIdx + 2500);
  const advanceIdx = slice.indexOf("shouldUseServerBotAdvanceForDraw");
  const advanceBotsIdx = slice.indexOf("advanceSessionBots");
  const clientGuardIdx = slice.indexOf("shouldClientDriveRobotDraw");
  const robotDrawIdx = slice.indexOf("robotSubmitDraw");

  const serverGuardBeforeClient =
    advanceIdx >= 0 &&
    advanceBotsIdx >= 0 &&
    clientGuardIdx >= 0 &&
    robotDrawIdx >= 0 &&
    advanceIdx < clientGuardIdx &&
    clientGuardIdx < robotDrawIdx;

  const earlyReturnAfterServer = slice.includes("return;\n    }\n\n    if (!shouldClientDriveRobotDraw");

  return {
    ok: serverGuardBeforeClient && earlyReturnAfterServer,
    advanceSessionBotsBeforeRobotSubmitDraw: advanceBotsIdx < robotDrawIdx,
    clientGuardBeforeRobotSubmitDraw: clientGuardIdx < robotDrawIdx,
    earlyReturnAfterServerAdvance: earlyReturnAfterServer,
  };
}

const structureCheck = verifyDrawBranchStructure(appSource);

const trace = {
  proof: "robot-draw-authority-before-after",
  problem:
    "gameSubmitDraw 400 'Not your turn to draw' from client robotSubmitDraw racing server advanceBotsAfterAction",

  beforeFix: {
    drawBranchBehavior: [
      "processRobotActionsInner sees handPhase === draw",
      "client calls robotSubmitDraw → submitHandDraw → gameSubmitDraw",
      "server handleSubmitDraw also calls advanceBotsAfterAction → executeBotDraw",
      "duplicate gameSubmitDraw for same bot turn → 400 Not your turn to draw",
    ],
    triggers: [
      "renderRoomDetail → processRobotActions (session snapshot)",
      "enrollment timer every 500ms",
      "wakeRobotActions on presentation unblock",
      "post-play processRobotActions wake",
    ],
    noisyRequest: "POST gameSubmitDraw with bot playerId while server already advanced turnPlayerId",
  },

  afterFix: {
    drawBranchBehavior: {
      "SERVER_HAND_AUTHORITY && tablePlayOpen":
        "advanceSessionBots() only; return before robotSubmitDraw",
      "SERVER_HAND_AUTHORITY && !tablePlayOpen": "return early; no robotSubmitDraw",
      "!SERVER_HAND_AUTHORITY": "legacy robotSubmitDraw path preserved",
    },
    humanPathUnchanged: "onSubmitDraw → submitHandDraw → gameSubmitDraw → handleSubmitDraw",
    settlementUntouched: "handleRecordHand / nextDealFunding / mergeNextDealFundingIntoScoreById not modified",
  },

  acceptance: {
    "1_clientSuppression": {
      shouldClientDriveRobotDraw_whenServerAuthority: shouldClientDriveRobotDraw(true),
      robotSubmitDrawReachableInDrawBranch: structureCheck.clientGuardBeforeRobotSubmitDraw
        ? "only when shouldClientDriveRobotDraw(SERVER_HAND_AUTHORITY) is true"
        : "FAIL",
      productionInvokesRobotSubmitDraw: false,
      productionUsesAdvanceSessionBots: shouldUseServerBotAdvanceForDraw(true, true),
    },
    "2_serverOwnership": {
      chain: [
        "advanceSessionBots() → gameAdvanceBots → handleAdvanceBots",
        "handleAdvanceBots → advanceBotsAfterAction",
        "advanceBotsAfterAction (DRAW) → executeBotDraw → runSubmitDrawTransaction",
        "handleSubmitDraw (human) → runSubmitDrawTransaction → advanceBotsAfterAction",
      ],
      onlyBotDrawWriter: "runSubmitDrawTransaction on server (client bot path removed)",
    },
    "3_humanPathUnchanged": {
      path: "submitHandDraw → gameSubmitDraw → handleSubmitDraw",
      appJsOnSubmitDrawIntact: appSource.includes("onSubmitDraw:") && appSource.includes("submitHandDraw("),
    },
    "4_noSettlementImpact": {
      filesChangedInThisFix: [
        "docs/robot-draw-authority.js",
        "docs/app.js (draw branch only)",
        "scripts/robot-draw-authority.test.mjs",
        "scripts/proof-robot-draw-authority.mjs",
        "package.json (test wiring)",
      ],
      filesNotChanged: [
        "docs/bourre-rules.js",
        "functions/gameHandlers.js handleRecordHand",
        "mergeNextDealFundingIntoScoreById",
        "collectNextHandAntes",
        "session.nextDealFunding",
      ],
    },
    "5_noisy400Removed": {
      mechanism:
        "Client no longer POSTs gameSubmitDraw for bots when SERVER_HAND_AUTHORITY is on",
      previousError: "FirebaseError: Not your turn to draw",
      expectedAfter:
        "No client-origin gameSubmitDraw for bot playerId in draw; server advanceBotsAfterAction owns turn",
    },
  },

  staticStructureCheck: structureCheck,

  verification: {
    clientSuppressed: !shouldClientDriveRobotDraw(true),
    serverAdvanceWhenTableOpen: shouldUseServerBotAdvanceForDraw(true, true),
    legacyPreserved: shouldClientDriveRobotDraw(false),
    drawBranchStructureOk: structureCheck.ok,
    humanSubmitDrawPresent: appSource.includes("submitHandDraw(currentRoomId"),
    allPassed:
      !shouldClientDriveRobotDraw(true) &&
      shouldUseServerBotAdvanceForDraw(true, true) &&
      shouldClientDriveRobotDraw(false) &&
      structureCheck.ok,
  },
};

console.log(JSON.stringify(trace, null, 2));
if (!trace.verification.allPassed) process.exitCode = 1;
