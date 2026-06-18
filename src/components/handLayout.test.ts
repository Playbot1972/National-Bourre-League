import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cardWidthForHandSize, computeHandFanOverlapPx } from "./handLayout";

describe("handLayout", () => {
  it("returns zero overlap for a single card", () => {
    assert.equal(computeHandFanOverlapPx(300, 1, 52), 0);
  });

  it("spreads cards apart when container is wide enough", () => {
    const overlap = computeHandFanOverlapPx(400, 5, 52);
    assert.ok(overlap > 0, "positive margin = gap between cards");
  });

  it("overlaps cards when container is narrow", () => {
    const overlap = computeHandFanOverlapPx(180, 5, 52);
    assert.ok(overlap < 0, "negative margin = fan overlap");
  });

  it("keeps at least minVisible peek per card when overlapping", () => {
    const overlap = computeHandFanOverlapPx(160, 5, 52, { minVisiblePx: 30 });
    const step = 52 + overlap;
    assert.ok(step >= 52 - 30);
  });

  it("maps hand sizes to card widths", () => {
    assert.equal(cardWidthForHandSize("sm"), 52);
    assert.equal(cardWidthForHandSize("md"), 72);
    assert.equal(cardWidthForHandSize("lg"), 96);
  });
});
