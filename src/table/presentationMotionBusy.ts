/** Cross-cutting presentation motion flags (deal, trick collection, …). */

let dealPresentationActive = false;
let antePresentationActive = false;
let trickCollectionActive = false;
let anteTimelineKey: string | null = null;
let anteTimelineReader: (() => number) | null = null;
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
    clearAntePresentationTimeline();
  }
  notify();
}

/** Bind the live GSAP ante timeline — ring reads `reader()` for elapsed seconds. */
export function registerAntePresentationTimeline(key: string, reader: () => number): void {
  anteTimelineKey = key;
  anteTimelineReader = reader;
  notify();
}

export function readAntePresentationTimelineSec(key: string): number | null {
  if (anteTimelineKey !== key || !anteTimelineReader) return null;
  return anteTimelineReader();
}

export function clearAntePresentationTimeline(): void {
  anteTimelineKey = null;
  anteTimelineReader = null;
  notify();
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
  clearAntePresentationTimeline();
  notify();
}
