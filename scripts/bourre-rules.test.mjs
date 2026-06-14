import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeHandPotState,
  settleHandDeltas,
} from "../docs/bourre-rules.js";

describe("E — pot and bourré settlement", () => {
  const stake = (n) => () => n;

  it("computeHandPotState caps pot when lim enabled", () => {
    const state = computeHandPotState({
      anteAmount: 1,
      limEnabled: true,
      carryIn: 50,
      antePot: 4,
    });
    assert.equal(state.potCap, 20);
    assert.equal(state.maxWinThisHand, 20);
    assert.ok(state.overflow > 0);
  });

  it("winner take-all settlement assigns pot to winner", () => {
    const participants = ["p1", "p2", "p3"];
    const result = settleHandDeltas({
      mode: "win",
      winners: ["p1"],
      participants,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.ok(result.deltas.p1 > 0);
    assert.ok(result.deltas.p2 < 0);
    assert.ok(result.bourreIds.includes("p3"));
    assert.ok(result.deltas.p3 < result.deltas.p2);
  });

  it("split settlement divides max win among co-winners", () => {
    const participants = ["p1", "p2"];
    const result = settleHandDeltas({
      mode: "split",
      winners: ["p1", "p2"],
      participants,
      tricksByPlayer: { p1: 2, p2: 2 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.equal(result.deltas.p1, 0);
    assert.equal(result.deltas.p2, 0);
  });

  it("push carries pot forward and applies bourré penalties when all took zero tricks", () => {
    const participants = ["p1", "p2"];
    const result = settleHandDeltas({
      mode: "push",
      winners: [],
      participants,
      tricksByPlayer: { p1: 0, p2: 0 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.equal(result.carryOverPot, 6);
    assert.equal(result.deltas.p1, -3);
    assert.equal(result.deltas.p2, -3);
    assert.deepEqual(result.bourreIds.sort(), ["p1", "p2"]);
  });
});
