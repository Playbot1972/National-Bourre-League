import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDurableBotTurnExit,
  stablePlayTrickNumber,
} from "./stableBotTurnKey";

describe("stableBotTurnKey", () => {
  it("holds the last live trick number when currentTrick briefly clears", () => {
    const trickRef = { current: 0 };
    const handRef = { current: 1 };
    assert.equal(stablePlayTrickNumber("play", 1, 1, trickRef, handRef), 1);
    assert.equal(stablePlayTrickNumber("play", 1, null, trickRef, handRef), 1);
    assert.equal(stablePlayTrickNumber("play", 1, undefined, trickRef, handRef), 1);
  });

  it("advances when the authoritative trick number changes", () => {
    const trickRef = { current: 1 };
    const handRef = { current: 1 };
    assert.equal(stablePlayTrickNumber("play", 1, 2, trickRef, handRef), 2);
  });

  it("does not treat a trick-number flicker to zero as a durable turn exit", () => {
    const prev = { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_a" };
    const flicker = { handNumber: 1, trickNumber: 0, turnPlayerId: "bot_a" };
    const recovered = { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_a" };
    assert.equal(isDurableBotTurnExit(prev, flicker), false);
    assert.equal(isDurableBotTurnExit(flicker, recovered), false);
  });

  it("treats player and trick changes as durable turn exits", () => {
    const prev = { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_a" };
    assert.equal(
      isDurableBotTurnExit(prev, { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_b" }),
      true,
    );
    assert.equal(
      isDurableBotTurnExit(prev, { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_a" }),
      true,
    );
    assert.equal(
      isDurableBotTurnExit(prev, { handNumber: 2, trickNumber: 1, turnPlayerId: "bot_a" }),
      true,
    );
  });
});
