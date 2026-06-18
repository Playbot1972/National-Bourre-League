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

  it("applySolventSettlement marks insolvent bourré player out", () => {
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
    assert.ok(solvent.outIds.includes("p3"));
    assert.ok(solvent.bustedIds.includes("p3"));
    assert.ok(solvent.appliedDeltas.p3 > nominal.deltas.p3);
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
});
