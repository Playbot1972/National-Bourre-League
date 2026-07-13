import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  anteSequenceDurationMs,
  computeAnteStaggerMs,
  ANTE_MONEY_TRAVEL_MS,
  ANTE_POST_SEQUENCE_HOLD_MS,
  ANTE_PER_PLAYER_MOTION_MS,
} from "./antePresentationTiming";
import {
  antePresentationDedupeKey,
  _resetAntePresentationForTests,
} from "./animations/antePresentationMotion";

describe("antePresentationTiming", () => {
  it("staggers within 88–150ms and compresses for 6–8 players", () => {
    assert.ok(computeAnteStaggerMs(3) >= 88 && computeAnteStaggerMs(3) <= 150);
    assert.ok(computeAnteStaggerMs(8) < computeAnteStaggerMs(4));
    assert.equal(computeAnteStaggerMs(8), 88);
  });

  it("includes per-player motion, merge, and post-ante hold in sequence duration", () => {
    const total = anteSequenceDurationMs(4, false);
    const stagger = computeAnteStaggerMs(4, false);
    const expectedMin = 3 * stagger + ANTE_PER_PLAYER_MOTION_MS + ANTE_POST_SEQUENCE_HOLD_MS;
    assert.ok(total >= expectedMin, `expected >= ${expectedMin}, got ${total}`);
    assert.ok(total >= ANTE_MONEY_TRAVEL_MS);
  });

  it("eight-player ante stays readable without excessive delay", () => {
    const total = anteSequenceDurationMs(8, false);
    assert.ok(total >= 900, `expected >= 900ms, got ${total}`);
    assert.ok(total <= 1800, `expected <= 1800ms, got ${total}`);
  });

  it("shortens sequence when reduced motion is requested", () => {
    assert.ok(anteSequenceDurationMs(6, true) < anteSequenceDurationMs(6, false));
  });
});

describe("antePresentationMotion dedupe", () => {
  it("uses per-hand dedupe keys", () => {
    _resetAntePresentationForTests();
    assert.equal(antePresentationDedupeKey(4), "4:ante-motion");
    assert.notEqual(antePresentationDedupeKey(4), antePresentationDedupeKey(5));
  });
});
