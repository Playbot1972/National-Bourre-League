import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSessionCurrentHand, getSessionEnrollment } from "./liveHand";

describe("live enrollment hand view", () => {
  it("ignores orphan liveEnrollment deal when currentHand is cleared between hands", () => {
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
    assert.equal(getSessionCurrentHand(session).phase, undefined);
    assert.deepEqual(getSessionCurrentHand(session).participantIds, []);
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

  it("ignores legacy enrollment when a dealt hand is in progress", () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["a", "b"],
      currentIndex: 0,
      enrolledIds: [] as string[],
      declinedIds: [] as string[],
    };
    const session = {
      liveEnrollment: {
        ...enrollment,
        deal: {
          publicHand: { phase: "play", participantIds: ["a", "b"], tricksByPlayer: { a: 2 } },
        },
      },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    assert.equal(getSessionEnrollment(session), null);
    assert.equal(getSessionCurrentHand(session).phase, "play");
  });

  it("returns active handEnrollment when stale deal has no live phase", () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["a", "b"],
      currentIndex: 0,
      enrolledIds: [] as string[],
      declinedIds: [] as string[],
    };
    const session = {
      handEnrollment: enrollment,
      liveEnrollment: {
        active: false,
        deal: { publicHand: { participantIds: ["a", "b"], tricksByPlayer: { a: 5, b: 0 } } },
      },
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    assert.equal(getSessionEnrollment(session)?.active, true);
  });

  it("prefers the more advanced mirror when currentHand and live deal diverge", () => {
    const session = {
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "play",
            participantIds: ["a", "b"],
            tricksByPlayer: {},
            drawCompletedIds: ["a", "b"],
          },
        },
      },
      currentHand: {
        phase: "draw",
        participantIds: ["a", "b"],
        tricksByPlayer: {},
        drawCompletedIds: [],
        turnPlayerId: "a",
      },
    };
    assert.equal(getSessionCurrentHand(session).phase, "play");
  });

  it("prefers live draw progress when currentHand stalled mid-draw", () => {
    const session = {
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "draw",
            participantIds: ["a", "b"],
            tricksByPlayer: {},
            drawCompletedIds: ["a"],
            turnPlayerId: "b",
          },
        },
      },
      currentHand: {
        phase: "draw",
        participantIds: ["a", "b"],
        tricksByPlayer: {},
        drawCompletedIds: [],
        turnPlayerId: "a",
      },
    };
    const hand = getSessionCurrentHand(session);
    assert.deepEqual(hand.drawCompletedIds, ["a"]);
    assert.equal(hand.turnPlayerId, "b");
  });
});
