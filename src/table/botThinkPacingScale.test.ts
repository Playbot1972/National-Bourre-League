import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANTE_CHIP_TRAVEL_MS,
  ANTE_MIN_THINK_MS,
  ANTE_SEAT_INTERVAL_MS,
  antePresentationScheduleMs,
  anteSeatCoinDelayMs,
} from "./handPresentationTiming";
import {
  buildTurnCountdownState,
  TURN_COUNTDOWN_MS,
} from "./turnCountdown";

const MIN_VISIBLE_THINK_MS = 3000;

describe("bot min visible think (3s floor)", () => {
  it("exports 3000ms minimum from bot-play-delay bundle", async () => {
    const mod = await import("../../docs/bot-play-delay.js");
    assert.equal(mod.BOT_MIN_VISIBLE_THINK_MS, MIN_VISIBLE_THINK_MS);
  });

  it("clamps normal and last-card play delays to at least 3000ms", async () => {
    const { pickBotPlayDelayMs, BOT_MIN_VISIBLE_THINK_MS } = await import(
      "../../docs/bot-play-delay.js"
    );
    assert.equal(BOT_MIN_VISIBLE_THINK_MS, MIN_VISIBLE_THINK_MS);

    const normal = pickBotPlayDelayMs(3, () => 0);
    assert.equal(normal.isLastCard, false);
    assert.ok(normal.chosenDelayMs >= MIN_VISIBLE_THINK_MS);

    const lastCard = pickBotPlayDelayMs(1, () => 0.99);
    assert.equal(lastCard.isLastCard, true);
    assert.ok(lastCard.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
  });

  it("arms play think for at least 3000ms before bot action", async () => {
    const { createBotThinkScheduleState } = await import("../../docs/bot-play-delay.js");
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const armed = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 3 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.ok(armed.chosenDelayMs >= MIN_VISIBLE_THINK_MS);
    assert.equal(armed.delayMs, armed.chosenDelayMs);
  });

  it("keeps ring countdown active through the full 3s think window", () => {
    const started = 1_000_000;
    const early = buildTurnCountdownState("bot_1", started, started + 400);
    const mid = buildTurnCountdownState("bot_1", started, started + MIN_VISIBLE_THINK_MS - 500);
    const late = buildTurnCountdownState("bot_1", started, started + MIN_VISIBLE_THINK_MS - 50);
    assert.ok(early);
    assert.ok(mid);
    assert.ok(late);
    assert.ok(early!.progress > mid!.progress);
    assert.ok(mid!.progress > late!.progress);
    assert.ok(late!.remainingMs > TURN_COUNTDOWN_MS - MIN_VISIBLE_THINK_MS);
  });

  it("ante seat 0 waits at least 3000ms before coin fly-in", () => {
    assert.equal(ANTE_MIN_THINK_MS, MIN_VISIBLE_THINK_MS);
    assert.equal(anteSeatCoinDelayMs(0), MIN_VISIBLE_THINK_MS);
    assert.equal(ANTE_SEAT_INTERVAL_MS, MIN_VISIBLE_THINK_MS + ANTE_CHIP_TRAVEL_MS);
  });

  it("ante pacing sequences one seat at a time with shared 3s think floor", () => {
    const seat0 = anteSeatCoinDelayMs(0);
    const seat1 = anteSeatCoinDelayMs(1);
    const seat2 = anteSeatCoinDelayMs(2);
    assert.equal(seat0, MIN_VISIBLE_THINK_MS);
    assert.equal(seat1, MIN_VISIBLE_THINK_MS + ANTE_SEAT_INTERVAL_MS);
    assert.equal(seat2, MIN_VISIBLE_THINK_MS + ANTE_SEAT_INTERVAL_MS * 2);

    const fourSeats = antePresentationScheduleMs(4, false);
    assert.equal(fourSeats, anteSeatCoinDelayMs(3) + ANTE_CHIP_TRAVEL_MS);
    assert.ok(fourSeats >= MIN_VISIBLE_THINK_MS * 4);
  });

  it("does not alter bot decision exports", async () => {
    const mod = await import("../../docs/bot-play-delay.js");
    assert.equal(typeof mod.pickBotPlayDelayMs, "function");
    assert.equal(typeof mod.createBotPlayDelayState, "function");
    assert.equal(typeof mod.resolveBotAdvanceDelayMs, "function");
    assert.equal(mod.BOT_ADVANCE_DEBOUNCE_MS, 150);
    assert.equal(mod.BOT_THINK_PACING_MULTIPLIER, 3);
  });
});
