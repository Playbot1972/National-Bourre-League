import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOT_PLAY_STAGGER_MS,
  CARD_LAND_MS,
  CARD_REVEAL_STAGGER_MS,
  completedTrickPlays,
  currentTrickLeaderId,
  detectTrickResolution,
  MIN_TRICK_PIPELINE_MS,
  postTrickReadMs,
  suppressesTurnIndicator,
  trickResolutionScheduleMs,
  trickRevealCatchUpMs,
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

  it("currentTrickLeaderId updates as each card is played", () => {
    const plays = [
      { playerId: "p1", card: { rank: "7", suit: "hearts" } },
      { playerId: "p2", card: { rank: "K", suit: "hearts" } },
    ];
    assert.equal(
      currentTrickLeaderId([plays[0]!], "hearts", "clubs"),
      "p1",
    );
    assert.equal(currentTrickLeaderId(plays, "hearts", "clubs"), "p2");
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

  it("recovers completing card from playedCards when server resolves atomically", () => {
    const prevTrick = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts",
      plays: [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "K", suit: "hearts" } },
        { playerId: "p3", card: { rank: "Q", suit: "hearts" } },
      ],
    };
    const playedCards = [
      { playerId: "p1", card: { rank: "A", suit: "hearts" }, trickNumber: 1 },
      { playerId: "p2", card: { rank: "K", suit: "hearts" }, trickNumber: 1 },
      { playerId: "p3", card: { rank: "Q", suit: "hearts" }, trickNumber: 1 },
      { playerId: "p4", card: { rank: "J", suit: "hearts" }, trickNumber: 1 },
    ];

    const plays = completedTrickPlays({ prevTrick, playedCards, trickNumber: 1 });
    assert.equal(plays.length, 4);

    const frozen = detectTrickResolution({
      prevTricks: { p1: 0, p2: 0, p3: 0, p4: 0 },
      nextTricks: { p1: 1, p2: 0, p3: 0, p4: 0 },
      participantIds: ["p1", "p2", "p3", "p4"],
      prevTrick,
      playedCards,
    });
    assert.ok(frozen);
    assert.equal(frozen!.plays.length, 4);
    assert.equal(frozen!.plays[3]?.playerId, "p4");
  });

  it("detects fifth trick when participantIds clear before tricks snapshot", () => {
    const frozen = detectTrickResolution({
      prevTricks: { p1: 2, p2: 1, p3: 1 },
      nextTricks: { p1: 2, p2: 2, p3: 1 },
      participantIds: [],
      prevTrick: {
        trickNumber: 5,
        leadPlayerId: "p2",
        leadSuit: "clubs",
        plays: [
          { playerId: "p2", card: { rank: "A", suit: "clubs" } },
          { playerId: "p3", card: { rank: "K", suit: "clubs" } },
        ],
      },
      playedCards: [
        { playerId: "p2", card: { rank: "A", suit: "clubs" }, trickNumber: 5 },
        { playerId: "p3", card: { rank: "K", suit: "clubs" }, trickNumber: 5 },
        { playerId: "p1", card: { rank: "Q", suit: "clubs" }, trickNumber: 5 },
      ],
    });
    assert.ok(frozen);
    assert.equal(frozen!.winnerId, "p2");
    assert.equal(frozen!.trickNumber, 5);
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
    assert.equal(postTrickReadMs({ trumpBeat: true }), 2050);
    assert.equal(postTrickReadMs({}), 1850);
  });

  it("schedules winner reveal inside the read pause", () => {
    const schedule = trickResolutionScheduleMs({});
    assert.equal(schedule.readTotalMs, 1850);
    assert.equal(schedule.winnerRevealMs, WINNER_REVEAL_MS);
    assert.equal(schedule.readBeforeWinnerMs, 1850 - WINNER_REVEAL_MS);
  });

  it("adds extra read beat on the final trick", () => {
    const normal = trickResolutionScheduleMs({});
    const finalTrick = trickResolutionScheduleMs({ finalTrick: true });
    assert.equal(finalTrick.readTotalMs, normal.readTotalMs + 900);
    assert.ok(finalTrick.pipelineMs > normal.pipelineMs);
  });

  it("reveal catch-up scales with remaining cards", () => {
    assert.equal(trickRevealCatchUpMs(4, 4), 0);
    assert.ok(trickRevealCatchUpMs(0, 4) > CARD_LAND_MS);
  });

  it("defines a minimum robot pipeline longer than one card play", () => {
    assert.ok(MIN_TRICK_PIPELINE_MS >= 2050);
  });

  it("bot-vs-bot spacing exceeds full trick pipeline so cadence cannot skip", () => {
    const pipeline = trickResolutionScheduleMs({}).pipelineMs;
    const robotInterval = pipeline + BOT_PLAY_STAGGER_MS + CARD_LAND_MS;
    assert.ok(robotInterval > pipeline);
    assert.ok(robotInterval > pipeline + BOT_PLAY_STAGGER_MS);
    assert.ok(robotInterval >= MIN_TRICK_PIPELINE_MS);
  });

  it("card reveal stagger waits for prior card land + shift", () => {
    assert.ok(CARD_REVEAL_STAGGER_MS > CARD_LAND_MS);
  });

  it("suppresses turn indicator until the trick pipeline returns to live play", () => {
    assert.equal(suppressesTurnIndicator("live"), false);
    assert.equal(suppressesTurnIndicator("trickComplete"), true);
    assert.equal(suppressesTurnIndicator("nextLeadReady"), true);
    assert.equal(suppressesTurnIndicator("winnerReveal"), true);
    assert.equal(suppressesTurnIndicator("collectTrick"), true);
  });
});
