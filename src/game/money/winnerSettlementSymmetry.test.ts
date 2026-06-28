/**
 * Regression: human vs bot winners must settle identically on the v1 money path.
 * Production dealt antes without ANTE_DEDUCTED events caused replay inflation (140)
 * or apparent missing payout when event log and stored bankrolls diverged.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeFinalBankrolls,
  deriveScoreNet,
  explainMoneyEvents,
  ledgerChipTotal,
  MONEY_ENGINE_VERSION,
  processAnte,
  processBuyIn,
  processHandSettlement,
  replayEvents,
  scoreBankroll,
} from "./index";
import { emptyLedgerState } from "./replay";

const BUY_IN = 100;
const ANTE = 20;
const HUMAN = "human";
const BOT = "bot_1";
const TWO = [HUMAN, BOT];

function productionHand1Flow(winner: string) {
  const buyInResult = processBuyIn({
    actionId: "buyin:session",
    playerIds: TWO,
    buyInAmount: BUY_IN,
  });
  let events = [...buyInResult.newEvents];

  // Deal collected antes into score rows only (legacy production gap).
  const scoreAfterAnte = Object.fromEntries(
    TWO.map((pid) => [pid, { bankroll: 80, net: 0 }]),
  );
  const postedAntes = { [HUMAN]: ANTE, [BOT]: ANTE };
  const tricks =
    winner === HUMAN ? { [HUMAN]: 4, [BOT]: 1 } : { [HUMAN]: 1, [BOT]: 4 };

  const settle = processHandSettlement({
    actionId: "settle:session:1",
    handId: "1",
    sessionId: "session",
    mode: "win",
    winners: [winner],
    participants: TWO,
    tricksByPlayer: tricks,
    scoreById: scoreAfterAnte,
    sessionStake: ANTE,
    carryIn: 0,
    postedAntes,
    buyInFallback: BUY_IN,
    existingEvents: events,
  });
  events = [...events, ...settle.newEvents];

  const replayedAfterSettle = replayEvents(events, emptyLedgerState(BUY_IN));

  const ante2 = processAnte({
    actionId: "ante:session:2",
    handId: "2",
    carryOverPot: settle.carryOverPot,
    participantIds: TWO,
    scoreById: settle.settlement.scoreById,
    sessionStake: ANTE,
    buyInFallback: BUY_IN,
    nextDealFunding: settle.settlement.nextDealFunding,
    existingEvents: events,
  });
  events = [...events, ...ante2.newEvents];

  const replayed = replayEvents(events, emptyLedgerState(BUY_IN));
  const pot =
    replayed.carryOverPot +
    Object.values(replayed.postedAntes).reduce((s, n) => s + n, 0);

  return {
    winner,
    events,
    settle,
    ante2,
    replayedAfterSettle,
    replayed,
    pot,
    scoreAfterAnte,
    postedAntes,
  };
}

describe("money engine — winner settlement symmetry (human vs bot)", () => {
  it("Case A human winner: replay matches stored bankrolls after settle + hand-2 ante", () => {
    const result = productionHand1Flow(HUMAN);

    assert.equal(result.settle.newBankrolls[HUMAN], 120);
    assert.equal(result.settle.newBankrolls[BOT], 80);
    assert.equal(result.replayedAfterSettle.bankrolls[HUMAN], 120);
    assert.equal(result.replayedAfterSettle.bankrolls[BOT], 80);
    assert.equal(result.replayed.bankrolls[HUMAN], 100);
    assert.equal(result.replayed.bankrolls[BOT], 60);
    assert.equal(result.ante2.newBankrolls[HUMAN], 100);
    assert.equal(result.ante2.newBankrolls[BOT], 60);
    assert.equal(result.pot, 40);
    assert.equal(ledgerChipTotal(result.replayed), 200);

    const final = computeFinalBankrolls({
      events: result.events,
      scoreById: Object.fromEntries(
        TWO.map((pid) => [
          pid,
          {
            bankroll: result.ante2.newBankrolls[pid],
            net: deriveScoreNet(result.ante2.newBankrolls[pid] ?? 0, BUY_IN),
          },
        ]),
      ),
      buyInFallback: BUY_IN,
    });
    assert.equal(final.invariants.ok, true);
    assert.notEqual(result.replayed.bankrolls[HUMAN], 140);
    assert.equal(
      scoreBankroll(
        { bankroll: result.ante2.newBankrolls[HUMAN], net: deriveScoreNet(100, BUY_IN) },
        BUY_IN,
      ),
      100,
    );
  });

  it("Case B bot winner: replay matches stored bankrolls after settle + hand-2 ante", () => {
    const result = productionHand1Flow(BOT);

    assert.equal(result.settle.newBankrolls[BOT], 120);
    assert.equal(result.settle.newBankrolls[HUMAN], 80);
    assert.equal(result.replayedAfterSettle.bankrolls[BOT], 120);
    assert.equal(result.replayedAfterSettle.bankrolls[HUMAN], 80);
    assert.equal(result.replayed.bankrolls[BOT], 100);
    assert.equal(result.replayed.bankrolls[HUMAN], 60);
    assert.equal(result.ante2.newBankrolls[BOT], 100);
    assert.equal(result.ante2.newBankrolls[HUMAN], 60);
    assert.equal(result.pot, 40);

    const final = computeFinalBankrolls({
      events: result.events,
      scoreById: Object.fromEntries(
        TWO.map((pid) => [
          pid,
          {
            bankroll: result.ante2.newBankrolls[pid],
            net: deriveScoreNet(result.ante2.newBankrolls[pid] ?? 0, BUY_IN),
          },
        ]),
      ),
      buyInFallback: BUY_IN,
    });
    assert.equal(final.invariants.ok, true);
  });

  it("human and bot winner paths emit the same event types and conserved totals", () => {
    const human = productionHand1Flow(HUMAN);
    const bot = productionHand1Flow(BOT);

    const humanTypes = human.settle.newEvents.map((e) => e.type).sort().join(",");
    const botTypes = bot.settle.newEvents.map((e) => e.type).sort().join(",");
    assert.equal(humanTypes, botTypes);
    assert.ok(human.settle.newEvents.some((e) => e.type === "ANTE_DEDUCTED"));
    assert.ok(human.settle.newEvents.some((e) => e.type === "WINNER_CREDITED"));
    assert.ok(bot.settle.newEvents.some((e) => e.type === "WINNER_CREDITED"));

    assert.equal(ledgerChipTotal(human.replayedAfterSettle), ledgerChipTotal(bot.replayedAfterSettle));
    assert.equal(explainMoneyEvents(human.events).includes("ANTE_DEDUCTED"), true);
    assert.equal(explainMoneyEvents(bot.events).includes("WINNER_CREDITED"), true);
  });

  it("deal-time ante events + settlement: no duplicate ANTE_DEDUCTED on replay", () => {
    const buyInResult = processBuyIn({
      actionId: "buyin",
      playerIds: TWO,
      buyInAmount: BUY_IN,
    });
    let events = [...buyInResult.newEvents];
    let scoreById = Object.fromEntries(TWO.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]));

    const ante1 = processAnte({
      actionId: "ante:session:1",
      handId: "1",
      carryOverPot: 0,
      participantIds: TWO,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      existingEvents: events,
    });
    events = [...events, ...ante1.newEvents];
    const bankrolled = Object.fromEntries(
      TWO.map((pid) => [pid, { ...scoreById[pid], bankroll: ante1.newBankrolls[pid] }]),
    );

    const settle = processHandSettlement({
      actionId: "settle:session:1",
      handId: "1",
      sessionId: "session",
      mode: "win",
      winners: [BOT],
      participants: TWO,
      tricksByPlayer: { [HUMAN]: 1, [BOT]: 4 },
      scoreById: bankrolled,
      sessionStake: ANTE,
      carryIn: 0,
      postedAntes: ante1.postedAntes,
      buyInFallback: BUY_IN,
      existingEvents: events,
    });

    const anteDeductions = settle.newEvents.filter((e) => e.type === "ANTE_DEDUCTED");
    assert.equal(anteDeductions.length, 0, "settlement must not duplicate deal antes");
    assert.equal(settle.newBankrolls[BOT], 120);
  });
});
