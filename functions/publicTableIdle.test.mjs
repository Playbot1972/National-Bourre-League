import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PUBLIC_TABLE_IDLE_REMOVAL_MS,
  PUBLIC_TABLE_IDLE_SIT_OUT_MS,
} from "./vendor/public-table-schema.js";
import {
  buildActivityTouchPatch,
  buildEnrollmentPatchForIdleSitOut,
  classifyIdleStage,
  evaluateIdlePolicyForSeatedHumans,
  isIdleSitOutBlockingEnrollment,
  resolveLastActivityMs,
} from "./publicTableIdle.js";

const NOW = 1_700_000_000_000;

function scoreRow(overrides = {}) {
  return {
    playerId: "human_a",
    bankroll: 100,
    lastActivityTimestamp: NOW - 30_000,
    ...overrides,
  };
}

describe("public-table idle policy (unit)", () => {
  it("classifies active, sit-out, and removal stages from lastActivityTimestamp", () => {
    assert.equal(classifyIdleStage(scoreRow({ lastActivityTimestamp: NOW - 10_000 }), NOW), "active");
    assert.equal(
      classifyIdleStage(scoreRow({ lastActivityTimestamp: NOW - PUBLIC_TABLE_IDLE_SIT_OUT_MS }), NOW),
      "sit_out",
    );
    assert.equal(
      classifyIdleStage(scoreRow({ lastActivityTimestamp: NOW - PUBLIC_TABLE_IDLE_REMOVAL_MS }), NOW),
      "remove",
    );
  });

  it("idle → sit-out after 45s for seated humans only", () => {
    const sessionData = {
      players: [
        { playerId: "human_a" },
        { playerId: "bot_fill" },
        { playerId: "human_b" },
      ],
    };
    const scoreById = {
      human_a: scoreRow({ lastActivityTimestamp: NOW - 50_000 }),
      bot_fill: scoreRow({ playerId: "bot_fill", lastActivityTimestamp: NOW - 999_999 }),
      human_b: scoreRow({ playerId: "human_b", lastActivityTimestamp: NOW - 10_000 }),
    };
    const result = evaluateIdlePolicyForSeatedHumans(sessionData, scoreById, NOW);
    assert.deepEqual(result.sitOut, ["human_a"]);
    assert.deepEqual(result.remove, []);
  });

  it("idle → removed after 4 min total", () => {
    const sessionData = { players: [{ playerId: "human_a" }] };
    const scoreById = {
      human_a: scoreRow({ lastActivityTimestamp: NOW - PUBLIC_TABLE_IDLE_REMOVAL_MS - 1 }),
    };
    const result = evaluateIdlePolicyForSeatedHumans(sessionData, scoreById, NOW);
    assert.deepEqual(result.remove, ["human_a"]);
  });

  it("sit-out blocks enrollment turn until advanced", () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["human_a", "human_b"],
      currentIndex: 0,
      enrolledIds: [],
      declinedIds: [],
      turnDeadlineMs: NOW + 12_000,
    };
    const scoreById = { human_a: { sitOut: true } };
    assert.equal(isIdleSitOutBlockingEnrollment(enrollment, scoreById, NOW), true);

    const patch = buildEnrollmentPatchForIdleSitOut(enrollment, "human_a", null, NOW);
    assert.ok(patch?.handEnrollment);
    assert.ok(patch.handEnrollment.declinedIds.includes("human_a"));
    assert.equal(patch.handEnrollment.currentIndex, 1);
    assert.equal(isIdleSitOutBlockingEnrollment(patch.handEnrollment, scoreById, NOW), false);
  });

  it("return before removal clears sit-out via activity timestamp refresh", () => {
    const before = scoreRow({
      sitOut: true,
      lastActivityTimestamp: NOW - PUBLIC_TABLE_IDLE_SIT_OUT_MS - 1,
    });
    assert.equal(classifyIdleStage(before, NOW), "sit_out");
    const afterTouch = {
      ...before,
      sitOut: undefined,
      lastActivityTimestamp: NOW,
    };
    assert.equal(classifyIdleStage(afterTouch, NOW), "active");
  });

  it("resolveLastActivityMs falls back to updatedAt", () => {
    assert.equal(resolveLastActivityMs({ updatedAt: NOW - 60_000 }, NOW), NOW - 60_000);
  });

  it("resolveLastActivityMs treats missing timestamps as idle-eligible (not perpetually active)", () => {
    assert.equal(
      resolveLastActivityMs({ playerId: "human_a", bankroll: 100 }, NOW),
      NOW - PUBLIC_TABLE_IDLE_SIT_OUT_MS - 1,
    );
    assert.equal(resolveLastActivityMs({ playerId: "human_b" }, NOW), NOW);
  });

  it("buildEnrollmentPatchForIdleSitOut declines non-current idle player without advancing index", () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["human_b", "human_a"],
      currentIndex: 0,
      enrolledIds: [],
      declinedIds: [],
      turnDeadlineMs: NOW + 12_000,
    };
    const patch = buildEnrollmentPatchForIdleSitOut(enrollment, "human_a", null, NOW);
    assert.equal(patch.handEnrollment.currentIndex, 0);
    assert.ok(patch.handEnrollment.declinedIds.includes("human_a"));
  });

  it("buildActivityTouchPatch clears idle sit-out fields", () => {
    const patch = buildActivityTouchPatch({ sitOut: true, bankroll: 100 });
    assert.ok(patch.lastActivityTimestamp);
    assert.ok("sitOut" in patch);
    assert.ok("idleSitOutAt" in patch);
  });
});
