import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  reduceHandPresentation,
  snapshotFromSession,
} from "./handPresentationMachine";
import { drawPlayerScheduleMs, handTimingScale } from "./handPresentationTiming";
import { POST_TRICK_READ_MS, trickResolutionScheduleMs } from "./trickTiming";

const baseSnap = snapshotFromSession({
  sessionId: "s1",
  handNumber: 3,
  phase: "draw",
  enrollmentActive: false,
  participantIds: ["p1", "p2", "p3"],
  drawCompletedIds: [],
  turnPlayerId: "p2",
  trumpUpcard: { rank: "A", suit: "hearts" },
  dealerId: "p1",
  potAmount: 12,
});

describe("handPresentationMachine", () => {
  it("enters decision presentation after trump reveal when server is in decision", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "reveal",
      enrollmentActive: false,
      trumpUpcard: { rank: "K", suit: "hearts" },
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "reveal",
        enrollmentActive: false,
        trumpUpcard: { rank: "K", suit: "hearts" },
      },
    });
    assert.equal(store.phase, "ante");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "trumpReveal");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.trumpMergedIntoHand, true);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "decision",
        enrollmentActive: true,
        trumpUpcard: { rank: "K", suit: "hearts" },
      },
    });
    assert.equal(store.phase, "decision");
    assert.equal(store.trumpRevealActive, false);
  });

  it("skips trump replay when Pagat decision completes into draw", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "decision",
      enrollmentActive: true,
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "draw",
        enrollmentActive: false,
        drawCompletedIds: ["p1"],
        turnPlayerId: "p2",
      },
    });
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.trumpRevealActive, false);
    assert.equal(store.trumpMergeActive, false);
  });

  it("starts ante when legacy enrollment deals into Pagat reveal", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: null,
      enrollmentActive: true,
      trumpUpcard: { rank: "A", suit: "hearts" },
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "reveal",
        enrollmentActive: false,
        trumpUpcard: { rank: "A", suit: "hearts" },
      },
    });
    assert.equal(store.phase, "ante");
    assert.equal(store.anteAnimActive, true);
    assert.equal(store.trumpRevealActive, true);
  });

  it("runs ante then trump reveal then merge when enrollment closes into draw", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: null,
      enrollmentActive: true,
      trumpUpcard: null,
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, enrollmentActive: false, phase: "draw" },
    });
    assert.equal(store.phase, "trumpReveal");
    assert.equal(store.trumpRevealActive, true);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.trumpMergedIntoHand, true);
    assert.equal(store.trumpMergeActive, false);
    assert.equal(store.trumpRevealActive, false);
  });

  it("animates each draw completion before advancing display list", () => {
    let store = createHandPresentationStore(baseSnap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["p2"] },
      heroDrawDiscardCount: 2,
      heroDrawReplaceCount: 2,
    });
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.animatingDrawPlayerId, "p2");
    assert.equal(store.drawAnimSubPhase, "discard");
    const model = buildHandPresentationModel(store);
    assert.equal(model.displayDrawCompletedIds.includes("p2"), false);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.drawAnimSubPhase, "receive");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.displayDrawCompletedIds.includes("p2"), true);
  });

  it("holds drawReady beat before play phase", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      drawCompletedIds: ["p1", "p2", "p3"],
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["p1", "p2", "p3"] },
    });
    assert.equal(store.phase, "drawReady");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "play");
  });

  it("forces play phase when server enters play during draw animation", () => {
    let store = createHandPresentationStore(baseSnap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["p2"] },
    });
    assert.equal(store.drawAnimSubPhase, "discard");
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, phase: "play", drawCompletedIds: ["p1", "p2", "p3"] },
    });
    assert.equal(store.phase, "play");
    assert.equal(store.drawAnimSubPhase, "done");
    assert.equal(buildHandPresentationModel(store).suppressTurnIndicator, false);
  });

  it("latches hand settle until the final trick presentation completes", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play" });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "play",
        handComplete: true,
      },
    });
    assert.equal(store.phase, "play");
    assert.equal(store.pendingHandSettle, true);
    assert.equal(buildHandPresentationModel(store).settleAnimActive, false);

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: null,
        enrollmentActive: true,
        handComplete: false,
      },
    });
    assert.equal(store.phase, "play");
    assert.equal(store.pendingHandSettle, true);
    assert.ok(store.pendingSnapshot?.enrollmentActive);

    store = reduceHandPresentation(store, { type: "tryBeginHandSettle" });
    assert.equal(store.phase, "settle");
    assert.equal(store.pendingHandSettle, false);
    assert.equal(buildHandPresentationModel(store).settleAnimActive, true);
  });

  it("exposes configurable timing defaults", () => {
    const t = handTimingScale(false);
    assert.ok(t.anteChipTravelMs >= 180 && t.anteChipTravelMs <= 260);
    assert.ok(t.dealCardStaggerMs >= 90 && t.dealCardStaggerMs <= 140);
    assert.ok(t.trumpRevealHoldMs >= 4500 && t.trumpRevealHoldMs <= 5500);
    assert.ok(t.trumpMergeAnimMs <= 80);
    assert.ok(drawPlayerScheduleMs(2, 2, false) >= 400);
  });

  it("clears enrollment pulse on demand", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: null,
      enrollmentActive: true,
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: null,
        enrollmentActive: true,
        enrolledIds: ["p1"],
      },
    });
    assert.equal(store.enrollmentPulse.p1, "join");
    store = reduceHandPresentation(store, { type: "clearEnrollmentPulse" });
    assert.deepEqual(store.enrollmentPulse, {});
  });

  it("resets stale trump flags when hand number advances into reveal", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play", handNumber: 1 });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, phase: "play", handNumber: 1, handComplete: true },
    });
    store = reduceHandPresentation(store, { type: "tryBeginHandSettle" });
    assert.equal(store.phase, "settle");
    assert.equal(store.trumpMergedIntoHand, false);

    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "nextHandReset");

    store = {
      ...store,
      trumpMergedIntoHand: true,
      trumpRevealActive: false,
      phase: "play",
    };

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        handNumber: 2,
        phase: "reveal",
        trumpUpcard: { rank: "K", suit: "spades" },
        drawCompletedIds: [],
        turnPlayerId: "p1",
      },
    });
    assert.equal(store.handNumber, 2);
    assert.equal(store.phase, "ante");
    assert.equal(store.trumpRevealActive, true);
    assert.equal(store.trumpMergedIntoHand, false);

    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "trumpReveal");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.trumpMergedIntoHand, true);
  });

  it("starts reveal presentation when prior hand ended in play with stale trump state", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play", handNumber: 1 });
    store = {
      ...store,
      trumpMergedIntoHand: true,
      trumpRevealActive: false,
      phase: "play",
      handNumber: 1,
    };

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        handNumber: 2,
        phase: "reveal",
        trumpUpcard: { rank: "Q", suit: "diamonds" },
        drawCompletedIds: [],
        turnPlayerId: "p2",
      },
    });
    assert.equal(store.handNumber, 2);
    assert.equal(store.phase, "ante");
    assert.equal(store.trumpRevealActive, true);
    assert.equal(store.trumpMergedIntoHand, false);
  });
});

describe("trick timing with hand flow", () => {
  it("holds complete trick for two seconds before winner highlight", () => {
    assert.equal(POST_TRICK_READ_MS, 1600);
    const schedule = trickResolutionScheduleMs({});
    assert.equal(schedule.readTotalMs, 1600);
    assert.ok(schedule.pipelineMs >= 2100);
  });
});
