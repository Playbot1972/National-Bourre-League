import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  isHeroPlayMotionActive,
  isStageFitMeasurementFrozen,
  setHeroPlayMotionActive,
} from "./stageFitMotionFreeze";

describe("stageFitMotionFreeze", () => {
  beforeEach(() => {
    setHeroPlayMotionActive(false);
  });

  it("freezes while hero play motion is active", () => {
    assert.equal(isStageFitMeasurementFrozen(), false);
    setHeroPlayMotionActive(true);
    assert.equal(isHeroPlayMotionActive(), true);
    assert.equal(isStageFitMeasurementFrozen(), true);
    setHeroPlayMotionActive(false);
    assert.equal(isStageFitMeasurementFrozen(), false);
  });
});
