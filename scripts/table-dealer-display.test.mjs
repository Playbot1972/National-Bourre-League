/**
 * Dealer badge on seat flags — broke/out players must not show dealer.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveDisplayDealerId } from "../docs/dealer-display.js";

const BUY_IN = 100;
const SORTED = ["p1", "p2", "p3"];

describe("resolveDisplayDealerId — seat badge (docs)", () => {
  it("broke/out stored dealer does not receive dealer badge", () => {
    const scoreById = {
      p1: { bankroll: 0, net: -100, out: true },
      p2: { bankroll: 80, net: -20 },
      p3: { bankroll: 120, net: 20 },
    };
    assert.equal(resolveDisplayDealerId("p1", SORTED, scoreById, BUY_IN), "p2");
    assert.notEqual(resolveDisplayDealerId("p1", SORTED, scoreById, BUY_IN), "p1");
  });

  it("sole survivor endgame shows no dealer tag on any seat", () => {
    const scoreById = {
      p1: { bankroll: 300, net: 200 },
      p2: { bankroll: 0, out: true },
      p3: { bankroll: 0, out: true },
    };
    assert.equal(resolveDisplayDealerId("p2", SORTED, scoreById, BUY_IN), null);
    assert.equal(resolveDisplayDealerId("p1", SORTED, scoreById, BUY_IN), null);
  });
});
