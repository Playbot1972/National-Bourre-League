import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canSeatJoinerImmediately,
  canPromoteJoinerAtNextBoundary,
  computeOpenSeatCount,
  hasFillBotReplacementPath,
  isSafeSeatingWindow,
  mixedJoinCandidateTier,
  rankMixedJoinCandidates,
} from "./publicTableJoinPolicy.js";
import { BOT_ROLE } from "./vendor/public-table-schema.js";

const roomData = { targetSeatCount: 6 };
const handoffSession = {
  status: "in_progress",
  currentHand: { tricksByPlayer: {}, participantIds: [] },
  players: [
    { playerId: "host" },
    { playerId: "bot_1" },
    { playerId: "bot_2" },
    { playerId: "bot_3" },
    { playerId: "bot_4" },
    { playerId: "bot_5" },
  ],
};
const midHandSession = {
  status: "in_progress",
  currentHand: { phase: "play", tricksByPlayer: {}, participantIds: ["host", "bot_1"] },
  players: handoffSession.players,
};
const fillBotScores = [
  { playerId: "host", bankroll: 1000 },
  { playerId: "bot_1", bankroll: 1000, botRole: BOT_ROLE.FILL },
  { playerId: "bot_2", bankroll: 1000, botRole: BOT_ROLE.FILL },
  { playerId: "bot_3", bankroll: 1000, botRole: BOT_ROLE.FILL },
  { playerId: "bot_4", bankroll: 1000, botRole: BOT_ROLE.FILL },
  { playerId: "bot_5", bankroll: 1000, botRole: BOT_ROLE.FILL },
];

describe("publicTableJoinPolicy", () => {
  it("isSafeSeatingWindow is true only between hands", () => {
    assert.equal(isSafeSeatingWindow(handoffSession), true);
    assert.equal(isSafeSeatingWindow(midHandSession), false);
  });

  it("canSeatJoinerImmediately requires handoff and a seat path", () => {
    assert.equal(canSeatJoinerImmediately(handoffSession, roomData, fillBotScores), true);
    assert.equal(canSeatJoinerImmediately(midHandSession, roomData, fillBotScores), false);
  });

  it("canPromoteJoinerAtNextBoundary is true mid-hand when fill bots exist", () => {
    assert.equal(canPromoteJoinerAtNextBoundary(midHandSession, roomData, fillBotScores), true);
  });

  it("open seat capacity allows immediate seating without fill-bot replacement", () => {
    const vacatedScores = fillBotScores.filter((r) => r.playerId !== "bot_5");
    const vacatedPlayers = handoffSession.players.filter((p) => p.playerId !== "bot_5");
    assert.equal(computeOpenSeatCount(roomData, handoffSession, vacatedScores), 1);
    assert.equal(
      canSeatJoinerImmediately(
        { ...handoffSession, players: vacatedPlayers },
        roomData,
        vacatedScores,
      ),
      true,
    );
    assert.equal(hasFillBotReplacementPath(vacatedPlayers, vacatedScores), true);
  });

  it("rankMixedJoinCandidates prefers humans with immediate seat path", () => {
    const botOnly = {
      id: "bot_room",
      roomId: "r0",
      sessionId: "s0",
      realPlayerCount: 0,
      openSeats: 6,
      updatedAt: 99,
    };
    const humanHandoff = {
      id: "human_room",
      roomId: "r1",
      sessionId: "s1",
      realPlayerCount: 1,
      openSeats: 0,
      updatedAt: 1,
    };
    const contextByKey = {
      human_room: {
        sessionData: handoffSession,
        roomData,
        scoreRows: fillBotScores,
      },
    };
    const ranked = rankMixedJoinCandidates([botOnly, humanHandoff], contextByKey);
    assert.equal(ranked[0].id, "human_room");
    assert.equal(mixedJoinCandidateTier(humanHandoff, handoffSession, roomData, fillBotScores), 3);
  });
});
