import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOT_PLAY_STAGGER_MS,
  CARD_LAND_MS,
  CARD_REVEAL_CATCHUP_STAGGER_MS,
  CARD_REVEAL_STAGGER_MS,
  completedTrickPlays,
  cardRevealStaggerMs,
  currentTrickLeaderId,
  detectTrickResolution,
  estimateLiveRevealDrainMs,
  estimateRevealCatchUpDrainMs,
  FINAL_HAND_TRICK_PRESENTATION_MS,
  isRevealCatchUpMode,
  MIN_TRICK_PIPELINE_MS,
  postTrickReadMs,
  resolveTrickPresentationTimingMode,
  suppressesTurnIndicator,
  trickCardSettleMs,
  trickCardTravelMs,
  trickResolutionScheduleMs,
  trickWinnerDelta,
  TRICK_CARD_TRAVEL_CATCHUP_MS,
  TRICK_CARD_SETTLE_CATCHUP_MS,
  trumpBeatLedSuit,
  WINNER_REVEAL_MS,
} from "./trickTiming";
import { isRevealCatchUpBusy } from "./matchKey";

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
    assert.equal(postTrickReadMs({ trumpBeat: true }), 1300);
    assert.equal(postTrickReadMs({}), 1100);
  });

  it("schedules winner reveal after the post-trick read hold", () => {
    const schedule = trickResolutionScheduleMs({});
    assert.equal(schedule.readBeforeWinnerMs, 1100);
    assert.equal(schedule.winnerRevealMs, 650);
    assert.equal(schedule.readTotalMs, 1750);
  });

  it("suppresses turn ring during read, winner glow, and sweep", () => {
    assert.equal(suppressesTurnIndicator("trickComplete"), true);
    assert.equal(suppressesTurnIndicator("winnerReveal"), true);
    assert.equal(suppressesTurnIndicator("collectTrick"), true);
    assert.equal(suppressesTurnIndicator("nextLeadReady"), false);
    assert.equal(suppressesTurnIndicator("live"), false);
  });

  it("defines a minimum robot pipeline longer than one card play", () => {
    assert.ok(MIN_TRICK_PIPELINE_MS >= 2200);
  });

  it("bot-vs-bot spacing exceeds full trick pipeline so cadence cannot skip", () => {
    const pipeline = trickResolutionScheduleMs({}).pipelineMs;
    const robotInterval = pipeline + BOT_PLAY_STAGGER_MS + CARD_LAND_MS;
    assert.ok(robotInterval > pipeline);
    assert.ok(robotInterval > pipeline + BOT_PLAY_STAGGER_MS);
    assert.ok(robotInterval >= MIN_TRICK_PIPELINE_MS);
  });

  it("live inter-player reveal stagger stays within the readability band", () => {
    assert.ok(CARD_REVEAL_STAGGER_MS >= 250 && CARD_REVEAL_STAGGER_MS <= 400);
  });

  it("final-hand presentation watchdog covers staggered bot reveals plus resolution", () => {
    const minimum =
      CARD_REVEAL_STAGGER_MS * 7 + CARD_LAND_MS + trickResolutionScheduleMs({}).pipelineMs;
    assert.ok(FINAL_HAND_TRICK_PRESENTATION_MS >= minimum);
    assert.ok(FINAL_HAND_TRICK_PRESENTATION_MS >= 5200);
  });
});

describe("revealCatchUp pacing", () => {
  it("uses faster cadence than live reveal", () => {
    const live = cardRevealStaggerMs("live");
    const catchUp = cardRevealStaggerMs("catch-up");
    assert.ok(catchUp < live);
    assert.equal(catchUp, CARD_REVEAL_CATCHUP_STAGGER_MS);
    assert.equal(live, CARD_REVEAL_STAGGER_MS);
  });

  it("catch-up timing path is faster than live for the same backlog", () => {
    const liveDrain = estimateLiveRevealDrainMs(5);
    const catchUpDrain = estimateRevealCatchUpDrainMs(5);
    assert.ok(catchUpDrain < liveDrain);
    assert.ok(liveDrain > 1200);
  });

  it("drains a backlog of 5 within the catch-up timing budget", () => {
    const drainMs = estimateRevealCatchUpDrainMs(5);
    assert.ok(drainMs >= 250, `expected >= 250ms, got ${drainMs}`);
    assert.ok(drainMs <= 1200, `expected <= 1200ms, got ${drainMs}`);
  });

  it("presentation gate clears when catch-up reveal count reaches target", () => {
    assert.equal(
      isRevealCatchUpBusy({
        phase: "live",
        revealedCount: 4,
        revealTarget: 5,
        serverTrickPlays: 5,
      }),
      true,
    );
    assert.equal(
      isRevealCatchUpBusy({
        phase: "live",
        revealedCount: 5,
        revealTarget: 5,
        serverTrickPlays: 5,
      }),
      false,
    );
  });

  it("detects catch-up mode only while behind authoritative play count", () => {
    assert.equal(isRevealCatchUpMode(0, 5, 5), true);
    assert.equal(isRevealCatchUpMode(5, 5, 5), false);
    assert.equal(isRevealCatchUpMode(0, 5, 0), false);
  });

  it("resolveTrickPresentationTimingMode exposes only live and catch-up", () => {
    assert.equal(
      resolveTrickPresentationTimingMode({ revealedCount: 0, targetReveal: 3, serverTrickPlays: 3 }),
      "catch-up",
    );
    assert.equal(
      resolveTrickPresentationTimingMode({ revealedCount: 3, targetReveal: 3, serverTrickPlays: 3 }),
      "live",
    );
  });

  it("normal live reveal timing remains unchanged", () => {
    assert.equal(cardRevealStaggerMs("live"), CARD_REVEAL_STAGGER_MS);
    assert.equal(trickCardTravelMs("live"), 520);
    assert.ok(CARD_REVEAL_STAGGER_MS > CARD_REVEAL_CATCHUP_STAGGER_MS * 3);
  });

  it("catch-up uses compressed travel and settle", () => {
    assert.equal(trickCardTravelMs("catch-up"), TRICK_CARD_TRAVEL_CATCHUP_MS);
    assert.equal(trickCardSettleMs("catch-up"), TRICK_CARD_SETTLE_CATCHUP_MS);
    assert.ok(trickCardTravelMs("catch-up") < trickCardTravelMs("live"));
  });
});
