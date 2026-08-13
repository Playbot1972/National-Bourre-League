import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIE_RESULT_MIN_MS = 5_000;
const TIE_RESULT_DEFAULT_MS = 5_500;
const TIE_RESULT_MAX_MS = 7_000;

function getTieResultDurationMs(message = "") {
  const len = String(message).trim().length;
  const estimated = TIE_RESULT_MIN_MS + Math.min(len * 35, TIE_RESULT_MAX_MS - TIE_RESULT_MIN_MS);
  return Math.max(TIE_RESULT_MIN_MS, Math.min(estimated, TIE_RESULT_MAX_MS));
}

/** Mirrors scheduleAutoHide in useCoWinResultVisibility — must clear before re-arming. */
function scheduleAutoHideMock(
  autoHideTimerRef,
  clearAutoHideTimer,
  remainingMs,
  onRelease,
  setTimeoutImpl = (fn, ms) => setTimeout(fn, ms),
  clearTimeoutImpl = (id) => clearTimeout(id),
) {
  clearAutoHideTimer();
  if (remainingMs <= 0) {
    onRelease();
    return;
  }
  autoHideTimerRef.current = setTimeoutImpl(() => {
    autoHideTimerRef.current = null;
    onRelease();
  }, remainingMs);
}

function clearAutoHideTimerMock(autoHideTimerRef, clearLog, clearTimeoutImpl = (id) => clearTimeout(id)) {
  clearLog.push("clear");
  if (autoHideTimerRef.current != null) {
    clearTimeoutImpl(autoHideTimerRef.current);
    autoHideTimerRef.current = null;
  }
}

describe("hand presentation timing regressions", () => {
  it("clears hand-end echo at settle, not only at ante", () => {
    const src = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");
    assert.match(src, /handPresentation\.phase === "settle"/);
    assert.match(src, /handPresentation\.phase === "nextHandReset"/);
    assert.doesNotMatch(
      src,
      /if \(handPresentation\.phase !== "ante"\) return;\s*\n\s*if \(!trickPresentation\.showFinalTrickEcho\)/,
    );
  });

  it("reinits trick presentation when hand number changes", () => {
    const src = readFileSync(join(root, "src/table/hooks/useTrickPresentation.ts"), "utf8");
    assert.match(src, /handNumberChanged/);
    assert.match(src, /reinit-hand-number/);
  });

  it("does not gate hand settle behind draw selection", () => {
    const machine = readFileSync(join(root, "src/table/handPresentationMachine.ts"), "utf8");
    assert.match(machine, /tryBeginHandSettle/);
    assert.match(machine, /serverLeftPlay \|\| serverEnrollment/);
    assert.doesNotMatch(
      machine,
      /pendingHandSettle[\s\S]{0,120}drawPlayer/,
    );
  });

  it("uses named tie result duration constants in co-win UI", () => {
    const toast = readFileSync(join(root, "src/table/SplitPotDecisionToast.tsx"), "utf8");
    const panel = readFileSync(join(root, "src/table/SettlementCoWinPanel.tsx"), "utf8");
    const view = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");
    assert.match(toast, /getTieResultDurationMs/);
    assert.match(panel, /manualContinueAllowed/);
    assert.match(view, /useCoWinResultVisibility/);
  });

  it("clamps tie/co-win visibility between min and max", () => {
    assert.equal(getTieResultDurationMs(""), TIE_RESULT_MIN_MS);
    assert.ok(getTieResultDurationMs("x".repeat(40)) >= TIE_RESULT_DEFAULT_MS);
    assert.equal(getTieResultDurationMs("x".repeat(500)), TIE_RESULT_MAX_MS);
  });

  it("co-win visibility hook clears timers before re-arming", () => {
    const hook = readFileSync(join(root, "src/table/useCoWinResultVisibility.ts"), "utf8");
    assert.match(hook, /const clearTimers = \(\) =>/);
    assert.match(hook, /clearContinueTimer\(\)/);
    assert.match(hook, /clearAutoHideTimer\(\)/);
    assert.match(hook, /proposalRef\.current !== proposalKey[\s\S]*clearTimers\(\)/);
    assert.match(hook, /scheduleAutoHide[\s\S]{0,120}clearAutoHideTimer\(\)/);
    assert.match(hook, /useEffect\([\s\S]*clearTimers\(\)[\s\S]*setCoWinResultLatched\(false\)/);
  });

  it("scheduleAutoHide pattern clears an existing timeout before arming another", () => {
    const autoHideTimerRef = { current: null };
    const clearLog = [];
    const clearAutoHideTimer = () =>
      clearAutoHideTimerMock(autoHideTimerRef, clearLog);
    const releases = [];
    let nextTimerId = 1;
    scheduleAutoHideMock(
      autoHideTimerRef,
      clearAutoHideTimer,
      1_000,
      () => releases.push("release"),
      () => nextTimerId++,
    );
    scheduleAutoHideMock(
      autoHideTimerRef,
      clearAutoHideTimer,
      500,
      () => releases.push("release"),
      () => nextTimerId++,
    );
    assert.deepEqual(clearLog, ["clear", "clear"]);
    assert.equal(autoHideTimerRef.current, 2);
  });
});
