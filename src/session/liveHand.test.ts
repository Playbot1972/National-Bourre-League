import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSessionCurrentHand, getSessionEnrollment } from "./liveHand";

describe("live enrollment hand view", () => {
  it("prefers liveEnrollment deal publicHand over stale handEnrollment", () => {
    const session = {
      handEnrollment: { active: true, enrolledIds: ["a", "b"] },
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: { phase: "draw", participantIds: ["a", "b"], tricksByPlayer: {} },
          sortedPlayerIds: ["a", "b"],
        },
      },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    assert.equal(getSessionEnrollment(session), null);
    assert.equal(getSessionCurrentHand(session).phase, "draw");
    assert.deepEqual(getSessionCurrentHand(session).participantIds, ["a", "b"]);
  });

  it("uses active liveEnrollment during I'm-in rotation", () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["a", "b"],
      currentIndex: 0,
      enrolledIds: [] as string[],
      declinedIds: [] as string[],
    };
    const session = {
      handEnrollment: { active: false },
      liveEnrollment: enrollment,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    assert.equal(getSessionEnrollment(session), enrollment);
    assert.equal(getSessionCurrentHand(session).phase, undefined);
  });
});
