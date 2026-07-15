import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  BOT_PLAY_DELAY_MIN_MS,
  clearAntePlanCacheForTests,
  createBotThinkScheduleState,
} from "../session/botActionTiming";
import { buildAntePresentationSchedule, resolveAnteThinkAtTimelineSec } from "./antePresentationSchedule";
import { resolveAnteCoinDelayPlan } from "./handPacingMode";
import {
  buildTurnCountdownState,
  resolveAntePresentationActorId,
  resolveTurnCountdownActiveActorId,
} from "./turnCountdown";
import {
  clearAntePresentationTimeline,
  registerAntePresentationTimeline,
} from "./presentationMotionBusy";

describe("bot visible think pacing", () => {
  const playerIds = ["bot_a", "bot_b"];

  beforeEach(() => {
    clearAntePlanCacheForTests();
    clearAntePresentationTimeline();
  });

  it("play think arms a full delay after presentation clears (ring before card play)", () => {
    const schedule = createBotThinkScheduleState({ rng: () => 0 });
    schedule.playDelayState.markTurnEligible({
      handNumber: 2,
      trickNumber: 1,
      turnPlayerId: "bot_a",
      nowMs: 0,
    });
    const armed = schedule.armPlayThink({
      ctx: { handNumber: 2, trickNumber: 1, turnPlayerId: "bot_a", remainingHandCount: 3 },
      nowMs: 5_000,
      shouldFire: () => true,
      onFire: () => {},
    });
    assert.equal(armed.action, "armed");
    assert.equal(armed.delayMs, BOT_PLAY_DELAY_MIN_MS);
  });

  it("classic ante first seat has ring time before coin spawn", () => {
    const plan = resolveAnteCoinDelayPlan(3, playerIds, false, "classic");
    assert.ok((plan.thinkBeforeMs[0] ?? 0) >= BOT_PLAY_DELAY_MIN_MS);
    const schedule = buildAntePresentationSchedule(plan, false);
    const first = schedule[0]!;
    assert.ok(first.thinkDurationSec > 0);
    assert.ok(first.coinSpawnSec >= first.thinkDurationSec);

    const midThink = first.thinkStartSec + first.thinkDurationSec / 2;
    registerAntePresentationTimeline("session:3:ante", () => midThink);
    const actor = resolveAntePresentationActorId({
      anteAnimActive: true,
      presentationKey: "session:3:ante",
      handNumber: 3,
      playerIds,
      reducedMotion: false,
      pacingMode: "classic",
    });
    assert.equal(actor, playerIds[0]);
  });

  it("ante ring spins during think and clears before coin travel", () => {
    const plan = resolveAnteCoinDelayPlan(4, playerIds, false, "apeSpeed");
    const schedule = buildAntePresentationSchedule(plan, false);
    const first = schedule[0]!;
    const started = 1_000_000;
    const thinkMid = started + (first.thinkDurationSec * 1000) / 2;
    const duringTravel = started + first.coinSpawnSec * 1000 + 50;

    registerAntePresentationTimeline("session:4:ante", () => first.thinkDurationSec / 2);
    const actorDuringThink = resolveTurnCountdownActiveActorId({
      session: {
        phase: "reveal",
        turnPlayerId: "someone-else",
        participantIds: playerIds,
        tricksByPlayer: {},
        handNumber: 4,
      },
      suppressTurn: false,
      handComplete: false,
      ante: {
        anteAnimActive: true,
        presentationKey: "session:4:ante",
        handNumber: 4,
        playerIds,
        reducedMotion: false,
        pacingMode: "apeSpeed",
      },
    });
    assert.equal(actorDuringThink, playerIds[0]);

    const ring = buildTurnCountdownState(playerIds[0]!, started, thinkMid);
    const laterRing = buildTurnCountdownState(playerIds[0]!, started, thinkMid + 400);
    assert.ok(ring);
    assert.ok(laterRing);
    assert.ok(ring!.progress > laterRing!.progress);

    registerAntePresentationTimeline("session:4:ante", () => first.coinSpawnSec + 0.05);
    assert.equal(
      resolveAnteThinkAtTimelineSec(first.coinSpawnSec + 0.05, schedule),
      null,
    );
    void duringTravel;
  });
});
