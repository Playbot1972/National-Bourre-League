import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  YOUR_TURN_ATTENTION_MS,
  YOUR_TURN_EXIT_MS,
  YOUR_TURN_HOLD_MS,
  YOUR_TURN_POP_MS,
} from "./hooks/useYourTurnAttention";

describe("your turn attention", () => {
  it("uses a 15 second inactivity delay", () => {
    assert.equal(YOUR_TURN_ATTENTION_MS, 15_000);
  });

  it("uses brief pop, hold, and exit timing", () => {
    assert.equal(YOUR_TURN_POP_MS, 380);
    assert.equal(YOUR_TURN_HOLD_MS, 420);
    assert.equal(YOUR_TURN_EXIT_MS, 620);
    assert.ok(YOUR_TURN_POP_MS + YOUR_TURN_HOLD_MS + YOUR_TURN_EXIT_MS < 2_000);
  });
});
