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
  processHandSettlement,
  processAnte,
  processBuyIn,
  processRebuy,
  replayEvents,
  computeFinalBankrolls,
  hasActionBeenApplied,
  sortMoneyEvents,
  explainMoneyEvents,
  isMoneyEngineV1,
  MONEY_ENGINE_VERSION,
  ledgerFromScoreById,
  scoreBankroll,
  ledgerChipTotal,
  replayEvents,
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

describe("money engine — event sourcing", () => {
  it("processBuyIn emits idempotent events", () => {
    const actionId = "session:create:abc";
    const r1 = processBuyIn({ actionId, playerIds: three, buyInAmount: buyIn });
    assert.equal(r1.newEvents.length, 3);
    assert.equal(r1.invariants.ok, true);

    const r2 = processBuyIn({
      actionId,
      playerIds: three,
      buyInAmount: buyIn,
      existingEvents: r1.newEvents,
    });
    assert.equal(r2.newEvents.length, 0);
    assert.equal(hasActionBeenApplied(r1.newEvents, actionId), true);
  });

  it("processHandSettlement replay matches settlement bankrolls", () => {
    const scoreById = freshScores();
    const deal = postedAnteHand(scoreById);
    const bankrolled = Object.fromEntries(
      three.map((pid) => [pid, { ...scoreById[pid], bankroll: deal.bankrolls[pid] }]),
    );

    const actionId = "settle:hand:1";
    const r = processHandSettlement({
      actionId,
      handId: "1",
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

    assert.ok(r.newEvents.length > 0);
    assert.equal(r.settlement.scoreById.human.bankroll, 140);
    assert.equal(r.invariants.ok, true);

    const ledger = ledgerFromScoreById(bankrolled, { buyInFallback: buyIn });
    const replayed = replayEvents(r.newEvents, ledger);
    assert.equal(replayed.bankrolls.human, r.newBankrolls.human);
    assert.equal(replayed.carryOverPot, 60);
  });

  it("duplicate settlement action is idempotent", () => {
    const scoreById = freshScores();
    const deal = postedAnteHand(scoreById);
    const bankrolled = Object.fromEntries(
      three.map((pid) => [pid, { ...scoreById[pid], bankroll: deal.bankrolls[pid] }]),
    );
    const input = {
      actionId: "settle:hand:dup",
      handId: "1",
      mode: "win" as const,
      winners: ["human"],
      participants: three,
      tricksByPlayer: { human: 3, bot1: 2, bot2: 0 },
      scoreById: bankrolled,
      sessionStake: ante,
      carryIn: 0,
      postedAntes: deal.postedAntes,
      buyInFallback: buyIn,
    };
    const r1 = processHandSettlement(input);
    const r2 = processHandSettlement({
      ...input,
      existingEvents: r1.newEvents,
    });
    assert.equal(r2.newEvents.length, 0);
  });

  it("events out of timestamp order replay correctly via handId/phase/sequence", () => {
    const events = [
      {
        eventId: "a:WINNER_CREDITED:human",
        actionId: "a",
        handId: "1",
        phase: "hand_settlement" as const,
        sequence: 2,
        type: "WINNER_CREDITED" as const,
        playerId: "human",
        amount: 60,
        metadata: {},
      },
      {
        eventId: "a:SETTLEMENT_DEBIT:bot1",
        actionId: "a",
        handId: "1",
        phase: "hand_settlement" as const,
        sequence: 1,
        type: "SETTLEMENT_DEBIT" as const,
        playerId: "bot1",
        amount: 20,
        metadata: {},
      },
    ];
    const shuffled = [events[0], events[1]];
    const sorted = sortMoneyEvents(shuffled);
    assert.equal(sorted[0].sequence, 1);

    const ledger = ledgerFromScoreById(freshScores(), { buyInFallback: buyIn });
    ledger.bankrolls.human = 80;
    ledger.bankrolls.bot1 = 80;
    const replayed = replayEvents(sorted, ledger);
    assert.equal(replayed.bankrolls.human, 140);
    assert.equal(replayed.bankrolls.bot1, 60);
  });

  it("processRebuy increases bankroll idempotently", () => {
    const r1 = processRebuy({
      actionId: "rebuy:bot1",
      playerId: "bot1",
      buyInAmount: buyIn,
      ledger: ledgerFromScoreById({ bot1: { bankroll: 0, net: -100, out: true } }, { buyInFallback: buyIn }),
    });
    assert.equal(r1.newBankrolls.bot1, buyIn);
    const r2 = processRebuy({
      actionId: "rebuy:bot1",
      playerId: "bot1",
      buyInAmount: buyIn,
      existingEvents: r1.newEvents,
    });
    assert.equal(r2.newEvents.length, 0);
  });

  it("computeFinalBankrolls detects tampered incremental state", () => {
    const scoreById = freshScores();
    const deal = postedAnteHand(scoreById);
    const bankrolled = Object.fromEntries(
      three.map((pid) => [pid, { ...scoreById[pid], bankroll: deal.bankrolls[pid] }]),
    );
    const r = processHandSettlement({
      actionId: "settle:final",
      handId: "1",
      mode: "win",
      winners: ["human"],
      participants: three,
      tricksByPlayer: { human: 3, bot1: 2, bot2: 0 },
      scoreById: bankrolled,
      sessionStake: ante,
      postedAntes: deal.postedAntes,
      buyInFallback: buyIn,
    });

    const buyInEvents = processBuyIn({ actionId: "buyin", playerIds: three, buyInAmount: buyIn });
    const allEvents = [...buyInEvents.newEvents, ...r.newEvents];

    const tampered = { ...r.settlement.scoreById };
    tampered.human = { ...tampered.human, bankroll: 999 };

    const final = computeFinalBankrolls({
      events: allEvents,
      scoreById: tampered,
      buyInFallback: buyIn,
    });
    assert.equal(final.invariants.ok, false);
    assert.ok(final.invariants.errors.some((e) => e.includes("drift")));
    assert.ok(explainMoneyEvents(allEvents).includes("WINNER_CREDITED"));
  });

  it("isMoneyEngineV1 gates version", () => {
    assert.equal(isMoneyEngineV1({ moneyEngineVersion: MONEY_ENGINE_VERSION }), true);
    assert.equal(isMoneyEngineV1({}), false);
    assert.equal(isMoneyEngineV1(null), false);
  });
});

describe("money engine — 2-player simple hand (no bourré)", () => {
  const two = ["human", "bot"];

  it("hand 1 win then hand 2 ante: 100/60 pot 40 — not 140/60/40", () => {
    const buyInEvents = processBuyIn({
      actionId: "buyin",
      playerIds: two,
      buyInAmount: buyIn,
    });
    let events = [...buyInEvents.newEvents];
    let scoreById = Object.fromEntries(two.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));

    const ante1 = processAnte({
      actionId: "ante:1",
      handId: "1",
      carryOverPot: 0,
      participantIds: two,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
      existingEvents: events,
    });
    events.push(...ante1.newEvents);
    const bankrolled1 = Object.fromEntries(
      two.map((pid) => [
        pid,
        { ...scoreById[pid], bankroll: ante1.newBankrolls[pid] },
      ]),
    );

    const settle1 = processHandSettlement({
      actionId: "settle:1",
      handId: "1",
      mode: "win",
      winners: ["human"],
      participants: two,
      tricksByPlayer: { human: 4, bot: 1 },
      scoreById: bankrolled1,
      sessionStake: ante,
      carryIn: 0,
      postedAntes: ante1.postedAntes,
      buyInFallback: buyIn,
      existingEvents: events,
    });
    events.push(...settle1.newEvents);

    assert.equal(settle1.newBankrolls.human, 120);
    assert.equal(settle1.newBankrolls.bot, 80);
    assert.equal(settle1.carryOverPot, 0);
    assert.equal(scoreBankroll(settle1.settlement.scoreById.human, buyIn), 120);
    assert.equal(settle1.settlement.scoreById.human.net, 20);

    const ante2 = processAnte({
      actionId: "ante:2",
      handId: "2",
      carryOverPot: settle1.carryOverPot,
      participantIds: two,
      scoreById: settle1.settlement.scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
      nextDealFunding: settle1.settlement.nextDealFunding,
      existingEvents: events,
    });
    events.push(...ante2.newEvents);

    const init = {
      version: MONEY_ENGINE_VERSION,
      buyInFallback: buyIn,
      bankrolls: {},
      nets: {},
      carryOverPot: 0,
      postedAntes: {},
      scoreFlags: {},
      sequence: 0,
    };
    const replayed = replayEvents(events, init);
    const pot =
      replayed.carryOverPot +
      Object.values(replayed.postedAntes).reduce((s, n) => s + n, 0);

    assert.equal(replayed.bankrolls.human, 100);
    assert.equal(replayed.bankrolls.bot, 60);
    assert.equal(pot, 40);
    assert.equal(scoreBankroll({ bankroll: 100, net: 20 }, buyIn), 100);
    assert.equal(ledgerChipTotal(replayed), 200);
  });
});

describe("money engine — multi-hand one-winner", () => {
  it("final totals match replay across two hands", () => {
    const buyInEvents = processBuyIn({ actionId: "buyin", playerIds: three, buyInAmount: buyIn });
    let scoreById = freshScores();
    let allEvents = [...buyInEvents.newEvents];
    let lastCarry = 0;

    for (const handNum of [1, 2]) {
      const anteResult = processAnte({
        actionId: `ante:${handNum}`,
        handId: String(handNum),
        carryOverPot: lastCarry,
        participantIds: three,
        scoreById,
        sessionStake: ante,
        buyInFallback: buyIn,
        existingEvents: allEvents,
      });
      allEvents.push(...anteResult.newEvents);
      const bankrolled = Object.fromEntries(
        three.map((pid) => [
          pid,
          { ...scoreById[pid], bankroll: anteResult.newBankrolls[pid] ?? scoreById[pid].bankroll },
        ]),
      );
      const r = processHandSettlement({
        actionId: `settle:${handNum}`,
        handId: String(handNum),
        mode: "win",
        winners: ["human"],
        participants: three,
        tricksByPlayer: { human: 3, bot1: 2, bot2: 0 },
        scoreById: bankrolled,
        sessionStake: ante,
        carryIn: lastCarry,
        postedAntes: anteResult.postedAntes,
        buyInFallback: buyIn,
        existingEvents: allEvents,
      });
      allEvents.push(...r.newEvents);
      scoreById = r.settlement.scoreById;
      lastCarry = r.settlement.carryOverPot;
    }

    const final = computeFinalBankrolls({
      events: allEvents,
      scoreById,
      buyInFallback: buyIn,
      carryOverPot: lastCarry,
    });
    assert.equal(final.bankrolls.human, scoreById.human.bankroll);
    assert.equal(final.invariants.ok, true);
  });
});
