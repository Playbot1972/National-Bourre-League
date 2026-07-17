import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIE_RESULT_MIN_MS = 3_000;
const TIE_RESULT_DEFAULT_MS = 4_000;
const TIE_RESULT_MAX_MS = 6_000;

function getTieResultDurationMs(message = "") {
  const len = String(message).trim().length;
  const estimated = TIE_RESULT_MIN_MS + Math.min(len * 35, TIE_RESULT_MAX_MS - TIE_RESULT_MIN_MS);
  return Math.max(TIE_RESULT_MIN_MS, Math.min(estimated, TIE_RESULT_MAX_MS));
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

  it("reinits trick presentation when hand or trick scope advances", () => {
    const hook = readFileSync(join(root, "src/table/hooks/useTrickPresentation.ts"), "utf8");
    const scope = readFileSync(join(root, "src/table/presentationScope.ts"), "utf8");
    const localAction = readFileSync(join(root, "src/table/localAction.ts"), "utf8");
    assert.match(hook, /shouldReinitPresentationScope/);
    assert.match(hook, /reinitForScope/);
    assert.match(hook, /reinit-presentation-scope/);
    assert.match(scope, /presentationScopeKey/);
    assert.match(localAction, /resolveSuppressTurnForHero/);
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
    assert.match(hook, /clearTimer\(\)/);
    assert.match(hook, /proposalRef\.current !== proposalKey/);
    assert.match(hook, /useEffect\(\(\) => \(\) => clearTimer\(\), \[\]\)/);
  });
});
