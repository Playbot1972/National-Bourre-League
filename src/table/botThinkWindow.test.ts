import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  botPlayTurnKey,
  botThinkCountdownSegment,
  buildBotThinkCountdownState,
  getBotThinkWindow,
  publishBotThinkWindow,
  subscribeBotThinkWindow,
} from "./botThinkWindow";

describe("botThinkWindow", () => {
  it("builds countdown from fixed think duration", () => {
    const state = buildBotThinkCountdownState("bot_1", 100, 600, 200, 0, 100);
    assert.ok(state);
    assert.equal(state!.playerId, "bot_1");
    assert.equal(state!.remainingMs, 500);
    assert.ok(Math.abs(state!.progress - 500 / 600) < 0.001);
    assert.equal(state!.segment, "green");
  });

  it("shows full ring before visible counting starts", () => {
    const state = buildBotThinkCountdownState("bot_1", 0, 2000, 500, 0, null);
    assert.ok(state);
    assert.equal(state!.remainingMs, 2000);
    assert.equal(state!.progress, 1);
  });

  it("expires at totalMs elapsed", () => {
    const state = buildBotThinkCountdownState("bot_1", 100, 500, 600, 0, 100);
    assert.ok(state);
    assert.equal(state!.remainingMs, 0);
    assert.equal(state!.progress, 0);
    assert.equal(state!.segment, "red");
  });

  it("publishes one stable window per turn key", () => {
    let notifications = 0;
    const unsub = subscribeBotThinkWindow(() => {
      notifications += 1;
    });
    publishBotThinkWindow({
      turnKey: "1:2:bot_a",
      playerId: "bot_a",
      startedAtMs: 100,
      totalMs: 450,
    });
    assert.equal(getBotThinkWindow()?.totalMs, 450);
    assert.equal(notifications, 1);
    publishBotThinkWindow(null);
    assert.equal(getBotThinkWindow(), null);
    unsub();
  });

  it("botPlayTurnKey matches bot-play-delay format", () => {
    assert.equal(
      botPlayTurnKey({ handNumber: 2, trickNumber: 3, turnPlayerId: "bot_x" }),
      "2:3:bot_x",
    );
  });

  it("segment thresholds scale to short bot windows", () => {
    assert.equal(botThinkCountdownSegment(700, 900), "green");
    assert.equal(botThinkCountdownSegment(500, 900), "yellow");
    assert.equal(botThinkCountdownSegment(200, 900), "red");
  });
});
