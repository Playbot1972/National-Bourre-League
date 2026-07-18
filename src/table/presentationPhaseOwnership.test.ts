import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canStartDealPresentation,
  isHandPhaseTimerOwned,
  isTrickPhaseMotionOwned,
  isTrickPhaseTimerOwned,
} from "./presentationPhaseOwnership";
import {
  canStartDealPresentation as legacyCanStartDealPresentation,
  reduceHandPresentation,
  createHandPresentationStore,
  snapshotFromSession,
} from "./handPresentationMachine";
import { reduceTrickPresentation, createTrickPresentationStore } from "./trickPresentationMachine";

const baseSnap = snapshotFromSession({
  sessionId: "s1",
  handNumber: 1,
  phase: "draw",
  enrollmentActive: false,
  participantIds: ["p1", "p2"],
  drawCompletedIds: [],
  turnPlayerId: "p2",
  trumpUpcard: { rank: "A", suit: "hearts" },
  dealerId: "p1",
  potAmount: 10,
});

describe("presentationPhaseOwnership", () => {
  it("blocks deal while trump reveal hold is active", () => {
    assert.equal(
      canStartDealPresentation({
        dealPresentationAllowed: true,
        sessionPhase: "draw",
        privateHandReady: true,
        trumpRevealActive: true,
      }),
      false,
    );
  });

  it("blocks deal while ante or trump merge motion is active", () => {
    assert.equal(
      canStartDealPresentation({
        dealPresentationAllowed: true,
        sessionPhase: "draw",
        privateHandReady: true,
        anteAnimActive: true,
      }),
      false,
    );
    assert.equal(
      canStartDealPresentation({
        dealPresentationAllowed: true,
        sessionPhase: "draw",
        privateHandReady: true,
        trumpMergeActive: true,
      }),
      false,
    );
  });

  it("allows deal when gates are clear", () => {
    assert.equal(
      canStartDealPresentation({
        dealPresentationAllowed: true,
        sessionPhase: "draw",
        privateHandReady: true,
        trumpRevealActive: false,
        trumpMergeActive: false,
        anteAnimActive: false,
      }),
      true,
    );
  });

  it("legacy canStartDealPresentation delegates to ownership gate", () => {
    assert.equal(legacyCanStartDealPresentation(true, "draw", true, { trumpRevealActive: true }), false);
    assert.equal(legacyCanStartDealPresentation(true, "draw", true), true);
  });

  it("ante and trump merge are motion-owned hand phases", () => {
    assert.equal(isHandPhaseTimerOwned({ phase: "ante", anteAnimActive: true, trumpMergeActive: false }), false);
    assert.equal(isHandPhaseTimerOwned({ phase: "drawPlayer", anteAnimActive: false, trumpMergeActive: true }), false);
    assert.equal(isHandPhaseTimerOwned({ phase: "trumpReveal", anteAnimActive: false, trumpMergeActive: false }), true);
  });

  it("collectTrick is motion-owned; other resolution beats are timer-owned", () => {
    assert.equal(isTrickPhaseMotionOwned("collectTrick"), true);
    assert.equal(isTrickPhaseMotionOwned("winnerReveal"), false);
    assert.equal(isTrickPhaseTimerOwned("trickComplete"), true);
    assert.equal(isTrickPhaseTimerOwned("nextLeadReady"), true);
    assert.equal(isTrickPhaseTimerOwned("collectTrick"), false);
  });

  it("anteSequenceComplete does not double-advance on a single callback", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "reveal", enrollmentActive: false });
    store = {
      ...store,
      phase: "ante",
      anteAnimActive: true,
      trumpRevealActive: false,
    };
    const afterComplete = reduceHandPresentation(store, { type: "anteSequenceComplete" });
    assert.equal(afterComplete.phase, "ante");
    const afterAdvance = reduceHandPresentation(afterComplete, { type: "advancePhase" });
    assert.equal(afterAdvance.phase, "trumpReveal");
    assert.equal(afterAdvance.trumpRevealActive, true);
  });

  it("trick resolution advances one beat per advancePhase during pipeline", () => {
    const participants = ["p1", "p2"];
    const trick = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts",
      plays: [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "K", suit: "hearts" } },
      ],
    };
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, trick);
    for (let i = 0; i < 2; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: { p1: 1, p2: 0 },
      },
      participantIds: participants,
    });
    assert.ok(store.pendingResolution);
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    assert.equal(store.phase, "trickComplete");
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "winnerReveal");
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "collectTrick");
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "nextLeadReady");
  });
});
