import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  anteSequenceDurationMs,
  computeAnteStaggerMs,
  ANTE_MONEY_TRAVEL_MS,
} from "./antePresentationTiming";
import {
  antePresentationDedupeKey,
  _resetAntePresentationForTests,
} from "./animations/antePresentationMotion";

describe("antePresentationTiming", () => {
  it("staggers within 72–140ms and compresses for 6–8 players", () => {
    assert.ok(computeAnteStaggerMs(3) >= 72 && computeAnteStaggerMs(3) <= 140);
    assert.ok(computeAnteStaggerMs(8) < computeAnteStaggerMs(4));
    assert.equal(computeAnteStaggerMs(8), 72);
  });

  it("keeps full ante sequence generally under one second for eight players", () => {
    const total = anteSequenceDurationMs(8, false);
    assert.ok(total < 1000, `expected <1000ms, got ${total}`);
    assert.ok(total >= ANTE_MONEY_TRAVEL_MS);
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
