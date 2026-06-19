import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  YOUR_TURN_FIRST_MS,
  YOUR_TURN_REPEAT_MS,
  YOUR_TURN_EXIT_MS,
  YOUR_TURN_HOLD_MS,
  YOUR_TURN_POP_MS,
} from "./hooks/useYourTurnAttention";

describe("your turn attention timing", () => {
  it("first reminder appears after 7 seconds", () => {
    assert.equal(YOUR_TURN_FIRST_MS, 7_000);
  });

  it("repeats on escalating 6s, 5s, 4s, 3s, 2s cadence", () => {
    assert.deepEqual(YOUR_TURN_REPEAT_MS, [6_000, 5_000, 4_000, 3_000, 2_000]);
  });

  it("single beat animation stays brief", () => {
    assert.equal(YOUR_TURN_POP_MS, 380);
    assert.equal(YOUR_TURN_HOLD_MS, 420);
    assert.equal(YOUR_TURN_EXIT_MS, 620);
    assert.ok(YOUR_TURN_POP_MS + YOUR_TURN_HOLD_MS + YOUR_TURN_EXIT_MS < 2_000);
  });
});
