import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  YOUR_TURN_ATTENTION_MS,
  YOUR_TURN_EXIT_MS,
  YOUR_TURN_HOLD_MS,
  YOUR_TURN_POP_MS,
  YOUR_TURN_REPEAT_INTERVALS_MS,
} from "./hooks/useYourTurnAttention";

describe("your turn attention", () => {
  it("uses a 7 second inactivity delay before the first cue", () => {
    assert.equal(YOUR_TURN_ATTENTION_MS, 7_000);
  });

  it("repeats at 6s, 5s, 4s, 3s, and 2s intervals", () => {
    assert.deepEqual(YOUR_TURN_REPEAT_INTERVALS_MS, [6_000, 5_000, 4_000, 3_000, 2_000]);
  });

  it("uses brief pop, hold, and exit timing", () => {
    assert.equal(YOUR_TURN_POP_MS, 380);
    assert.equal(YOUR_TURN_HOLD_MS, 420);
    assert.equal(YOUR_TURN_EXIT_MS, 620);
    assert.ok(YOUR_TURN_POP_MS + YOUR_TURN_HOLD_MS + YOUR_TURN_EXIT_MS < 2_000);
  });
});
