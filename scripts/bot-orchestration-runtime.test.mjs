import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createServerBotAdvanceRuntime } from "../docs/bot-orchestration-runtime.js";
import { BOT_ADVANCE_DEBOUNCE_MS } from "../docs/bot-play-delay.js";

function makeSession(overrides = {}) {
  return {
    id: "sess_test",
    status: "active",
    currentHand: {
      phase: "reveal",
      turnPlayerId: "bot_my43bga9",
      actionOrder: ["bot_my43bga9", "p1", "bot_b"],
      participantIds: ["bot_my43bga9", "p1", "bot_b"],
      ...overrides.currentHand,
    },
    ...overrides,
  };
}

function makeScores() {
  return [
    { playerId: "bot_my43bga9", isRobot: true },
    { playerId: "p1", isRobot: false },
    { playerId: "bot_b", isRobot: true },
  ];
}

function snapshotContext(session) {
  const ch = session.currentHand ?? {};
  const actionOrder = ch.actionOrder ?? [];
  const turnId = ch.turnPlayerId ?? null;
  return {
    handNumber: 1,
    handPhase: ch.phase ?? null,
    trickNumber: ch.currentTrick?.trickNumber ?? null,
    turnPlayerId: turnId,
    turnIndex: turnId ? actionOrder.indexOf(turnId) : -1,
    remainingHandCount: 5,
    actionOrder,
  };
}

function createTestRuntime(overrides = {}) {
  const logs = [];
  let advanceCalls = 0;
  const session = makeSession(overrides.session);
  const scores = makeScores();
  const runtime = createServerBotAdvanceRuntime({
    shouldRequestAdvance: () => true,
    sessionNeedsBotDriver: () => true,
    shouldBlockForPresentation: () => false,
    snapshotContext: (s) => snapshotContext(s),
    getRoomId: () => "room_test",
    getSessionId: () => session.id,
    getHandPhase: (s) => s.currentHand?.phase ?? null,
    advanceSessionBots: async () => {
      advanceCalls += 1;
      return { status: "ok", steps: [] };
    },
    findSession: () => session,
    getScores: () => scores,
    onWake: () => {},
    ...overrides.deps,
  });
  const originalInfo = console.info;
  console.info = (tag, event, payload) => {
    if (tag === "[bot-orchestrator]") {
      logs.push({ event, payload: JSON.parse(payload) });
    }
  };
  return {
    runtime,
    session,
    scores,
    logs,
    getAdvanceCalls: () => advanceCalls,
    restoreConsole: () => {
      console.info = originalInfo;
    },
  };
}

function scheduleRequestLogs(logs) {
  return logs.filter((entry) => entry.event === "schedule-request");
}

function coalesceLogs(logs, reason) {
  return logs.filter(
    (entry) => entry.event === "coalesce-request" && entry.payload.reason === reason,
  );
}

describe("bot orchestration runtime non-play dedupe", () => {
  it("coalesces duplicate wake + processRobotActions for same reveal turn", () => {
    const harness = createTestRuntime();
    try {
      harness.runtime.schedule(harness.session, harness.scores, "uid_1", {
        reason: "wake",
      });
      harness.runtime.schedule(harness.session, harness.scores, "uid_1", {
        reason: "processRobotActions",
      });

      assert.equal(scheduleRequestLogs(harness.logs).length, 1);
      const deduped = coalesceLogs(harness.logs, "schedule_deduped");
      assert.equal(deduped.length, 1);
      assert.equal(deduped[0].payload.trigger, "processRobotActions");
      assert.equal(deduped[0].payload.handPhase, "reveal");
      assert.match(deduped[0].payload.advanceTurnKey, /^sess_test:1:reveal:/);
    } finally {
      harness.restoreConsole();
      harness.runtime.clearSchedule();
    }
  });

  it("allows a new schedule after the debounce timer fires", async () => {
    const harness = createTestRuntime();
    try {
      harness.runtime.schedule(harness.session, harness.scores, "uid_1", {
        reason: "wake",
      });
      assert.equal(scheduleRequestLogs(harness.logs).length, 1);

      await new Promise((resolve) => setTimeout(resolve, BOT_ADVANCE_DEBOUNCE_MS + 30));
      await new Promise((resolve) => setImmediate(resolve));

      harness.runtime.schedule(harness.session, harness.scores, "uid_1", {
        reason: "processRobotActions",
      });

      assert.equal(scheduleRequestLogs(harness.logs).length, 2);
      assert.equal(coalesceLogs(harness.logs, "schedule_deduped").length, 0);
      assert.equal(harness.getAdvanceCalls(), 1);
    } finally {
      harness.restoreConsole();
      harness.runtime.clearSchedule();
    }
  });

  it("supersedes pending schedule when turn signature changes", () => {
    const harness = createTestRuntime();
    try {
      harness.runtime.schedule(harness.session, harness.scores, "uid_1", {
        reason: "wake",
      });
      harness.session.currentHand.turnPlayerId = "bot_b";
      harness.runtime.schedule(harness.session, harness.scores, "uid_1", {
        reason: "snapshot",
      });

      assert.equal(scheduleRequestLogs(harness.logs).length, 2);
      assert.equal(coalesceLogs(harness.logs, "schedule_deduped").length, 0);
    } finally {
      harness.restoreConsole();
      harness.runtime.clearSchedule();
    }
  });

  it("keeps advance_in_flight coalescing during execute", async () => {
    let releaseAdvance;
    const advanceGate = new Promise((resolve) => {
      releaseAdvance = resolve;
    });
    const harness = createTestRuntime({
      deps: {
        advanceSessionBots: async () => {
          await advanceGate;
          return { status: "ok", steps: [] };
        },
      },
    });
    try {
      const executePromise = harness.runtime.execute(harness.session, harness.scores, "uid_1", {
        reason: "wake",
      });
      harness.runtime.schedule(harness.session, harness.scores, "uid_1", {
        reason: "processRobotActions",
      });

      assert.equal(coalesceLogs(harness.logs, "advance_in_flight").length, 1);
      releaseAdvance();
      await executePromise;
    } finally {
      harness.restoreConsole();
      harness.runtime.clearSchedule();
    }
  });
});
