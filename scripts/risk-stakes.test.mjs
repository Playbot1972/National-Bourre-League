import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ANTE_STAKE_OPTIONS,
  anteStakeOptionsFor,
  formatAnteStake,
} from "../docs/risk-stakes.js";

describe("risk-stakes ante options", () => {
  it("lists cents then bill denominations through $10,000", () => {
    assert.equal(ANTE_STAKE_OPTIONS[0].label, "1 cent ($0.01)");
    assert.equal(ANTE_STAKE_OPTIONS[4].label, "50 cents ($0.50)");
    assert.equal(ANTE_STAKE_OPTIONS[5].label, "$1 ($1.00)");
    assert.equal(ANTE_STAKE_OPTIONS[6].label, "$2 ($2.00)");
    assert.equal(ANTE_STAKE_OPTIONS.at(-1)?.value, 10_000);
    assert.equal(ANTE_STAKE_OPTIONS.at(-1)?.label, "$10,000 ($10000.00)");
  });

  it("formats read-only ante labels without parenthetical duplicate", () => {
    assert.equal(formatAnteStake(0.25), "$0.25");
    assert.equal(formatAnteStake(1), "$1");
    assert.equal(formatAnteStake(100), "$100");
  });

  it("keeps unknown ante values selectable", () => {
    const options = anteStakeOptionsFor(3);
    assert.ok(options.some((o) => o.value === 3));
  });
});
