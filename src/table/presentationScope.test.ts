import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createTrickPresentationStore,
  reduceTrickPresentation,
} from "./trickPresentationMachine";
import {
  effectivePresentationTrickNumber,
  isStalePresentationScope,
  presentationScopeKey,
  presentingTrickNumber,
  shouldReinitPresentationScope,
} from "./presentationScope";

const participants = ["p1", "p2", "p3", "p4"];

describe("presentationScope", () => {
  it("builds stable scope keys", () => {
    assert.equal(presentationScopeKey(4, 2), "4:2");
    assert.equal(presentationScopeKey(4, null), "4:0");
  });

  it("detects stale scope keys", () => {
    assert.equal(isStalePresentationScope("4:2", "4:3"), true);
    assert.equal(isStalePresentationScope("4:3", "4:3"), false);
  });

  it("requires reinit when server trick advances during pending resolution", () => {
    const trick2 = {
      trickNumber: 2,
      leadPlayerId: "p1",
      leadSuit: "hearts" as const,
      plays: [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "K", suit: "hearts" } },
        { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
        { playerId: "p4", card: { rank: "J", suit: "hearts" } },
      ],
    };
    let store = createTrickPresentationStore({ p1: 1, p2: 0 }, trick2);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: { p1: 2, p2: 0 },
        playedCards: [],
      },
      participantIds: participants,
    });
    assert.ok(store.pendingResolution);

    assert.equal(
      shouldReinitPresentationScope({
        handNumber: 4,
        prevHandNumber: 4,
        serverTrickNumber: 3,
        prevServerTrickNumber: 2,
        store,
      }),
      true,
    );
    assert.equal(presentingTrickNumber(store), 2);
  });

  it("requires reinit on hand-number change even when pipeline idle", () => {
    const store = createTrickPresentationStore({ p1: 0, p2: 0 }, null);
    assert.equal(
      shouldReinitPresentationScope({
        handNumber: 5,
        prevHandNumber: 4,
        serverTrickNumber: 1,
        prevServerTrickNumber: 0,
        store,
      }),
      true,
    );
  });

  it("keeps effective trick scope while currentTrick is null but resolution is pending", () => {
    const trick1 = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts" as const,
      plays: [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "K", suit: "hearts" } },
        { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
      ],
    };
    let store = createTrickPresentationStore({ p1: 0, p2: 0, p3: 0 }, trick1);
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        currentTrick: null,
        tricksByPlayer: { p1: 1, p2: 0, p3: 0 },
      },
      participantIds: participants,
    });
    assert.equal(effectivePresentationTrickNumber(null, store), 1);
    assert.equal(presentingTrickNumber(store), 1);
  });
});
