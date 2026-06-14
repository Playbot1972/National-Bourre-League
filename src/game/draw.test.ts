import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyDraw, advanceAfterDraw, allDrawsComplete } from "./draw";
import { applyPlayerDraw } from "./draw";
import { maxDrawDiscards } from "./drawLimit";
import { effectivePlayerHand } from "./invariants";
import { shuffledDeckFromSeed } from "./deckState";
import {
  assertNoDuplicateCards,
  dealForTest,
  initSimulatedHand,
  publicHandFromDeal,
  runDrawPhase,
} from "./testHelpers";
import { HAND_PHASE } from "./types";

describe("C — draw / discard phase", () => {
  it("allows stand pat (0 discards)", () => {
    const deal = dealForTest();
    const pub = publicHandFromDeal(deal);
    const deck = shuffledDeckFromSeed(deal.deckSeed);
    const hand = effectivePlayerHand("p2", deal.privateHands.p2, pub);
    const result = applyDraw({
      hand,
      discardIndices: [],
      deck,
      deckNextIndex: deal.deckNextIndex,
      maxDiscards: 4,
    });
    assert.equal(result.discarded, 0);
    assert.equal(result.hand.length, hand.length);
  });

  it("allows 1–4 discards when max is 4", () => {
    const deal = dealForTest();
    const pub = publicHandFromDeal(deal);
    const deck = shuffledDeckFromSeed(deal.deckSeed);
    for (const count of [1, 2, 3, 4]) {
      const hand = effectivePlayerHand("p3", deal.privateHands.p3, pub);
      const result = applyDraw({
        hand,
        discardIndices: Array.from({ length: count }, (_, i) => i),
        deck,
        deckNextIndex: deal.deckNextIndex,
        maxDiscards: 4,
      });
      assert.equal(result.discarded, count);
      assert.equal(result.hand.length, hand.length);
    }
  });

  it("rejects over-limit discard count", () => {
    const deal = dealForTest();
    const pub = publicHandFromDeal(deal);
    const hand = effectivePlayerHand("p3", deal.privateHands.p3, pub);
    assert.throws(
      () =>
        applyDraw({
          hand,
          discardIndices: [0, 1, 2, 3, 4],
          deck: shuffledDeckFromSeed(deal.deckSeed),
          deckNextIndex: deal.deckNextIndex,
          maxDiscards: 4,
        }),
      /at most 4/,
    );
  });

  it("clears trump upcard when dealer discards it", () => {
    const deal = dealForTest();
    const pub = publicHandFromDeal(deal);
    const deck = shuffledDeckFromSeed(deal.deckSeed);
    const effective = effectivePlayerHand("p1", deal.privateHands.p1, pub);
    const trumpIdx = effective.findIndex(
      (c) => c.rank === deal.trumpUpcard.rank && c.suit === deal.trumpUpcard.suit,
    );
    assert.ok(trumpIdx >= 0);
    const result = applyPlayerDraw({
      playerId: "p1",
      privateHand: deal.privateHands.p1,
      publicHand: pub,
      discardIndices: [trumpIdx],
      deck,
      deckNextIndex: deal.deckNextIndex,
      maxDiscards: 4,
    });
    assert.equal(result.publicHand.trumpUpcard, null);
  });

  it("advanceAfterDraw transitions to play with correct lead", () => {
    const deal = dealForTest({ participantIds: ["p1", "p2", "p3"] });
    let pub = publicHandFromDeal(deal, "p1");
    const order = deal.dealOrder;
    for (const pid of order) {
      pub = advanceAfterDraw(pub, order, pid);
    }
    assert.equal(pub.phase, HAND_PHASE.PLAY);
    assert.equal(pub.turnPlayerId, order[0]);
    assert.equal(pub.currentTrick?.plays.length, 0);
  });

  it("maxDrawDiscards scales with player count", () => {
    assert.equal(maxDrawDiscards(3), 5);
    assert.equal(maxDrawDiscards(6), 4);
    assert.equal(maxDrawDiscards(8), 2);
    assert.equal(maxDrawDiscards(4, "no draw"), 0);
  });

  it("draw phase maintains card uniqueness", () => {
    const state = runDrawPhase(initSimulatedHand({ seed: 21 }));
    assertNoDuplicateCards(state);
    assert.equal(state.publicHand.phase, HAND_PHASE.PLAY);
  });
});

describe("draw completion tracking", () => {
  it("allDrawsComplete requires every participant", () => {
    assert.equal(allDrawsComplete(["p1", "p2", "p3"], ["p1", "p2"]), false);
    assert.equal(allDrawsComplete(["p1", "p2", "p3"], ["p1", "p2", "p3"]), true);
  });
});
