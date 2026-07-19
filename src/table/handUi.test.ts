import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatHandPhase,
  formatLocalActionCue,
  formatWaitingCue,
  formatTrumpSuit,
  isCardsDealtPhase,
  turnIndicatorLabel,
} from "./handUi";

describe("G — hand UI labels", () => {
  it("formatHandPhase reflects session phase", () => {
    assert.equal(formatHandPhase(null, false), "Waiting");
    assert.equal(formatHandPhase("reveal", false), "Deal");
    assert.equal(formatHandPhase("decision", false), "Join hand");
    assert.equal(formatHandPhase("draw", false), "Draw");
    assert.equal(formatHandPhase("play", false), "Play card");
    assert.equal(formatHandPhase(null, true), "Join hand");
  });

  it("formatLocalActionCue describes the expected local action", () => {
    assert.equal(formatLocalActionCue("decision", false), "Tap I'm in or Pass at your seat");
    assert.equal(formatLocalActionCue("draw", false), "Choose cards to discard, then tap Draw");
    assert.equal(formatLocalActionCue("play", false), "Tap a card to play");
    assert.equal(formatLocalActionCue("reveal", false), null);
  });

  it("formatWaitingCue describes waiting states", () => {
    assert.equal(
      formatWaitingCue({ phase: "play", isMyTurn: false, cardsDealt: true }),
      "Waiting for other players",
    );
    assert.equal(formatWaitingCue({ phase: "play", isMyTurn: true, cardsDealt: true }), null);
    assert.equal(
      formatWaitingCue({ handComplete: true }),
      "Hand result — next hand coming up",
    );
  });

  it("isCardsDealtPhase is true for reveal, decision, draw and play", () => {
    assert.equal(isCardsDealtPhase("reveal"), true);
    assert.equal(isCardsDealtPhase("decision"), true);
    assert.equal(isCardsDealtPhase("draw"), true);
    assert.equal(isCardsDealtPhase("play"), true);
    assert.equal(isCardsDealtPhase(null), false);
  });

  it("formatTrumpSuit humanizes suit names", () => {
    assert.equal(formatTrumpSuit("spades"), "Spades");
    assert.equal(formatTrumpSuit("hearts"), "Hearts");
  });

  it("turnIndicatorLabel shows self vs opponent", () => {
    const players = [
      { playerId: "p1", displayName: "Alice", isSelf: true },
      { playerId: "p2", displayName: "Bob" },
    ];
    assert.equal(turnIndicatorLabel("p1", players), "Your turn");
    assert.equal(turnIndicatorLabel("p2", players), "Bob's turn");
  });
});
