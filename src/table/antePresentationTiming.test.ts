import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  anteSequenceDurationMs,
  computeAnteStaggerMs,
  ANTE_MONEY_TRAVEL_MS,
  ANTE_PARTICIPANT_STAGGER_MS,
  ANTE_POST_SEQUENCE_HOLD_MS,
  ANTE_PER_PLAYER_MOTION_MS,
} from "./antePresentationTiming";
import {
  antePresentationDedupeKey,
  _resetAntePresentationForTests,
  clearAntePresentationDedupe,
  killAntePresentation,
  runAntePresentation,
} from "./animations/antePresentationMotion";

describe("antePresentationTiming", () => {
  it("uses ~500ms stagger between participants", () => {
    assert.equal(computeAnteStaggerMs(3, false), ANTE_PARTICIPANT_STAGGER_MS);
    assert.equal(computeAnteStaggerMs(8, false), ANTE_PARTICIPANT_STAGGER_MS);
  });

  it("includes per-player motion, gaps, merge, and post-ante hold in sequence duration", () => {
    const total = anteSequenceDurationMs(4, false);
    const stagger = computeAnteStaggerMs(4, false);
    const expectedMin =
      4 * ANTE_PER_PLAYER_MOTION_MS + 3 * stagger + ANTE_POST_SEQUENCE_HOLD_MS;
    assert.ok(total >= expectedMin, `expected >= ${expectedMin}, got ${total}`);
    assert.ok(total >= ANTE_MONEY_TRAVEL_MS);
  });

  it("eight-player ante stays readable with sequential gaps", () => {
    const total = anteSequenceDurationMs(8, false);
    assert.ok(total >= 3500, `expected >= 3500ms, got ${total}`);
    assert.ok(total <= 6000, `expected <= 6000ms, got ${total}`);
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

  it("clearAntePresentationDedupe allows restart after effect cleanup", () => {
    _resetAntePresentationForTests();
    const root = document.createElement("div");
    const seat = document.createElement("div");
    seat.className = "bseat";
    seat.setAttribute("data-seat-play-origin", "p1");
    const avatar = document.createElement("div");
    avatar.className = "bseat__avatar-wrap";
    avatar.style.width = "40px";
    avatar.style.height = "40px";
    seat.appendChild(avatar);
    root.appendChild(seat);
    const pile = document.createElement("div");
    pile.className = "bpot__ante-pile";
    pile.setAttribute("data-ante-pot-target", "");
    root.appendChild(pile);
    document.body.appendChild(root);

    try {
      assert.equal(runAntePresentation(root, 4, ["p1"], {}), true);
      assert.equal(runAntePresentation(root, 4, ["p1"], {}), false);
      killAntePresentation();
      clearAntePresentationDedupe(4);
      assert.equal(runAntePresentation(root, 4, ["p1"], {}), true);
    } finally {
      root.remove();
      _resetAntePresentationForTests();
    }
  });
});
