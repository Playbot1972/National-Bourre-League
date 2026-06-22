import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatAnteStake } from "./logic";

describe("formatAnteStake display label", () => {
  it("formats whole dollars, cents, and mixed amounts without parenthetical duplicate", () => {
    assert.equal(formatAnteStake(1), "$1");
    assert.equal(formatAnteStake(0.01), "1¢");
    assert.equal(formatAnteStake(0.25), "25¢");
    assert.equal(formatAnteStake(1.25), "$1.25");
    assert.ok(!formatAnteStake(5).includes("("));
  });
});
