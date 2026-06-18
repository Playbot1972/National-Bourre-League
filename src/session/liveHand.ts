/** Session enrollment / public hand view — mirrors docs/firestore.js for tests. */

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
  if (h.phase === "draw" || h.phase === "play") return false;
  if ((h.participantIds?.length ?? 0) > 0) return false;
  const tricks = h.tricksByPlayer ?? {};
  return !Object.values(tricks).some((n) => (n || 0) > 0);
}

function handInProgress(hand: PublicHandView | null | undefined): boolean {
  if (!hand) return false;
  const phase = hand.phase ?? null;
  if (phase !== "draw" && phase !== "play") return false;
  const participantIds = hand.participantIds ?? [];
  if (participantIds.length === 0) return false;
  const tricks = hand.tricksByPlayer ?? {};
  if (isHandComplete(tricks, participantIds)) return false;
  if (totalTricksPlayed(tricks, participantIds) >= MAX_TRICKS_PER_HAND) return false;
  return true;
}

/** Ignore orphan liveEnrollment.deal snapshots between hands after deploy. */
export function authoritativeCurrentHand(sessionData: SessionHandView | null | undefined): PublicHandView {
  const current = sessionData?.currentHand ?? emptyPreDealHand();
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  const livePhase = livePublic?.phase ?? null;

  if (handInProgress(current)) return current;

  if (livePhase === "draw" || livePhase === "play") {
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
  const live = sessionData?.liveEnrollment;
  const livePhase = live?.deal?.publicHand?.phase ?? null;
  if (live?.active) return live;
  if (livePhase === "draw" || livePhase === "play") return null;
  if (sessionData?.handEnrollment?.active) return sessionData.handEnrollment;
  return sessionData?.handEnrollment ?? null;
}

/** Public hand from session.currentHand or legacy liveEnrollment.deal. */
export function getSessionCurrentHand(sessionData: SessionHandView | null | undefined): PublicHandView {
  return authoritativeCurrentHand(sessionData);
}
