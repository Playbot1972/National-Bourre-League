/**
 * Freeze stage-fit measurement while card motion is in flight so hero lifts,
 * trick reveals, and deal/collect animations cannot resize the table stage.
 */

import {
  isDealPresentationActive,
  isTrickCollectionActive,
  subscribePresentationMotionBusy,
} from "./presentationMotionBusy";
import {
  getTrickAnimationBusyState,
  isTrickAnimationBusy,
  subscribeTrickAnimationBusy,
} from "./trickAnimationBridge";

let heroPlayMotionActive = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

/** Hero submitted a play — local lift / fly in flight. */
export function setHeroPlayMotionActive(active: boolean): void {
  if (heroPlayMotionActive === active) return;
  heroPlayMotionActive = active;
  notify();
}

export function isHeroPlayMotionActive(): boolean {
  return heroPlayMotionActive;
}

/** True while ResizeObserver / stage-fit math must not run. */
export function isStageFitMeasurementFrozen(): boolean {
  if (isDealPresentationActive() || isTrickCollectionActive()) return true;
  if (heroPlayMotionActive) return true;
  if (isTrickAnimationBusy()) return true;
  const bridge = getTrickAnimationBusyState();
  if (bridge.handPresenting && bridge.handPresentationPhase !== "idle") return true;
  return false;
}

export function subscribeStageFitMotionFreeze(listener: () => void): () => void {
  listeners.add(listener);
  const unsubBusy = subscribePresentationMotionBusy(listener);
  const unsubTrick = subscribeTrickAnimationBusy(listener);
  return () => {
    listeners.delete(listener);
    unsubBusy();
    unsubTrick();
  };
}
