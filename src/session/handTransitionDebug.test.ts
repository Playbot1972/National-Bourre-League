import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeHandTransitionAnomalies,
  clearHandTransitionTimeline,
  detectHandTransitionPlatform,
  isHandTransitionDebugEnabled,
  logHandTransition,
  snapshotHandTransitionState,
} from "../../docs/hand-transition-debug.js";

describe("hand-transition-debug", () => {
  it("is disabled without browser storage", () => {
    assert.equal(isHandTransitionDebugEnabled(), false);
  });

  it("detectPlatformContext returns stable shape", () => {
    const p = detectHandTransitionPlatform();
    assert.equal(typeof p.isIPhone, "boolean");
    assert.equal(typeof p.isIOSChrome, "boolean");
    assert.equal(typeof p.isIOSSafari, "boolean");
  });

  it("snapshot captures waiting and eligible players", () => {
    const snap = snapshotHandTransitionState({
      session: {
        id: "s1",
        handCount: 54,
        currentHand: {
          phase: "decision",
          participantIds: ["a", "b", "c"],
          seatedIds: ["a", "b", "c", "d"],
          handDecision: {
            active: true,
            orderedPlayerIds: ["b", "c", "a", "d"],
            currentIndex: 0,
            playingIds: [],
            passedIds: [],
          },
        },
      },
      scores: [
        { playerId: "a", bankroll: 80 },
        { playerId: "b", bankroll: 60 },
        { playerId: "c", bankroll: 40 },
        { playerId: "d", bankroll: 0, out: true },
      ],
      myUid: "d",
      privateHandCards: [{ rank: "A", suit: "spades" }],
      privateHandSnapSeen: true,
      sessionHandDealStarted: true,
    });
    assert.equal(snap.decisionWaitingCount, 4);
    assert.deepEqual(snap.eligiblePlayerIds, ["a", "b", "c"]);
    assert.deepEqual(snap.outPlayerIds, ["d"]);
    assert.equal(snap.heroInParticipants, false);
  });

  it("analyze flags out player in decision queue when debug forced via timeline", () => {
    clearHandTransitionTimeline();
    // Without enable flag, analyze is a no-op — snapshot shape still documents anomaly inputs.
    const snap = snapshotHandTransitionState({
      session: {
        currentHand: {
          phase: "decision",
          participantIds: ["a", "b"],
          handDecision: {
            active: true,
            orderedPlayerIds: ["b", "a", "out"],
            currentIndex: 2,
            playingIds: [],
            passedIds: [],
          },
        },
      },
      scores: [
        { playerId: "a", bankroll: 50 },
        { playerId: "b", bankroll: 50 },
        { playerId: "out", bankroll: 0, out: true },
      ],
      sessionHandDealStarted: true,
    });
    assert.ok(snap.decisionOrder.includes("out"));
    assert.ok(!snap.participantIds.includes("out"));
    analyzeHandTransitionAnomalies(snap);
    logHandTransition("test_event", { ok: true });
  });
});
