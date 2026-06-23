import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { card } from "../types";
import {
  applyDrawPile,
  createDrawPileFromStock,
  drawFromPile,
  totalAvailableReplacements,
} from "./drawPile";

const c = (rank: string, suit: string) => card(rank as "A", suit as "spades");

describe("draw pile — stock, recycle, pending discards", () => {
  it("draws from stock first before touching recycle", () => {
    const pile = {
      stock: [c("A", "spades"), c("K", "hearts")],
      recyclePool: [c("2", "clubs")],
      pendingDiscards: [],
      recycleShuffleCount: 0,
    };
    const { pile: next, cards } = drawFromPile(pile, 2, 42);
    assert.equal(cards.length, 2);
    assert.equal(cards[0].rank, "A");
    assert.equal(cards[1].rank, "K");
    assert.equal(next.stock.length, 0);
    assert.equal(next.recyclePool.length, 1);
  });

  it("reshuffles recycle into stock when stock is exhausted mid-draw", () => {
    const pile = {
      stock: [c("A", "spades")],
      recyclePool: [c("2", "clubs"), c("3", "diamonds")],
      pendingDiscards: [],
      recycleShuffleCount: 0,
    };
    const { cards } = drawFromPile(pile, 2, 99);
    assert.equal(cards.length, 2);
    assert.ok(cards.some((x) => x.rank === "A"));
  });

  it("excludes current player pending discards from recycle reshuffle", () => {
    const pending = c("4", "hearts");
    const recycleA = c("2", "clubs");
    const recycleB = c("3", "diamonds");
    const pile = {
      stock: [c("A", "spades")],
      recyclePool: [recycleA, recycleB],
      pendingDiscards: [pending],
      recycleShuffleCount: 0,
    };

    const { pile: afterOne, cards: first } = drawFromPile(pile, 1, 7);
    assert.equal(first.length, 1);
    assert.equal(first[0].rank, "A");
    assert.equal(afterOne.stock.length, 0);
    assert.deepEqual(afterOne.pendingDiscards, [pending]);
    assert.equal(afterOne.recyclePool.length, 2);

    const reshuffled = drawFromPile(afterOne, 1, 7);
    assert.equal(reshuffled.cards.length, 1);
    assert.notEqual(reshuffled.cards[0].rank, "4");
    assert.notEqual(reshuffled.cards[0].suit, "hearts");
  });

  it("moves pending discards into recycle only after replacement draw completes", () => {
    const discarded = [c("5", "clubs"), c("6", "diamonds")];
    const pile = createDrawPileFromStock([c("A", "spades"), c("K", "hearts"), c("Q", "clubs")]);
    const { pile: next, replacements } = applyDrawPile({
      pile,
      discardedCards: discarded,
      drawCount: 2,
      deckSeed: 42,
    });
    assert.equal(replacements.length, 2);
    assert.equal(next.pendingDiscards.length, 0);
    assert.equal(next.recyclePool.length, 2);
    assert.ok(next.recyclePool.every((c) => c.rank === "5" || c.rank === "6"));
    assert.equal(next.stock.length, 1);
  });

  it("totalAvailableReplacements excludes pending discards", () => {
    const pile = {
      stock: [c("A", "spades")],
      recyclePool: [c("2", "clubs")],
      pendingDiscards: [c("3", "diamonds"), c("4", "hearts")],
      recycleShuffleCount: 0,
    };
    assert.equal(totalAvailableReplacements(pile), 2);
  });
});
