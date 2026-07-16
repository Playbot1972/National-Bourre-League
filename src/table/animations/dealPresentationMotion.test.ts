import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClockwiseDealSteps,
  dealPresentationDurationMs,
  DEAL_STEP_GAP_MS,
  DEAL_STEP_SETTLE_MS,
  DEAL_STEP_TRAVEL_MS,
} from "./dealPresentationMotion";
import { CARDS_PER_PLAYER } from "../../game/playerOrder";

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

  it("targets ~1.8–2.4s for a 6-seat full-motion deal", () => {
    const steps = 6 * CARDS_PER_PLAYER;
    const duration = dealPresentationDurationMs(steps, false);
    assert.ok(
      duration >= 1800 && duration <= 2400,
      `expected 1800–2400ms, got ${duration}ms`,
    );
    const expected =
      (steps - 1) * DEAL_STEP_GAP_MS + DEAL_STEP_TRAVEL_MS + DEAL_STEP_SETTLE_MS;
    assert.equal(duration, expected);
  });

  it("keeps reduced-motion deal under two seconds for 6 seats", () => {
    const steps = 6 * CARDS_PER_PLAYER;
    const duration = dealPresentationDurationMs(steps, true);
    assert.ok(duration < 2000, `expected <2000ms, got ${duration}ms`);
  });
});
