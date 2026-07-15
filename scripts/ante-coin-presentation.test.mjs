/**
 * Regression guards for clockwise ante coin GSAP presentation.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("ante coin presentation wiring", () => {
  const motion = readFileSync(join(root, "src/table/animations/anteCoinPresentationMotion.ts"), "utf8");
  const hook = readFileSync(join(root, "src/table/hooks/useTableAntePresentation.ts"), "utf8");
  const pacing = readFileSync(join(root, "src/table/handPacingMode.ts"), "utf8");
  const pot = readFileSync(join(root, "src/table/PotCenter.tsx"), "utf8");
  const card = readFileSync(join(root, "src/table/CardTable.tsx"), "utf8");
  const bridge = readFileSync(join(root, "src/table/trickAnimationBridge.ts"), "utf8");
  const tableView = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");

  it("reuses single GSAP ante path hooked from table views", () => {
    assert.match(hook, /runClockwiseAnteCoinPresentation/);
    assert.match(hook, /useTableAntePresentation/);
    assert.match(card, /useTableAntePresentation/);
    assert.doesNotMatch(pot, /bpot__ante-chips/);
  });

  it("uses pacing-aware ante delay plans (classic + Ape S.)", () => {
    assert.match(hook, /resolveAnteCoinDelayPlan/);
    assert.match(hook, /getHandPacingMode/);
    assert.match(pacing, /buildClassicAnteCoinDelayPlan/);
    const botTiming = readFileSync(join(root, "src/session/botActionTiming.ts"), "utf8");
    assert.match(botTiming, /buildAnteCoinDelayPlan/);
    assert.match(botTiming, /resolvePlayDelayMs/);
    assert.match(botTiming, /isBotPlayThinkPhase/);
    assert.doesNotMatch(botTiming, /resolveAntePostDelayMs/);
    assert.doesNotMatch(botTiming, /antePostTurnKey/);
    assert.doesNotMatch(motion, /anteCoinStaggerMs/);
  });

  it("plays coin-chime-light on landing via shared audio helper", () => {
    assert.match(motion, /playAnteCoinLandSound/);
    const audio = readFileSync(join(root, "src/table/feedback/audio.ts"), "utf8");
    assert.match(audio, /playAnteCoinLandSound/);
    assert.match(audio, /playTrickCollectSound/);
  });

  it("dedupes ante sequence per session hand", () => {
    assert.match(hook, /lastAnteKeyRef/);
    assert.match(hook, /sessionId.*handNumber.*ante/);
  });

  it("resolves seat anchors and pot target for clockwise flight", () => {
    assert.match(motion, /data-seat-motion-anchor/);
    assert.match(motion, /data-ante-pot-target/);
    assert.match(pot, /data-ante-pot-target/);
  });

  it("retries anchor measurement on the next animation frame before fallback", () => {
    assert.match(motion, /shouldRetryAnteAnchors/);
    assert.match(motion, /requestAnimationFrame/);
    assert.match(motion, /spawnAnteCoinWithAnchorRetry/);
  });

  it("Ape S. Mode releases bot gate after think delay; classic waits for GSAP onComplete", () => {
    assert.match(hook, /pacingMode === "apeSpeed"/);
    assert.match(hook, /thinkReleaseTimer/);
    assert.match(hook, /pacingMode === "classic"/);
    assert.match(hook, /onComplete:[\s\S]*releaseBotGate/);
    assert.match(hook, /delayPlan\.totalDurationMs \+ 200/);
  });

  it("bot presentation gate uses pacing-aware release windows", () => {
    assert.match(bridge, /antePresentationActive/);
    assert.match(bridge, /isAntePresentationActive/);
    assert.match(bridge, /getActiveHandPacingMode/);
    assert.match(pacing, /PACING_SOFT_UNBLOCK_MS/);
    assert.match(tableView, /isAntePresentationActive/);
  });

  it("ante uses shared 15s turn countdown via useTurnCountdown", () => {
    const turnCountdown = readFileSync(join(root, "src/table/turnCountdown.ts"), "utf8");
    const turnHook = readFileSync(join(root, "src/table/hooks/useTurnCountdown.ts"), "utf8");
    const tableView = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");
    assert.match(turnCountdown, /resolveTurnCountdownActiveActorId/);
    assert.match(turnCountdown, /resolveAntePresentationActorId/);
    assert.match(turnCountdown, /TURN_COUNTDOWN_MS/);
    assert.match(turnHook, /buildTurnCountdownState/);
    assert.match(tableView, /useTurnCountdown/);
    assert.doesNotMatch(tableView, /useAnteSeatCountdown/);
    assert.doesNotMatch(tableView, /avatarTurnCountdown/);
    assert.doesNotMatch(turnCountdown, /buildDurationCountdownState/);
    try {
      readFileSync(join(root, "src/table/hooks/useAnteSeatCountdown.ts"), "utf8");
      assert.fail("useAnteSeatCountdown should be removed");
    } catch {
      /* removed */
    }
    assert.match(motion, /registerAntePresentationTimeline/);
    assert.match(motion, /buildAntePresentationSchedule/);
  });

  it("does not restart ante timeline on participantIds dependency churn", () => {
    assert.match(hook, /resolveAnteCoinDelayPlan/);
    assert.match(hook, /\[anteAnimActive, session\.sessionId, session\.handNumber, tableRootRef\]/);
    assert.match(hook, /lastAnteKeyRef\.current === anteKey/);
    assert.doesNotMatch(hook, /\[anteAnimActive, session\.sessionId, session\.handNumber, session\.participantIds/);
  });
});
