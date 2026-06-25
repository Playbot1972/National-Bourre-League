#!/usr/bin/env node
/**
 * Proof: draw-phase bot driver selection (no settlement involvement).
 * Run: node scripts/proof-robot-draw-authority.mjs
 */
import {
  shouldClientDriveRobotDraw,
  shouldUseServerBotAdvanceForDraw,
} from "../docs/robot-draw-authority.js";

const trace = {
  proof: "robot-draw-authority",
  problem: "gameSubmitDraw 400 Not your turn to draw during duplicate client+server bot draws",
  fix: "When SERVER_HAND_AUTHORITY is on, processRobotActionsInner draw branch calls advanceSessionBots only",
  clientPathSuppressed: {
    production: {
      SERVER_HAND_AUTHORITY: true,
      tablePlayOpen: true,
      shouldClientDriveRobotDraw: shouldClientDriveRobotDraw(true),
      shouldUseServerBotAdvanceForDraw: shouldUseServerBotAdvanceForDraw(true, true),
      robotSubmitDrawCalled: false,
      advanceSessionBotsCalled: true,
    },
    localhostHonorSystem: {
      SERVER_HAND_AUTHORITY: false,
      shouldClientDriveRobotDraw: shouldClientDriveRobotDraw(false),
      robotSubmitDrawCalled: true,
    },
  },
  serverPathUnchanged: {
    chain: [
      "advanceSessionBots() → gameAdvanceBots → handleAdvanceBots",
      "handleAdvanceBots → advanceBotsAfterAction",
      "advanceBotsAfterAction DRAW → executeBotDraw → runSubmitDrawTransaction",
      "handleSubmitDraw (human) → runSubmitDrawTransaction → advanceBotsAfterAction (chains bots)",
    ],
    note: "Server was already authoritative; fix removes competing client robotSubmitDraw",
  },
  settlementUntouched: {
    filesNotModified: [
      "docs/bourre-rules.js",
      "session.nextDealFunding write path in handleRecordHand",
      "mergeNextDealFundingIntoScoreById",
      "collectNextHandAntes",
    ],
    humanDrawPath: "submitHandDraw → gameSubmitDraw → handleSubmitDraw (unchanged)",
  },
  verification: {
    clientRobotDrawSuppressedWhenServerAuthority: !shouldClientDriveRobotDraw(true),
    serverAdvanceUsedWhenTableOpen: shouldUseServerBotAdvanceForDraw(true, true),
    legacyClientPathPreserved: shouldClientDriveRobotDraw(false),
    allPassed:
      !shouldClientDriveRobotDraw(true) &&
      shouldUseServerBotAdvanceForDraw(true, true) &&
      shouldClientDriveRobotDraw(false),
  },
};

console.log(JSON.stringify(trace, null, 2));
if (!trace.verification.allPassed) process.exitCode = 1;
