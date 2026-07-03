import type { HandPresentationStore, HandServerSnapshot } from "./handPresentationMachine";

/** Debug/test snapshot for reveal→draw handoff recon (hands 1–5). */
export interface RevealHandoffTrace {
  handNumber: number;
  serverPhase: string | null;
  presentationPhase: string;
  trumpMergedIntoHand: boolean;
  dealPresentationComplete: boolean;
  trumpRevealActive: boolean;
  phaseStartedAt: number;
}

export function traceRevealHandoffState(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): RevealHandoffTrace {
  return {
    handNumber: store.handNumber,
    serverPhase: snapshot.phase,
    presentationPhase: store.phase,
    trumpMergedIntoHand: store.trumpMergedIntoHand,
    dealPresentationComplete: store.dealPresentationComplete,
    trumpRevealActive: store.trumpRevealActive,
    phaseStartedAt: store.phaseStartedAt,
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
