import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getSessionCurrentHand,
  getSessionEnrollment,
  sessionHandDealStarted,
  handPhaseStarted,
  isClearedPreDealHand,
  isHandAwaitingSettlement,
  isPlayerLockedInLiveHand,
} from "./liveHand";

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

  it("ignores completed stale live deal when currentHand is cleared after settlement", () => {
    const session = {
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
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    };
    const hand = getSessionCurrentHand(session);
    assert.equal(hand.phase, undefined);
    assert.deepEqual(hand.participantIds, []);
    assert.ok(isClearedPreDealHand(hand));
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

  it("prefers currentHand decision over stale live reveal mirror", () => {
    const session = {
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "reveal",
            participantIds: ["dealer", "bot_1", "bot_2"],
            tricksByPlayer: {},
            handDecision: { active: false, currentIndex: 0, orderedPlayerIds: ["bot_1", "bot_2", "dealer"] },
          },
        },
      },
      currentHand: {
        phase: "decision",
        participantIds: ["dealer", "bot_1", "bot_2"],
        tricksByPlayer: {},
        handDecision: {
          active: true,
          currentIndex: 0,
          orderedPlayerIds: ["bot_1", "bot_2", "dealer"],
          playingIds: [],
          passedIds: [],
          turnDeadlineMs: Date.now() - 1,
        },
      },
    };
    const hand = getSessionCurrentHand(session);
    assert.equal(hand.phase, "decision");
    assert.equal(getSessionEnrollment(session)?.active, true);
    assert.equal(getSessionEnrollment(session)?.orderedPlayerIds?.[0], "bot_1");
  });

  it("prefers advanced decision on currentHand over stale live decision mirror", () => {
    const session = {
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "decision",
            participantIds: ["dealer", "bot_1", "bot_2"],
            tricksByPlayer: {},
            handDecision: {
              active: true,
              currentIndex: 0,
              orderedPlayerIds: ["bot_1", "bot_2", "dealer"],
              playingIds: [],
              passedIds: [],
            },
          },
        },
      },
      currentHand: {
        phase: "decision",
        participantIds: ["dealer", "bot_1", "bot_2"],
        tricksByPlayer: {},
        handDecision: {
          active: true,
          currentIndex: 1,
          orderedPlayerIds: ["bot_1", "bot_2", "dealer"],
          playingIds: ["bot_1"],
          passedIds: [],
        },
      },
    };
    const hand = getSessionCurrentHand(session);
    assert.equal(hand.handDecision?.currentIndex, 1);
    assert.deepEqual(hand.handDecision?.playingIds, ["bot_1"]);
  });

  it("sessionHandDealStarted reads raw currentHand even when authoritative merge is empty", () => {
    const session = {
      currentHand: {
        phase: "reveal",
        participantIds: ["a", "b"],
        tricksByPlayer: {},
      },
      liveEnrollment: { active: false, deal: { publicHand: { phase: "draw", participantIds: [] } } },
    };
    assert.equal(sessionHandDealStarted(session), true);
    assert.equal(handPhaseStarted(getSessionCurrentHand(session)), true);
  });

  it("sessionHandDealStarted is false when five tricks are in but hand is uncleared", () => {
    const session = {
      currentHand: {
        phase: "play",
        participantIds: ["a", "b"],
        tricksByPlayer: { a: 4, b: 1 },
      },
    };
    assert.equal(isHandAwaitingSettlement(session), true);
    assert.equal(sessionHandDealStarted(session), false);
  });
});

describe("isPlayerLockedInLiveHand", () => {
  it("locks enrolled players during draw and play only", () => {
    assert.equal(
      isPlayerLockedInLiveHand({
        phase: "draw",
        participantIds: ["p1", "p2"],
        playerId: "p1",
      }),
      true,
    );
    assert.equal(
      isPlayerLockedInLiveHand({
        phase: "play",
        participantIds: ["p1", "p2"],
        playerId: "p2",
      }),
      true,
    );
    assert.equal(
      isPlayerLockedInLiveHand({
        phase: "reveal",
        participantIds: ["p1", "p2"],
        playerId: "p1",
      }),
      false,
    );
    assert.equal(
      isPlayerLockedInLiveHand({
        phase: "play",
        participantIds: ["p1", "p2"],
        playerId: "p3",
      }),
      false,
    );
  });
});
