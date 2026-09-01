import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SETTLEMENT_LIFECYCLE,
  deriveSettlementLifecycleState,
  getSettlementLedgerBlockedEntry,
  isSettlementLedgerBlocked,
  logSettlementLifecycleOnce,
  clearSettlementLifecycleLogs,
  markSettlementLedgerBlocked,
  planRecoverHandoffResult,
  reconcileSettlementLedgerLatchFromSession,
  resetSettlementLedgerBlockedForTests,
  settlementBlockedFeedbackPayload,
} from "../docs/table-action-feedback.js";

const ROOM = "room_a";
const SESSION = "session_a";
const OTHER_ROOM = "room_b";
const OTHER_SESSION = "session_b";

function completedHandSession(tricksByPlayer) {
  return {
    handCount: 0,
    currentHand: {
      handNumber: 1,
      phase: "play",
      participantIds: Object.keys(tricksByPlayer),
      tricksByPlayer,
    },
  };
}

describe("settlement latch lifecycle planner", () => {
  it("pre-commit blocked settlement stays terminal — no false recovery", () => {
    const result = planRecoverHandoffResult({
      handComplete: true,
      latchBlocked: true,
      latchCode: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    assert.equal(result.status, "settlement_blocked");
    assert.equal(result.committed, false);
    assert.notEqual(result.status, "settlement_recovered");
  });

  it("post-commit review required stays terminal — no false recovery", () => {
    const result = planRecoverHandoffResult({
      handComplete: true,
      latchBlocked: true,
      latchCode: "POST_COMMIT_INVARIANT_DRIFT",
    });
    assert.equal(result.status, "settlement_blocked");
    assert.equal(result.committed, true);
    assert.notEqual(result.status, "settlement_recovered");
  });

  it("successful finalize may recover; pending finalize does not", () => {
    assert.equal(
      planRecoverHandoffResult({
        handComplete: true,
        latchBlocked: false,
        finalizeStatus: "settled",
      }).status,
      "settlement_recovered",
    );
    assert.equal(
      planRecoverHandoffResult({
        handComplete: true,
        latchBlocked: false,
        finalizeStatus: "blocked_latch",
        latchCode: "TABLE_CHIP_INVARIANT_MISMATCH",
      }).status,
      "settlement_blocked",
    );
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

describe("settlement lifecycle UI states", () => {
  it("distinguishes pending, blocked pre-commit, and review-required post-commit", () => {
    resetSettlementLedgerBlockedForTests();
    const session = completedHandSession({
      human: 2,
      bot_a: 1,
      bot_b: 1,
      bot_c: 1,
    });
    assert.equal(
      deriveSettlementLifecycleState({
        roomId: ROOM,
        sessionId: SESSION,
        sessionData: session,
        awaitingSettlement: true,
        clearedHand: false,
      }),
      SETTLEMENT_LIFECYCLE.PENDING,
    );

    markSettlementLedgerBlocked({
      roomId: ROOM,
      sessionId: SESSION,
      handNumber: 1,
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    assert.equal(
      deriveSettlementLifecycleState({
        roomId: ROOM,
        sessionId: SESSION,
        sessionData: session,
        awaitingSettlement: true,
        clearedHand: false,
      }),
      SETTLEMENT_LIFECYCLE.BLOCKED_PRE_COMMIT,
    );
    assert.equal(
      settlementBlockedFeedbackPayload(getSettlementLedgerBlockedEntry(ROOM, SESSION, 1))
        .settlementLifecycle,
      SETTLEMENT_LIFECYCLE.BLOCKED_PRE_COMMIT,
    );

    resetSettlementLedgerBlockedForTests();
    markSettlementLedgerBlocked({
      roomId: ROOM,
      sessionId: SESSION,
      handNumber: 1,
      code: "POST_COMMIT_INVARIANT_DRIFT",
    });
    assert.equal(
      deriveSettlementLifecycleState({
        roomId: ROOM,
        sessionId: SESSION,
        sessionData: session,
        awaitingSettlement: true,
        clearedHand: false,
      }),
      SETTLEMENT_LIFECYCLE.REVIEW_REQUIRED_POST_COMMIT,
    );
    resetSettlementLedgerBlockedForTests();
  });
});

describe("settlement latch isolation and resolution", () => {
  it("isolates latch by room, session, and hand number", () => {
    resetSettlementLedgerBlockedForTests();
    markSettlementLedgerBlocked({
      roomId: ROOM,
      sessionId: SESSION,
      handNumber: 1,
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
    });
    assert.equal(isSettlementLedgerBlocked(ROOM, SESSION, 1), true);
    assert.equal(isSettlementLedgerBlocked(OTHER_ROOM, SESSION, 1), false);
    assert.equal(isSettlementLedgerBlocked(ROOM, OTHER_SESSION, 1), false);
    assert.equal(isSettlementLedgerBlocked(ROOM, SESSION, 2), false);

    reconcileSettlementLedgerLatchFromSession(ROOM, SESSION, {
      handCount: 1,
      currentHand: { handNumber: 2, phase: "reveal", participantIds: ["p1", "p2"] },
    });
    assert.equal(isSettlementLedgerBlocked(ROOM, SESSION, 1), false);
    assert.equal(isSettlementLedgerBlocked(ROOM, SESSION, 2), false);
    resetSettlementLedgerBlockedForTests();
  });

  it("clears latch only after authoritative hand advancement", () => {
    resetSettlementLedgerBlockedForTests();
    markSettlementLedgerBlocked({
      roomId: ROOM,
      sessionId: SESSION,
      handNumber: 1,
      code: "POST_COMMIT_INVARIANT_DRIFT",
    });
    reconcileSettlementLedgerLatchFromSession(ROOM, SESSION, completedHandSession({
      human: 2,
      bot_a: 1,
      bot_b: 1,
      bot_c: 1,
    }));
    assert.equal(isSettlementLedgerBlocked(ROOM, SESSION, 1), true);

    reconcileSettlementLedgerLatchFromSession(ROOM, SESSION, {
      handCount: 1,
      currentHand: { tricksByPlayer: {}, participantIds: [] },
    });
    assert.equal(isSettlementLedgerBlocked(ROOM, SESSION, 1), false);
    resetSettlementLedgerBlockedForTests();
  });
});

describe("settlement latch logging dedupe", () => {
  it("emits a blocked lifecycle log only once per composite latch key", () => {
    resetSettlementLedgerBlockedForTests();
    const calls = [];
    const key = `finalize-blocked:${ROOM}|${SESSION}|1|TABLE_CHIP_INVARIANT_MISMATCH`;
    assert.equal(
      logSettlementLifecycleOnce(key, () => calls.push("finalize")),
      true,
    );
    assert.equal(
      logSettlementLifecycleOnce(key, () => calls.push("finalize")),
      false,
    );
    assert.deepEqual(calls, ["finalize"]);
    clearSettlementLifecycleLogs(ROOM, SESSION, 1);
    assert.equal(
      logSettlementLifecycleOnce(key, () => calls.push("finalize-again")),
      true,
    );
    assert.deepEqual(calls, ["finalize", "finalize-again"]);
    resetSettlementLedgerBlockedForTests();
  });
});

describe("settlement latch source contracts", () => {
  it("recoverHandoffBetweenHands does not report settlement_recovered when latched", () => {
    const src = readFileSync(new URL("../docs/firestore.js", import.meta.url), "utf8");
    const fn = src.slice(
      src.indexOf("export async function recoverHandoffBetweenHands"),
      src.indexOf("function writeEnrollmentPatch"),
    );
    assert.match(fn, /status:\s*"settlement_blocked"/);
    assert.match(fn, /isSettlementLedgerBlocked\(roomId, sessionId, handNumber\)/);
    assert.match(fn, /outcome\?\.status === "settled"/);
    assert.match(fn, /return \{ status: "settlement_recovered" \}/);
    assert.match(fn, /return \{ status: "settlement_pending", handNumber \}/);
  });

  it("app lifecycle recovery handles settlement_blocked without recovery log", () => {
    const src = readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
    const fn = src.slice(
      src.indexOf("function maybeRecoverHandLifecycle"),
      src.indexOf("let tableIntentHandlers"),
    );
    assert.match(fn, /getOpenSessionSettlementLatch/);
    assert.match(fn, /if \(result\.status === "settlement_blocked"\)/);
    assert.match(fn, /applySettlementBlockedFeedback/);
    assert.match(fn, /return;\s*\}\s*if \(result\.status === "settlement_recovered"/s);
  });

  it("orchestration halts bot/enrollment scheduling while latch remains", () => {
    const src = readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
    const fn = src.slice(
      src.indexOf("function runSessionOrchestration"),
      src.indexOf("function scheduleSessionOrchestration"),
    );
    assert.match(fn, /getOpenSessionSettlementLatch\(sessionObj\)/);
    assert.match(fn, /stopEnrollmentTimer\(\)/);
    assert.match(fn, /cancelNextHandOpenTimer\(\)/);
    assert.match(fn, /return;/);
  });

  it("ensureHandEnrollmentClient skips recovery while latch is active", () => {
    const src = readFileSync(new URL("../docs/firestore.js", import.meta.url), "utf8");
    const start = src.indexOf("async function ensureHandEnrollmentClient");
    const end = src.indexOf("async function ensureHandEnrollment(", start);
    const fn = src.slice(start, end > start ? end : start + 2500);
    assert.match(fn, /isSettlementLedgerBlocked\(roomId, sessionId, handNumber\)/);
    assert.match(fn, /if \(!isSettlementLedgerBlocked/);
  });
});
