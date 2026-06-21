import type { Card } from "../types";
import { createDeck, shuffleDeck } from "./deck";
import { activePlayerOrder, CARDS_PER_PLAYER, openingLeaderId } from "./playerOrder";
import type { DealResult } from "./types";

export interface DealInitialHandInput {
  dealerId: string | null;
  participantIds: string[];
  sortedPlayerIds: string[];
  seed?: number;
}

/**
 * Deal five cards each, one at a time clockwise from the seat after the dealer.
 * The trump holder's fifth dealt card is flipped face-up to set trump suit only —
 * it stays in that player's hand and is not led to the first trick.
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

  const openingLeader = openingLeaderId(
    input.dealerId,
    participantIds,
    input.sortedPlayerIds,
  );

  const seed = input.seed ?? Date.now();
  const deck = shuffleDeck(createDeck(), seed);
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

  const trumpHolderId = resolveTrumpHolderId(input.dealerId, dealOrder);
  const trumpUpcard = assignTrumpUpcard(trumpHolderId, privateHands);

  const tricksByPlayer = Object.fromEntries(participantIds.map((id) => [id, 0]));

  return {
    dealOrder,
    participantIds,
    privateHands,
    trumpHolderId,
    trumpUpcard,
    trumpSuit: trumpUpcard.suit,
    remainingDeck: deck.slice(deckIndex),
    // Draw and first trick both start with the first active seat left of dealer.
    turnPlayerId: openingLeader ?? dealOrder[0],
    tricksByPlayer,
    deckSeed: seed,
    deckNextIndex: deckIndex,
  };
}

function resolveTrumpHolderId(
  dealerId: string | null | undefined,
  dealOrder: string[],
): string {
  if (dealerId && dealOrder.includes(dealerId)) {
    return dealerId;
  }
  return dealOrder[dealOrder.length - 1];
}

/** The trump holder's fifth dealt card sets trump; it remains in their private hand. */
export function assignTrumpUpcard(
  trumpHolderId: string,
  hands: Record<string, Card[]>,
): Card {
  const holderHand = hands[trumpHolderId];
  if (holderHand?.length === CARDS_PER_PLAYER) {
    return holderHand[CARDS_PER_PLAYER - 1];
  }
  throw new Error("Cannot assign trump upcard — trump holder has no fifth card");
}
