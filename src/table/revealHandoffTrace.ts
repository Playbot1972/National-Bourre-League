import type { HandPresentationStore, HandServerSnapshot } from "./handPresentationMachine";
import type { SerializedCard } from "./types";

/** Debug/test snapshot for reveal→draw handoff recon (hands 1–5). */
export interface RevealHandoffTrace {
  handNumber: number;
  serverPhase: string | null;
  presentationPhase: string;
  trumpUpcard: SerializedCard | null;
  trumpMergedIntoHand: boolean;
  dealPresentationComplete: boolean;
  trumpRevealActive: boolean;
  trumpMergeActive: boolean;
  phaseStartedAt: number;
  revealPresentationReady: boolean;
}

export interface TrumpRevealReconStep {
  handNumber: number;
  serverPhase: string | null;
  presentationPhase: string;
  trumpUpcard: SerializedCard | null;
  trumpMergedIntoHand: boolean;
  trumpRevealActive: boolean;
  trumpMergeActive: boolean;
  phaseStartedAt: number;
  revealPresentationReady: boolean;
  clearTrumpBranchExecuted: boolean;
  serverDrawFastForward: boolean;
  phaseAdvancedToDraw: boolean;
  revertedToTrumpReveal: boolean;
}

/** TableSessionView retry gate + client advance attempt (for hand 1 vs 2 recon). */
export interface RevealRetryReconTrace {
  handNumber: number;
  serverPhase: string | null;
  presentationPhase: string;
  trumpUpcard: SerializedCard | null;
  trumpMergedIntoHand: boolean;
  trumpRevealActive: boolean;
  trumpMergeActive: boolean;
  phaseStartedAt: number;
  revealPresentationReady: boolean;
  retryTimerArmed: boolean;
  advanceHandRevealAttempted: boolean;
  clientAdvancedToDraw: boolean;
  guardBlockedRetry: boolean;
}

export function traceRevealHandoffState(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): RevealHandoffTrace {
  return {
    handNumber: store.handNumber,
    serverPhase: snapshot.phase,
    presentationPhase: store.phase,
    trumpUpcard: snapshot.trumpUpcard,
    trumpMergedIntoHand: store.trumpMergedIntoHand,
    dealPresentationComplete: store.dealPresentationComplete,
    trumpRevealActive: store.trumpRevealActive,
    trumpMergeActive: store.trumpMergeActive,
    phaseStartedAt: store.phaseStartedAt,
    revealPresentationReady: revealPresentationReady(store, snapshot),
  };
}

export function traceTrumpRevealReconStep(
  before: HandPresentationStore,
  after: HandPresentationStore,
  snapshot: HandServerSnapshot,
  eventType: string,
): TrumpRevealReconStep {
  const prevSnap = before.prevSnapshot;
  const trumpCleared =
    eventType === "serverUpdate" &&
    Boolean(prevSnap?.trumpUpcard) &&
    !snapshot.trumpUpcard;
  const serverDrawFastForward =
    eventType === "serverUpdate" &&
    snapshot.phase === "draw" &&
    (before.phase === "trumpReveal" ||
      before.phase === "trumpMerge" ||
      (before.phase === "ante" && before.dealPresentationComplete)) &&
    (after.phase === "drawPlayer" || after.phase === "drawReady");
  const clearTrumpBranchExecuted =
    trumpCleared &&
    (before.phase === "trumpReveal" || before.phase === "trumpMerge") &&
    (after.phase === "drawPlayer" || after.phase === "drawReady");
  const phaseAdvancedToDraw =
    (before.phase === "trumpReveal" || before.phase === "trumpMerge") &&
    (after.phase === "drawPlayer" || after.phase === "drawReady");
  const revertedToTrumpReveal =
    before.phase !== "trumpReveal" &&
    after.phase === "trumpReveal" &&
    (before.phase === "drawPlayer" || before.phase === "drawReady");

  return {
    handNumber: after.handNumber,
    serverPhase: snapshot.phase,
    presentationPhase: after.phase,
    trumpUpcard: snapshot.trumpUpcard,
    trumpMergedIntoHand: after.trumpMergedIntoHand,
    trumpRevealActive: after.trumpRevealActive,
    trumpMergeActive: after.trumpMergeActive,
    phaseStartedAt: after.phaseStartedAt,
    revealPresentationReady: revealPresentationReady(after, snapshot),
    clearTrumpBranchExecuted,
    serverDrawFastForward,
    phaseAdvancedToDraw,
    revertedToTrumpReveal,
  };
}

/** Mirrors TableSessionView retry effect gating for recon tests. */
export function traceRevealRetryGate(input: {
  store: HandPresentationStore;
  snapshot: HandServerSnapshot;
  hasOnAdvanceReveal: boolean;
  advanceHandRevealAttempted?: boolean;
  clientAdvancedToDraw?: boolean;
}): RevealRetryReconTrace {
  const ready = revealPresentationReady(input.store, input.snapshot);
  const retryTimerArmed =
    input.snapshot.phase === "reveal" && ready && input.hasOnAdvanceReveal;
  const guardBlockedRetry =
    input.snapshot.phase !== "reveal" &&
    (input.store.phase === "trumpReveal" || input.store.phase === "trumpMerge");

  return {
    handNumber: input.store.handNumber,
    serverPhase: input.snapshot.phase,
    presentationPhase: input.store.phase,
    trumpUpcard: input.snapshot.trumpUpcard,
    trumpMergedIntoHand: input.store.trumpMergedIntoHand,
    trumpRevealActive: input.store.trumpRevealActive,
    trumpMergeActive: input.store.trumpMergeActive,
    phaseStartedAt: input.store.phaseStartedAt,
    revealPresentationReady: ready,
    retryTimerArmed,
    advanceHandRevealAttempted: input.advanceHandRevealAttempted ?? false,
    clientAdvancedToDraw: input.clientAdvancedToDraw ?? false,
    guardBlockedRetry,
  };
}

export function revealPresentationReady(
  store: HandPresentationStore,
  snapshot: Pick<HandServerSnapshot, "trumpUpcard">,
): boolean {
  return (
    (store.phase === "drawPlayer" || store.phase === "drawReady") &&
    (store.trumpMergedIntoHand || !snapshot.trumpUpcard)
  );
}
