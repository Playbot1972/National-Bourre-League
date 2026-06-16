import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CARD_GESTURE,
  isScrollCancel,
  isSwipeFlickPlay,
  isSwipeUpPlay,
  isTapMovement,
} from "./cardGesture";

describe("cardGesture thresholds", () => {
  it("accepts minimal movement as tap", () => {
    assert.equal(isTapMovement(0, 0), true);
    assert.equal(isTapMovement(8, 6), true);
    assert.equal(isTapMovement(12, 0), true);
    assert.equal(isTapMovement(13, 0), false);
  });

  it("detects upward swipe when vertical dominates", () => {
    assert.equal(isSwipeUpPlay(0, -30), true);
    assert.equal(isSwipeUpPlay(10, -30), true);
    assert.equal(isSwipeUpPlay(30, -10), false);
    assert.equal(isSwipeUpPlay(0, -20), false);
  });

  it("accepts outward flick in any direction except scroll-down", () => {
    assert.equal(isSwipeFlickPlay(0, -40), true);
    assert.equal(isSwipeFlickPlay(40, 0), true);
    assert.equal(isSwipeFlickPlay(0, 50), false);
    assert.equal(isSwipeFlickPlay(10, 10), false);
  });

  it("cancels on downward scroll-like drag", () => {
    assert.equal(isScrollCancel(0, 50), true);
    assert.equal(isScrollCancel(10, 50), true);
    assert.equal(isScrollCancel(50, 10), false);
    assert.equal(isScrollCancel(0, -50), false);
  });

  it("documents stable threshold constants", () => {
    assert.equal(CARD_GESTURE.HOLD_MS, 220);
    assert.equal(CARD_GESTURE.SWIPE_UP_PX, 28);
    assert.equal(CARD_GESTURE.SWIPE_FLICK_PX, 36);
  });
});
