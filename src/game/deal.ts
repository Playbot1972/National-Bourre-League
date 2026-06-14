import type { Card } from "../types";
import { createDeck, shuffleDeck } from "./deck";
import { activePlayerOrder, CARDS_PER_PLAYER } from "./playerOrder";
import type { DealResult } from "./types";

export interface DealInitialHandInput {
  dealerId: string | null;
  participantIds: string[];
  sortedPlayerIds: string[];
  seed?: number;
}

/**
 * Deal five cards each, one at a time clockwise from the seat after the dealer.
 * The dealer's fifth card (last card of the deal) is the trump upcard.
 */
export function dealInitialHand(input: DealInitialHandInput): DealResult {
  const participantIds = [...new Set(input.participantIds.filter(Boolean))];
  if (participantIds.length < 2) {
    throw new Error("Need at least two participants to deal");
  }

  const dealOrder = activePlayerOrder(
    input.dealerId,
    participantIds,
    input.sortedPlayerIds,
  );
  if (dealOrder.length < 2) {
    throw new Error("Need at least two seated participants in deal order");
  }

  const deck = shuffleDeck(createDeck(), input.seed);
  const privateHands: Record<string, Card[]> = Object.fromEntries(
    dealOrder.map((id) => [id, [] as Card[]]),
  );

  let deckIndex = 0;
  for (let round = 0; round < CARDS_PER_PLAYER; round += 1) {
    for (const playerId of dealOrder) {
      privateHands[playerId].push(deck[deckIndex]);
      deckIndex += 1;
    }
  }

  const trumpUpcard = assignTrumpUpcard(input.dealerId, dealOrder, privateHands);
  const tricksByPlayer = Object.fromEntries(participantIds.map((id) => [id, 0]));

  return {
    dealOrder,
    participantIds,
    privateHands,
    trumpUpcard,
    trumpSuit: trumpUpcard.suit,
    remainingDeck: deck.slice(deckIndex),
    turnPlayerId: dealOrder[0],
    tricksByPlayer,
  };
}

/** Dealer's fifth card is the trump upcard (still part of the dealer's hand). */
export function assignTrumpUpcard(
  dealerId: string | null | undefined,
  dealOrder: string[],
  hands: Record<string, Card[]>,
): Card {
  if (dealerId && dealOrder.includes(dealerId)) {
    const dealerHand = hands[dealerId];
    if (dealerHand?.length === CARDS_PER_PLAYER) {
      return dealerHand[CARDS_PER_PLAYER - 1];
    }
  }
  const lastPlayer = dealOrder[dealOrder.length - 1];
  const fallback = hands[lastPlayer];
  if (!fallback?.length) {
    throw new Error("Cannot assign trump upcard — no cards dealt");
  }
  return fallback[fallback.length - 1];
}
