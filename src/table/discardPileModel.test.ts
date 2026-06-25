import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDiscardPileCard,
  discardPilePlacement,
  discardCardKeysForDraw,
} from "./discardPileModel";

describe("discardPileModel", () => {
  it("placement is deterministic per card key", () => {
    const a = discardPilePlacement("A-spades", 0);
    const b = discardPilePlacement("A-spades", 0);
    assert.deepEqual(a, b);
  });

  it("placement varies by pile index", () => {
    const a = discardPilePlacement("K-hearts", 0);
    const b = discardPilePlacement("K-hearts", 3);
    assert.notEqual(a.offsetX, b.offsetX);
  });

  it("offsets and rotation stay within visual spec", () => {
    const p = discardPilePlacement("Q-clubs", 2);
    assert.ok(Math.abs(p.offsetX) >= 12 && Math.abs(p.offsetX) <= 18);
    assert.ok(Math.abs(p.offsetY) >= 12 && Math.abs(p.offsetY) <= 18);
    assert.ok(Math.abs(p.rotation) >= 7 && Math.abs(p.rotation) <= 9);
    assert.ok(p.scale >= 0.94 && p.scale <= 0.98);
  });

  it("buildDiscardPileCard assigns rising z-index", () => {
    const card = buildDiscardPileCard({
      id: "bot_a:h1:d0",
      playerId: "bot_a",
      handNumber: 1,
      pileIndex: 4,
    });
    assert.equal(card.zIndex, 5);
  });

  it("discardCardKeysForDraw uses hero keys when provided", () => {
    const keys = discardCardKeysForDraw({
      playerId: "p0",
      handNumber: 2,
      discardCount: 2,
      pileStartIndex: 0,
      heroCardKeys: ["A-spades", "K-hearts"],
    });
    assert.deepEqual(keys, ["A-spades", "K-hearts"]);
  });
});
