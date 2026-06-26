/**
 * Hand/session invariant regression tests.
 */
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  HAND_FLOW_PHASE,
  buildHandFlowSnapshot,
} from "./handPhaseMachine";
import {
  HandInvariantError,
  assertConsistentHandFlowPhase,
  assertHandFlowTransition,
  assertHandActionAllowed,
  assertSettlementEntryAllowed,
  assertSessionChipConserved,
  assertBotAdvanceNotInFlight,
} from "./handInvariants";
import { forceInvariantsForTests } from "./invariantDebug";

describe("hand invariants", () => {
  let restoreStrict: (() => void) | undefined;

  before(() => {
    restoreStrict = forceInvariantsForTests(true);
  });

  after(() => {
    restoreStrict?.();
  });

  it("assertConsistentHandFlowPhase rejects play card-phase with enrollment flow phase", () => {
    const snapshot = buildHandFlowSnapshot({
      session: {
        currentHand: {
          phase: "play",
          participantIds: ["a", "b"],
          tricksByPlayer: { a: 0, b: 0 },
          turnPlayerId: "a",
        },
      },
    });
    assert.equal(snapshot.phase, HAND_FLOW_PHASE.PLAY);
    assert.doesNotThrow(() => assertConsistentHandFlowPhase(snapshot));

    assert.throws(
      () =>
        assertConsistentHandFlowPhase({
          ...snapshot,
          phase: HAND_FLOW_PHASE.ENROLLMENT,
        }),
      HandInvariantError,
    );
  });

  it("assertHandFlowTransition blocks play_card from waiting", () => {
    assert.throws(
      () => assertHandFlowTransition(HAND_FLOW_PHASE.WAITING, "play_card"),
      (err: unknown) =>
        err instanceof HandInvariantError && err.code === "illegal_transition",
    );
  });

  it("assertHandFlowTransition allows play_card during play", () => {
    assert.doesNotThrow(() =>
      assertHandFlowTransition(HAND_FLOW_PHASE.PLAY, "play_card"),
    );
  });

  it("assertSettlementEntryAllowed blocks win before hand complete", () => {
    const session = {
      currentHand: {
        phase: "play",
        participantIds: ["a", "b"],
        tricksByPlayer: { a: 2, b: 1 },
        turnPlayerId: "a",
      },
    };
    assert.throws(
      () => assertSettlementEntryAllowed(session, { settlement: "win" }),
      (err: unknown) =>
        err instanceof HandInvariantError &&
        err.code === "settlement_before_play_complete",
    );
  });

  it("assertSettlementEntryAllowed allows push before hand complete", () => {
    const session = {
      currentHand: {
        phase: "play",
        participantIds: ["a", "b"],
        tricksByPlayer: { a: 2, b: 2 },
        turnPlayerId: "a",
      },
    };
    assert.doesNotThrow(() =>
      assertSettlementEntryAllowed(session, { settlement: "push" }),
    );
  });

  it("assertHandActionAllowed blocks play_card when not your turn", () => {
    const session = {
      currentHand: {
        phase: "play",
        participantIds: ["a", "b"],
        tricksByPlayer: { a: 0, b: 0 },
        turnPlayerId: "b",
      },
    };
    assert.throws(
      () => assertHandActionAllowed(session, "play_card", "a", "a"),
      (err: unknown) =>
        err instanceof HandInvariantError && err.code === "action_blocked",
    );
  });

  it("assertSessionChipConserved throws in strict mode on drift", () => {
    assert.throws(
      () => assertSessionChipConserved(100, 99, { ctx: "test" }),
      (err: unknown) =>
        err instanceof HandInvariantError && err.code === "chip_total_drift",
    );
  });

  it("assertBotAdvanceNotInFlight throws in strict mode on duplicate execute", () => {
    assert.throws(
      () => assertBotAdvanceNotInFlight(true, { source: "test" }),
      (err: unknown) =>
        err instanceof HandInvariantError && err.code === "duplicate_bot_advance",
    );
  });
});
