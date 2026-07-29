/** Published table presentation state for the social app bot driver (docs/app.js). */

import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import {
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
  /** Trick packet fly to won-tricks pile in flight. */
  trickCollectionActive: boolean;
}

/** After this, bot driver may proceed even if presentation is still busy. */
export const BOT_PRESENTATION_SOFT_UNBLOCK_MS = 5_500;
/** After this, presentation busy flags are force-cleared for bots. */
export const BOT_PRESENTATION_FORCE_RELEASE_MS = 7_000;

const IDLE: TrickAnimationBusyState = {
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
  dealPresentationActive: false,
  trickCollectionActive: false,
};

let state: TrickAnimationBusyState = IDLE;
const listeners = new Set<() => void>();

/** Latest hand phase from TableSessionView — gates visual-only play catch-up for bots. */
let botGateSessionPhase: string | null = null;

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
    a.trickCollectionActive === b.trickCollectionActive
  );
}

export interface TablePresentationBlockOptions {
  /** When true, visual-only play-phase catch-up does not block bot submit. */
  forBots?: boolean;
  sessionPhase?: string | null;
}

/** Sync hand phase for bot presentation gating (play-phase trick reveal is visual-only). */
export function setBotPresentationSessionPhase(phase: string | null | undefined): void {
  botGateSessionPhase = phase ?? null;
}

function visualOnlyCatchUpForBots(sessionPhase: string | null | undefined): boolean {
  return sessionPhase === "play" || sessionPhase === "draw";
}

/** Draw-phase ante/trump animations are visual once server draw is live. */
const DRAW_PHASE_VISUAL_HAND_PRESENTATION = new Set([
  "ante",
  "trumpReveal",
  "trumpMerge",
  "drawPlayer",
  "drawReady",
]);

export function drawPhaseHandPresentationBlocksBots(handPresentationPhase: string): boolean {
  return !DRAW_PHASE_VISUAL_HAND_PRESENTATION.has(handPresentationPhase);
}

function handPresentingBlockReason(
  s: TrickAnimationBusyState,
  forBots: boolean,
  sessionPhase: string | null | undefined,
): string | null {
  if (!s.handPresenting) return null;
  if (forBots && sessionPhase === "play") return null;
  if (
    forBots &&
    sessionPhase === "draw" &&
    !drawPhaseHandPresentationBlocksBots(s.handPresentationPhase)
  ) {
    return null;
  }
  return "handPresenting";
}

/** Why bot draw/play is blocked — motionGate is visual-only and excluded. */
export function getTablePresentationBlockReason(
  s: TrickAnimationBusyState,
  options: TablePresentationBlockOptions = {},
): string | null {
  const forBots = options.forBots === true;
  const sessionPhase = options.sessionPhase ?? botGateSessionPhase;
  if (
    s.dealPresentationActive &&
    !(forBots && visualOnlyCatchUpForBots(sessionPhase))
  ) {
    return "dealPresentationActive";
  }
  if (s.trickCollectionActive) return "trickCollectionActive";
  const handReason = handPresentingBlockReason(s, forBots, sessionPhase);
  if (handReason) return handReason;
  if (s.pipelineActive) return "pipelineActive";
  if (s.revealCatchUp && !(forBots && visualOnlyCatchUpForBots(sessionPhase))) {
    return "revealCatchUp";
  }
  if (
    s.peakPlayCount > s.displayedPlayCount &&
    s.peakPlayCount > 0 &&
    !(forBots && visualOnlyCatchUpForBots(sessionPhase))
  ) {
    return "peakPlayCatchUp";
  }
  return null;
}

function isTablePresentationBusyFrom(
  s: TrickAnimationBusyState,
  options?: TablePresentationBlockOptions,
): boolean {
  return getTablePresentationBlockReason(s, options) != null;
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
    return drawPhaseHandPresentationBlocksBots(handPresentationPhase);
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

export function evaluateBotPresentationGate(
  now = Date.now(),
  sessionPhaseOverride?: string | null,
): BotPresentationGateResult {
  if (now < botGateBypassUntil) {
    return {
      blocked: false,
      reason: null,
      blockedMs: 0,
      softUnblock: false,
      forceReleased: false,
    };
  }

  const sessionPhase = sessionPhaseOverride ?? botGateSessionPhase;
  const reason = getTablePresentationBlockReason(state, { forBots: true, sessionPhase });
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

  if (!blockEpisode) {
    blockEpisode = { reason, since: now, blockedLogged: false };
  } else if (blockEpisode.reason !== reason) {
    // Keep episode start time when reasons churn — prevents indefinite soft/force unblock delay.
    blockEpisode = { reason, since: blockEpisode.since, blockedLogged: blockEpisode.blockedLogged };
  }

  const blockedMs = now - blockEpisode.since;

  if (blockedMs >= BOT_PRESENTATION_FORCE_RELEASE_MS) {
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

  if (blockedMs >= BOT_PRESENTATION_SOFT_UNBLOCK_MS) {
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
export function isTablePresentationBusyForBots(
  now = Date.now(),
  sessionPhaseOverride?: string | null,
): boolean {
  return evaluateBotPresentationGate(now, sessionPhaseOverride).blocked;
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
  if (getTablePresentationBlockReason(next, { forBots: true }) == null) {
    blockEpisode = null;
  }
  for (const listener of listeners) listener();
}

export function resetTrickAnimationBusyState(): void {
  botGateBypassUntil = 0;
  blockEpisode = null;
  botGateSessionPhase = null;
  setTrickAnimationBusyState(IDLE);
}

/** Drop all bridge subscribers — call when the table session unmounts. */
export function disposeTrickAnimationBusyListeners(): void {
  listeners.clear();
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
