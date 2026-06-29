import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { unionMotionRects } from "./wonTrickPileMotion";

describe("wonTrickPileMotion", () => {
  it("unionMotionRects wraps all card rects into one packet bounds", () => {
    const union = unionMotionRects([
      { left: 100, top: 200, width: 52, height: 74 },
      { left: 116, top: 200, width: 52, height: 74 },
      { left: 132, top: 200, width: 52, height: 74 },
    ]);
    assert.equal(union.left, 100);
    assert.equal(union.top, 200);
    assert.equal(union.width, 84);
    assert.equal(union.height, 74);
  });
});
