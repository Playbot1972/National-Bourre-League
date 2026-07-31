import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isGenericRosterDisplayName,
  mergeScoresWithMembers,
  resolveRosterDisplayName,
  rosterDisplaySignature,
  upsertSessionPlayerEntry,
} from "../docs/table-roster-merge.js";

describe("table-roster-merge", () => {
  it("isGenericRosterDisplayName treats Player placeholder as generic", () => {
    assert.equal(isGenericRosterDisplayName("Player"), true);
    assert.equal(isGenericRosterDisplayName("player"), true);
    assert.equal(isGenericRosterDisplayName(""), true);
    assert.equal(isGenericRosterDisplayName("player1000"), false);
  });

  it("resolveRosterDisplayName prefers member over generic score", () => {
    assert.equal(resolveRosterDisplayName("Player", "player1000"), "player1000");
    assert.equal(resolveRosterDisplayName("player1000", "Player"), "player1000");
  });

  it("mergeScoresWithMembers upgrades generic score with member name", () => {
    const merged = mergeScoresWithMembers(
      [{ playerId: "u1", displayName: "Player", tricksWon: 0 }],
      [{ userId: "u1", displayName: "player1000" }],
      [{ playerId: "u1", displayName: "Player" }],
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0].displayName, "player1000");
  });

  it("mergeScoresWithMembers uses members when scores are empty", () => {
    const merged = mergeScoresWithMembers(
      [],
      [{ userId: "u1", displayName: "player1000" }],
      [{ playerId: "u1", displayName: "Player" }],
    );
    assert.equal(merged[0].displayName, "player1000");
  });

  it("mergeScoresWithMembers uses auth displayName when member/score are generic", () => {
    const merged = mergeScoresWithMembers(
      [{ playerId: "u1", displayName: "Player", tricksWon: 0 }],
      [],
      [{ playerId: "u1", displayName: "Player" }],
      null,
      { authDisplayNameByPlayerId: { u1: "player1000" } },
    );
    assert.equal(merged[0].displayName, "player1000");
  });

  it("rosterDisplaySignature is stable for identical roster", () => {
    const roster = [
      { playerId: "u1", displayName: "player1000", isRobot: false },
      { playerId: "bot_1", displayName: "Robot", isRobot: true },
    ];
    assert.equal(rosterDisplaySignature(roster), rosterDisplaySignature([...roster]));
  });
});
