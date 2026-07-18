import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  liveRevealTarget,
  reduceTrickPresentation,
  resolveHoldPlays,
  shouldDeferHandNumberReinit,
  shouldReinitTrickPresentationStore,
  trickPlaysArePrefix,
  updatePeakTrickPlays,
} from "./trickPresentationMachine";
import { FINAL_HAND_TRICK_PRESENTATION_MS, trickResolutionScheduleMs } from "./trickTiming";

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

  it("recovers completing card from playedCards on atomic server resolve", () => {
    const threePlays = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts",
      plays: completedTrick.plays.slice(0, 3),
    };
    const playedCards = completedTrick.plays.map((play) => ({
      ...play,
      trickNumber: 1,
    }));

    let store = createTrickPresentationStore(
      { p1: 0, p2: 0, p3: 0, p4: 0 },
      threePlays,
    );
    for (let i = 0; i < 3; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: { trickNumber: 2, leadPlayerId: "p1", leadSuit: "clubs", plays: [] },
        tricksByPlayer: { p1: 1, p2: 0, p3: 0, p4: 0 },
        playedCards,
      },
      participantIds: participants,
    });
    assert.equal(store.pendingResolution?.frozen.plays.length, 4);
    store = reduceTrickPresentation(store, { type: "revealNextCard" });
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 4);
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

  it("staggers pending resolution reveals instead of dumping unrevealed plays", () => {
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, completedTrick);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 1, p2: 0 } },
      participantIds: ["p1", "p2"],
    });
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.isPipelineActive, true);
    assert.equal(model.isResolving, false);
    assert.equal(model.displayPlays.length, 0);
    store = reduceTrickPresentation(store, { type: "revealThroughCount", count: 4 });
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 4);
  });

  it("applies server snapshot immediately when authoritative trick advances during pipeline", () => {
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
    assert.equal(store.pendingServer, null);
    assert.equal(store.phase, "live");
    assert.equal(store.prevTrick?.trickNumber, 2);
    assert.equal(store.prevTrick?.plays.length, 1);
    assert.equal(store.revealedCount, 1);
  });

  it("keeps hold plays when a stale snapshot drops mid-trick cards", () => {
    const partialTrick = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts",
      plays: [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "K", suit: "hearts" } },
      ],
    };
    const fullTrick = {
      ...partialTrick,
      plays: [
        ...partialTrick.plays,
        { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
      ],
    };
    let store = createTrickPresentationStore({ p1: 0, p2: 0, p3: 0 }, fullTrick);
    for (let i = 0; i < 3; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    assert.equal(store.revealedCount, 3);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: partialTrick,
        tricksByPlayer: { p1: 0, p2: 0, p3: 0 },
      },
      participantIds: ["p1", "p2", "p3"],
    });
    assert.equal(store.peakTrickPlays.length, 3);
    assert.equal(resolveHoldPlays(store, partialTrick.plays).length, 3);
    assert.equal(buildTrickPresentationModel(store, partialTrick).displayPlays.length, 3);
  });

  it("peakTrickPlays survives prevTrick regression after fast server plays", () => {
    const plays = [
      { playerId: "p1", card: { rank: "A", suit: "hearts" } },
      { playerId: "p2", card: { rank: "K", suit: "hearts" } },
      { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
    ];
    const fullTrick = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts",
      plays,
    };
    let store = createTrickPresentationStore({ p1: 0, p2: 0, p3: 0 }, fullTrick);
    for (let i = 0; i < 2; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: { ...fullTrick, plays: plays.slice(0, 2) },
        tricksByPlayer: { p1: 0, p2: 0, p3: 0 },
      },
      participantIds: ["p1", "p2", "p3"],
    });
    assert.equal(store.peakTrickPlays.length, 3);
    assert.equal(updatePeakTrickPlays(store, { currentTrick: { ...fullTrick, plays: plays.slice(0, 1) }, tricksByPlayer: {} }, plays.slice(0, 1)).length, 3);
  });

  it("trickPlaysArePrefix rejects out-of-order extensions", () => {
    const a = [{ playerId: "p1", card: { rank: "A", suit: "hearts" } }];
    const b = [{ playerId: "p2", card: { rank: "K", suit: "hearts" } }];
    assert.equal(trickPlaysArePrefix(a, [...a, ...b]), true);
    assert.equal(trickPlaysArePrefix(b, [...a, ...b]), false);
  });

  it("keeps reveal target when stale empty snapshot arrives before first stagger", () => {
    const play1 = { playerId: "p1", card: { rank: "K", suit: "clubs" } };
    const trick1 = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "clubs",
      plays: [play1],
    };
    let store = createTrickPresentationStore({ p0: 0, p1: 0 }, trick1);
    assert.equal(store.revealedCount, 0);
    assert.equal(store.peakTrickPlays.length, 1);

    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: { ...trick1, plays: [] },
        tricksByPlayer: { p0: 0, p1: 0 },
      },
      participantIds: ["p0", "p1"],
    });

    assert.equal(store.peakTrickPlays.length, 1);
    assert.equal(store.prevTrick?.plays.length, 1);
    assert.equal(liveRevealTarget(store), 1);

    store = reduceTrickPresentation(store, { type: "revealNextCard" });
    assert.equal(store.revealedCount, 1);
    assert.equal(
      buildTrickPresentationModel(store, { ...trick1, plays: [] }).displayPlays.length,
      1,
    );
    assert.equal(resolveHoldPlays(store, []).length, 1);
  });

  it("does not clamp revealed count down on mid-trick server sync", () => {
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    assert.equal(store.revealedCount, 4);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: { trickNumber: 1, leadPlayerId: "p1", leadSuit: "hearts", plays: [] },
        tricksByPlayer: { p1: 0, p2: 0, p3: 0, p4: 0 },
      },
      participantIds: participants,
    });
    assert.equal(store.revealedCount, 4);
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 4);
  });

  it("ignores clamp while pending resolution holds the trick", () => {
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 1 } },
      participantIds: ["p1", "p2"],
    });
    store = reduceTrickPresentation(store, { type: "clampRevealedCount", target: 0 });
    assert.equal(store.revealedCount, 4);
  });

  it("shows final-trick echo when resolving pipeline clears the live row", () => {
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
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.displayPlays.length, 4);
    assert.equal(model.showFinalTrickEcho, false);
  });

  it("does not allow live phase until pipeline completes", () => {
    const schedule = trickResolutionScheduleMs({});
    assert.ok(schedule.pipelineMs >= 2000 && schedule.pipelineMs <= 2800);
    assert.equal(schedule.readBeforeWinnerMs, 1100);
    assert.equal(schedule.winnerRevealMs, 650);
    assert.equal(schedule.sweepMs, 400);
  });

  it("restores turn ring when collection starts while sweep still runs", () => {
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
    assert.equal(buildTrickPresentationModel(store, null).suppressTurnPlayerId, true);

    store = reduceTrickPresentation(store, { type: "advancePhase" });
    store = reduceTrickPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "collectTrick");
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.suppressTurnPlayerId, true);
    assert.equal(model.isResolving, true);
  });

  it("displayRevealFloor keeps visible cards when holdPlays briefly shrinks", () => {
    const plays = [
      { playerId: "p1", card: { rank: "A", suit: "hearts" } },
      { playerId: "p2", card: { rank: "K", suit: "hearts" } },
    ];
    const fullTrick = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts",
      plays,
    };
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, fullTrick);
    for (let i = 0; i < 2; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    assert.equal(store.displayRevealFloor, 2);

    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: { ...fullTrick, plays: [plays[0]] },
        tricksByPlayer: { p1: 0, p2: 0 },
      },
      participantIds: ["p1", "p2"],
    });

    const model = buildTrickPresentationModel(store, { ...fullTrick, plays: [plays[0]] });
    assert.equal(model.displayPlays.length, 2);
  });

  it("forceHandEndDrain clears a stuck trick pipeline after settlement", () => {
    let store = createTrickPresentationStore({ p1: 3, p2: 1, p3: 0, p4: 0 }, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 4, p2: 1, p3: 0, p4: 0 } },
      participantIds: participants,
    });
    assert.ok(store.pendingResolution);
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    assert.equal(store.phase, "trickComplete");

    store = reduceTrickPresentation(store, { type: "forceHandEndDrain" });
    assert.equal(store.phase, "live");
    assert.equal(store.pendingResolution, null);
    assert.equal(buildTrickPresentationModel(store, null).isPipelineActive, false);
  });

  it("latches hand-end echo when final trick pipeline completes with no next trick", () => {
    let store = createTrickPresentationStore({ p1: 4, p2: 0 }, completedTrick);
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 5, p2: 0 } },
      participantIds: participants,
    });
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    for (let i = 0; i < 4; i++) {
      store = reduceTrickPresentation(store, { type: "advancePhase" });
    }
    assert.equal(store.phase, "live");
    assert.equal(store.handEndEchoTrick?.winnerId, "p1");
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.showFinalTrickEcho, true);
    assert.equal(model.trickEchoWinnerId, "p1");
  });

  it("keeps hand-end echo through enrollment phase without reinit", () => {
    const echo = {
      trickNumber: 5,
      leadSuit: "hearts",
      plays: completedTrick.plays,
      winnerId: "p1",
    };
    assert.equal(
      shouldReinitTrickPresentationStore({
        enteredPlay: false,
        sessionPlayActive: false,
        pipelineActive: false,
        handComplete: false,
        phase: "reveal",
        participantCount: 4,
        handEndEchoTrick: echo,
      }),
      false,
    );
    assert.equal(
      shouldReinitTrickPresentationStore({
        enteredPlay: false,
        sessionPlayActive: false,
        pipelineActive: false,
        handComplete: false,
        phase: "reveal",
        participantCount: 4,
        handEndEchoTrick: null,
      }),
      true,
    );
  });

  it("drops stale pending resolution when server trick advances", () => {
    const trick2 = {
      trickNumber: 2,
      leadPlayerId: "p1",
      leadSuit: "hearts" as const,
      plays: completedTrick.plays,
      winnerId: "p1",
    };
    let store = createTrickPresentationStore({ p1: 1, p2: 0 }, completedTrick);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 2, p2: 0 } },
      participantIds: participants,
    });
    assert.ok(store.pendingResolution);

    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: { trickNumber: 3, leadPlayerId: "p2", leadSuit: "clubs", plays: [] },
        tricksByPlayer: { p1: 2, p2: 0 },
      },
      participantIds: participants,
    });
    assert.equal(store.pendingResolution, null);
    assert.equal(store.phase, "live");
    assert.equal(store.prevTrick?.trickNumber, 3);
  });

  it("hand-number reinit clears pending final-trick resolution", () => {
    const trick5 = { ...completedTrick, trickNumber: 5 };
    let store = createTrickPresentationStore({ p1: 4, p2: 0 }, trick5);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 5, p2: 0 } },
      participantIds: participants,
    });
    assert.ok(store.pendingResolution);
    assert.equal(store.phase, "live");

    store = reduceTrickPresentation(store, {
      type: "reinit",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: {},
        playedCards: [],
      },
    });
    assert.equal(store.pendingResolution, null);
    assert.equal(store.phase, "live");
    assert.equal(buildTrickPresentationModel(store, null).isPipelineActive, false);
  });

  it("does not defer hand-number reinit while pipeline or echo is active", () => {
    assert.equal(
      shouldDeferHandNumberReinit({ pipelineActive: true, handEndEchoTrick: null }),
      false,
    );
    assert.equal(
      shouldDeferHandNumberReinit({
        pipelineActive: false,
        handEndEchoTrick: {
          trickNumber: 5,
          leadSuit: "hearts",
          plays: completedTrick.plays,
          winnerId: "p1",
        },
      }),
      false,
    );
  });

  it("clears hand-end echo on demand", () => {
    let store = createTrickPresentationStore({ p1: 5, p2: 0 }, null);
    store = {
      ...store,
      handEndEchoTrick: {
        trickNumber: 5,
        leadSuit: "hearts",
        plays: completedTrick.plays,
        winnerId: "p1",
      },
    };
    store = reduceTrickPresentation(store, { type: "clearHandEndEcho" });
    assert.equal(store.handEndEchoTrick, null);
    assert.equal(buildTrickPresentationModel(store, null).showFinalTrickEcho, false);
  });

  it("preserves mid-trick reveals during hand-end without aggressive drain", () => {
    const trick5 = { ...completedTrick, trickNumber: 5 };
    let store = createTrickPresentationStore({ p1: 4, p2: 0 }, trick5);
    store = reduceTrickPresentation(store, { type: "revealNextCard" });
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 5, p2: 0 } },
      participantIds: participants,
    });
    assert.ok(store.pendingResolution);
    assert.equal(store.revealedCount, 1);
    assert.equal(store.phase, "live");
    assert.ok(FINAL_HAND_TRICK_PRESENTATION_MS >= trickResolutionScheduleMs({}).pipelineMs);
  });
});
