import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  reduceTrickPresentation,
} from "./trickPresentationMachine";
import { trickResolutionScheduleMs } from "./trickTiming";

describe("trickPresentationMachine", () => {
  const participants = ["p1", "p2", "p3", "p4"];
  const completedTrick = {
    trickNumber: 1,
    leadPlayerId: "p1",
    leadSuit: "hearts",
    plays: [
      { playerId: "p1", card: { rank: "A", suit: "hearts" } },
      { playerId: "p2", card: { rank: "K", suit: "hearts" } },
      { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
      { playerId: "p4", card: { rank: "J", suit: "hearts" } },
    ],
  };

  it("keeps all trick cards visible through trickComplete before winner reveal", () => {
    let store = createTrickPresentationStore(
      { p1: 0, p2: 0, p3: 0, p4: 0 },
      completedTrick,
    );
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: { p1: 1, p2: 0, p3: 0, p4: 0 },
      },
      participantIds: participants,
    });
    assert.equal(store.phase, "live");
    assert.ok(store.pendingResolution);
    const pendingModel = buildTrickPresentationModel(store, null);
    assert.equal(pendingModel.displayPlays.length, 4);
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    assert.equal(store.phase, "trickComplete");
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.displayPlays.length, 4);
    assert.equal(model.showWinnerTag, false);
    assert.equal(model.displayTricksByPlayer.p1, 0);
  });

  it("does not clear the trick immediately on final play", () => {
    let store = createTrickPresentationStore({}, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: { trickNumber: 2, leadPlayerId: "p1", leadSuit: "clubs", plays: [] },
        tricksByPlayer: { p1: 1 },
      },
      participantIds: ["p1", "p2"],
    });
    assert.equal(store.phase, "live");
    assert.ok(store.pendingResolution);
    assert.equal(store.pendingResolution?.frozen.plays.length, 4);
  });

  it("shows winner highlight before collection", () => {
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 1 } },
      participantIds: ["p1", "p2"],
    });
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "winnerReveal");
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.showWinnerTag, true);
    assert.equal(model.displayTricksByPlayer.p1, 0);
  });

  it("increments trick count only when collection starts", () => {
    let store = createTrickPresentationStore({}, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 1 } },
      participantIds: ["p1", "p2"],
    });
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "collectTrick");
    assert.equal(store.displayTricksByPlayer.p1, 1);
  });

  it("keeps cards visible while server clears trick before land animations finish", () => {
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, completedTrick);
    for (let i = 0; i < 3; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 1 } },
      participantIds: ["p1", "p2"],
    });
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 3);
    store = reduceTrickPresentation(store, { type: "revealNextCard" });
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 4);
  });

  it("buffers fast backend updates until collection finishes", () => {
    let store = createTrickPresentationStore({}, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 1 } },
      participantIds: ["p1", "p2"],
    });
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: {
          trickNumber: 2,
          leadPlayerId: "p1",
          leadSuit: "clubs",
          plays: [{ playerId: "p1", card: { rank: "7", suit: "clubs" } }],
        },
        tricksByPlayer: { p1: 1 },
      },
      participantIds: ["p1", "p2"],
    });
    assert.ok(store.pendingServer);
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "live");
    assert.equal(store.prevTrick?.plays.length, 1);
  });

  it("does not allow live phase until pipeline completes", () => {
    const schedule = trickResolutionScheduleMs({});
    assert.ok(schedule.pipelineMs >= 2400);
    assert.equal(schedule.readTotalMs, 2000);
    assert.equal(schedule.sweepMs, 300);
  });
});
