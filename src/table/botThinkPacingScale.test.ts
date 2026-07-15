import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANTE_CHIP_STAGGER_MS,
  ANTE_CHIP_TRAVEL_MS,
  antePresentationScheduleMs,
} from "./handPresentationTiming";
import {
  buildTurnCountdownState,
  TURN_COUNTDOWN_MS,
} from "./turnCountdown";

const BASE_PLAY_MIN_MS = 250;
const BASE_PLAY_MAX_MS = 700;
const BASE_LAST_CARD_MAX_MS = 300;
const BASE_ANTE_STAGGER_MS = 80;

describe("bot think pacing scale (3×)", () => {
  it("exports tripled play delay constants from bot-play-delay bundle", async () => {
    const mod = await import("../../docs/bot-play-delay.js");
    assert.equal(mod.BOT_THINK_PACING_MULTIPLIER, 3);
    assert.equal(mod.BOT_PLAY_DELAY_MIN_MS, BASE_PLAY_MIN_MS * 3);
    assert.equal(mod.BOT_PLAY_DELAY_MAX_MS, BASE_PLAY_MAX_MS * 3);
    assert.equal(mod.BOT_PLAY_LAST_CARD_MIN_MS, 100 * 3);
    assert.equal(mod.BOT_PLAY_LAST_CARD_MAX_MS, BASE_LAST_CARD_MAX_MS * 3);
    assert.equal(mod.BOT_ADVANCE_DEBOUNCE_MS, 150);
  });

  it("arms approximately 3× play think before bot action", async () => {
    const { createBotThinkScheduleState, BOT_PLAY_DELAY_MIN_MS } = await import(
      "../../docs/bot-play-delay.js"
    );
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    const armed = schedule.armPlayThink({
      ctx: { handNumber: 1, trickNumber: 1, turnPlayerId: "bot_1", remainingHandCount: 3 },
      nowMs: 0,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.equal(armed.chosenDelayMs, BOT_PLAY_DELAY_MIN_MS);
    assert.equal(armed.delayMs, BASE_PLAY_MIN_MS * 3);
  });

  it("keeps ring countdown active through the longer think window", () => {
    const started = 1_000_000;
    const thinkMs = BASE_PLAY_MIN_MS * 3;
    const early = buildTurnCountdownState("bot_1", started, started + 400);
    const late = buildTurnCountdownState("bot_1", started, started + thinkMs - 200);
    assert.ok(early);
    assert.ok(late);
    assert.ok(early!.progress > late!.progress);
    assert.ok(early!.remainingMs > TURN_COUNTDOWN_MS - 500);
  });

  it("triples ante seat stagger before coin fly-in", () => {
    assert.equal(ANTE_CHIP_STAGGER_MS, BASE_ANTE_STAGGER_MS * 3);
    const fourSeats = antePresentationScheduleMs(4, false);
    const formerFourSeats = ANTE_CHIP_TRAVEL_MS * 4;
    assert.ok(fourSeats > formerFourSeats * 0.9);
    assert.equal(fourSeats, ANTE_CHIP_STAGGER_MS * 3 + ANTE_CHIP_TRAVEL_MS);
  });
});
