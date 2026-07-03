import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOT_PLAY_DELAY_MIN_MS,
  BOT_PLAY_DELAY_MAX_MS,
  botPlayTurnKey,
  createBotPlayDelayState,
  resolveBotAdvanceDelayMs,
} from "../docs/bot-play-delay.js";

describe("bot play delay", () => {
  it("botPlayTurnKey is stable per hand/trick/turn", () => {
    assert.equal(
      botPlayTurnKey({ handNumber: 2, trickNumber: 3, turnPlayerId: "bot_a" }),
      "2:3:bot_a",
    );
  });

  it("picks a fixed random delay per turn key", () => {
    let n = 0;
    const state = createBotPlayDelayState({ rng: () => (n += 0.25) });
    const first = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 10_000,
      lastCompletedAtMs: 0,
      trickIntervalMs: 0,
    });
    const retry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 10_500,
      lastCompletedAtMs: 0,
      trickIntervalMs: 0,
    });
    assert.equal(first.chosenDelayMs, retry.chosenDelayMs);
    assert.ok(first.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(first.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
    assert.equal(retry.delayMs, first.chosenDelayMs - 500);
  });

  it("never schedules before 1s from turn eligibility on retries", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const chosen = BOT_PLAY_DELAY_MIN_MS;
    const at = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: 0,
      lastCompletedAtMs: -10_000,
      trickIntervalMs: 0,
    });
    assert.equal(at.chosenDelayMs, chosen);
    assert.equal(at.delayMs, chosen);

    const earlyRetry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: 500,
      lastCompletedAtMs: -10_000,
      trickIntervalMs: 0,
    });
    assert.equal(earlyRetry.delayMs, chosen - 500);
    assert.ok(earlyRetry.delayMs >= 500);
  });

  it("respects trick interval floor in play phase", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const result = resolveBotAdvanceDelayMs({
      handPhase: "play",
      playDelayState: state,
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 5_000,
      lastCompletedAtMs: 4_000,
      trickIntervalMs: 3_000,
    });
    assert.equal(result.trickGapRemainingMs, 2_000);
    assert.equal(result.delayMs, 2_000);
  });

  it("clears delay map when hand number changes", () => {
    let i = 0;
    const state = createBotPlayDelayState({ rng: () => (i++ % 2) * 0.99 });
    const a = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
      lastCompletedAtMs: 0,
      trickIntervalMs: 0,
    });
    const b = state.resolvePlayDelayMs({
      handNumber: 2,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
      lastCompletedAtMs: 0,
      trickIntervalMs: 0,
    });
    assert.notEqual(a.chosenDelayMs, b.chosenDelayMs);
  });

  it("non-play phases keep short debounce", () => {
    const state = createBotPlayDelayState();
    const draw = resolveBotAdvanceDelayMs({
      handPhase: "draw",
      playDelayState: state,
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 1_000,
      lastCompletedAtMs: 0,
      trickIntervalMs: 3_000,
    });
    assert.equal(draw.delayMs, 150);
  });
});
