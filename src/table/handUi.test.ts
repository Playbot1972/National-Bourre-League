import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatHandPhase,
  formatTrumpSuit,
  isCardsDealtPhase,
  turnIndicatorLabel,
} from "./handUi";

describe("G — hand UI labels", () => {
  it("formatHandPhase reflects session phase", () => {
    assert.equal(formatHandPhase(null, false), "Waiting to deal");
    assert.equal(formatHandPhase("reveal", false), "Dealing");
    assert.equal(formatHandPhase("decision", false), "Play or pass");
    assert.equal(formatHandPhase("draw", false), "Draw round");
    assert.equal(formatHandPhase("play", false), "Trick play");
    assert.equal(formatHandPhase(null, true), "Play or pass");
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
