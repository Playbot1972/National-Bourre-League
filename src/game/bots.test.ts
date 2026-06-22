import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { botDrawDiscardIndices, botPlayCardIndex } from "./play";
import { getLegalPlayIndices } from "./legal";
import {
  botDiscardFor,
  botPlayFor,
  initSimulatedHand,
  runDrawPhase,
  simulateFullHand,
} from "./testHelpers";
import type { Card } from "../types";

const c = (rank: string, suit: string): Card =>
  ({ rank, suit }) as Card;

describe("F — bot helpers", () => {
  it("botDrawDiscardIndices prefers lowest non-trump cards", () => {
    const hand = [c("A", "hearts"), c("2", "clubs"), c("3", "diamonds")];
    const indices = botDrawDiscardIndices(hand, "hearts", 2);
    assert.equal(indices.length, 2);
    assert.ok(indices.includes(1));
  });

  it("botDrawDiscardIndices respects remaining deck replacements", () => {
    const hand = [c("A", "hearts"), c("2", "clubs"), c("3", "diamonds")];
    assert.deepEqual(botDrawDiscardIndices(hand, "hearts", 2, 0), []);
    assert.equal(botDrawDiscardIndices(hand, "hearts", 2, 1).length, 1);
  });

  it("botPlayCardIndex picks a legal card and leads high when opening a trick", () => {
    const hand = [c("A", "clubs"), c("2", "clubs")];
    const leadCtx = {
      hand,
      trumpSuit: "hearts" as const,
      leadSuit: null,
      trickPlays: [] as Card[],
      isLeading: true,
    };
    assert.equal(botPlayCardIndex(hand, leadCtx), 0);

    const followCtx = {
      hand,
      trumpSuit: "hearts" as const,
      leadSuit: "clubs" as const,
      trickPlays: [c("5", "clubs")],
      isLeading: false,
    };
    const idx = botPlayCardIndex(hand, followCtx);
    const legal = getLegalPlayIndices(followCtx);
    assert.ok(legal.includes(idx));
  });

  it("bot draw choices are legal during simulated draw", () => {
    const state = initSimulatedHand({ seed: 44 });
    const pid = state.publicHand.turnPlayerId!;
    const indices = botDiscardFor(state, pid);
    assert.ok(indices.length <= (state.publicHand.maxDrawDiscards ?? 5));
  });

  it("bot play choices are legal during simulated play", () => {
    const afterDraw = runDrawPhase(initSimulatedHand({ seed: 55 }));
    const pid = afterDraw.publicHand.turnPlayerId!;
    const idx = botPlayFor(afterDraw, pid);
    assert.ok(idx >= 0);
  });
});

describe("F/H — bot full hand simulation", () => {
  it("completes a 4-player hand without deadlock", () => {
    const final = simulateFullHand({ seed: 100 });
    const totalTricks = Object.values(final.publicHand.tricksByPlayer).reduce(
      (s, n) => s + (n || 0),
      0,
    );
    assert.equal(totalTricks, 5);
    assert.equal(final.publicHand.currentTrick, null);
  });

  it("completes a 3-player hand without deadlock", () => {
    const final = simulateFullHand({
      participantIds: ["p1", "p2", "p3"],
      sortedPlayerIds: ["p1", "p2", "p3"],
      seed: 101,
    });
    const totalTricks = Object.values(final.publicHand.tricksByPlayer).reduce(
      (s, n) => s + (n || 0),
      0,
    );
    assert.equal(totalTricks, 5);
  });

  it("completes multiple sequential hands with different seeds", () => {
    for (const seed of [1, 2, 3, 7, 13, 42, 99]) {
      simulateFullHand({ seed });
    }
  });
});
