import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createMicroPrevSnapshot,
  diffMicrointeractions,
  type MicroTrackInput,
} from "./tableMicrointeractions";

const base = (): MicroTrackInput => ({
  turnPlayerId: "p1",
  dealerId: "p1",
  potAmount: 10,
  tricksByPlayer: { p1: 0, p2: 0 },
  phase: "play",
  showTrumpSuitReminder: false,
  suppressTurn: false,
  actionFeedbackStatus: "idle",
  trickWinnerSeatId: null,
  trickPhase: "live",
});

describe("tableMicrointeractions", () => {
  it("detects turn handoff during play", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, { ...base(), turnPlayerId: "p2" });
    assert.equal(diff.turnHandoffPlayerId, "p2");
  });

  it("skips turn handoff when suppressed", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, {
      ...base(),
      turnPlayerId: "p2",
      suppressTurn: true,
    });
    assert.equal(diff.turnHandoffPlayerId, null);
  });

  it("detects dealer rotation", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, { ...base(), dealerId: "p2" });
    assert.equal(diff.dealerMovedPlayerId, "p2");
  });

  it("detects pot tick on amount change", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, { ...base(), potAmount: 15 });
    assert.equal(diff.potTick, true);
  });

  it("detects trick badge increments per player", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, {
      ...base(),
      tricksByPlayer: { p1: 1, p2: 0 },
    });
    assert.deepEqual(diff.trickBadgeIncrements, { p1: 1 });
  });

  it("detects trump reminder pulse when reminder appears", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, {
      ...base(),
      showTrumpSuitReminder: true,
    });
    assert.equal(diff.trumpReminderPulse, true);
  });

  it("detects feedback error pulse on transition to error", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, {
      ...base(),
      actionFeedbackStatus: "error",
    });
    assert.equal(diff.feedbackErrorPulse, true);
  });

  it("detects winner flash on winner reveal", () => {
    const prev = createMicroPrevSnapshot(base());
    const diff = diffMicrointeractions(prev, {
      ...base(),
      trickWinnerSeatId: "p2",
      trickPhase: "winnerReveal",
    });
    assert.equal(diff.winnerFlashPlayerId, "p2");
  });

  it("returns empty diff on first snapshot", () => {
    const diff = diffMicrointeractions(null, base());
    assert.equal(diff.turnHandoffPlayerId, null);
    assert.equal(diff.potTick, false);
  });
});
