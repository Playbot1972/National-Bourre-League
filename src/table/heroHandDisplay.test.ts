import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  displayIndexToEffectiveIndex,
  effectiveIndexToDisplayIndex,
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
  it("shows four effective cards for trump holder while trump is on the table", () => {
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
    assert.equal(state.displayCards.length, 4);
    assert.equal(state.revealedTrumpIndex, null);
    assert.equal(state.hideCenterTrumpForHolder, false);
    assert.equal(state.trumpMergeActive, false);
    assert.equal(state.trumpDisabledIndex, null);
    assert.equal(state.indexMode, "effective");
  });

  it("maps effective draw/play indices to display positions during merge", () => {
    assert.equal(findTrumpDisplayIndex(raw, trumpUpcard), 4);
    assert.equal(effectiveIndexToDisplayIndex(0, 4), 0);
    assert.equal(effectiveIndexToDisplayIndex(3, 4), 3);
    assert.equal(displayIndexToEffectiveIndex(4, 4), null);
    assert.equal(displayIndexToEffectiveIndex(2, 4), 2);
    assert.deepEqual(mapEffectiveIndicesToDisplay([0, 2], 4), [0, 2]);
    assert.deepEqual(mapDisplayIndicesToEffective([0, 2], 4), [0, 2]);
    assert.deepEqual(mapDisplayIndicesToEffective([4], 4), []);
  });

  it("exposes merge target at fifth slot when trump merge is active", () => {
    const state = resolveHeroHandDisplay({
      rawHeroCards: raw,
      effectiveHeroCards: raw,
      playerId: "dealer",
      trumpHolderId: "dealer",
      trumpUpcard: null,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: true,
        trumpMergedIntoHand: false,
      },
    });
    assert.equal(state.displayCards.length, 5);
    assert.equal(state.revealedTrumpIndex, 4);
    assert.equal(state.trumpMergeActive, true);
    assert.equal(state.trumpDisabledIndex, 4);
    assert.equal(state.indexMode, "display");
  });

  it("returns effective hand after trump merge completes", () => {
    const state = resolveHeroHandDisplay({
      rawHeroCards: raw,
      effectiveHeroCards: raw,
      playerId: "dealer",
      trumpHolderId: "dealer",
      trumpUpcard: null,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
      },
    });
    assert.equal(state.displayCards.length, 5);
    assert.equal(state.revealedTrumpIndex, null);
    assert.equal(state.trumpMergeActive, false);
    assert.equal(state.indexMode, "effective");
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
