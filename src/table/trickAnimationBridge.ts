/** Published table presentation state for the social app bot driver (docs/app.js). */

import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";

export interface TrickAnimationBusyState {
  pipelineActive: boolean;
  /** Staggered reveal still catching up to server/peak play count. */
  revealCatchUp: boolean;
  /** Trump upcard → suit-badge settle window (instant-place gate). */
  motionGateActive: boolean;
  peakPlayCount: number;
  displayedPlayCount: number;
  /** Hand deal / trump / draw presentation still running. */
  handPresenting: boolean;
  handPresentationPhase: string;
}

const IDLE: TrickAnimationBusyState = {
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
};

let state: TrickAnimationBusyState = IDLE;
const listeners = new Set<() => void>();

function statesEqual(a: TrickAnimationBusyState, b: TrickAnimationBusyState): boolean {
  return (
    a.pipelineActive === b.pipelineActive &&
    a.revealCatchUp === b.revealCatchUp &&
    a.motionGateActive === b.motionGateActive &&
    a.peakPlayCount === b.peakPlayCount &&
    a.displayedPlayCount === b.displayedPlayCount &&
    a.handPresenting === b.handPresenting &&
    a.handPresentationPhase === b.handPresentationPhase
  );
}

function isTablePresentationBusyFrom(s: TrickAnimationBusyState): boolean {
  return (
    s.handPresenting ||
    s.pipelineActive ||
    s.revealCatchUp ||
    s.motionGateActive ||
    (s.peakPlayCount > s.displayedPlayCount && s.peakPlayCount > 0)
  );
}

export function setTrickAnimationBusyState(next: TrickAnimationBusyState): void {
  if (statesEqual(state, next)) return;
  if (isGameFlowDebugEnabled()) {
    logGameFlow("trickAnimationBridge", "busy-state", {
      from: state,
      to: next,
      busy: isTablePresentationBusyFrom(next),
    });
  }
  state = next;
  for (const listener of listeners) listener();
}

export function resetTrickAnimationBusyState(): void {
  setTrickAnimationBusyState(IDLE);
}

export function getTrickAnimationBusyState(): TrickAnimationBusyState {
  return state;
}

/** True while trick UI must finish before the next bot card play. */
export function isTrickAnimationBusy(): boolean {
  return (
    state.pipelineActive ||
    state.revealCatchUp ||
    state.motionGateActive ||
    (state.peakPlayCount > state.displayedPlayCount && state.peakPlayCount > 0)
  );
}

/** True while hand or trick presentation must finish before bot draw/play. */
export function isTablePresentationBusy(): boolean {
  return isTablePresentationBusyFrom(state);
}

export function subscribeTrickAnimationBusy(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
