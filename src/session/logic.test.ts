import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createRobotPlayerId,
  isRobotPlayerId,
  mergeScoresWithMembers,
  nextDealerId,
  nextEligibleDealerId,
  seatPlayerIdsFromRoster,
  sessionHasRobots,
  sortScoresForDisplay,
} from "./logic";

describe("A — session and bot helpers", () => {
  it("identifies robot player ids", () => {
    assert.ok(isRobotPlayerId("bot_abc"));
    assert.ok(!isRobotPlayerId("user_1"));
  });

  it("creates stable bot ids when labeled", () => {
    assert.equal(createRobotPlayerId("alpha"), "bot_alpha");
  });

  it("mergeScoresWithMembers adds room members and session players", () => {
    const merged = mergeScoresWithMembers(
      [{ playerId: "p1", displayName: "Alice", net: 5 }],
      [{ userId: "p2", displayName: "Bob" }],
      [{ playerId: "bot_x", displayName: "Bot X" }],
    );
    assert.equal(merged.length, 3);
    assert.ok(merged.some((s) => s.playerId === "p2"));
    assert.ok(merged.some((s) => s.playerId === "bot_x"));
  });

  it("sortScoresForDisplay respects member order", () => {
    const sorted = sortScoresForDisplay(
      [
        { playerId: "p3", displayName: "C" },
        { playerId: "p1", displayName: "A" },
      ],
      [{ playerId: "p1" }, { playerId: "p2" }, { playerId: "p3" }],
    );
    assert.equal(sorted[0].playerId, "p1");
    assert.equal(sorted[1].playerId, "p3");
  });

  it("sessionHasRobots detects bot seats", () => {
    assert.ok(sessionHasRobots([{ playerId: "u1" }, { playerId: "bot_1" }]));
    assert.ok(!sessionHasRobots([{ playerId: "u1" }]));
  });

  it("nextDealerId rotates clockwise in sorted order", () => {
    assert.equal(nextDealerId(["a", "b", "c"], "a"), "b");
    assert.equal(nextDealerId(["a", "b", "c"], "c"), "a");
  });

  it("nextEligibleDealerId skips out/ineligible seats", () => {
    const seats = ["p1", "p2", "p3", "p4"];
    const eligible = ["p1", "p3", "p4"];
    assert.equal(nextEligibleDealerId(seats, "p1", eligible), "p3");
    assert.equal(nextEligibleDealerId(seats, "p2", eligible), "p3");
    assert.equal(nextEligibleDealerId(seats, "p4", eligible), "p1");
    assert.equal(nextEligibleDealerId(seats, "p1", []), null);
  });

  it("seatPlayerIdsFromRoster uses session join order for dealer rotation", () => {
    const seats = seatPlayerIdsFromRoster(
      [
        { playerId: "carol" },
        { playerId: "alice" },
        { playerId: "bob" },
      ],
      [
        { playerId: "alice", displayName: "Alice" },
        { playerId: "bob", displayName: "Bob" },
        { playerId: "carol", displayName: "Carol" },
      ],
    );
    assert.deepEqual(seats, ["carol", "alice", "bob"]);
    assert.equal(nextDealerId(seats, "carol"), "alice");
  });
});
