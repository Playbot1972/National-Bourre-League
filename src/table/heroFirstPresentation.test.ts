import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  reduceTrickPresentation,
} from "./trickPresentationMachine";
import { playFlyKey } from "./trickPlayFly";

describe("hero-first trick presentation", () => {
  const participants = ["hero", "p2", "p3"];

  it("revealThroughCount exposes the hero play without waiting for stagger", () => {
    const trick = {
      trickNumber: 1,
      leadPlayerId: "hero",
      leadSuit: "hearts",
      plays: [{ playerId: "hero", card: { rank: "A", suit: "hearts" } }],
    };
    let store = createTrickPresentationStore({ hero: 0, p2: 0, p3: 0 }, trick);
    assert.equal(store.revealedCount, 0);

    store = reduceTrickPresentation(store, { type: "revealThroughCount", count: 1 });
    assert.equal(store.revealedCount, 1);
    assert.equal(buildTrickPresentationModel(store, trick).displayPlays.length, 1);
    assert.equal(
      playFlyKey(buildTrickPresentationModel(store, trick).displayPlays[0]!),
      playFlyKey(trick.plays[0]!),
    );
  });

  it("reveals hero play from server ack without active handoff", () => {
    const trick = {
      trickNumber: 1,
      leadPlayerId: "hero",
      leadSuit: "hearts" as const,
      plays: [{ playerId: "hero", card: { rank: "A", suit: "hearts" } }],
    };
    let store = createTrickPresentationStore({ hero: 0, p2: 0, p3: 0 }, trick);
    assert.equal(buildTrickPresentationModel(store, trick).displayPlays.length, 0);
    store = reduceTrickPresentation(store, { type: "revealThroughCount", count: 1 });
    assert.equal(buildTrickPresentationModel(store, trick).displayPlays.length, 1);
    assert.equal(buildTrickPresentationModel(store, trick).displayPlays[0]?.playerId, "hero");
  });

  it("pendingResolution keeps unrevealed plays off the table during live presentation", () => {
    const fullTrick = {
      trickNumber: 1,
      leadPlayerId: "hero",
      leadSuit: "hearts",
      plays: [
        { playerId: "hero", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "K", suit: "hearts" } },
        { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
      ],
    };
    let store = createTrickPresentationStore({ hero: 0, p2: 0, p3: 0 }, fullTrick);
    store = reduceTrickPresentation(store, { type: "revealThroughCount", count: 1 });
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: { hero: 1, p2: 0, p3: 0 },
      },
      participantIds: participants,
    });

    assert.ok(store.pendingResolution);
    assert.equal(store.revealedCount, 1);
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.displayPlays.length, 1);
    assert.equal(model.displayPlays[0]?.playerId, "hero");
  });
});
