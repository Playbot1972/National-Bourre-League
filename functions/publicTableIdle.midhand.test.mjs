import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyDrawFold, applyDecisionPass, HAND_PHASE } from "./vendor/game-engine.js";
import {
  isIdleSitOutBlockingEnrollment,
  resolveIdleSitOutMidHandAction,
} from "./publicTableIdle.js";

const root = dirname(fileURLToPath(import.meta.url));
const NOW = Date.now();

function drawSession(turnPlayerId = "human_a") {
  return {
    status: "in_progress",
    publicTable: true,
    currentHand: {
      phase: HAND_PHASE.DRAW,
      turnPlayerId,
      participantIds: ["human_a", "bot_b"],
      actionOrder: ["human_a", "bot_b"],
      drawCompletedIds: [],
      foldedIds: [],
      tricksByPlayer: { human_a: 0, bot_b: 0 },
      trumpSuit: "hearts",
      deckSeed: 42,
      deckNextIndex: 10,
    },
  };
}

function decisionSession(turnPlayerId = "human_a") {
  return {
    status: "in_progress",
    publicTable: true,
    currentHand: {
      phase: HAND_PHASE.DECISION,
      participantIds: [],
      tricksByPlayer: {},
      handDecision: {
        active: true,
        orderedPlayerIds: ["human_a", "bot_b"],
        currentIndex: turnPlayerId === "human_a" ? 0 : 1,
        turnDeadlineMs: NOW + 12_000,
        playingIds: [],
        passedIds: [],
        plannedDiscards: {},
      },
    },
  };
}

function playSession(turnPlayerId = "human_a") {
  return {
    status: "in_progress",
    publicTable: true,
    currentHand: {
      phase: HAND_PHASE.PLAY,
      turnPlayerId,
      participantIds: ["human_a", "bot_b"],
      actionOrder: ["human_a", "bot_b"],
      tricksByPlayer: { human_a: 0, bot_b: 0 },
      currentTrick: { cards: [], trickNumber: 1, leaderId: "human_a" },
      trumpSuit: "hearts",
    },
  };
}

describe("resolveIdleSitOutMidHandAction", () => {
  it("returns draw_fold when sitOut human holds draw turn", () => {
    const session = drawSession();
    const scoreById = { human_a: { sitOut: true }, bot_b: {} };
    const action = resolveIdleSitOutMidHandAction(session, scoreById);
    assert.deepEqual(action, {
      action: "draw_fold",
      playerId: "human_a",
      phase: "draw",
    });
  });

  it("returns decision_pass when sitOut human holds pagat decision turn", () => {
    const session = decisionSession();
    const scoreById = { human_a: { sitOut: true }, bot_b: {} };
    const action = resolveIdleSitOutMidHandAction(session, scoreById);
    assert.deepEqual(action, {
      action: "decision_pass",
      playerId: "human_a",
      phase: "decision",
    });
  });

  it("returns play_bot when sitOut human holds play turn", () => {
    const session = playSession();
    const scoreById = { human_a: { sitOut: true }, bot_b: {} };
    const action = resolveIdleSitOutMidHandAction(session, scoreById);
    assert.deepEqual(action, {
      action: "play_bot",
      playerId: "human_a",
      phase: "play",
    });
  });

  it("returns null for non-sitOut humans on turn", () => {
    const session = drawSession();
    const scoreById = { human_a: { bankroll: 100 }, bot_b: {} };
    assert.equal(resolveIdleSitOutMidHandAction(session, scoreById), null);
  });

  it("returns null for sitOut bot turn holder", () => {
    const session = drawSession("bot_b");
    const scoreById = { human_a: { sitOut: true }, bot_b: { sitOut: true } };
    assert.equal(resolveIdleSitOutMidHandAction(session, scoreById), null);
  });

  it("returns null for pre-deal enrollment (handled by enrollment sit-out path)", () => {
    const session = {
      status: "in_progress",
      publicTable: true,
      handEnrollment: {
        active: true,
        orderedPlayerIds: ["human_a", "bot_b"],
        currentIndex: 0,
        enrolledIds: [],
        declinedIds: [],
        turnDeadlineMs: NOW + 12_000,
      },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    const scoreById = { human_a: { sitOut: true }, bot_b: {} };
    assert.equal(resolveIdleSitOutMidHandAction(session, scoreById), null);
    assert.equal(isIdleSitOutBlockingEnrollment(session.handEnrollment, scoreById), true);
  });
});

describe("idle mid-hand action effects", () => {
  it("draw_fold advances turn away from sitOut human", () => {
    const session = {
      status: "in_progress",
      publicTable: true,
      currentHand: {
        phase: HAND_PHASE.DRAW,
        turnPlayerId: "human_a",
        participantIds: ["human_a", "bot_b", "bot_c"],
        actionOrder: ["human_a", "bot_b", "bot_c"],
        drawCompletedIds: [],
        foldedIds: [],
        tricksByPlayer: { human_a: 0, bot_b: 0, bot_c: 0 },
        trumpSuit: "hearts",
        deckSeed: 42,
        deckNextIndex: 10,
      },
    };
    const hand = session.currentHand;
    const foldResult = applyDrawFold(hand, hand.actionOrder, "human_a");
    assert.equal(foldResult.kind, "continue");
    assert.ok(!foldResult.publicHand.participantIds.includes("human_a"));
    assert.notEqual(foldResult.publicHand.turnPlayerId, "human_a");
    assert.ok(foldResult.publicHand.drawCompletedIds?.includes("human_a"));
  });

  it("decision_pass advances pagat decision away from sitOut human", () => {
    const session = decisionSession();
    const hand = session.currentHand;
    const dealContext = {
      dealerId: "bot_b",
      sortedPlayerIds: ["human_a", "bot_b"],
      dealingRule: null,
    };
    const step = applyDecisionPass(hand, hand.handDecision, "human_a", dealContext);
    assert.equal(step.kind, "continue");
    assert.ok(step.handDecision.passedIds.includes("human_a"));
    assert.notEqual(
      step.handDecision.orderedPlayerIds[step.handDecision.currentIndex],
      "human_a",
    );
  });
});

describe("advanceBotsAfterAction idle mid-hand wiring", () => {
  it("invokes resolveIdleSitOutMidHandAction before bot hints on public tables", () => {
    const src = readFileSync(join(root, "gameHandlers.js"), "utf8");
    const start = src.indexOf("export async function advanceBotsAfterAction");
    assert.ok(start >= 0);
    const block = src.slice(start, start + 4200);
    assert.match(block, /resolveIdleSitOutMidHandAction/);
    assert.match(block, /shouldEnforcePublicTableIdle/);
    assert.match(block, /\[idle-midhand\]/);
    assert.match(block, /case "draw_fold":[\s\S]*handleFoldDraw/);
    assert.match(block, /case "decision_pass":[\s\S]*handleSetHandParticipation/);
    assert.match(block, /case "play_bot":[\s\S]*executeBotPlay/);
    const midHandIdx = block.indexOf("resolveIdleSitOutMidHandAction");
    const hintIdx = block.indexOf("resolveBotAdvanceHint");
    assert.ok(midHandIdx >= 0 && hintIdx > midHandIdx, "mid-hand idle runs before bot hints");
  });
});
