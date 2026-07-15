import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { buildAnteCoinDelayPlan, clearAntePlanCacheForTests } from "../session/botActionTiming";
import { buildAntePresentationSchedule } from "./antePresentationSchedule";
import {
  clearAntePresentationTimeline,
  registerAntePresentationTimeline,
} from "./presentationMotionBusy";
import {
  TURN_COUNTDOWN_MS,
  buildTurnCountdownState,
  resolveAntePresentationActorId,
  resolveTurnCountdownActiveActorId,
} from "./turnCountdown";

describe("turnCountdown ante integration", () => {
  const playerIds = ["p-dealer", "p-next"];
  const presentationKey = "session:3:ante";

  beforeEach(() => {
    clearAntePlanCacheForTests();
    clearAntePresentationTimeline();
  });

  it("ante ring uses buildTurnCountdownState (15s) not a variable-duration path", () => {
    const started = 1_000_000;
    const state = buildTurnCountdownState(playerIds[0]!, started, started + 2_500);
    assert.ok(state);
    assert.equal(state!.remainingMs, TURN_COUNTDOWN_MS - 2_500);
    assert.equal(state!.segment, "green");
    assert.ok(Math.abs(state!.progress - (TURN_COUNTDOWN_MS - 2_500) / TURN_COUNTDOWN_MS) < 0.01);
  });

  it("resolveTurnCountdownActiveActorId prefers ante posting seat during ante", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 3,
      playerIds,
      reducedMotion: false,
      rng: () => 0.5,
    });
    const schedule = buildAntePresentationSchedule(plan, false);
    const midThink = schedule[0]!.thinkStartSec + schedule[0]!.thinkDurationSec / 2;
    registerAntePresentationTimeline(presentationKey, () => midThink);

    const actor = resolveTurnCountdownActiveActorId({
      session: {
        phase: "draw",
        turnPlayerId: "someone-else",
        participantIds: playerIds,
        tricksByPlayer: {},
        handNumber: 3,
      },
      suppressTurn: true,
      handComplete: false,
      ante: {
        anteAnimActive: true,
        presentationKey,
        handNumber: 3,
        playerIds,
        reducedMotion: false,
        pacingMode: "apeSpeed",
      },
    });
    assert.equal(actor, playerIds[0]);
  });

  it("resolveAntePresentationActorId clears between seat think windows", () => {
    const plan = buildAnteCoinDelayPlan({
      handNumber: 4,
      playerIds,
      reducedMotion: false,
      rng: () => 0.5,
    });
    const schedule = buildAntePresentationSchedule(plan, false);
    const duringTravel =
      schedule[0]!.coinSpawnSec + schedule[0]!.travelSec * 0.5;
    registerAntePresentationTimeline(presentationKey, () => duringTravel);

    const actor = resolveAntePresentationActorId({
      anteAnimActive: true,
      presentationKey,
      handNumber: 4,
      playerIds,
      reducedMotion: false,
      pacingMode: "apeSpeed",
    });
    assert.equal(actor, null);
  });

  it("draw/play actor resolution is unchanged when ante is inactive", () => {
    const actor = resolveTurnCountdownActiveActorId({
      session: {
        phase: "play",
        turnPlayerId: "p-next",
        participantIds: playerIds,
        tricksByPlayer: {},
        handNumber: 1,
      },
      suppressTurn: false,
      handComplete: false,
      ante: null,
    });
    assert.equal(actor, "p-next");
  });
});
