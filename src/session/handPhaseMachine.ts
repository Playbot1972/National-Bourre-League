/**
 * Session hand-flow state machine — derives lifecycle phase, allowed transitions,
 * turn ownership, client action guards, and bot-advance eligibility from a plain
 * session snapshot (no Firestore / UI / network).
 *
 * Game card phases (`reveal` | `decision` | `draw` | `play`) remain on
 * `currentHand.phase`; this module maps them into session-level flow phases.
 */

import { currentDecisionPlayer } from "../game/decision";
import { HAND_PHASE } from "../game/types";
import type { HandDecision } from "../game/types";
import { isHandComplete, totalTricksPlayed, MAX_TRICKS_PER_HAND } from "../table/logic";
import type { HandEnrollmentView, PublicHandView, SessionHandView } from "./liveHand";
import {
  authoritativeCurrentHand,
  getSessionEnrollment,
  isClearedPreDealHand,
  isLegacyEnrollmentActive,
  isPagatDecisionActive,
  resolveCurrentHandChoicePlayerId,
} from "./liveHand";

/** Session-level hand flow phases (step-2 canonical names). */
export const HAND_FLOW_PHASE = {
  WAITING: "waiting",
  ENROLLMENT: "enrollment",
  DEAL: "deal",
  DRAW: "draw",
  PLAY: "play",
  SETTLE: "settle",
  NEXT_HAND_PREP: "next-hand-prep",
} as const;

export type HandFlowPhase = (typeof HAND_FLOW_PHASE)[keyof typeof HAND_FLOW_PHASE];

/** Events that drive transitions (persisted writes happen in firestore / CF handlers). */
export type HandFlowEvent =
  | "open_enrollment"
  | "enrollment_step"
  | "enrollment_complete"
  | "solo_win"
  | "deal_cards"
  | "advance_reveal"
  | "decision_step"
  | "decision_complete"
  | "submit_draw"
  | "draw_fold"
  | "draw_complete"
  | "play_card"
  | "hand_complete"
  | "cowin_pending"
  | "record_hand"
  | "prep_complete"
  | "session_final";

export type HandFlowAction =
  | "enrollment_in"
  | "enrollment_pass"
  | "enrollment_timeout"
  | "decision_play"
  | "decision_pass"
  | "advance_reveal"
  | "submit_draw"
  | "draw_fold"
  | "play_card"
  | "vote_cowin"
  | "record_hand";

export interface HandFlowSessionView extends SessionHandView {
  status?: string | null;
  handCount?: number;
  pendingCoWinSettlement?: { winnerIds?: string[] } | null;
}

export interface HandFlowContext {
  session: HandFlowSessionView | null | undefined;
  nowMs?: number;
  /** UI presentation may suppress turn indicators during animations. */
  suppressTurn?: boolean;
  /** Table overlay open — affects next-hand auto-open (mirrors app.js). */
  tablePlayOpen?: boolean;
}

export interface HandFlowSnapshot {
  phase: HandFlowPhase;
  handPhase: string | null;
  enrollmentActive: boolean;
  pagatDecisionActive: boolean;
  participantIds: string[];
  turnPlayerId: string | null;
  handComplete: boolean;
  pendingCoWin: boolean;
  trickCount: number;
}

export interface BotAdvanceHint {
  kind:
    | "cowin"
    | "enrollment_timeout"
    | "enrollment"
    | "decision_timeout"
    | "decision"
    | "draw"
    | "play";
  turnPlayerId: string;
}

/** Explicit allowed transitions (from → event → to). */
export const HAND_FLOW_TRANSITIONS: ReadonlyArray<{
  from: HandFlowPhase;
  event: HandFlowEvent;
  to: HandFlowPhase;
}> = [
  { from: HAND_FLOW_PHASE.WAITING, event: "open_enrollment", to: HAND_FLOW_PHASE.ENROLLMENT },
  { from: HAND_FLOW_PHASE.WAITING, event: "deal_cards", to: HAND_FLOW_PHASE.DEAL },
  { from: HAND_FLOW_PHASE.NEXT_HAND_PREP, event: "open_enrollment", to: HAND_FLOW_PHASE.ENROLLMENT },
  { from: HAND_FLOW_PHASE.NEXT_HAND_PREP, event: "deal_cards", to: HAND_FLOW_PHASE.DEAL },
  { from: HAND_FLOW_PHASE.NEXT_HAND_PREP, event: "prep_complete", to: HAND_FLOW_PHASE.WAITING },
  { from: HAND_FLOW_PHASE.ENROLLMENT, event: "enrollment_step", to: HAND_FLOW_PHASE.ENROLLMENT },
  { from: HAND_FLOW_PHASE.ENROLLMENT, event: "enrollment_complete", to: HAND_FLOW_PHASE.DEAL },
  { from: HAND_FLOW_PHASE.ENROLLMENT, event: "solo_win", to: HAND_FLOW_PHASE.SETTLE },
  { from: HAND_FLOW_PHASE.ENROLLMENT, event: "decision_complete", to: HAND_FLOW_PHASE.DRAW },
  { from: HAND_FLOW_PHASE.DEAL, event: "advance_reveal", to: HAND_FLOW_PHASE.DRAW },
  { from: HAND_FLOW_PHASE.DEAL, event: "decision_step", to: HAND_FLOW_PHASE.ENROLLMENT },
  { from: HAND_FLOW_PHASE.DRAW, event: "submit_draw", to: HAND_FLOW_PHASE.DRAW },
  { from: HAND_FLOW_PHASE.DRAW, event: "draw_fold", to: HAND_FLOW_PHASE.DRAW },
  { from: HAND_FLOW_PHASE.DRAW, event: "draw_complete", to: HAND_FLOW_PHASE.PLAY },
  { from: HAND_FLOW_PHASE.DRAW, event: "solo_win", to: HAND_FLOW_PHASE.SETTLE },
  { from: HAND_FLOW_PHASE.PLAY, event: "play_card", to: HAND_FLOW_PHASE.PLAY },
  { from: HAND_FLOW_PHASE.PLAY, event: "hand_complete", to: HAND_FLOW_PHASE.SETTLE },
  { from: HAND_FLOW_PHASE.SETTLE, event: "cowin_pending", to: HAND_FLOW_PHASE.SETTLE },
  { from: HAND_FLOW_PHASE.SETTLE, event: "record_hand", to: HAND_FLOW_PHASE.NEXT_HAND_PREP },
  { from: HAND_FLOW_PHASE.NEXT_HAND_PREP, event: "session_final", to: HAND_FLOW_PHASE.WAITING },
];

const transitionKey = (from: HandFlowPhase, event: HandFlowEvent) => `${from}:${event}`;

const TRANSITION_LOOKUP = new Map(
  HAND_FLOW_TRANSITIONS.map((t) => [transitionKey(t.from, t.event), t.to]),
);

export function isHandFlowTransitionAllowed(
  from: HandFlowPhase,
  event: HandFlowEvent,
): boolean {
  return TRANSITION_LOOKUP.has(transitionKey(from, event));
}

export function nextHandFlowPhase(
  from: HandFlowPhase,
  event: HandFlowEvent,
): HandFlowPhase | null {
  return TRANSITION_LOOKUP.get(transitionKey(from, event)) ?? null;
}

export function enrollmentDeadlineMs(
  enrollment: { turnDeadlineMs?: unknown } | null | undefined,
): number {
  const raw = enrollment?.turnDeadlineMs;
  if (raw == null) return 0;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "object" && raw !== null && "toMillis" in raw) {
    const fn = (raw as { toMillis?: () => number }).toMillis;
    if (typeof fn === "function") return fn.call(raw);
  }
  if (typeof raw === "object" && raw !== null && "seconds" in raw) {
    const sec = (raw as { seconds?: number; nanoseconds?: number }).seconds ?? 0;
    const ns = (raw as { nanoseconds?: number }).nanoseconds ?? 0;
    return sec * 1000 + Math.floor(ns / 1e6);
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function isRobotPlayerId(playerId: string | null | undefined): boolean {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

export function canActForPlayer(
  playerId: string | null | undefined,
  actorId: string | null | undefined,
): boolean {
  if (!playerId || !actorId) return false;
  if (playerId === actorId) return true;
  return isRobotPlayerId(playerId);
}

function emptyHand(): PublicHandView {
  return { tricksByPlayer: {}, participantIds: [] };
}

/** Build a normalized snapshot used by guards and tests. */
export function buildHandFlowSnapshot(
  ctx: HandFlowContext,
): HandFlowSnapshot {
  const session = ctx.session;
  const hand = session ? authoritativeCurrentHand(session) : emptyHand();
  const handPhase = hand.phase ?? null;
  const participantIds = hand.participantIds ?? [];
  const tricks = hand.tricksByPlayer ?? {};
  const trickCount = totalTricksPlayed(tricks, participantIds);
  const handComplete =
    participantIds.length > 0 && isHandComplete(tricks, participantIds);
  const pendingCoWin = Boolean(session?.pendingCoWinSettlement?.winnerIds?.length);
  const enrollment = session ? getSessionEnrollment(session) : null;
  const pagatDecisionActive = isPagatDecisionActive(handPhase, hand.handDecision ?? null);
  const legacyEnrollmentActive = isLegacyEnrollmentActive({
    cardsDealt: handPhase === HAND_PHASE.REVEAL ||
      handPhase === HAND_PHASE.DECISION ||
      handPhase === HAND_PHASE.DRAW ||
      handPhase === HAND_PHASE.PLAY,
    handParticipantCount: participantIds.length,
    enrollmentActive: Boolean(enrollment?.active),
  });
  const enrollmentActive = legacyEnrollmentActive || pagatDecisionActive;

  const phase = deriveHandFlowPhase({
    sessionStatus: session?.status ?? null,
    handPhase,
    participantIds,
    trickCount,
    handComplete,
    pendingCoWin,
    enrollmentActive,
    handCount: session?.handCount ?? 0,
    clearedHand: isClearedPreDealHand(hand),
  });

  const turnPlayerId = resolveHandFlowTurnPlayerId({
    phase,
    handPhase,
    hand,
    enrollment,
    pagatDecisionActive,
    legacyEnrollmentActive,
  });

  return {
    phase,
    handPhase,
    enrollmentActive,
    pagatDecisionActive,
    participantIds,
    turnPlayerId,
    handComplete,
    pendingCoWin,
    trickCount,
  };
}

export interface DeriveHandFlowPhaseInput {
  sessionStatus?: string | null;
  handPhase?: string | null;
  participantIds?: string[];
  trickCount?: number;
  handComplete?: boolean;
  pendingCoWin?: boolean;
  enrollmentActive?: boolean;
  handCount?: number;
  clearedHand?: boolean;
}

/** Map session + card-phase fields to a single flow phase. */
export function deriveHandFlowPhase(input: DeriveHandFlowPhaseInput): HandFlowPhase {
  if (input.sessionStatus === "final") return HAND_FLOW_PHASE.WAITING;
  if (input.pendingCoWin) return HAND_FLOW_PHASE.SETTLE;

  const handPhase = input.handPhase ?? null;
  const participants = input.participantIds ?? [];

  if (handPhase === HAND_PHASE.PLAY) {
    if (input.handComplete || (input.trickCount ?? 0) >= MAX_TRICKS_PER_HAND) {
      return HAND_FLOW_PHASE.SETTLE;
    }
    return HAND_FLOW_PHASE.PLAY;
  }
  if (handPhase === HAND_PHASE.DRAW) return HAND_FLOW_PHASE.DRAW;
  if (handPhase === HAND_PHASE.REVEAL) return HAND_FLOW_PHASE.DEAL;
  if (handPhase === HAND_PHASE.DECISION) return HAND_FLOW_PHASE.ENROLLMENT;

  if (input.enrollmentActive) return HAND_FLOW_PHASE.ENROLLMENT;

  if (input.clearedHand !== false && participants.length === 0) {
    if ((input.handCount ?? 0) > 0 && !input.enrollmentActive) {
      return HAND_FLOW_PHASE.NEXT_HAND_PREP;
    }
    return HAND_FLOW_PHASE.WAITING;
  }

  return HAND_FLOW_PHASE.WAITING;
}

export interface ResolveTurnInput {
  phase: HandFlowPhase;
  handPhase: string | null;
  hand: PublicHandView;
  enrollment: HandEnrollmentView | null | undefined;
  pagatDecisionActive: boolean;
  legacyEnrollmentActive: boolean;
}

/** Whose turn it is for the current flow phase. */
export function resolveHandFlowTurnPlayerId(input: ResolveTurnInput): string | null {
  const { phase, hand, enrollment, pagatDecisionActive, legacyEnrollmentActive } = input;

  if (phase === HAND_FLOW_PHASE.ENROLLMENT) {
    return resolveCurrentHandChoicePlayerId({
      pagatDecisionActive,
      handDecision: (hand.handDecision ?? null) as HandDecision | null,
      legacyEnrollmentActive,
      enrollment,
    });
  }

  if (phase === HAND_FLOW_PHASE.DRAW || phase === HAND_FLOW_PHASE.PLAY) {
    return hand.turnPlayerId ?? null;
  }

  return null;
}

export interface CanSubmitActionInput {
  snapshot: HandFlowSnapshot;
  action: HandFlowAction;
  playerId: string;
  actorId: string;
  suppressTurn?: boolean;
  drawCompletedIds?: string[];
}

/** Whether the client/server may accept a player action right now. */
export function canSubmitHandAction(input: CanSubmitActionInput): {
  ok: boolean;
  reason?: string;
} {
  const { snapshot, action, playerId, actorId, suppressTurn = false } = input;
  const drawDone = input.drawCompletedIds ?? [];

  if (!canActForPlayer(playerId, actorId)) {
    return { ok: false, reason: "actor_mismatch" };
  }

  switch (action) {
    case "enrollment_in":
    case "enrollment_pass":
      if (snapshot.phase !== HAND_FLOW_PHASE.ENROLLMENT) {
        return { ok: false, reason: "not_enrollment" };
      }
      if (snapshot.turnPlayerId !== playerId) {
        return { ok: false, reason: "not_your_turn" };
      }
      return { ok: true };

    case "enrollment_timeout":
      if (snapshot.phase !== HAND_FLOW_PHASE.ENROLLMENT) {
        return { ok: false, reason: "not_enrollment" };
      }
      return { ok: true };

    case "decision_play":
    case "decision_pass":
      if (!snapshot.pagatDecisionActive) {
        return { ok: false, reason: "not_decision" };
      }
      if (snapshot.turnPlayerId !== playerId) {
        return { ok: false, reason: "not_your_turn" };
      }
      return { ok: true };

    case "advance_reveal":
      if (snapshot.phase !== HAND_FLOW_PHASE.DEAL) {
        return { ok: false, reason: "not_deal" };
      }
      return { ok: true };

    case "submit_draw":
    case "draw_fold":
      if (snapshot.phase !== HAND_FLOW_PHASE.DRAW) {
        return { ok: false, reason: "not_draw" };
      }
      if (snapshot.turnPlayerId !== playerId) {
        return { ok: false, reason: "not_your_turn" };
      }
      if (drawDone.includes(playerId)) {
        return { ok: false, reason: "draw_already_complete" };
      }
      if (suppressTurn) {
        return { ok: false, reason: "presentation_blocked" };
      }
      return { ok: true };

    case "play_card":
      if (snapshot.phase !== HAND_FLOW_PHASE.PLAY) {
        return { ok: false, reason: "not_play" };
      }
      if (snapshot.handComplete) {
        return { ok: false, reason: "hand_complete" };
      }
      if (snapshot.turnPlayerId !== playerId) {
        return { ok: false, reason: "not_your_turn" };
      }
      if (suppressTurn) {
        return { ok: false, reason: "presentation_blocked" };
      }
      return { ok: true };

    case "vote_cowin":
      if (!snapshot.pendingCoWin) {
        return { ok: false, reason: "no_cowin_vote" };
      }
      return { ok: true };

    case "record_hand":
      if (snapshot.phase !== HAND_FLOW_PHASE.SETTLE && !snapshot.handComplete) {
        return { ok: false, reason: "hand_not_ready_to_settle" };
      }
      return { ok: true };

    default:
      return { ok: false, reason: "unknown_action" };
  }
}

export interface BotAdvanceInput {
  snapshot: HandFlowSnapshot;
  session: HandFlowSessionView | null | undefined;
  nowMs: number;
}

/**
 * Whether server/client bot loops may advance without human input.
 * Returns the kind of bot action and which seat should act.
 */
export function resolveBotAdvanceHint(input: BotAdvanceInput): BotAdvanceHint | null {
  const { snapshot, session, nowMs } = input;

  if (snapshot.pendingCoWin) {
    const winners = session?.pendingCoWinSettlement?.winnerIds ?? [];
    const votes =
      (session?.pendingCoWinSettlement as { votes?: Record<string, string> } | null)?.votes ??
      {};
    const botWinner = winners.find(
      (id) =>
        isRobotPlayerId(id) && votes[id] !== "split" && votes[id] !== "push",
    );
    if (botWinner) {
      return { kind: "cowin", turnPlayerId: botWinner };
    }
    return null;
  }

  if (snapshot.phase === HAND_FLOW_PHASE.ENROLLMENT) {
    const enrollment = session ? getSessionEnrollment(session) : null;
    if (!enrollment?.active && !snapshot.pagatDecisionActive) return null;

    if (snapshot.pagatDecisionActive && session) {
      const hand = authoritativeCurrentHand(session);
      const decision = hand.handDecision;
      if (decision?.active) {
        const turnId = currentDecisionPlayer(decision as HandDecision);
        if (!turnId) return null;
        if (nowMs >= enrollmentDeadlineMs(decision)) {
          return { kind: "decision_timeout", turnPlayerId: turnId };
        }
        const playing = decision.playingIds ?? [];
        const passed = decision.passedIds ?? [];
        if (
          isRobotPlayerId(turnId) &&
          !playing.includes(turnId) &&
          !passed.includes(turnId)
        ) {
          return { kind: "decision", turnPlayerId: turnId };
        }
      }
      return null;
    }

    const ids = enrollment?.orderedPlayerIds ?? [];
    const idx = enrollment?.currentIndex ?? 0;
    const turnId = ids[idx] ?? null;
    if (!turnId) return null;

    if (nowMs >= enrollmentDeadlineMs(enrollment)) {
      return { kind: "enrollment_timeout", turnPlayerId: turnId };
    }

    const enrolled = enrollment?.enrolledIds ?? [];
    const declined = enrollment?.declinedIds ?? [];
    if (
      isRobotPlayerId(turnId) &&
      !enrolled.includes(turnId) &&
      !declined.includes(turnId)
    ) {
      return { kind: "enrollment", turnPlayerId: turnId };
    }
    return null;
  }

  if (snapshot.phase === HAND_FLOW_PHASE.DRAW) {
    const turnId = snapshot.turnPlayerId;
    const drawDone = session
      ? (authoritativeCurrentHand(session).drawCompletedIds ?? [])
      : [];
    if (
      turnId &&
      isRobotPlayerId(turnId) &&
      snapshot.participantIds.includes(turnId) &&
      !drawDone.includes(turnId)
    ) {
      return { kind: "draw", turnPlayerId: turnId };
    }
    return null;
  }

  if (snapshot.phase === HAND_FLOW_PHASE.PLAY) {
    const turnId = snapshot.turnPlayerId;
    if (snapshot.handComplete || snapshot.trickCount >= MAX_TRICKS_PER_HAND) {
      return null;
    }
    if (
      turnId &&
      isRobotPlayerId(turnId) &&
      snapshot.participantIds.includes(turnId)
    ) {
      return { kind: "play", turnPlayerId: turnId };
    }
    return null;
  }

  return null;
}

export function canAdvanceBots(input: BotAdvanceInput): boolean {
  return resolveBotAdvanceHint(input) != null;
}

/** @deprecated Use deriveHandFlowPhase — maps old handLifecycle name `opening` → `enrollment`. */
export function deriveHandLifecyclePhaseFromFlow(
  input: DeriveHandFlowPhaseInput & { tablePlayOpen?: boolean },
): HandFlowPhase {
  return deriveHandFlowPhase(input);
}

/** Post-settle: hand cleared and ready for next join window. */
export function isNextHandPrepPhase(phase: HandFlowPhase): boolean {
  return phase === HAND_FLOW_PHASE.NEXT_HAND_PREP;
}

export function shouldOpenEnrollmentAfterSettle(ctx: HandFlowContext): boolean {
  const session = ctx.session;
  if (!session || session.status === "final") return false;
  const snap = buildHandFlowSnapshot(ctx);
  return (
    snap.phase === HAND_FLOW_PHASE.NEXT_HAND_PREP ||
    (snap.phase === HAND_FLOW_PHASE.WAITING && (session.handCount ?? 0) > 0)
  ) && !snap.pendingCoWin && !snap.enrollmentActive;
}

export function shouldAutoOpenNextHand(ctx: HandFlowContext): boolean {
  return ctx.tablePlayOpen === true && shouldOpenEnrollmentAfterSettle(ctx);
}
