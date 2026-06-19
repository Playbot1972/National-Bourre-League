import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveSeatTrumpDisplay,
  resolveTrumpHolderPresentation,
  trumpHolderSeatIndex,
} from "./trumpHolderPresentation";

const trumpUpcard = { rank: "A", suit: "hearts" };

describe("trumpHolderPresentation", () => {
  it("hides center trump while holder presentation is active", () => {
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
    assert.equal(state.hideCenterTrump, true);
    assert.equal(state.showRevealedTrumpAtHolder, true);
  });

  it("shows suit reminder after merge during draw", () => {
    const state = resolveTrumpHolderPresentation({
      trumpHolderId: "bot_1",
      trumpUpcard,
      trumpSuit: "hearts",
      phase: "draw",
      handPresentation: {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
      },
    });
    assert.equal(state.hideCenterTrump, true);
    assert.equal(state.showTrumpSuitReminder, true);
    assert.equal(state.showRevealedTrumpAtHolder, false);
  });

  it("reveals trump on bot dealer seat as fifth card", () => {
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
    assert.equal(trumpHolderSeatIndex(5), 4);
    const seat = resolveSeatTrumpDisplay("bot_1", presentation, trumpUpcard, 5, false);
    assert.equal(seat.revealedTrumpIndex, 4);
    assert.deepEqual(seat.revealedTrumpUpcard, trumpUpcard);
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
    const seat = resolveSeatTrumpDisplay("user_1", presentation, trumpUpcard, 5, true);
    assert.equal(seat.revealedTrumpIndex, null);
  });
});
