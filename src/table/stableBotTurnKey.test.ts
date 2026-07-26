import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDurableBotTurnExit,
  isSameDurableBotPlayTurn,
  stablePlayTrickNumber,
} from "./stableBotTurnKey";

describe("stableBotTurnKey", () => {
  it("stabilizes trick number across currentTrick null flicker", () => {
    const lastTrick = { current: 0 };
    const lastHand = { current: 1 };
    assert.equal(stablePlayTrickNumber("play", 1, 3, lastTrick, lastHand), 3);
    assert.equal(stablePlayTrickNumber("play", 1, null, lastTrick, lastHand), 3);
    assert.equal(stablePlayTrickNumber("play", 1, 0, lastTrick, lastHand), 3);
  });

  it("treats trick 0 vs N as the same durable play turn", () => {
    assert.equal(isSameDurableBotPlayTurn("1:0:bot_a", "1:3:bot_a"), true);
    assert.equal(isSameDurableBotPlayTurn("1:3:bot_a", "1:3:bot_a"), true);
    assert.equal(isSameDurableBotPlayTurn("1:3:bot_a", "1:4:bot_a"), false);
    assert.equal(isSameDurableBotPlayTurn("1:3:bot_a", "2:3:bot_a"), false);
  });

  it("emits durable turn exit only on hand, player, or real trick change", () => {
    assert.equal(
      isDurableBotTurnExit(
        { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_a" },
        { handNumber: 1, trickNumber: 0, turnPlayerId: "bot_a" },
      ),
      false,
    );
    assert.equal(
      isDurableBotTurnExit(
        { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_a" },
        { handNumber: 1, trickNumber: 3, turnPlayerId: "bot_a" },
      ),
      true,
    );
  });
});
