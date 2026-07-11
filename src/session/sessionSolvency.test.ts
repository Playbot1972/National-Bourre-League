import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { collectHandAntes } from "../game/money/core";
import {
  buildSoleSurvivorSessionEnd,
  countEligibleForNextHand,
  shouldFinalizeForSoleSurvivor,
  shouldOpenNextHandEnrollment,
} from "./sessionSolvency";

const BUY_IN = 100;
const ANTE = 20;
const P1 = "p1";
const P2 = "p2";
const P3 = "p3";
const SORTED = [P1, P2, P3];

describe("session solvency — sole survivor end", () => {
  it("3 seats, 2 out, 1 bankroll-positive: no next hand, no second ante, finalize path", () => {
    const handCountBefore = 4;
    const scoreById = {
      [P1]: { bankroll: 150, net: 50, out: false },
      [P2]: { bankroll: 0, net: -100, out: true },
      [P3]: { bankroll: 0, net: -100, out: true },
    };

    const eligibleCount = countEligibleForNextHand(SORTED, scoreById, BUY_IN);
    assert.equal(eligibleCount, 1);
    assert.equal(shouldOpenNextHandEnrollment(eligibleCount), false);
    assert.equal(shouldFinalizeForSoleSurvivor(eligibleCount), true);

    const end = buildSoleSurvivorSessionEnd({
      winnerId: P1,
      carryIn: 40,
      postedAntes: {},
      scoreById,
      buyInFallback: BUY_IN,
      sortedPlayerIds: SORTED,
    });

    assert.equal(end.potAwarded, 40);
    assert.equal(end.scorePatches[P1]?.bankroll, 190);
    assert.equal(end.scorePatches[P2]?.bankroll, 0);
    assert.equal(end.scorePatches[P3]?.bankroll, 0);

    const anteAttempt = collectHandAntes({
      participants: [P1],
      scoreById: end.scorePatches,
      buyInFallback: BUY_IN,
      stakeForPlayer: () => ANTE,
    });
    assert.equal(anteAttempt.postedAntes[P1], ANTE);
    assert.equal(anteAttempt.bankrolls[P1], 170);
    assert.notEqual(anteAttempt.bankrolls[P1], 190);

    const handCountAfter = handCountBefore;
    assert.equal(handCountAfter, handCountBefore, "sole survivor end must not bump handCount");
  });

  it("allows contested next hand when two or more players remain solvent", () => {
    const scoreById = {
      [P1]: { bankroll: 80, net: -20 },
      [P2]: { bankroll: 60, net: -40 },
      [P3]: { bankroll: 0, out: true },
    };
    const eligibleCount = countEligibleForNextHand(SORTED, scoreById, BUY_IN);
    assert.equal(eligibleCount, 2);
    assert.equal(shouldOpenNextHandEnrollment(eligibleCount), true);
    assert.equal(shouldFinalizeForSoleSurvivor(eligibleCount), false);
  });
});
