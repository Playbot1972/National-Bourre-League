/** Cross-cutting presentation motion flags (deal, trick collection, …). */

import { isStalePresentationScope } from "./presentationScope";

let dealPresentationActive = false;
let trickCollectionActive = false;
let trickCollectionScopeKey: string | null = null;
let authoritativePresentationScopeKey = "0:0";
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function setAuthoritativePresentationScope(scopeKey: string): void {
  if (scopeKey === authoritativePresentationScopeKey) return;
  authoritativePresentationScopeKey = scopeKey;
  if (trickCollectionActive) {
    trickCollectionActive = false;
    trickCollectionScopeKey = null;
  }
  notify();
}

export function getAuthoritativePresentationScope(): string {
  return authoritativePresentationScopeKey;
}

export function setDealPresentationActive(active: boolean): void {
  if (dealPresentationActive === active) return;
  dealPresentationActive = active;
  notify();
}

export function isDealPresentationActive(): boolean {
  return dealPresentationActive;
}

export function setTrickCollectionActive(active: boolean, scopeKey?: string | null): void {
  if (!active) {
    if (scopeKey && trickCollectionScopeKey && scopeKey !== trickCollectionScopeKey) {
      return;
    }
    trickCollectionActive = false;
    trickCollectionScopeKey = null;
  } else {
    trickCollectionActive = true;
    trickCollectionScopeKey = scopeKey ?? authoritativePresentationScopeKey;
  }
  notify();
}

export function isTrickCollectionActive(): boolean {
  if (!trickCollectionActive) return false;
  if (
    trickCollectionScopeKey &&
    isStalePresentationScope(trickCollectionScopeKey, authoritativePresentationScopeKey)
  ) {
    return false;
  }
  return true;
}

export function subscribePresentationMotionBusy(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetPresentationMotionBusy(): void {
  dealPresentationActive = false;
  trickCollectionActive = false;
  trickCollectionScopeKey = null;
  notify();
}
