import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildClockwiseDealSteps, dealPresentationDurationMs } from "./dealPresentationMotion";

describe("dealPresentationMotion", () => {
  it("builds 5-round clockwise steps (one card per seat per round)", () => {
    const order = ["a", "b", "c", "d"];
    const steps = buildClockwiseDealSteps(order, 5);
    assert.equal(steps.length, 20);
    assert.deepEqual(
      steps.slice(0, 4).map((s) => s.playerId),
      order,
    );
    assert.deepEqual(
      steps.slice(4, 8).map((s) => s.roundIndex),
      [1, 1, 1, 1],
    );
    assert.equal(steps[steps.length - 1]!.roundIndex, 4);
  });

  it("scales deal duration with step count", () => {
    const fourPlayers = dealPresentationDurationMs(20, false);
    const twoPlayers = dealPresentationDurationMs(10, false);
    assert.ok(fourPlayers > twoPlayers);
  });
});
