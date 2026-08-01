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
  turnPlayerId?: string | null;
  handDecision?: HandDecision | null;
  trumpUpcard?: { rank: string; suit: string } | null;
  trumpSuit?: string | null;
  trumpHolderId?: string | null;
  dealerId?: string | null;
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

/** Coerce Firestore trump upcard to { rank, suit } or null (guards boolean/truthy junk). */
export function normalizeTrumpUpcard(
  raw: unknown,
): { rank: string; suit: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const card = raw as { rank?: unknown; suit?: unknown };
  if (typeof card.rank !== "string" || typeof card.suit !== "string") return null;
  if (!card.rank.trim() || !card.suit.trim()) return null;
  return { rank: card.rank, suit: card.suit };
}

/** Fill trump fields on the chosen mirror from any in-flight session hand copy. */
export function mergePublicHandTrumpFields(
  base: PublicHandView,
  ...mirrors: Array<PublicHandView | null | undefined>
): PublicHandView {
  let trumpUpcard = normalizeTrumpUpcard(base.trumpUpcard);
  let trumpSuit = base.trumpSuit ?? null;
  let trumpHolderId = base.trumpHolderId ?? null;

  for (const mirror of mirrors) {
    if (!mirror) continue;
    if (!trumpUpcard) trumpUpcard = normalizeTrumpUpcard(mirror.trumpUpcard);
    if (!trumpSuit && mirror.trumpSuit) trumpSuit = mirror.trumpSuit;
    if (!trumpHolderId && mirror.trumpHolderId) trumpHolderId = mirror.trumpHolderId;
  }

  if (!trumpSuit && trumpUpcard?.suit) trumpSuit = trumpUpcard.suit;

  if (
    trumpUpcard === normalizeTrumpUpcard(base.trumpUpcard) &&
    trumpSuit === (base.trumpSuit ?? null) &&
    trumpHolderId === (base.trumpHolderId ?? null)
  ) {
    return base;
  }

  return {
    ...base,
    ...(trumpUpcard ? { trumpUpcard } : {}),
    ...(trumpSuit ? { trumpSuit } : {}),
    ...(trumpHolderId ? { trumpHolderId } : {}),
  };
}

function withMergedTrumpFields(
  sessionData: SessionHandView | null | undefined,
  chosen: PublicHandView,
): PublicHandView {
  if (isClearedPreDealHand(chosen)) return chosen;
  return mergePublicHandTrumpFields(
    chosen,
    sessionData?.currentHand,
    sessionData?.liveEnrollment?.deal?.publicHand,
  );
}

/** True when any session mirror shows deal / draw / play has begun. */
export function handPhaseStarted(hand: PublicHandView | null | undefined): boolean {
  const phase = hand?.phase ?? null;
  return phase === "reveal" || phase === "decision" || phase === "draw" || phase === "play";
}

/**
 * Five tricks recorded but settlement has not cleared the session yet.
 * Must not block post-hand recovery or the next join window.
 */
export function isHandAwaitingSettlement(
  sessionData: SessionHandView | null | undefined,
): boolean {
  if (!sessionData) return false;
  const hand = authoritativeCurrentHand(sessionData);
  const participantIds = hand.participantIds ?? [];
  if (participantIds.length < 2) return false;
  const phase = hand.phase ?? null;
  if (phase !== "play" && phase !== "draw") return false;
  return isHandComplete(hand.tricksByPlayer ?? {}, participantIds);
}

/** Check raw session mirrors — avoids authoritative merge hiding a fresh deal. */
export function sessionHandDealStarted(sessionData: SessionHandView | null | undefined): boolean {
  if (!sessionData) return false;
  if (isHandAwaitingSettlement(sessionData)) return false;
  if (handPhaseStarted(sessionData.currentHand)) return true;
  if (handPhaseStarted(sessionData.liveEnrollment?.deal?.publicHand)) return true;
  return handPhaseStarted(authoritativeCurrentHand(sessionData));
}

/** Ignore orphan liveEnrollment.deal snapshots between hands after deploy. */
export function authoritativeCurrentHand(sessionData: SessionHandView | null | undefined): PublicHandView {
  const current = sessionData?.currentHand ?? emptyPreDealHand();
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  const livePhase = livePublic?.phase ?? null;

  let chosen: PublicHandView;

  // recordHand clears currentHand but a completed live mirror can linger — never block handoff.
  if (isClearedPreDealHand(current) && livePublic && !handInProgress(livePublic)) {
    chosen = emptyPreDealHand();
  } else if (handInProgress(current) && handInProgress(livePublic)) {
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
      chosen = current;
    } else {
      chosen = preferInProgressHand(current, livePublic);
    }
  } else if (handInProgress(current)) {
    chosen = current;
  } else if (livePhase === "draw" || livePhase === "play" || livePhase === "reveal" || livePhase === "decision") {
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
        chosen = emptyPreDealHand();
      } else {
        chosen = livePublic!;
      }
    } else if (livePublic?.phase) {
      chosen = livePublic;
    } else if (handPhaseStarted(current)) {
      chosen = current;
    } else if (isClearedPreDealHand(current)) {
      chosen = emptyPreDealHand();
    } else {
      chosen = current;
    }
  } else if (livePhase && livePublic) {
    chosen = livePublic;
  } else {
    chosen = current;
  }

  return withMergedTrumpFields(sessionData, chosen);
}

/** True when enrollment has roster fields (handEnrollment / decision view), not liveEnrollment-only. */
export function isHandEnrollmentView(
  enrollment: unknown,
): enrollment is HandEnrollmentView {
  return (
    enrollment != null &&
    typeof enrollment === "object" &&
    ("orderedPlayerIds" in enrollment ||
      "enrolledIds" in enrollment ||
      "currentIndex" in enrollment)
  );
}

export function getSessionEnrollment(
  sessionData: SessionHandView | null | undefined,
): HandEnrollmentView | null {
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
  if (live?.active) return live as HandEnrollmentView;
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

/** True while a player is locked into the current deal (draw/play). */
export function isPlayerLockedInLiveHand(input: {
  phase?: string | null;
  participantIds?: string[];
  playerId: string;
}): boolean {
  if (!input.participantIds?.includes(input.playerId)) return false;
  const phase = input.phase ?? null;
  return phase === "draw" || phase === "play";
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
