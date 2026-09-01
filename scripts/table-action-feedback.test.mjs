import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatTableActionError,
  isBenignTableActionError,
  isInternalTableActionError,
  isStaleTableActionError,
  scrubRawInternalMessage,
  markSettlementLedgerBlocked,
  isSettlementLedgerBlocked,
  getSettlementLedgerBlockedEntry,
  settlementLedgerLatchKey,
  isSettlementLedgerLatchResolved,
  reconcileSettlementLedgerLatchFromSession,
  resetSettlementLedgerBlockedForTests,
  ledgerBlockedUserMessage,
  deriveSettlementLifecycleState,
  settlementBlockedFeedbackPayload,
  planRecoverHandoffResult,
  logSettlementLifecycleOnce,
  clearSettlementLifecycleLogs,
  SETTLEMENT_LIFECYCLE,
} from "../docs/table-action-feedback.js";

const ROOM_A = "room_a";
const ROOM_B = "room_b";
const SESSION_A = "session_a";
const SESSION_B = "session_b";

function mockFormatter(err, fallback) {
  const code = String(err?.code ?? "");
  const msg = String(err?.message ?? "").trim();
  if (code === "functions/internal" || msg.toLowerCase() === "internal") {
    return "The server could not finish that table action. Refresh the page and try again.";
  }
  return msg || fallback;
}

describe("table-action-feedback", () => {
  it("detects benign race errors that should not surface to players", () => {
    assert.equal(isBenignTableActionError(new Error("Decision step did not apply")), true);
    assert.equal(isBenignTableActionError(new Error("Not in reveal phase")), true);
    assert.equal(isBenignTableActionError(new Error("Draw already completed")), true);
    assert.equal(isBenignTableActionError(new Error("Not your turn to draw")), true);
    assert.equal(
      isBenignTableActionError({
        code: "functions/failed-precondition",
        message: "Decision step did not apply",
      }),
      true,
    );
    assert.equal(isBenignTableActionError(new Error("Not your turn")), false);
    assert.equal(isBenignTableActionError(new Error("Permission denied")), false);
  });

  it("scrubs raw INTERNAL messages", () => {
    assert.equal(
      scrubRawInternalMessage("INTERNAL"),
      "The server could not finish that table action. Refresh the page and try again.",
    );
    assert.equal(scrubRawInternalMessage("Not your turn"), "Not your turn");
  });

  it("formatTableActionError delegates to formatClientGameError", () => {
    const msg = formatTableActionError(
      { code: "functions/internal", message: "INTERNAL" },
      "Could not play card",
      mockFormatter,
    );
    assert.match(msg, /server could not finish/);
  });

  it("clears play error when turn advances", () => {
    assert.equal(
      isStaleTableActionError(
        { handNumber: 3, phase: "play", turnPlayerId: "human", actionKind: "play" },
        { handNumber: 3, phase: "play", turnPlayerId: "bot_1", handComplete: false },
      ),
      true,
    );
  });

  it("clears error when hand completes (fifth-trick settlement leak)", () => {
    assert.equal(
      isStaleTableActionError(
        { handNumber: 3, phase: "play", turnPlayerId: "human", actionKind: "play" },
        { handNumber: 3, phase: "play", turnPlayerId: "human", handComplete: true },
      ),
      true,
    );
  });

  it("clears error on phase change", () => {
    assert.equal(
      isStaleTableActionError(
        { handNumber: 3, phase: "draw", actionKind: "draw" },
        { handNumber: 3, phase: "play", handComplete: false },
      ),
      true,
    );
  });

  it("keeps current-turn play error visible", () => {
    assert.equal(
      isStaleTableActionError(
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          actionKind: "play",
          totalTricksPlayed: 0,
          currentTrickLen: 1,
        },
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          handComplete: false,
          totalTricksPlayed: 0,
          currentTrickLen: 1,
        },
      ),
      false,
    );
  });

  it("does not treat post-play error context as fresh when session unchanged", () => {
    const postPlay = {
      handNumber: 3,
      phase: "play",
      turnPlayerId: "bot_1",
      actionKind: "play",
      totalTricksPlayed: 0,
      currentTrickLen: 2,
    };
    assert.equal(
      isStaleTableActionError(postPlay, {
        handNumber: 3,
        phase: "play",
        turnPlayerId: "bot_1",
        handComplete: false,
        totalTricksPlayed: 0,
        currentTrickLen: 2,
      }),
      false,
    );
  });

  it("clears play error when trick progress advances (turn cycled back to same seat)", () => {
    assert.equal(
      isStaleTableActionError(
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          actionKind: "play",
          totalTricksPlayed: 1,
          currentTrickLen: 2,
        },
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          handComplete: false,
          totalTricksPlayed: 2,
          currentTrickLen: 0,
        },
      ),
      true,
    );
  });

  it("clears play error when current trick gains a card", () => {
    assert.equal(
      isStaleTableActionError(
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          actionKind: "play",
          totalTricksPlayed: 0,
          currentTrickLen: 1,
        },
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "bot_1",
          handComplete: false,
          totalTricksPlayed: 0,
          currentTrickLen: 2,
        },
      ),
      true,
    );
  });

  it("ledger-blocked errors are not benign", () => {
    assert.equal(
      isBenignTableActionError({
        code: "functions/failed-precondition",
        message: "Table ledger blocked",
        details: { code: "TABLE_CHIP_INVARIANT_MISMATCH" },
      }),
      false,
    );
    assert.equal(
      isBenignTableActionError({
        code: "functions/failed-precondition",
        message: "accounting review",
        details: { code: "POST_COMMIT_INVARIANT_DRIFT" },
      }),
      false,
    );
    assert.match(
      ledgerBlockedUserMessage("TABLE_CHIP_INVARIANT_MISMATCH"),
      /chip records do not reconcile/,
    );
    assert.match(
      ledgerBlockedUserMessage("POST_COMMIT_INVARIANT_DRIFT"),
      /Do not retry settlement/,
    );
  });
});

describe("settlement ledger latch lifecycle", () => {
  it("keys latch by roomId, sessionId, handNumber, and error code", () => {
    resetSettlementLedgerBlockedForTests();
    markSettlementLedgerBlocked({
      roomId: ROOM_A,
      sessionId: SESSION_A,
      handNumber: 1,
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    assert.equal(
      settlementLedgerLatchKey({
        roomId: ROOM_A,
        sessionId: SESSION_A,
        handNumber: 1,
        code: "TABLE_CHIP_INVARIANT_MISMATCH",
      }),
      "room_a|session_a|1|TABLE_CHIP_INVARIANT_MISMATCH",
    );
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 1), true);
    assert.equal(isSettlementLedgerBlocked(ROOM_B, SESSION_A, 1), false);
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_B, 1), false);
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 2), false);
    assert.deepEqual(getSettlementLedgerBlockedEntry(ROOM_A, SESSION_A, 1), {
      roomId: ROOM_A,
      sessionId: SESSION_A,
      handNumber: 1,
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    resetSettlementLedgerBlockedForTests();
  });

  it("blocks repeated settlement for the same hand but not a later valid hand", () => {
    resetSettlementLedgerBlockedForTests();
    markSettlementLedgerBlocked({
      roomId: ROOM_A,
      sessionId: SESSION_A,
      handNumber: 1,
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 1), true);
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 2), false);
    reconcileSettlementLedgerLatchFromSession(ROOM_A, SESSION_A, {
      handCount: 1,
      currentHand: { handNumber: 2, phase: "reveal", participantIds: ["p1", "p2"] },
    });
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 1), false);
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 2), false);
    resetSettlementLedgerBlockedForTests();
  });

  it("clears post-commit latch only after authoritative snapshot shows hand advanced", () => {
    resetSettlementLedgerBlockedForTests();
    markSettlementLedgerBlocked({
      roomId: ROOM_A,
      sessionId: SESSION_A,
      handNumber: 1,
      code: "POST_COMMIT_INVARIANT_DRIFT",
    });
    reconcileSettlementLedgerLatchFromSession(ROOM_A, SESSION_A, {
      handCount: 0,
      currentHand: {
        handNumber: 1,
        phase: "play",
        participantIds: ["p1", "p2"],
        tricksByPlayer: { p1: 3, p2: 2 },
      },
    });
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 1), true);
    reconcileSettlementLedgerLatchFromSession(ROOM_A, SESSION_A, {
      handCount: 1,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    });
    assert.equal(isSettlementLedgerBlocked(ROOM_A, SESSION_A, 1), false);
    resetSettlementLedgerBlockedForTests();
  });

  it("does not clear pre-commit latch until blocked hand state changes", () => {
    resetSettlementLedgerBlockedForTests();
    const entry = {
      roomId: ROOM_A,
      sessionId: SESSION_A,
      handNumber: 1,
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
    };
    assert.equal(
      isSettlementLedgerLatchResolved(entry, {
        handCount: 0,
        currentHandNumber: 1,
        currentHandCleared: false,
      }),
      false,
    );
    assert.equal(
      isSettlementLedgerLatchResolved(entry, {
        handCount: 1,
        currentHandNumber: null,
        currentHandCleared: true,
      }),
      true,
    );
    resetSettlementLedgerBlockedForTests();
  });

  it("deriveSettlementLifecycleState never maps blocked latch to settlement_recovered", () => {
    resetSettlementLedgerBlockedForTests();
    markSettlementLedgerBlocked({
      roomId: ROOM_A,
      sessionId: SESSION_A,
      handNumber: 1,
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    const state = deriveSettlementLifecycleState({
      roomId: ROOM_A,
      sessionId: SESSION_A,
      sessionData: {
        handCount: 0,
        currentHand: {
          handNumber: 1,
          phase: "play",
          participantIds: ["p1", "p2"],
          tricksByPlayer: { p1: 3, p2: 2 },
        },
      },
      awaitingSettlement: true,
      clearedHand: false,
    });
    assert.equal(state, SETTLEMENT_LIFECYCLE.BLOCKED_PRE_COMMIT);
    assert.notEqual(state, "settlement_recovered");
    resetSettlementLedgerBlockedForTests();
  });

  it("planRecoverHandoffResult blocks retry while latch remains", () => {
    const blocked = planRecoverHandoffResult({
      handComplete: true,
      latchBlocked: true,
      latchCode: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    assert.equal(blocked.status, "settlement_blocked");
    assert.equal(
      planRecoverHandoffResult({
        handComplete: true,
        latchBlocked: false,
        finalizeStatus: "noop",
      }).status,
      "settlement_pending",
    );
  });
});
