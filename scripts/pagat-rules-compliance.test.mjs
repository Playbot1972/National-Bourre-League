/**
 * Pagat-style rule compliance — pot settlement and production funding path.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  settleHandDeltas,
  settleSoloDefaultWin,
  bourrePlayerIds,
  nextDealFundingFlags,
} from "../docs/bourre-rules.js";
import {
  runProductionSettlementDealFlow,
  simulateRecordHandSettlement,
  simulatePagatHandStartFunding,
} from "../docs/bourre-settlement-flow.js";

const buyIn = 1000;
const ante = 1;
const four = ["p1", "p2", "p3", "p4"];
const three = ["p1", "p2", "p3"];

function freshScores(ids) {
  return Object.fromEntries(ids.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
}

describe("Pagat pot / settlement compliance", () => {
  it("7 — single remaining active player wins pot immediately", () => {
    const result = settleSoloDefaultWin({
      winnerId: "p2",
      carryIn: 8,
      scoreById: { p2: { bankroll: 50 } },
      buyInFallback: buyIn,
      stakeForPlayer: () => ante,
    });
    assert.equal(result.ready, true);
    assert.equal(result.pot, 8 + ante);
    assert.equal(result.bankrolls.p2, 50 - ante + 8 + ante);
    assert.equal(result.carryOverPot, 0);
  });

  it("8 — player with most tricks wins pot", () => {
    const participants = three;
    const postedAntes = Object.fromEntries(participants.map((pid) => [pid, ante]));
    const result = settleHandDeltas({
      mode: "win",
      winners: ["p1"],
      participants,
      tricksByPlayer: { p1: 3, p2: 1, p3: 1 },
      anteAmount: ante,
      limEnabled: false,
      carryIn: 0,
      antePot: 3,
      stakeForPlayer: () => 0,
    });
    assert.deepEqual(result.bourreIds, []);
    assert.equal(result.carryOverPot, 0);
    assert.ok(result.deltas.p1 > 0);
    assert.ok(result.deltas.p2 < 0 || result.deltas.p2 === 0);
  });

  it("9 — tie for most tricks carries pot forward (not split payout)", () => {
    const participants = three;
    const result = settleHandDeltas({
      mode: "co_win_carry",
      winners: ["p1", "p3"],
      participants,
      tricksByPlayer: { p1: 2, p2: 1, p3: 2 },
      anteAmount: ante,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: () => ante,
    });
    assert.equal(result.carryOverPot, 3);
    assert.equal(result.deltas.p1, -ante);
    assert.equal(result.deltas.p2, -ante);
    assert.equal(result.deltas.p3, -ante);
    assert.notEqual(result.deltas.p1, 0.5);
  });

  it("10 — single bourré player pays full settled pot on next deal", () => {
    const scoreById = freshScores(four);
    const postedAntes = Object.fromEntries(four.map((pid) => [pid, ante]));
    const result = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 1 },
      scoreById,
      sessionStake: ante,
      postedAntes,
      buyInFallback: buyIn,
    });
    const settledPot = 4;
    assert.equal(result.debug.settledHandPot, settledPot);
    assert.deepEqual(result.debug.bourrePlayers, ["p3"]);
    assert.equal(result.deal.collected.postedAntes.p3, settledPot);
  });

  it("11 — multiple bourré players each pay full settled pot", () => {
    const previousPot = 250;
    const carryIn = previousPot - ante * four.length;
    const scoreById = freshScores(four);
    const postedAntes = Object.fromEntries(four.map((pid) => [pid, ante]));
    const result = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
      scoreById,
      sessionStake: ante,
      carryIn,
      postedAntes,
      buyInFallback: buyIn,
    });
    assert.equal(result.debug.settledHandPot, previousPot);
    assert.equal(result.deal.collected.postedAntes.p3, previousPot);
    assert.equal(result.deal.collected.postedAntes.p4, previousPot);
    assert.equal(
      result.deal.collected.nextHandPot,
      previousPot + previousPot * 2 + ante * 2,
    );
  });

  it("12 — folded player pays no bourré penalty", () => {
    const active = ["p1", "p2"];
    const scoreById = freshScores(three);
    const postedAntes = { p1: ante, p2: ante };
    const result = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: active,
      tricksByPlayer: { p1: 3, p2: 2 },
      scoreById,
      sessionStake: ante,
      postedAntes,
      buyInFallback: buyIn,
    });
    assert.deepEqual(result.debug.bourrePlayers, []);
    assert.equal(result.debug.bourreReplacementDuePersisted.p3, undefined);
  });

  it("13 — bourré penalty basis is the full settled prior pot", () => {
    const settledPot = 250;
    const flags = nextDealFundingFlags({
      playerId: "p3",
      mode: "win",
      winners: ["p1"],
      bourreIds: ["p3"],
      settledPot,
    });
    assert.equal(flags.bourreReplacementDue, settledPot);
    assert.equal(
      bourrePlayerIds({ p1: 3, p2: 2, p3: 0, p4: 0 }, four).length,
      2,
    );
  });

  it("14 — next-hand ante includes bourré replacement due correctly", () => {
    const scoreById = freshScores(four);
    const settlement = simulateRecordHandSettlement({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 1 },
      scoreById,
      sessionStake: ante,
      postedAntes: Object.fromEntries(four.map((pid) => [pid, ante])),
      buyInFallback: buyIn,
    });
    const deal = simulatePagatHandStartFunding({
      scoreById: settlement.scoreById,
      nextDealFunding: settlement.nextDealFunding,
      carryOverPot: settlement.carryOverPot,
      participantIds: four,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    assert.equal(deal.collected.postedAntes.p3, settlement.debug.settledHandPot);
    assert.equal(deal.collected.postedAntes.p1, ante);
    assert.equal(deal.collected.postedAntes.p2, ante);
    assert.equal(deal.collected.postedAntes.p4, ante);
  });

  it("15 — integration: persisted settlement → next deal funding (production path)", () => {
    const scoreById = freshScores(four);
    const postedAntes = Object.fromEntries(four.map((pid) => [pid, ante]));
    const fresh = runProductionSettlementDealFlow({
      mode: "co_win_carry",
      winners: ["p1", "p2"],
      participants: four,
      tricksByPlayer: { p1: 2, p2: 2, p3: 1, p4: 0 },
      scoreById,
      sessionStake: ante,
      postedAntes,
      buyInFallback: buyIn,
    });
    const stale = runProductionSettlementDealFlow(
      {
        mode: "co_win_carry",
        winners: ["p1", "p2"],
        participants: four,
        tricksByPlayer: { p1: 2, p2: 2, p3: 1, p4: 0 },
        scoreById,
        sessionStake: ante,
        postedAntes,
        buyInFallback: buyIn,
      },
      { staleDealRead: true },
    );
    assert.equal(stale.deal.collected.postedAntes.p4, fresh.deal.collected.postedAntes.p4);
    assert.ok(stale.deal.collected.postedAntes.p4 > ante);
    assert.equal(stale.settlement.carryOverPot, fresh.settlement.carryOverPot);
    assert.ok(stale.settlement.carryOverPot > 0);
    assert.equal(stale.debug.staleReadRecovered, true);
  });
});
