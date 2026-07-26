import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PUBLIC_TABLE_IDLE_REMOVAL_MS,
  PUBLIC_TABLE_IDLE_SIT_OUT_MS,
  MIXED_ZERO_ACTIVE_GRACE_MS,
} from "./vendor/public-table-schema.js";
import {
  countActiveLiveHumans,
  evaluateZeroActiveGraceState,
  isActiveLiveHuman,
  STALE_RECONNECT_GRACE_MS,
} from "./publicTableStaleReconcile.js";

const NOW = 1_700_000_000_000;

function sessionWithHumans(...ids) {
  return { players: ids.map((playerId) => ({ playerId })) };
}

describe("mixed stale reconcile (unit)", () => {
  it("defines reconnect grace as idle sit-out threshold", () => {
    assert.equal(STALE_RECONNECT_GRACE_MS, PUBLIC_TABLE_IDLE_SIT_OUT_MS);
  });

  it("defines zero-active grace as 60 seconds", () => {
    assert.equal(MIXED_ZERO_ACTIVE_GRACE_MS, 60_000);
  });

  it("treats recent heartbeat as active live human", () => {
    const row = {
      playerId: "human_a",
      lastActivityTimestamp: NOW - 10_000,
    };
    assert.equal(isActiveLiveHuman(row, NOW), true);
  });

  it("treats 45s+ idle as inactive (not active live)", () => {
    const row = {
      playerId: "human_a",
      lastActivityTimestamp: NOW - PUBLIC_TABLE_IDLE_SIT_OUT_MS - 1,
    };
    assert.equal(isActiveLiveHuman(row, NOW), false);
  });

  it("treats sitOut humans as inactive even with fresh heartbeat", () => {
    const row = {
      playerId: "human_a",
      sitOut: true,
      lastActivityTimestamp: NOW - 1_000,
    };
    assert.equal(isActiveLiveHuman(row, NOW), false);
  });

  it("counts only active seated humans", () => {
    const sessionData = sessionWithHumans("human_a", "human_b", "bot_fill");
    const scoreById = {
      human_a: { lastActivityTimestamp: NOW - 10_000 },
      human_b: { lastActivityTimestamp: NOW - PUBLIC_TABLE_IDLE_REMOVAL_MS - 1 },
      bot_fill: { lastActivityTimestamp: NOW - 999_999 },
    };
    assert.equal(countActiveLiveHumans(sessionData, scoreById, NOW), 1);
  });

  it("excludes joining actor when counting other active live humans", () => {
    const sessionData = sessionWithHumans("joiner", "host");
    const scoreById = {
      joiner: { lastActivityTimestamp: NOW - 5_000 },
      host: { lastActivityTimestamp: NOW - 5_000 },
    };
    assert.equal(
      countActiveLiveHumans(sessionData, scoreById, NOW, { excludePlayerIds: ["joiner"] }),
      1,
    );
  });

  it("starts grace when active live count hits zero", () => {
    const grace = evaluateZeroActiveGraceState({ mixedZeroActiveGraceStartedAt: null }, 0, NOW);
    assert.equal(grace.shouldStartGrace, true);
    assert.equal(grace.graceExpired, false);
    assert.equal(grace.graceRemainingMs, MIXED_ZERO_ACTIVE_GRACE_MS);
  });

  it("clears grace when active live count recovers", () => {
    const grace = evaluateZeroActiveGraceState(
      { mixedZeroActiveGraceStartedAt: NOW - 30_000 },
      1,
      NOW,
    );
    assert.equal(grace.shouldClearGrace, true);
    assert.equal(grace.graceExpired, false);
  });

  it("expires grace after 60 seconds with zero active live humans", () => {
    const grace = evaluateZeroActiveGraceState(
      { mixedZeroActiveGraceStartedAt: NOW - MIXED_ZERO_ACTIVE_GRACE_MS - 1 },
      0,
      NOW,
    );
    assert.equal(grace.graceExpired, true);
    assert.equal(grace.graceRemainingMs, 0);
  });

  it("keeps grace active before 60 seconds elapse", () => {
    const grace = evaluateZeroActiveGraceState(
      { mixedZeroActiveGraceStartedAt: NOW - 30_000 },
      0,
      NOW,
    );
    assert.equal(grace.graceExpired, false);
    assert.equal(grace.graceRemainingMs, 30_000);
  });
});
