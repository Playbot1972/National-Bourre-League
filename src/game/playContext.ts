import { cardsOfSuit, isTrump, rankValue } from "./cardUtils";
import { deserializeCards } from "./serialize";
import type { Card, Suit } from "../types";
import type { CurrentTrickState, PublicHandState } from "./types";

export interface PlayValidationState {
  hand: Card[];
  trumpSuit: Suit;
  leadSuit: Suit | null;
  trickPlays: Card[];
  isLeading: boolean;
  cinchEnabled?: boolean;
}

export interface PlayValidationMeta {
  handNumber?: number;
  dealerSeat?: string | null;
  leaderSeat?: string | null;
  currentTurnSeat?: string | null;
  trickIndex?: number;
}

export interface CanPlayCardResult {
  allowed: boolean;
  reason?: string;
  code?: string;
}

function highestTrumpInHand(hand: Card[], trumpSuit: Suit): Card | null {
  const trumps = cardsOfSuit(hand, trumpSuit);
  if (!trumps.length) return null;
  return trumps.reduce((best, card) => (rankValue(card) >= rankValue(best) ? card : best));
}

function mustLeadHighestTrumpBecauseOfCinch(state: PlayValidationState): boolean {
  if (!state.cinchEnabled) return false;
  const trumps = cardsOfSuit(state.hand, state.trumpSuit);
  const sure = trumps.filter((c) => rankValue(c) >= 13).length;
  return sure >= 3 && trumps.length > 0;
}

function isHighestRequiredTrump(card: Card, state: PlayValidationState): boolean {
  const highest = highestTrumpInHand(state.hand, state.trumpSuit);
  if (!highest) return false;
  return card.rank === highest.rank && card.suit === highest.suit;
}

function trickPlaysFromHand(publicHand: Pick<PublicHandState, "currentTrick">): Card[] {
  const trick = publicHand.currentTrick;
  if (!trick?.plays?.length) return [];
  return trick.plays.map((p) => deserializeCards([p.card])[0]!);
}

/** Normalize trick state — empty plays always means a fresh lead (ignore stale leadSuit). */
export function normalizeTrickForPlay(
  publicHand: Pick<PublicHandState, "currentTrick" | "leadSuit">,
): {
  trick: CurrentTrickState | null;
  trickPlays: Card[];
  isLeading: boolean;
  leadSuit: Suit | null;
  trickIndex: number;
} {
  const trick = publicHand.currentTrick ?? null;
  const trickPlays = trickPlaysFromHand(publicHand);
  const isLeading = trickPlays.length === 0;
  const leadSuit = isLeading
    ? null
    : ((trickPlays[0]?.suit ?? trick?.leadSuit ?? publicHand.leadSuit) as Suit | null);
  return {
    trick,
    trickPlays,
    isLeading,
    leadSuit,
    trickIndex: trick?.trickNumber ?? 0,
  };
}

export function buildPlayValidationState(input: {
  hand: Card[];
  publicHand: Pick<PublicHandState, "trumpSuit" | "currentTrick" | "leadSuit" | "cinchEnabled">;
}): PlayValidationState {
  const { trickPlays, isLeading, leadSuit } = normalizeTrickForPlay(input.publicHand);
  return {
    hand: input.hand,
    trumpSuit: input.publicHand.trumpSuit,
    leadSuit,
    trickPlays,
    isLeading,
    cinchEnabled: input.publicHand.cinchEnabled === true,
  };
}

export function canPlayCard(
  state: PlayValidationState,
  cardIndex: number,
): CanPlayCardResult {
  if (cardIndex < 0 || cardIndex >= state.hand.length) {
    return { allowed: false, reason: "Invalid card selection", code: "INVALID_INDEX" };
  }

  const card = state.hand[cardIndex]!;

  if (state.isLeading || state.trickPlays.length === 0) {
    if (mustLeadHighestTrumpBecauseOfCinch(state)) {
      if (!isHighestRequiredTrump(card, state)) {
        return { allowed: false, reason: "Cinch: play your highest trump", code: "CINCH_HIGHEST_TRUMP" };
      }
    }
    return { allowed: true };
  }

  const leadSuit = state.leadSuit ?? state.trickPlays[0]?.suit;
  if (!leadSuit) {
    return { allowed: true };
  }

  const ledInHand = cardsOfSuit(state.hand, leadSuit);
  if (ledInHand.length > 0) {
    if (card.suit !== leadSuit) {
      return { allowed: false, reason: "You must follow suit", code: "MUST_FOLLOW_SUIT" };
    }
    return { allowed: true };
  }

  const trumpInHand = cardsOfSuit(state.hand, state.trumpSuit);
  if (trumpInHand.length > 0) {
    if (!isTrump(card, state.trumpSuit)) {
      return { allowed: false, reason: "You must play a trump when void in the led suit", code: "MUST_TRUMP" };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

export function logPlayValidation(
  meta: PlayValidationMeta,
  state: PlayValidationState,
  cardIndex: number | null,
  result: CanPlayCardResult,
): void {
  if (typeof console === "undefined" || !console.debug) return;
  const selectedCard =
    cardIndex != null && cardIndex >= 0 && cardIndex < state.hand.length
      ? state.hand[cardIndex]
      : null;
  console.debug("[bourre-play]", {
    handNumber: meta.handNumber ?? null,
    dealerSeat: meta.dealerSeat ?? null,
    leaderSeat: meta.leaderSeat ?? null,
    currentTurnSeat: meta.currentTurnSeat ?? null,
    trickIndex: meta.trickIndex ?? 0,
    trickCards: state.trickPlays.length,
    leadSuit: state.leadSuit,
    trumpSuit: state.trumpSuit,
    isLeading: state.isLeading,
    selectedCard,
    allowed: result.allowed,
    reason: result.reason ?? null,
  });
}
