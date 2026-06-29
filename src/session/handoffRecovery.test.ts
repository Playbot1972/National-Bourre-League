import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSessionCurrentHand, isClearedPreDealHand, isHandAwaitingSettlement, sessionHandDealStarted } from "./liveHand";
import { shouldAutoOpenNextHand } from "./handPhaseMachine";
import {
  collectFundingForHandStart,
  processAnte,
  processBuyIn,
  processHandSettlement,
} from "../game/money/index";

const BUY_IN = 100;
const ANTE = 20;
const HUMAN = "human";
const BOT = "bot";
const IDS = [HUMAN, BOT];

describe("post-settlement handoff recovery", () => {
  it("treats cleared authoritative hand as ready for next enrollment on live table", () => {
    const session = {
      status: "in_progress",
      handCount: 2,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "play",
            participantIds: ["a", "b", "c"],
            tricksByPlayer: { a: 3, b: 1, c: 1 },
          },
        },
      },
    };
    assert.ok(isClearedPreDealHand(getSessionCurrentHand(session)));
    assert.equal(
      shouldAutoOpenNextHand({ session, tablePlayOpen: true }),
      true,
    );
  });

  it("blocks handoff while co-win vote is pending", () => {
    const session = {
      status: "in_progress",
      handCount: 1,
      pendingCoWinSettlement: { winnerIds: ["a", "b"] },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    assert.equal(
      shouldAutoOpenNextHand({ session, tablePlayOpen: true }),
      false,
    );
  });

  it("completed 4/5 hand awaits settlement and does not block as deal-started", () => {
    const session = {
      status: "in_progress",
      handCount: 1,
      currentHand: {
        phase: "play",
        participantIds: [HUMAN, BOT],
        tricksByPlayer: { [HUMAN]: 4, [BOT]: 1 },
        turnPlayerId: null,
      },
    };
    assert.equal(isHandAwaitingSettlement(session), true);
    assert.equal(sessionHandDealStarted(session), false);
    assert.equal(
      shouldAutoOpenNextHand({ session, tablePlayOpen: true }),
      false,
    );
  });

  it("2-player 4/5 win settles and funds the next hand", () => {
    processBuyIn({ actionId: "buyin", playerIds: IDS, buyInAmount: BUY_IN });
    let scoreById = Object.fromEntries(IDS.map((id) => [id, { bankroll: BUY_IN, net: 0 }]));

    const ante1 = processAnte({
      actionId: "ante:1",
      handId: "1",
      carryOverPot: 0,
      participantIds: IDS,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      existingEvents: [],
    });
    scoreById = Object.fromEntries(
      IDS.map((id) => [id, { bankroll: ante1.newBankrolls[id], net: id === HUMAN ? -20 : -20 }]),
    );

    const settle = processHandSettlement({
      actionId: "settle:1",
      handId: "1",
      mode: "win",
      winners: [HUMAN],
      participants: IDS,
      tricksByPlayer: { [HUMAN]: 4, [BOT]: 1 },
      scoreById,
      sessionStake: ANTE,
      carryIn: 0,
      postedAntes: ante1.postedAntes,
      buyInFallback: BUY_IN,
      existingEvents: ante1.newEvents,
    });
    assert.equal(settle.settlement.scoreById[HUMAN]?.bankroll, 120);
    assert.equal(settle.settlement.scoreById[BOT]?.bankroll, 80);

    const funded = collectFundingForHandStart({
      scoreById: settle.settlement.scoreById,
      nextDealFunding: settle.settlement.nextDealFunding,
      carryOverPot: 0,
      participantIds: IDS,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
    });
    assert.equal(funded.bankrolls[HUMAN], 100);
    assert.equal(funded.bankrolls[BOT], 60);
    assert.equal(
      Object.values(funded.postedAntes).reduce((s, n) => s + n, 0),
      40,
    );

    const clearedSession = {
      status: "in_progress",
      handCount: 1,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
      carryOverPot: 0,
      nextDealFunding: settle.settlement.nextDealFunding,
    };
    assert.ok(isClearedPreDealHand(getSessionCurrentHand(clearedSession)));
    assert.equal(
      shouldAutoOpenNextHand({ session: clearedSession, tablePlayOpen: true }),
      true,
    );
  });
});
