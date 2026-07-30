import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { botShouldFoldDraw, botShouldPassDecision, estimateHandStrength } from "./botDecisions";
import type { Card } from "../types";

const c = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("botDecisions", () => {
  it("flags very weak non-trump hands for fold", () => {
    const weak = [c("2", "hearts"), c("3", "diamonds"), c("4", "clubs"), c("5", "spades"), c("6", "hearts")];
    assert.equal(botShouldFoldDraw(weak, "clubs"), true);
    assert.equal(botShouldPassDecision(weak, "clubs"), true);
  });

  it("keeps playable hands in", () => {
    const strong = [c("A", "clubs"), c("K", "clubs"), c("Q", "hearts"), c("7", "diamonds"), c("2", "spades")];
    assert.equal(botShouldFoldDraw(strong, "clubs"), false);
    assert.equal(estimateHandStrength(strong, "clubs") >= 2.25, true);
  });
});
