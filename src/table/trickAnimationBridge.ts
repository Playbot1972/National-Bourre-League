/** Published table presentation state for the social app bot driver (docs/app.js). */

import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import { REVEAL_CATCHUP_MIN_BACKLOG } from "./trickTiming";
import {
  getAuthoritativePresentationScope,
  isDealPresentationActive,
  isTrickCollectionActive,
  resetPresentationMotionBusy,
  setAuthoritativePresentationScope,
} from "./presentationMotionBusy";
import { isStalePresentationScope } from "./presentationScope";

export interface TrickAnimationBusyState {
  /** Canonical match identity — must match buildMatchKey(serverSnapshot). */
  matchKey: string;
  presentationScopeKey: string;
  pipelineActive: boolean;
  /** Staggered reveal still catching up to server/peak play count. */
  revealCatchUp: boolean;
  /** Trump upcard → suit-badge settle window (instant-place gate). */
  motionGateActive: boolean;
  peakPlayCount: number;
  displayedPlayCount: number;
  /** Live reveal progress — gate clears when revealedCount >= revealTarget. */
  revealedCount: number;
  revealTarget: number;
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
  matchKey: "",
  presentationScopeKey: "0:0",
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  revealedCount: 0,
  revealTarget: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
  dealPresentationActive: false,
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

let authoritativeMatchKey = "";

export function syncAuthoritativeMatchKey(matchKey: string): void {
  authoritativeMatchKey = matchKey;
}

export function getAuthoritativeMatchKey(): string {
  return authoritativeMatchKey;
}

function isMatchKeyStale(s: TrickAnimationBusyState): boolean {
  if (!authoritativeMatchKey || !s.matchKey) return false;
  return s.matchKey !== authoritativeMatchKey;
}

function statesEqual(a: TrickAnimationBusyState, b: TrickAnimationBusyState): boolean {
  return (
    a.matchKey === b.matchKey &&
    a.presentationScopeKey === b.presentationScopeKey &&
    a.pipelineActive === b.pipelineActive &&
    a.revealCatchUp === b.revealCatchUp &&
    a.motionGateActive === b.motionGateActive &&
    a.peakPlayCount === b.peakPlayCount &&
    a.displayedPlayCount === b.displayedPlayCount &&
    a.revealedCount === b.revealedCount &&
    a.revealTarget === b.revealTarget &&
    a.handPresenting === b.handPresenting &&
    a.handPresentationPhase === b.handPresentationPhase &&
    a.dealPresentationActive === b.dealPresentationActive &&
    a.trickCollectionActive === b.trickCollectionActive
  );
}

function isScopeStale(s: TrickAnimationBusyState): boolean {
  return isStalePresentationScope(s.presentationScopeKey, getAuthoritativePresentationScope());
}

/** Why bot draw/play is blocked — motionGate is visual-only and excluded. */
export function getTablePresentationBlockReason(
  s: TrickAnimationBusyState,
): string | null {
  if (isMatchKeyStale(s)) return null;
  if (isScopeStale(s)) return null;
  if (s.dealPresentationActive) return "dealPresentationActive";
  if (s.trickCollectionActive) return "trickCollectionActive";
  if (s.handPresenting) return "handPresenting";
  if (s.pipelineActive) return "pipelineActive";
  if (s.revealCatchUp) return "revealCatchUp";
  const revealBacklog = Math.max(0, s.revealTarget - s.revealedCount);
  if (
    s.peakPlayCount > s.displayedPlayCount &&
    s.peakPlayCount > 0 &&
    revealBacklog >= REVEAL_CATCHUP_MIN_BACKLOG
  ) {
    return "peakPlayCatchUp";
  }
  return null;
}

function isTablePresentationBusyFrom(s: TrickAnimationBusyState): boolean {
  return getTablePresentationBlockReason(s) != null;
}

/** Reveal-chain phases that may lag behind an authoritative server draw phase. */
const STALE_DRAW_REVEAL_PHASES = new Set([
  "handReset",
  "ante",
  "trumpReveal",
  "trumpMerge",
]);

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
    if (STALE_DRAW_REVEAL_PHASES.has(handPresentationPhase)) {
      return false;
    }
  }
  return true;
}

/** Debug helper — why bots are blocked by hand presentation (null = not blocked). */
export function handPresentingBlockReasonForBots(
  isPresenting: boolean,
  handPresentationPhase: string,
  sessionPhase: string | null | undefined,
): string | null {
  if (!handPresentingBlocksBots(isPresenting, handPresentationPhase, sessionPhase)) {
    return null;
  }
  return `${handPresentationPhase}@${sessionPhase ?? "null"}`;
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
    presentationScopeKey: getAuthoritativePresentationScope(),
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
export function isTablePresentationBusyForBots(now = Date.now()): boolean {
  return evaluateBotPresentationGate(now).blocked;
}

export function setTrickAnimationBusyState(next: TrickAnimationBusyState): void {
  const authoritative = getAuthoritativePresentationScope();
  let scoped: TrickAnimationBusyState = isStalePresentationScope(
    next.presentationScopeKey,
    authoritative,
  )
    ? {
        ...next,
        presentationScopeKey: authoritative,
        pipelineActive: false,
        revealCatchUp: false,
        peakPlayCount: 0,
        displayedPlayCount: 0,
        revealedCount: 0,
        revealTarget: 0,
        trickCollectionActive: false,
      }
    : next;
  if (isMatchKeyStale(scoped)) {
    scoped = {
      ...scoped,
      matchKey: authoritativeMatchKey,
      pipelineActive: false,
      revealCatchUp: false,
      motionGateActive: false,
      handPresenting: false,
      handPresentationPhase: "idle",
      peakPlayCount: scoped.displayedPlayCount,
      dealPresentationActive: false,
      trickCollectionActive: false,
    };
  }
  if (statesEqual(state, scoped)) return;
  if (isGameFlowDebugEnabled()) {
    logGameFlow("trickAnimationBridge", "busy-state", {
      from: state,
      to: scoped,
      busy: isTablePresentationBusyFrom(scoped),
      blockReason: getTablePresentationBlockReason(scoped),
      motionGateActive: scoped.motionGateActive,
      handPresentationPhase: scoped.handPresentationPhase,
      authoritativeScope: authoritative,
    });
  }
  state = scoped;
  if (getTablePresentationBlockReason(scoped) == null) {
    blockEpisode = null;
  }
  for (const listener of listeners) listener();
}

export function syncAuthoritativePresentationScope(scopeKey: string): void {
  setAuthoritativePresentationScope(scopeKey);
  if (isStalePresentationScope(state.presentationScopeKey, scopeKey)) {
    setTrickAnimationBusyState({
      ...state,
      presentationScopeKey: scopeKey,
      pipelineActive: false,
      revealCatchUp: false,
      peakPlayCount: 0,
      displayedPlayCount: 0,
      revealedCount: 0,
      revealTarget: 0,
      trickCollectionActive: false,
    });
  }
}

export function resetTrickAnimationBusyState(): void {
  botGateBypassUntil = 0;
  blockEpisode = null;
  authoritativeMatchKey = "";
  setAuthoritativePresentationScope("0:0");
  resetPresentationMotionBusy();
  setTrickAnimationBusyState(IDLE);
}

export function getTrickAnimationBusyState(): TrickAnimationBusyState {
  return state;
}

/** True while trick UI must finish before the next bot card play. */
export function isTrickAnimationBusy(): boolean {
  if (isMatchKeyStale(state)) return false;
  if (isScopeStale(state)) return false;
  return (
    state.pipelineActive ||
    state.revealCatchUp ||
    state.motionGateActive ||
    state.trickCollectionActive ||
    (state.peakPlayCount > state.displayedPlayCount &&
      state.peakPlayCount > 0 &&
      Math.max(0, state.revealTarget - state.revealedCount) >= REVEAL_CATCHUP_MIN_BACKLOG)
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
