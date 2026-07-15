import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAnteCoinDelayPlan } from "../session/botActionTiming";
import {
  buildAnteSeatCountdownState,
  buildAnteSeatThinkWindows,
  resolveAnteSeatThinkAtElapsed,
} from "./anteSeatCountdown";

describe("anteSeatCountdown", () => {
  const playerIds = ["p-dealer", "p-next", "p-third"];

  it("activates one seat at a time in clockwise order during think windows", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 7,
      playerIds,
      reducedMotion: false,
      rng: () => 0.5,
    });
    const seatGapMs = plan.travelMs + plan.settleMs;
    const seats: string[] = [];

    for (let elapsed = 0; elapsed < plan.totalDurationMs; elapsed += 25) {
      const active = resolveAnteSeatThinkAtElapsed(
        elapsed,
        playerIds,
        plan.thinkBeforeMs,
        seatGapMs,
      );
      if (active) seats.push(active.playerId);
    }

    assert.deepEqual([...new Set(seats)], playerIds);
    assert.equal(seats[0], playerIds[0]);
    const firstGapIndex = seats.findIndex((id) => id === playerIds[1]);
    assert.ok(firstGapIndex > 0);
    assert.ok(seats.slice(0, firstGapIndex).every((id) => id === playerIds[0]));
  });

  it("hides the ring during coin travel between seats", () => {
    const thinkBeforeMs = [400, 400];
    const seatGapMs = 220 + 80;
    const duringTravel = resolveAnteSeatThinkAtElapsed(
      thinkBeforeMs[0]! + 50,
      playerIds.slice(0, 2),
      thinkBeforeMs,
      seatGapMs,
    );
    assert.equal(duringTravel, null);
  });

  it("matches ring duration to the cached ante delay plan per seat", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 3,
      playerIds: playerIds.slice(0, 2),
      reducedMotion: false,
      rng: () => 0.25,
    });
    const startedAt = 1_000_000;
    const firstThinkMs = plan.thinkBeforeMs[0]!;
    const midThink = buildAnteSeatCountdownState({
      playerIds: playerIds.slice(0, 2),
      plan,
      startedAtMs: startedAt,
      nowMs: startedAt + Math.floor(firstThinkMs / 2),
    });
    assert.ok(midThink);
    assert.equal(midThink!.playerId, playerIds[0]);
    assert.ok(midThink!.remainingMs > 0);
    assert.ok(midThink!.remainingMs <= firstThinkMs);
    assert.equal(midThink!.segment, "yellow");

    const nearEnd = buildAnteSeatCountdownState({
      playerIds: playerIds.slice(0, 2),
      plan,
      startedAtMs: startedAt,
      nowMs: startedAt + firstThinkMs - 1,
    });
    assert.ok(nearEnd);
    assert.equal(nearEnd!.remainingMs, 1);
  });

  it("keeps reduced-motion plans on a valid countdown path", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 9,
      playerIds,
      reducedMotion: true,
      rng: () => 0.75,
    });
    const startedAt = 0;
    const state = buildAnteSeatCountdownState({
      playerIds,
      plan,
      startedAtMs: startedAt,
      nowMs: startedAt + 10,
    });
    assert.ok(state);
    assert.equal(state!.playerId, playerIds[0]);
    assert.ok(state!.progress > 0);
    assert.ok(state!.remainingMs > 0);
    assert.ok(plan.thinkBeforeMs.every((ms) => ms > 0));
  });

  it("does not depend on audio — countdown is pure timing state", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 1,
      playerIds: ["solo"],
      reducedMotion: false,
      rng: () => 0.1,
    });
    const withAudioBlocked = buildAnteSeatCountdownState({
      playerIds: ["solo"],
      plan,
      startedAtMs: 0,
      nowMs: 50,
    });
    assert.ok(withAudioBlocked);
    assert.equal(typeof withAudioBlocked!.progress, "number");
    assert.equal(typeof withAudioBlocked!.remainingMs, "number");
  });

  it("buildAnteSeatThinkWindows lists think-only segments in order", () => {
    const windows = buildAnteSeatThinkWindows(playerIds, [300, 0, 500]);
    assert.equal(windows.length, 2);
    assert.equal(windows[0]!.playerId, playerIds[0]);
    assert.equal(windows[0]!.thinkStartMs, 0);
    assert.equal(windows[1]!.playerId, playerIds[2]);
    assert.equal(windows[1]!.thinkStartMs, 300);
  });
});
