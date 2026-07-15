import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  buildAnteCoinDelayPlan,
  clearAntePlanCacheForTests,
} from "../session/botActionTiming";
import {
  antePresentationTotalSec,
  buildAntePresentationSchedule,
  buildAnteRingStateAtTimelineSec,
  resolveAnteThinkAtTimelineSec,
} from "./antePresentationSchedule";
import { scaledDuration } from "./animations/motionTokens";

describe("antePresentationSchedule", () => {
  const playerIds = ["p-dealer", "p-next", "p-third"];

  beforeEach(() => {
    clearAntePlanCacheForTests();
  });

  it("matches GSAP coin spawn positions from cumulative think + travel + settle", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 2,
      playerIds: playerIds.slice(0, 2),
      reducedMotion: false,
      rng: () => 0.4,
    });
    const schedule = buildAntePresentationSchedule(plan, false);
    const travelSec = scaledDuration(plan.travelMs / 1000, false);
    const settleSec = scaledDuration(plan.settleMs / 1000, false);

    let cumulativeSec = 0;
    for (let index = 0; index < schedule.length; index += 1) {
      const thinkSec = (plan.thinkBeforeMs[index] ?? 0) / 1000;
      cumulativeSec += thinkSec;
      assert.equal(schedule[index]!.coinSpawnSec, cumulativeSec);
      assert.equal(schedule[index]!.thinkStartSec, cumulativeSec - thinkSec);
      assert.equal(schedule[index]!.segmentEndSec, cumulativeSec + travelSec + settleSec);
      cumulativeSec += travelSec + settleSec;
    }
    assert.equal(antePresentationTotalSec(schedule), cumulativeSec);
  });

  it("activates ring only during each seat think window on the real timeline", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 5,
      playerIds,
      reducedMotion: false,
      rng: () => 0.55,
    });
    const schedule = buildAntePresentationSchedule(plan, false);

    for (const entry of schedule) {
      const midThink = entry.thinkStartSec + entry.thinkDurationSec / 2;
      const active = resolveAnteThinkAtTimelineSec(midThink, schedule);
      assert.ok(active);
      assert.equal(active!.playerId, entry.playerId);

      const duringTravel = entry.coinSpawnSec + entry.travelSec * 0.5;
      assert.equal(resolveAnteThinkAtTimelineSec(duringTravel, schedule), null);

      const ring = buildAnteRingStateAtTimelineSec(midThink, schedule);
      assert.ok(ring);
      assert.equal(ring!.playerId, entry.playerId);
      assert.ok(ring!.remainingMs > 0);
      assert.ok(ring!.remainingMs <= entry.thinkDurationSec * 1000);
    }
  });

  it("ring completes as coin spawns — no display padding before posting", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 8,
      playerIds: playerIds.slice(0, 2),
      reducedMotion: false,
      rng: () => 0.2,
    });
    const schedule = buildAntePresentationSchedule(plan, false);
    const first = schedule[0]!;
    const atSpawn = buildAnteRingStateAtTimelineSec(first.coinSpawnSec, schedule);
    assert.equal(atSpawn, null);

    const justBeforeSpawn = buildAnteRingStateAtTimelineSec(
      first.coinSpawnSec - 0.001,
      schedule,
    );
    assert.ok(justBeforeSpawn);
    assert.ok(justBeforeSpawn!.remainingMs < 5);
  });

  it("uses scaled travel/settle gaps under reduced motion (truthful, not raw ms)", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 11,
      playerIds: playerIds.slice(0, 2),
      reducedMotion: true,
      rng: () => 0.6,
    });
    const schedule = buildAntePresentationSchedule(plan, true);
    const travelSec = scaledDuration(plan.travelMs / 1000, true);
    const settleSec = scaledDuration(plan.settleMs / 1000, true);
    const rawGapSec = (plan.travelMs + plan.settleMs) / 1000;

    assert.equal(schedule[0]!.travelSec, travelSec);
    assert.equal(schedule[0]!.settleSec, settleSec);
    if (travelSec + settleSec > rawGapSec) {
      const gapMid =
        schedule[0]!.coinSpawnSec + travelSec + (travelSec + settleSec) * 0.25;
      assert.equal(resolveAnteThinkAtTimelineSec(gapMid, schedule), null);
    }

    const ring = buildAnteRingStateAtTimelineSec(
      schedule[0]!.thinkStartSec + 0.01,
      schedule,
    );
    assert.ok(ring);
  });

  it("preserves clockwise seat order", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 4,
      playerIds,
      reducedMotion: false,
      rng: () => 0.33,
    });
    const schedule = buildAntePresentationSchedule(plan, false);
    assert.deepEqual(
      schedule.map((entry) => entry.playerId),
      playerIds,
    );
    for (let index = 1; index < schedule.length; index += 1) {
      assert.ok(schedule[index]!.thinkStartSec > schedule[index - 1]!.thinkStartSec);
    }
  });
});
