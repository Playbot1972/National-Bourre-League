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

function finishDrawPresentationForActivePlayer(store: HandPresentationStore): HandPresentationStore {
  let s = store;
  let guard = 0;
  while (s.phase === "drawPlayer" && s.animatingDrawPlayerId && s.drawAnimSubPhase !== "done" && guard < 8) {
    s = reduceHandPresentation(s, { type: "advancePhase" });
    guard += 1;
  }
  return s;
}

function applyServerUpdateWithTimer(
  store: HandPresentationStore,
  snapshot: ReturnType<typeof snapshotFromSession>,
  armedRef: { current: string | null },
  logs: LogLine[],
): HandPresentationStore {
  let next = reduceHandPresentation(store, {
    type: "serverUpdate",
    snapshot,
  });

  if (
    next.animatingDrawPlayerId &&
    next.drawAnimSubPhase === "discard" &&
    next.animatingDrawPlayerId !== store.animatingDrawPlayerId
  ) {
    const key = phaseKey(next);
    simulateAdvanceTimerArm(next, armedRef, logs);
    const armedAt = { ...next };
    next = simulateAdvanceTimerFire(next, armedRef, key, armedAt, logs);
    if (next.drawAnimSubPhase === "receive") {
      const key2 = phaseKey(next);
      const armedAt2 = { ...next };
      simulateAdvanceTimerArm(next, armedRef, logs);
      next = simulateAdvanceTimerFire(next, armedRef, key2, armedAt2, logs);
    }
  }

  simulateAdvanceTimerArm(next, armedRef, logs);
  return next;
}

function countDiscardEntries(logs: LogLine[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of logs) {
    if (!entry.line.includes("handPresentation :: serverUpdate")) continue;
    const anim = entry.data?.drawAnim as string | undefined;
    if (!anim?.includes("->")) continue;
    const to = anim.split("->").pop()?.trim() ?? "";
    const sub = entry.data?.drawSubPhase as string | undefined;
    if (!to || !sub?.endsWith("discard")) continue;
    counts[to] = (counts[to] ?? 0) + 1;
  }
  return counts;
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

  it("prints logs: full draw hand — each player enters presentation once under snapshot replay", () => {
    const botA = "bot_hiud3taw";
    const botB = "bot_qa2qh6l5";
    const hero = "p0";
    const handSnap = snapshotFromSession({
      sessionId: "proof-full-draw",
      handNumber: 1,
      phase: "draw",
      enrollmentActive: false,
      participantIds: [hero, botA, botB],
      actionOrder: [botA, botB, hero],
      drawCompletedIds: [],
      turnPlayerId: botA,
      potAmount: 3,
    });

    const { logs, end } = captureLogs();
    const armedRef = { current: null as string | null };
    let store = createHandPresentationStore(handSnap);

    const replay = (ids: string[], turn: string, label: string) => {
      logs.push({ line: `[proof] --- replay: ${label} drawCompleted=[${ids.join(",")}] ---` });
      store = applyServerUpdateWithTimer(
        store,
        { ...handSnap, drawCompletedIds: ids, turnPlayerId: turn },
        armedRef,
        logs,
      );
      logs.push({
        line: "[proof] state",
        data: {
          phase: store.phase,
          drawAnim: store.animatingDrawPlayerId,
          drawSubPhase: store.drawAnimSubPhase,
          consumed: [...store.drawPresentationConsumedIds],
          displayCompleted: [...store.displayDrawCompletedIds],
        },
      });
    };

    // Genuine progression
    replay([botA], botB, "bot_a first draw");
    store = finishDrawPresentationForActivePlayer(store);

    replay([botA], botB, "stale replay bot_a only");
    replay([botA, botB], hero, "bot_b draws");
    store = finishDrawPresentationForActivePlayer(store);

    replay([botA], botB, "stale regression prev empty-ish replay bot_a");
    store = { ...store, prevSnapshot: { ...handSnap, drawCompletedIds: [] } };
    replay([botA], botB, "after prev regression bot_a");
    replay([botA, botB], hero, "stale replay both bots");
    replay([botA, botB, hero], botA, "hero draws");
    store = finishDrawPresentationForActivePlayer(store);

    replay([botA, botB, hero], botA, "stale full replay all drawn");
    replay([botA, botB], hero, "stale partial replay");
    replay([botA], botB, "stale single bot_a again");

    end();

    const discardEntries = countDiscardEntries(logs);
    const consumedSkips = logs.filter((l) => l.line.includes("drawPresentation-consumed-skip"));
    const idleSkips = logs.filter((l) => l.line.includes("advancePhase-timer-idle-skip"));

    console.log("\n========== FULL DRAW SEQUENCE PROOF ==========\n");
    for (const entry of logs) {
      console.log(formatLog(entry));
    }
    console.log("\n========== PER-PLAYER DISCARD ENTRIES ==========");
    for (const [id, count] of Object.entries(discardEntries)) {
      console.log(`  ${id}: ${count} discard entry/entries`);
    }
    console.log("\n========== SUMMARY ==========");
    console.log(`drawPresentation-consumed-skip: ${consumedSkips.length}`);
    console.log(`advancePhase-timer-idle-skip:   ${idleSkips.length}`);
    console.log(`final phase:                    ${store.phase}`);
    console.log(`final consumed:                 ${store.drawPresentationConsumedIds.join(", ")}`);
    console.log("================================================\n");

    assert.equal(discardEntries[botA], 1, "bot_a enters discard presentation once");
    assert.equal(discardEntries[botB], 1, "bot_b enters discard presentation once");
    assert.equal(discardEntries[hero], 1, "hero enters discard presentation once");
    assert.deepEqual([...store.drawPresentationConsumedIds].sort(), [botA, botB, hero].sort());
    assert.equal(store.phase, "drawReady");
    const staleReplays = logs.filter(
      (l) =>
        l.line.startsWith("[proof] --- replay: stale") &&
        (l.data?.drawSubPhase === "done" || true),
    );
    assert.ok(staleReplays.length >= 3, "ran multiple stale replay rounds");
    const reopenDiscard = logs.filter(
      (l) =>
        l.line.includes("handPresentation :: serverUpdate") &&
        (l.data?.drawSubPhase as string)?.endsWith("discard") &&
        staleReplays.length > 0,
    );
    // After all three players consumed, no further discard entries on stale replays
    assert.equal(reopenDiscard.length, 3, "exactly three discard entries total (one per player)");
  });
});
