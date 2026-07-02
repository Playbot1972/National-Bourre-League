import {
  buildHandFlowSnapshot,
  HAND_FLOW_PHASE,
  type HandFlowSessionView,
} from "../session/handPhaseMachine";
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

export interface TurnCountdownInput {
  session: Pick<
    TableSessionData,
    | "phase"
    | "turnPlayerId"
    | "drawCompletedIds"
    | "handEnrollment"
    | "handDecision"
    | "participantIds"
    | "tricksByPlayer"
    | "handNumber"
    | "pendingCoWinSettlement"
  >;
  suppressTurn: boolean;
  handComplete: boolean;
}

const ACTIONABLE_FLOW_PHASES = new Set<string>([
  HAND_FLOW_PHASE.ENROLLMENT,
  HAND_FLOW_PHASE.DRAW,
  HAND_FLOW_PHASE.PLAY,
]);

/** Color segment from remaining milliseconds (human 15s timer). */
export function turnCountdownSegment(remainingMs: number): TurnCountdownSegment {
  if (remainingMs > TURN_COUNTDOWN_GREEN_UNTIL_MS) return "green";
  if (remainingMs > TURN_COUNTDOWN_YELLOW_UNTIL_MS) return "yellow";
  return "red";
}

/** Proportional green/yellow/red for short bot think windows. */
export function turnCountdownSegmentScaled(
  remainingMs: number,
  durationMs: number,
): TurnCountdownSegment {
  if (durationMs <= 0) return "red";
  const ratio = remainingMs / durationMs;
  if (ratio > 2 / 3) return "green";
  if (ratio > 1 / 3) return "yellow";
  return "red";
}

/** Stable key — reset the ring when ownership or actionable context changes. */
export function turnCountdownActivityKey(input: TurnCountdownInput & { activeActorId: string | null }): string {
  const enrollment = input.session.handEnrollment;
  const enrollmentKey = enrollment?.active
    ? `${enrollment.currentIndex ?? 0}:${enrollment.turnDeadlineMs ?? 0}`
    : "off";
  return [
    input.session.phase ?? "",
    String(input.session.handNumber ?? 0),
    input.activeActorId ?? "",
    enrollmentKey,
    input.suppressTurn ? "1" : "0",
    input.handComplete ? "1" : "0",
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
      handDecision: session.handDecision ?? undefined,
    },
  };
}

/**
 * Authoritative required actor for enrollment, draw, and play.
 * Mirrors `resolveHandFlowTurnPlayerId` / seat `isActiveActor`.
 */
export function resolveTableActiveActorId(input: TurnCountdownInput): string | null {
  if (input.suppressTurn) return null;

  // Server may still be in play while tricks mark the hand complete (trick-5 tail).
  if (input.session.phase === "play") {
    return input.session.turnPlayerId ?? null;
  }

  if (input.handComplete) return null;

  const snapshot = buildHandFlowSnapshot({
    session: sessionViewFromTable(input),
    suppressTurn: input.suppressTurn,
  });

  if (!ACTIONABLE_FLOW_PHASES.has(snapshot.phase)) return null;
  return snapshot.turnPlayerId;
}

export function buildTurnCountdownState(
  playerId: string,
  startedAtMs: number,
  nowMs: number,
  durationMs: number = TURN_COUNTDOWN_MS,
): TurnCountdownState | null {
  const elapsed = Math.max(0, nowMs - startedAtMs);

  if (durationMs < TURN_COUNTDOWN_MS) {
    const remainingMs = Math.max(0, durationMs - elapsed);
    if (remainingMs <= 0) return null;
    return {
      playerId,
      remainingMs,
      progress: remainingMs / durationMs,
      segment: turnCountdownSegmentScaled(remainingMs, durationMs),
    };
  }

  const cycleElapsed = elapsed % TURN_COUNTDOWN_MS;
  const remainingMs = TURN_COUNTDOWN_MS - cycleElapsed;

  return {
    playerId,
    remainingMs,
    progress: remainingMs / TURN_COUNTDOWN_MS,
    segment: turnCountdownSegment(remainingMs),
  };
}
