import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOT_PLAY_DELAY_MIN_MS,
  BOT_PLAY_DELAY_MAX_MS,
  botPlayTurnKey,
  createBotPlayDelayState,
  createBotThinkScheduleState,
  resolveBotAdvanceDelayMs,
} from "../docs/bot-play-delay.js";

describe("bot play delay", () => {
  it("botPlayTurnKey is stable per hand/trick/turn", () => {
    assert.equal(
      botPlayTurnKey({ handNumber: 2, trickNumber: 3, turnPlayerId: "bot_a" }),
      "2:3:bot_a",
    );
  });

  it("picks a fixed random delay per turn key", () => {
    let n = 0;
    const state = createBotPlayDelayState({ rng: () => (n += 0.25) });
    const first = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 10_000,
    });
    const retry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 10_500,
    });
    assert.equal(first.chosenDelayMs, retry.chosenDelayMs);
    assert.ok(first.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(first.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
    assert.equal(retry.delayMs, first.chosenDelayMs - 500);
  });

  it("never schedules before 1s from turn eligibility on retries", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const chosen = BOT_PLAY_DELAY_MIN_MS;
    const at = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: 0,
    });
    assert.equal(at.chosenDelayMs, chosen);
    assert.equal(at.delayMs, chosen);

    const earlyRetry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: 500,
    });
    assert.equal(earlyRetry.delayMs, chosen - 500);
    assert.ok(earlyRetry.delayMs >= 500);
  });

  it("play phase delay ignores trick interval floor", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const result = resolveBotAdvanceDelayMs({
      handPhase: "play",
      playDelayState: state,
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 5_000,
    });
    assert.equal(result.chosenDelayMs, BOT_PLAY_DELAY_MIN_MS);
    assert.equal(result.delayMs, BOT_PLAY_DELAY_MIN_MS);
    assert.equal(result.trickGapRemainingMs, 0);
  });

  it("clears delay map when hand number changes", () => {
    let i = 0;
    const state = createBotPlayDelayState({ rng: () => (i++ % 2) * 0.99 });
    const a = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    const b = state.resolvePlayDelayMs({
      handNumber: 2,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    assert.notEqual(a.chosenDelayMs, b.chosenDelayMs);
  });

  it("non-play phases keep short debounce", () => {
    const state = createBotPlayDelayState();
    const draw = resolveBotAdvanceDelayMs({
      handPhase: "draw",
      playDelayState: state,
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 1_000,
    });
    assert.equal(draw.delayMs, 150);
  });
});

describe("bot think schedule", () => {
  it("arms random delay between 1000 and 3000 ms", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0.5 });
    const armed = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.ok(armed.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(armed.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
  });

  it("coalesces duplicate schedule for same turn key", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const first = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const second = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 100,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(first.action, "armed");
    assert.equal(second.action, "coalesced");
  });

  it("cancels pending think on turn change", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const canceled = schedule.cancelPending({ reason: "turn_change" });
    assert.equal(canceled, true);
    assert.equal(schedule.pendingTurnKey, null);
  });

  it("rejects fire when shouldFire returns false", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    let fired = false;
    let rejected = false;
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => false,
      onFire: () => {
        fired = true;
      },
      log: {
        rejected: () => {
          rejected = true;
        },
      },
    });
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS + 50));
    assert.equal(fired, false);
    assert.equal(rejected, true);
  });

  it("fires after delay when presentation would be clear", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    let fired = false;
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_2" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {
        fired = true;
      },
    });
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS + 50));
    assert.equal(fired, true);
  });

  it("supersedes pending think when trick changes", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const next = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_1" },
      nowMs: 50,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(next.action, "armed");
    assert.equal(next.turnKey, "1:2:bot_1");
  });
});
