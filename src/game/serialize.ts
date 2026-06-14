import type { Card } from "../types";
import { maxDrawDiscards } from "./drawLimit";
import { HAND_PHASE } from "./types";
import type {
  DealResult,
  PrivateHandState,
  PublicHandState,
  SerializedHandBundle,
} from "./types";

export function serializeCard(card: Card): { rank: Card["rank"]; suit: Card["suit"] } {
  return { rank: card.rank, suit: card.suit };
}

export function serializeCards(cards: Card[]) {
  return cards.map(serializeCard);
}

export interface SerializeHandOptions {
  dealerId: string | null;
  actionOrder: string[];
  maxDrawDiscards?: number;
  cinchEnabled?: boolean;
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

  const publicHand: PublicHandState = {
    phase: HAND_PHASE.DRAW,
    participantIds: [...deal.participantIds],
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
    actionOrder: [...actionOrder],
    drawCompletedIds: [],
    maxDrawDiscards: maxDraw,
    cinchEnabled,
  };

  const privateHandsByPlayer: Record<string, PrivateHandState> = {};
  for (const [playerId, cards] of Object.entries(deal.privateHands)) {
    privateHandsByPlayer[playerId] = { cards: serializeCards(cards) };
  }

  return { publicHand, privateHandsByPlayer };
}

export function deserializeCards(
  cards: Array<{ rank: string; suit: string }>,
): Card[] {
  return cards.map((c) => ({ rank: c.rank as Card["rank"], suit: c.suit as Card["suit"] }));
}
