import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dealInitialHand, assignTrumpUpcard } from "./deal";
import { activePlayerOrder, CARDS_PER_PLAYER } from "./playerOrder";
import { effectivePlayerHand } from "./invariants";
import {
  assertNoDuplicateCards,
  dealForTest,
  initSimulatedHand,
  publicHandFromDeal,
} from "./testHelpers";

describe("A/B — deal and trump upcard", () => {
  it("deals five effective cards per active player", () => {
    const deal = dealForTest({ seed: 7 });
    for (const pid of deal.participantIds) {
      const pub = publicHandFromDeal(deal);
      const effective = effectivePlayerHand(pid, deal.privateHands[pid], pub);
      assert.equal(effective.length, CARDS_PER_PLAYER);
    }
  });

  it("assigns trump suit from dealer fifth card", () => {
    const deal = dealForTest({ dealerId: "p1", seed: 11 });
    assert.equal(deal.trumpUpcard.suit, deal.trumpSuit);
    const pub = publicHandFromDeal(deal);
    assert.ok(effectivePlayerHand("p1", deal.privateHands.p1, pub).some(
      (c) => c.rank === deal.trumpUpcard.rank && c.suit === deal.trumpUpcard.suit,
    ));
  });

  it("does not auto-lead trump — play starts with empty trick", () => {
    const state = initSimulatedHand({ seed: 3 });
    assert.equal(state.publicHand.currentTrick, null);
    assert.equal(state.publicHand.playedCards.length, 0);
  });

  it("first draw turn is first active seat left of dealer", () => {
    const deal = dealForTest({ dealerId: "p1", participantIds: ["p1", "p2", "p3"] });
    const left = activePlayerOrder("p1", ["p1", "p2", "p3"], ["p1", "p2", "p3"])[0];
    assert.equal(deal.turnPlayerId, left);
    assert.equal(deal.dealOrder[0], left);
  });

  it("supports three-player tables", () => {
    const deal = dealForTest({
      dealerId: "p2",
      participantIds: ["p1", "p2", "p3"],
      sortedPlayerIds: ["p1", "p2", "p3"],
      seed: 99,
    });
    assert.equal(deal.participantIds.length, 3);
    assertNoDuplicateCards(initSimulatedHand({
      dealerId: "p2",
      participantIds: ["p1", "p2", "p3"],
      sortedPlayerIds: ["p1", "p2", "p3"],
      seed: 99,
    }));
  });

  it("assignTrumpUpcard uses trump holder fifth card", () => {
    const hands = {
      p1: [{ rank: "2", suit: "clubs" }, { rank: "3", suit: "clubs" }, { rank: "4", suit: "clubs" }, { rank: "5", suit: "clubs" }, { rank: "A", suit: "hearts" }],
      p2: [{ rank: "2", suit: "diamonds" }, { rank: "3", suit: "diamonds" }, { rank: "4", suit: "diamonds" }, { rank: "5", suit: "diamonds" }, { rank: "K", suit: "spades" }],
    };
    const trump = assignTrumpUpcard("p1", hands);
    assert.equal(trump.rank, "A");
    assert.equal(trump.suit, "hearts");
  });

  it("dealer keeps trump in private hand storage", () => {
    const deal = dealForTest({ dealerId: "p1", seed: 11 });
    assert.equal(deal.privateHands.p1.length, 5);
    assert.ok(
      deal.privateHands.p1.some(
        (c) => c.rank === deal.trumpUpcard.rank && c.suit === deal.trumpUpcard.suit,
      ),
    );
  });
});
