/** Published table presentation state for the social app bot driver (docs/app.js). */

import {
  getActiveHandPacingMode,
  PACING_FORCE_RELEASE_MS,
  PACING_SOFT_UNBLOCK_MS,
} from "./handPacingMode";
import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import {
  isAntePresentationActive,
  isDealPresentationActive,
  isTrickCollectionActive,
} from "./presentationMotionBusy";

export interface TrickAnimationBusyState {
  pipelineActive: boolean;
  /** Staggered reveal still catching up to server/peak play count. */
  revealCatchUp: boolean;
  /** Trump upcard → suit-badge settle window (instant-place gate). */
  motionGateActive: boolean;
  peakPlayCount: number;
  displayedPlayCount: number;
  /** Hand deal / trump / draw presentation still running. */
  handPresenting: boolean;
  handPresentationPhase: string;
  /** Clockwise deal GSAP sequence in flight. */
  dealPresentationActive: boolean;
  /** Ante coin GSAP sequence in flight. */
  antePresentationActive: boolean;
  /** Trick packet fly to won-tricks pile in flight. */
  trickCollectionActive: boolean;
}

/** After this, bot driver may proceed even if presentation is still busy. */
export const BOT_PRESENTATION_SOFT_UNBLOCK_MS = PACING_SOFT_UNBLOCK_MS.apeSpeed;
/** After this, presentation busy flags are force-cleared for bots. */
export const BOT_PRESENTATION_FORCE_RELEASE_MS = PACING_FORCE_RELEASE_MS.apeSpeed;

function presentationSoftUnblockMs(): number {
  return PACING_SOFT_UNBLOCK_MS[getActiveHandPacingMode()];
}

function presentationForceReleaseMs(): number {
  return PACING_FORCE_RELEASE_MS[getActiveHandPacingMode()];
}

const IDLE: TrickAnimationBusyState = {
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
  dealPresentationActive: false,
  antePresentationActive: false,
  trickCollectionActive: false,
};

let state: TrickAnimationBusyState = IDLE;
const listeners = new Set<() => void>();

let botGateBypassUntil = 0;
let blockEpisode: {
  reason: string;
  since: number;
  blockedLogged: boolean;
} | null = null;

function statesEqual(a: TrickAnimationBusyState, b: TrickAnimationBusyState): boolean {
  return (
    a.pipelineActive === b.pipelineActive &&
    a.revealCatchUp === b.revealCatchUp &&
    a.motionGateActive === b.motionGateActive &&
    a.peakPlayCount === b.peakPlayCount &&
    a.displayedPlayCount === b.displayedPlayCount &&
    a.handPresenting === b.handPresenting &&
    a.handPresentationPhase === b.handPresentationPhase &&
    a.dealPresentationActive === b.dealPresentationActive &&
    a.antePresentationActive === b.antePresentationActive &&
    a.trickCollectionActive === b.trickCollectionActive
  );
}

/** Why bot draw/play is blocked — motionGate is visual-only and excluded. */
export function getTablePresentationBlockReason(
  s: TrickAnimationBusyState,
): string | null {
  if (s.dealPresentationActive) return "dealPresentationActive";
  if (s.antePresentationActive) return "antePresentationActive";
  if (s.trickCollectionActive) return "trickCollectionActive";
  if (s.handPresenting) return "handPresenting";
  if (s.pipelineActive) return "pipelineActive";
  if (s.revealCatchUp) return "revealCatchUp";
  if (s.peakPlayCount > s.displayedPlayCount && s.peakPlayCount > 0) {
    return "peakPlayCatchUp";
  }
  return null;
}

function isTablePresentationBusyFrom(s: TrickAnimationBusyState): boolean {
  return getTablePresentationBlockReason(s) != null;
}

/**
 * Whether hand presentation should block bot draw/play.
 * During server draw phase, peer draw animations are visual-only.
 */
export function handPresentingBlocksBots(
  isPresenting: boolean,
  handPresentationPhase: string,
  sessionPhase: string | null | undefined,
): boolean {
  if (!isPresenting) return false;
  if (sessionPhase === "play") return false;
  if (sessionPhase === "draw") {
    if (handPresentationPhase === "drawPlayer" || handPresentationPhase === "drawReady") {
      return false;
    }
  }
  return true;
}

export interface BotPresentationGateResult {
  blocked: boolean;
  reason: string | null;
  blockedMs: number;
  softUnblock: boolean;
  forceReleased: boolean;
}

export function forceReleasePresentationForBots(source: string): void {
  const from = { ...state };
  const blockedMs = blockEpisode ? Date.now() - blockEpisode.since : 0;
  const cleared: TrickAnimationBusyState = {
    ...state,
    pipelineActive: false,
    revealCatchUp: false,
    handPresenting: false,
    handPresentationPhase: "idle",
    peakPlayCount: state.displayedPlayCount,
    motionGateActive: false,
    dealPresentationActive: false,
    antePresentationActive: false,
    trickCollectionActive: false,
  };
  botGateBypassUntil = Date.now() + 1_500;
  blockEpisode = null;
  if (isGameFlowDebugEnabled()) {
    logGameFlow("trickAnimationBridge", "table-presentation-force-release", {
      source,
      blockedMs,
      from,
      to: cleared,
    });
  }
  setTrickAnimationBusyState(cleared);
}

export function evaluateBotPresentationGate(now = Date.now()): BotPresentationGateResult {
  if (now < botGateBypassUntil) {
    return {
      blocked: false,
      reason: null,
      blockedMs: 0,
      softUnblock: false,
      forceReleased: false,
    };
  }

  const reason = getTablePresentationBlockReason(state);
  if (reason == null) {
    blockEpisode = null;
    return {
      blocked: false,
      reason: null,
      blockedMs: 0,
      softUnblock: false,
      forceReleased: false,
    };
  }

  if (!blockEpisode || blockEpisode.reason !== reason) {
    blockEpisode = { reason, since: now, blockedLogged: false };
  }

  const blockedMs = now - blockEpisode.since;

  if (blockedMs >= presentationForceReleaseMs()) {
    if (isGameFlowDebugEnabled() && !blockEpisode.blockedLogged) {
      logGameFlow("trickAnimationBridge", "gate-force-release", { reason, blockedMs });
    }
    forceReleasePresentationForBots("gate-timeout");
    return {
      blocked: false,
      reason,
      blockedMs,
      softUnblock: true,
      forceReleased: true,
    };
  }

  if (blockedMs >= presentationSoftUnblockMs()) {
    if (isGameFlowDebugEnabled() && !blockEpisode.blockedLogged) {
      logGameFlow("trickAnimationBridge", "gate-soft-unblock", { reason, blockedMs });
      blockEpisode.blockedLogged = true;
    }
    return {
      blocked: false,
      reason,
      blockedMs,
      softUnblock: true,
      forceReleased: false,
    };
  }

  if (isGameFlowDebugEnabled() && !blockEpisode.blockedLogged) {
    logGameFlow("trickAnimationBridge", "gate-blocked", { reason, blockedMs });
    blockEpisode.blockedLogged = true;
  }

  return {
    blocked: true,
    reason,
    blockedMs,
    softUnblock: false,
    forceReleased: false,
  };
}

/** Bot driver gate — includes soft/force timeout overrides. */
export function isTablePresentationBusyForBots(now = Date.now()): boolean {
  return evaluateBotPresentationGate(now).blocked;
}

export function setTrickAnimationBusyState(next: TrickAnimationBusyState): void {
  if (statesEqual(state, next)) return;
  if (isGameFlowDebugEnabled()) {
    logGameFlow("trickAnimationBridge", "busy-state", {
      from: state,
      to: next,
      busy: isTablePresentationBusyFrom(next),
      blockReason: getTablePresentationBlockReason(next),
      motionGateActive: next.motionGateActive,
      handPresentationPhase: next.handPresentationPhase,
    });
  }
  state = next;
  if (getTablePresentationBlockReason(next) == null) {
    blockEpisode = null;
  }
  for (const listener of listeners) listener();
}

export function resetTrickAnimationBusyState(): void {
  botGateBypassUntil = 0;
  blockEpisode = null;
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
    state.trickCollectionActive ||
    (state.peakPlayCount > state.displayedPlayCount && state.peakPlayCount > 0)
  );
}

/** Sync motion-busy module flags into bridge state (called from TableSessionView). */
export function syncPresentationMotionBusyFlags(): void {
  setTrickAnimationBusyState({
    ...state,
    dealPresentationActive: isDealPresentationActive(),
    antePresentationActive: isAntePresentationActive(),
    trickCollectionActive: isTrickCollectionActive(),
  });
}

/** True while hand or trick presentation must finish before bot draw/play. */
export function isTablePresentationBusy(): boolean {
  return isTablePresentationBusyFrom(state);
}

export function subscribeTrickAnimationBusy(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
