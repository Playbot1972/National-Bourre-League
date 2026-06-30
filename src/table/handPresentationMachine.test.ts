import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  nextDrawPresentationTarget,
  phaseScheduleMs,
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

  it("does not re-open drawPlayer for consumed bots when prev snapshot regresses", () => {
    const botA = "bot_hiud3taw";
    const botB = "bot_qa2qh6l5";
    const snap = snapshotFromSession({
      sessionId: "s-loop",
      handNumber: 1,
      phase: "draw",
      participantIds: ["p0", botA, botB],
      actionOrder: [botA, botB, "p0"],
      drawCompletedIds: [],
      turnPlayerId: botA,
      potAmount: 3,
    });

    function finishDrawAnim(store: ReturnType<typeof createHandPresentationStore>, playerId: string) {
      let s = store;
      while (s.animatingDrawPlayerId === playerId && s.drawAnimSubPhase !== "done") {
        s = reduceHandPresentation(s, { type: "advancePhase" });
      }
      return s;
    }

    let store = createHandPresentationStore(snap);

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA] },
    });
    assert.equal(store.animatingDrawPlayerId, botA);
    store = finishDrawAnim(store, botA);
    assert.ok(store.drawPresentationConsumedIds.includes(botA));

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA, botB], turnPlayerId: "p0" },
    });
    assert.equal(store.animatingDrawPlayerId, botB);
    store = finishDrawAnim(store, botB);
    assert.ok(store.drawPresentationConsumedIds.includes(botB));

    const settledPhaseAt = store.phaseStartedAt;

    // Stale replay: prev regresses to empty — must not re-animate bot_a or bot_b
    store = {
      ...store,
      prevSnapshot: { ...snap, drawCompletedIds: [] },
    };
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA], turnPlayerId: botB },
    });
    assert.equal(store.animatingDrawPlayerId, null);
    assert.equal(store.drawAnimSubPhase, "done");
    assert.equal(store.phaseStartedAt, settledPhaseAt);
    assert.equal(nextDrawPresentationTarget(store, store.prevSnapshot!, { ...snap, drawCompletedIds: [botA] }), null);

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA, botB], turnPlayerId: "p0" },
    });
    assert.equal(store.animatingDrawPlayerId, null);
    assert.equal(store.phaseStartedAt, settledPhaseAt);
  });

  it("reserves consumed on discard start so alternating advancePhase cannot reopen bots", () => {
    const botA = "bot_ova3dpwd";
    const botB = "bot_jii2or4c";
    const snap = snapshotFromSession({
      sessionId: "s-alt",
      handNumber: 1,
      phase: "draw",
      participantIds: ["p0", botA, botB],
      actionOrder: [botA, botB, "p0"],
      drawCompletedIds: [botA, botB],
      turnPlayerId: "p0",
      potAmount: 3,
    });

    let store = createHandPresentationStore({ ...snap, drawCompletedIds: [] });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA] },
    });
    assert.equal(store.animatingDrawPlayerId, botA);
    assert.ok(store.drawPresentationConsumedIds.includes(botA));

    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.ok(store.displayDrawCompletedIds.includes(botA));

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA, botB] },
    });
    assert.equal(store.animatingDrawPlayerId, botB);
    assert.ok(store.drawPresentationConsumedIds.includes(botB));

    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.ok(store.displayDrawCompletedIds.includes(botB));

    const beforeReplay = store.phaseStartedAt;
    store = {
      ...store,
      prevSnapshot: { ...snap, drawCompletedIds: [], phase: "decision" },
    };
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA, botB], phase: "draw" },
    });
    assert.equal(store.animatingDrawPlayerId, null);
    assert.equal(store.phaseStartedAt, beforeReplay);

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA] },
    });
    assert.equal(store.animatingDrawPlayerId, null);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.animatingDrawPlayerId, null);
    assert.deepEqual([...store.drawPresentationConsumedIds].sort(), [botA, botB].sort());
  });

  it("resets draw presentation consumed set on hand number change", () => {
    let store = createHandPresentationStore(baseSnap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["p2"] },
    });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.ok(store.drawPresentationConsumedIds.includes("p2"));

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, handNumber: 2, phase: "draw", drawCompletedIds: [] },
    });
    assert.equal(store.handNumber, 2);
    assert.deepEqual(store.drawPresentationConsumedIds, []);

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, handNumber: 2, phase: "draw", drawCompletedIds: ["p1"] },
    });
    assert.equal(store.animatingDrawPlayerId, "p1");
  });

  it("does not schedule idle drawPlayer beat when waiting for next server draw", () => {
    const store = createHandPresentationStore(baseSnap);
    const idleDraw = {
      ...store,
      phase: "drawPlayer" as const,
      animatingDrawPlayerId: null,
      drawAnimSubPhase: "done" as const,
    };
    assert.equal(phaseScheduleMs(idleDraw, false), 0);
  });

  it("commits receive before arming next server-completed draw player", () => {
    const botA = "bot_ed1xbsb4";
    const botB = "bot_nextdraw";
    const snap = snapshotFromSession({
      sessionId: "s-receive-commit",
      handNumber: 1,
      phase: "draw",
      participantIds: ["p0", botA, botB],
      actionOrder: [botA, botB, "p0"],
      drawCompletedIds: [],
      turnPlayerId: botA,
      potAmount: 3,
    });

    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA], turnPlayerId: botB },
    });
    assert.equal(store.animatingDrawPlayerId, botA);
    assert.equal(store.drawAnimSubPhase, "discard");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.drawAnimSubPhase, "receive");
    assert.deepEqual(store.displayDrawCompletedIds, []);

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA, botB], turnPlayerId: "p0" },
    });
    assert.equal(store.animatingDrawPlayerId, botA);
    assert.equal(store.drawAnimSubPhase, "receive");

    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.ok(store.displayDrawCompletedIds.includes(botA));
    assert.equal(store.animatingDrawPlayerId, botB);
    assert.equal(store.drawAnimSubPhase, "discard");

    const afterCommit = store;
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.deepEqual(store.displayDrawCompletedIds, afterCommit.displayDrawCompletedIds);
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

  it("skips discard subphase for stand-pat draw completions", () => {
    let store = createHandPresentationStore(baseSnap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["p2"], turnPlayerId: "p2" },
      heroDrawDiscardCount: 0,
      heroDrawReplaceCount: 0,
    });
    assert.equal(store.animatingDrawPlayerId, "p2");
    assert.equal(store.drawAnimSubPhase, "done");
    assert.equal(phaseScheduleMs(store), 0);
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
      snapshot: { ...baseSnap, drawCompletedIds: ["p2"], turnPlayerId: "p3" },
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

  it("latches hand settle when the server clears the hand before handComplete is observed", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "play",
      participantIds: ["p1", "p2", "p3"],
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: null,
        participantIds: [],
        handComplete: false,
        enrollmentActive: false,
        handNumber: 4,
      },
    });
    assert.equal(store.phase, "play");
    assert.equal(store.pendingHandSettle, true);
    assert.equal(store.handSettleSnapshot?.participantIds.length, 3);

    store = reduceHandPresentation(store, { type: "tryBeginHandSettle" });
    assert.equal(store.phase, "settle");
    assert.equal(buildHandPresentationModel(store).settleAnimActive, true);
  });

  it("watchdog begins hand settle immediately when pendingHandSettle is latched", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play" });
    store = {
      ...store,
      phaseStartedAt: Date.now(),
      pendingHandSettle: true,
      handSettleSnapshot: { ...baseSnap, phase: "play", handComplete: true },
    };
    store = reduceHandPresentation(store, { type: "watchdog" });
    assert.equal(store.phase, "settle");
    assert.equal(store.pendingHandSettle, false);
    assert.equal(buildHandPresentationModel(store).settleAnimActive, true);
  });

  it("exposes configurable timing defaults", () => {
    const t = handTimingScale(false);
    assert.ok(t.anteChipTravelMs >= 180 && t.anteChipTravelMs <= 260);
    assert.ok(t.dealCardStaggerMs >= 90 && t.dealCardStaggerMs <= 140);
    assert.ok(t.trumpRevealHoldMs >= 4500 && t.trumpRevealHoldMs <= 5500);
    assert.ok(t.trumpMergeAnimMs >= 400 && t.trumpMergeAnimMs <= 600);
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
    assert.equal(POST_TRICK_READ_MS, 1850);
    const schedule = trickResolutionScheduleMs({});
    assert.equal(schedule.readTotalMs, 1850);
    assert.ok(schedule.pipelineMs >= 3100);
  });
});
