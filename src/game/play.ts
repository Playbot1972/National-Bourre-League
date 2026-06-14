import { isTrump, rankValue, removeCardAt } from "./cardUtils";
import { getLegalPlayIndices, validatePlayIndex, type PlayContext } from "./legal";
import { resolveTrickWinner } from "./trick";
import { HAND_PHASE } from "./types";
import type { Card, Suit } from "../types";
import type { CurrentTrickState, PlayedCardEntry, PublicHandState } from "./types";
import { serializeCard } from "./serialize";

export interface ApplyPlayInput {
  publicHand: PublicHandState;
  playerHand: Card[];
  playerId: string;
  cardIndex: number;
  actionOrder: string[];
  cinchEnabled?: boolean;
}

export interface ApplyPlayResult {
  publicHand: PublicHandState;
  playerHand: Card[];
  trickResolved: boolean;
  handComplete: boolean;
}

const TRICKS_PER_HAND = 5;

function nextInOrder(order: string[], playerId: string): string {
  const idx = order.indexOf(playerId);
  return order[(idx + 1) % order.length];
}

export function applyPlayCard(input: ApplyPlayInput): ApplyPlayResult {
  const { publicHand, playerId, cardIndex, actionOrder, cinchEnabled } = input;
  if (publicHand.phase !== HAND_PHASE.PLAY) {
    throw new Error("Not in trick-play phase");
  }
  if (publicHand.turnPlayerId !== playerId) {
    throw new Error("Not your turn");
  }

  const trick = publicHand.currentTrick;
  if (!trick) throw new Error("No active trick");

  const trickPlays = trick.plays.map((p) => ({
    rank: p.card.rank,
    suit: p.card.suit,
  })) as Card[];
  const isLeading = trick.plays.length === 0;
  const leadSuit = (trick.leadSuit ?? (isLeading ? null : trickPlays[0]?.suit)) as Suit | null;

  const ctx: PlayContext = {
    hand: input.playerHand,
    trumpSuit: publicHand.trumpSuit,
    leadSuit: isLeading ? null : leadSuit,
    trickPlays,
    isLeading,
    cinchEnabled,
  };

  const legality = validatePlayIndex(ctx, cardIndex);
  if (!legality.ok) throw new Error(legality.message);

  const card = input.playerHand[cardIndex];
  const playerHand = removeCardAt(input.playerHand, cardIndex);
  const playEntry = { playerId, card: serializeCard(card) };
  const newPlays = [...trick.plays, playEntry];
  const effectiveLeadSuit = (isLeading ? card.suit : leadSuit) as Suit;

  const participantIds = publicHand.participantIds;
  const trickComplete = newPlays.length >= participantIds.length;

  if (!trickComplete) {
    const nextTurn = nextInOrder(actionOrder, playerId);
    const updatedTrick: CurrentTrickState = {
      ...trick,
      leadSuit: effectiveLeadSuit,
      plays: newPlays,
    };
    return {
      publicHand: {
        ...publicHand,
        leadSuit: effectiveLeadSuit,
        currentTrick: updatedTrick,
        turnPlayerId: nextTurn,
      },
      playerHand,
      trickResolved: false,
      handComplete: false,
    };
  }

  const winnerId = resolveTrickWinner(
    newPlays.map((p) => ({ playerId: p.playerId, card: p.card as Card })),
    effectiveLeadSuit,
    publicHand.trumpSuit,
  );

  const tricksByPlayer = { ...publicHand.tricksByPlayer };
  tricksByPlayer[winnerId] = (tricksByPlayer[winnerId] ?? 0) + 1;

  const playedCards: PlayedCardEntry[] = [
    ...publicHand.playedCards,
    ...newPlays.map((p) => ({ ...p, trickNumber: trick.trickNumber })),
  ];

  const totalTricks = Object.values(tricksByPlayer).reduce((s, n) => s + (n || 0), 0);
  const handComplete = totalTricks >= TRICKS_PER_HAND;

  if (handComplete) {
    return {
      publicHand: {
        ...publicHand,
        tricksByPlayer,
        playedCards,
        currentTrick: null,
        leadSuit: null,
        turnPlayerId: null,
      },
      playerHand,
      trickResolved: true,
      handComplete: true,
    };
  }

  const nextTrickNumber = trick.trickNumber + 1;
  return {
    publicHand: {
      ...publicHand,
      tricksByPlayer,
      playedCards,
      leadSuit: null,
      turnPlayerId: winnerId,
      currentTrick: {
        trickNumber: nextTrickNumber,
        leadPlayerId: winnerId,
        leadSuit: null,
        plays: [],
      },
    },
    playerHand,
    trickResolved: true,
    handComplete: false,
  };
}

/** Simple bot: discard lowest non-trump cards up to max. */
export function botDrawDiscardIndices(
  hand: Card[],
  trumpSuit: Suit,
  maxDiscards: number,
): number[] {
  if (maxDiscards <= 0) return [];
  const ranked = hand
    .map((card, index) => ({
      card,
      index,
      value: rankValue(card),
      trump: isTrump(card, trumpSuit),
    }))
    .sort((a, b) => {
      if (a.trump !== b.trump) return a.trump ? 1 : -1;
      return a.value - b.value;
    });
  return ranked.slice(0, maxDiscards).map((x) => x.index);
}

/** Simple bot: lowest legal card. */
export function botPlayCardIndex(hand: Card[], ctx: PlayContext): number {
  const legal = getLegalPlayIndices(ctx);
  if (!legal.length) return 0;
  let best = legal[0];
  let bestVal = rankValue(hand[best]);
  for (const idx of legal) {
    const v = rankValue(hand[idx]);
    if (v < bestVal) {
      best = idx;
      bestVal = v;
    }
  }
  return best;
}
