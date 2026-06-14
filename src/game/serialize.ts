import type { Card } from "../types";
import { HAND_PHASE } from "./types";
import type {
  DealResult,
  PrivateHandState,
  PublicHandState,
  SerializedCard,
  SerializedHandBundle,
} from "./types";

export function serializeCard(card: Card): SerializedCard {
  return { rank: card.rank, suit: card.suit };
}

export function serializeCards(cards: Card[]): SerializedCard[] {
  return cards.map(serializeCard);
}

/** Split a deal into public session state + per-player private hand docs. */
export function serializeHandState(
  deal: DealResult,
  dealerId: string | null,
): SerializedHandBundle {
  const publicHand: PublicHandState = {
    phase: HAND_PHASE.DRAW,
    participantIds: [...deal.participantIds],
    dealerId,
    trumpSuit: deal.trumpSuit,
    trumpUpcard: serializeCard(deal.trumpUpcard),
    remainingDeckCount: deal.remainingDeck.length,
    currentTrick: null,
    leadSuit: null,
    playedCards: [],
    turnPlayerId: deal.turnPlayerId,
    tricksByPlayer: { ...deal.tricksByPlayer },
  };

  const privateHandsByPlayer: Record<string, PrivateHandState> = {};
  for (const [playerId, cards] of Object.entries(deal.privateHands)) {
    privateHandsByPlayer[playerId] = { cards: serializeCards(cards) };
  }

  return { publicHand, privateHandsByPlayer };
}
