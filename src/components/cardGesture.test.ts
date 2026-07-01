import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CARD_GESTURE,
  consumeSuppressNextClick,
  isScrollCancel,
  isSwipeFlickPlay,
  isSwipeUpPlay,
  isTapMovement,
  classifyPlayPointerMove,
  resolvePlayReleaseAction,
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

  it("classifyPlayPointerMove marks swipe only past threshold", () => {
    assert.equal(classifyPlayPointerMove(0, -15), "none");
    assert.equal(classifyPlayPointerMove(0, -30), "swipe");
    assert.equal(classifyPlayPointerMove(40, 0), "swipe");
  });

  it("consumeSuppressNextClick clears flag once", () => {
    const ref = { current: false };
    assert.equal(consumeSuppressNextClick(ref), false);
    ref.current = true;
    assert.equal(consumeSuppressNextClick(ref), true);
    assert.equal(consumeSuppressNextClick(ref), false);
  });

  it("resolvePlayReleaseAction defaults to tap under swipe threshold", () => {
    const base = { fired: false, swipeIntent: false, scrollCancelled: false };
    assert.equal(resolvePlayReleaseAction(0, 0, base), "tap");
    assert.equal(resolvePlayReleaseAction(8, -15, base), "tap");
    assert.equal(resolvePlayReleaseAction(0, -30, base), "swipe-up");
    assert.equal(resolvePlayReleaseAction(40, 0, base), "swipe-flick");
    assert.equal(
      resolvePlayReleaseAction(0, 50, { ...base, scrollCancelled: true }),
      "cancel",
    );
  });
});
