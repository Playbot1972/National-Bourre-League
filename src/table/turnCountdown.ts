import {
  buildHandFlowSnapshot,
  HAND_FLOW_PHASE,
  type HandFlowSessionView,
} from "../session/handPhaseMachine";
import { buildAnteCoinDelayPlan } from "../session/botActionTiming";
import {
  buildAntePresentationSchedule,
  resolveAnteThinkAtTimelineSec,
} from "./antePresentationSchedule";
import { readAntePresentationTimelineSec } from "./presentationMotionBusy";
import type { TableSessionData } from "./types";

/** Total visible turn timer duration (client presentation). */
export const TURN_COUNTDOWN_MS = 15_000;

/** Remaining time thresholds for color segments. */
export const TURN_COUNTDOWN_GREEN_UNTIL_MS = 10_000;
export const TURN_COUNTDOWN_YELLOW_UNTIL_MS = 5_000;

export type TurnCountdownSegment = "green" | "yellow" | "red";

export interface TurnCountdownState {
  playerId: string;
  /** Fraction of time remaining (1 → full, 0 → expired). */
  progress: number;
  remainingMs: number;
  segment: TurnCountdownSegment;
}

export interface AnteTurnCountdownContext {
  anteAnimActive: boolean;
  presentationKey: string;
  handNumber: number;
  playerIds: string[];
  reducedMotion: boolean;
}

export interface TurnCountdownInput {
  session: Pick<
    TableSessionData,
    | "phase"
    | "turnPlayerId"
    | "drawCompletedIds"
    | "handEnrollment"
    | "participantIds"
    | "tricksByPlayer"
    | "handNumber"
    | "pendingCoWinSettlement"
  >;
  suppressTurn: boolean;
  handComplete: boolean;
  /** When ante presentation is active, ring ownership follows the posting seat. */
  ante?: AnteTurnCountdownContext | null;
}

const ACTIONABLE_FLOW_PHASES = new Set<string>([
  HAND_FLOW_PHASE.ENROLLMENT,
  HAND_FLOW_PHASE.DRAW,
  HAND_FLOW_PHASE.PLAY,
]);

/** Color segment from remaining milliseconds. */
export function turnCountdownSegment(remainingMs: number): TurnCountdownSegment {
  if (remainingMs > TURN_COUNTDOWN_GREEN_UNTIL_MS) return "green";
  if (remainingMs > TURN_COUNTDOWN_YELLOW_UNTIL_MS) return "yellow";
  return "red";
}

/** Stable key — reset the ring when ownership or actionable context changes. */
export function turnCountdownActivityKey(input: TurnCountdownInput & { activeActorId: string | null }): string {
  const enrollment = input.session.handEnrollment;
  const enrollmentKey = enrollment?.active
    ? `${enrollment.currentIndex ?? 0}:${enrollment.turnDeadlineMs ?? 0}`
    : "off";
  const anteKey = input.ante?.anteAnimActive
    ? `ante:${input.ante.presentationKey}`
    : "off";
  return [
    input.session.phase ?? "",
    input.activeActorId ?? "",
    enrollmentKey,
    input.session.drawCompletedIds?.join(",") ?? "",
    input.suppressTurn ? "1" : "0",
    input.handComplete ? "1" : "0",
    anteKey,
  ].join("|");
}

function sessionViewFromTable(input: TurnCountdownInput): HandFlowSessionView {
  const { session } = input;
  return {
    status: null,
    handCount: session.handNumber,
    pendingCoWinSettlement: session.pendingCoWinSettlement ?? null,
    handEnrollment: session.handEnrollment ?? null,
    currentHand: {
      phase: session.phase ?? undefined,
      turnPlayerId: session.turnPlayerId ?? undefined,
      drawCompletedIds: session.drawCompletedIds,
      participantIds: session.participantIds ?? [],
      tricksByPlayer: session.tricksByPlayer ?? {},
    },
  };
}

/**
 * Authoritative required actor for enrollment, draw, and play.
 * Mirrors `resolveHandFlowTurnPlayerId` / seat `isActiveActor`.
 */
export function resolveTableActiveActorId(input: TurnCountdownInput): string | null {
  if (input.handComplete || input.suppressTurn) return null;

  const snapshot = buildHandFlowSnapshot({
    session: sessionViewFromTable(input),
    suppressTurn: input.suppressTurn,
  });

  if (!ACTIONABLE_FLOW_PHASES.has(snapshot.phase)) return null;
  return snapshot.turnPlayerId;
}

/** Which seat is posting ante now — driven by GSAP timeline position, not ring duration. */
export function resolveAntePresentationActorId(ante: AnteTurnCountdownContext): string | null {
  if (!ante.anteAnimActive || ante.playerIds.length < 1) return null;
  const elapsedSec = readAntePresentationTimelineSec(ante.presentationKey);
  if (elapsedSec == null) return null;
  const plan = buildAnteCoinDelayPlan({
    handNumber: ante.handNumber,
    playerIds: ante.playerIds,
    reducedMotion: ante.reducedMotion,
  });
  const schedule = buildAntePresentationSchedule(plan, ante.reducedMotion);
  return resolveAnteThinkAtTimelineSec(elapsedSec, schedule)?.playerId ?? null;
}

/** Single active actor for the avatar ring — ante posting seat or draw/play/enrollment turn. */
export function resolveTurnCountdownActiveActorId(input: TurnCountdownInput): string | null {
  if (input.handComplete) return null;
  if (input.ante?.anteAnimActive) {
    return resolveAntePresentationActorId(input.ante);
  }
  return resolveTableActiveActorId(input);
}

export function buildTurnCountdownState(
  playerId: string,
  startedAtMs: number,
  nowMs: number,
): TurnCountdownState | null {
  const elapsed = Math.max(0, nowMs - startedAtMs);
  const cycleElapsed = elapsed % TURN_COUNTDOWN_MS;
  const remainingMs = TURN_COUNTDOWN_MS - cycleElapsed;
  return {
    playerId,
    remainingMs,
    progress: remainingMs / TURN_COUNTDOWN_MS,
    segment: turnCountdownSegment(remainingMs),
  };
}
