import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  botDrawDiscardIndices,
  botShouldFoldDraw,
  botShouldPassDecision,
} from "./botSearch";
import type { Card } from "../types";

const c = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("botSearch integration", () => {
  it("botShouldPassDecision returns true when evaluatePlayOrFold is false", () => {
    const weak = [c("2", "hearts"), c("3", "diamonds"), c("5", "spades"), c("6", "hearts"), c("7", "diamonds")];
    assert.equal(botShouldPassDecision(weak, "clubs"), true);
  });

  it("botShouldFoldDraw mirrors pass/fold heuristic", () => {
    const strong = [c("A", "clubs"), c("K", "clubs"), c("Q", "hearts"), c("7", "diamonds"), c("2", "spades")];
    assert.equal(botShouldFoldDraw(strong, "clubs"), false);
  });

  it("botDrawDiscardIndices respects maxDiscards and deck cap", () => {
    const hand = [c("A", "hearts"), c("2", "clubs"), c("3", "diamonds"), c("4", "spades"), c("5", "hearts")];
    assert.deepEqual(botDrawDiscardIndices(hand, "hearts", 2, 0), []);
    const one = botDrawDiscardIndices(hand, "hearts", 2, 1);
    assert.equal(one.length, 1);
    const two = botDrawDiscardIndices(hand, "hearts", 2, 5);
    assert.ok(two.length <= 2);
  });
});
