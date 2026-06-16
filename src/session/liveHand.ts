/** Session enrollment / public hand view — mirrors docs/firestore.js for tests. */

export interface HandEnrollmentView {
  active?: boolean;
  orderedPlayerIds?: string[];
  currentIndex?: number;
  turnDeadlineMs?: number;
  enrolledIds?: string[];
  declinedIds?: string[];
}

export interface SessionHandView {
  currentHand?: {
    phase?: string | null;
    participantIds?: string[];
    tricksByPlayer?: Record<string, number>;
  };
  handEnrollment?: HandEnrollmentView | null;
  liveEnrollment?: {
    active?: boolean;
    deal?: {
      publicHand?: { phase?: string | null; participantIds?: string[]; tricksByPlayer?: Record<string, number> };
      sortedPlayerIds?: string[];
    };
  } | null;
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] as string[] };
}

export function getSessionEnrollment(sessionData: SessionHandView | null | undefined) {
  const live = sessionData?.liveEnrollment;
  const livePhase = live?.deal?.publicHand?.phase ?? null;
  if (live?.active) return live;
  if (livePhase === "draw" || livePhase === "play") return null;
  if (sessionData?.handEnrollment?.active) return sessionData.handEnrollment;
  return sessionData?.handEnrollment ?? null;
}

export function getSessionCurrentHand(sessionData: SessionHandView | null | undefined) {
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  if (livePublic?.phase) return livePublic;
  return sessionData?.currentHand ?? emptyPreDealHand();
}
