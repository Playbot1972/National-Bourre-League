import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyPlayCard } from "./play";
import { effectivePlayerHand } from "./invariants";
import { dealForTest, publicHandFromDeal } from "./testHelpers";
import { HAND_PHASE } from "./types";

describe("D — trick play enforcement", () => {
  it("rejects play when not your turn", () => {
    const deal = dealForTest({ participantIds: ["p1", "p2"] });
    const pub = {
      ...publicHandFromDeal(deal),
      phase: HAND_PHASE.PLAY,
      turnPlayerId: "p2",
      currentTrick: {
        trickNumber: 1,
        leadPlayerId: "p2",
        leadSuit: null,
        plays: [],
      },
    };
    const hand = effectivePlayerHand("p1", deal.privateHands.p1, pub);
    assert.throws(
      () =>
        applyPlayCard({
          publicHand: pub,
          playerHand: hand,
          playerId: "p1",
          cardIndex: 0,
          actionOrder: deal.dealOrder,
        }),
      /Not your turn/,
    );
  });

  it("rejects illegal card index", () => {
    const deal = dealForTest({ participantIds: ["p1", "p2"] });
    const pub = {
      ...publicHandFromDeal(deal),
      phase: HAND_PHASE.PLAY,
      turnPlayerId: deal.dealOrder[0],
      currentTrick: {
        trickNumber: 1,
        leadPlayerId: deal.dealOrder[0],
        leadSuit: null,
        plays: [],
      },
    };
    const lead = deal.dealOrder[0];
    const hand = effectivePlayerHand(lead, deal.privateHands[lead], pub);
    assert.throws(
      () =>
        applyPlayCard({
          publicHand: pub,
          playerHand: hand,
          playerId: lead,
          cardIndex: 99,
          actionOrder: deal.dealOrder,
        }),
      /Invalid card selection/,
    );
  });

  it("winner of trick leads next trick", () => {
    const deal = dealForTest({ participantIds: ["p1", "p2"], seed: 5 });
    let pub = {
      ...publicHandFromDeal(deal, "p1"),
      phase: HAND_PHASE.PLAY,
      turnPlayerId: deal.dealOrder[0],
      currentTrick: {
        trickNumber: 1,
        leadPlayerId: deal.dealOrder[0],
        leadSuit: null,
        plays: [],
      },
    };
    const order = deal.dealOrder;
    let hands = { ...deal.privateHands };
    for (const pid of order) {
      const effective = effectivePlayerHand(pid, hands[pid], pub);
      const result = applyPlayCard({
        publicHand: pub,
        playerHand: effective,
        playerId: pid,
        cardIndex: 0,
        actionOrder: order,
      });
      pub = result.publicHand;
      hands[pid] = result.playerHand;
    }
    assert.ok(pub.turnPlayerId);
    const prevWinner = Object.entries(pub.tricksByPlayer).find(([, n]) => (n ?? 0) > 0)?.[0];
    assert.equal(pub.turnPlayerId, prevWinner);
    assert.equal(pub.currentTrick?.trickNumber, 2);
    assert.equal(pub.currentTrick?.plays.length, 0);
  });
});
