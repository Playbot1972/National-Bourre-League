import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveTrickLayoutCardCount } from "./trickRowLayout";

describe("trickRowLayout", () => {
  it("uses compact placeholder between tricks", () => {
    const { layoutCardCount, trickActive } = resolveTrickLayoutCardCount(0, 0, 4);
    assert.equal(trickActive, false);
    assert.equal(layoutCardCount, 1);
  });

  it("reserves full participant width from trick start", () => {
    const first = resolveTrickLayoutCardCount(0, 1, 4);
    assert.equal(first.trickActive, true);
    assert.equal(first.layoutCardCount, 4);

    const mid = resolveTrickLayoutCardCount(2, 2, 4);
    assert.equal(mid.layoutCardCount, 4);

    const late = resolveTrickLayoutCardCount(4, 4, 4);
    assert.equal(late.layoutCardCount, 4);
  });

  it("never shrinks below peak or display count", () => {
    const { layoutCardCount } = resolveTrickLayoutCardCount(3, 5, 4);
    assert.equal(layoutCardCount, 5);
  });
});
