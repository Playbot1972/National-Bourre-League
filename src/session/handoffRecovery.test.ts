import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSessionCurrentHand, isClearedPreDealHand } from "./liveHand";
import { shouldAutoOpenNextHand } from "./handPhaseMachine";

describe("post-settlement handoff recovery", () => {
  it("treats cleared authoritative hand as ready for next enrollment on live table", () => {
    const session = {
      status: "in_progress",
      handCount: 2,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "play",
            participantIds: ["a", "b", "c"],
            tricksByPlayer: { a: 3, b: 1, c: 1 },
          },
        },
      },
    };
    assert.ok(isClearedPreDealHand(getSessionCurrentHand(session)));
    assert.equal(
      shouldAutoOpenNextHand({ session, tablePlayOpen: true }),
      true,
    );
  });

  it("blocks handoff while co-win vote is pending", () => {
    const session = {
      status: "in_progress",
      handCount: 1,
      pendingCoWinSettlement: { winnerIds: ["a", "b"] },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    assert.equal(
      shouldAutoOpenNextHand({ session, tablePlayOpen: true }),
      false,
    );
  });
});
