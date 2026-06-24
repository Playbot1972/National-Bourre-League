import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyPlayCard } from "./play";
import { effectivePlayerHand } from "./invariants";
import { getLegalPlayIndices } from "./legal";
import { buildPlayValidationState } from "./playContext";
import { resolveActionOrder } from "./playerOrder";
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

  it("plays clockwise even when stored actionOrder follows join order", () => {
    const deal = dealForTest({
      participantIds: ["host", "bot_a", "bot_b"],
      sortedPlayerIds: ["host", "bot_a", "bot_b"],
      seed: 11,
    });
    const clockwise = ["bot_a", "bot_b", "host"];
    let pub = {
      ...publicHandFromDeal(deal, "host"),
      phase: HAND_PHASE.PLAY,
      seatedIds: ["host", "bot_a", "bot_b"],
      actionOrder: ["host", "bot_a", "bot_b"],
      turnPlayerId: clockwise[0],
      currentTrick: {
        trickNumber: 1,
        leadPlayerId: clockwise[0],
        leadSuit: null,
        plays: [],
      },
    };
    const playOrder: string[] = [];
    let hands = { ...deal.privateHands };
    for (let step = 0; step < clockwise.length; step += 1) {
      const pid = pub.turnPlayerId!;
      playOrder.push(pid);
      const effective = effectivePlayerHand(pid, hands[pid], pub);
      const ctx = buildPlayValidationState({ hand: effective, publicHand: pub });
      const legal = getLegalPlayIndices(ctx);
      const result = applyPlayCard({
        publicHand: pub,
        playerHand: effective,
        playerId: pid,
        cardIndex: legal[0] ?? 0,
        actionOrder: resolveActionOrder(pub),
      });
      pub = result.publicHand;
      hands[pid] = result.playerHand;
    }
    assert.deepEqual(playOrder, clockwise);
    assert.deepEqual(pub.actionOrder, clockwise);
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
