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
  bourrePlayerIds,
  isHandComplete,
  sessionChipTotal,
  anteAlreadyPosted,
  DEFAULT_HAND_ANTE,
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
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: stake(1),
    });
    assert.ok(result.deltas.p1 > 0);
    assert.ok(result.deltas.p2 < 0);
    assert.ok(result.bourreIds.includes("p3"));
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

  it("push applies bourré penalties only after a completed all-zero-trick hand", () => {
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
    assert.ok(result.bourreIds.length === 4);
    assert.ok(result.carryOverPot > 5);
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

  it("applySolventSettlement defers bourré pot match to the next deal", () => {
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
    assert.equal(solvent.bankrolls.p3, 1);
    assert.equal(solvent.appliedDeltas.p3, -1);
    assert.ok(!solvent.bustedIds.includes("p3"));
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

  it("scoreBankroll recovers from stale create-time buy-in when net moved", () => {
    const buyIn = 20;
    assert.equal(scoreBankroll({ bankroll: 20, net: 5 }, buyIn), 25);
    assert.equal(scoreBankroll({ bankroll: 20, net: -8 }, buyIn), 12);
    assert.equal(scoreBankroll({ bankroll: 25, net: 5 }, buyIn), 25);
    assert.equal(scoreBankroll({ bankroll: 0, net: -20 }, buyIn), 0);
  });

  it("handAnteContribution charges bourré replacement without normal ante", () => {
    assert.equal(handAnteContribution({ bourreReplacementDue: 5 }, 1), 5);
    assert.equal(handAnteContribution({ bourreReplacementDue: 5, skipNextAnte: true }, 1), 5);
    assert.equal(handAnteContribution({ skipNextAnte: true }, 1), 0);
    assert.equal(handAnteContribution({}, 1), 1);
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

  let carry = carryOverPot + (collected.uncollectedPenalties ?? 0);
  const postedAntes = collected.postedAntes;

  const midTotal = sessionChipTotal(
    Object.fromEntries(
      participants.map((pid) => [pid, { ...scoreById[pid], bankroll: collected.bankrolls[pid] }]),
    ),
    { carryOverPot: carry, postedAntes, buyInFallback: buyIn },
  );
  assert.equal(midTotal, beforeTotal, "chips conserved after ante collection");

  const active = collected.activeParticipants;
  const antePot = Object.values(postedAntes).reduce((sum, n) => sum + n, 0);
  const stakeForSettlement = (pid) =>
    anteAlreadyPosted(postedAntes, pid) ? 0 : ante;

  const nominal = settleHandDeltas({
    mode,
    winners,
    participants: active,
    tricksByPlayer,
    anteAmount: ante,
    limEnabled: false,
    carryIn: carry,
    antePot,
    stakeForPlayer: stakeForSettlement,
  });

  const activeScoreById = Object.fromEntries(
    active.map((pid) => [
      pid,
      {
        ...scoreById[pid],
        bankroll: collected.bankrolls[pid],
        bourreReplacementDue: undefined,
      },
    ]),
  );

  const solvent = applySolventSettlement({
    mode,
    winners,
    participants: active,
    nominalDeltas: nominal.deltas,
    scoreById: activeScoreById,
    carryOverPot: nominal.carryOverPot,
    buyInFallback: buyIn,
    stakeForPlayer: stakeForSettlement,
  });

  for (const pid of active) {
    const row = scoreById[pid];
    scoreById[pid] = {
      ...row,
      bankroll: solvent.bankrolls[pid],
      net: (row.net || 0) + (solvent.appliedDeltas[pid] ?? 0),
      out: (solvent.bankrolls[pid] ?? 0) <= 0,
    };
    if (nominal.bourreIds.includes(pid)) {
      scoreById[pid].bourreReplacementDue = nominal.potState.maxWinThisHand;
    } else if (row.bourreReplacementDue != null) {
      delete scoreById[pid].bourreReplacementDue;
    }
  }

  carry = solvent.carryOverPot;

  const afterTotal = sessionChipTotal(scoreById, {
    carryOverPot: carry,
    postedAntes: {},
    buyInFallback: buyIn,
  });
  assert.equal(afterTotal, beforeTotal, "chips conserved after settlement");

  return { carryOverPot: carry, bourreIds: nominal.bourreIds, potState: nominal.potState, collected };
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
    assert.equal(solvent.bankrolls.p3, 99);
    assert.equal(
      sessionChipTotal(
        Object.fromEntries(three.map((pid) => [pid, { bankroll: solvent.bankrolls[pid] }])),
        { carryOverPot: 0, postedAntes: {}, buyInFallback: buyIn },
      ),
      300,
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
    assert.equal(scoreById.p3.bourreReplacementDue, 3);
  });

  it("each bourré player owes the full pot for the next deal", () => {
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
    assert.equal(scoreById.p3.bourreReplacementDue, potState.maxWinThisHand);
    assert.equal(scoreById.p4.bourreReplacementDue, potState.maxWinThisHand);
    assert.equal(potState.maxWinThisHand, 4);
  });

  it("rolls uncollected bourré replacement into carry when player busts", () => {
    const collected = collectHandAntes({
      participants: ["p3"],
      scoreById: { p3: { bankroll: 2, bourreReplacementDue: 5 } },
      buyInFallback: buyIn,
      stakeForPlayer: () => 5,
    });
    assert.equal(collected.bankrolls.p3, 0);
    assert.equal(collected.postedAntes.p3, 2);
    assert.equal(collected.uncollectedPenalties, 3);
    assert.ok(collected.outIds.includes("p3"));
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
    assert.equal(scoreById.p1.skipNextAnte, undefined);
  });

  it("session end reconciles when two players are broke and one remains solvent", () => {
    const scoreById = {
      p1: { bankroll: buyIn, net: 0 },
      p2: { bankroll: buyIn, net: 0 },
      p3: { bankroll: buyIn, net: 0 },
    };
    let carry = 0;

    // p1 wins every hand; p3 goes bourré each time (p2 keeps one trick).
    for (let i = 0; i < 120; i += 1) {
      const participants = three.filter((pid) => !scoreById[pid].out);
      if (participants.length <= 1) break;
      ({ carryOverPot: carry } = runPostedAnteHand({
        scoreById,
        participants,
        carryOverPot: carry,
        buyIn,
        ante,
        winners: ["p1"],
        tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
      }));
      if (scoreById.p2.bankroll <= 0 && scoreById.p3.bankroll <= 0) break;
    }

    assert.equal(scoreById.p2.bankroll, 0);
    assert.equal(scoreById.p3.bankroll, 0);
    assert.ok(scoreById.p1.bankroll > 0);
    assert.equal(
      sessionChipTotal(scoreById, { carryOverPot: carry, buyInFallback: buyIn }),
      buyIn * 3,
    );
    assert.equal(scoreById.p1.bankroll + carry, buyIn * 3);
  });
});
