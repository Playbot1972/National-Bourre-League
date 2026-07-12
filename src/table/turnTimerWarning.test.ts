import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TURN_TIMER_WARNING_START_ELAPSED_MS,
  shouldStartTurnTimerWarning,
  turnCountdownElapsedMs,
  turnTimerWarningDelayMs,
} from "./turnTimerWarning";

describe("turnTimerWarning", () => {
  it("does not start before 15 elapsed seconds", () => {
    const ringStart = 1_000_000;
    const at14s = ringStart + 14_999;
    assert.equal(turnTimerWarningDelayMs(ringStart, at14s), 1);
    assert.equal(shouldStartTurnTimerWarning(turnCountdownElapsedMs(ringStart, at14s), false), false);
  });

  it("starts once after 15 elapsed seconds", () => {
    const ringStart = 0;
    const at15s = TURN_TIMER_WARNING_START_ELAPSED_MS;
    assert.equal(turnTimerWarningDelayMs(ringStart, at15s), 0);
    assert.equal(shouldStartTurnTimerWarning(at15s, false), true);
    assert.equal(shouldStartTurnTimerWarning(at15s, true), false);
  });

  it("schedules remaining delay from ring start", () => {
    const ringStart = 5_000;
    const now = ringStart + 4_000;
    assert.equal(turnTimerWarningDelayMs(ringStart, now), 11_000);
  });
});
