/**
 * Full settlement reconciliation — 2–8 players, bourré, carry/split, I'm Out, endgame.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ScoreById } from "./types";
import {
  collectFundingForHandStart,
  collectHandAntes,
  computeRebuyContributions,
  deriveScoreNet,
  processBuyIn,
  processRebuy,
  recordHandSettlement,
  scoreBankroll,
  sessionChipTotal,
} from "./index";
import {
  isSoleSurvivor,
  resolveHandOutcome,
  runSettlementLifecycle,
  solventPlayerIds,
} from "./settlementRules";

const BUY_IN = 100;
const ANTE = 20;

function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

function freshScores(playerIds: string[]): ScoreById {
  return Object.fromEntries(
    playerIds.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]),
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

interface CycleOpts {
  mode?: "win" | "split" | "co_win_carry" | "non_winner_ante_up" | "push";
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  carryIn?: number;
  splitPotEnabled?: boolean;
  scoreById?: ScoreById;
}

function runOneHandCycle(opts: CycleOpts) {
  const participants = opts.participants;
  const postedAntes: Record<string, number> = {};
  const baseScores = opts.scoreById ?? freshScores(participants);
  const collected = collectHandAntes({
    participants,
    scoreById: baseScores,
    buyInFallback: BUY_IN,
    stakeForPlayer: () => ANTE,
  });
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

function tableChipTotalAll(
  allPlayerIds: string[],
  handParticipantIds: string[],
  deal: { bankrolls: Record<string, number>; postedAntes: Record<string, number> },
  idleScores: ScoreById,
): number {
  const inHand = sessionChipTotal(
    Object.fromEntries(
      handParticipantIds.map((pid) => [pid, { bankroll: deal.bankrolls[pid] ?? 0 }]),
    ),
    { carryOverPot: 0, postedAntes: deal.postedAntes, buyInFallback: BUY_IN },
  );
  const idle = allPlayerIds
    .filter((pid) => !handParticipantIds.includes(pid))
    .reduce((sum, pid) => sum + scoreBankroll(idleScores[pid], BUY_IN), 0);
  return inHand + idle;
}

function tricksNoBourre(n: number): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  if (n === 2) {
    t.p0 = 4;
    t.p1 = 1;
    return t;
  }
  for (let i = 0; i < n; i += 1) {
    t[`p${i}`] = 1;
  }
  t.p0 = 5 - (n - 1);
  return t;
}

function tricksTieLeaders(n: number, leaderCount = 2): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  const perLeader = Math.floor(5 / leaderCount);
  let rem = 5 - perLeader * leaderCount;
  for (let i = 0; i < leaderCount; i += 1) {
    t[`p${i}`] = perLeader + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
  }
  return t;
}

function tricksMultiBourre(n: number): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  t.p0 = 2;
  t.p1 = 1;
  t.p2 = 1;
  t.p3 = 1;
  return t;
}

describe("settlement scenarios — player counts (2–8)", () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    it(`${n} players: clear winner conserves chips through settle + next ante`, () => {
      const participants = ids(n);
      const tricks = n <= 5 ? tricksNoBourre(n) : tricksMultiBourre(n);
      const result = runOneHandCycle({
        winners: ["p0"],
        participants,
        tricksByPlayer: tricks,
      });
      const expectedTotal = n * BUY_IN;
      assert.equal(result.chipTotalAfterSettlement, expectedTotal);
      assert.equal(result.chipTotalAfterFunding, expectedTotal);
      assert.ok(result.deal.nextHandPot > 0);
    });
  }
});

describe("settlement scenarios — I'm Out / subset participants", () => {
  it("only 2 of 4 stay in — pot is 2 antes, non-participants untouched", () => {
    const all = ids(4);
    const participants = ["p0", "p1"];
    const scores = freshScores(all);
    const result = runOneHandCycle({
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 4, p1: 1 },
      scoreById: scores,
    });
    assert.equal(result.settlement.potState.maxWinThisHand, ANTE * 2);
    assert.equal(scoreBankroll(scores.p2, BUY_IN), BUY_IN);
    assert.equal(scoreBankroll(scores.p3, BUY_IN), BUY_IN);
    assert.equal(tableChipTotalAll(all, participants, result.deal, scores), 4 * BUY_IN);
  });

  it("3 of 8 stay in — bourré among active only", () => {
    const all = ids(8);
    const participants = ["p0", "p1", "p2"];
    const scores = freshScores(all);
    const result = runOneHandCycle({
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 3, p1: 2, p2: 0 },
      scoreById: scores,
    });
    assert.deepEqual(result.bourreIds, ["p2"]);
    assert.equal(tableChipTotalAll(all, participants, result.deal, scores), 8 * BUY_IN);
  });
});

describe("settlement scenarios — ties, split pot, carry", () => {
  it("2p tie carry with splitPotEnabled ON: leaders pay next ante", () => {
    const participants = ids(2);
    const tricks = { p0: 3, p1: 2 };
    const result = runOneHandCycle({
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants,
      tricksByPlayer: tricks,
      splitPotEnabled: true,
    });
    assert.equal(result.settlement.carryOverPot, ANTE * 2);
    assert.equal(result.settlement.nextDealFunding.byPlayer.p0.skipNextAnte, false);
    assert.equal(result.settlement.nextDealFunding.byPlayer.p1.skipNextAnte, false);
    assert.equal(result.deal.postedAntes.p0, ANTE);
    assert.equal(result.deal.postedAntes.p1, ANTE);
    assert.equal(result.deal.nextHandPot, ANTE * 2 + ANTE + ANTE);
  });

  it("3p tie carry (co_win_carry): pot carries, leaders exempt from next ante", () => {
    const participants = ids(3);
    const tricks = { p0: 2, p1: 2, p2: 1 };
    const result = runOneHandCycle({
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants,
      tricksByPlayer: tricks,
    });
    assert.equal(result.settlement.carryOverPot, ANTE * 3);
    assert.equal(result.settlement.nextDealFunding.byPlayer.p0.skipNextAnte, true);
    assert.equal(result.settlement.nextDealFunding.byPlayer.p1.skipNextAnte, true);
    assert.equal(result.deal.postedAntes.p2, ANTE);
    assert.equal(result.deal.nextHandPot, ANTE * 3 + ANTE);
  });

  it("4p tie with splitPotEnabled: pot split, all winners ante next hand", () => {
    const participants = ids(4);
    const tricks = tricksTieLeaders(4, 2);
    const result = runOneHandCycle({
      mode: "split",
      winners: ["p0", "p1"],
      participants,
      tricksByPlayer: tricks,
      splitPotEnabled: true,
    });
    assert.equal(result.settlement.carryOverPot, 0);
    const pot = ANTE * 4;
    const p0Gain = (result.settlement.bankrolls.p0 ?? 0) - (BUY_IN - ANTE);
    const p1Gain = (result.settlement.bankrolls.p1 ?? 0) - (BUY_IN - ANTE);
    assert.equal(p0Gain + p1Gain, pot);
    assert.equal(result.deal.postedAntes.p0, ANTE);
    assert.equal(result.deal.postedAntes.p1, ANTE);
  });

  it("4p everyone took one trick — co_win_carry with all tied", () => {
    const participants = ids(4);
    const tricks = { p0: 1, p1: 1, p2: 1, p3: 2 };
    const result = runOneHandCycle({
      mode: "co_win_carry",
      winners: ["p3"],
      participants,
      tricksByPlayer: tricks,
    });
    assert.equal(result.settlement.carryOverPot, 0);
    assert.equal(result.bourreIds.length, 0);
  });
});

describe("settlement scenarios — bourré", () => {
  it("2p bourré: winner +120, loser pays full pot next hand (symmetrical)", () => {
    const participants = ids(2);
    const result = runOneHandCycle({
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 5, p1: 0 },
    });
    assert.deepEqual(result.bourreIds, ["p1"]);
    assert.equal(result.settlement.bankrolls.p0, 120);
    assert.equal(result.settlement.bankrolls.p1, 80);
    assert.equal(result.deal.postedAntes.p1, 40);
    assert.equal(result.deal.postedAntes.p0, ANTE);
    assert.equal(result.deal.nextHandPot, 60);
    assert.equal(result.deal.bankrolls.p0, 100);
    assert.equal(result.deal.bankrolls.p1, 40);
    assert.equal(result.chipTotalAfterFunding, 200);
  });

  it("3p single bourré: bourré pays completedHandPot, others ante", () => {
    const participants = ids(3);
    const result = runOneHandCycle({
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 3, p1: 2, p2: 0 },
    });
    assert.deepEqual(result.bourreIds, ["p2"]);
    assert.equal(result.settlement.scoreById.p2?.skipNextAnte, true);
    assert.equal(result.deal.postedAntes.p2, 60);
    assert.equal(result.deal.nextHandPot, 100);
  });

  it("4p multi-bourré: each bourré pays full pot, no double ante", () => {
    const participants = ids(4);
    const result = runOneHandCycle({
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 3, p1: 1, p2: 0, p3: 1 },
    });
    assert.deepEqual(result.bourreIds, ["p2"]);
    assert.equal(result.deal.postedAntes.p2, 80);
    assert.equal(result.deal.postedAntes.p1, ANTE);
    assert.equal(result.deal.postedAntes.p3, ANTE);
    assert.equal(result.deal.nextHandPot, 80 + ANTE + ANTE + ANTE);
  });

  it("tie carry + multi-bourré: carry + bourré penalties fund next pot", () => {
    const participants = ids(4);
    const tricks = { p0: 2, p1: 2, p2: 0, p3: 1 };
    const result = runOneHandCycle({
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants,
      tricksByPlayer: tricks,
    });
    assert.equal(result.settlement.carryOverPot, 80);
    assert.deepEqual(result.bourreIds, ["p2"]);
    assert.equal(result.deal.nextHandPot, 80 + 80 + ANTE);
    assert.equal(result.deal.postedAntes.p0 ?? 0, 0);
    assert.equal(result.deal.postedAntes.p1 ?? 0, 0);
    assert.equal(result.deal.postedAntes.p3, ANTE);
  });
});

describe("settlement scenarios — bankroll zero, rebuy, elimination", () => {
  it("bourré bust: remainder deferred, collected at next deal", () => {
    const participants = ids(8);
    const result = runOneHandCycle({
      winners: ["p0"],
      participants,
      tricksByPlayer: tricksMultiBourre(8),
    });
    for (const pid of ["p4", "p5", "p6", "p7"]) {
      assert.equal(result.settlement.scoreById[pid]?.bourreReplacementDue, 80);
      assert.equal(result.deal.bankrolls[pid], 0);
      assert.equal(result.deal.postedAntes[pid], 80);
    }
    assert.equal(result.chipTotalAfterFunding, 8 * BUY_IN);
  });

  it("rebuy restores bankroll without funding pot", () => {
    const rebuyPlan = computeRebuyContributions({
      stackByPlayer: { p1: 0 },
      participantIds: ["p1"],
      rebuyEnabled: true,
      rebuyAmount: BUY_IN,
    });
    assert.equal(rebuyPlan.rebuyContributionByPlayer.p1, BUY_IN);
    const rebuy = processRebuy({
      actionId: "rebuy:scenario",
      playerId: "p1",
      buyInAmount: BUY_IN,
      ledger: {
        version: 1,
        buyInFallback: BUY_IN,
        bankrolls: { p0: 200, p1: 0 },
        nets: { p0: 100, p1: -100 },
        carryOverPot: 0,
        postedAntes: {},
        scoreFlags: {},
        sequence: 0,
      },
    });
    assert.equal(rebuy.newBankrolls.p1, BUY_IN);
    assert.equal(rebuy.invariants.ok, true);
  });

  it("eliminated player (out) excluded from solvent count", () => {
    const scoreById: ScoreById = {
      p0: { bankroll: 200, net: 100 },
      p1: { bankroll: 0, net: -100, out: true },
    };
    assert.deepEqual(solventPlayerIds(scoreById, ids(2), BUY_IN), ["p0"]);
    assert.equal(isSoleSurvivor(scoreById, ids(2), BUY_IN).ended, true);
    assert.equal(isSoleSurvivor(scoreById, ids(2), BUY_IN).winnerId, "p0");
  });
});

describe("settlement scenarios — play to one final winner", () => {
  it("2p repeated wins concentrate all chips with conservation", () => {
    const playerIds = ids(2);
    let scoreById = freshScores(playerIds);
    let nextDealFunding: ReturnType<typeof recordHandSettlement>["nextDealFunding"] | null =
      null;
    let carryOverPot = 0;
    const sessionTotal = 2 * BUY_IN;

    for (let hand = 0; hand < 6; hand += 1) {
      const deal = collectFundingForHandStart({
        scoreById,
        nextDealFunding,
        carryOverPot,
        participantIds: playerIds,
        sessionStake: ANTE,
        buyInFallback: BUY_IN,
      });

      const bankrolled: ScoreById = Object.fromEntries(
        playerIds.map((pid) => [
          pid,
          {
            ...scoreById[pid],
            bankroll: deal.bankrolls[pid] ?? scoreBankroll(scoreById[pid], BUY_IN),
            net: deriveScoreNet(deal.bankrolls[pid] ?? 0, BUY_IN),
          },
        ]),
      );

      const settlement = recordHandSettlement({
        mode: "win",
        winners: ["p0"],
        participants: playerIds,
        tricksByPlayer: { p0: 5, p1: 0 },
        scoreById: bankrolled,
        sessionStake: ANTE,
        carryIn: carryOverPot,
        postedAntes: deal.postedAntes,
        buyInFallback: BUY_IN,
      });

      carryOverPot = settlement.carryOverPot;
      nextDealFunding = settlement.nextDealFunding;
      scoreById = settlement.scoreById;

      const chipAfterSettle = sessionChipTotal(scoreById, {
        carryOverPot,
        postedAntes: {},
        buyInFallback: BUY_IN,
      });
      assert.equal(chipAfterSettle, sessionTotal, `hand ${hand + 1} chip total`);
    }

    const survivor = isSoleSurvivor(scoreById, playerIds, BUY_IN);
    assert.equal(survivor.ended, true);
    assert.equal(survivor.winnerId, "p0");
    assert.equal(scoreBankroll(scoreById.p0, BUY_IN), 200);
    assert.equal(scoreBankroll(scoreById.p1, BUY_IN), 0);
  });
});

describe("settlement scenarios — resolveHandOutcome", () => {
  it("splitPotEnabled gates split branch on co_win_carry ties", () => {
    const withSplit = resolveHandOutcome({
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants: ids(3),
      tricksByPlayer: tricksTieLeaders(3, 2),
      splitPotEnabled: true,
    });
    assert.equal(withSplit.branch.splitPot, false);

    const explicitSplit = resolveHandOutcome({
      mode: "split",
      winners: ["p0", "p1"],
      participants: ids(3),
      tricksByPlayer: tricksTieLeaders(3, 2),
      splitPotEnabled: false,
    });
    assert.equal(explicitSplit.branch.splitPot, true);
  });
});

describe("settlement scenarios — buy-in baseline", () => {
  it("processBuyIn seeds N × buy-in before any hand", () => {
    const buyIn = processBuyIn({
      actionId: "buyin:8p",
      playerIds: ids(8),
      buyInAmount: BUY_IN,
    });
    assert.equal(Object.keys(buyIn.newBankrolls).length, 8);
    assert.equal(
      Object.values(buyIn.newBankrolls).reduce((s, n) => s + n, 0),
      8 * BUY_IN,
    );
    assert.equal(buyIn.invariants.ok, true);
  });
});
