import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  BOT_ADVANCE_DEBOUNCE_MS,
  BOT_PLAY_DELAY_MAX_MS,
  BOT_PLAY_DELAY_MIN_MS,
  antePresentationDurationMs,
  antePresentationWorstCaseDurationMs,
  buildAnteCoinDelayPlan,
  clearAntePlanCacheForTests,
  createBotPlayDelayState,
  pickBotPlayDelayMs,
  resolveBotAdvanceDelayMs,
} from "./botActionTiming";

describe("botActionTiming", () => {
  beforeEach(() => {
    clearAntePlanCacheForTests();
  });

  it("play timing uses random 250–700 ms window", () => {
    const picked = pickBotPlayDelayMs(3, () => 0.5);
    assert.ok(picked.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(picked.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
  });

  it("draw timing uses shared debounce helper", () => {
    const state = createBotPlayDelayState();
    const draw = resolveBotAdvanceDelayMs({
      handPhase: "draw",
      playDelayState: state,
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
    });
    assert.equal(draw.delayMs, BOT_ADVANCE_DEBOUNCE_MS);
    assert.equal(draw.handPhase, "draw");
  });

  it("pass timing uses shared debounce helper", () => {
    const state = createBotPlayDelayState();
    const pass = resolveBotAdvanceDelayMs({
      handPhase: "decision",
      playDelayState: state,
      ctx: { handNumber: 1, trickNumber: 0, turnPlayerId: "bot_2" },
      nowMs: 0,
    });
    assert.equal(pass.delayMs, BOT_ADVANCE_DEBOUNCE_MS);
  });

  it("ante timing uses play-style random think per seat", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 3,
      playerIds: ["bot_a", "bot_b", "human_1"],
      rng: () => 0.5,
    });
    assert.equal(plan.thinkBeforeMs.length, 3);
    for (const ms of plan.thinkBeforeMs) {
      assert.ok(ms >= BOT_PLAY_DELAY_MIN_MS);
      assert.ok(ms <= BOT_PLAY_DELAY_MAX_MS);
    }
    assert.ok(plan.totalDurationMs > plan.totalThinkMs);
  });

  it("ante plan is stable for the same hand and seats", () => {
    const first = buildAnteCoinDelayPlan({
      handNumber: 9,
      playerIds: ["p1", "p2"],
    });
    const second = buildAnteCoinDelayPlan({
      handNumber: 9,
      playerIds: ["p1", "p2"],
    });
    assert.deepEqual(first.thinkBeforeMs, second.thinkBeforeMs);
    assert.equal(first.totalDurationMs, second.totalDurationMs);
  });

  it("ante presentation duration exceeds fixed stagger for multi-seat hands", () => {
    const playerIds = ["a", "b", "c", "d"];
    const duration = antePresentationDurationMs(4, playerIds, false);
    const oldFixedStagger = 3 * 380 + 220 + 80;
    assert.ok(duration >= oldFixedStagger);
  });

  it("ante resolve path uses play delay policy not debounce", () => {
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    const ante = resolveBotAdvanceDelayMs({
      handPhase: "ante",
      playDelayState: state,
      ctx: { handNumber: 2, turnPlayerId: "bot_1" },
      nowMs: 0,
    });
    assert.equal(ante.handPhase, "ante");
    assert.ok(ante.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(ante.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
  });

  it("worst-case ante duration covers max think window", () => {
    const worst = antePresentationWorstCaseDurationMs(4, false);
    assert.ok(worst >= 4 * BOT_PLAY_DELAY_MAX_MS);
  });
});
