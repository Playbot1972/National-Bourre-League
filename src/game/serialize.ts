import type { Card } from "../types";
import { maxDrawDiscards } from "./drawLimit";
import { buildHandDecision } from "./decision";
import { HAND_PHASE } from "./types";
import type {
  DealResult,
  HandDecision,
  PrivateHandState,
  PublicHandState,
  SerializedHandBundle,
} from "./types";
import { initialServerActionSeq } from "./serverActionSeq";

export function serializeCard(card: Card): { rank: Card["rank"]; suit: Card["suit"] } {
  return { rank: card.rank, suit: card.suit };
}

export function serializeCards(cards: Card[]) {
  return cards.map(serializeCard);
}

export interface SerializeHandOptions {
  dealerId: string | null;
  actionOrder: string[];
  /** Full clockwise table ring — used for left-of-dealer turns (not join order). */
  seatedIds?: string[];
  maxDrawDiscards?: number;
  cinchEnabled?: boolean;
  /** Initial authoritative phase after deal (Pagat: reveal before decision). */
  initialPhase?: (typeof HAND_PHASE)[keyof typeof HAND_PHASE];
  handDecision?: HandDecision | null;
}

/** Split a deal into public session state + per-player private hand docs. */
export function serializeHandState(
  deal: DealResult,
  options: SerializeHandOptions | string | null,
): SerializedHandBundle {
  const dealerId = typeof options === "object" && options !== null ? options.dealerId : options;
  const actionOrder =
    typeof options === "object" && options !== null
      ? options.actionOrder
      : deal.dealOrder;
  const maxDraw =
    typeof options === "object" && options !== null && options.maxDrawDiscards != null
      ? options.maxDrawDiscards
      : maxDrawDiscards(deal.participantIds.length);
  const cinchEnabled =
    typeof options === "object" && options !== null ? options.cinchEnabled === true : false;
  const initialPhase =
    typeof options === "object" && options !== null && options.initialPhase
      ? options.initialPhase
      : HAND_PHASE.DRAW;
  const handDecision =
    typeof options === "object" && options !== null ? options.handDecision ?? null : null;

  const publicHand: PublicHandState = {
    phase: initialPhase,
    participantIds: [...deal.participantIds],
    seatedIds:
      typeof options === "object" && options !== null && options.seatedIds?.length
        ? [...options.seatedIds]
        : [...deal.participantIds],
    dealerId,
    trumpHolderId: deal.trumpHolderId,
    trumpSuit: deal.trumpSuit,
    trumpUpcard: serializeCard(deal.trumpUpcard),
    remainingDeckCount: deal.remainingDeck.length,
    currentTrick: null,
    leadSuit: null,
    playedCards: [],
    turnPlayerId: deal.turnPlayerId,
    tricksByPlayer: { ...deal.tricksByPlayer },
    deckSeed: deal.deckSeed,
    deckNextIndex: deal.deckNextIndex,
    drawStock: serializeCards(deal.remainingDeck),
    recyclePool: [],
    pendingDrawDiscards: [],
    recycleShuffleCount: 0,
    actionOrder: [...actionOrder],
    drawCompletedIds: [],
    maxDrawDiscards: maxDraw,
    cinchEnabled,
    handDecision,
    serverActionSeq: initialServerActionSeq(),
  };

  const privateHandsByPlayer: Record<string, PrivateHandState> = {};
  for (const [playerId, cards] of Object.entries(deal.privateHands)) {
    privateHandsByPlayer[playerId] = { cards: serializeCards(cards) };
  }

  return { publicHand, privateHandsByPlayer };
}

/** Deal bundle for Pagat flow: cards dealt, trump visible, decision clock pending reveal. */
export function serializePagatRevealHand(
  deal: DealResult,
  options: Omit<SerializeHandOptions, "initialPhase" | "handDecision">,
): SerializedHandBundle {
  const handDecision = buildHandDecision(
    options.seatedIds?.length ? options.seatedIds : deal.participantIds,
    options.dealerId,
    false,
  );
  return serializeHandState(deal, {
    ...options,
    initialPhase: HAND_PHASE.REVEAL,
    handDecision,
  });
}

export function deserializeCards(
  cards: Array<{ rank: string; suit: string }>,
): Card[] {
  return cards.map((c) => ({ rank: c.rank as Card["rank"], suit: c.suit as Card["suit"] }));
}
