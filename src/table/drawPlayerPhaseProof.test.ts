/**
 * Proof harness: captures [nbl-flow] logs for drawPlayer timer + phase exit.
 * Run: node --import tsx --test src/table/drawPlayerPhaseProof.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { forceGameFlowDebugForTests } from "./gameFlowDebug";
import {
  createHandPresentationStore,
  phaseScheduleMs,
  reduceHandPresentation,
  snapshotFromSession,
  type HandPresentationStore,
} from "./handPresentationMachine";

const baseSnap = snapshotFromSession({
  sessionId: "proof-s1",
  handNumber: 4,
  phase: "draw",
  enrollmentActive: false,
  participantIds: ["p0", "bot_a", "p1"],
  actionOrder: ["p1", "bot_a", "p0"],
  drawCompletedIds: [],
  turnPlayerId: "p1",
  trumpUpcard: null,
  dealerId: "p0",
  potAmount: 3,
});

type LogLine = { line: string; data?: Record<string, unknown> };

function captureLogs(): { logs: LogLine[]; end: () => void } {
  const logs: LogLine[] = [];
  const end = forceGameFlowDebugForTests((line, data) => logs.push({ line, data }));
  return { logs, end };
}

function formatLog(entry: LogLine): string {
  const payload = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
  return `${entry.line}${payload}`;
}

function phaseKey(store: HandPresentationStore): string {
  return `${store.handNumber}:${store.phase}:${store.animatingDrawPlayerId ?? ""}:${store.drawAnimSubPhase}:${store.phaseStartedAt}`;
}

/** Mirrors useHandPresentation advance timer effect (one-shot guard). */
function simulateAdvanceTimerArm(
  store: HandPresentationStore,
  armedRef: { current: string | null },
  logs: LogLine[],
): { armed: boolean; delay: number } {
  const key = phaseKey(store);
  if (armedRef.current === key) {
    logs.push({
      line: "[nbl-flow] useHandPresentation :: advancePhase-timer-skip-duplicate",
      data: { phaseKey: key },
    });
    return { armed: false, delay: 0 };
  }
  const delay = phaseScheduleMs(store, false);
  if (delay <= 0) {
    logs.push({
      line: "[nbl-flow] useHandPresentation :: advancePhase-timer-idle-skip",
      data: { phaseKey: key, reason: "delay<=0" },
    });
    return { armed: false, delay: 0 };
  }
  armedRef.current = key;
  logs.push({
    line: "[nbl-flow] useHandPresentation :: advancePhase-timer-armed",
    data: { phaseKey: key, delay, fromPhase: store.phase, drawAnimSubPhase: store.drawAnimSubPhase },
  });
  return { armed: true, delay };
}

function simulateAdvanceTimerFire(
  store: HandPresentationStore,
  armedRef: { current: string | null },
  armedKey: string,
  armedAt: HandPresentationStore,
  logs: LogLine[],
): HandPresentationStore {
  if (armedRef.current !== armedKey) return store;
  armedRef.current = null;

  if (
    store.handNumber !== armedAt.handNumber ||
    store.phase !== armedAt.phase ||
    store.animatingDrawPlayerId !== armedAt.animatingDrawPlayerId ||
    store.drawAnimSubPhase !== armedAt.drawAnimSubPhase ||
    store.phaseStartedAt !== armedAt.phaseStartedAt
  ) {
    logs.push({ line: "[nbl-flow] useHandPresentation :: advancePhase-timer-stale", data: { armedKey } });
    return store;
  }

  logs.push({
    line: "[nbl-flow] useHandPresentation :: advancePhase-timer",
    data: { fromPhase: armedAt.phase, animatingDrawPlayerId: armedAt.animatingDrawPlayerId },
  });
  return reduceHandPresentation(store, { type: "advancePhase" });
}

describe("drawPlayer phase proof — log capture", () => {
  it("prints logs: one timer per drawPlayer entry, single exit to next phase", () => {
    const { logs, end } = captureLogs();
    const armedRef = { current: null as string | null };
    let store = createHandPresentationStore(baseSnap);

    // Bot completes draw — server arms drawPlayer(discard, bot_a)
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["bot_a"], turnPlayerId: "p0" },
    });
    const entry1Key = phaseKey(store);
    const arm1 = simulateAdvanceTimerArm(store, armedRef, logs);
    assert.equal(arm1.armed, true);
    const armedAt1 = { ...store };

    // Duplicate effect rerun (same phase entry) — must NOT re-arm
    const arm1dup = simulateAdvanceTimerArm(store, armedRef, logs);
    assert.equal(arm1dup.armed, false);

    // Timer fires: discard → receive
    store = simulateAdvanceTimerFire(store, armedRef, entry1Key, armedAt1, logs);
    assert.equal(store.drawAnimSubPhase, "receive");
    const arm2 = simulateAdvanceTimerArm(store, armedRef, logs);
    assert.equal(arm2.armed, true);
    const entry2Key = phaseKey(store);
    const armedAt2 = { ...store };
    simulateAdvanceTimerArm(store, armedRef, logs); // duplicate skip

    // Timer fires: receive → done (player presented)
    store = simulateAdvanceTimerFire(store, armedRef, entry2Key, armedAt2, logs);
    assert.equal(store.drawAnimSubPhase, "done");
    assert.equal(store.displayDrawCompletedIds.includes("bot_a"), true);

    // Idle drawPlayer — no timer (delay 0)
    const armIdle = simulateAdvanceTimerArm(store, armedRef, logs);
    assert.equal(armIdle.armed, false);

    // Stale server snapshot repeats bot_a — must NOT re-arm drawPlayer discard
    const phaseBefore = store.phaseStartedAt;
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["bot_a"], turnPlayerId: "p0" },
    });
    assert.equal(store.phaseStartedAt, phaseBefore);
    assert.equal(store.animatingDrawPlayerId, null);
    simulateAdvanceTimerArm(store, armedRef, logs); // still idle

    // Next bot completes — new phase entry, one new timer
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...baseSnap, drawCompletedIds: ["bot_a", "p1"], turnPlayerId: "p0" },
    });
    const arm3 = simulateAdvanceTimerArm(store, armedRef, logs);
    assert.equal(arm3.armed, true);
    const entry3Key = phaseKey(store);
    const armedAt3 = { ...store };

    store = simulateAdvanceTimerFire(store, armedRef, entry3Key, armedAt3, logs);
    if (store.drawAnimSubPhase === "receive") {
      const k = phaseKey(store);
      const a = { ...store };
      store = simulateAdvanceTimerFire(store, armedRef, k, a, logs);
    }

    end();

    const armed = logs.filter((l) => l.line.includes("advancePhase-timer-armed"));
    const fired = logs.filter((l) => l.line.includes("advancePhase-timer") && !l.line.includes("armed") && !l.line.includes("skip") && !l.line.includes("stale") && !l.line.includes("idle"));
    const dupSkip = logs.filter((l) => l.line.includes("skip-duplicate"));
    const machine = logs.filter((l) => l.line.includes("handPresentation"));

    console.log("\n========== drawPlayer PROOF LOGS ==========\n");
    for (const entry of logs) {
      console.log(formatLog(entry));
    }
    console.log("\n========== SUMMARY ==========");
    console.log(`advancePhase-timer-armed:     ${armed.length}`);
    console.log(`advancePhase-timer (fired):   ${fired.length}`);
    console.log(`advancePhase-timer-skip-dup:  ${dupSkip.length}`);
    console.log(`handPresentation reducer:     ${machine.length}`);
    console.log(`final phase:                  ${store.phase} / sub=${store.drawAnimSubPhase}`);
    console.log("============================================\n");

    assert.equal(dupSkip.length >= 2, true, "duplicate arm attempts were skipped");
    assert.equal(armed.length, fired.length, "each armed timer fired exactly once");
    assert.ok(logs.some((l) => l.line.includes("idle-skip")), "idle drawPlayer skipped timer");
    assert.equal(
      logs.filter((l) => l.line.includes("advancePhase-timer-armed") && (l.data?.phaseKey as string)?.includes("bot_a:discard")).length,
      1,
      "bot_a discard armed once",
    );
  });
});
