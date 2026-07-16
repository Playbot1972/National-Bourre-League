import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  beginHeroPlayHandoff,
  cancelHeroPlayHandoff,
  completeHeroPlayHandoff,
  getHeroPlayHandoff,
  isHeroPlayHandoffActive,
} from "./heroPlayHandoff";

describe("heroPlayHandoff", () => {
  it("tracks active handoff until trick flight starts", () => {
    cancelHeroPlayHandoff();
    beginHeroPlayHandoff({
      playKey: "p0:A:spades",
      card: { rank: "A", suit: "spades" },
      slotIndex: 2,
    });
    assert.equal(isHeroPlayHandoffActive(), true);
    assert.equal(isHeroPlayHandoffActive("p0:A:spades"), true);
    completeHeroPlayHandoff("p0:A:spades");
    assert.equal(getHeroPlayHandoff(), null);
    assert.equal(isHeroPlayHandoffActive(), false);
  });

  it("ignores completion for a different play key", () => {
    cancelHeroPlayHandoff();
    beginHeroPlayHandoff({
      playKey: "p0:K:hearts",
      card: { rank: "K", suit: "hearts" },
      slotIndex: 0,
    });
    completeHeroPlayHandoff("p0:Q:clubs");
    assert.equal(isHeroPlayHandoffActive("p0:K:hearts"), true);
    cancelHeroPlayHandoff();
  });
});
