import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  YOUR_TURN_HANDOFF_MS,
  YOUR_TURN_REPEAT_MS,
  YOUR_TURN_EXIT_MS,
  YOUR_TURN_HOLD_MS,
  YOUR_TURN_POP_MS,
} from "./hooks/useYourTurnAttention";

describe("your turn attention timing", () => {
  it("handoff cue is immediate on turn change", () => {
    assert.equal(YOUR_TURN_HANDOFF_MS, 0);
  });

  it("repeats on gentle 12s / 18s / 24s cadence if still idle", () => {
    assert.deepEqual(YOUR_TURN_REPEAT_MS, [12_000, 18_000, 24_000]);
  });

  it("single beat animation stays brief", () => {
    assert.equal(YOUR_TURN_POP_MS, 380);
    assert.equal(YOUR_TURN_HOLD_MS, 420);
    assert.equal(YOUR_TURN_EXIT_MS, 620);
    assert.ok(YOUR_TURN_POP_MS + YOUR_TURN_HOLD_MS + YOUR_TURN_EXIT_MS < 2_000);
  });
});
