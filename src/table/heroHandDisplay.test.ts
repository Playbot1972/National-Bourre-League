import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findTrumpDisplayIndex,
  mapDisplayIndicesToEffective,
  mapEffectiveIndicesToDisplay,
  resolveHeroHandDisplay,
} from "./heroHandDisplay";

const raw = [
  { rank: "2", suit: "clubs" },
  { rank: "5", suit: "hearts" },
  { rank: "9", suit: "spades" },
  { rank: "J", suit: "diamonds" },
  { rank: "A", suit: "hearts" },
];

const effective = raw.slice(0, 4);
const trumpUpcard = { rank: "A", suit: "hearts" };

describe("heroHandDisplay", () => {
  it("shows five raw cards for trump holder while trump is on the table", () => {
    const state = resolveHeroHandDisplay({
      rawHeroCards: raw,
      effectiveHeroCards: effective,
      playerId: "dealer",
      trumpHolderId: "dealer",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: true,
        trumpMergeActive: false,
        trumpMergedIntoHand: false,
      },
    });
    assert.equal(state.displayCards.length, 5);
    assert.equal(state.revealedTrumpIndex, 4);
    assert.equal(state.hideCenterTrumpForHolder, true);
    assert.equal(state.indexMode, "display");
  });

  it("maps effective draw/play indices to display positions", () => {
    assert.equal(findTrumpDisplayIndex(raw, trumpUpcard), 4);
    assert.deepEqual(mapEffectiveIndicesToDisplay([0, 2], 4), [0, 2]);
    assert.deepEqual(mapDisplayIndicesToEffective([0, 2], 4), [0, 2]);
    assert.deepEqual(mapDisplayIndicesToEffective([4], 4), [4]);
  });

  it("shows suit reminder after trump merges into holder hand", () => {
    const state = resolveHeroHandDisplay({
      rawHeroCards: raw,
      effectiveHeroCards: effective,
      playerId: "dealer",
      trumpHolderId: "dealer",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
      },
    });
    assert.equal(state.revealedTrumpIndex, null);
    assert.equal(state.showTrumpSuitReminder, true);
    assert.equal(state.trumpDisabledIndex, null);
  });

  it("keeps holder fan stable while raw private hand catches up", () => {
    const state = resolveHeroHandDisplay({
      rawHeroCards: [],
      effectiveHeroCards: effective,
      playerId: "dealer",
      trumpHolderId: "dealer",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
      },
    });
    assert.equal(state.displayCards.length, 4);
    assert.equal(state.indexMode, "display");
  });

  it("prefers raw five-card fan once private hand is fully loaded", () => {
    const state = resolveHeroHandDisplay({
      rawHeroCards: raw,
      effectiveHeroCards: effective,
      playerId: "dealer",
      trumpHolderId: "dealer",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
      },
    });
    assert.equal(state.displayCards.length, 5);
    assert.equal(state.indexMode, "display");
  });

  it("keeps effective hand for non-holders", () => {
    const state = resolveHeroHandDisplay({
      rawHeroCards: raw,
      effectiveHeroCards: effective,
      playerId: "p2",
      trumpHolderId: "dealer",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: true,
        trumpMergeActive: false,
        trumpMergedIntoHand: false,
      },
    });
    assert.equal(state.displayCards.length, 4);
    assert.equal(state.indexMode, "effective");
  });
});
