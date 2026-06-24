import { removeCardsAtIndices } from "./cardUtils";
import {
  applyDrawPile,
  pileFromPublicHand,
  publicHandWithPile,
  totalAvailableReplacements,
  type DrawPileState,
} from "./drawPile";
import { maxDrawDiscards } from "./drawLimit";
import {
  effectiveIndexDiscardsTrump,
  effectivePlayerHand,
  privateHandFromEffective,
} from "./invariants";
import { openingLeaderId, nextActivePlayerClockwise, resolveActionOrder, resolveSeatRing } from "./playerOrder";
import { HAND_PHASE } from "./types";
import type { Card } from "../types";
import type { PublicHandState } from "./types";

export interface ApplyDrawInput {
  hand: Card[];
  discardIndices: number[];
  pile: DrawPileState;
  deckSeed: number;
  maxDiscards: number;
}

export interface ApplyDrawResult {
  hand: Card[];
  pile: DrawPileState;
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

  const discardedCards = indices.map((i) => input.hand[i]);
  const afterDiscard = removeCardsAtIndices(input.hand, indices);
  const drawCount = indices.length;
  if (drawCount === 0) {
    return {
      hand: afterDiscard,
      pile: input.pile,
      discarded: 0,
    };
  }

  const available = totalAvailableReplacements(input.pile);
  if (available < drawCount) {
    throw new Error(
      `Not enough cards left in draw pile (${available} remaining, tried to draw ${drawCount})`,
    );
  }

  const { pile, replacements } = applyDrawPile({
    pile: input.pile,
    discardedCards,
    drawCount,
    deckSeed: input.deckSeed,
  });

  return {
    hand: [...afterDiscard, ...replacements],
    pile,
    discarded: drawCount,
  };
}

export function nextPlayerInOrder(
  order: string[],
  currentPlayerId: string,
): string | null {
  return nextActivePlayerClockwise(order, currentPlayerId);
}

/** First draw turn — opens left of dealer, skipping seats already pat. */
export function firstUnresolvedDrawTurn(
  publicHand: PublicHandState,
  playingIds: string[],
  drawCompletedIds: string[],
  fallbackSortedPlayerIds?: string[],
): string | null {
  const actionOrder = resolveActionOrder(publicHand, fallbackSortedPlayerIds).filter((id) =>
    playingIds.includes(id),
  );
  const seatRing = resolveSeatRing(publicHand, fallbackSortedPlayerIds);
  const start =
    openingLeaderId(publicHand.dealerId, playingIds, seatRing) ?? actionOrder[0] ?? null;
  if (!start) return null;
  const startIdx = actionOrder.indexOf(start);
  const ring =
    startIdx >= 0
      ? [...actionOrder.slice(startIdx), ...actionOrder.slice(0, startIdx)]
      : actionOrder;
  for (const id of ring) {
    if (!drawCompletedIds.includes(id)) return id;
  }
  return start;
}

export function allDrawsComplete(
  participantIds: string[],
  drawCompletedIds: string[],
): boolean {
  const done = new Set(drawCompletedIds);
  return participantIds.every((id) => done.has(id));
}

export interface ApplyPlayerDrawInput {
  playerId: string;
  privateHand: Card[];
  publicHand: PublicHandState;
  discardIndices: number[];
  /** Legacy full deck — used to derive stock when drawStock is absent. */
  deck?: Card[];
  maxDiscards: number;
}

export interface ApplyPlayerDrawResult {
  privateHand: Card[];
  publicHand: PublicHandState;
  pile: DrawPileState;
  discarded: number;
}

/** Draw/discard using effective hand (includes dealer trump upcard when on table). */
export function applyPlayerDraw(input: ApplyPlayerDrawInput): ApplyPlayerDrawResult {
  const deckSeed = input.publicHand.deckSeed ?? 0;
  const pile = pileFromPublicHand(input.publicHand, input.deck);
  const effective = effectivePlayerHand(input.playerId, input.privateHand, input.publicHand);
  const drawResult = applyDraw({
    hand: effective,
    discardIndices: input.discardIndices,
    pile,
    deckSeed,
    maxDiscards: input.maxDiscards,
  });

  const trumpDiscarded = effectiveIndexDiscardsTrump(
    input.playerId,
    input.discardIndices,
    effective,
    input.publicHand,
  );

  let nextPublic = publicHandWithPile(input.publicHand, drawResult.pile);

  if (trumpDiscarded) {
    nextPublic = { ...nextPublic, trumpUpcard: null };
  }

  const privateHand = privateHandFromEffective(input.playerId, drawResult.hand, nextPublic);

  return {
    privateHand,
    publicHand: nextPublic,
    pile: drawResult.pile,
    discarded: drawResult.discarded,
  };
}

/** After trump reveal animations, open the draw round for all dealt players. */
export function revealToDraw(
  hand: PublicHandState,
  dealingRule?: string | null,
): PublicHandState {
  const playingIds = [...hand.participantIds];
  const actionOrder = resolveActionOrder(hand).filter((id) => playingIds.includes(id));
  const tricksByPlayer = Object.fromEntries(
    playingIds.map((id) => [id, hand.tricksByPlayer[id] ?? 0]),
  );
  const firstTurn = firstUnresolvedDrawTurn(hand, playingIds, []);
  return {
    ...hand,
    phase: HAND_PHASE.DRAW,
    participantIds: playingIds,
    actionOrder,
    handDecision: null,
    drawCompletedIds: [],
    tricksByPlayer,
    turnPlayerId: firstTurn,
    maxDrawDiscards: maxDrawDiscards(playingIds.length, dealingRule),
    pendingDrawDiscards: [],
  };
}

export type DrawFoldResult =
  | { kind: "continue"; publicHand: PublicHandState }
  | { kind: "soloWin"; winnerId: string; publicHand: PublicHandState };

/** Fold during draw — forfeit ante, leave hand, advance turn (or solo-win if one player remains). */
export function applyDrawFold(
  publicHand: PublicHandState,
  actionOrder: string[],
  foldingPlayerId: string,
): DrawFoldResult {
  const participantIds = publicHand.participantIds.filter((id) => id !== foldingPlayerId);
  const foldedIds = [...(publicHand.foldedIds ?? []), foldingPlayerId];
  const newActionOrder = actionOrder.filter((id) => participantIds.includes(id));
  const drawCompletedIds = [...new Set([...(publicHand.drawCompletedIds ?? []), foldingPlayerId])];

  const baseHand: PublicHandState = {
    ...publicHand,
    participantIds,
    actionOrder: newActionOrder,
    drawCompletedIds,
    foldedIds,
    tricksByPlayer: Object.fromEntries(
      participantIds.map((id) => [id, publicHand.tricksByPlayer[id] ?? 0]),
    ),
  };

  if (participantIds.length === 1) {
    return {
      kind: "soloWin",
      winnerId: participantIds[0]!,
      publicHand: { ...baseHand, handDecision: null },
    };
  }
  if (participantIds.length === 0) {
    throw new Error("No players remain in hand");
  }

  if (allDrawsComplete(participantIds, drawCompletedIds)) {
    const next = advanceAfterDraw(baseHand, newActionOrder, foldingPlayerId);
    return { kind: "continue", publicHand: next };
  }

  let turnPlayerId = nextPlayerInOrder(newActionOrder, foldingPlayerId);
  const done = new Set(drawCompletedIds);
  let guard = 0;
  while (turnPlayerId && done.has(turnPlayerId) && guard < newActionOrder.length + 1) {
    turnPlayerId = nextPlayerInOrder(newActionOrder, turnPlayerId);
    guard += 1;
  }

  return {
    kind: "continue",
    publicHand: { ...baseHand, turnPlayerId },
  };
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
      pendingDrawDiscards: [],
    };
  }

  const seatRing = resolveSeatRing(publicHand);
  const leadPlayerId =
    openingLeaderId(publicHand.dealerId, participantIds, seatRing) ??
    resolveActionOrder(publicHand)[0] ??
    completingPlayerId;
  return {
    ...publicHand,
    phase: HAND_PHASE.PLAY,
    drawCompletedIds,
    pendingDrawDiscards: [],
    // First active seat left of dealer leads trick 1; trump flip is not auto-led.
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
