import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  reduceTrickPresentation,
} from "./trickPresentationMachine";

describe("trick presentation commit gate", () => {
  const participants = ["hero", "p2", "p3"];
  const fullTrick = {
    trickNumber: 1,
    leadPlayerId: "hero",
    leadSuit: "hearts" as const,
    plays: [
      { playerId: "hero", card: { rank: "A", suit: "hearts" } },
      { playerId: "p2", card: { rank: "K", suit: "hearts" } },
      { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
    ],
  };

  it("3-player hero-first play stays visible before trick resolution commits", () => {
    let store = createTrickPresentationStore({ hero: 0, p2: 0, p3: 0 }, {
      trickNumber: 1,
      leadPlayerId: "hero",
      leadSuit: "hearts",
      plays: [fullTrick.plays[0]],
    });
    store = reduceTrickPresentation(store, { type: "revealThroughCount", count: 1 });
    assert.equal(buildTrickPresentationModel(store, fullTrick).displayPlays.length, 1);

    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: { hero: 1, p2: 0, p3: 0 },
        playedCards: fullTrick.plays.map((play) => ({ ...play, trickNumber: 1 })),
      },
      participantIds: participants,
    });

    assert.ok(store.pendingResolution);
    assert.equal(store.revealedCount, 1);
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 1);
    assert.equal(store.pendingResolution?.frozen.plays.length, 3);
  });

  it("reveals all pending plays before frozen trick display at commit", () => {
    let store = createTrickPresentationStore({ hero: 0, p2: 0, p3: 0 }, fullTrick);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: { hero: 1, p2: 0, p3: 0 },
      },
      participantIds: participants,
    });
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 0);
    store = reduceTrickPresentation(store, { type: "revealThroughCount", count: 3 });
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 3);
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    assert.equal(buildTrickPresentationModel(store, null).displayPlays.length, 3);
  });
});
