import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it, beforeEach } from "node:test";
import {
  BOT_ADVANCE_DEBOUNCE_MS,
  BOT_PLAY_DELAY_MAX_MS,
  BOT_PLAY_DELAY_MIN_MS,
  antePresentationDurationMs,
  antePresentationWorstCaseDurationMs,
  anteThinkDurationMs,
  anteThinkWorstCaseDurationMs,
  anteVisualPresentationDurationMs,
  botPlayTurnKey,
  buildAnteCoinDelayPlan,
  clearAntePlanCacheForTests,
  createBotPlayDelayState,
  isBotPlayThinkPhase,
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

  it("ante presentation duration is think-only (no travel/settle)", () => {
    const playerIds = ["a", "b", "c", "d"];
    const duration = antePresentationDurationMs(4, playerIds, false);
    const plan = buildAnteCoinDelayPlan({ handNumber: 4, playerIds });
    assert.equal(duration, plan.totalThinkMs);
    assert.ok(plan.totalDurationMs > plan.totalThinkMs);
    assert.ok(duration >= playerIds.length * BOT_PLAY_DELAY_MIN_MS);
    assert.ok(duration <= playerIds.length * BOT_PLAY_DELAY_MAX_MS);
  });

  it("ante think and visual durations split completion from GSAP", () => {
    const playerIds = ["p1", "p2", "p3"];
    const think = anteThinkDurationMs(5, playerIds, false);
    const visual = anteVisualPresentationDurationMs(5, playerIds, false);
    assert.ok(think >= playerIds.length * BOT_PLAY_DELAY_MIN_MS);
    assert.ok(think <= playerIds.length * BOT_PLAY_DELAY_MAX_MS);
    assert.ok(visual > think);
  });

  it("ante resolve path uses resolvePlayDelayMs not debounce", () => {
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    const ante = resolveBotAdvanceDelayMs({
      handPhase: "ante",
      playDelayState: state,
      ctx: { handNumber: 2, turnPlayerId: "bot_1" },
      nowMs: 0,
    });
    assert.equal(ante.handPhase, "ante");
    assert.equal(ante.turnKey, botPlayTurnKey({ handNumber: 2, trickNumber: 0, turnPlayerId: "bot_1" }));
    assert.ok(ante.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(ante.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
    assert.equal(ante.elapsedSinceTurnMs, 0);
  });

  it("reveal phase shares play think scheduler", () => {
    assert.equal(isBotPlayThinkPhase("reveal"), true);
    const state = createBotPlayDelayState({ rng: () => 0 });
    const reveal = resolveBotAdvanceDelayMs({
      handPhase: "reveal",
      playDelayState: state,
      ctx: { handNumber: 1, turnPlayerId: "bot_2" },
      nowMs: 0,
    });
    assert.equal(reveal.delayMs, BOT_PLAY_DELAY_MIN_MS);
    assert.equal(reveal.turnKey, "1:0:bot_2");
  });

  it("ante presentation plan matches per-seat play delay cache keys", () => {
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    const plan = buildAnteCoinDelayPlan({
      handNumber: 7,
      playerIds: ["bot_a", "bot_b"],
      rng: () => 0.5,
    });
    for (let i = 0; i < plan.playerIds.length; i += 1) {
      const playerId = plan.playerIds[i]!;
      const fromPlay = state.resolvePlayDelayMs({
        handNumber: 7,
        trickNumber: 0,
        turnPlayerId: playerId,
        remainingHandCount: 5,
        nowMs: 0,
      });
      assert.equal(plan.thinkBeforeMs[i], fromPlay.chosenDelayMs);
    }
  });

  it("no ante-specific timing helper remains in module exports", () => {
    const source = readFileSync(new URL("./botActionTiming.ts", import.meta.url), "utf8");
    assert.doesNotMatch(source, /resolveAntePostDelayMs/);
    assert.doesNotMatch(source, /antePostTurnKey/);
  });

  it("worst-case ante think duration covers max think window", () => {
    const worst = antePresentationWorstCaseDurationMs(4, false);
    assert.ok(worst >= 4 * BOT_PLAY_DELAY_MAX_MS + 4 * 220);
  });

  it("worst-case ante think-only duration excludes travel", () => {
    const thinkWorst = anteThinkWorstCaseDurationMs(4, false);
    assert.equal(thinkWorst, 4 * BOT_PLAY_DELAY_MAX_MS);
  });
});
