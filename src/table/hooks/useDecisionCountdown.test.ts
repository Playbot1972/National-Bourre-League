import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeDecisionCountdown,
  DECISION_COUNTDOWN_MS,
  DECISION_COUNTDOWN_SECONDS,
} from "./useDecisionCountdown";

describe("useDecisionCountdown helpers", () => {
  it("uses a 15-second decision window", () => {
    assert.equal(DECISION_COUNTDOWN_SECONDS, 15);
    assert.equal(DECISION_COUNTDOWN_MS, 15_000);
  });

  it("computeDecisionCountdown expires at server deadline", () => {
    const deadline = 10_000;
    const active = computeDecisionCountdown(9_000, true, deadline);
    assert.equal(active.secondsLeft, 1);
    assert.ok(active.fraction > 0);
    const expired = computeDecisionCountdown(10_000, true, deadline);
    assert.equal(expired.expired, true);
    assert.equal(expired.fraction, 0);
  });

  it("manual cancel path is represented by inactive countdown", () => {
    const off = computeDecisionCountdown(20_000, false, 30_000);
    assert.equal(off.fraction, 0);
    assert.equal(off.expired, false);
  });
});
