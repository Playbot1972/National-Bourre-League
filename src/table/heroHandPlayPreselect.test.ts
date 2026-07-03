import assert from "node:assert/strict";
import test from "node:test";
import {
  computeRecommendedDiscardIndices,
  computeRecommendedPlayIndex,
  effectiveDrawDiscardIndices,
  isLegalPlayIndex,
  planTapAutoplay,
  resolveHeroPlayCardVisualTier,
  resolveManualOrRecommendedPlayState,
  shouldShowBestPlayRecommendation,
  shouldSwipeImmediatePlay,
  togglePlayPreselectIndex,
} from "./heroHandPlayPreselect";
import type { Card } from "../types";

test("togglePlayPreselectIndex selects, switches, and deselects", () => {
  assert.equal(togglePlayPreselectIndex(null, 2), 2);
  assert.equal(togglePlayPreselectIndex(2, 2), null);
  assert.equal(togglePlayPreselectIndex(2, 4), 4);
});

test("togglePlayPreselectIndex supports deselect before timer would fire", () => {
  let selected: number | null = 3;
  selected = togglePlayPreselectIndex(selected, 3);
  assert.equal(selected, null);
});

test("planTapAutoplay selects legal on-turn card for immediate play", () => {
  const plan = planTapAutoplay({
    selectedPlay: null,
    tappedIndex: 2,
    isMyTurn: true,
    isLegal: true,
  });
  assert.equal(plan.nextSelection, 2);
  assert.equal(plan.shouldImmediatePlay, true);
  assert.equal(plan.shouldQueueSelection, false);
  assert.equal(plan.isDeselect, false);
});

test("planTapAutoplay deselects same selected card", () => {
  const plan = planTapAutoplay({
    selectedPlay: 2,
    tappedIndex: 2,
    isMyTurn: true,
    isLegal: true,
  });
  assert.equal(plan.nextSelection, null);
  assert.equal(plan.shouldImmediatePlay, false);
  assert.equal(plan.isDeselect, true);
  assert.equal(plan.shouldCancelAutoplay, true);
});

test("planTapAutoplay switches selection from A to B", () => {
  const plan = planTapAutoplay({
    selectedPlay: 1,
    tappedIndex: 3,
    isMyTurn: true,
    isLegal: true,
  });
  assert.equal(plan.nextSelection, 3);
  assert.equal(plan.shouldImmediatePlay, true);
  assert.equal(plan.shouldCancelAutoplay, true);
});

test("planTapAutoplay does not arm for illegal card", () => {
  const plan = planTapAutoplay({
    selectedPlay: null,
    tappedIndex: 4,
    isMyTurn: true,
    isLegal: false,
  });
  assert.equal(plan.nextSelection, 4);
  assert.equal(plan.shouldImmediatePlay, false);
  assert.equal(plan.shouldQueueSelection, false);
});

test("planTapAutoplay queues out of turn without immediate play", () => {
  const plan = planTapAutoplay({
    selectedPlay: null,
    tappedIndex: 2,
    isMyTurn: false,
    isLegal: true,
  });
  assert.equal(plan.nextSelection, 2);
  assert.equal(plan.shouldImmediatePlay, false);
  assert.equal(plan.shouldQueueSelection, true);
});

test("shouldSwipeImmediatePlay requires on-turn and legal", () => {
  assert.equal(shouldSwipeImmediatePlay(true, true), true);
  assert.equal(shouldSwipeImmediatePlay(false, true), false);
  assert.equal(shouldSwipeImmediatePlay(true, false), false);
});

test("shouldShowBestPlayRecommendation ignores selectedPlay preselect state", () => {
  const base = {
    showBestPlayControl: true,
    inPlayPhase: true,
    bestPlayEnabled: true,
    recommendedPlayIndex: 2,
  };
  assert.equal(shouldShowBestPlayRecommendation(base), true);
});

test("resolveHeroPlayCardVisualTier applies styling precedence", () => {
  const base = {
    inPlayPhase: true,
    isMyTurn: true,
    busy: false,
    isLegal: true,
    showBestPlayRecommendation: true,
    recommendedPlayIndex: 2,
  };
  assert.equal(
    resolveHeroPlayCardVisualTier({ ...base, cardIndex: 3, selectedPlay: 3 }),
    "play-preselected",
  );
  assert.equal(
    resolveHeroPlayCardVisualTier({ ...base, cardIndex: 2, selectedPlay: 3 }),
    "play-recommended",
  );
  assert.equal(
    resolveHeroPlayCardVisualTier({ ...base, cardIndex: 4, selectedPlay: 3, isLegal: true }),
    "legal-playable",
  );
  assert.equal(
    resolveHeroPlayCardVisualTier({
      ...base,
      cardIndex: 2,
      selectedPlay: 2,
      recommendedPlayIndex: 2,
    }),
    "play-preselected",
  );
});

test("resolveHeroPlayCardVisualTier keeps legal outline off selected and recommended cards", () => {
  assert.equal(
    resolveHeroPlayCardVisualTier({
      inPlayPhase: true,
      isMyTurn: true,
      busy: false,
      cardIndex: 1,
      selectedPlay: 1,
      isLegal: true,
      showBestPlayRecommendation: true,
      recommendedPlayIndex: 2,
    }),
    "play-preselected",
  );
  assert.notEqual(
    resolveHeroPlayCardVisualTier({
      inPlayPhase: true,
      isMyTurn: true,
      busy: false,
      cardIndex: 2,
      selectedPlay: 1,
      isLegal: true,
      showBestPlayRecommendation: true,
      recommendedPlayIndex: 2,
    }),
    "legal-playable",
  );
});

test("resolveManualOrRecommendedPlayState maps manual and recommended tiers only", () => {
  assert.equal(
    resolveManualOrRecommendedPlayState({
      cardIndex: 1,
      selectedPlay: 3,
      showBestPlayRecommendation: true,
      recommendedPlayIndex: 2,
    }),
    null,
  );
  assert.equal(
    resolveManualOrRecommendedPlayState({
      cardIndex: 2,
      selectedPlay: 3,
      showBestPlayRecommendation: true,
      recommendedPlayIndex: 2,
    }),
    "play-recommended",
  );
  assert.equal(
    resolveManualOrRecommendedPlayState({
      cardIndex: 3,
      selectedPlay: 3,
      showBestPlayRecommendation: true,
      recommendedPlayIndex: 2,
    }),
    "play-preselected",
  );
});

test("resolveManualOrRecommendedPlayState prefers preselect when same card is recommended", () => {
  assert.equal(
    resolveManualOrRecommendedPlayState({
      cardIndex: 2,
      selectedPlay: 2,
      showBestPlayRecommendation: true,
      recommendedPlayIndex: 2,
    }),
    "play-preselected",
  );
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
