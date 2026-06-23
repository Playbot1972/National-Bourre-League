import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DECISION_COUNTDOWN_MS,
  DECISION_COUNTDOWN_SECONDS,
  computeDecisionCountdown,
} from "./useDecisionCountdown";

describe("computeDecisionCountdown", () => {
  it("runs a 15 second window from server deadline", () => {
    const start = 10_000;
    const deadline = start + DECISION_COUNTDOWN_MS;
    const mid = computeDecisionCountdown(start + 5_000, true, deadline);
    assert.equal(mid.secondsLeft, 10);
    assert.ok(mid.fraction > 0.6 && mid.fraction < 0.7);
    assert.equal(mid.expired, false);

    const end = computeDecisionCountdown(deadline, true, deadline);
    assert.equal(end.secondsLeft, 0);
    assert.equal(end.fraction, 0);
    assert.equal(end.expired, true);
  });

  it("is inactive when the player cannot choose", () => {
    const state = computeDecisionCountdown(50_000, false, 65_000);
    assert.equal(state.secondsLeft, 0);
    assert.equal(state.fraction, 0);
    assert.equal(state.expired, false);
  });

  it("falls back to a fresh 15s window without a deadline", () => {
    const now = 1_000_000;
    const state = computeDecisionCountdown(now, true, null);
    assert.equal(state.secondsLeft, DECISION_COUNTDOWN_SECONDS);
    assert.equal(state.fraction, 1);
    assert.equal(state.expired, false);
  });
});
