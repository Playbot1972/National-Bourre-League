import { maxDrawDiscards } from "./drawLimit";
import { playerOrderFromDealer } from "./playerOrder";
import { HAND_PHASE } from "./types";
import type { HandDecision, PublicHandState, SerializedCard } from "./types";

export type { HandDecision } from "./types";

export const HAND_DECISION_SECONDS = 12;
export const HAND_DECISION_MS = HAND_DECISION_SECONDS * 1000;

export interface DecisionCompletionContext {
  dealerId: string | null;
  sortedPlayerIds: string[];
  dealingRule?: string | null;
}

export type DecisionStepResult =
  | { kind: "continue"; handDecision: HandDecision; publicHand: PublicHandState }
  | { kind: "restart"; handDecision: HandDecision; publicHand: PublicHandState }
  | { kind: "soloWin"; winnerId: string; handDecision: null; publicHand: PublicHandState }
  | { kind: "draw"; handDecision: null; publicHand: PublicHandState };

export function buildHandDecision(
  seatedIds: string[],
  dealerId: string | null,
  active = false,
  nowMs = Date.now(),
): HandDecision {
  const orderedPlayerIds = playerOrderFromDealer(dealerId, seatedIds);
  return {
    active,
    orderedPlayerIds,
    currentIndex: 0,
    turnDeadlineMs: nowMs + HAND_DECISION_MS,
    playingIds: [],
    passedIds: [],
    plannedDiscards: {},
  };
}

export function currentDecisionPlayer(decision: HandDecision): string | null {
  return decision.orderedPlayerIds[decision.currentIndex] ?? null;
}

export function dealerMustPlayTrumpAce(
  playerId: string,
  dealerId: string | null | undefined,
  trumpUpcard: SerializedCard | null | undefined,
): boolean {
  return (
    playerId === dealerId &&
    trumpUpcard?.rank === "A" &&
    Boolean(trumpUpcard?.suit)
  );
}

function firstDrawTurn(
  actionOrder: string[],
  drawCompletedIds: string[],
): string | null {
  for (const id of actionOrder) {
    if (!drawCompletedIds.includes(id)) return id;
  }
  return actionOrder[0] ?? null;
}

function completeDecisionToDraw(
  hand: PublicHandState,
  playingIds: string[],
  plannedDiscards: Record<string, number>,
  dealingRule?: string | null,
): PublicHandState {
  const actionOrder = (hand.actionOrder ?? hand.participantIds).filter((id) =>
    playingIds.includes(id),
  );
  const maxDraw = maxDrawDiscards(playingIds.length, dealingRule);
  const drawCompletedIds = playingIds.filter(
    (id) => (plannedDiscards[id] ?? 0) === 0,
  );
  const tricksByPlayer = Object.fromEntries(
    playingIds.map((id) => [id, hand.tricksByPlayer[id] ?? 0]),
  );

  return {
    ...hand,
    phase: HAND_PHASE.DRAW,
    participantIds: [...playingIds],
    actionOrder,
    maxDrawDiscards: maxDraw,
    tricksByPlayer,
    drawCompletedIds,
    turnPlayerId: firstDrawTurn(actionOrder, drawCompletedIds),
    handDecision: null,
    seatedIds: hand.seatedIds,
  };
}

export function activateHandDecision(
  hand: PublicHandState,
  nowMs = Date.now(),
): PublicHandState {
  const decision = hand.handDecision ?? buildHandDecision(hand.seatedIds ?? hand.participantIds, hand.dealerId, true, nowMs);
  return {
    ...hand,
    phase: HAND_PHASE.DECISION,
    handDecision: {
      ...decision,
      active: true,
      turnDeadlineMs: nowMs + HAND_DECISION_MS,
    },
  };
}

export function decisionPatchAfterStep(
  hand: PublicHandState,
  decision: HandDecision,
  playingIds: string[],
  passedIds: string[],
  plannedDiscards: Record<string, number>,
  context: DecisionCompletionContext | null,
  nowMs = Date.now(),
): DecisionStepResult {
  const nextIndex = decision.currentIndex + 1;
  if (nextIndex < decision.orderedPlayerIds.length) {
    return {
      kind: "continue",
      handDecision: {
        ...decision,
        playingIds,
        passedIds,
        plannedDiscards,
        currentIndex: nextIndex,
        turnDeadlineMs: nowMs + HAND_DECISION_MS,
      },
      publicHand: {
        ...hand,
        handDecision: {
          ...decision,
          playingIds,
          passedIds,
          plannedDiscards,
          currentIndex: nextIndex,
          turnDeadlineMs: nowMs + HAND_DECISION_MS,
        },
      },
    };
  }

  if (playingIds.length < 2) {
    if (playingIds.length === 1) {
      return {
        kind: "soloWin",
        winnerId: playingIds[0]!,
        handDecision: null,
        publicHand: {
          ...hand,
          participantIds: [...playingIds],
          handDecision: null,
        },
      };
    }
    const restarted = buildHandDecision(
      hand.seatedIds ?? hand.participantIds,
      hand.dealerId,
      true,
      nowMs,
    );
    return {
      kind: "restart",
      handDecision: restarted,
      publicHand: {
        ...hand,
        phase: HAND_PHASE.DECISION,
        handDecision: restarted,
      },
    };
  }

  return {
    kind: "draw",
    handDecision: null,
    publicHand: completeDecisionToDraw(
      hand,
      playingIds,
      plannedDiscards,
      context?.dealingRule,
    ),
  };
}

export function applyDecisionPlay(
  hand: PublicHandState,
  decision: HandDecision,
  playerId: string,
  discardCount: number,
  context: DecisionCompletionContext | null,
  nowMs = Date.now(),
): DecisionStepResult {
  const currentId = currentDecisionPlayer(decision);
  if (currentId !== playerId) {
    throw new Error("Not your turn to decide yet");
  }
  const maxDraw = maxDrawDiscards(hand.participantIds.length, context?.dealingRule);
  const count = Math.max(0, Math.min(maxDraw, Math.floor(discardCount)));
  const playingIds = [...decision.playingIds, playerId];
  const plannedDiscards = { ...decision.plannedDiscards, [playerId]: count };
  return decisionPatchAfterStep(
    hand,
    decision,
    playingIds,
    decision.passedIds,
    plannedDiscards,
    context,
    nowMs,
  );
}

export function applyDecisionPass(
  hand: PublicHandState,
  decision: HandDecision,
  playerId: string,
  context: DecisionCompletionContext | null,
  nowMs = Date.now(),
): DecisionStepResult {
  const currentId = currentDecisionPlayer(decision);
  if (currentId !== playerId) {
    throw new Error("Not your turn to pass yet");
  }
  if (dealerMustPlayTrumpAce(playerId, hand.dealerId, hand.trumpUpcard)) {
    throw new Error("Dealer must play when trump is an ace");
  }
  if (decision.passedIds.includes(playerId)) {
    throw new Error("Already passed this hand");
  }
  const passedIds = [...decision.passedIds, playerId];
  return decisionPatchAfterStep(
    hand,
    decision,
    decision.playingIds,
    passedIds,
    decision.plannedDiscards,
    context,
    nowMs,
  );
}

export function applyDecisionTimeout(
  hand: PublicHandState,
  decision: HandDecision,
  context: DecisionCompletionContext | null,
  nowMs = Date.now(),
): DecisionStepResult {
  const currentId = currentDecisionPlayer(decision);
  if (!currentId) throw new Error("No decision turn");
  if (dealerMustPlayTrumpAce(currentId, hand.dealerId, hand.trumpUpcard)) {
    return applyDecisionPlay(hand, decision, currentId, 0, context, nowMs);
  }
  const passedIds = [...decision.passedIds, currentId];
  return decisionPatchAfterStep(
    hand,
    decision,
    decision.playingIds,
    passedIds,
    decision.plannedDiscards,
    context,
    nowMs,
  );
}

/** Map legacy enrollment fields to decision for presentation diffs. */
export function decisionAsEnrollmentView(decision: HandDecision | null | undefined) {
  if (!decision) return null;
  return {
    active: decision.active,
    orderedPlayerIds: decision.orderedPlayerIds,
    currentIndex: decision.currentIndex,
    turnDeadlineMs: decision.turnDeadlineMs,
    enrolledIds: decision.playingIds,
    declinedIds: decision.passedIds,
  };
}
