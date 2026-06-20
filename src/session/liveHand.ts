/** Session enrollment / public hand view — mirrors docs/firestore.js for tests. */

import { decisionAsEnrollmentView } from "../game/decision";
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
  handDecision?: {
    active?: boolean;
    orderedPlayerIds?: string[];
    currentIndex?: number;
    turnDeadlineMs?: number;
    playingIds?: string[];
    passedIds?: string[];
    plannedDiscards?: Record<string, number>;
  } | null;
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

/** Ignore orphan liveEnrollment.deal snapshots between hands after deploy. */
export function authoritativeCurrentHand(sessionData: SessionHandView | null | undefined): PublicHandView {
  const current = sessionData?.currentHand ?? emptyPreDealHand();
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  const livePhase = livePublic?.phase ?? null;

  if (handInProgress(current) && handInProgress(livePublic)) {
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
    if (isClearedPreDealHand(current)) return emptyPreDealHand();
    return current;
  }

  if (livePhase && livePublic) return livePublic;
  return current;
}

export function getSessionEnrollment(sessionData: SessionHandView | null | undefined) {
  const hand = authoritativeCurrentHand(sessionData);
  if (hand?.phase === "decision") {
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
