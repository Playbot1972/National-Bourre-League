import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOT_PLAY_STAGGER_MS,
  CARD_LAND_MS,
  detectTrickResolution,
  MIN_TRICK_PIPELINE_MS,
  postTrickReadMs,
  trickResolutionScheduleMs,
  trickWinnerDelta,
  trumpBeatLedSuit,
  WINNER_REVEAL_MS,
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

  it("uses longer read when trump beats led suit", () => {
    const trumpBeat = trumpBeatLedSuit(
      [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "9", suit: "spades" } },
      ],
      "hearts",
      "spades",
    );
    assert.equal(trumpBeat, true);
    assert.equal(postTrickReadMs({ trumpBeat: true }), 1800);
    assert.equal(postTrickReadMs({}), 1400);
  });

  it("schedules winner reveal inside the read pause", () => {
    const schedule = trickResolutionScheduleMs({});
    assert.equal(schedule.readTotalMs, 1400);
    assert.equal(schedule.winnerRevealMs, WINNER_REVEAL_MS);
    assert.equal(schedule.readBeforeWinnerMs, 1400 - WINNER_REVEAL_MS);
  });

  it("defines a minimum robot pipeline longer than one card play", () => {
    assert.ok(MIN_TRICK_PIPELINE_MS >= 1800);
  });

  it("bot-vs-bot spacing exceeds full trick pipeline so cadence cannot skip", () => {
    const pipeline = trickResolutionScheduleMs({}).pipelineMs;
    const robotInterval = pipeline + BOT_PLAY_STAGGER_MS + CARD_LAND_MS;
    assert.ok(robotInterval > pipeline);
    assert.ok(robotInterval > pipeline + BOT_PLAY_STAGGER_MS);
    assert.ok(robotInterval >= MIN_TRICK_PIPELINE_MS);
  });
});
