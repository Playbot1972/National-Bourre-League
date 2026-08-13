import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  phaseScheduleMs,
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
const remote = "remote_human";

function snapWithCounts(
  overrides: Partial<ReturnType<typeof snapshotFromSession>> & {
    sessionId?: string;
    handNumber?: number;
    phase?: string | null;
    participantIds?: string[];
    actionOrder?: string[];
    drawCompletedIds?: string[];
    drawDiscardCountsByPlayer?: Record<string, number>;
    turnPlayerId?: string | null;
    potAmount?: number;
  },
) {
  return snapshotFromSession({
    sessionId: overrides.sessionId ?? "s-counts",
    handNumber: overrides.handNumber ?? 1,
    phase: overrides.phase ?? "draw",
    participantIds: overrides.participantIds ?? [hero, botA],
    actionOrder: overrides.actionOrder ?? [botA, hero],
    drawCompletedIds: overrides.drawCompletedIds ?? [],
    turnPlayerId: overrides.turnPlayerId ?? botA,
    potAmount: overrides.potAmount ?? 3,
    drawDiscardCountsByPlayer: overrides.drawDiscardCountsByPlayer,
  });
}

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
    const snap = snapWithCounts({
      sessionId: "s-n3",
      participantIds: [hero, botA],
      actionOrder: [hero, botA],
      turnPlayerId: hero,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [hero],
        turnPlayerId: botA,
        drawDiscardCountsByPlayer: { [hero]: 3 },
      },
      heroDrawDiscardCount: 3,
      heroDrawReplaceCount: 3,
    });
    assert.equal(store.drawDiscardCount, 3);
    assert.equal(store.drawReplaceCount, 3);
    assert.equal(store.drawAnimSubPhase, "discard");
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.drawAnimSubPhase, "receive");
    assert.equal(store.drawReplaceCount, 3);
  });

  it("bot N=2 gets exactly 2 discard and 2 receive counts", () => {
    const snap = snapWithCounts({ turnPlayerId: botA });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA],
        turnPlayerId: hero,
        drawDiscardCountsByPlayer: { [botA]: 2 },
      },
    });
    assert.equal(store.drawDiscardCount, 2);
    assert.equal(store.drawReplaceCount, 2);
  });

  it("bot N=3 gets exactly 3 discard and 3 receive counts", () => {
    const snap = snapWithCounts({ turnPlayerId: botA });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA],
        turnPlayerId: hero,
        drawDiscardCountsByPlayer: { [botA]: 3 },
      },
    });
    assert.equal(store.drawDiscardCount, 3);
    assert.equal(store.drawReplaceCount, 3);
  });

  it("remote human N=4 gets exactly 4 discard and 4 receive counts", () => {
    const snap = snapWithCounts({
      participantIds: [hero, remote],
      actionOrder: [remote, hero],
      turnPlayerId: remote,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [remote],
        turnPlayerId: hero,
        drawDiscardCountsByPlayer: { [remote]: 4 },
      },
    });
    assert.equal(store.drawDiscardCount, 4);
    assert.equal(store.drawReplaceCount, 4);
  });

  it("N=0 has no card flights (stand pat beat)", () => {
    const snap = snapWithCounts({ turnPlayerId: botA });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA],
        turnPlayerId: hero,
        drawDiscardCountsByPlayer: { [botA]: 0 },
      },
    });
    assert.equal(store.drawDiscardCount, 0);
    assert.equal(store.drawReplaceCount, 0);
    assert.equal(store.drawAnimSubPhase, "done");
    assert.equal(phaseScheduleMs(store, false), 0);
  });

  it("missing legacy count produces zero fake flights, never one", () => {
    const snap = snapWithCounts({ turnPlayerId: botA });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA],
        turnPlayerId: hero,
        drawDiscardCountsByPlayer: {},
      },
    });
    assert.equal(store.drawDiscardCount, 0);
    assert.equal(store.drawReplaceCount, 0);
    assert.equal(store.drawAnimSubPhase, "done");
  });

  it("confirmed action order is preserved for draw presentation queue", () => {
    const snap = snapWithCounts({
      participantIds: [hero, botA, botB],
      actionOrder: [botB, botA, hero],
      turnPlayerId: botB,
    });
    let store = createHandPresentationStore(snap);
    const order: string[] = [];

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botB, botA, hero],
        turnPlayerId: botB,
        drawDiscardCountsByPlayer: { [botB]: 1, [botA]: 1, [hero]: 1 },
      },
    });
    order.push(store.animatingDrawPlayerId!);
    store = finishActiveDraw(store);
    assert.deepEqual(order, [botB]);
  });

  it("hero cannot play until drawSequenceComplete", () => {
    const snap = snapWithCounts({
      drawCompletedIds: [botA, hero],
      turnPlayerId: hero,
      drawDiscardCountsByPlayer: { [botA]: 1, [hero]: 0 },
    });
    let store = createHandPresentationStore({ ...snap, drawCompletedIds: [] });
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA],
        drawDiscardCountsByPlayer: { [botA]: 1 },
      },
    });
    const mid = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(mid.drawAnimSubPhase, "receive");
    store = finishActiveDraw(store);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        phase: "play",
        drawDiscardCountsByPlayer: { [botA]: 1, [hero]: 0 },
      },
    });
    store = finishActiveDraw(store);
    assert.equal(store.phase, "play");
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
    assert.equal(
      getTablePresentationBlockReason({
        pipelineActive: false,
        revealCatchUp: false,
        motionGateActive: false,
        peakPlayCount: 0,
        displayedPlayCount: 0,
        handPresenting,
        handPresentationPhase: "drawPlayer",
        dealPresentationActive: false,
        trickCollectionActive: false,
      }),
      null,
    );
  });

  it("duplicate snapshots do not replay consumed seats", () => {
    const snap = snapWithCounts({ turnPlayerId: botA });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA],
        drawDiscardCountsByPlayer: { [botA]: 1 },
      },
    });
    store = finishActiveDraw(store);
    const phaseAt = store.phaseStartedAt;
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA],
        drawDiscardCountsByPlayer: { [botA]: 1 },
      },
    });
    assert.equal(store.animatingDrawPlayerId, null);
    assert.equal(store.phaseStartedAt, phaseAt);
  });

  it("reconnect/catch-up uses persisted exact counts", () => {
    const snap = snapWithCounts({
      participantIds: [hero, botA, botB],
      actionOrder: [botA, botB, hero],
      turnPlayerId: hero,
    });
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA, botB],
        turnPlayerId: hero,
        drawDiscardCountsByPlayer: { [botA]: 1, [botB]: 3 },
      },
    });
    store = finishActiveDraw(store);
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snap,
        drawCompletedIds: [botA, botB, hero],
        phase: "play",
        turnPlayerId: hero,
        drawDiscardCountsByPlayer: { [botA]: 1, [botB]: 3, [hero]: 2 },
      },
    });
    assert.equal(store.animatingDrawPlayerId, hero);
    assert.equal(store.drawDiscardCount, 2);
    assert.equal(store.drawReplaceCount, 2);
  });

  it("reduced motion preserves order without shortening sequencing beats", () => {
    const full = drawPlayerScheduleMs(2, 2, false);
    const reduced = drawPlayerScheduleMs(2, 2, true);
    assert.ok(reduced < full);
    assert.ok(reduced >= 80);
  });
});
