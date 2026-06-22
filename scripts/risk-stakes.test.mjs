import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ANTE_STAKE_OPTIONS,
  anteStakeOptionsFor,
  formatAnteStake,
  formatRiskStake,
} from "../docs/risk-stakes.js";

describe("risk-stakes ante options", () => {
  it("lists cents then bill denominations through $10,000", () => {
    assert.equal(ANTE_STAKE_OPTIONS[0].label, "1¢");
    assert.equal(ANTE_STAKE_OPTIONS[4].label, "50¢");
    assert.equal(ANTE_STAKE_OPTIONS[5].label, "$1");
    assert.equal(ANTE_STAKE_OPTIONS[6].label, "$2");
    assert.equal(ANTE_STAKE_OPTIONS.at(-1)?.value, 10_000);
    assert.equal(ANTE_STAKE_OPTIONS.at(-1)?.label, "$10,000");
  });

  it("formats read-only ante labels without parenthetical duplicate", () => {
    assert.equal(formatAnteStake(1), "$1");
    assert.equal(formatAnteStake(0.01), "1¢");
    assert.equal(formatAnteStake(0.25), "25¢");
    assert.equal(formatAnteStake(1.25), "$1.25");
    assert.equal(formatAnteStake(100), "$100");
    assert.ok(!formatAnteStake(5).includes("("));
  });

  it("keeps buy-in and bankroll formatting unchanged", () => {
    assert.equal(formatRiskStake(100), "$100");
    assert.equal(formatRiskStake(1000), "$1,000");
  });

  it("keeps unknown ante values selectable", () => {
    const options = anteStakeOptionsFor(3);
    assert.ok(options.some((o) => o.value === 3));
    assert.equal(options.find((o) => o.value === 3)?.label, "$3");
  });

  it("formats sub-dollar custom ante values as cents", () => {
    const options = anteStakeOptionsFor(0.75);
    assert.equal(options.find((o) => o.value === 0.75)?.label, "75¢");
  });
});
