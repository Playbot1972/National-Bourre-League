import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TIE_RESULT_DEFAULT_MS,
  TIE_RESULT_MAX_MS,
  TIE_RESULT_MIN_MS,
  defaultTieResultDurationMs,
  getTieResultDurationMs,
} from "./tieResultTiming";

describe("tieResultTiming", () => {
  it("clamps duration between min and max", () => {
    assert.equal(getTieResultDurationMs(""), TIE_RESULT_MIN_MS);
    assert.ok(getTieResultDurationMs("x".repeat(40)) >= TIE_RESULT_DEFAULT_MS);
    assert.equal(getTieResultDurationMs("x".repeat(500)), TIE_RESULT_MAX_MS);
  });

  it("exposes named constants", () => {
    assert.equal(TIE_RESULT_MIN_MS, 3_000);
    assert.equal(TIE_RESULT_DEFAULT_MS, 4_000);
    assert.equal(TIE_RESULT_MAX_MS, 6_000);
    assert.equal(defaultTieResultDurationMs(), TIE_RESULT_DEFAULT_MS);
  });
});
