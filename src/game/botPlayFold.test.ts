import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateHandStrength,
  evaluatePlayOrFold,
  isHighCard,
} from "./botPlayFold";
import { chooseCardsToDiscard, mapCardsToIndices } from "./botDrawChoice";
import type { Card } from "../types";

const c = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("botPlayFold", () => {
  it("isHighCard flags J and above", () => {
    assert.equal(isHighCard(c("J", "hearts")), true);
    assert.equal(isHighCard(c("10", "hearts")), false);
  });

  it("always plays with Ace of trump", () => {
    const hand = [c("A", "clubs"), c("2", "hearts"), c("3", "diamonds"), c("4", "spades"), c("5", "hearts")];
    assert.equal(evaluatePlayOrFold(hand, "clubs"), true);
  });

  it("folds very weak non-trump hands", () => {
    const weak = [c("2", "hearts"), c("3", "diamonds"), c("5", "spades"), c("6", "hearts"), c("7", "diamonds")];
    assert.equal(evaluatePlayOrFold(weak, "clubs"), false);
    assert.ok(calculateHandStrength(weak, "clubs") < 2.5);
  });

  it("plays with two or more high cards when strength is adequate", () => {
    const strong = [c("A", "clubs"), c("K", "clubs"), c("Q", "hearts"), c("7", "diamonds"), c("2", "spades")];
    assert.equal(evaluatePlayOrFold(strong, "clubs"), true);
  });
});

describe("botDrawChoice", () => {
  it("stands pat with trump Ace and multiple faces", () => {
    const hand = [c("A", "hearts"), c("K", "hearts"), c("Q", "diamonds"), c("J", "clubs"), c("2", "spades")];
    assert.deepEqual(chooseCardsToDiscard(hand, "hearts"), []);
  });

  it("discards weak off-suit lows first", () => {
    const hand = [c("A", "hearts"), c("K", "diamonds"), c("2", "clubs"), c("3", "spades"), c("4", "hearts")];
    const discard = chooseCardsToDiscard(hand, "hearts");
    assert.ok(discard.some((card) => card.rank === "2" || card.rank === "3"));
    assert.ok(!discard.some((card) => card.rank === "A" && card.suit === "hearts"));
  });

  it("maps discard cards back to hand indices", () => {
    const hand = [c("2", "clubs"), c("A", "hearts"), c("3", "diamonds")];
    const indices = mapCardsToIndices([c("2", "clubs"), c("3", "diamonds")], hand);
    assert.deepEqual(indices, [0, 2]);
  });

  it("caps discards at five cards", () => {
    const hand = [
      c("2", "clubs"),
      c("3", "clubs"),
      c("4", "clubs"),
      c("5", "clubs"),
      c("6", "clubs"),
      c("7", "clubs"),
    ];
    assert.equal(chooseCardsToDiscard(hand, "hearts").length, 5);
  });
});
