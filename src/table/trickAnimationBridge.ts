/** Published trick animation state for the social app bot driver (docs/app.js). */

export interface TrickAnimationBusyState {
  pipelineActive: boolean;
  /** Staggered reveal still catching up to server/peak play count. */
  revealCatchUp: boolean;
  /** Trump upcard → suit-badge settle window (instant-place gate). */
  motionGateActive: boolean;
  peakPlayCount: number;
  displayedPlayCount: number;
}

const IDLE: TrickAnimationBusyState = {
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
};

let state: TrickAnimationBusyState = IDLE;
const listeners = new Set<() => void>();

function statesEqual(a: TrickAnimationBusyState, b: TrickAnimationBusyState): boolean {
  return (
    a.pipelineActive === b.pipelineActive &&
    a.revealCatchUp === b.revealCatchUp &&
    a.motionGateActive === b.motionGateActive &&
    a.peakPlayCount === b.peakPlayCount &&
    a.displayedPlayCount === b.displayedPlayCount
  );
}

export function setTrickAnimationBusyState(next: TrickAnimationBusyState): void {
  if (statesEqual(state, next)) return;
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

export function subscribeTrickAnimationBusy(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
