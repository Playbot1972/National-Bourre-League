import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dealInitialHand } from "./deal";
import { applyDraw } from "./draw";
import { applyPlayCard } from "./play";
import { assertCardUniqueness, effectivePlayerHand, privateHandFromEffective } from "./invariants";
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
    maxDrawDiscards: 4,
  };
}

describe("card uniqueness", () => {
  it("initial deal has no duplicate across deck, trump, and hands", () => {
    const d = deal();
    assertCardUniqueness({
      deck: shuffledDeckFromSeed(d.deckSeed),
      deckNextIndex: d.deckNextIndex,
      trumpUpcard: d.trumpUpcard,
      privateHands: d.privateHands,
    });
    assert.equal(d.privateHands.p1.length, 4);
    assert.equal(effectivePlayerHand("p1", d.privateHands.p1, publicFromDeal(d)).length, 5);
  });

  it("trump upcard is not stored in dealer private hand", () => {
    const d = deal();
    const pub = publicFromDeal(d);
    const dealerPrivate = d.privateHands.p1;
    assert.ok(!dealerPrivate.some((c) => c.rank === d.trumpUpcard.rank && c.suit === d.trumpUpcard.suit));
    assert.ok(effectivePlayerHand("p1", dealerPrivate, pub).some((c) => c.rank === d.trumpUpcard.rank));
  });

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
      privateHands: { ...d.privateHands, p2: nextPrivate },
    });
  });

  it("post-play state stays unique", () => {
    const d = deal();
    let pub = { ...publicFromDeal(d), phase: HAND_PHASE.PLAY, currentTrick: {
      trickNumber: 1,
      leadPlayerId: d.dealOrder[0],
      leadSuit: null,
      plays: [],
    } };
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
