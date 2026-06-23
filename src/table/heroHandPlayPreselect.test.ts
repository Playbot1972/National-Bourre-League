import assert from "node:assert/strict";
import test from "node:test";
import { computeRecommendedPlayIndex, isLegalPlayIndex } from "./heroHandPlayPreselect";
import type { Card } from "../types";

test("isLegalPlayIndex allows any index when legality list is absent", () => {
  assert.equal(isLegalPlayIndex(2, undefined), true);
});

test("isLegalPlayIndex gates on legalPlayIndices from engine", () => {
  assert.equal(isLegalPlayIndex(1, [0, 2, 4]), false);
  assert.equal(isLegalPlayIndex(2, [0, 2, 4]), true);
});

test("computeRecommendedPlayIndex returns null without legal plays", () => {
  const hand: Card[] = [
    { rank: "A", suit: "spades" },
    { rank: "K", suit: "hearts" },
  ];
  assert.equal(
    computeRecommendedPlayIndex(hand, { trumpSuit: "clubs", currentTrick: null, leadSuit: null }, null),
    null,
  );
  assert.equal(
    computeRecommendedPlayIndex(hand, { trumpSuit: "clubs", currentTrick: null, leadSuit: null }, []),
    null,
  );
});

test("computeRecommendedPlayIndex leads high when opening a trick", () => {
  const hand: Card[] = [
    { rank: "K", suit: "hearts" },
    { rank: "7", suit: "clubs" },
    { rank: "A", suit: "diamonds" },
  ];
  const idx = computeRecommendedPlayIndex(
    hand,
    { trumpSuit: "clubs", currentTrick: null, leadSuit: null },
    [0, 1, 2],
  );
  assert.equal(idx, 2);
});
