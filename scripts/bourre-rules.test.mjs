import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeHandPotState,
  settleHandDeltas,
  normalizeBourreSettings,
  resolveSessionBuyIn,
  applyBankrollDelta,
  applySolventSettlement,
  canEnrollWithBankroll,
  collectHandAntes,
  scoreBankroll,
  settleSoloDefaultWin,
  handAnteContribution,
  nextDealFundingFlags,
  sumProjectedHandAntes,
  projectNextHandPot,
  collectNextHandAntes,
  bourrePlayerIds,
  isHandComplete,
  sessionChipTotal,
  deriveScoreNet,
  anteAlreadyPosted,
  bourreRemaindersFromSettlement,
  DEFAULT_HAND_ANTE,
  eligibleIdsForAnteCollection,
  recordHandSettlement,
} from "../docs/bourre-rules.js";

describe("buy-in settings normalization", () => {
  it("maps legacy anteAmount-only config to buy-in with default per-hand ante", () => {
    const settings = normalizeBourreSettings({ anteAmount: 100, limEnabled: true });
    assert.equal(settings.buyInAmount, 100);
    assert.equal(settings.anteAmount, DEFAULT_HAND_ANTE);
    assert.equal(settings.potCap, 20);
    assert.equal(settings.limEnabled, true);
  });

  it("keeps explicit buy-in separate from per-hand ante", () => {
    const settings = normalizeBourreSettings({
      buyInAmount: 500,
      anteAmount: 2,
      limEnabled: false,
    });
    assert.equal(settings.buyInAmount, 500);
    assert.equal(settings.anteAmount, 2);
    assert.equal(settings.potCap, 40);
  });

  it("allows fractional per-hand ante amounts", () => {
    const settings = normalizeBourreSettings({
      buyInAmount: 100,
      anteAmount: 0.25,
    });
    assert.equal(settings.buyInAmount, 100);
    assert.equal(settings.anteAmount, 0.25);
    assert.equal(settings.potCap, 5);
  });

  it("resolveSessionBuyIn prefers session buy-in over room settings", () => {
    assert.equal(
      resolveSessionBuyIn({ buyInAmount: 50 }, { buyInAmount: 100 }),
      50,
    );
    assert.equal(resolveSessionBuyIn({}, { anteAmount: 25 }), 25);
  });
});

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

  it("computeHandPotState preserves explicit session ante (not legacy default 1)", () => {
    const state = computeHandPotState({
      anteAmount: 5,
      limEnabled: false,
      carryIn: 0,
      antePot: 15,
    });
    assert.equal(state.anteAmount, 5);
    assert.equal(state.potCap, 100);
  });

  it("winner take-all settlement assigns pot to winner", () => {
    const participants = ["p1", "p2", "p3"];
    const result = settleHandDeltas({
      mode: "win",
      winners: ["p1"],
      participants,
      tricksByPlayer: { p1: 3, p2: 1, p3: 1 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.ok(result.deltas.p1 > 0);
    assert.ok(result.deltas.p2 < 0);
    assert.deepEqual(result.bourreIds, []);
    assert.equal(result.deltas.p3, -1);
    assert.equal(result.deltas.p2, -1);
    assert.equal(result.carryOverPot, 0);
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

  it("push carries pot forward without bourré when tricks are not complete", () => {
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
    assert.equal(result.carryOverPot, 2);
    assert.equal(result.deltas.p1, -1);
    assert.equal(result.deltas.p2, -1);
    assert.deepEqual(result.bourreIds, []);
  });

  it("bourrePlayerIds is empty before five tricks are played", () => {
    assert.deepEqual(bourrePlayerIds({ p1: 0, p2: 0 }, ["p1", "p2"]), []);
    assert.equal(isHandComplete({ p1: 0, p2: 0 }, ["p1", "p2"]), false);
  });

  it("bourrePlayerIds marks stayed-in zero-trick losers after hand completes", () => {
    assert.deepEqual(
      bourrePlayerIds({ p1: 5, p2: 0 }, ["p1", "p2"]),
      ["p2"],
    );
    assert.deepEqual(
      bourrePlayerIds({ p1: 3, p2: 2, p3: 0 }, ["p1", "p2", "p3"]),
      ["p3"],
    );
  });

  it("push carries pot and collects bourré pot match at settlement", () => {
    const participants = ["p1", "p2", "p3", "p4", "p5"];
    const tricksByPlayer = Object.fromEntries(participants.map((pid) => [pid, 0]));
    tricksByPlayer.p1 = 5;
    assert.deepEqual(bourrePlayerIds(tricksByPlayer, participants), ["p2", "p3", "p4", "p5"]);
    const result = settleHandDeltas({
      mode: "push",
      winners: [],
      participants,
      tricksByPlayer,
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.equal(result.bourreIds.length, 4);
    assert.equal(result.carryOverPot, 5);
    assert.equal(result.bourreMatch, 20);
    assert.equal(result.deltas.p2, -1);
    assert.equal(result.deltas.p3, -1);
  });

  it("co_win_carry carries pot on tied most tricks (e.g. 2-1-2)", () => {
    const participants = ["p1", "p2", "p3"];
    const result = settleHandDeltas({
      mode: "co_win_carry",
      winners: ["p1", "p3"],
      participants,
      tricksByPlayer: { p1: 2, p2: 1, p3: 2 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.ok(result.carryOverPot > 0);
    assert.equal(result.deltas.p1, -1);
    assert.equal(result.deltas.p2, -1);
    assert.equal(result.deltas.p3, -1);
    assert.deepEqual(result.bourreIds, []);
  });

  it("non_winner_ante_up carries pot when co-winners disagree", () => {
    const participants = ["p1", "p2", "p3"];
    const result = settleHandDeltas({
      mode: "non_winner_ante_up",
      winners: ["p1", "p2"],
      participants,
      tricksByPlayer: { p1: 2, p2: 2, p3: 1 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.ok(result.carryOverPot > 0);
    assert.ok(result.deltas.p3 < 0);
    assert.deepEqual(result.bourreIds, []);
  });
});

describe("bankroll solvency", () => {
  it("applyBankrollDelta clamps losses at remaining stack", () => {
    const result = applyBankrollDelta(3, -10);
    assert.equal(result.newBankroll, 0);
    assert.equal(result.appliedDelta, -3);
    assert.equal(result.busted, true);
  });

  it("applySolventSettlement collects bourré pot match at settlement", () => {
    const participants = ["p1", "p2", "p3"];
    const nominal = settleHandDeltas({
      mode: "win",
      winners: ["p1"],
      participants,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: () => 1,
    });
    const scoreById = {
      p1: { bankroll: 10, net: 0 },
      p2: { bankroll: 5, net: 0 },
      p3: { bankroll: 2, net: 0 },
    };
    const solvent = applySolventSettlement({
      mode: "win",
      winners: ["p1"],
      participants,
      nominalDeltas: nominal.deltas,
      scoreById,
      carryOverPot: nominal.carryOverPot,
      buyInFallback: 10,
      stakeForPlayer: () => 1,
    });
    assert.equal(solvent.bankrolls.p3, 0);
    assert.equal(solvent.appliedDeltas.p3, -2);
    assert.ok(solvent.bustedIds.includes("p3"));
    assert.equal(solvent.carryOverPot, 0);
  });

  it("bourré replacement can bust a short bankroll on the next deal", () => {
    const collected = collectHandAntes({
      participants: ["p3"],
      scoreById: { p3: { bankroll: 2, bourreReplacementDue: 5 } },
      buyInFallback: 10,
      stakeForPlayer: (pid) => handAnteContribution({ bourreReplacementDue: 5 }, 1),
    });
    assert.equal(collected.bankrolls.p3, 0);
    assert.ok(collected.outIds.includes("p3"));
    assert.equal(collected.postedAntes.p3, 2);
  });

  it("canEnrollWithBankroll blocks zero stack", () => {
    assert.equal(canEnrollWithBankroll(0), false);
    assert.equal(canEnrollWithBankroll(1), true);
  });

  it("winner bankroll increases correctly with posted antes (2×$100, $20 ante)", () => {
    const buyIn = 100;
    const ante = 20;
    const participants = ["p1", "p2"];
    const scoreById = {
      p1: { bankroll: buyIn, net: 0 },
      p2: { bankroll: buyIn, net: 0 },
    };
    const collected = collectHandAntes({
      participants,
      scoreById,
      buyInFallback: buyIn,
      stakeForPlayer: () => ante,
    });
    assert.equal(collected.bankrolls.p1, 80);
    assert.equal(collected.bankrolls.p2, 80);
    const postedAntes = collected.postedAntes;
    const nominal = settleHandDeltas({
      mode: "win",
      winners: ["p1"],
      participants,
      tricksByPlayer: { p1: 3, p2: 2 },
      anteAmount: ante,
      limEnabled: false,
      carryIn: 0,
      antePot: ante * 2,
      stakeForPlayer: () => 0,
    });
    const solvent = applySolventSettlement({
      mode: "win",
      winners: ["p1"],
      participants,
      nominalDeltas: nominal.deltas,
      scoreById: Object.fromEntries(
        participants.map((pid) => [pid, { ...scoreById[pid], bankroll: collected.bankrolls[pid] }]),
      ),
      carryOverPot: nominal.carryOverPot,
      buyInFallback: buyIn,
      stakeForPlayer: () => 0,
    });
    assert.equal(solvent.bankrolls.p1, 120);
    assert.equal(solvent.bankrolls.p2, 80);
    const chipTotal = sessionChipTotal(
      Object.fromEntries(
        participants.map((pid) => [
          pid,
          { ...scoreById[pid], bankroll: solvent.bankrolls[pid] },
        ]),
      ),
      { carryOverPot: solvent.carryOverPot, postedAntes: {}, buyInFallback: buyIn },
    );
    assert.equal(chipTotal, 200);
  });

  it("scoreBankroll uses stored bankroll when present (v1 authoritative stack)", () => {
    const buyIn = 100;
    assert.equal(scoreBankroll({ bankroll: 100, net: 40 }, buyIn), 100);
    assert.equal(scoreBankroll({ bankroll: 120, net: 40 }, buyIn), 120);
    assert.equal(scoreBankroll({ bankroll: 0, net: -20 }, buyIn), 0);
    assert.equal(scoreBankroll({ net: 5 }, 20), 25);
    assert.equal(scoreBankroll({ net: -8 }, 20), 12);
  });

  it("handAnteContribution charges bourré replacement without normal ante", () => {
    assert.equal(handAnteContribution({ bourreReplacementDue: 5 }, 1), 5);
    assert.equal(handAnteContribution({ bourreReplacementDue: 5, skipNextAnte: true }, 1), 5);
    assert.equal(handAnteContribution({ skipNextAnte: true }, 1), 0);
    assert.equal(handAnteContribution({}, 1), 1);
  });

  it("sumProjectedHandAntes previews bourré replacement between deals", () => {
    const scoreById = {
      p1: { bankroll: 99 },
      p2: { bankroll: 95, bourreReplacementDue: 4 },
      p3: { bankroll: 95, bourreReplacementDue: 4 },
    };
    assert.equal(sumProjectedHandAntes(scoreById, ["p1", "p2", "p3"], 1), 9);
    assert.equal(
      sumProjectedHandAntes(scoreById, ["p1", "p2", "p3"], 1, { p1: 1 }),
      9,
    );
  });

  it("bourré player posts replacement only on the next deal", () => {
    const scoreById = {
      p1: { bankroll: 20, net: 0 },
      p2: { bankroll: 20, net: 0 },
      p3: { bankroll: 20, net: 0, bourreReplacementDue: 5 },
    };
    const result = collectHandAntes({
      participants: ["p1", "p2", "p3"],
      scoreById,
      buyInFallback: 10,
      stakeForPlayer: (pid) => handAnteContribution(scoreById[pid], 1),
    });
    assert.equal(result.postedAntes.p1, 1);
    assert.equal(result.postedAntes.p2, 1);
    assert.equal(result.postedAntes.p3, 5);
    const antePot = Object.values(result.postedAntes).reduce((sum, n) => sum + n, 0);
    assert.equal(antePot, 7);
  });

  it("collectHandAntes deducts ante at deal and marks busted players out", () => {
    const scoreById = {
      p1: { bankroll: 5, net: 0 },
      p2: { bankroll: 1, net: 0 },
      p3: { bankroll: 0, net: -10, out: true },
    };
    const result = collectHandAntes({
      participants: ["p1", "p2", "p3"],
      scoreById,
      buyInFallback: 10,
      stakeForPlayer: () => 2,
    });
    assert.equal(result.bankrolls.p1, 3);
    assert.equal(result.postedAntes.p1, 2);
    assert.equal(result.bankrolls.p2, 0);
    assert.equal(result.postedAntes.p2, 1);
    assert.ok(result.outIds.includes("p2"));
    assert.deepEqual(result.activeParticipants, ["p1"]);
  });

  it("keeps players who posted a full ante even when bankroll hits zero", () => {
    const scoreById = {
      p1: { bankroll: 1, net: 0 },
      p2: { bankroll: 1, net: 0 },
    };
    const result = collectHandAntes({
      participants: ["p1", "p2"],
      scoreById,
      buyInFallback: 1,
      stakeForPlayer: () => 1,
    });
    assert.deepEqual(result.activeParticipants, ["p1", "p2"]);
    assert.equal(result.bankrolls.p1, 0);
    assert.equal(result.bankrolls.p2, 0);
    assert.deepEqual(result.outIds, []);
  });
});

describe("solo default win (Pagat)", () => {
  it("awards carry plus posted ante to the sole player", () => {
    const result = settleSoloDefaultWin({
      winnerId: "p1",
      carryIn: 5,
      scoreById: { p1: { bankroll: 10 } },
      buyInFallback: 10,
      stakeForPlayer: () => 2,
    });
    assert.equal(result.ready, true);
    assert.equal(result.pot, 7);
    assert.equal(result.bankrolls.p1, 15);
    assert.equal(result.carryOverPot, 0);
  });
});

/** Mirrors recordHand score patches for next-deal funding flags. */
function applyNextDealFundingToScores(
  scoreById,
  { mode, winners, bourreIds, potState, participants, nominalDeltas, appliedDeltas },
) {
  const remainders =
    nominalDeltas && appliedDeltas
      ? bourreRemaindersFromSettlement(bourreIds, nominalDeltas, appliedDeltas)
      : {};
  for (const pid of participants) {
    const row = scoreById[pid];
    if (row.skipNextAnte) delete scoreById[pid].skipNextAnte;
    if (row.bourreReplacementDue != null) delete scoreById[pid].bourreReplacementDue;
    const funding = nextDealFundingFlags({
      playerId: pid,
      mode,
      winners,
      bourreIds,
      settledPot: potState.currentPot,
      bourreReplacementRemainder: remainders[pid] ?? null,
    });
    if (funding.bourreReplacementDue != null) {
      scoreById[pid].bourreReplacementDue = funding.bourreReplacementDue;
    }
    if (funding.skipNextAnte) {
      scoreById[pid].skipNextAnte = true;
    }
  }
}

/** Simulate deal → settlement with posted antes (matches firestore recordHand flow). */
function runPostedAnteHand({
  scoreById,
  participants,
  carryOverPot = 0,
  buyIn = 100,
  ante = 1,
  mode = "win",
  winners,
  tricksByPlayer,
}) {
  const beforeTotal = sessionChipTotal(scoreById, {
    carryOverPot,
    postedAntes: {},
    buyInFallback: buyIn,
  });

  const collected = collectHandAntes({
    participants,
    scoreById,
    buyInFallback: buyIn,
    stakeForPlayer: (pid) => handAnteContribution(scoreById[pid], ante),
  });

  const carryInForPot = carryOverPot;
  const postedAntes = collected.postedAntes;

  const midTotal = sessionChipTotal(
    Object.fromEntries(
      participants.map((pid) => [pid, { ...scoreById[pid], bankroll: collected.bankrolls[pid] }]),
    ),
    { carryOverPot, postedAntes, buyInFallback: buyIn },
  );
  assert.equal(midTotal, beforeTotal, "chips conserved after ante collection");

  const active = collected.activeParticipants;
  const antePot = Object.values(postedAntes).reduce((sum, n) => sum + n, 0);
  const activeScoreById = Object.fromEntries(
    active.map((pid) => [
      pid,
      {
        ...scoreById[pid],
        bankroll: collected.bankrolls[pid],
      },
    ]),
  );

  const settlement = recordHandSettlement({
    mode,
    winners,
    participants: active,
    tricksByPlayer,
    scoreById: activeScoreById,
    sessionStake: ante,
    limEnabled: false,
    carryIn: carryInForPot,
    postedAntes,
    buyInFallback: buyIn,
  });

  for (const pid of active) {
    scoreById[pid] = { ...settlement.scoreById[pid] };
    scoreById[pid].net = (scoreById[pid].bankroll ?? 0) - buyIn;
  }

  const carry = settlement.carryOverPot;

  const afterTotal = sessionChipTotal(scoreById, {
    carryOverPot: carry,
    postedAntes: {},
    buyInFallback: buyIn,
  });
  assert.equal(afterTotal, beforeTotal, "chips conserved after settlement");

  return {
    carryOverPot: carry,
    bourreIds: settlement.bourreIds,
    potState: settlement.potState,
    collected,
    settlement,
  };
}

describe("bankroll conservation invariant", () => {
  const buyIn = 100;
  const ante = 1;
  const three = ["p1", "p2", "p3"];

  it("does not double-deduct ante when already posted at deal", () => {
    const scoreById = {
      p1: { bankroll: 99, net: -1 },
      p2: { bankroll: 99, net: -1 },
      p3: { bankroll: 99, net: -1 },
    };
    const postedAntes = { p1: 1, p2: 1, p3: 1 };
    const stakeForSettlement = () => 0;
    const nominal = settleHandDeltas({
      mode: "win",
      winners: ["p1"],
      participants: three,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
      anteAmount: ante,
      limEnabled: false,
      carryIn: 0,
      antePot: 3,
      stakeForPlayer: stakeForSettlement,
    });
    const solvent = applySolventSettlement({
      mode: "win",
      winners: ["p1"],
      participants: three,
      nominalDeltas: nominal.deltas,
      scoreById,
      carryOverPot: nominal.carryOverPot,
      buyInFallback: buyIn,
      stakeForPlayer: stakeForSettlement,
    });
    assert.equal(solvent.bankrolls.p1, 102);
    assert.equal(solvent.bankrolls.p2, 99);
    assert.equal(solvent.bankrolls.p3, 96);
    assert.equal(nominal.carryOverPot, 0);
    assert.equal(nominal.bourreMatch, 3);
    assert.equal(
      sessionChipTotal(
        Object.fromEntries(three.map((pid) => [pid, { bankroll: solvent.bankrolls[pid] }])),
        { carryOverPot: nominal.carryOverPot, postedAntes: {}, buyInFallback: buyIn },
      ),
      297,
    );
    assert.deepEqual(nominal.bourreIds, ["p3"]);
    assert.equal(nominal.potState.maxWinThisHand, 3);
  });

  it("conserves chips through deal and win settlement for three players", () => {
    const scoreById = Object.fromEntries(three.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    runPostedAnteHand({
      scoreById,
      participants: three,
      buyIn,
      ante,
      winners: ["p1"],
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
    });
    assert.equal(scoreById.p1.bankroll, 102);
    assert.equal(scoreById.p2.bankroll, 99);
    assert.equal(scoreById.p3.bankroll, 99);
    assert.equal(scoreById.p3.skipNextAnte, true);
    assert.equal(scoreById.p3.fundingContribution, 3);
  });

  it("each bourré player defers full pot penalty to next deal and skips next ante", () => {
    const four = ["p1", "p2", "p3", "p4"];
    const scoreById = Object.fromEntries(four.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const { potState } = runPostedAnteHand({
      scoreById,
      participants: four,
      buyIn,
      ante,
      winners: ["p1"],
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
    });
    assert.equal(scoreById.p3.bankroll, 99);
    assert.equal(scoreById.p4.bankroll, 99);
    assert.equal(scoreById.p3.skipNextAnte, true);
    assert.equal(scoreById.p4.skipNextAnte, true);
    assert.equal(scoreById.p3.fundingContribution, 4);
    assert.equal(potState.maxWinThisHand, 4);
  });

  it("forgives uncollected bourré replacement when player busts (no chip mint)", () => {
    const scoreById = { p3: { bankroll: 2, bourreReplacementDue: 5 } };
    const before = sessionChipTotal(scoreById, { buyInFallback: buyIn });
    const collected = collectHandAntes({
      participants: ["p3"],
      scoreById,
      buyInFallback: buyIn,
      stakeForPlayer: () => 5,
    });
    assert.equal(collected.bankrolls.p3, 0);
    assert.equal(collected.postedAntes.p3, 2);
    assert.equal(collected.uncollectedPenalties, 0);
    assert.ok(collected.outIds.includes("p3"));
    const after = sessionChipTotal(
      { p3: { ...scoreById.p3, bankroll: collected.bankrolls.p3 } },
      { postedAntes: collected.postedAntes, buyInFallback: buyIn },
    );
    assert.equal(after, before);
  });

  it("co_win_carry preserves chips and carries the full pot forward", () => {
    const scoreById = Object.fromEntries(three.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const { carryOverPot } = runPostedAnteHand({
      scoreById,
      participants: three,
      buyIn,
      ante,
      mode: "co_win_carry",
      winners: ["p1", "p3"],
      tricksByPlayer: { p1: 2, p2: 1, p3: 2 },
    });
    assert.equal(carryOverPot, 3);
    assert.equal(scoreById.p1.bankroll, 99);
    assert.equal(scoreById.p2.bankroll, 99);
    assert.equal(scoreById.p3.bankroll, 99);
    assert.equal(scoreById.p1.skipNextAnte, true);
    assert.equal(scoreById.p3.skipNextAnte, true);
    assert.equal(scoreById.p2.skipNextAnte, undefined);
  });

  it("session end reconciles when two players are broke and one remains solvent", () => {
    const scoreById = {
      p1: { bankroll: buyIn, net: 0 },
      p2: { bankroll: buyIn, net: 0 },
      p3: { bankroll: buyIn, net: 0 },
    };
    let carry = 0;

    for (let i = 0; i < 120; i += 1) {
      const participants = three.filter((pid) => !scoreById[pid].out);
      if (participants.length <= 1) break;
      const tricksByPlayer = { p1: 3, p2: 2 };
      if (participants.includes("p3")) tricksByPlayer.p3 = 0;
      if (participants.includes("p3")) {
        const nextPotApprox = carry + ante * participants.length;
        if (scoreById.p3.bankroll < nextPotApprox) break;
      }
      ({ carryOverPot: carry } = runPostedAnteHand({
        scoreById,
        participants,
        carryOverPot: carry,
        buyIn,
        ante,
        winners: ["p1"],
        tricksByPlayer,
      }));
      if (scoreById.p2.bankroll <= 0 && scoreById.p3.bankroll <= 0) break;
    }

    assert.equal(carry, 0, "bourré penalties fund the next deal, not carryOverPot");
    assert.ok(scoreById.p1.bankroll > buyIn, "winner collects pots across hands");
    assert.equal(
      sessionChipTotal(scoreById, { carryOverPot: carry, buyInFallback: buyIn }),
      buyIn * 3,
    );
    assert.equal(scoreById.p1.bankroll + scoreById.p2.bankroll + scoreById.p3.bankroll + carry, buyIn * 3);
  });
});

describe("bourré at next-deal funding", () => {
  const buyIn = 100;
  const ante = 1;

  it("nextDealFundingFlags: tied leaders skip ante; bourré skips ante after settlement", () => {
    const flags = nextDealFundingFlags({
      playerId: "p4",
      mode: "co_win_carry",
      winners: ["p1", "p2"],
      bourreIds: ["p4"],
      maxWinThisHand: 4,
    });
    assert.equal(flags.skipNextAnte, true);
    assert.equal(flags.bourreReplacementDue, null);

    const tied = nextDealFundingFlags({
      playerId: "p1",
      mode: "co_win_carry",
      winners: ["p1", "p2"],
      bourreIds: ["p4"],
      maxWinThisHand: 4,
    });
    assert.equal(tied.skipNextAnte, true);
    assert.equal(tied.bourreReplacementDue, null);

    const splitWinner = nextDealFundingFlags({
      playerId: "p1",
      mode: "split",
      winners: ["p1", "p2"],
      bourreIds: [],
      maxWinThisHand: 4,
    });
    assert.equal(splitWinner.skipNextAnte, false);
  });

  it("2-2-1-0: tied leaders skip ante; middle player antes; bourré pays at next deal", () => {
    const four = ["p1", "p2", "p3", "p4"];
    const scoreById = Object.fromEntries(four.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const { carryOverPot, bourreIds, potState } = runPostedAnteHand({
      scoreById,
      participants: four,
      buyIn,
      ante,
      mode: "co_win_carry",
      winners: ["p1", "p2"],
      tricksByPlayer: { p1: 2, p2: 2, p3: 1, p4: 0 },
    });

    assert.equal(carryOverPot, 4);
    assert.deepEqual(bourreIds, ["p4"]);
    assert.equal(potState.maxWinThisHand, 4);
    assert.equal(scoreById.p1.skipNextAnte, true);
    assert.equal(scoreById.p2.skipNextAnte, true);
    assert.equal(scoreById.p3.skipNextAnte, undefined);
    assert.equal(scoreById.p4.skipNextAnte, true);
    assert.equal(scoreById.p4.bankroll, 99);

    const nextDeal = collectNextHandAntes({
      carryOverPot,
      participantIds: four,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    assert.equal(nextDeal.postedAntes.p1, 0);
    assert.equal(nextDeal.postedAntes.p2, 0);
    assert.equal(nextDeal.postedAntes.p3, ante);
    assert.equal(nextDeal.postedAntes.p4, 4);
    assert.equal(nextDeal.nextHandPot, 9);
    assert.equal(
      sessionChipTotal(
        Object.fromEntries(four.map((pid) => [pid, { bankroll: nextDeal.bankrolls[pid] }])),
        { carryOverPot, postedAntes: nextDeal.postedAntes, buyInFallback: buyIn },
      ),
      buyIn * 4,
    );
  });

  it("2-1-2 tie without bourré: only tied players skip next ante", () => {
    const three = ["p1", "p2", "p3"];
    const scoreById = Object.fromEntries(three.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    runPostedAnteHand({
      scoreById,
      participants: three,
      buyIn,
      ante,
      mode: "co_win_carry",
      winners: ["p1", "p3"],
      tricksByPlayer: { p1: 2, p2: 1, p3: 2 },
    });
    const nextDeal = collectHandAntes({
      participants: three,
      scoreById,
      buyInFallback: buyIn,
      stakeForPlayer: (pid) => handAnteContribution(scoreById[pid], ante),
    });
    assert.equal(nextDeal.postedAntes.p1, 0);
    assert.equal(nextDeal.postedAntes.p2, 1);
    assert.equal(nextDeal.postedAntes.p3, 0);
  });

  it("win with bourré: winner takes pot; bourré penalty collected on next deal", () => {
    const three = ["p1", "p2", "p3"];
    const scoreById = Object.fromEntries(three.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const { carryOverPot, bourreIds, potState } = runPostedAnteHand({
      scoreById,
      participants: three,
      buyIn,
      ante,
      winners: ["p1"],
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
    });
    assert.deepEqual(bourreIds, ["p3"]);
    assert.equal(carryOverPot, 0);
    assert.equal(potState.maxWinThisHand, 3);
    assert.equal(scoreById.p1.bankroll, 102);
    assert.equal(scoreById.p3.bankroll, 99);
    assert.equal(scoreById.p3.skipNextAnte, true);
    const nextDeal = collectNextHandAntes({
      carryOverPot,
      participantIds: three,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    assert.equal(nextDeal.postedAntes.p3, 3);
    assert.equal(nextDeal.postedAntes.p1, ante);
    assert.equal(nextDeal.postedAntes.p2, ante);
    assert.equal(
      projectNextHandPot(carryOverPot, scoreById, three, ante, nextDeal.postedAntes),
      5,
    );
  });

  it("bourré win: winner takes pot; two bourré fund next deal + antes", () => {
    const four = ["p1", "p2", "p3", "p4"];
    const handAnte = 1;
    const previousPot = 250;
    const carryIn = previousPot - handAnte * four.length;
    const scoreById = Object.fromEntries(
      four.map((pid) => [pid, { bankroll: 1000, net: 0 }]),
    );
    const collected = collectHandAntes({
      participants: four,
      scoreById,
      buyInFallback: 1000,
      stakeForPlayer: () => handAnte,
    });
    const settlement = recordHandSettlement({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
      scoreById: Object.fromEntries(
        four.map((pid) => [pid, { ...scoreById[pid], bankroll: collected.bankrolls[pid] }]),
      ),
      sessionStake: handAnte,
      carryIn,
      postedAntes: collected.postedAntes,
      buyInFallback: 1000,
    });
    assert.equal(settlement.potState.currentPot, previousPot);
    assert.deepEqual(settlement.bourreIds, ["p3", "p4"]);
    assert.equal(settlement.carryOverPot, 0);
    assert.equal(settlement.scoreById.p1.bankroll, 999 + previousPot);
    assert.equal(settlement.scoreById.p3.bankroll, 999);
    assert.equal(settlement.scoreById.p4.bankroll, 999);

    for (const pid of four) {
      scoreById[pid] = { ...settlement.scoreById[pid] };
    }

    const nextDeal = collectNextHandAntes({
      carryOverPot: settlement.carryOverPot,
      participantIds: four,
      scoreById,
      sessionStake: handAnte,
      buyInFallback: 1000,
    });
    assert.equal(nextDeal.postedAntes.p3, previousPot);
    assert.equal(nextDeal.postedAntes.p4, previousPot);
    assert.equal(nextDeal.postedAntes.p1, handAnte);
    assert.equal(nextDeal.postedAntes.p2, handAnte);
    assert.equal(nextDeal.nextHandPot, previousPot * 2 + handAnte * 2);
  });

  it("co_win_carry with bourré carries tie pot only; bourreMatch is metadata", () => {
    const four = ["p1", "p2", "p3", "p4"];
    const result = settleHandDeltas({
      mode: "co_win_carry",
      winners: ["p1", "p2"],
      participants: four,
      tricksByPlayer: { p1: 2, p2: 2, p3: 1, p4: 0 },
      anteAmount: ante,
      limEnabled: false,
      carryIn: 0,
      antePot: 4,
      stakeForPlayer: () => 0,
    });
    assert.equal(result.carryOverPot, 4);
    assert.equal(result.deltas.p4, 0);
    assert.equal(result.bourreMatch, 4);
  });
});

describe("bourré pot payout scenarios", () => {
  const buyIn = 1000;
  const handAnte = 1;
  const four = ["p1", "p2", "p3", "p4"];

  it("one bourred player: replacement equals settled pot, no extra ante", () => {
    const scoreById = Object.fromEntries(four.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const settledPot = 4;
    scoreById.p3.bourreReplacementDue = settledPot;
    const carry = settledPot;
    const next = collectNextHandAntes({
      carryOverPot: carry,
      participantIds: four,
      scoreById,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    assert.equal(next.postedAntes.p3, settledPot);
    assert.equal(next.postedAntes.p1, handAnte);
    assert.equal(handAnteContribution(scoreById.p3, handAnte), settledPot);
    assert.equal(next.nextHandPot, carry + settledPot + handAnte * 3);
  });

  it("two bourred players: next pot = carry + 2× settled pot + other antes", () => {
    const previousPot = 250;
    const scoreById = Object.fromEntries(four.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    scoreById.p3.bourreReplacementDue = previousPot;
    scoreById.p4.bourreReplacementDue = previousPot;
    const next = collectNextHandAntes({
      carryOverPot: previousPot,
      participantIds: four,
      scoreById,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    assert.equal(next.postedAntes.p3, previousPot);
    assert.equal(next.postedAntes.p4, previousPot);
    assert.equal(next.postedAntes.p1, handAnte);
    assert.equal(next.postedAntes.p2, handAnte);
    assert.equal(next.nextHandPot, previousPot + previousPot * 2 + handAnte * 2);
    assert.equal(next.bankrolls.p3, buyIn - previousPot);
    assert.equal(next.bankrolls.p4, buyIn - previousPot);
  });

  it("bourred player is not charged session ante on top of replacement", () => {
    const replacement = 12;
    const row = { bankroll: 100, bourreReplacementDue: replacement };
    assert.equal(handAnteContribution(row, 1), replacement);
    const collected = collectHandAntes({
      participants: ["p1"],
      scoreById: { p1: row },
      buyInFallback: 100,
      stakeForPlayer: () => handAnteContribution(row, 1),
    });
    assert.equal(collected.postedAntes.p1, replacement);
    assert.notEqual(collected.postedAntes.p1, 1);
  });

  it("conserves chips across settlement deferral and next-deal collection", () => {
    const scoreById = Object.fromEntries(four.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const carry = 250;
    scoreById.p3.bourreReplacementDue = carry;
    scoreById.p4.bourreReplacementDue = carry;
    const before = sessionChipTotal(scoreById, { carryOverPot: carry, buyInFallback: buyIn });
    const next = collectNextHandAntes({
      carryOverPot: carry,
      participantIds: four,
      scoreById,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    const afterScores = Object.fromEntries(
      four.map((pid) => [pid, { ...scoreById[pid], bankroll: next.bankrolls[pid] }]),
    );
    const after = sessionChipTotal(afterScores, {
      carryOverPot: carry,
      postedAntes: next.postedAntes,
      buyInFallback: buyIn,
    });
    assert.equal(after, before);
  });

  it("pot winner receives bourré-funded next pot on clear win", () => {
    const scoreById = Object.fromEntries(four.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    let carry = 0;
    const collected1 = collectNextHandAntes({
      carryOverPot: carry,
      participantIds: four,
      scoreById,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    for (const pid of four) scoreById[pid].bankroll = collected1.bankrolls[pid];
    const settlement1 = recordHandSettlement({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
      scoreById: Object.fromEntries(
        four.map((pid) => [pid, { ...scoreById[pid], bankroll: collected1.bankrolls[pid] }]),
      ),
      sessionStake: handAnte,
      carryIn: carry,
      postedAntes: collected1.postedAntes,
      buyInFallback: buyIn,
    });
    assert.equal(settlement1.potState.currentPot, 4);
    assert.deepEqual(settlement1.bourreIds, ["p3", "p4"]);
    assert.equal(settlement1.carryOverPot, 0);
    carry = settlement1.carryOverPot;
    for (const pid of four) scoreById[pid] = { ...settlement1.scoreById[pid] };

    const collected2 = collectNextHandAntes({
      carryOverPot: carry,
      participantIds: four,
      scoreById,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    const pot2 = collected2.nextHandPot;
    for (const pid of four) scoreById[pid].bankroll = collected2.bankrolls[pid];
    const settlement2 = recordHandSettlement({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 1, p4: 1 },
      scoreById: Object.fromEntries(
        four.map((pid) => [pid, { ...scoreById[pid], bankroll: collected2.bankrolls[pid] }]),
      ),
      sessionStake: handAnte,
      carryIn: carry,
      postedAntes: collected2.postedAntes,
      buyInFallback: buyIn,
    });
    assert.equal(pot2, 10);
    assert.ok(settlement2.scoreById.p1.bankroll > collected2.bankrolls.p1);
    assert.equal(settlement2.scoreById.p1.bankroll, collected2.bankrolls.p1 + pot2);
  });

  it("stale deal score snapshot misses bourré replacement until scores are fresh", () => {
    const settledPot = 250;
    const staleScoreById = Object.fromEntries(
      four.map((pid) => [pid, { bankroll: buyIn, net: 0 }]),
    );
    const freshScoreById = {
      ...staleScoreById,
      p3: { bankroll: buyIn, net: 0, bourreReplacementDue: settledPot },
      p4: { bankroll: buyIn, net: 0, bourreReplacementDue: settledPot },
    };
    const stale = collectNextHandAntes({
      carryOverPot: settledPot,
      participantIds: four,
      scoreById: staleScoreById,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    const fresh = collectNextHandAntes({
      carryOverPot: settledPot,
      participantIds: four,
      scoreById: freshScoreById,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    assert.equal(stale.postedAntes.p3, handAnte);
    assert.equal(fresh.postedAntes.p3, settledPot);
    assert.ok(fresh.nextHandPot > stale.nextHandPot);
  });
});

describe("1–8 player bourré settlement (PR #344 invariant)", () => {
  const buyIn = 100;
  const ante = 1;

  /** Valid trick totals (5 tricks) with a single clear winner and ≥1 bourré where possible. */
  const winTricksByCount = {
    2: { p0: 5, p1: 0 },
    3: { p0: 3, p1: 2, p2: 0 },
    4: { p0: 3, p1: 1, p2: 1, p3: 0 },
    5: { p0: 2, p1: 1, p2: 1, p3: 1, p4: 0 },
    6: { p0: 2, p1: 1, p2: 1, p3: 1, p4: 0, p5: 0 },
    7: { p0: 2, p1: 1, p2: 1, p3: 1, p4: 0, p5: 0, p6: 0 },
    8: { p0: 2, p1: 1, p2: 1, p3: 1, p4: 0, p5: 0, p6: 0, p7: 0 },
  };

  function participantsFor(n) {
    return Array.from({ length: n }, (_, i) => `p${i}`);
  }

  function renameTricks(tricks, pids) {
    const out = {};
    pids.forEach((pid, i) => {
      out[pid] = tricks[`p${i}`] ?? 0;
    });
    return out;
  }

  it("solo default win conserves chips (1 player)", () => {
    const carryIn = 40;
    const scoreById = { solo: { bankroll: buyIn, net: 0 } };
    const before = sessionChipTotal(scoreById, {
      carryOverPot: carryIn,
      buyInFallback: buyIn,
    });
    const result = settleSoloDefaultWin({
      winnerId: "solo",
      carryIn,
      scoreById,
      buyInFallback: buyIn,
      stakeForPlayer: () => ante,
    });
    assert.equal(result.ready, true);
    assert.equal(result.pot, carryIn + ante);
    assert.equal(result.bankrolls.solo, buyIn - ante + carryIn + ante);
    const after = sessionChipTotal(
      { solo: { bankroll: result.bankrolls.solo } },
      { carryOverPot: 0, buyInFallback: buyIn },
    );
    assert.equal(after, before);
  });

  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    it(`${n} players: winner takes pot; bourré pays at next deal; next pot = penalties + non-bourré antes`, () => {
      const pids = participantsFor(n);
      const tricksByPlayer = renameTricks(winTricksByCount[n], pids);
      const scoreById = Object.fromEntries(pids.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
      const bourreIds = bourrePlayerIds(tricksByPlayer, pids);
      assert.ok(bourreIds.length >= 1, "scenario includes at least one bourré");
      assert.ok(isHandComplete(tricksByPlayer, pids));

      const { carryOverPot, potState } = runPostedAnteHand({
        scoreById,
        participants: pids,
        buyIn,
        ante,
        winners: [pids[0]],
        tricksByPlayer,
      });

      const handPot = ante * n;
      const bourreMatch = bourreIds.length * handPot;
      assert.equal(potState.currentPot, handPot);
      assert.equal(carryOverPot, 0);
      assert.ok(scoreById[pids[0]].bankroll > buyIn - ante, "winner receives hand pot at settlement");

      for (const pid of bourreIds) {
        assert.equal(scoreById[pid].skipNextAnte, true);
        assert.equal(scoreById[pid].fundingContribution, handPot);
      }
      for (const pid of pids) {
        if (!bourreIds.includes(pid) && pid !== pids[0]) {
          assert.equal(scoreById[pid].skipNextAnte, undefined, `${pid} pays normal ante next deal`);
        }
      }

      const nextDeal = collectNextHandAntes({
        carryOverPot,
        participantIds: pids,
        scoreById,
        sessionStake: ante,
        buyInFallback: buyIn,
      });
      const expectedNextPot = bourreMatch + ante * (n - bourreIds.length);
      assert.equal(nextDeal.nextHandPot, expectedNextPot);

      for (const pid of bourreIds) {
        assert.equal(nextDeal.postedAntes[pid], handPot);
      }

      const total = sessionChipTotal(
        Object.fromEntries(pids.map((pid) => [pid, { bankroll: nextDeal.bankrolls[pid] }])),
        { carryOverPot, postedAntes: nextDeal.postedAntes, buyInFallback: buyIn },
      );
      assert.equal(total, buyIn * n);
    });
  }

  it("5 players at $20 ante: bust bourré shortfall defers remainder, chips conserved", () => {
    const ante = 20;
    const pids = participantsFor(5);
    const tricksByPlayer = renameTricks(winTricksByCount[5], pids);
    const scoreById = Object.fromEntries(pids.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const { carryOverPot } = runPostedAnteHand({
      scoreById,
      participants: pids,
      buyIn,
      ante,
      winners: [pids[0]],
      tricksByPlayer,
    });
    assert.equal(carryOverPot, 0);
    assert.equal(scoreById.p4.fundingContribution, 20);
    assert.equal(scoreById.p4.bourreReplacementDue, 20);
    assert.equal(
      sessionChipTotal(scoreById, { carryOverPot, buyInFallback: buyIn }),
      buyIn * 5,
    );
  });
});

describe("3-player $20 ante target scenario", () => {
  const buyIn = 100;
  const ante = 20;
  const human = "human";
  const bot1 = "bot1";
  const bot2 = "bot2";
  const three = [human, bot1, bot2];

  it("winner takes pot; bourré penalty at next deal; next pot = penalty + two antes", () => {
    const scoreById = Object.fromEntries(
      three.map((pid) => [pid, { bankroll: buyIn, net: 0, displayName: pid }]),
    );

    const { carryOverPot } = runPostedAnteHand({
      scoreById,
      participants: three,
      buyIn,
      ante,
      winners: [human],
      tricksByPlayer: { [human]: 3, [bot1]: 2, [bot2]: 0 },
    });

    assert.equal(scoreById[human].bankroll, 140);
    assert.equal(scoreById[bot1].bankroll, 80);
    assert.equal(scoreById[bot2].bankroll, 80);
    assert.equal(carryOverPot, 0);
    assert.equal(scoreById[bot2].skipNextAnte, true);
    assert.equal(scoreById[bot1].skipNextAnte, undefined);

    const nextDeal = collectNextHandAntes({
      carryOverPot,
      participantIds: three,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    assert.equal(nextDeal.bankrolls[human], 120);
    assert.equal(nextDeal.bankrolls[bot1], 60);
    assert.equal(nextDeal.bankrolls[bot2], 20);
    assert.equal(nextDeal.postedAntes[bot2], 60);
    assert.equal(nextDeal.postedAntes[human], ante);
    assert.equal(nextDeal.postedAntes[bot1], ante);
    assert.equal(nextDeal.nextHandPot, 100);

    const total = sessionChipTotal(
      Object.fromEntries(three.map((pid) => [pid, { bankroll: nextDeal.bankrolls[pid] }])),
      { carryOverPot, postedAntes: nextDeal.postedAntes, buyInFallback: buyIn },
    );
    assert.equal(total, 300);
  });
});

describe("deal-boundary chip conservation", () => {
  const buyIn = 1000;
  const ante = 50;
  const all = ["hero", "p2", "p3", "p4", "p5"];

  function dealAndSettle(scoreById, carry, participantIds, winners, tricksByPlayer) {
    const before = sessionChipTotal(scoreById, { carryOverPot: carry, buyInFallback: buyIn });
    const collected = collectNextHandAntes({
      carryOverPot: carry,
      participantIds,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    for (const pid of participantIds) {
      if (collected.bankrolls[pid] != null) {
        scoreById[pid] = { ...scoreById[pid], bankroll: collected.bankrolls[pid] };
        if (collected.outIds.includes(pid)) scoreById[pid].out = true;
        else delete scoreById[pid].out;
      }
    }
    const afterDeal = sessionChipTotal(scoreById, {
      carryOverPot: carry,
      postedAntes: collected.postedAntes,
      buyInFallback: buyIn,
    });
    assert.equal(afterDeal, before, "deal ante collection conserves chips");

    const posted = collected.postedAntes;
    const active = collected.activeParticipants;
    const settlementParticipants = participantIds.filter(
      (pid) => (posted[pid] ?? 0) > 0 || active.includes(pid),
    );
    const activeScoreById = Object.fromEntries(
      settlementParticipants.map((pid) => [pid, { ...scoreById[pid], bankroll: scoreById[pid].bankroll }]),
    );

    const settlement = recordHandSettlement({
      mode: "win",
      winners,
      participants: settlementParticipants,
      tricksByPlayer,
      scoreById: activeScoreById,
      sessionStake: ante,
      limEnabled: false,
      carryIn: carry,
      postedAntes: posted,
      buyInFallback: buyIn,
    });

    for (const pid of settlementParticipants) {
      scoreById[pid] = {
        ...settlement.scoreById[pid],
        net: deriveScoreNet(settlement.scoreById[pid].bankroll, buyIn),
        out: (settlement.scoreById[pid].bankroll ?? 0) <= 0 ? true : undefined,
      };
    }

    const afterSettle = sessionChipTotal(scoreById, {
      carryOverPot: settlement.carryOverPot,
      buyInFallback: buyIn,
    });
    assert.equal(afterSettle, before, "settlement conserves chips");
    return settlement.carryOverPot;
  }

  it("does not mint chips when out player has bourreReplacementDue in sorted roster", () => {
    const scoreById = {
      hero: { bankroll: 4750, net: 3750 },
      p2: { bankroll: 0, out: true, bourreReplacementDue: 250, skipNextAnte: true },
      p3: { bankroll: 0, out: true },
      p4: { bankroll: 0, out: true },
      p5: { bankroll: 0, out: true },
    };
    const carry = 250;
    const before = sessionChipTotal(scoreById, { carryOverPot: carry, buyInFallback: buyIn });
    assert.equal(before, 5000);

    const eligible = eligibleIdsForAnteCollection(all, scoreById, buyIn);
    assert.deepEqual(eligible, ["hero"]);

    const collected = collectNextHandAntes({
      carryOverPot: carry,
      participantIds: all,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    scoreById.hero.bankroll = collected.bankrolls.hero;
    const after = sessionChipTotal(scoreById, {
      carryOverPot: carry,
      postedAntes: collected.postedAntes,
      buyInFallback: buyIn,
    });
    assert.equal(after, 5000);
    assert.equal(collected.uncollectedPenalties, 0);
  });

  it("5x1000 hero wins all bankrolls — final hero bankroll is exactly 5000", () => {
    const scoreById = Object.fromEntries(all.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    let carry = 0;

    for (let h = 1; h <= 10; h += 1) {
      const seated = all.filter((pid) => !scoreById[pid].out && scoreById[pid].bankroll > 0);
      if (seated.length < 2) break;
      const tricks = Object.fromEntries(seated.map((pid) => [pid, pid === "hero" ? 5 : 0]));
      carry = dealAndSettle(scoreById, carry, seated, ["hero"], tricks);
    }

    const seated = all.filter((pid) => !scoreById[pid].out && scoreById[pid].bankroll > 0);
    assert.equal(seated.length, 1);
    assert.equal(seated[0], "hero");

    const solo = settleSoloDefaultWin({
      winnerId: "hero",
      carryIn: carry,
      scoreById,
      buyInFallback: buyIn,
      stakeForPlayer: (pid) => handAnteContribution(scoreById[pid], ante),
    });
    assert.equal(solo.ready, true);
    scoreById.hero.bankroll = solo.bankrolls.hero;
    carry = 0;

    assert.equal(scoreById.hero.bankroll, 5000);
    assert.equal(sessionChipTotal(scoreById, { carryOverPot: carry, buyInFallback: buyIn }), 5000);
  });

  it("reproduced +250 bug: sorted roster with out bourré player stays at 5000 after hero wins", () => {
    const scoreById = {
      hero: { bankroll: 4750, net: 3750 },
      p2: { bankroll: 0, out: true, bourreReplacementDue: 250, skipNextAnte: true },
      p3: { bankroll: 0, out: true },
      p4: { bankroll: 0, out: true },
      p5: { bankroll: 0, out: true },
    };
    let carry = 250;

    carry = dealAndSettle(
      scoreById,
      carry,
      all,
      ["hero"],
      { hero: 5, p2: 0, p3: 0, p4: 0, p5: 0 },
    );

    const solo = settleSoloDefaultWin({
      winnerId: "hero",
      carryIn: carry,
      scoreById,
      buyInFallback: buyIn,
      stakeForPlayer: (pid) => handAnteContribution(scoreById[pid], ante),
    });
    if (solo.ready) {
      scoreById.hero.bankroll = solo.bankrolls.hero;
      carry = 0;
    }

    assert.equal(scoreById.hero.bankroll, 5000);
    assert.equal(sessionChipTotal(scoreById, { carryOverPot: carry, buyInFallback: buyIn }), 5000);
  });
});
