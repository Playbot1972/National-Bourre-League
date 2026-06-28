/**
 * Canonical two-phase money engine — regression tests per production refactor spec.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyFundingWithSolvency,
  buildNextDealFunding,
  computeCarryoverPot,
  computeFundingContributionByPlayer,
  computeRebuyContributions,
  computeSplitPotPayout,
  emptyLedgerState,
  ledgerChipTotal,
  mergeNextDealFundingIntoScoreById,
  processRebuy,
  recordHandSettlement,
  runCanonicalMoneyFlow,
  runHandMoneyFlow,
  sessionChipTotal,
  settleCompletedHand,
  startNextHandFunding,
  validateMoneyInvariants,
  validateChipGrowthInvariant,
  tableChipTotal,
} from "./index";

const BUY_IN = 100;
const ANTE = 20;

function stacks(...amounts: number[]): Record<string, number> {
  return Object.fromEntries(amounts.map((n, i) => [`p${i}`, n]));
}

function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

describe("canonical money engine — Phase 1 settlement", () => {
  it("1. normal single-winner, no bourré, splitPot false", () => {
    const participants = ["h", "b"];
    const phase1 = settleCompletedHand({
      completedHandPot: 40,
      stackByPlayer: { h: 80, b: 80 },
      participants,
      singleWinnerId: "h",
      bourrePlayerIds: [],
      splitPot: false,
    });
    assert.equal(phase1.carryoverPot, 0);
    assert.equal(phase1.payoutByPlayer.h, 40);
    assert.equal(phase1.settledStackByPlayer.h, 120);
    assert.equal(phase1.settledStackByPlayer.b, 80);

    const funding = computeFundingContributionByPlayer({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 40,
      carryoverPot: 0,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: [],
      tiedWinnerIds: [],
      splitPot: false,
      tie: false,
    });
    assert.equal(funding.fundingContributionByPlayer.h, ANTE);
    assert.equal(funding.fundingContributionByPlayer.b, ANTE);
    assert.equal(funding.fundingReasonByPlayer.h, "normal_ante");

    const applied = applyFundingWithSolvency({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 40,
      carryoverPot: 0,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: [],
      tiedWinnerIds: [],
      splitPot: false,
      tie: false,
    });
    assert.equal(applied.nextPot, 40);
    assert.equal(applied.collected.bankrolls.h, 100);
    assert.equal(applied.collected.bankrolls.b, 60);
  });

  it("2. single winner with one bourré — penalty at funding not settlement", () => {
    const participants = ["h", "b"];
    const phase1 = settleCompletedHand({
      completedHandPot: 40,
      stackByPlayer: { h: 80, b: 80 },
      participants,
      singleWinnerId: "h",
      bourrePlayerIds: ["b"],
      splitPot: false,
    });
    assert.equal(phase1.settledStackByPlayer.h, 120);
    assert.equal(phase1.settledStackByPlayer.b, 80);
    assert.equal(phase1.carryoverPot, 0);

    const funding = computeFundingContributionByPlayer({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 40,
      carryoverPot: 0,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: ["b"],
      tiedWinnerIds: [],
      splitPot: false,
      tie: false,
    });
    assert.equal(funding.fundingContributionByPlayer.b, 40);
    assert.equal(funding.fundingReasonByPlayer.b, "bourre_full_pot_penalty");
    assert.equal(funding.fundingContributionByPlayer.h, ANTE);
    assert.notEqual(funding.fundingReasonByPlayer.b, "normal_ante");

    const applied = applyFundingWithSolvency({
      ...funding,
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 40,
      carryoverPot: 0,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: ["b"],
      tiedWinnerIds: [],
      splitPot: false,
      tie: false,
    });
    assert.equal(applied.nextPot, 60);
    assert.equal(applied.collected.bankrolls.h, 100);
    assert.equal(applied.collected.bankrolls.b, 40);
  });

  it("4. tie, splitPot false — carryover and tied ante-exempt", () => {
    const participants = ["a", "b", "c"];
    const phase1 = settleCompletedHand({
      completedHandPot: 60,
      stackByPlayer: { a: 80, b: 80, c: 80 },
      participants,
      tiedWinnerIds: ["a", "b"],
      bourrePlayerIds: [],
      splitPot: false,
    });
    assert.equal(phase1.carryoverPot, 60);
    assert.equal(computeCarryoverPot(60, true, false), 60);

    const funding = computeFundingContributionByPlayer({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 60,
      carryoverPot: 60,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: [],
      tiedWinnerIds: ["a", "b"],
      splitPot: false,
      tie: true,
    });
    assert.equal(funding.fundingContributionByPlayer.a, 0);
    assert.equal(funding.fundingContributionByPlayer.b, 0);
    assert.equal(funding.fundingReasonByPlayer.a, "tie_carry_exempt");
    assert.equal(funding.fundingContributionByPlayer.c, ANTE);

    const applied = applyFundingWithSolvency({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 60,
      carryoverPot: 60,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: [],
      tiedWinnerIds: ["a", "b"],
      splitPot: false,
      tie: true,
    });
    assert.equal(applied.nextPot, 80);
  });

  it("6. tie, splitPot true, even split", () => {
    const participants = ["a", "b", "c"];
    const payouts = computeSplitPotPayout(60, ["a", "b"], participants);
    assert.equal(payouts.a + payouts.b, 60);

    const phase1 = settleCompletedHand({
      completedHandPot: 60,
      stackByPlayer: { a: 80, b: 80, c: 80 },
      participants,
      tiedWinnerIds: ["a", "b"],
      bourrePlayerIds: [],
      splitPot: true,
    });
    assert.equal(phase1.carryoverPot, 0);
    assert.equal(phase1.settledStackByPlayer.a, 110);
    assert.equal(phase1.settledStackByPlayer.b, 110);

    const funding = computeFundingContributionByPlayer({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 60,
      carryoverPot: 0,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: [],
      tiedWinnerIds: ["a", "b"],
      splitPot: true,
      tie: true,
    });
    assert.equal(funding.fundingContributionByPlayer.a, ANTE);
    assert.equal(funding.fundingContributionByPlayer.b, ANTE);
  });

  it("7. tie, splitPot true, uneven split — deterministic remainder", () => {
    const participants = ["a", "b", "c"];
    const payouts = computeSplitPotPayout(61, ["a", "b"], participants);
    assert.equal(payouts.a + payouts.b, 61);
    assert.ok(payouts.a === 31 || payouts.b === 31);
  });

  it("3. multi-bourré — each pays completedHandPot, exempt from ante", () => {
    const participants = ids(4);
    const phase1 = settleCompletedHand({
      completedHandPot: 80,
      stackByPlayer: stacks(120, 80, 80, 80),
      participants,
      singleWinnerId: "p0",
      bourrePlayerIds: ["p2", "p3"],
      splitPot: false,
    });
    const funding = computeFundingContributionByPlayer({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 80,
      carryoverPot: 0,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: ["p2", "p3"],
      tiedWinnerIds: [],
      splitPot: false,
      tie: false,
    });
    assert.equal(funding.fundingContributionByPlayer.p2, 80);
    assert.equal(funding.fundingContributionByPlayer.p3, 80);
    assert.equal(funding.fundingContributionByPlayer.p1, ANTE);
    const applied = applyFundingWithSolvency({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 80,
      carryoverPot: 0,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: ["p2", "p3"],
      tiedWinnerIds: [],
      splitPot: false,
      tie: false,
    });
    assert.equal(applied.nextPot, 80 + 80 + ANTE + ANTE);
  });

  it("5. tie + multi-bourré, splitPot false", () => {
    const participants = ["a", "b", "c", "d"];
    const phase1 = settleCompletedHand({
      completedHandPot: 80,
      stackByPlayer: { a: 80, b: 80, c: 80, d: 80 },
      participants,
      tiedWinnerIds: ["a", "b"],
      bourrePlayerIds: ["c", "d"],
      splitPot: false,
    });
    assert.equal(phase1.carryoverPot, 80);
    const applied = applyFundingWithSolvency({
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: 80,
      carryoverPot: 80,
      anteAmount: ANTE,
      participantIds: participants,
      bourrePlayerIds: ["c", "d"],
      tiedWinnerIds: ["a", "b"],
      splitPot: false,
      tie: true,
    });
    assert.equal(applied.nextPot, 80 + 80 + 80);
  });
});

describe("canonical money engine — integration", () => {
  it("3p bourré hand via recordHandSettlement + startNextHandFunding", () => {
    const three = ["human", "bot1", "bot2"];
    const scoreById = Object.fromEntries(three.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]));
    const dealAntes = { human: ANTE, bot1: ANTE, bot2: ANTE };
    const bankrolled = Object.fromEntries(
      three.map((pid) => [pid, { ...scoreById[pid], bankroll: BUY_IN - ANTE }]),
    );

    const settlement = recordHandSettlement({
      mode: "win",
      winners: ["human"],
      participants: three,
      tricksByPlayer: { human: 3, bot1: 2, bot2: 0 },
      scoreById: bankrolled,
      sessionStake: ANTE,
      carryIn: 0,
      postedAntes: dealAntes,
      buyInFallback: BUY_IN,
    });

    assert.equal(settlement.scoreById.human.bankroll, 140);
    assert.equal(settlement.scoreById.bot2.bankroll, 80);
    assert.equal(settlement.carryOverPot, 0);
    assert.equal(settlement.scoreById.bot2.skipNextAnte, true);
    assert.equal(
      settlement.nextDealFunding.byPlayer.bot2.fundingContribution,
      60,
    );
    assert.equal(
      settlement.nextDealFunding.byPlayer.bot2.fundingReason,
      "bourre_full_pot_penalty",
    );

    const next = startNextHandFunding({
      scoreById: settlement.scoreById,
      nextDealFunding: settlement.nextDealFunding,
      carryOverPot: settlement.carryOverPot,
      participantIds: three,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });

    assert.equal(next.collected.postedAntes.bot2, 60);
    assert.equal(next.collected.postedAntes.human, ANTE);
    assert.equal(next.nextHandPot, 100);
    assert.equal(next.collected.bankrolls.bot2, 20);

    const total = sessionChipTotal(
      Object.fromEntries(three.map((pid) => [pid, { bankroll: next.collected.bankrolls[pid] }])),
      { carryOverPot: settlement.carryOverPot, postedAntes: next.collected.postedAntes, buyInFallback: BUY_IN },
    );
    assert.equal(total, 300);
  });

  it("10. duplicate charge regression — bourré never pays penalty + ante", () => {
    const result = runCanonicalMoneyFlow({
      mode: "win",
      winners: ["p0"],
      participants: ids(2),
      tricksByPlayer: { p0: 5, p1: 0 },
      scoreById: Object.fromEntries(ids(2).map((pid) => [pid, { bankroll: 80, net: -20 }])),
      sessionStake: ANTE,
      postedAntes: { p0: ANTE, p1: ANTE },
      buyInFallback: BUY_IN,
    });
    for (const pid of ids(2)) {
      const reason = result.fundingReasonByPlayer[pid];
      if (reason === "bourre_full_pot_penalty") {
        assert.notEqual(result.fundingReasonByPlayer[pid], "normal_ante");
      }
    }
    const inv = validateMoneyInvariants({
      result,
      participantIds: ids(2),
      anteAmount: ANTE,
    });
    assert.equal(inv.ok, true, inv.errors.join("; "));
  });

  it("11. mergeNextDealFundingIntoScoreById applies authoritative values once", () => {
    const funding = buildNextDealFunding(
      settleCompletedHand({
        completedHandPot: 40,
        stackByPlayer: { h: 120, b: 80 },
        participants: ["h", "b"],
        singleWinnerId: "h",
        bourrePlayerIds: ["b"],
        splitPot: false,
      }),
      applyFundingWithSolvency({
        settledStackByPlayer: { h: 120, b: 80 },
        completedHandPot: 40,
        carryoverPot: 0,
        anteAmount: ANTE,
        participantIds: ["h", "b"],
        bourrePlayerIds: ["b"],
        tiedWinnerIds: [],
        splitPot: false,
        tie: false,
      }),
      ["h", "b"],
    );

    const merged = mergeNextDealFundingIntoScoreById(
      { h: { bankroll: 120 }, b: { bankroll: 80 } },
      funding,
    );
    assert.equal(merged.b.fundingContribution, 40);
    assert.equal(merged.b.skipNextAnte, true);

    const mergedAgain = mergeNextDealFundingIntoScoreById(merged, funding);
    assert.equal(mergedAgain.b.fundingContribution, 40);
  });

  it("9. start-of-hand bankrolls are post-funding only", () => {
    const flow = runHandMoneyFlow({
      mode: "win",
      winners: ["p0"],
      participants: ids(2),
      tricksByPlayer: { p0: 4, p1: 1 },
      scoreById: Object.fromEntries(ids(2).map((pid) => [pid, { bankroll: 80, net: -20 }])),
      sessionStake: ANTE,
      postedAntes: { p0: ANTE, p1: ANTE },
      buyInFallback: BUY_IN,
    });
    assert.equal(flow.deal.collected.bankrolls.p0, 100);
    assert.equal(flow.deal.collected.bankrolls.p1, 60);
    assert.equal(flow.deal.nextHandPot, 40);
  });

  it("13. rebuy increases chip total by explicit amount only — not mixed into pot", () => {
    const before = ledgerChipTotal(emptyLedgerState(BUY_IN));

    const rebuyPlan = computeRebuyContributions({
      stackByPlayer: { bot: 0 },
      participantIds: ["bot"],
      rebuyEnabled: true,
      rebuyAmount: BUY_IN,
      rebuyPlayerIds: ["bot"],
    });
    assert.equal(rebuyPlan.rebuyContributionByPlayer.bot, BUY_IN);

    const rebuy = processRebuy({
      actionId: "rebuy:test",
      playerId: "bot",
      buyInAmount: BUY_IN,
      ledger: {
        ...emptyLedgerState(BUY_IN),
        bankrolls: { bot: 0 },
        nets: { bot: -BUY_IN },
      },
    });
    assert.equal(rebuy.newBankrolls.bot, BUY_IN);
    assert.equal(rebuy.newEvents[0]?.metadata?.fundingReason, "rebuy");

    const after = ledgerChipTotal({
      ...emptyLedgerState(BUY_IN),
      bankrolls: rebuy.newBankrolls,
    });
    assert.equal(after - before, BUY_IN);
  });

  it("14. chip total only grows via rebuy — settlement and funding are zero-sum", () => {
    const participants = ids(2);
    const postedAntes = { p0: ANTE, p1: ANTE };
    const stackBefore = { p0: 80, p1: 80 };

    const flow = runCanonicalMoneyFlow({
      mode: "win",
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 5, p1: 0 },
      scoreById: Object.fromEntries(
        participants.map((pid) => [pid, { bankroll: 80, net: -20 }]),
      ),
      sessionStake: ANTE,
      postedAntes,
      buyInFallback: BUY_IN,
    });

    const beforeSettle = tableChipTotal({
      bankrolls: stackBefore,
      carryOverPot: 0,
      postedAntes,
    });
    const afterSettle = tableChipTotal({
      bankrolls: flow.settledStackByPlayer,
      carryOverPot: flow.carryoverPot,
      postedAntes: {},
    });
    assert.equal(
      validateChipGrowthInvariant({ before: beforeSettle, after: afterSettle, label: "settlement" }).ok,
      true,
    );

    const afterFunding = tableChipTotal({
      bankrolls: flow.nextStartStackByPlayer,
      carryOverPot: flow.nextPot,
      postedAntes: {},
    });
    assert.equal(
      validateChipGrowthInvariant({
        before: afterSettle,
        after: afterFunding,
        label: "funding",
      }).ok,
      true,
    );
    assert.equal(afterFunding, beforeSettle);

    const inv = validateMoneyInvariants({
      result: flow,
      participantIds: participants,
      anteAmount: ANTE,
      stackBeforeSettlement: stackBefore,
      postedAntesBeforeSettlement: postedAntes,
    });
    assert.equal(inv.ok, true, inv.errors.join("; "));

    const rebuyBefore = ledgerChipTotal(emptyLedgerState(BUY_IN));
    const rebuy = processRebuy({
      actionId: "rebuy:growth-test",
      playerId: "bot",
      buyInAmount: BUY_IN,
      ledger: { ...emptyLedgerState(BUY_IN), bankrolls: { bot: 0 }, nets: { bot: -BUY_IN } },
    });
    assert.equal(rebuy.invariants.ok, true, rebuy.invariants.errors.join("; "));
    assert.equal(ledgerChipTotal({ ...emptyLedgerState(BUY_IN), bankrolls: rebuy.newBankrolls }) - rebuyBefore, BUY_IN);
  });
});
