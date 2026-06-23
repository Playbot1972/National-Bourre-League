import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOT_DECISION_DELAY_MAX_MS,
  BOT_DECISION_DELAY_MIN_MS,
  botDecisionClockKey,
  computeBotDecisionCountdown,
  randomBotDecisionDelayMs,
  startBotDecisionClock,
} from "./botDecisionClock";

describe("botDecisionClock", () => {
  it("randomBotDecisionDelayMs stays within 0.4s–2.5s", () => {
    for (let i = 0; i < 50; i += 1) {
      const ms = randomBotDecisionDelayMs(() => i / 50);
      assert.ok(ms >= BOT_DECISION_DELAY_MIN_MS);
      assert.ok(ms <= BOT_DECISION_DELAY_MAX_MS);
    }
  });

  it("computeBotDecisionCountdown drains bot ring before expiry", () => {
    const clock = startBotDecisionClock("bot_a", 1_000, () => 0);
    assert.equal(clock.totalMs, BOT_DECISION_DELAY_MIN_MS);
    const mid = computeBotDecisionCountdown(1_000 + clock.totalMs / 2, clock);
    assert.ok(mid.fraction > 0 && mid.fraction < 1);
    const end = computeBotDecisionCountdown(clock.resolveAtMs, clock);
    assert.equal(end.expired, true);
    assert.equal(end.fraction, 0);
  });

  it("botDecisionClockKey scopes to session hand and decision index", () => {
    assert.equal(botDecisionClockKey("s1", 3, 1), "s1:3:1");
  });
});
