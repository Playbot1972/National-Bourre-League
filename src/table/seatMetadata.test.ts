import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("formatAnteStake display label", () => {
  it("returns a single dollar amount without parenthetical duplicate", async () => {
    const { formatAnteStake } = await import("../../docs/risk-stakes.js");
    assert.equal(formatAnteStake(1), "$1");
    assert.equal(formatAnteStake(0.25), "$0.25");
    assert.ok(!formatAnteStake(5).includes("("));
  });
});
