/** Session enrollment / public hand view — mirrors docs/firestore.js for tests. */

import { decisionAsEnrollmentView } from "../game/decision";
import type { HandDecision } from "../game/types";
import { isHandComplete, totalTricksPlayed, MAX_TRICKS_PER_HAND } from "../table/logic";

export interface HandEnrollmentView {
  active?: boolean;
  orderedPlayerIds?: string[];
  currentIndex?: number;
  turnDeadlineMs?: number;
  enrolledIds?: string[];
  declinedIds?: string[];
}

export interface PublicHandView {
  phase?: string | null;
  participantIds?: string[];
  tricksByPlayer?: Record<string, number>;
  drawCompletedIds?: string[];
  handDecision?: HandDecision | null;
}

export interface SessionHandView {
  currentHand?: PublicHandView;
  handEnrollment?: HandEnrollmentView | null;
  liveEnrollment?: {
    active?: boolean;
    deal?: {
      publicHand?: PublicHandView;
      sortedPlayerIds?: string[];
    };
  } | null;
}

function emptyPreDealHand(): PublicHandView {
  return { tricksByPlayer: {}, participantIds: [] };
}

export function isClearedPreDealHand(hand: PublicHandView | null | undefined): boolean {
  const h = hand ?? emptyPreDealHand();
  if (
    h.phase === "draw" ||
    h.phase === "play" ||
    h.phase === "reveal" ||
    h.phase === "decision"
  ) {
    return false;
  }
  if ((h.participantIds?.length ?? 0) > 0) return false;
  const tricks = h.tricksByPlayer ?? {};
  return !Object.values(tricks).some((n) => (n || 0) > 0);
}

function handInProgress(hand: PublicHandView | null | undefined): boolean {
  if (!hand) return false;
  const phase = hand.phase ?? null;
  if (
    phase !== "draw" &&
    phase !== "play" &&
    phase !== "reveal" &&
    phase !== "decision"
  ) {
    return false;
  }
  const participantIds = hand.participantIds ?? [];
  if (participantIds.length === 0) return false;
  const tricks = hand.tricksByPlayer ?? {};
  if (isHandComplete(tricks, participantIds)) return false;
  if (totalTricksPlayed(tricks, participantIds) >= MAX_TRICKS_PER_HAND) return false;
  return true;
}

/** Prefer the mirror that reflects more hand progress when both are in-flight. */
function handProgressScore(hand: PublicHandView | null | undefined): number {
  if (!hand) return 0;
  const phase = hand.phase ?? "";
  let score = phase === "play" ? 1_000 : phase === "draw" ? 100 : phase === "decision" ? 50 : phase === "reveal" ? 25 : 0;
  score += (hand.drawCompletedIds?.length ?? 0) * 10;
  const participants = hand.participantIds ?? [];
  score += totalTricksPlayed(hand.tricksByPlayer ?? {}, participants);
  const decision = hand.handDecision;
  if (phase === "decision" && decision) {
    score += (decision.currentIndex ?? 0) * 5;
    score += (decision.playingIds?.length ?? 0) * 2;
    score += (decision.passedIds?.length ?? 0) * 2;
  }
  return score;
}

function preferInProgressHand(
  current: PublicHandView,
  livePublic: PublicHandView | null | undefined,
): PublicHandView {
  if (!handInProgress(livePublic)) return current;
  if (!handInProgress(current)) return livePublic!;
  return handProgressScore(livePublic) >= handProgressScore(current) ? livePublic! : current;
}

/** True when any session mirror shows deal / draw / play has begun. */
export function handPhaseStarted(hand: PublicHandView | null | undefined): boolean {
  const phase = hand?.phase ?? null;
  return phase === "reveal" || phase === "decision" || phase === "draw" || phase === "play";
}

/** Check raw session mirrors — avoids authoritative merge hiding a fresh deal. */
export function sessionHandDealStarted(sessionData: SessionHandView | null | undefined): boolean {
  if (!sessionData) return false;
  if (handPhaseStarted(sessionData.currentHand)) return true;
  if (handPhaseStarted(sessionData.liveEnrollment?.deal?.publicHand)) return true;
  return handPhaseStarted(authoritativeCurrentHand(sessionData));
}

/** Ignore orphan liveEnrollment.deal snapshots between hands after deploy. */
export function authoritativeCurrentHand(sessionData: SessionHandView | null | undefined): PublicHandView {
  const current = sessionData?.currentHand ?? emptyPreDealHand();
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  const livePhase = livePublic?.phase ?? null;

  if (handInProgress(current) && handInProgress(livePublic)) {
    const currentEarly = current.phase === "reveal" || current.phase === "decision";
    const liveDrawDone = livePublic?.drawCompletedIds?.length ?? 0;
    const currentDrawDone = current.drawCompletedIds?.length ?? 0;
    const liveTricks = totalTricksPlayed(
      livePublic?.tricksByPlayer ?? {},
      livePublic?.participantIds ?? [],
    );
    const currentTricks = totalTricksPlayed(
      current.tricksByPlayer ?? {},
      current.participantIds ?? [],
    );
    // Fresh reveal/decision on currentHand beats a stale draw mirror from a prior hand.
    if (
      currentEarly &&
      livePublic?.phase === "draw" &&
      currentTricks === 0 &&
      liveTricks === 0 &&
      liveDrawDone > 0 &&
      currentDrawDone === 0
    ) {
      return current;
    }
    return preferInProgressHand(current, livePublic);
  }

  if (handInProgress(current)) return current;

  if (livePhase === "draw" || livePhase === "play" || livePhase === "reveal" || livePhase === "decision") {
    if (handInProgress(livePublic)) {
      const liveTricks = totalTricksPlayed(
        livePublic?.tricksByPlayer ?? {},
        livePublic?.participantIds ?? [],
      );
      if (
        isClearedPreDealHand(current) &&
        liveTricks === 0 &&
        livePhase === "draw" &&
        !sessionData?.liveEnrollment?.active
      ) {
        return emptyPreDealHand();
      }
      return livePublic!;
    }
    if (livePublic?.phase) return livePublic;
    if (handPhaseStarted(current)) return current;
    if (isClearedPreDealHand(current)) return emptyPreDealHand();
    return current;
  }

  if (livePhase && livePublic) return livePublic;
  return current;
}

export function getSessionEnrollment(sessionData: SessionHandView | null | undefined) {
  const hand = authoritativeCurrentHand(sessionData);
  const phase = hand?.phase ?? null;
  if (phase === "reveal" || phase === "draw" || phase === "play") {
    return null;
  }
  if (phase === "decision") {
    const view = decisionAsEnrollmentView(hand.handDecision ?? null);
    if (view?.active) return view;
  }
  const live = sessionData?.liveEnrollment;
  const livePhase = live?.deal?.publicHand?.phase ?? null;
  if (live?.active) return live;
  if (
    livePhase === "draw" ||
    livePhase === "play" ||
    livePhase === "reveal" ||
    livePhase === "decision"
  ) {
    return null;
  }
  if (sessionData?.handEnrollment?.active) return sessionData.handEnrollment;
  return sessionData?.handEnrollment ?? null;
}

/** Public hand from session.currentHand or legacy liveEnrollment.deal. */
export function getSessionCurrentHand(sessionData: SessionHandView | null | undefined): PublicHandView {
  return authoritativeCurrentHand(sessionData);
}

export function isLegacyEnrollmentActive(input: {
  cardsDealt: boolean;
  handParticipantCount: number;
  enrollmentActive: boolean;
}): boolean {
  return (
    !input.cardsDealt &&
    input.handParticipantCount === 0 &&
    input.enrollmentActive
  );
}

export function isPagatDecisionActive(
  handPhase: string | null | undefined,
  handDecision: HandDecision | null | undefined,
): boolean {
  return handPhase === "decision" && handDecision?.active === true;
}

/** Table UI gate for play/pass (legacy enrollment or Pagat decision). */
export function resolveTableEnrollmentActive(input: {
  cardsDealt: boolean;
  handParticipantCount: number;
  legacyEnrollmentActive: boolean;
  pagatDecisionActive: boolean;
}): boolean {
  return input.legacyEnrollmentActive || input.pagatDecisionActive;
}

export function resolveCurrentHandChoicePlayerId(input: {
  pagatDecisionActive: boolean;
  handDecision: HandDecision | null | undefined;
  legacyEnrollmentActive: boolean;
  enrollment: HandEnrollmentView | null | undefined;
}): string | null {
  if (input.pagatDecisionActive && input.handDecision) {
    const ids = input.handDecision.orderedPlayerIds ?? [];
    const idx = input.handDecision.currentIndex ?? 0;
    return ids[idx] ?? null;
  }
  if (input.legacyEnrollmentActive && input.enrollment?.active) {
    const ids = input.enrollment.orderedPlayerIds ?? [];
    const idx = input.enrollment.currentIndex ?? 0;
    return ids[idx] ?? null;
  }
  return null;
}

export function canPlayerShowHandChoice(input: {
  enrollmentGateActive: boolean;
  isSelf: boolean;
  playerId: string;
  currentChoicePlayerId: string | null;
  isFinal: boolean;
  bankroll: number;
  isOut: boolean;
}): boolean {
  return (
    input.enrollmentGateActive &&
    input.isSelf &&
    !input.isFinal &&
    input.playerId === input.currentChoicePlayerId &&
    input.bankroll > 0 &&
    !input.isOut
  );
}
