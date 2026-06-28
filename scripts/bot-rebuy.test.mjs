import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isRobotPlayerId,
  planBotAutoRebuys,
  patchSessionPlayersWithRebuyNames,
  sessionHasRobotScores,
} from "../docs/bot-rebuy.js";

describe("bot-rebuy", () => {
  it("isRobotPlayerId detects bot seats", () => {
    assert.equal(isRobotPlayerId("bot_abc"), true);
    assert.equal(isRobotPlayerId("user1"), false);
  });

  it("plans auto-rebuy only for busted bots", () => {
    const scoreRows = [
      { playerId: "human", displayName: "Mom", bankroll: 0, out: true },
      { playerId: "bot_a", displayName: "Liam", isRobot: true, bankroll: 0, out: true },
      { playerId: "bot_b", displayName: "Emma", isRobot: true, bankroll: 50, out: false },
    ];
    const plan = planBotAutoRebuys({ scoreRows, buyIn: 100, rng: () => 0.1 });
    assert.equal(plan.length, 1);
    assert.equal(plan[0].playerId, "bot_a");
    assert.notEqual(plan[0].displayName, "Liam");
  });

  it("assigns unique names when multiple bots rebuy", () => {
    const scoreRows = [
      { playerId: "bot_a", displayName: "Liam", isRobot: true, out: true, bankroll: 0 },
      { playerId: "bot_b", displayName: "Emma", isRobot: true, out: true, bankroll: 0 },
    ];
    const plan = planBotAutoRebuys({ scoreRows, buyIn: 100, rng: () => 0.42 });
    assert.equal(plan.length, 2);
    const names = plan.map((p) => p.displayName.toLowerCase());
    assert.equal(new Set(names).size, 2);
    assert.ok(!names.includes("liam"));
    assert.ok(!names.includes("emma"));
  });

  it("patchSessionPlayersWithRebuyNames updates roster display names", () => {
    const players = [
      { playerId: "human", displayName: "Mom" },
      { playerId: "bot_a", displayName: "Liam" },
    ];
    const patched = patchSessionPlayersWithRebuyNames(players, [
      { playerId: "bot_a", displayName: "Noah" },
    ]);
    assert.equal(patched[1].displayName, "Noah");
    assert.equal(patched[0].displayName, "Mom");
  });

  it("sessionHasRobotScores is false without robots", () => {
    assert.equal(
      sessionHasRobotScores([{ playerId: "u1", displayName: "Mom" }]),
      false,
    );
  });
});
