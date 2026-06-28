/**
 * Regression: consecutive winner bankroll progression under post-funding convention.
 * Start-of-hand values are always after ante / nextDealFunding has been applied.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ScoreById } from "./types";
import {
  collectFundingForHandStart,
  mergeNextDealFundingIntoScoreById,
  processAnte,
  processBuyIn,
  processHandSettlement,
  runHandMoneyFlow,
  scoreBankroll,
  startNextHandFunding,
} from "./index";

const BUY_IN = 100;
const ANTE = 20;
const HUMAN = "human";
const BOT = "bot";
const IDS = [HUMAN, BOT];

function potFromPosted(postedAntes: Record<string, number>): number {
  return Object.values(postedAntes).reduce((sum, raw) => sum + Math.max(0, Number(raw) || 0), 0);
}

function assertPostFundingStart(
  label: string,
  bankrolls: Record<string, number>,
  postedAntes: Record<string, number>,
  expected: { human: number; bot: number; pot: number },
): void {
  assert.equal(bankrolls[HUMAN], expected.human, `${label}: human start stack`);
  assert.equal(bankrolls[BOT], expected.bot, `${label}: bot start stack`);
  assert.equal(potFromPosted(postedAntes), expected.pot, `${label}: pot`);
}

function assertSettledEnd(
  label: string,
  scoreById: ScoreById,
  expected: { human: number; bot: number },
): void {
  assert.equal(scoreById[HUMAN]?.bankroll, expected.human, `${label}: human settled`);
  assert.equal(scoreById[BOT]?.bankroll, expected.bot, `${label}: bot settled`);
}

describe("money engine — bankroll progression (consecutive wins)", () => {
  it("2-player consecutive wins: full hand 1–3 trace (no bourré)", () => {
    const buyIn = processBuyIn({
      actionId: "buyin:trace",
      playerIds: IDS,
      buyInAmount: BUY_IN,
    });
    let events = [...buyIn.newEvents];
    let scoreById: ScoreById = Object.fromEntries(
      IDS.map((id) => [id, { bankroll: BUY_IN, net: 0 }]),
    );

    // Hand 1 — fund, play, settle
    const ante1 = processAnte({
      actionId: "ante:1",
      handId: "1",
      carryOverPot: 0,
      participantIds: IDS,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      existingEvents: events,
    });
    events.push(...ante1.newEvents);
    assertPostFundingStart("hand 1", ante1.newBankrolls, ante1.postedAntes, {
      human: 80,
      bot: 80,
      pot: 40,
    });

    const settle1 = processHandSettlement({
      actionId: "settle:1",
      handId: "1",
      mode: "win",
      winners: [HUMAN],
      participants: IDS,
      tricksByPlayer: { [HUMAN]: 4, [BOT]: 1 },
      scoreById: Object.fromEntries(
        IDS.map((id) => [id, { ...scoreById[id], bankroll: ante1.newBankrolls[id] }]),
      ),
      sessionStake: ANTE,
      carryIn: 0,
      postedAntes: ante1.postedAntes,
      buyInFallback: BUY_IN,
      existingEvents: events,
    });
    events.push(...settle1.newEvents);
    scoreById = settle1.settlement.scoreById;
    assertSettledEnd("hand 1", scoreById, { human: 120, bot: 80 });

    // Hand 2
    const ante2 = processAnte({
      actionId: "ante:2",
      handId: "2",
      carryOverPot: settle1.carryOverPot,
      participantIds: IDS,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      nextDealFunding: settle1.settlement.nextDealFunding,
      existingEvents: events,
    });
    events.push(...ante2.newEvents);
    assertPostFundingStart("hand 2", ante2.newBankrolls, ante2.postedAntes, {
      human: 100,
      bot: 60,
      pot: 40,
    });

    const settle2 = processHandSettlement({
      actionId: "settle:2",
      handId: "2",
      mode: "win",
      winners: [HUMAN],
      participants: IDS,
      tricksByPlayer: { [HUMAN]: 4, [BOT]: 1 },
      scoreById: Object.fromEntries(
        IDS.map((id) => [id, { ...scoreById[id], bankroll: ante2.newBankrolls[id] }]),
      ),
      sessionStake: ANTE,
      carryIn: 0,
      postedAntes: ante2.postedAntes,
      buyInFallback: BUY_IN,
      existingEvents: events,
    });
    events.push(...settle2.newEvents);
    scoreById = settle2.settlement.scoreById;
    assertSettledEnd("hand 2", scoreById, { human: 140, bot: 60 });

    // Hand 3 — the failing scenario from production
    const ante3 = processAnte({
      actionId: "ante:3",
      handId: "3",
      carryOverPot: settle2.carryOverPot,
      participantIds: IDS,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      nextDealFunding: settle2.settlement.nextDealFunding,
      existingEvents: events,
    });
    assertPostFundingStart("hand 3", ante3.newBankrolls, ante3.postedAntes, {
      human: 120,
      bot: 40,
      pot: 40,
    });
  });

  it("single win: next start is 100 / 60 / 40", () => {
    const flow = runHandMoneyFlow({
      mode: "win",
      winners: [HUMAN],
      participants: IDS,
      tricksByPlayer: { [HUMAN]: 4, [BOT]: 1 },
      scoreById: Object.fromEntries(
        IDS.map((id) => [id, { bankroll: 80, net: -20 }]),
      ),
      sessionStake: ANTE,
      carryIn: 0,
      postedAntes: { [HUMAN]: ANTE, [BOT]: ANTE },
      buyInFallback: BUY_IN,
    });
    assertSettledEnd("after one win", flow.settlement.scoreById, { human: 120, bot: 80 });
    assertPostFundingStart(
      "next hand",
      flow.deal.collected.bankrolls,
      flow.deal.collected.postedAntes,
      { human: 100, bot: 60, pot: 40 },
    );
  });

  it("double-ante regression: idempotent deal ante emits no duplicate events", () => {
    let events = [];
    const scoreById: ScoreById = {
      [HUMAN]: { bankroll: 120, net: 20 },
      [BOT]: { bankroll: 80, net: -20 },
    };
    const nextDealFunding = {
      settledPot: 40,
      bourreIds: [],
      byPlayer: {},
      fundingContributionByPlayer: { [HUMAN]: ANTE, [BOT]: ANTE },
    };

    const first = processAnte({
      actionId: "ante:session:2",
      handId: "2",
      carryOverPot: 0,
      participantIds: IDS,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      nextDealFunding,
      existingEvents: events,
    });
    events.push(...first.newEvents);
    assert.equal(first.newEvents.length, 2);

    const second = processAnte({
      actionId: "ante:session:2",
      handId: "2",
      carryOverPot: 0,
      participantIds: IDS,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      nextDealFunding,
      existingEvents: events,
    });
    assert.equal(second.newEvents.length, 0);
    assertPostFundingStart("idempotent replay", second.newBankrolls, second.postedAntes, {
      human: 100,
      bot: 60,
      pot: 40,
    });
  });

  it("stale-baseline regression: nextDealFunding uses post-settlement bankrolls", () => {
    const settled: ScoreById = {
      [HUMAN]: { bankroll: 140, net: 40 },
      [BOT]: { bankroll: 60, net: -40 },
    };
    const stale: ScoreById = {
      [HUMAN]: { bankroll: 100, net: 0 },
      [BOT]: { bankroll: 60, net: -40 },
    };
    const nextDealFunding = {
      settledPot: 40,
      bourreIds: [],
      byPlayer: {},
      fundingContributionByPlayer: { [HUMAN]: ANTE, [BOT]: ANTE },
    };

    const fromSettled = collectFundingForHandStart({
      scoreById: settled,
      nextDealFunding,
      carryOverPot: 0,
      participantIds: IDS,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });
    assertPostFundingStart("from settled 140/60", fromSettled.bankrolls, fromSettled.postedAntes, {
      human: 120,
      bot: 40,
      pot: 40,
    });

    const fromStale = collectFundingForHandStart({
      scoreById: stale,
      nextDealFunding,
      carryOverPot: 0,
      participantIds: IDS,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });
    assertPostFundingStart("from stale 100/60 (wrong)", fromStale.bankrolls, fromStale.postedAntes, {
      human: 80,
      bot: 40,
      pot: 40,
    });
    assert.notEqual(fromSettled.bankrolls[HUMAN], fromStale.bankrolls[HUMAN]);
  });

  it("merge regression: mergeNextDealFundingIntoScoreById applies flags only once", () => {
    const scoreById: ScoreById = {
      [HUMAN]: { bankroll: 140, net: 40 },
      [BOT]: { bankroll: 60, net: -40 },
    };
    const nextDealFunding = {
      settledPot: 40,
      bourreIds: [],
      byPlayer: {
        [HUMAN]: { fundingContribution: ANTE, fundingReason: "normal_ante" },
        [BOT]: { fundingContribution: ANTE, fundingReason: "normal_ante" },
      },
      fundingContributionByPlayer: { [HUMAN]: ANTE, [BOT]: ANTE },
    };

    const merged = mergeNextDealFundingIntoScoreById(scoreById, nextDealFunding);
    assert.equal(scoreBankroll(merged[HUMAN], BUY_IN), 140);
    assert.equal(scoreBankroll(merged[BOT], BUY_IN), 60);

    const funded = startNextHandFunding({
      scoreById: merged,
      nextDealFunding,
      carryOverPot: 0,
      participantIds: IDS,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });
    assertPostFundingStart(
      "after merge + funding",
      funded.collected.bankrolls,
      funded.collected.postedAntes,
      { human: 120, bot: 40, pot: 40 },
    );
  });
});
