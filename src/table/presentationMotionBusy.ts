/** Cross-cutting presentation motion flags (deal, trick collection, …). */

let dealPresentationActive = false;
let antePresentationActive = false;
let trickCollectionActive = false;
let antePresentationClockKey: string | null = null;
let antePresentationStartedAtMs: number | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function setDealPresentationActive(active: boolean): void {
  if (dealPresentationActive === active) return;
  dealPresentationActive = active;
  notify();
}

export function isDealPresentationActive(): boolean {
  return dealPresentationActive;
}

export function setAntePresentationActive(active: boolean): void {
  if (antePresentationActive === active) return;
  antePresentationActive = active;
  if (!active) {
    antePresentationClockKey = null;
    antePresentationStartedAtMs = null;
  }
  notify();
}

/** Shared ante GSAP + avatar ring clock — keyed by session/hand. */
export function markAntePresentationClock(key: string, startedAtMs: number): void {
  antePresentationClockKey = key;
  antePresentationStartedAtMs = startedAtMs;
  notify();
}

export function readAntePresentationClock(key: string): number | null {
  return antePresentationClockKey === key ? antePresentationStartedAtMs : null;
}

export function isAntePresentationActive(): boolean {
  return antePresentationActive;
}

export function setTrickCollectionActive(active: boolean): void {
  if (trickCollectionActive === active) return;
  trickCollectionActive = active;
  notify();
}

export function isTrickCollectionActive(): boolean {
  return trickCollectionActive;
}

export function subscribePresentationMotionBusy(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetPresentationMotionBusy(): void {
  dealPresentationActive = false;
  antePresentationActive = false;
  trickCollectionActive = false;
  antePresentationClockKey = null;
  antePresentationStartedAtMs = null;
  notify();
}
