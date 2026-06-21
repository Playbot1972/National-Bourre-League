import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flipDelta, invertFromFirst, rectCenter } from "./flip";

describe("flip", () => {
  it("computes rect center", () => {
    assert.deepEqual(rectCenter({ left: 10, top: 20, width: 40, height: 60 }), {
      x: 30,
      y: 50,
    });
  });

  it("computes delta between rect centers", () => {
    const from = { left: 0, top: 0, width: 20, height: 20 };
    const to = { left: 100, top: 50, width: 20, height: 20 };
    assert.deepEqual(flipDelta(from, to), { x: -100, y: -50 });
  });

  it("inverts from first to last for FLIP play", () => {
    const first = { left: 0, top: 0, width: 40, height: 60 };
    const last = { left: 200, top: 300, width: 52, height: 74 };
    const { x, y } = invertFromFirst(last, first);
    assert.equal(x, 0 + 20 - (200 + 26));
    assert.equal(y, 0 + 30 - (300 + 37));
  });
});
