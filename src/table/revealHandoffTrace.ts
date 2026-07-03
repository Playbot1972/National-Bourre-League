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
  phaseAdvancedToDraw: boolean;
  revertedToTrumpReveal: boolean;
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
  const trumpCleared =
    eventType === "serverUpdate" &&
    Boolean(before.prevSnapshot?.trumpUpcard) &&
    !snapshot.trumpUpcard;
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
    phaseAdvancedToDraw,
    revertedToTrumpReveal,
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
