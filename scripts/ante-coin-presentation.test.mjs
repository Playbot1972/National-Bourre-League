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
  const pot = readFileSync(join(root, "src/table/PotCenter.tsx"), "utf8");
  const card = readFileSync(join(root, "src/table/CardTable.tsx"), "utf8");
  const timing = readFileSync(join(root, "src/table/trickTiming.ts"), "utf8");
  const bridge = readFileSync(join(root, "src/table/trickAnimationBridge.ts"), "utf8");
  const tableView = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");

  it("reuses single GSAP ante path hooked from table views", () => {
    assert.match(hook, /runClockwiseAnteCoinPresentation/);
    assert.match(hook, /useTableAntePresentation/);
    assert.match(card, /useTableAntePresentation/);
    assert.doesNotMatch(pot, /bpot__ante-chips/);
  });

  it("uses bot play think policy for ante coin timing", () => {
    assert.match(hook, /buildAnteCoinDelayPlan/);
    const botTiming = readFileSync(join(root, "src/session/botActionTiming.ts"), "utf8");
    assert.match(botTiming, /buildAnteCoinDelayPlan/);
    assert.match(botTiming, /resolveAntePostDelayMs/);
    assert.match(botTiming, /pickBotPlayDelayMs/);
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

  it("blocks bot advance while ante presentation is active", () => {
    assert.match(bridge, /antePresentationActive/);
    assert.match(bridge, /isAntePresentationActive/);
    assert.match(bridge, /"antePresentationActive"/);
    assert.match(tableView, /isAntePresentationActive/);
    assert.match(tableView, /antePresentationActive:/);
  });

  it("wires ante avatar timer ring to shared delay plan", () => {
    const countdown = readFileSync(join(root, "src/table/anteSeatCountdown.ts"), "utf8");
    const anteHook = readFileSync(join(root, "src/table/hooks/useAnteSeatCountdown.ts"), "utf8");
    assert.match(countdown, /buildAnteSeatCountdownState/);
    assert.match(countdown, /resolveAnteSeatThinkAtElapsed/);
    assert.match(anteHook, /buildAnteCoinDelayPlan/);
    assert.match(anteHook, /readAntePresentationClock/);
    assert.match(tableView, /useAnteSeatCountdown/);
    assert.match(tableView, /anteSeatCountdown/);
    assert.match(tableView, /avatarTurnCountdown/);
    assert.match(hook, /markAntePresentationClock/);
    assert.match(motion, /plan\.thinkBeforeMs/);
  });

  it("does not restart ante timeline on participantIds dependency churn", () => {
    assert.match(hook, /buildAnteCoinDelayPlan/);
    assert.match(hook, /\[anteAnimActive, session\.sessionId, session\.handNumber, tableRootRef\]/);
    assert.match(hook, /anteAnimActiveRef/);
    assert.match(hook, /lastAnteKeyRef\.current === anteKey/);
  });
});
