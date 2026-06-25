import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertChipConservation,
  collectHandAntes,
  collectNextHandAntes,
  handAnteContribution,
  isChipConserved,
  recordHandSettlement,
  runHandMoneyFlow,
  sessionChipTotal,
  startNextHandFunding,
} from "./index";

const buyIn = 100;
const ante = 20;
const three = ["human", "bot1", "bot2"];

function freshScores(ids: string[] = three) {
  return Object.fromEntries(ids.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
}

function postedAnteHand(scoreById: Record<string, { bankroll: number; net: number }>) {
  return collectHandAntes({
    participants: three,
    scoreById,
    buyInFallback: buyIn,
    stakeForPlayer: (pid) => handAnteContribution(scoreById[pid], ante),
  });
}

describe("money engine — 3-player $20 ante (PR #344)", () => {
  it("winner takes pot; bourré pays at settlement; next pot = carry + two antes", () => {
    const scoreById = freshScores();
    const before = sessionChipTotal(scoreById, { buyInFallback: buyIn });
    assert.equal(before, 300);

    const deal = postedAnteHand(scoreById);
    const bankrolled = Object.fromEntries(
      three.map((pid) => [pid, { ...scoreById[pid], bankroll: deal.bankrolls[pid] }]),
    );

    const settlement = recordHandSettlement({
      mode: "win",
      winners: ["human"],
      participants: three,
      tricksByPlayer: { human: 3, bot1: 2, bot2: 0 },
      scoreById: bankrolled,
      sessionStake: ante,
      carryIn: 0,
      postedAntes: deal.postedAntes,
      buyInFallback: buyIn,
    });

    assert.equal(settlement.scoreById.human.bankroll, 140);
    assert.equal(settlement.scoreById.bot1.bankroll, 80);
    assert.equal(settlement.scoreById.bot2.bankroll, 20);
    assert.equal(settlement.carryOverPot, 60);
    assert.equal(settlement.scoreById.bot2.skipNextAnte, true);
    assert.equal(settlement.scoreById.bot1.skipNextAnte, undefined);

    assertChipConservation(
      Object.fromEntries(
        three.map((pid) => [pid, { bankroll: settlement.scoreById[pid].bankroll! }]),
      ),
      { carryOverPot: settlement.carryOverPot, buyInFallback: buyIn, expectedTotal: 300 },
    );

    const next = startNextHandFunding({
      scoreById: settlement.scoreById,
      nextDealFunding: settlement.nextDealFunding,
      carryOverPot: settlement.carryOverPot,
      participantIds: three,
      sessionStake: ante,
      buyInFallback: buyIn,
    });

    assert.equal(next.collected.postedAntes.bot2, 0);
    assert.equal(next.collected.postedAntes.human, ante);
    assert.equal(next.collected.postedAntes.bot1, ante);
    assert.equal(next.nextHandPot, 100);

    assertChipConservation(
      Object.fromEntries(
        three.map((pid) => [pid, { bankroll: next.collected.bankrolls[pid] }]),
      ),
      {
        carryOverPot: settlement.carryOverPot,
        postedAntes: next.collected.postedAntes,
        buyInFallback: buyIn,
        expectedTotal: 300,
      },
    );
  });

  it("runHandMoneyFlow matches recordHandSettlement + startNextHandFunding", () => {
    const scoreById = freshScores();
    const deal = postedAnteHand(scoreById);
    const bankrolled = Object.fromEntries(
      three.map((pid) => [pid, { ...scoreById[pid], bankroll: deal.bankrolls[pid] }]),
    );

    const flow = runHandMoneyFlow({
      mode: "win",
      winners: ["human"],
      participants: three,
      tricksByPlayer: { human: 3, bot1: 2, bot2: 0 },
      scoreById: bankrolled,
      sessionStake: ante,
      postedAntes: deal.postedAntes,
      buyInFallback: buyIn,
    });

    assert.equal(flow.deal.nextHandPot, 100);
    assert.equal(flow.settlement.carryOverPot, 60);
  });
});

describe("money engine — edge cases", () => {
  it("co_win_carry carries full pot plus bourré match", () => {
    const scoreById = freshScores();
    const settlement = recordHandSettlement({
      mode: "co_win_carry",
      winners: ["human", "bot2"],
      participants: three,
      tricksByPlayer: { human: 2, bot1: 1, bot2: 2 },
      scoreById,
      sessionStake: 1,
      buyInFallback: buyIn,
    });
    assert.equal(settlement.carryOverPot, 3);
    assert.equal(settlement.scoreById.human.skipNextAnte, true);
    assert.equal(settlement.scoreById.bot2.skipNextAnte, true);
    assert.equal(settlement.scoreById.bot1.skipNextAnte, undefined);
  });

  it("split divides pot among co-winners", () => {
    const scoreById = freshScores();
    const settlement = recordHandSettlement({
      mode: "split",
      winners: ["human", "bot1"],
      participants: three,
      tricksByPlayer: { human: 2, bot1: 2, bot2: 1 },
      scoreById,
      sessionStake: 1,
      buyInFallback: buyIn,
    });
    assert.ok(settlement.scoreById.human.bankroll! > buyIn - 1);
    assert.ok(settlement.scoreById.bot1.bankroll! > buyIn - 1);
    assert.equal(settlement.carryOverPot, 0);
  });

  it("bourré bust shortfall defers bourreReplacementDue and conserves chips", () => {
    const five = ["p0", "p1", "p2", "p3", "p4"];
    const scoreById = Object.fromEntries(five.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const deal = collectHandAntes({
      participants: five,
      scoreById,
      buyInFallback: buyIn,
      stakeForPlayer: () => ante,
    });
    const bankrolled = Object.fromEntries(
      five.map((pid) => [pid, { ...scoreById[pid], bankroll: deal.bankrolls[pid] }]),
    );

    const settlement = recordHandSettlement({
      mode: "win",
      winners: ["p0"],
      participants: five,
      tricksByPlayer: { p0: 2, p1: 1, p2: 1, p3: 1, p4: 0 },
      scoreById: bankrolled,
      sessionStake: ante,
      postedAntes: deal.postedAntes,
      buyInFallback: buyIn,
    });

    assert.equal(settlement.carryOverPot, 80);
    assert.equal(settlement.scoreById.p4.bourreReplacementDue, 20);
    assert.ok(
      isChipConserved(
        Object.fromEntries(five.map((pid) => [pid, { bankroll: settlement.scoreById[pid].bankroll! }])),
        { carryOverPot: settlement.carryOverPot, buyInFallback: buyIn, expectedTotal: 500 },
      ),
    );
  });

  it("collectNextHandAntes exempts bourré skipNextAnte only", () => {
    const scoreById = freshScores();
    scoreById.bot2 = { ...scoreById.bot2, skipNextAnte: true };
    const next = collectNextHandAntes({
      carryOverPot: 60,
      participantIds: three,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    assert.equal(next.postedAntes.bot2, 0);
    assert.equal(next.postedAntes.human, ante);
    assert.equal(next.nextHandPot, 100);
  });
});
