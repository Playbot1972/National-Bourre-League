import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOT_DECISION_DELAY_MAX_MS,
  BOT_DECISION_DELAY_MIN_MS,
  botDecisionClockKey,
  computeBotDecisionCountdown,
  startBotDecisionClock,
} from "./botDecisionClock";

describe("botDecisionClock", () => {
  it("botDecisionClockKey scopes to session hand and turn index", () => {
    assert.equal(botDecisionClockKey("s1", 3, 1), "s1:3:1");
  });

  it("startBotDecisionClock picks a deadline within 400–2500ms", () => {
    const now = 1_000_000;
    const clock = startBotDecisionClock("bot_a", now);
    assert.equal(clock.playerId, "bot_a");
    const delay = clock.deadlineMs - now;
    assert.ok(delay >= BOT_DECISION_DELAY_MIN_MS);
    assert.ok(delay <= BOT_DECISION_DELAY_MAX_MS);
  });

  it("computeBotDecisionCountdown expires after the bot deadline", () => {
    const clock = { playerId: "bot_a", deadlineMs: 1_000_500 };
    assert.equal(computeBotDecisionCountdown(1_000_400, clock).expired, false);
    assert.equal(computeBotDecisionCountdown(1_000_500, clock).expired, true);
  });

  it("computeBotDecisionCountdown treats missing clock as expired", () => {
    assert.equal(computeBotDecisionCountdown(Date.now(), null).expired, true);
  });
});
