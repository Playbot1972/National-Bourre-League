import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  handPresentationVisibleEqual,
  nextDrawPresentationTarget,
  phaseScheduleMs,
  reduceHandPresentation,
  shouldAnimateSettlePotPayout,
  settleSubPhaseScheduleMs,
  snapshotFromSession,
} from "./handPresentationMachine";
import { drawPlayerScheduleMs, handTimingScale, SETTLE_TRICK_TOTALS_MS } from "./handPresentationTiming";
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

  it("enters handReset then ante when legacy enrollment deals into Pagat reveal", () => {
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
    assert.equal(store.phase, "handReset");
    assert.equal(store.nextHandResetActive, true);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "ante");
    assert.equal(store.anteAnimActive, true);
    assert.equal(store.trumpRevealActive, true);
    assert.equal(store.dealPresentationComplete, false);
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
    assert.equal(buildHandPresentationModel(store).suppressTurnIndicator, false);

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
    assert.equal(store.settleSubPhase, "trickTotals");
    assert.equal(store.trumpMergedIntoHand, false);

    while (store.phase === "settle") {
      store = reduceHandPresentation(store, { type: "advancePhase" });
    }
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
    assert.equal(store.phase, "handReset");
    assert.equal(store.nextHandResetActive, true);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "ante");
    assert.equal(store.trumpRevealActive, true);
    assert.equal(store.trumpMergedIntoHand, false);

    store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
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
    assert.equal(store.phase, "handReset");
    assert.equal(store.nextHandResetActive, true);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "ante");
    assert.equal(store.trumpRevealActive, true);
    assert.equal(store.trumpMergedIntoHand, false);
  });

  it("holds ante until dealPresentationComplete then schedules chip travel", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "reveal",
    });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "ante");
    assert.equal(phaseScheduleMs(store, false), 0);

    store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
    assert.ok(phaseScheduleMs(store, false) > 0);

    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "trumpReveal");
  });

  it("marks trumpMergedIntoHand when ante skips trump reveal (no upcard)", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "reveal",
      trumpUpcard: null,
    });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.trumpMergedIntoHand, true);
  });

  it("nextHandReset advances into handReset when next hand is on reveal", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play", handNumber: 1 });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, phase: "play", handNumber: 1, handComplete: true },
    });
    store = reduceHandPresentation(store, { type: "tryBeginHandSettle" });
    while (store.phase === "settle") {
      store = reduceHandPresentation(store, { type: "advancePhase" });
    }
    assert.equal(store.phase, "nextHandReset");

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        handNumber: 2,
        phase: "reveal",
        trumpUpcard: { rank: "A", suit: "clubs" },
      },
    });
    assert.equal(store.phase, "handReset");
    assert.equal(buildHandPresentationModel(store).handResetCueActive, true);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "ante");
  });

  it("coalesces play-phase serverUpdate when only bookkeeping changes", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "play",
      drawCompletedIds: ["p1", "p2", "p3"],
      turnPlayerId: "p1",
      potAmount: 15,
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "play",
        drawCompletedIds: ["p1", "p2", "p3"],
        turnPlayerId: "p1",
        potAmount: 15,
      },
    });

    const before = store;
    const beforeModel = buildHandPresentationModel(before);

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "play",
        drawCompletedIds: ["p1", "p2", "p3"],
        turnPlayerId: "p2",
        potAmount: 15,
      },
    });

    assert.equal(store, before);
    assert.equal(store.prevSnapshot?.turnPlayerId, "p2");
    assert.deepEqual(buildHandPresentationModel(store), beforeModel);
  });

  it("returns new store when play-phase serverUpdate changes visible pot", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "play",
      drawCompletedIds: ["p1", "p2", "p3"],
      potAmount: 15,
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "play",
        drawCompletedIds: ["p1", "p2", "p3"],
        potAmount: 15,
      },
    });

    const before = store;
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "play",
        drawCompletedIds: ["p1", "p2", "p3"],
        potAmount: 18,
      },
    });

    assert.notEqual(store, before);
    assert.equal(buildHandPresentationModel(store).displayPotAmount, 18);
  });

  it("returns new store when hand settle becomes visible", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play" });
    const before = store;

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "play",
        handComplete: true,
      },
    });

    assert.notEqual(store, before);
    assert.equal(buildHandPresentationModel(store).pendingHandSettle, true);
  });

  it("handPresentationVisibleEqual matches buildHandPresentationModel output", () => {
    const a = createHandPresentationStore({ ...baseSnap, phase: "play", potAmount: 9 });
    const b = {
      ...a,
      prevSnapshot: { ...baseSnap, phase: "play", turnPlayerId: "p3" },
      pendingSnapshot: { ...baseSnap, phase: "play", turnPlayerId: "p3" },
      handSettleSnapshot: { ...baseSnap, phase: "play" },
      drawPresentationConsumedIds: ["bot_x"],
      handNumber: 99,
    };
    assert.ok(handPresentationVisibleEqual(a, b));
    assert.deepEqual(buildHandPresentationModel(a), buildHandPresentationModel(b));
  });

  it("enters settle sub-phases trickTotals then potPayout on hand complete", () => {
    let store = createHandPresentationStore({
      ...baseSnap,
      phase: "play",
      tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
    });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...baseSnap,
        phase: "play",
        handComplete: true,
        tricksByPlayer: { p1: 3, p2: 2, p3: 0 },
        potAmount: 24,
      },
    });
    store = reduceHandPresentation(store, { type: "tryBeginHandSettle" });
    assert.equal(store.phase, "settle");
    assert.equal(store.settleSubPhase, "trickTotals");
    assert.deepEqual(store.settleWinnerIds, ["p1"]);
    assert.deepEqual(store.settleBourreIds, ["p3"]);

    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.settleSubPhase, "potPayout");
    assert.equal(store.settlePayoutComplete, false);
  });

  it("waits for settlePayoutComplete before leaving potPayout when animating", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play" });
    store = withPhaseSettle(store, {
      settleSubPhase: "potPayout",
      settleWinnerIds: ["p1"],
      displayPotAmount: 30,
      settlePayoutComplete: false,
    });
    assert.ok(shouldAnimateSettlePotPayout(store));
    assert.equal(settleSubPhaseScheduleMs(store), 0);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.settleSubPhase, "potPayout");
    store = reduceHandPresentation(store, { type: "settlePayoutComplete" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.settleSubPhase, "reset");
  });

  it("runs bourre callout and penalty sub-phases when bourre players exist", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play" });
    store = withPhaseSettle(store, {
      settleSubPhase: "bourreCallout",
      settleBourreIds: ["p3"],
      settleWinnerIds: ["p1"],
    });
    assert.equal(buildHandPresentationModel(store).showBourreCallout, true);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.settleSubPhase, "bourrePenalty");
    store = reduceHandPresentation(store, { type: "settlePenaltyComplete" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.settleSubPhase, "reset");
  });

  it("watchdog force-completes stuck settle payout motion", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play" });
    store = withPhaseSettle(store, {
      settleSubPhase: "potPayout",
      settleWinnerIds: ["p1"],
      displayPotAmount: 18,
      settlePayoutComplete: false,
      phaseStartedAt: Date.now() - 3_000,
    });
    store = reduceHandPresentation(store, { type: "watchdog" });
    assert.equal(store.settlePayoutComplete, true);
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.notEqual(store.settleSubPhase, "potPayout");
  });

  it("schedules trick totals hold during settle sub-phase", () => {
    const store = withPhaseSettle(createHandPresentationStore({ ...baseSnap, phase: "play" }), {
      settleSubPhase: "trickTotals",
    });
    assert.ok(settleSubPhaseScheduleMs(store) >= SETTLE_TRICK_TOTALS_MS * 0.5);
    assert.ok(settleSubPhaseScheduleMs(store, true) >= 80);
  });

  it("shouldAnimateSettlePotPayout skips co-win and zero-pot hands", () => {
    assert.equal(
      shouldAnimateSettlePotPayout({ settleWinnerIds: ["p1", "p2"], displayPotAmount: 40 }),
      false,
    );
    assert.equal(
      shouldAnimateSettlePotPayout({ settleWinnerIds: ["p1"], displayPotAmount: 0 }),
      false,
    );
    assert.equal(
      shouldAnimateSettlePotPayout({ settleWinnerIds: ["p1"], displayPotAmount: 12 }),
      true,
    );
  });

  it("advances potPayout to bourreCallout when bourre players exist", () => {
    let store = withPhaseSettle(createHandPresentationStore({ ...baseSnap, phase: "play" }), {
      settleSubPhase: "potPayout",
      settleWinnerIds: ["p1"],
      settleBourreIds: ["p3"],
      displayPotAmount: 20,
      settlePayoutComplete: true,
    });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.settleSubPhase, "bourreCallout");
  });

  it("watchdog force-completes stuck settle penalty motion", () => {
    let store = createHandPresentationStore({ ...baseSnap, phase: "play" });
    store = withPhaseSettle(store, {
      settleSubPhase: "bourrePenalty",
      settleBourreIds: ["p3"],
      settlePenaltyComplete: false,
      phaseStartedAt: Date.now() - 3_000,
    });
    store = reduceHandPresentation(store, { type: "watchdog" });
    assert.equal(store.settlePenaltyComplete, true);
  });

  it("does not coalesce away settlePayoutComplete updates", () => {
    const store = withPhaseSettle(createHandPresentationStore({ ...baseSnap, phase: "play" }), {
      settleSubPhase: "potPayout",
      settlePayoutComplete: false,
    });
    const next = reduceHandPresentation(store, { type: "settlePayoutComplete" });
    assert.notEqual(store, next);
    assert.equal(next.settlePayoutComplete, true);
  });
});

function withPhaseSettle(
  store: ReturnType<typeof createHandPresentationStore>,
  patch: Partial<ReturnType<typeof createHandPresentationStore>>,
) {
  return {
    ...store,
    phase: "settle" as const,
    settleAnimActive: true,
    settleTricksByPlayer: { p1: 3, p2: 2, p3: 0 },
    ...patch,
  };
}

describe("trick timing with hand flow", () => {
  it("holds complete trick for two seconds before winner highlight", () => {
    assert.equal(POST_TRICK_READ_MS, 1850);
    const schedule = trickResolutionScheduleMs({});
    assert.equal(schedule.readTotalMs, 1850);
    assert.ok(schedule.pipelineMs >= 3100);
  });
});
