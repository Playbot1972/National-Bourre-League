import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOT_FOLD_P_THRESHOLD,
  BOT_PASS_P_THRESHOLD,
  botDrawDiscardIndices,
  botPlayCardIndex,
  botShouldFoldDraw,
  botShouldPassDecision,
  buildBotMoveContext,
} from "./botSearch";
import { heuristicDrawDiscardIndices } from "./botHeuristic";
import { getLegalPlayIndices } from "./legal";
import { effectivePlayerHand } from "./invariants";
import { buildPlayValidationState } from "./playContext";
import { initSimulatedHand, runDrawPhase } from "./testHelpers";
import type { Card } from "../types";

const c = (rank: string, suit: string): Card => ({ rank, suit }) as Card;

describe("probability-aware bot decisions", () => {
  it("folds very weak 5-card hands when full table context is known", () => {
    const state = initSimulatedHand({
      seed: 77,
      participantIds: ["p1", "p2", "p3"],
      sortedPlayerIds: ["p1", "p2", "p3"],
    });
    const weak = [c("2", "hearts"), c("3", "diamonds"), c("5", "spades"), c("6", "hearts"), c("7", "diamonds")];
    const strong2 = [c("A", "clubs"), c("K", "clubs"), c("Q", "diamonds"), c("J", "spades"), c("10", "hearts")];
    const strong3 = [c("A", "hearts"), c("K", "hearts"), c("Q", "spades"), c("J", "diamonds"), c("10", "clubs")];
    state.privateHands.p1 = weak;
    state.privateHands.p2 = strong2;
    state.privateHands.p3 = strong3;
    state.publicHand.trumpSuit = "clubs";
    const hand = effectivePlayerHand("p1", weak, state.publicHand);
    const ctx = buildBotMoveContext("p1", weak, state.publicHand, state.deck, state.privateHands);
    assert.equal(botShouldFoldDraw(hand, state.publicHand.trumpSuit, ctx), true);
    assert.equal(botShouldPassDecision(hand, state.publicHand.trumpSuit, ctx), true);
  });

  it("keeps strong trump hands in play", () => {
    const state = initSimulatedHand({
      seed: 88,
      participantIds: ["p1", "p2", "p3"],
      sortedPlayerIds: ["p1", "p2", "p3"],
    });
    const strong = [c("A", "clubs"), c("K", "clubs"), c("Q", "hearts"), c("7", "diamonds"), c("2", "spades")];
    state.privateHands.p1 = strong;
    state.publicHand.trumpSuit = "clubs";
    const hand = effectivePlayerHand("p1", strong, state.publicHand);
    const ctx = buildBotMoveContext("p1", strong, state.publicHand, state.deck, state.privateHands);
    assert.equal(botShouldFoldDraw(hand, "clubs", ctx), false);
  });

  it("evaluates trump-holder effective hands without hand.length bypass", () => {
    const state = initSimulatedHand({ seed: 99, participantIds: ["p1", "p2"], sortedPlayerIds: ["p1", "p2"] });
    const pid = state.publicHand.dealerId ?? "p1";
    const hand = effectivePlayerHand(pid, state.privateHands[pid]!, state.publicHand);
    const ctx = buildBotMoveContext(pid, state.privateHands[pid]!, state.publicHand, state.deck, state.privateHands);
    assert.ok(hand.length > 0);
    assert.equal(typeof botShouldFoldDraw(hand, state.publicHand.trumpSuit, ctx), "boolean");
  });

  it("prefers pat draw when discarding hurts (seed 50023 audit case)", () => {
    const state = initSimulatedHand({
      seed: 50023,
      participantIds: ["p1", "p2", "p3", "p4"],
      sortedPlayerIds: ["p1", "p2", "p3", "p4"],
    });
    const heroId = "p2";
    const hand = effectivePlayerHand(heroId, state.privateHands[heroId]!, state.publicHand);
    const pile = state.deck;
    const ctx = buildBotMoveContext(heroId, state.privateHands[heroId]!, state.publicHand, state.deck, state.privateHands);
    const indices = botDrawDiscardIndices(
      hand,
      state.publicHand.trumpSuit,
      state.publicHand.maxDrawDiscards ?? 5,
      20,
      ctx,
    );
    const heuristic = heuristicDrawDiscardIndices(
      hand,
      state.publicHand.trumpSuit,
      state.publicHand.maxDrawDiscards ?? 5,
      20,
    );
    assert.ok(indices.length <= heuristic.length, "smart bot should not discard more aggressively than legacy heuristic");
  });

  it("bot play choices remain legal during simulated play", () => {
    const afterDraw = runDrawPhase(initSimulatedHand({ seed: 55 }));
    const pid = afterDraw.publicHand.turnPlayerId!;
    const hand = effectivePlayerHand(pid, afterDraw.privateHands[pid]!, afterDraw.publicHand);
    const playCtx = buildPlayValidationState({ hand, publicHand: afterDraw.publicHand });
    const moveCtx = buildBotMoveContext(pid, afterDraw.privateHands[pid]!, afterDraw.publicHand, afterDraw.deck, afterDraw.privateHands);
    const idx = botPlayCardIndex(hand, playCtx, moveCtx);
    const legal = getLegalPlayIndices(playCtx);
    assert.ok(legal.includes(idx));
  });

  it("exports configurable fold/pass thresholds", () => {
    assert.ok(BOT_FOLD_P_THRESHOLD > 0 && BOT_FOLD_P_THRESHOLD < 0.5);
    assert.ok(BOT_PASS_P_THRESHOLD >= BOT_FOLD_P_THRESHOLD);
  });
});
