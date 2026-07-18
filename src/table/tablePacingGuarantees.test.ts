import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOT_PLAY_DELAY_MAX_MS,
  BOT_PLAY_DELAY_MIN_MS,
  createBotPlayDelayState,
  createBotThinkScheduleState,
  pickBotPlayDelayMs,
} from "../../docs/bot-play-delay.js";
import { suppressesTurnIndicator, trickResolutionScheduleMs } from "./trickTiming";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  reduceTrickPresentation,
} from "./trickPresentationMachine";
import {
  CARD_LAND_MS,
  CARD_REVEAL_STAGGER_MS,
  NEXT_LEAD_GAP_MS,
  POST_TRICK_READ_MS,
  TRICK_CARD_TRAVEL_MS,
  TRICK_SWEEP_MS,
  WINNER_REVEAL_MS,
} from "./trickTiming";

describe("table pacing guarantees", () => {
  it("assigns each bot turn a stable random delay between 1500 and 3000 ms", () => {
    const min = pickBotPlayDelayMs(() => 0);
    const max = pickBotPlayDelayMs(() => 0.999999);
    assert.equal(min.chosenDelayMs, BOT_PLAY_DELAY_MIN_MS);
    assert.equal(max.chosenDelayMs, BOT_PLAY_DELAY_MAX_MS);

    const state = createBotPlayDelayState({ rng: () => 0.42 });
    const first = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_1",
      nowMs: 0,
    });
    const retry = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 2,
      turnPlayerId: "bot_1",
      nowMs: 400,
    });
    assert.equal(retry.chosenDelayMs, first.chosenDelayMs);
    assert.ok(first.chosenDelayMs >= 1500 && first.chosenDelayMs <= 3000);
  });

  it("does not shorten the chosen bot delay on rerender", () => {
    const state = createBotPlayDelayState({ rng: () => 0.5 });
    const first = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_a",
      nowMs: 0,
    });
    const rerender = state.resolvePlayDelayMs({
      handNumber: 1,
      trickNumber: 1,
      turnPlayerId: "bot_a",
      nowMs: 800,
    });
    assert.equal(rerender.chosenDelayMs, first.chosenDelayMs);
    assert.equal(rerender.delayMs, Math.max(0, first.chosenDelayMs - 800));
  });

  it("blocks bot submit until the visible ring minimum expires", async () => {
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
    await new Promise((r) => setTimeout(r, BOT_PLAY_DELAY_MIN_MS - 80));
    assert.equal(fired, false);
    await new Promise((r) => setTimeout(r, 120));
    assert.equal(fired, true);
  });

  it("keeps all trick cards visible through trickComplete before winner reveal", () => {
    const trick = {
      trickNumber: 1,
      leadPlayerId: "p1",
      leadSuit: "hearts",
      plays: [
        { playerId: "p1", card: { rank: "A", suit: "hearts" } },
        { playerId: "p2", card: { rank: "K", suit: "hearts" } },
      ],
    };
    let store = createTrickPresentationStore({ p1: 0, p2: 0 }, trick);
    for (let i = 0; i < 2; i++) {
      store = reduceTrickPresentation(store, { type: "revealNextCard" });
    }
    store = reduceTrickPresentation(store, {
      type: "serverUpdate",
      snapshot: { currentTrick: null, tricksByPlayer: { p1: 1 } },
      participantIds: ["p1", "p2"],
    });
    store = reduceTrickPresentation(store, { type: "commitTrickResolution" });
    assert.equal(store.phase, "trickComplete");
    const model = buildTrickPresentationModel(store, null);
    assert.equal(model.displayPlays.length, 2);
    assert.equal(model.showWinnerTag, false);
  });

  it("schedules winner read after post-trick hold and before sweep", () => {
    const schedule = trickResolutionScheduleMs({});
    assert.ok(schedule.readBeforeWinnerMs >= 900 && schedule.readBeforeWinnerMs <= 1300);
    assert.ok(schedule.winnerRevealMs >= 500 && schedule.winnerRevealMs <= 800);
    assert.ok(schedule.sweepMs >= 300 && schedule.sweepMs <= 500);
    assert.equal(schedule.readBeforeWinnerMs, POST_TRICK_READ_MS);
    assert.equal(schedule.winnerRevealMs, WINNER_REVEAL_MS);
    assert.equal(schedule.readTotalMs, POST_TRICK_READ_MS + WINNER_REVEAL_MS);
  });

  it("returns next actor ring only after winner read and sweep complete", () => {
    assert.equal(suppressesTurnIndicator("trickComplete"), true);
    assert.equal(suppressesTurnIndicator("winnerReveal"), true);
    assert.equal(suppressesTurnIndicator("collectTrick"), true);
    assert.equal(suppressesTurnIndicator("nextLeadReady"), false);
    assert.equal(suppressesTurnIndicator("live"), false);
    assert.ok(NEXT_LEAD_GAP_MS >= 400 && NEXT_LEAD_GAP_MS <= 600);
  });

  it("keeps live card travel and inter-player spacing readable", () => {
    assert.ok(TRICK_CARD_TRAVEL_MS >= 450 && TRICK_CARD_TRAVEL_MS <= 600);
    assert.ok(CARD_REVEAL_STAGGER_MS >= 350 && CARD_REVEAL_STAGGER_MS <= 550);
    assert.ok(CARD_LAND_MS >= 550 && CARD_LAND_MS <= 720);
    assert.equal(TRICK_SWEEP_MS, 400);
  });
});
