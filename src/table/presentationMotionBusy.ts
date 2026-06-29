/** Cross-cutting presentation motion flags (deal, trick collection, …). */

let dealPresentationActive = false;
let trickCollectionActive = false;
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
  trickCollectionActive = false;
  notify();
}
