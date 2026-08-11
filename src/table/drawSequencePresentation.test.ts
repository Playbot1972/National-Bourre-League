import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  isDrawSequenceComplete,
  reduceHandPresentation,
  snapshotFromSession,
} from "./handPresentationMachine";
import { drawPlayerScheduleMs } from "./handPresentationTiming";
import {
  getTablePresentationBlockReason,
  handPresentingBlocksBots,
  isTablePresentationBusy,
  resetTrickAnimationBusyState,
  setTrickAnimationBusyState,
} from "./trickAnimationBridge";

const hero = "p0";
const botA = "bot_draw_a";
const botB = "bot_draw_b";

function finishActiveDraw(store: ReturnType<typeof createHandPresentationStore>) {
  let s = store;
  let guard = 0;
  while (s.phase === "drawPlayer" && s.animatingDrawPlayerId && guard < 12) {
    s = reduceHandPresentation(s, { type: "advancePhase" });
    guard += 1;
  }
  if (s.phase === "drawReady") {
    s = reduceHandPresentation(s, { type: "advancePhase" });
  }
  return s;
}

describe("sequential draw presentation", () => {
  it("human N=3 gets exactly 3 discard and 3 receive counts", () => {
    const snap = snapshotFromSession({
      sessionId: "s-n3",
      handNumber: 1,
      phase: "draw",
      participantIds: [hero, botA],
      actionOrder: [hero, botA],
      drawCompletedIds: [],
      turnPlayerId: hero,
      potAmount: 3,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [hero], turnPlayerId: botA },
      heroDrawDiscardCount: 3,
      heroDrawReplaceCount: 3,
      playerDrawCounts: { [hero]: 3 },
    });
    assert.equal(store.drawDiscardCount, 3);
    assert.equal(store.drawReplaceCount, 3);
    assert.equal(store.drawAnimSubPhase, "discard");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.drawAnimSubPhase, "receive");
    assert.equal(store.drawReplaceCount, 3);
  });

  it("bot N=2 gets exactly 2 discard and 2 receive counts", () => {
    const snap = snapshotFromSession({
      sessionId: "s-bot2",
      handNumber: 1,
      phase: "draw",
      participantIds: [hero, botA],
      actionOrder: [botA, hero],
      drawCompletedIds: [],
      turnPlayerId: botA,
      potAmount: 3,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA], turnPlayerId: hero },
      playerDrawCounts: { [botA]: 2 },
    });
    assert.equal(store.drawDiscardCount, 2);
    assert.equal(store.drawReplaceCount, 2);
  });

  it("N=0 has no card flights (stand pat beat)", () => {
    const snap = snapshotFromSession({
      sessionId: "s-pat",
      handNumber: 1,
      phase: "draw",
      participantIds: [hero, botA],
      actionOrder: [botA, hero],
      drawCompletedIds: [],
      turnPlayerId: botA,
      potAmount: 3,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA], turnPlayerId: hero },
      playerDrawCounts: { [botA]: 0 },
    });
    assert.equal(store.drawDiscardCount, 0);
    assert.equal(store.drawReplaceCount, 0);
    assert.equal(store.drawAnimSubPhase, "done");
  });

  it("confirmed action order is preserved for draw presentation queue", () => {
    const snap = snapshotFromSession({
      sessionId: "s-order",
      handNumber: 1,
      phase: "draw",
      participantIds: [hero, botA, botB],
      actionOrder: [botB, botA, hero],
      drawCompletedIds: [],
      turnPlayerId: botB,
      potAmount: 3,
    });
    let store = createHandPresentationStore(snap);
    const order: string[] = [];

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botB, botA, hero], turnPlayerId: botB },
      playerDrawCounts: { [botB]: 1, [botA]: 1, [hero]: 1 },
    });
    order.push(store.animatingDrawPlayerId!);
    store = finishActiveDraw(store);
    assert.deepEqual(order, [botB]);
  });

  it("hero cannot play until drawSequenceComplete", () => {
    const snap = snapshotFromSession({
      sessionId: "s-gate",
      handNumber: 1,
      phase: "draw",
      participantIds: [hero, botA],
      actionOrder: [botA, hero],
      drawCompletedIds: [botA, hero],
      turnPlayerId: hero,
      potAmount: 3,
    });
    let store = createHandPresentationStore({ ...snap, drawCompletedIds: [] });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA] },
      playerDrawCounts: { [botA]: 1 },
    });
    const mid = buildHandPresentationModel(store);
    assert.equal(mid.drawSequenceComplete, false);
    assert.equal(mid.suppressTurnIndicator, true);

    store = finishActiveDraw(store);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, phase: "play", drawCompletedIds: [botA, hero] },
      playerDrawCounts: { [botA]: 1, [hero]: 0 },
    });
    while (!isDrawSequenceComplete(store, snap)) {
      store = reduceHandPresentation(store, { type: "advancePhase" });
    }
    const done = buildHandPresentationModel(store);
    assert.equal(done.drawSequenceComplete, true);
    assert.equal(done.suppressTurnIndicator, false);
  });

  it("bots can continue draw flow during peer presentation", () => {
    resetTrickAnimationBusyState();
    const handPresenting = handPresentingBlocksBots(true, "drawPlayer", "draw");
    assert.equal(handPresenting, false);
    setTrickAnimationBusyState({
      pipelineActive: false,
      revealCatchUp: false,
      motionGateActive: false,
      peakPlayCount: 0,
      displayedPlayCount: 0,
      handPresenting,
      handPresentationPhase: "drawPlayer",
      dealPresentationActive: false,
      trickCollectionActive: false,
    });
    assert.equal(isTablePresentationBusy(), false);
    assert.equal(getTablePresentationBlockReason({
      pipelineActive: false,
      revealCatchUp: false,
      motionGateActive: false,
      peakPlayCount: 0,
      displayedPlayCount: 0,
      handPresenting,
      handPresentationPhase: "drawPlayer",
      dealPresentationActive: false,
      trickCollectionActive: false,
    }), null);
  });

  it("duplicate snapshots do not replay consumed seats", () => {
    const snap = snapshotFromSession({
      sessionId: "s-dedupe",
      handNumber: 1,
      phase: "draw",
      participantIds: [hero, botA],
      actionOrder: [botA, hero],
      drawCompletedIds: [],
      turnPlayerId: botA,
      potAmount: 3,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA] },
      playerDrawCounts: { [botA]: 1 },
    });
    store = finishActiveDraw(store);
    const phaseAt = store.phaseStartedAt;
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA] },
      playerDrawCounts: { [botA]: 1 },
    });
    assert.equal(store.animatingDrawPlayerId, null);
    assert.equal(store.phaseStartedAt, phaseAt);
  });

  it("mid-draw reconnect catches up without duplicate flights", () => {
    const snap = snapshotFromSession({
      sessionId: "s-reconnect",
      handNumber: 1,
      phase: "draw",
      participantIds: [hero, botA, botB],
      actionOrder: [botA, botB, hero],
      drawCompletedIds: [],
      turnPlayerId: botA,
      potAmount: 3,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA, botB], turnPlayerId: hero },
      playerDrawCounts: { [botA]: 1, [botB]: 1 },
    });
    store = finishActiveDraw(store);
    assert.ok(store.drawPresentationConsumedIds.includes(botA));
    assert.ok(store.drawPresentationConsumedIds.includes(botB));
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snap, drawCompletedIds: [botA, botB, hero], turnPlayerId: hero, phase: "play" },
      playerDrawCounts: { [botA]: 1, [botB]: 1, [hero]: 2 },
    });
    assert.equal(store.animatingDrawPlayerId, hero);
    assert.equal(store.drawDiscardCount, 2);
  });

  it("reduced motion preserves order without shortening sequencing beats", () => {
    const full = drawPlayerScheduleMs(2, 2, false);
    const reduced = drawPlayerScheduleMs(2, 2, true);
    assert.ok(reduced < full);
    assert.ok(reduced >= 80);
  });
});
