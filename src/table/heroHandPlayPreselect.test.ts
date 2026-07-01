import assert from "node:assert/strict";
import test from "node:test";
import {
  computeRecommendedDiscardIndices,
  computeRecommendedPlayIndex,
  effectiveDrawDiscardIndices,
  isLegalPlayIndex,
  togglePlayPreselectIndex,
} from "./heroHandPlayPreselect";
import type { Card } from "../types";

test("togglePlayPreselectIndex deselects same card and switches to another", () => {
  assert.equal(togglePlayPreselectIndex(null, 2), 2);
  assert.equal(togglePlayPreselectIndex(2, 2), null);
  assert.equal(togglePlayPreselectIndex(2, 4), 4);
});

test("isMyTurn play path should not use toggle deselect semantics", () => {
  const isMyTurn = true;
  const selectedPlay = 2;
  const clicked = 2;
  const nextSelection = isMyTurn ? clicked : togglePlayPreselectIndex(selectedPlay, clicked);
  assert.equal(nextSelection, 2);
});

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

test("computeRecommendedDiscardIndices never recommends aces or trump", () => {
  const hand: Card[] = [
    { rank: "A", suit: "hearts" },
    { rank: "3", suit: "clubs" },
    { rank: "5", suit: "diamonds" },
    { rank: "7", suit: "spades" },
    { rank: "K", suit: "hearts" },
  ];
  assert.deepEqual(computeRecommendedDiscardIndices(hand, "hearts", 2), [1, 2]);
  const trumpOnly: Card[] = [
    { rank: "A", suit: "hearts" },
    { rank: "K", suit: "hearts" },
    { rank: "Q", suit: "hearts" },
  ];
  assert.deepEqual(computeRecommendedDiscardIndices(trumpOnly, "hearts", 2), []);
});

test("computeRecommendedDiscardIndices respects deck remainder and exclusions", () => {
  const hand: Card[] = [
    { rank: "2", suit: "clubs" },
    { rank: "4", suit: "diamonds" },
    { rank: "6", suit: "spades" },
  ];
  assert.deepEqual(computeRecommendedDiscardIndices(hand, "hearts", 2, 0), []);
  assert.deepEqual(computeRecommendedDiscardIndices(hand, "hearts", 2, 1), [0]);
  assert.deepEqual(computeRecommendedDiscardIndices(hand, "hearts", 2, 1, [0]), [1]);
});

test("effectiveDrawDiscardIndices prefers manual picks over Best Play hints", () => {
  assert.deepEqual(
    effectiveDrawDiscardIndices({
      selectedDraw: new Set([1]),
      drawSelectionTouched: true,
      bestPlayEnabled: true,
      recommendedDiscardIndices: [2, 3],
    }),
    [1],
  );
  assert.deepEqual(
    effectiveDrawDiscardIndices({
      selectedDraw: new Set(),
      drawSelectionTouched: false,
      bestPlayEnabled: true,
      recommendedDiscardIndices: [2, 3],
    }),
    [2, 3],
  );
  assert.deepEqual(
    effectiveDrawDiscardIndices({
      selectedDraw: new Set(),
      drawSelectionTouched: false,
      bestPlayEnabled: false,
      recommendedDiscardIndices: [2, 3],
    }),
    [],
  );
});

test("effectiveDrawDiscardIndices uses Best Play preselection in selectedDraw", () => {
  assert.deepEqual(
    effectiveDrawDiscardIndices({
      selectedDraw: new Set([2, 3]),
      drawSelectionTouched: false,
      bestPlayEnabled: true,
      recommendedDiscardIndices: [2, 3],
    }),
    [2, 3],
  );
});
