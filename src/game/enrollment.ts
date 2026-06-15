import { dealInitialHand } from "./deal";
import { maxDrawDiscards } from "./drawLimit";
import { playerOrderFromDealer } from "./playerOrder";
import { serializeHandState } from "./serialize";
import type { PrivateHandState, PublicHandState } from "./types";

export const HAND_ENROLLMENT_SECONDS = 12;
export const HAND_ENROLLMENT_MS = HAND_ENROLLMENT_SECONDS * 1000;

export interface HandEnrollment {
  active: boolean;
  orderedPlayerIds: string[];
  currentIndex: number;
  turnDeadlineMs: number;
  enrolledIds: string[];
  declinedIds: string[];
}

export interface DealCompletionContext {
  dealerId: string | null;
  sortedPlayerIds: string[];
  seed?: number;
  dealingRule?: string | null;
}

export interface EmptyPreDealHand {
  tricksByPlayer: Record<string, number>;
  participantIds: string[];
}

export type EnrollmentStepResult =
  | { kind: "continue"; handEnrollment: HandEnrollment; currentHand: EmptyPreDealHand }
  | { kind: "restart"; handEnrollment: HandEnrollment; currentHand: EmptyPreDealHand }
  | {
      kind: "deal";
      handEnrollment: null;
      currentHand: PublicHandState;
      privateHandsByPlayer: Record<string, PrivateHandState>;
    };

function emptyPreDealHand(): EmptyPreDealHand {
  return { tricksByPlayer: {}, participantIds: [] };
}

/** Clockwise enrollment starting with the first seat after the dealer. */
export function buildHandEnrollment(
  sortedPlayerIds: string[],
  dealerId: string | null,
  nowMs = Date.now(),
): HandEnrollment {
  const orderedPlayerIds = playerOrderFromDealer(dealerId, sortedPlayerIds);
  return {
    active: true,
    orderedPlayerIds,
    currentIndex: 0,
    turnDeadlineMs: nowMs + HAND_ENROLLMENT_MS,
    enrolledIds: [],
    declinedIds: [],
  };
}

export function currentEnrollmentPlayer(enrollment: HandEnrollment): string | null {
  return enrollment.orderedPlayerIds[enrollment.currentIndex] ?? null;
}

export function enrollmentPatchAfterStep(
  enrollment: HandEnrollment,
  enrolledIds: string[],
  declinedIds: string[],
  dealContext: DealCompletionContext | null,
  nowMs = Date.now(),
): EnrollmentStepResult {
  const nextIndex = enrollment.currentIndex + 1;
  if (nextIndex < enrollment.orderedPlayerIds.length) {
    return {
      kind: "continue",
      handEnrollment: {
        ...enrollment,
        enrolledIds,
        declinedIds,
        currentIndex: nextIndex,
        turnDeadlineMs: nowMs + HAND_ENROLLMENT_MS,
      },
      currentHand: emptyPreDealHand(),
    };
  }
  if (enrolledIds.length < 2) {
    return {
      kind: "restart",
      handEnrollment: {
        ...enrollment,
        enrolledIds: [],
        declinedIds: [],
        currentIndex: 0,
        turnDeadlineMs: nowMs + HAND_ENROLLMENT_MS,
      },
      currentHand: emptyPreDealHand(),
    };
  }
  if (!dealContext?.sortedPlayerIds?.length) {
    throw new Error("Missing deal context for enrollment completion");
  }
  const deal = dealInitialHand({
    dealerId: dealContext.dealerId,
    participantIds: enrolledIds,
    sortedPlayerIds: dealContext.sortedPlayerIds,
    seed: dealContext.seed ?? nowMs,
  });
  const bundle = serializeHandState(deal, {
    dealerId: dealContext.dealerId,
    actionOrder: deal.dealOrder,
    maxDrawDiscards: maxDrawDiscards(enrolledIds.length, dealContext.dealingRule),
  });
  return {
    kind: "deal",
    handEnrollment: null,
    currentHand: bundle.publicHand,
    privateHandsByPlayer: bundle.privateHandsByPlayer,
  };
}

export function applyEnrollmentIn(
  enrollment: HandEnrollment,
  playerId: string,
  dealContext: DealCompletionContext | null,
  nowMs = Date.now(),
): EnrollmentStepResult {
  const currentId = currentEnrollmentPlayer(enrollment);
  if (currentId !== playerId) {
    throw new Error("Not your turn to join yet");
  }
  const enrolledIds = [...enrollment.enrolledIds, playerId];
  return enrollmentPatchAfterStep(
    enrollment,
    enrolledIds,
    enrollment.declinedIds,
    dealContext,
    nowMs,
  );
}

export function applyEnrollmentTimeout(
  enrollment: HandEnrollment,
  dealContext: DealCompletionContext | null,
  nowMs = Date.now(),
): EnrollmentStepResult {
  const currentId = currentEnrollmentPlayer(enrollment);
  if (!currentId) throw new Error("No enrollment turn");
  const declinedIds = [...enrollment.declinedIds, currentId];
  return enrollmentPatchAfterStep(
    enrollment,
    enrollment.enrolledIds,
    declinedIds,
    dealContext,
    nowMs,
  );
}

/** Run enrollment until deal or restart; `shouldJoin(playerId)` returns true to tap I'm in. */
export function runEnrollmentPhase(
  sortedPlayerIds: string[],
  dealerId: string | null,
  shouldJoin: (playerId: string) => boolean,
  dealContext: Omit<DealCompletionContext, "dealerId" | "sortedPlayerIds"> = {},
  nowMs = Date.now(),
): EnrollmentStepResult {
  let enrollment = buildHandEnrollment(sortedPlayerIds, dealerId, nowMs);
  const ctx: DealCompletionContext = { dealerId, sortedPlayerIds, ...dealContext };
  let guard = 0;
  while (enrollment.active && guard < 64) {
    guard += 1;
    const currentId = currentEnrollmentPlayer(enrollment);
    if (!currentId) break;
    const step = shouldJoin(currentId)
      ? applyEnrollmentIn(enrollment, currentId, ctx, nowMs + guard)
      : applyEnrollmentTimeout(enrollment, ctx, nowMs + guard);
    if (step.kind === "deal" || step.kind === "restart") return step;
    enrollment = step.handEnrollment;
  }
  throw new Error("Enrollment phase did not complete");
}
