import { removeCardsAtIndices } from "./cardUtils";
import { drawCardsFromDeck } from "./deckState";
import { HAND_PHASE } from "./types";
import type { Card } from "../types";
import type { PublicHandState } from "./types";

export interface ApplyDrawInput {
  hand: Card[];
  discardIndices: number[];
  deck: Card[];
  deckNextIndex: number;
  maxDiscards: number;
}

export interface ApplyDrawResult {
  hand: Card[];
  deckNextIndex: number;
  discarded: number;
}

export function applyDraw(input: ApplyDrawInput): ApplyDrawResult {
  const indices = [...new Set(input.discardIndices)].sort((a, b) => a - b);
  if (indices.some((i) => i < 0 || i >= input.hand.length)) {
    throw new Error("Invalid discard selection");
  }
  if (indices.length > input.maxDiscards) {
    throw new Error(`You may discard at most ${input.maxDiscards} cards`);
  }
  if (indices.length > 0 && indices.length > input.maxDiscards) {
    throw new Error(`Draw limit is ${input.maxDiscards}`);
  }

  const afterDiscard = removeCardsAtIndices(input.hand, indices);
  const drawCount = indices.length;
  if (drawCount === 0) {
    return {
      hand: afterDiscard,
      deckNextIndex: input.deckNextIndex,
      discarded: 0,
    };
  }

  const { cards: replacements, deckNextIndex } = drawCardsFromDeck(
    input.deck,
    input.deckNextIndex,
    drawCount,
  );
  return {
    hand: [...afterDiscard, ...replacements],
    deckNextIndex,
    discarded: drawCount,
  };
}

export function nextPlayerInOrder(
  order: string[],
  currentPlayerId: string,
): string | null {
  const idx = order.indexOf(currentPlayerId);
  if (idx < 0) return order[0] ?? null;
  return order[(idx + 1) % order.length] ?? null;
}

export function allDrawsComplete(
  participantIds: string[],
  drawCompletedIds: string[],
): boolean {
  const done = new Set(drawCompletedIds);
  return participantIds.every((id) => done.has(id));
}

export function advanceAfterDraw(
  publicHand: PublicHandState,
  actionOrder: string[],
  completingPlayerId: string,
): PublicHandState {
  const drawCompletedIds = [...new Set([...(publicHand.drawCompletedIds ?? []), completingPlayerId])];
  const participantIds = publicHand.participantIds;

  if (!allDrawsComplete(participantIds, drawCompletedIds)) {
    const nextTurn = nextPlayerInOrder(actionOrder, completingPlayerId);
    return {
      ...publicHand,
      drawCompletedIds,
      turnPlayerId: nextTurn,
    };
  }

  const leadPlayerId = actionOrder[0] ?? completingPlayerId;
  return {
    ...publicHand,
    phase: HAND_PHASE.PLAY,
    drawCompletedIds,
    turnPlayerId: leadPlayerId,
    currentTrick: {
      trickNumber: 1,
      leadPlayerId,
      leadSuit: null,
      plays: [],
    },
    leadSuit: null,
  };
}
