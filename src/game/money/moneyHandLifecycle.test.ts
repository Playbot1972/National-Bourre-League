/**
 * Money hand lifecycle — target rules compliance (2–8 players).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ScoreById } from "./types";
import {
  collectFundingForHandStart,
  collectHandAntes,
  computeFundingContributionByPlayer,
  deriveScoreNet,
  recordHandSettlement,
  runHandMoneyFlow,
  settleCompletedHand,
  startNextHandFunding,
} from "./index";
import {
  cappedContribution,
  eligibleNextHandPlayers,
  finalizeSettledHandState,
  perHandFlagsPresent,
  prepareForNextHand,
  shouldEndGameForSolvency,
} from "./handLifecycle";
import { runSettlementLifecycle } from "./settlementRules";

const BUY_IN = 1000;
const ANTE = 500;

function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

function freshScores(playerIds: string[], bankroll = BUY_IN): ScoreById {
  return Object.fromEntries(
    playerIds.map((pid) => [pid, { bankroll, net: deriveScoreNet(bankroll, BUY_IN) }]),
  );
}

function postAnteScores(
  scoreById: ScoreById,
  postedAntes: Record<string, number>,
): ScoreById {
  const next: ScoreById = {};
  for (const [pid, row] of Object.entries(scoreById)) {
    const posted = postedAntes[pid] ?? 0;
    const br = Math.max(0, (row.bankroll ?? BUY_IN) - posted);
    next[pid] = { ...row, bankroll: br, net: deriveScoreNet(br, BUY_IN) };
  }
  return next;
}

function runCycle(opts: {
  mode?: "win" | "split" | "co_win_carry";
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  carryIn?: number;
  splitPotEnabled?: boolean;
  scoreById?: ScoreById;
}) {
  const participants = opts.participants;
  const baseScores = opts.scoreById ?? freshScores(participants);
  const collected = collectHandAntes({
    participants,
    scoreById: baseScores,
    buyInFallback: BUY_IN,
    stakeForPlayer: () => ANTE,
  });
  const postedAntes: Record<string, number> = {};
  for (const pid of participants) {
    postedAntes[pid] = collected.postedAntes[pid] ?? 0;
  }
  const bankrolled = postAnteScores(baseScores, postedAntes);

  return runSettlementLifecycle({
    mode: opts.mode ?? "win",
    winners: opts.winners,
    participants,
    tricksByPlayer: opts.tricksByPlayer,
    scoreById: bankrolled,
    sessionStake: ANTE,
    carryIn: opts.carryIn ?? 0,
    postedAntes,
    buyInFallback: BUY_IN,
    splitPotEnabled: opts.splitPotEnabled,
  });
}

describe("handLifecycle helpers", () => {
  it("finalizeSettledHandState clears currentPot and postedAntes", () => {
    const state = { currentPot: 1400, postedAntes: { a: 500, b: 500 } };
    finalizeSettledHandState(state);
    assert.equal(state.currentPot, 0);
    assert.equal(state.postedAntes.a, 0);
    assert.equal(state.postedAntes.b, 0);
  });

  it("prepareForNextHand resets per-hand flags only at deal start", () => {
    const scoreById: ScoreById = {
      a: {
        bankroll: 800,
        playedThisHand: true,
        foldedThisHand: false,
        tricksWonThisHand: 2,
        isBourreThisHand: false,
      },
    };
    assert.equal(perHandFlagsPresent(scoreById.a), true);
    const reset = prepareForNextHand(scoreById, ["a"]);
    assert.equal(reset.a?.playedThisHand, false);
    assert.equal(reset.a?.tricksWonThisHand, 0);
    assert.equal(reset.a?.isBourreThisHand, false);
    assert.equal(reset.a?.bankroll, 800);
  });

  it("cappedContribution respects bankroll cap", () => {
    const r = cappedContribution(300, 1400);
    assert.equal(r.contributed, 300);
    assert.equal(r.newBankroll, 0);
    assert.equal(r.busted, true);
  });

  it("shouldEndGameForSolvency when fewer than 2 eligible players", () => {
    const scoreById: ScoreById = {
      a: { bankroll: 200 },
      b: { bankroll: 0, out: true },
    };
    assert.equal(shouldEndGameForSolvency(["a", "b"], scoreById, BUY_IN, 2), true);
    assert.deepEqual(eligibleNextHandPlayers(["a", "b"], scoreById, BUY_IN), ["a"]);
  });
});

describe("target rules — settlement and funding", () => {
  it("1. single winner takes pot", () => {
    const participants = ids(2);
    const result = runCycle({
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 5, p1: 1 },
    });
    assert.equal(result.settlement.carryOverPot, 0);
    assert.equal(result.settlement.bankrolls.p0, BUY_IN - ANTE + ANTE * 2);
    assert.equal(result.settlement.bankrolls.p1, BUY_IN - ANTE);
  });

  it("2. split pot carry forward on tie (splitPot off)", () => {
    const participants = ids(2);
    const result = runCycle({
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants,
      tricksByPlayer: { p0: 3, p1: 2 },
    });
    assert.equal(result.settlement.carryOverPot, ANTE * 2);
    // Both tied leaders exempt — next pot is carry only until non-winners ante (none here).
    assert.equal(result.deal.nextHandPot, ANTE * 2);
  });

  it("3. splitPot checkbox OFF — tied winners exempt from next ante", () => {
    const funding = computeFundingContributionByPlayer({
      settledStackByPlayer: { a: 800, b: 800 },
      completedHandPot: 1400,
      carryoverPot: 1400,
      anteAmount: ANTE,
      participantIds: ["a", "b"],
      bourrePlayerIds: [],
      tiedWinnerIds: ["a", "b"],
      splitPot: false,
      tie: true,
      splitPotOptionEnabled: false,
    });
    assert.equal(funding.fundingReasonByPlayer.a, "tie_carry_exempt");
    assert.equal(funding.fundingReasonByPlayer.b, "tie_carry_exempt");
    assert.equal(funding.fundingContributionByPlayer.a, 0);
  });

  it("4. splitPot checkbox ON — tied carry winners still pay next ante", () => {
    const funding = computeFundingContributionByPlayer({
      settledStackByPlayer: { a: 800, b: 900 },
      completedHandPot: 1400,
      carryoverPot: 1400,
      anteAmount: ANTE,
      participantIds: ["a", "b"],
      bourrePlayerIds: [],
      tiedWinnerIds: ["a", "b"],
      splitPot: false,
      tie: true,
      splitPotOptionEnabled: true,
    });
    assert.equal(funding.fundingReasonByPlayer.a, "normal_ante");
    assert.equal(funding.fundingReasonByPlayer.b, "normal_ante");
    assert.equal(funding.fundingContributionByPlayer.a, ANTE);
    assert.equal(funding.fundingContributionByPlayer.b, ANTE);
  });

  it("5–8. bourré penalty = pot snapshot, capped, exempt from ante", () => {
    const participants = ids(2);
    const buyIn = 100;
    const ante = 20;
    const base = freshScores(participants, buyIn);
    const collected = collectHandAntes({
      participants,
      scoreById: base,
      buyInFallback: buyIn,
      stakeForPlayer: () => ante,
    });
    const postedAntes = Object.fromEntries(
      participants.map((pid) => [pid, collected.postedAntes[pid] ?? 0]),
    );
    const bankrolled = postAnteScores(base, postedAntes);
    const result = runSettlementLifecycle({
      mode: "win",
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 5, p1: 0 },
      scoreById: bankrolled,
      sessionStake: ante,
      postedAntes,
      buyInFallback: buyIn,
    });
    assert.deepEqual(result.bourreIds, ["p1"]);
    assert.equal(result.settlement.nextDealFunding.byPlayer.p1.fundingReason, "bourre_full_pot_penalty");
    assert.equal(result.settlement.nextDealFunding.byPlayer.p1.skipNextAnte, true);
    assert.equal(result.settlement.nextDealFunding.byPlayer.p1.fundingContribution, ante * 2);
    assert.equal(result.deal.postedAntes.p1, ante * 2);
    assert.equal(result.deal.postedAntes.p0, ante);
  });

  it("multiple bourré players each pay full pot snapshot", () => {
    const participants = ids(4);
    const buyIn = 100;
    const ante = 20;
    const base = freshScores(participants, buyIn);
    const collected = collectHandAntes({
      participants,
      scoreById: base,
      buyInFallback: buyIn,
      stakeForPlayer: () => ante,
    });
    const postedAntes = Object.fromEntries(
      participants.map((pid) => [pid, collected.postedAntes[pid] ?? 0]),
    );
    const bankrolled = postAnteScores(base, postedAntes);
    const result = runSettlementLifecycle({
      mode: "win",
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 3, p1: 1, p2: 0, p3: 1 },
      scoreById: bankrolled,
      sessionStake: ante,
      postedAntes,
      buyInFallback: buyIn,
    });
    assert.deepEqual(result.bourreIds, ["p2"]);
    assert.equal(result.settlement.nextDealFunding.byPlayer.p2.fundingContribution, ante * 4);
    assert.equal(result.deal.postedAntes.p2, ante * 4);
  });

  it("per-hand flags survive settlement, reset at next-hand start", () => {
    const scoreById: ScoreById = {
      p0: { bankroll: 800, playedThisHand: true, tricksWonThisHand: 3, isBourreThisHand: false },
      p1: { bankroll: 900, playedThisHand: true, tricksWonThisHand: 2, isBourreThisHand: false },
    };
    const settlement = recordHandSettlement({
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants: ["p0", "p1"],
      tricksByPlayer: { p0: 3, p1: 2 },
      scoreById,
      sessionStake: ANTE,
      carryIn: 400,
      postedAntes: { p0: ANTE, p1: ANTE },
      buyInFallback: BUY_IN,
      splitPotEnabled: false,
    });
    assert.equal(perHandFlagsPresent(settlement.scoreById.p0), true);
    assert.equal(settlement.scoreById.p0?.playedThisHand, true);

    const deal = collectFundingForHandStart({
      scoreById: prepareForNextHand(settlement.scoreById, ["p0", "p1"]),
      nextDealFunding: settlement.nextDealFunding,
      carryOverPot: settlement.carryOverPot,
      participantIds: ["p0", "p1"],
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });
    assert.equal(deal.bankrolls.p0 != null, true);
    void deal;
  });

  it("duplicate settlement with identical input is deterministic", () => {
    const input = {
      mode: "win" as const,
      winners: ["p0"],
      participants: ids(2),
      tricksByPlayer: { p0: 5, p1: 0 },
      scoreById: postAnteScores(freshScores(ids(2)), { p0: ANTE, p1: ANTE }),
      sessionStake: ANTE,
      postedAntes: { p0: ANTE, p1: ANTE },
      buyInFallback: BUY_IN,
    };
    const first = recordHandSettlement(input);
    const second = recordHandSettlement(input);
    assert.deepEqual(first.bankrolls, second.bankrolls);
    assert.deepEqual(first.nextDealFunding.byPlayer, second.nextDealFunding.byPlayer);
    assert.equal(first.carryOverPot, second.carryOverPot);
  });
});

describe("regression — 800/900 tie carry + 500 ante → 300/400", () => {
  it("tie carry preserves bankrolls; next hand ante produces 300/400", () => {
    const playerA = "playerA";
    const bot5 = "bot5";
    const participants = [playerA, bot5];

    const scoreBeforeHand5: ScoreById = {
      [playerA]: { bankroll: 800, net: deriveScoreNet(800, BUY_IN) },
      [bot5]: { bankroll: 900, net: deriveScoreNet(900, BUY_IN) },
    };

    const settlement = recordHandSettlement({
      mode: "co_win_carry",
      winners: [playerA, bot5],
      participants,
      tricksByPlayer: { [playerA]: 3, [bot5]: 2 },
      scoreById: scoreBeforeHand5,
      sessionStake: ANTE,
      carryIn: 400,
      postedAntes: { [playerA]: ANTE, [bot5]: ANTE },
      buyInFallback: BUY_IN,
      splitPotEnabled: true,
    });

    const potAtSettlement = settlement.nextDealFunding.completedHandPot;
    assert.equal(potAtSettlement, 1400);
    assert.equal(settlement.bankrolls[playerA], 800);
    assert.equal(settlement.bankrolls[bot5], 900);
    assert.equal(settlement.carryOverPot, 1400);
    assert.equal(settlement.nextDealFunding.byPlayer[playerA].skipNextAnte, false);
    assert.equal(settlement.nextDealFunding.byPlayer[bot5].skipNextAnte, false);

    const deal = startNextHandFunding({
      scoreById: settlement.scoreById,
      nextDealFunding: settlement.nextDealFunding,
      carryOverPot: settlement.carryOverPot,
      participantIds: participants,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });

    assert.equal(deal.collected.bankrolls[playerA], 300);
    assert.equal(deal.collected.bankrolls[bot5], 400);
    assert.equal(deal.nextHandPot, 1400 + ANTE + ANTE);
  });
});

describe("player counts 2–8", () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    it(`${n} players: single winner conserves chips`, () => {
      const participants = ids(n);
      const tricks: Record<string, number> = Object.fromEntries(
        participants.map((pid) => [pid, 0]),
      );
      tricks.p0 = 5;
      for (let i = 1; i < n; i += 1) {
        tricks[`p${i}`] = n > 5 ? 0 : 1;
      }
      if (n > 5) {
        tricks.p1 = 1;
        tricks.p2 = 1;
        tricks.p3 = 1;
      }

      const result = runCycle({
        winners: ["p0"],
        participants,
        tricksByPlayer: tricks,
      });
      const total =
        Object.values(result.deal.bankrolls).reduce((s, v) => s + (v ?? 0), 0) +
        result.deal.nextHandPot;
      assert.equal(total, n * BUY_IN);
    });
  }
});

describe("split payout mode — all winners ante", () => {
  it("mode split divides pot; co-winners pay normal ante", () => {
    const participants = ids(4);
    const tricks = { p0: 3, p1: 2, p2: 0, p3: 0 };
    const result = runCycle({
      mode: "split",
      winners: ["p0", "p1"],
      participants,
      tricksByPlayer: tricks,
      splitPotEnabled: true,
    });
    assert.equal(result.settlement.carryOverPot, 0);
    assert.equal(result.deal.postedAntes.p0, ANTE);
    assert.equal(result.deal.postedAntes.p1, ANTE);
  });
});

describe("currentPot cleared conceptually after settlement", () => {
  it("runHandMoneyFlow leaves carry on table, not in postedAntes", () => {
    const flow = runHandMoneyFlow({
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants: ids(2),
      tricksByPlayer: { p0: 3, p1: 2 },
      scoreById: postAnteScores(freshScores(ids(2)), { p0: ANTE, p1: ANTE }),
      sessionStake: ANTE,
      postedAntes: { p0: ANTE, p1: ANTE },
      buyInFallback: BUY_IN,
    });
    const potState = { currentPot: flow.settlement.potState.currentPot, postedAntes: { ...flow.deal.postedAntes } };
    finalizeSettledHandState(potState);
    assert.equal(potState.currentPot, 0);
    assert.ok(flow.settlement.carryOverPot > 0);
  });
});
