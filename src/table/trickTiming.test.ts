import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectTrickResolution,
  postTrickHoldMs,
  trickWinnerDelta,
  trumpBeatLedSuit,
} from "./trickTiming";

describe("trickTiming", () => {
  it("finds trick winner from tricks delta", () => {
    assert.equal(
      trickWinnerDelta({ a: 1, b: 0 }, { a: 1, b: 1 }, ["a", "b"]),
      "b",
    );
    assert.equal(trickWinnerDelta({ a: 2 }, { a: 2 }, ["a", "b"]), null);
  });

  it("detects completed trick from prior trick snapshot", () => {
    const frozen = detectTrickResolution({
      prevTricks: { p1: 1, p2: 0 },
      nextTricks: { p1: 1, p2: 1 },
      participantIds: ["p1", "p2"],
      prevTrick: {
        trickNumber: 2,
        leadPlayerId: "p1",
        leadSuit: "hearts",
        plays: [
          { playerId: "p1", card: { rank: "A", suit: "hearts" } },
          { playerId: "p2", card: { rank: "K", suit: "hearts" } },
        ],
      },
    });

    assert.ok(frozen);
    assert.equal(frozen!.winnerId, "p2");
    assert.equal(frozen!.plays.length, 2);
    assert.equal(frozen!.trickNumber, 2);
  });

  it("returns null when trick count unchanged", () => {
    assert.equal(
      detectTrickResolution({
        prevTricks: { p1: 1 },
        nextTricks: { p1: 1 },
        participantIds: ["p1", "p2"],
        prevTrick: {
          trickNumber: 1,
          leadPlayerId: "p1",
          leadSuit: "clubs",
          plays: [{ playerId: "p1", card: { rank: "7", suit: "clubs" } }],
        },
      }),
      null,
    );
  });

  it("uses longer hold when trump beats led suit", () => {
    const trumpBeat = trumpBeatLedSuit(
      [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "9", suit: "spades" } },
      ],
      "hearts",
      "spades",
    );
    assert.equal(trumpBeat, true);
    assert.equal(postTrickHoldMs({ trumpBeat: true }), 2000);
    assert.equal(postTrickHoldMs({ mobile: true }), 1800);
    assert.equal(postTrickHoldMs({}), 1500);
  });
});
