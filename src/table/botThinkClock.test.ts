import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOT_THINK_MAX_MS,
  BOT_THINK_MIN_MS,
  ensureBotThinkClock,
  isBotThinkClockBlocking,
  randomBotThinkDurationMs,
  resetBotThinkClock,
} from "./botThinkClock";

describe("botThinkClock", () => {
  it("randomBotThinkDurationMs stays within 0.4s–2.5s", () => {
    for (let i = 0; i < 50; i += 1) {
      const ms = randomBotThinkDurationMs(() => i / 50);
      assert.ok(ms >= BOT_THINK_MIN_MS);
      assert.ok(ms <= BOT_THINK_MAX_MS);
    }
  });

  it("blocks bot actions until the think window expires", () => {
    resetBotThinkClock();
    const clock = ensureBotThinkClock("hand:1:bot_a", "bot_a", 1_000, () => 0);
    assert.equal(clock.durationMs, BOT_THINK_MIN_MS);
    assert.equal(isBotThinkClockBlocking(1_000), true);
    assert.equal(isBotThinkClockBlocking(clock.resolveAtMs - 1), true);
    assert.equal(isBotThinkClockBlocking(clock.resolveAtMs), false);
  });

  it("reuses the clock for the same activity key", () => {
    resetBotThinkClock();
    const a = ensureBotThinkClock("k1", "bot_a", 100, () => 0.5);
    const b = ensureBotThinkClock("k1", "bot_a", 500, () => 0.99);
    assert.equal(a.durationMs, b.durationMs);
    assert.equal(a.startedAtMs, b.startedAtMs);
  });

  it("starts a fresh clock when activity changes", () => {
    resetBotThinkClock();
    ensureBotThinkClock("k1", "bot_a", 100, () => 0);
    const next = ensureBotThinkClock("k2", "bot_a", 200, () => 1);
    assert.equal(next.durationMs, BOT_THINK_MAX_MS);
    assert.equal(next.startedAtMs, 200);
  });
});
