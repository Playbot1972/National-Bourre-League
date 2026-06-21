import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getLegalPlayIndices, validatePlayIndex } from "./legal";
import type { Card } from "../types";

const c = (rank: string, suit: string): Card =>
  ({ rank, suit }) as Card;

describe("D — play legality", () => {
  it("allows any card when leading", () => {
    const hand = [c("2", "clubs"), c("A", "hearts"), c("K", "spades")];
    const legal = getLegalPlayIndices({
      hand,
      trumpSuit: "diamonds",
      leadSuit: null,
      trickPlays: [],
      isLeading: true,
    });
    assert.deepEqual(legal, [0, 1, 2]);
  });

  it("allows trump lead on empty trick with stale leadSuit", () => {
    const hand = [c("K", "hearts"), c("3", "clubs")];
    const legal = getLegalPlayIndices({
      hand,
      trumpSuit: "hearts",
      leadSuit: "clubs",
      trickPlays: [],
      isLeading: true,
    });
    assert.deepEqual(legal, [0, 1]);
  });

  it("must follow suit when able", () => {
    const hand = [c("2", "clubs"), c("A", "hearts")];
    const legal = getLegalPlayIndices({
      hand,
      trumpSuit: "diamonds",
      leadSuit: "clubs",
      trickPlays: [c("5", "clubs")],
      isLeading: false,
    });
    assert.deepEqual(legal, [0]);
    const bad = validatePlayIndex(
      {
        hand,
        trumpSuit: "diamonds",
        leadSuit: "clubs",
        trickPlays: [c("5", "clubs")],
        isLeading: false,
      },
      1,
    );
    assert.equal(bad.ok, false);
    if (!bad.ok) assert.equal(bad.code, "MUST_FOLLOW_SUIT");
  });

  it("must trump when void in led suit", () => {
    const hand = [c("2", "hearts"), c("3", "diamonds")];
    const legal = getLegalPlayIndices({
      hand,
      trumpSuit: "diamonds",
      leadSuit: "clubs",
      trickPlays: [c("5", "clubs")],
      isLeading: false,
    });
    assert.deepEqual(legal, [1]);
  });

  it("must overtrump when trick is trumped", () => {
    const hand = [c("5", "diamonds"), c("A", "diamonds")];
    const legal = getLegalPlayIndices({
      hand,
      trumpSuit: "diamonds",
      leadSuit: "clubs",
      trickPlays: [c("5", "clubs"), c("K", "diamonds")],
      isLeading: false,
    });
    assert.deepEqual(legal, [1]);
  });

  it("must beat highest led card when able", () => {
    const hand = [c("6", "clubs"), c("Q", "clubs"), c("2", "hearts")];
    const legal = getLegalPlayIndices({
      hand,
      trumpSuit: "diamonds",
      leadSuit: "clubs",
      trickPlays: [c("9", "clubs")],
      isLeading: false,
    });
    assert.deepEqual(legal, [1]);
  });

  it("may play any card when void and no trump", () => {
    const hand = [c("2", "hearts"), c("3", "hearts")];
    const legal = getLegalPlayIndices({
      hand,
      trumpSuit: "diamonds",
      leadSuit: "clubs",
      trickPlays: [c("5", "clubs")],
      isLeading: false,
    });
    assert.deepEqual(legal, [0, 1]);
  });
});
