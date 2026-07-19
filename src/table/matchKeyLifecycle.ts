/** Scoped resets when the authoritative match key advances. */

import { invalidateQueuedHeroIntentOlderThan } from "./heroQueuedIntent";
import { resetPresentationMotionBusy } from "./presentationMotionBusy";
import {
  getTrickAnimationBusyState,
  setTrickAnimationBusyState,
} from "./trickAnimationBridge";

export function clearScopedPresentationState(prevMatchKey: string): void {
  const busy = getTrickAnimationBusyState();
  if (busy.matchKey !== prevMatchKey) return;
  setTrickAnimationBusyState({
    ...busy,
    pipelineActive: false,
    revealCatchUp: false,
    motionGateActive: false,
    handPresenting: false,
    handPresentationPhase: "idle",
    peakPlayCount: busy.displayedPlayCount,
    dealPresentationActive: false,
    trickCollectionActive: false,
  });
}

/** Bot think window lifecycle is owned by bot-play-delay (prepareTurn / cancelPending). */
export function clearTurnTimers(_prevMatchKey: string): void {}

export function clearTrickPresentation(prevMatchKey: string): void {
  const busy = getTrickAnimationBusyState();
  if (busy.matchKey !== prevMatchKey) return;
  resetPresentationMotionBusy();
}

export { invalidateQueuedHeroIntentOlderThan };
