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

function showVisibleRing(schedule, ctx, nowMs = 0) {
  schedule.playDelayState.notifyVisibleRingShown({
    turnKey: botPlayTurnKey(ctx),
    playerId: ctx.turnPlayerId,
    nowMs,
  });
}

function armWithVisibleRing(schedule, input) {
  const result = schedule.armPlayThink(input);
  showVisibleRing(schedule, input.ctx, input.nowMs ?? Date.now());
  return result;
}

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
    const ctx = { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" };
    const first = state.resolvePlayDelayMs({ ...ctx, nowMs: 10_000 });
    state.notifyVisibleRingShown({
      turnKey: botPlayTurnKey(ctx),
      playerId: "bot_1",
      nowMs: 10_000,
    });
    const retry = state.resolvePlayDelayMs({ ...ctx, nowMs: 10_500 });
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
    const ctx = { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_x" };
    const first = state.resolvePlayDelayMs({ ...ctx, nowMs: 0 });
    state.notifyVisibleRingShown({
      turnKey: botPlayTurnKey(ctx),
      playerId: "bot_x",
      nowMs: 0,
    });
    const rerender = state.resolvePlayDelayMs({ ...ctx, nowMs: 100 });
    assert.equal(rerender.chosenDelayMs, first.chosenDelayMs);
    assert.equal(rerender.delayMs, Math.max(0, first.chosenDelayMs - 100));
    assert.ok(rerender.delayMs < first.delayMs);
  });

  it("credits elapsed visible ring time against the chosen delay", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    const ctx = { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_x" };
    const chosen = BOT_PLAY_DELAY_MIN_MS;
    const at = state.resolvePlayDelayMs({ ...ctx, nowMs: 0 });
    assert.equal(at.chosenDelayMs, chosen);
    assert.equal(at.delayMs, chosen);
    state.notifyVisibleRingShown({
      turnKey: botPlayTurnKey(ctx),
      playerId: "bot_x",
      nowMs: 0,
    });

    const laterRetry = state.resolvePlayDelayMs({
      ...ctx,
      nowMs: chosen - 50,
    });
    assert.equal(laterRetry.delayMs, 50);
  });

  it("does not consume think delay before the visible ring is shown", () => {
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
    assert.equal(armed.visibleMinimumMet, false);
  });

  it("credits elapsed time only after the visible ring is shown", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    state.prepareTurn({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    state.notifyVisibleRingShown({
      turnKey: "1:1:bot_1",
      playerId: "bot_1",
      nowMs: 0,
    });
    const afterPresentation = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: BOT_PLAY_DELAY_MIN_MS + 200,
    });
    assert.equal(afterPresentation.delayMs, 0);
    assert.equal(afterPresentation.visibleMinimumMet, true);
  });

  it("rejects stale visible ring turn keys", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    state.prepareTurn({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    const accepted = state.notifyVisibleRingShown({
      turnKey: "1:2:bot_1",
      playerId: "bot_1",
      nowMs: 0,
    });
    assert.equal(accepted, false);
    const status = state.getVisibleRingStatus({ turnKey: "1:1:bot_1", nowMs: 500 });
    assert.equal(status.visibleRingStartAtMs, null);
  });

  it("resets visible ring elapsed time only on durable turn exit", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    state.prepareTurn({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    state.notifyVisibleRingShown({
      turnKey: "1:1:bot_1",
      playerId: "bot_1",
      nowMs: 0,
    });
    state.notifyVisibleRingHidden({
      turnKey: "1:1:bot_1",
      reason: "turn_exit",
      nowMs: 500,
    });
    const status = state.getVisibleRingStatus({ turnKey: "1:1:bot_1", nowMs: 1000 });
    assert.equal(status.visibleRingElapsedMs, 0);
    assert.equal(status.visibleMinimumMet, false);
  });

  it("ignores transient ring_cleanup and presentation_busy resets", () => {
    const state = createBotPlayDelayState({ rng: () => 0 });
    state.prepareTurn({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    state.notifyVisibleRingShown({
      turnKey: "1:1:bot_1",
      playerId: "bot_1",
      nowMs: 0,
    });
    assert.equal(
      state.notifyVisibleRingHidden({
        turnKey: "1:1:bot_1",
        reason: "ring_cleanup",
        nowMs: 200,
      }),
      false,
    );
    assert.equal(
      state.notifyVisibleRingHidden({
        turnKey: "1:1:bot_1",
        reason: "not_bot_turn",
        nowMs: 300,
      }),
      false,
    );
    assert.equal(
      state.notifyVisibleRingHidden({
        turnKey: "1:1:bot_1",
        reason: "presentation_busy",
        nowMs: 400,
      }),
      false,
    );
    const status = state.getVisibleRingStatus({ turnKey: "1:1:bot_1", nowMs: 800 });
    assert.equal(status.visibleRingStartAtMs, 0);
    assert.equal(status.visibleRingElapsedMs, 800);
    assert.equal(status.visibleMinimumMet, false);
  });

  it("publishes one stable think window per eligible turn", () => {
    const windows = [];
    setBotThinkWindowPublisher((window) => {
      if (window) windows.push(window);
    });
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    state.prepareTurn({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 100,
    });
    state.notifyVisibleRingShown({
      turnKey: "1:1:bot_1",
      playerId: "bot_1",
      nowMs: 100,
    });
    const afterVisible = windows.length;
    state.markTurnEligible({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_1",
      nowMs: 200,
    });
    assert.ok(afterVisible >= 1);
    assert.equal(windows.length, afterVisible);
    assert.equal(windows[windows.length - 1]?.playerId, "bot_1");
    assert.ok(windows[windows.length - 1]?.totalMs >= BOT_PLAY_DELAY_MIN_MS);
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
    const armed = armWithVisibleRing(schedule, {
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: Date.now(),
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.equal(armed.isLastCard, false);
    assert.ok(armed.chosenDelayMs >= BOT_PLAY_DELAY_MIN_MS);
    assert.ok(armed.chosenDelayMs <= BOT_PLAY_DELAY_MAX_MS);
  });

  it("submit never fires before 1500 ms of visible ring", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const startedAt = Date.now();
    let fired = false;
    armWithVisibleRing(schedule, {
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: startedAt,
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

  it("submit fires by 3000 ms when visible ring eligible and unblocked", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0.999999 });
    let fired = false;
    const startedAt = Date.now();
    armWithVisibleRing(schedule, {
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_2" },
      nowMs: startedAt,
      shouldFire: () => true,
      onFire: () => {
        fired = true;
      },
    });
    const started = startedAt;
    const deadline = Date.now() + BOT_PLAY_DELAY_MAX_MS + 100;
    while (!fired && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 25));
    }
    assert.equal(fired, true);
    assert.ok(Date.now() - started <= BOT_PLAY_DELAY_MAX_MS + 150);
  });

  it("does not fire before visible ring is shown", async () => {
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
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS + 50));
    assert.equal(fired, false);
    showVisibleRing(schedule, { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" }, Date.now());
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS + 50));
    assert.equal(fired, true);
  });

  it("coalesced rerender does not reset the armed timer", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const startedAt = Date.now();
    const first = armWithVisibleRing(schedule, {
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: startedAt,
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
    armWithVisibleRing(schedule, {
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" },
      nowMs: Date.now(),
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
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS + 100));
    assert.equal(fired, false);
    assert.equal(rejected, true);
  });

  it("does not reset visible ring on temporary presentation block", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const ctx = { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1" };
    const startedAt = Date.now();
    schedule.armPlayThink({
      ctx,
      nowMs: startedAt,
      shouldFire: () => true,
      onFire: () => {},
      getPresentationState: () => ({ blocked: true, presentationBusy: true }),
    });
    schedule.playDelayState.notifyVisibleRingShown({
      turnKey: botPlayTurnKey(ctx),
      playerId: ctx.turnPlayerId,
      nowMs: startedAt,
    });
    await new Promise((r) => setTimeout(r, 120));
    const status = schedule.playDelayState.getVisibleRingStatus({
      turnKey: botPlayTurnKey(ctx),
      nowMs: startedAt + 120,
    });
    assert.ok(status.visibleRingStartAtMs != null);
    assert.ok(status.visibleRingElapsedMs > 0);
  });

  it("fires after visible delay when presentation would be clear", async () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    let fired = false;
    armWithVisibleRing(schedule, {
      ctx: { handNumber: 1, trickNumber: 2, turnPlayerId: "bot_2" },
      nowMs: Date.now(),
      shouldFire: () => true,
      onFire: () => {
        fired = true;
      },
    });
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS + 100));
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
