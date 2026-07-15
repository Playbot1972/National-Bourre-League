import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOT_PLAY_DELAY_MIN_MS,
  BOT_PLAY_DELAY_MAX_MS,
  BOT_PLAY_LAST_CARD_MIN_MS,
  BOT_PLAY_LAST_CARD_MAX_MS,
  BOT_MIN_VISIBLE_THINK_MS,
  BOT_THINK_PACING_MULTIPLIER,
  botPlayTurnKey,
  createBotPlayDelayState,
  createBotThinkScheduleState,
  pickBotPlayDelayMs,
  resolveBotAdvanceDelayMs,
} from "../docs/bot-play-delay.js";

const MIN_VISIBLE_THINK_MS = 3000;

describe("bot play delay", () => {
  it("botPlayTurnKey is stable per hand/trick/turn", () => {
    assert.equal(
      botPlayTurnKey({ handNumber: 2, trickNumber: 3, turnPlayerId: "bot_a" }),
      "2:3:bot_a",
    );
  });

  it("uses 3× pacing multiplier on base think ranges", () => {
    assert.equal(BOT_THINK_PACING_MULTIPLIER, 3);
    assert.equal(BOT_PLAY_DELAY_MIN_MS, 750);
    assert.equal(BOT_PLAY_DELAY_MAX_MS, 2100);
    assert.equal(BOT_PLAY_LAST_CARD_MIN_MS, 300);
    assert.equal(BOT_PLAY_LAST_CARD_MAX_MS, 900);
    assert.equal(BOT_MIN_VISIBLE_THINK_MS, MIN_VISIBLE_THINK_MS);
  });

  it("normal bot turn delay is at least 3000ms", () => {
    const picked = pickBotPlayDelayMs(3, () => 0.5);
    assert.equal(picked.isLastCard, false);
    assert.equal(picked.remainingHandCount, 3);
    assert.ok(picked.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
    assert.ok(picked.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS || picked.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
  });

  it("last-card bot turn delay respects 3000ms minimum", () => {
    const picked = pickBotPlayDelayMs(1, () => 0.99);
    assert.equal(picked.isLastCard, true);
    assert.equal(picked.remainingHandCount, 1);
    assert.ok(picked.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
  });

  it("picks a fixed random delay per turn key", () => {
    let n = 0;
    const state = createBotPlayDelayState({ rng: () => (n += 0.25) });
    const first = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      remainingHandCount: 4,
      nowMs: 10_000,
    });
    const retry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      remainingHandCount: 4,
      nowMs: 10_500,
    });
    assert.equal(first.chosenDelayMs, retry.chosenDelayMs);
    assert.ok(first.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
    assert.equal(retry.delayMs, Math.max(0, first.chosenDelayMs - 500));
  });

  it("last-card delay is cached separately from normal delay for same turn key", () => {
    let i = 0;
    const state = createBotPlayDelayState({ rng: () => (i++ % 2) * 0.99 });
    const normal = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 5,
      turnPlayerId: "bot_1",
      remainingHandCount: 2,
      nowMs: 0,
    });
    const lastCard = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 5,
      turnPlayerId: "bot_1",
      remainingHandCount: 1,
      nowMs: 0,
    });
    assert.equal(normal.isLastCard, false);
    assert.equal(lastCard.isLastCard, true);
    assert.ok(lastCard.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
  });

  it("credits elapsed wait time against the chosen delay", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const chosen = MIN_VISIBLE_THINK_MS;
    const at = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      remainingHandCount: 3,
      nowMs: 0,
    });
    assert.equal(at.chosenDelayMs, chosen);
    assert.equal(at.delayMs, chosen);

    const laterRetry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      remainingHandCount: 3,
      nowMs: chosen - 50,
    });
    assert.equal(laterRetry.delayMs, 50);
  });

  it("presentation wait can consume the full think delay", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    state.beginVisibleThinkWindow({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    const afterPresentation = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      remainingHandCount: 3,
      nowMs: MIN_VISIBLE_THINK_MS + 200,
    });
    assert.equal(afterPresentation.delayMs, 0);
  });

  it("does not credit invisible presentation-block wait against visible think", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    state.markTurnEligible({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    state.beginVisibleThinkWindow({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 5000,
    });
    const armed = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      remainingHandCount: 3,
      nowMs: 5000,
    });
    assert.equal(armed.chosenDelayMs, MIN_VISIBLE_THINK_MS);
    assert.equal(armed.delayMs, MIN_VISIBLE_THINK_MS);
    assert.equal(armed.elapsedSinceTurnMs, 0);
  });

  it("play phase delay ignores trick interval floor", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const result = resolveBotAdvanceDelayMs({
      handPhase: "play",
      playDelayState: state,
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 2 },
      nowMs: 5_000,
    });
    assert.equal(result.chosenDelayMs, MIN_VISIBLE_THINK_MS);
    assert.equal(result.delayMs, MIN_VISIBLE_THINK_MS);
    assert.equal(result.trickGapRemainingMs, 0);
  });

  it("clears delay map when hand number changes", () => {
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      remainingHandCount: 2,
      nowMs: 0,
    });
    assert.equal(state.delayByTurnKey.size, 1);
    state.resolvePlayDelayMs({
      handNumber: 2,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      remainingHandCount: 2,
      nowMs: 0,
    });
    assert.equal(state.delayByTurnKey.size, 1);
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
  it("arms delay of at least 3000ms for normal turns", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0.5 });
    const armed = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 3 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.equal(armed.isLastCard, false);
    assert.ok(armed.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
  });

  it("arms last-card delay with 3000ms minimum", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0.99 });
    const armed = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 5, turnPlayerId: "bot_1", remainingHandCount: 1 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.equal(armed.isLastCard, true);
    assert.equal(armed.remainingHandCount, 1);
    assert.ok(armed.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
  });

  it("coalesces duplicate schedule for same turn key", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const first = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 2 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const second = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 2 },
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
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 1 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const canceled = schedule.cancelPending({ reason: "turn_change" });
    assert.equal(canceled, true);
    assert.equal(schedule.pendingTurnKey, null);
  });

  it("last-card pending play cancels on trick change", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 1 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const next = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_1", remainingHandCount: 1 },
      nowMs: 50,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(next.action, "armed");
    assert.equal(schedule.pendingTurnKey, "1:2:bot_1");
  });

  it("last-card pending play cancels on hand change", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 4, turnPlayerId: "bot_1", remainingHandCount: 1 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const next = schedule.armPlayThink({
      ctx: { handNumber: 2, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 1 },
      nowMs: 50,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(next.action, "armed");
    assert.equal(next.turnKey, "2:1:bot_1");
  });

  it("rejects fire when shouldFire returns false", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    let fired = false;
    let rejected = false;
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 1 },
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
    await new Promise((r) => setTimeout(r, MIN_VISIBLE_THINK_MS + 50));
    assert.equal(fired, false);
    assert.equal(rejected, true);
  });

  it("fires after delay when presentation would be clear", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    let fired = false;
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_2", remainingHandCount: 2 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {
        fired = true;
      },
    });
    await new Promise((r) => setTimeout(r, MIN_VISIBLE_THINK_MS + 50));
    assert.equal(fired, true);
  });

  it("supersedes pending think when trick changes", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 2 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const next = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_1", remainingHandCount: 2 },
      nowMs: 50,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(next.action, "armed");
    assert.equal(next.turnKey, "1:2:bot_1");
  });
});
