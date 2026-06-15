import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dealInitialHand } from "./deal";
import { applyDraw } from "./draw";
import { applyPlayCard, applyPlayerPlayCard } from "./play";
import {
  assertCardUniqueness,
  effectivePlayerHand,
  privateHandFromEffective,
  cardsRemainingInHand,
} from "./invariants";
import { activePlayerOrder } from "./playerOrder";
import { shuffledDeckFromSeed } from "./deckState";
import { HAND_PHASE } from "./types";
import type { PublicHandState } from "./types";

const PLAYERS = ["p1", "p2", "p3", "p4"];
const SORTED = [...PLAYERS];

function deal(seed = 42) {
  return dealInitialHand({
    dealerId: "p1",
    participantIds: PLAYERS,
    sortedPlayerIds: SORTED,
    seed,
  });
}

function publicFromDeal(d: ReturnType<typeof deal>): PublicHandState {
  return {
    phase: HAND_PHASE.DRAW,
    participantIds: d.participantIds,
    dealerId: "p1",
    trumpHolderId: d.trumpHolderId,
    trumpSuit: d.trumpSuit,
    trumpUpcard: d.trumpUpcard,
    remainingDeckCount: d.remainingDeck.length,
    currentTrick: null,
    leadSuit: null,
    playedCards: [],
    turnPlayerId: d.turnPlayerId,
    tricksByPlayer: d.tricksByPlayer,
    deckSeed: d.deckSeed,
    deckNextIndex: d.deckNextIndex,
    actionOrder: d.dealOrder,
    drawCompletedIds: [],
    maxDrawDiscards: 5,
  };
}

describe("deal and trump reveal", () => {
  it("dealer keeps five cards including the flipped trump", () => {
    const d = deal();
    const pub = publicFromDeal(d);
    const dealerPrivate = d.privateHands.p1;
    assert.equal(dealerPrivate.length, 5);
    assert.equal(d.trumpHolderId, "p1");
    assert.ok(
      dealerPrivate.some(
        (c) => c.rank === d.trumpUpcard.rank && c.suit === d.trumpUpcard.suit,
      ),
    );
    assert.equal(effectivePlayerHand("p1", dealerPrivate, pub).length, 5);
  });

  it("does not auto-lead the flipped trump — first trick starts empty", () => {
    const pub = publicFromDeal(deal());
    assert.equal(pub.currentTrick, null);
    assert.equal(pub.playedCards.length, 0);
  });

  it("first draw turn and first trick lead go to the seat left of dealer", () => {
    const d = deal();
    const leftOfDealer = activePlayerOrder("p1", PLAYERS, SORTED)[0];
    assert.equal(d.turnPlayerId, leftOfDealer);
    assert.equal(d.dealOrder[0], leftOfDealer);
  });

  it("initial deal has no duplicate across deck, trump reveal, and hands", () => {
    const d = deal();
    assertCardUniqueness({
      deck: shuffledDeckFromSeed(d.deckSeed),
      deckNextIndex: d.deckNextIndex,
      trumpUpcard: d.trumpUpcard,
      trumpHolderId: d.trumpHolderId,
      privateHands: d.privateHands,
    });
  });
});

describe("card uniqueness", () => {
  it("post-draw state stays unique", () => {
    const d = deal();
    const pub = publicFromDeal(d);
    const deck = shuffledDeckFromSeed(d.deckSeed);
    const effective = effectivePlayerHand("p2", d.privateHands.p2, pub);
    const drawResult = applyDraw({
      hand: effective,
      discardIndices: [0, 1],
      deck,
      deckNextIndex: d.deckNextIndex,
      maxDiscards: 4,
    });
    const nextPrivate = privateHandFromEffective("p2", drawResult.hand, pub);
    assertCardUniqueness({
      deck,
      deckNextIndex: drawResult.deckNextIndex,
      trumpUpcard: d.trumpUpcard,
      trumpHolderId: d.trumpHolderId,
      privateHands: { ...d.privateHands, p2: nextPrivate },
    });
  });

  it("post-play state stays unique", () => {
    const d = deal();
    let pub = {
      ...publicFromDeal(d),
      phase: HAND_PHASE.PLAY,
      currentTrick: {
        trickNumber: 1,
        leadPlayerId: d.dealOrder[0],
        leadSuit: null,
        plays: [],
      },
    };
    const leadId = d.dealOrder[0];
    const effective = effectivePlayerHand(leadId, d.privateHands[leadId], pub);
    const result = applyPlayCard({
      publicHand: pub,
      playerHand: effective,
      playerId: leadId,
      cardIndex: 0,
      actionOrder: d.dealOrder,
    });
    pub = result.publicHand;
    const stored = privateHandFromEffective(leadId, result.playerHand, pub);
    assertCardUniqueness({
      deck: shuffledDeckFromSeed(d.deckSeed),
      deckNextIndex: pub.deckNextIndex ?? d.deckNextIndex,
      trumpUpcard: (pub.trumpUpcard as typeof d.trumpUpcard) ?? null,
      trumpHolderId: d.trumpHolderId,
      privateHands: { ...d.privateHands, [leadId]: stored },
      currentTrick: pub.currentTrick,
      playedCards: pub.playedCards,
    });
  });
});

describe("draw flow", () => {
  it("allows 1–4 discards when max is 4", () => {
    const d = deal();
    const pub = publicFromDeal(d);
    const deck = shuffledDeckFromSeed(d.deckSeed);
    for (const count of [1, 2, 3, 4]) {
      const fresh = effectivePlayerHand("p3", d.privateHands.p3, pub);
      const indices = Array.from({ length: count }, (_, i) => i);
      const result = applyDraw({
        hand: fresh,
        discardIndices: indices,
        deck,
        deckNextIndex: d.deckNextIndex,
        maxDiscards: 4,
      });
      assert.equal(result.discarded, count);
      assert.equal(result.hand.length, fresh.length);
    }
  });

  it("rejects over-limit discard count", () => {
    const d = deal();
    const pub = publicFromDeal(d);
    const effective = effectivePlayerHand("p3", d.privateHands.p3, pub);
    assert.throws(
      () =>
        applyDraw({
          hand: effective,
          discardIndices: [0, 1, 2, 3, 4],
          deck: shuffledDeckFromSeed(d.deckSeed),
          deckNextIndex: d.deckNextIndex,
          maxDiscards: 4,
        }),
      /at most 4/,
    );
  });
});

describe("dealer trump upcard during play", () => {
  it("dealer plays the flipped trump later in turn order from their hand", () => {
    const d = deal();
    const dealerId = "p1";
    const dealerPrivate = d.privateHands.p1.filter(
      (c) => !(c.rank === d.trumpUpcard.rank && c.suit === d.trumpUpcard.suit),
    );
    assert.equal(dealerPrivate.length, 4);

    const pub: PublicHandState = {
      ...publicFromDeal(d),
      phase: HAND_PHASE.PLAY,
      turnPlayerId: dealerId,
      currentTrick: {
        trickNumber: 5,
        leadPlayerId: dealerId,
        leadSuit: null,
        plays: [],
      },
      tricksByPlayer: { p1: 0, p2: 0, p3: 0, p4: 0 },
    };

    const effective = effectivePlayerHand(dealerId, dealerPrivate, pub);
    assert.equal(effective.length, 5);
    const trumpIndex = effective.findIndex(
      (c) => c.rank === d.trumpUpcard.rank && c.suit === d.trumpUpcard.suit,
    );
    assert.ok(trumpIndex >= 0);

    const playResult = applyPlayerPlayCard({
      publicHand: pub,
      privateHand: dealerPrivate,
      playerId: dealerId,
      cardIndex: trumpIndex,
      actionOrder: d.dealOrder,
    });
    assert.equal(playResult.publicHand.trumpUpcard, null);
    assert.equal(playResult.privateHand.length, 4);
    assert.equal(playResult.publicHand.currentTrick?.plays.length, 1);
    assert.equal(
      playResult.publicHand.currentTrick?.plays[0]?.card.rank,
      d.trumpUpcard.rank,
    );
  });

  it("counts remaining cards from trick history", () => {
    const d = deal();
    const pub: PublicHandState = {
      ...publicFromDeal(d),
      phase: HAND_PHASE.PLAY,
      playedCards: Array.from({ length: 4 }, (_, i) => ({
        playerId: "p2",
        card: { rank: "2", suit: "clubs" },
        trickNumber: i + 1,
      })),
      currentTrick: null,
    };
    assert.equal(cardsRemainingInHand(pub, "p2"), 1);
  });
});
