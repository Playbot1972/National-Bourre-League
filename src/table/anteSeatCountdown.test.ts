import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { buildAnteCoinDelayPlan, clearAntePlanCacheForTests } from "../session/botActionTiming";
import { buildAntePresentationSchedule } from "./antePresentationSchedule";
import {
  buildAnteSeatCountdownFromPlan,
  buildAnteSeatCountdownState,
} from "./anteSeatCountdown";

describe("anteSeatCountdown", () => {
  const playerIds = ["p-dealer", "p-next", "p-third"];

  beforeEach(() => {
    clearAntePlanCacheForTests();
  });

  it("derives ring state from timeline seconds, not wall clock", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 3,
      playerIds: playerIds.slice(0, 2),
      reducedMotion: false,
      rng: () => 0.25,
    });
    const schedule = buildAntePresentationSchedule(plan, false);
    const first = schedule[0]!;
    const midSec = first.thinkStartSec + first.thinkDurationSec / 2;

    const state = buildAnteSeatCountdownState({ schedule, elapsedSec: midSec });
    assert.ok(state);
    assert.equal(state!.playerId, first.playerId);
    assert.ok(state!.remainingMs > 0);
    assert.ok(state!.remainingMs <= first.thinkDurationSec * 1000);
  });

  it("returns null when timeline elapsed is unavailable", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 1,
      playerIds: ["solo"],
      reducedMotion: false,
      rng: () => 0.1,
    });
    const schedule = buildAntePresentationSchedule(plan, false);
    assert.equal(buildAnteSeatCountdownState({ schedule, elapsedSec: null }), null);
  });

  it("buildAnteSeatCountdownFromPlan matches schedule ring at same elapsed", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 9,
      playerIds,
      reducedMotion: true,
      rng: () => 0.75,
    });
    const schedule = buildAntePresentationSchedule(plan, true);
    const elapsedSec = schedule[0]!.thinkStartSec + 0.02;
    const direct = buildAnteSeatCountdownState({ schedule, elapsedSec });
    const fromPlan = buildAnteSeatCountdownFromPlan(plan, true, elapsedSec);
    assert.deepEqual(fromPlan, direct);
  });
});
