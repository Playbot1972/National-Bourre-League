import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HttpsError } from "firebase-functions/v2/https";
import {
  HAND_ENROLLMENT_MS,
  isRobotPlayerId,
  canActForPlayer,
  buildHandEnrollment,
  deriveWinnersFromTricks,
  handleAdvanceBots,
} from "./gameHandlers.js";
import { dealInitialHand } from "./vendor/game-engine.js";
import { collectHandAntes, handAnteContribution } from "./vendor/bourre-rules.js";

describe("isRobotPlayerId", () => {
  it("recognizes bot_ prefix", () => {
    assert.equal(isRobotPlayerId("bot_abc"), true);
    assert.equal(isRobotPlayerId("bot_"), true);
  });

  it("rejects human ids", () => {
    assert.equal(isRobotPlayerId("user-1"), false);
    assert.equal(isRobotPlayerId(""), false);
    assert.equal(isRobotPlayerId(null), false);
  });
});

describe("canActForPlayer", () => {
  it("allows self and robot proxy", () => {
    assert.equal(canActForPlayer("alice", "alice"), true);
    assert.equal(canActForPlayer("bot_1", "alice"), true);
  });

  it("denies acting for another human", () => {
    assert.equal(canActForPlayer("bob", "alice"), false);
    assert.equal(canActForPlayer("", "alice"), false);
  });
});

describe("buildHandEnrollment", () => {
  it("orders players from dealer and sets enrollment window", () => {
    const now = 1_700_000_000_000;
    const enrollment = buildHandEnrollment(["a", "b", "c", "d"], "b", {}, 1, now);
    assert.equal(enrollment.active, true);
    assert.deepEqual(enrollment.orderedPlayerIds, ["c", "d", "a", "b"]);
    assert.equal(enrollment.currentIndex, 0);
    assert.equal(enrollment.turnDeadlineMs, now + HAND_ENROLLMENT_MS);
    assert.deepEqual(enrollment.enrolledIds, []);
    assert.deepEqual(enrollment.declinedIds, []);
  });
});

describe("8-player full table deal prep", () => {
  it("collects antes and deals five cards each for eight seated players", () => {
    const ids = Array.from({ length: 8 }, (_, i) => `bot_${i + 1}`);
    const scoreById = Object.fromEntries(ids.map((id) => [id, { bankroll: 20, net: 0 }]));
    const collected = collectHandAntes({
      participants: ids,
      scoreById,
      buyInFallback: 20,
      stakeForPlayer: (pid) => handAnteContribution(scoreById[pid], 1),
    });
    assert.equal(collected.activeParticipants.length, 8);
    const deal = dealInitialHand({
      dealerId: ids[0],
      participantIds: collected.activeParticipants,
      sortedPlayerIds: ids,
      seed: 42,
    });
    assert.equal(deal.participantIds.length, 8);
    for (const pid of ids) {
      assert.equal(deal.privateHands[pid].length, 5);
    }
  });
});

describe("deriveWinnersFromTricks", () => {
  it("is not ready with fewer than two participants", () => {
    const result = deriveWinnersFromTricks({ a: 3 }, ["a"]);
    assert.equal(result.ready, false);
    assert.deepEqual(result.winnerIds, []);
  });

  it("is not ready when nobody has taken a trick", () => {
    const result = deriveWinnersFromTricks({ a: 0, b: 0 }, ["a", "b"]);
    assert.equal(result.ready, false);
    assert.equal(result.maxTricks, 0);
  });

  it("picks a single winner", () => {
    const result = deriveWinnersFromTricks({ a: 3, b: 1, c: 3 }, ["a", "b", "c"]);
    assert.equal(result.ready, true);
    assert.deepEqual(result.winnerIds.sort(), ["a", "c"]);
    assert.equal(result.maxTricks, 3);
  });

  it("detects co-winners tied on tricks", () => {
    const result = deriveWinnersFromTricks({ a: 2, b: 2, c: 1 }, ["a", "b", "c"]);
    assert.equal(result.ready, true);
    assert.deepEqual(result.winnerIds.sort(), ["a", "b"]);
  });
});

describe("handleAdvanceBots", () => {
  it("rejects missing roomId or sessionId at handler entry", async () => {
    const db = {};
    await assert.rejects(
      () => handleAdvanceBots(db, { roomId: "", sessionId: "s1", actorId: "u1" }),
      (err) => err instanceof HttpsError && err.code === "invalid-argument",
    );
    await assert.rejects(
      () => handleAdvanceBots(db, { sessionId: "s1", actorId: "u1" }),
      (err) => err instanceof HttpsError && err.code === "invalid-argument",
    );
  });
});
