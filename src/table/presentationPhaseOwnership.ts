/**
 * Single place for hand/trick presentation phase ownership rules.
 * Machine decides when a phase may begin; motion callbacks complete motion-owned phases.
 */

import type { HandPresentationPhase } from "./handPresentationTiming";
import type { TrickPresentationPhase } from "./trickTiming";

export interface DealPresentationGateInput {
  dealPresentationAllowed: boolean;
  sessionPhase: string | null | undefined;
  privateHandReady: boolean;
  trumpRevealActive?: boolean;
  trumpMergeActive?: boolean;
  anteAnimActive?: boolean;
}

/** True when clockwise deal GSAP may start (no overlapping trump/ante motion). */
export function canStartDealPresentation(input: DealPresentationGateInput): boolean {
  if (input.trumpRevealActive || input.trumpMergeActive || input.anteAnimActive) {
    return false;
  }
  const inDealPhase =
    input.sessionPhase === "reveal" ||
    input.sessionPhase === "decision" ||
    input.sessionPhase === "draw" ||
    input.sessionPhase === "play";
  return input.dealPresentationAllowed && inDealPhase && input.privateHandReady;
}

export interface HandPhaseTimerGate {
  phase: HandPresentationPhase;
  anteAnimActive: boolean;
  trumpMergeActive: boolean;
}

/**
 * Hand phases where a scheduled advancePhase timer is the normal completion path.
 * Motion-owned phases (ante, active trump merge) complete via explicit callbacks.
 */
export function isHandPhaseTimerOwned(gate: HandPhaseTimerGate): boolean {
  if (gate.phase === "ante" || gate.anteAnimActive) return false;
  if (gate.trumpMergeActive) return false;
  return true;
}

/** Trick sub-phases where GSAP owns visual completion before the next advance. */
export function isTrickPhaseMotionOwned(phase: TrickPresentationPhase): boolean {
  return phase === "collectTrick";
}

/** Trick sub-phases advanced by the resolution timer chain (not motion callbacks). */
export function isTrickPhaseTimerOwned(phase: TrickPresentationPhase): boolean {
  return (
    phase === "trickComplete" ||
    phase === "winnerReveal" ||
    phase === "nextLeadReady"
  );
}
