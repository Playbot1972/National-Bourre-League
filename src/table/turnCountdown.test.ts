import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TURN_COUNTDOWN_MS,
  buildTurnCountdownState,
  resolveTableActiveActorId,
  turnCountdownActivityKey,
  turnCountdownSegment,
} from "./turnCountdown";
import { HAND_FLOW_PHASE } from "../session/handPhaseMachine";

describe("turnCountdown", () => {
  it("segments green, yellow, and red at the correct remaining thresholds", () => {
    assert.equal(turnCountdownSegment(15_000), "green");
    assert.equal(turnCountdownSegment(10_001), "green");
    assert.equal(turnCountdownSegment(10_000), "yellow");
    assert.equal(turnCountdownSegment(5_001), "yellow");
    assert.equal(turnCountdownSegment(5_000), "red");
    assert.equal(turnCountdownSegment(1), "red");
  });

  it("builds countdown state from a start timestamp", () => {
    const started = 1_000_000;
    const state = buildTurnCountdownState("p1", started, started + 2_000);
    assert.ok(state);
    assert.equal(state!.playerId, "p1");
    assert.equal(state!.segment, "green");
    assert.ok(state!.progress > 0.85);

    const late = buildTurnCountdownState("p1", started, started + 12_000);
    assert.ok(late);
    assert.equal(late!.segment, "red");
    assert.ok(late!.remainingMs <= 3_500);
  });

  it("expires after the full duration then cycles to a new green segment", () => {
    const started = 0;
    const nearEnd = buildTurnCountdownState("p1", started, TURN_COUNTDOWN_MS - 1);
    assert.ok(nearEnd);
    assert.equal(nearEnd!.segment, "red");

    const nextCycle = buildTurnCountdownState("p1", started, TURN_COUNTDOWN_MS);
    assert.ok(nextCycle);
    assert.equal(nextCycle!.segment, "green");
    assert.ok(nextCycle!.remainingMs > TURN_COUNTDOWN_MS - 500);
  });

  it("resolves active actor during play from turnPlayerId", () => {
    const id = resolveTableActiveActorId({
      session: {
        phase: "play",
        turnPlayerId: "p2",
        participantIds: ["p1", "p2"],
        tricksByPlayer: { p1: 1, p2: 0 },
        handNumber: 3,
      },
      suppressTurn: false,
      handComplete: false,
    });
    assert.equal(id, "p2");
  });

  it("clears active actor when turn is suppressed", () => {
    assert.equal(
      resolveTableActiveActorId({
        session: {
          phase: "play",
          turnPlayerId: "p2",
          participantIds: ["p1", "p2"],
          tricksByPlayer: {},
          handNumber: 1,
        },
        suppressTurn: true,
        handComplete: false,
      }),
      null,
    );
  });

  it("activity key changes when turn ownership changes", () => {
    const base = {
      session: {
        phase: "play",
        turnPlayerId: "p1",
        participantIds: ["p1", "p2"],
        tricksByPlayer: {},
        handNumber: 1,
      },
      suppressTurn: false,
      handComplete: false,
    };
    const a = turnCountdownActivityKey({ ...base, activeActorId: "p1" });
    const b = turnCountdownActivityKey({
      ...base,
      session: { ...base.session, turnPlayerId: "p2" },
      activeActorId: "p2",
    });
    assert.notEqual(a, b);
  });

  it("resolves enrollment actor from handEnrollment index", () => {
    const id = resolveTableActiveActorId({
      session: {
        phase: null,
        turnPlayerId: null,
        participantIds: [],
        tricksByPlayer: {},
        handNumber: 1,
        handEnrollment: {
          active: true,
          orderedPlayerIds: ["p1", "p2"],
          currentIndex: 1,
          turnDeadlineMs: Date.now() + 12_000,
        },
      },
      suppressTurn: false,
      handComplete: false,
    });
    assert.equal(id, "p2");
  });

  it("resolves Pagat decision actor from handDecision", () => {
    const id = resolveTableActiveActorId({
      session: {
        phase: "decision",
        turnPlayerId: null,
        participantIds: ["p1", "p2"],
        tricksByPlayer: {},
        handNumber: 1,
        handDecision: {
          active: true,
          orderedPlayerIds: ["p1", "p2"],
          currentIndex: 1,
        },
      },
      suppressTurn: false,
      handComplete: false,
    });
    assert.equal(id, "p2");
  });

  it("does not resolve actor outside actionable phases", () => {
    const id = resolveTableActiveActorId({
      session: {
        phase: "reveal",
        turnPlayerId: "p1",
        participantIds: ["p1"],
        tricksByPlayer: {},
        handNumber: 1,
      },
      suppressTurn: false,
      handComplete: false,
    });
    assert.equal(id, null);
    void HAND_FLOW_PHASE;
  });

  it("keeps actor during trick-5 play when handComplete is latched", () => {
    const id = resolveTableActiveActorId({
      session: {
        phase: "play",
        turnPlayerId: "p2",
        participantIds: ["p1", "p2"],
        tricksByPlayer: { p1: 3, p2: 2 },
        handNumber: 4,
      },
      suppressTurn: false,
      handComplete: true,
    });
    assert.equal(id, "p2");
  });
});
