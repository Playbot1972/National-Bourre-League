/** Authoritative hand/trick identity for presentation busy gates. */

import type { CurrentTrickState } from "./types";
import type { TrickPresentationStore } from "./trickPresentationMachine";

export function presentationScopeKey(
  handNumber: number,
  trickNumber: number | null | undefined,
): string {
  const hand = Math.max(0, Number(handNumber) || 0);
  const trick = Math.max(0, Number(trickNumber) || 0);
  return `${hand}:${trick}`;
}

export function serverTrickNumber(
  currentTrick: CurrentTrickState | null | undefined,
): number {
  return Math.max(0, currentTrick?.trickNumber ?? 0);
}

/** Trick number the client presentation is still draining (may lag server). */
export function presentingTrickNumber(store: TrickPresentationStore): number {
  if (store.phase !== "live") {
    return store.frozenTrick?.trickNumber ?? 0;
  }
  return (
    store.pendingResolution?.frozen.trickNumber ??
    store.prevTrick?.trickNumber ??
    0
  );
}

/** True when server scope advanced past what presentation is still showing. */
export function shouldReinitPresentationScope(input: {
  handNumber: number;
  prevHandNumber: number;
  serverTrickNumber: number;
  prevServerTrickNumber: number;
  store: TrickPresentationStore;
}): boolean {
  const {
    handNumber,
    prevHandNumber,
    serverTrickNumber: serverTrick,
    prevServerTrickNumber,
    store,
  } = input;

  if (handNumber > 0 && handNumber !== prevHandNumber) return true;
  if (handNumber <= 0 || serverTrick <= 0) return false;
  if (serverTrick === prevServerTrickNumber) return false;

  const presenting = presentingTrickNumber(store);
  const pipelineActive = store.phase !== "live" || Boolean(store.pendingResolution);
  if (serverTrick > presenting) return true;
  if (pipelineActive && serverTrick !== prevServerTrickNumber) return true;
  return false;
}

export function isStalePresentationScope(
  scopeKey: string,
  authoritativeScopeKey: string,
): boolean {
  return scopeKey !== authoritativeScopeKey;
}
