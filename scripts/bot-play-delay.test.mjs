import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOT_PLAY_DELAY_MIN_MS,
  BOT_PLAY_DELAY_MAX_MS,
  botPlayTurnKey,
  createBotPlayDelayState,
  createBotThinkScheduleState,
  pickBotPlayDelayMs,
  resolveBotAdvanceDelayMs,
  setBotThinkWindowPublisher,
} from "../docs/bot-play-delay.js";

describe("bot play delay", () => {
  it("botPlayTurnKey is stable per hand/trick/turn", () => {
    assert.equal(
      botPlayTurnKey({ handNumber: 2, trickNumber: 3, turnPlayerId: "bot_a" }),
      "2:3:bot_a",
    );
  });

  it("bot turn delay is 1500–3000ms", () => {
    const min = pickBotPlayDelayMs(() => 0);
    const max = pickBotPlayDelayMs(() => 0.999999);
    assert.equal(min.chosenDelayMs, BOT_PLAY_DELAY_MIN_MS);
    assert.equal(max.chosenDelayMs, BOT_PLAY_DELAY_MAX_MS);
    assert.equal(min.remainingHandCount, null);
  });

  it("picks one fixed random delay per turn key", () => {
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
    assert.equal(retry.delayMs, Math.max(0, first.chosenDelayMs - 500));
  });

  it("last card uses the same 1500–3000ms window as other plays", () => {
    const normal = pickBotPlayDelayMs(() => 0);
    const lastCard = pickBotPlayDelayMs(() => 0.99);
    assert.ok(normal.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(lastCard.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(lastCard.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
  });

  it("rerender does not regenerate a shorter timer", () => {
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    const first = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: 0,
    });
    const rerender = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: 100,
    });
    assert.equal(rerender.chosenDelayMs, first.chosenDelayMs);
    assert.equal(rerender.delayMs, Math.max(0, first.chosenDelayMs - 100));
    assert.ok(rerender.delayMs < first.delayMs);
  });

  it("credits elapsed wait time against the chosen delay", () => {
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

    const laterRetry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: chosen - 50,
    });
    assert.equal(laterRetry.delayMs, 50);
  });

  it("does not consume think delay before the turn is armed for play", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const armed = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_x",
      nowMs: 12_000,
    });
    assert.equal(armed.chosenDelayMs, BOT_PLAY_DELAY_MIN_MS);
    assert.equal(armed.elapsedSinceTurnMs, 0);
    assert.equal(armed.delayMs, BOT_PLAY_DELAY_MIN_MS);
  });

  it("credits elapsed time only after the turn is marked eligible", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    state.markTurnEligible({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    const afterPresentation = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: BOT_PLAY_DELAY_MIN_MS + 200,
    });
    assert.equal(afterPresentation.delayMs, 0);
  });

  it("publishes one stable think window per eligible turn", () => {
    const windows = [];
    setBotThinkWindowPublisher((window) => {
      if (window) windows.push(window);
    });
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    state.markTurnEligible({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 100,
    });
    state.markTurnEligible({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 200,
    });
    assert.equal(windows.length, 1);
    assert.equal(windows[0]?.playerId, "bot_1");
    assert.ok(windows[0]?.totalMs >= BOT_PLAY_DELAY_MIN_MS);
    setBotThinkWindowPublisher(null);
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
  it("arms random delay between 1500 and 3000 ms", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0.5 });
    const armed = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.equal(armed.isLastCard, false);
    assert.ok(armed.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(armed.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
  });

  it("submit never fires before 1500 ms", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    let fired = false;
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {
        fired = true;
      },
    });
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS - 50));
    assert.equal(fired, false);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(fired, true);
  });

  it("submit fires by 3000 ms when eligible and unblocked", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0.999999 });
    let fired = false;
    const started = Date.now();
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_2" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {
        fired = true;
      },
    });
    const deadline = Date.now() + BOT_PLAY_DELAY_MAX_MS + 100;
    while (!fired && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 25));
    }
    assert.equal(fired, true);
    assert.ok(Date.now() - started <= BOT_PLAY_DELAY_MAX_MS + 150);
  });

  it("coalesced rerender does not reset the armed timer", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const first = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const second = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: 200,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(first.action, "armed");
    assert.equal(second.action, "coalesced");
    assert.equal(schedule.pendingTurnKey, "1:1:bot_1");
    assert.equal(first.chosenDelayMs, BOT_PLAY_DELAY_MIN_MS);
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

  it("one-at-a-time sequencing supersedes prior bot turn timer", () => {
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
    assert.equal(schedule.pendingTurnKey, "1:2:bot_1");
  });

  it("pending play cancels on hand change", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 4, turnPlayerId: "bot_1" },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    const next = schedule.armPlayThink({
      ctx: { handNumber: 2, trickNumber: 1, turnPlayerId: "bot_1" },
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
