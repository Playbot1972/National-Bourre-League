import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TIE_RESULT_CONTINUE_GUARD_MAX_MS,
  TIE_RESULT_CONTINUE_GUARD_MIN_MS,
  TIE_RESULT_CONTINUE_GUARD_MS,
  TIE_RESULT_DEFAULT_MS,
  TIE_RESULT_MAX_MS,
  TIE_RESULT_MIN_MS,
  defaultTieResultDurationMs,
  getTieResultDurationMs,
  isTieContinueGuardComplete,
  tieResultAutoHideRemainingMs,
} from "./tieResultTiming";

describe("tieResultTiming", () => {
  it("clamps duration between min 5s and max 7s", () => {
    assert.equal(getTieResultDurationMs(""), TIE_RESULT_MIN_MS);
    assert.ok(getTieResultDurationMs("x".repeat(40)) >= TIE_RESULT_DEFAULT_MS);
    assert.equal(getTieResultDurationMs("x".repeat(500)), TIE_RESULT_MAX_MS);
  });

  it("exposes named constants", () => {
    assert.equal(TIE_RESULT_MIN_MS, 5_000);
    assert.equal(TIE_RESULT_DEFAULT_MS, 5_500);
    assert.equal(TIE_RESULT_MAX_MS, 7_000);
    assert.equal(TIE_RESULT_CONTINUE_GUARD_MIN_MS, 750);
    assert.equal(TIE_RESULT_CONTINUE_GUARD_MAX_MS, 1_000);
    assert.equal(TIE_RESULT_CONTINUE_GUARD_MS, 875);
    assert.equal(defaultTieResultDurationMs(), TIE_RESULT_DEFAULT_MS);
  });

  it("continue guard completes within 750ms–1s band", () => {
    const shownAt = 10_000;
    assert.equal(isTieContinueGuardComplete(shownAt, shownAt + 749), false);
    assert.equal(isTieContinueGuardComplete(shownAt, shownAt + TIE_RESULT_CONTINUE_GUARD_MS), true);
    assert.equal(isTieContinueGuardComplete(shownAt, shownAt + 1_000), true);
  });

  it("auto-hide remaining respects readable hold duration", () => {
    const shownAt = 20_000;
    const duration = getTieResultDurationMs("Split pot");
    assert.equal(tieResultAutoHideRemainingMs(shownAt, duration, shownAt + 1_000), duration - 1_000);
    assert.equal(tieResultAutoHideRemainingMs(shownAt, duration, shownAt + duration), 0);
    assert.equal(
      tieResultAutoHideRemainingMs(shownAt, duration, shownAt + duration + 500),
      0,
    );
  });

  it("readable hold is unchanged by reduced motion (timing module has no motion scaling)", () => {
    const duration = getTieResultDurationMs("Co-win tie");
    assert.ok(duration >= TIE_RESULT_MIN_MS);
    assert.ok(duration <= TIE_RESULT_MAX_MS);
  });
});
