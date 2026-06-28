import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveSeatTrumpDisplay,
  resolveTrumpHolderPresentation,
  trumpHolderSeatIndex,
} from "./trumpHolderPresentation";

const trumpUpcard = { rank: "A", suit: "hearts" };

describe("trumpHolderPresentation", () => {
  it("keeps center trump visible while holder presentation is active", () => {
    const state = resolveTrumpHolderPresentation({
      trumpHolderId: "bot_1",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: true,
        trumpMergeActive: false,
        trumpMergedIntoHand: false,
      },
    });
    assert.equal(state.hideCenterTrump, false);
    assert.equal(state.showRevealedTrumpAtHolder, false);
  });

  it("shows suit reminder after merge when upcard cleared during draw", () => {
    const state = resolveTrumpHolderPresentation({
      trumpHolderId: "bot_1",
      trumpUpcard: null,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
      },
    });
    assert.equal(state.hideCenterTrump, false);
    assert.equal(state.showTrumpSuitReminder, true);
    assert.equal(state.showRevealedTrumpAtHolder, false);
  });

  it("keeps center trump visible after merge latch while upcard remains", () => {
    const state = resolveTrumpHolderPresentation({
      trumpHolderId: "bot_1",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "reveal",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
      },
    });
    assert.equal(state.hideCenterTrump, false);
    assert.equal(state.showTrumpSuitReminder, false);
    assert.equal(state.showRevealedTrumpAtHolder, false);
  });

  it("does not reveal trump on opponent seat while upcard is in center", () => {
    const presentation = resolveTrumpHolderPresentation({
      trumpHolderId: "bot_1",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: true,
        trumpMergeActive: false,
        trumpMergedIntoHand: false,
      },
    });
    assert.equal(trumpHolderSeatIndex(4), 3);
    const seat = resolveSeatTrumpDisplay("bot_1", presentation, trumpUpcard, 4, false);
    assert.equal(seat.revealedTrumpIndex, null);
    assert.equal(seat.revealedTrumpUpcard, null);
  });

  it("does not duplicate trump on self seat (hero hand handles local holder)", () => {
    const presentation = resolveTrumpHolderPresentation({
      trumpHolderId: "user_1",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: true,
        trumpMergeActive: false,
        trumpMergedIntoHand: false,
      },
    });
    const seat = resolveSeatTrumpDisplay("user_1", presentation, trumpUpcard, 4, true);
    assert.equal(seat.revealedTrumpIndex, null);
  });
});
