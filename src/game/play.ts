import { isTrump, rankValue, removeCardAt } from "./cardUtils";
import {
  effectivePlayerHand,
  playedTrumpUpcard,
  privateHandFromEffective,
} from "./invariants";
import { getLegalPlayIndices, validatePlayIndex, type PlayContext } from "./legal";
import { buildPlayValidationState, normalizeTrickForPlay } from "./playContext";
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

export interface ApplyPlayerPlayInput {
  publicHand: PublicHandState;
  privateHand: Card[];
  playerId: string;
  cardIndex: number;
  actionOrder: string[];
  cinchEnabled?: boolean;
}

export interface ApplyPlayerPlayResult extends ApplyPlayResult {
  privateHand: Card[];
}

/** Play a card from the effective hand; clears trump reveal after the opening lead. */
export function applyPlayerPlayCard(input: ApplyPlayerPlayInput): ApplyPlayerPlayResult {
  const effective = effectivePlayerHand(input.playerId, input.privateHand, input.publicHand);
  const openingPlay =
    (input.publicHand.playedCards?.length ?? 0) === 0 &&
    (input.publicHand.currentTrick?.plays?.length ?? 0) === 0 &&
    Object.values(input.publicHand.tricksByPlayer ?? {}).every((n) => (n ?? 0) === 0);
  const result = applyPlayCard({
    publicHand: input.publicHand,
    playerHand: effective,
    playerId: input.playerId,
    cardIndex: input.cardIndex,
    actionOrder: input.actionOrder,
    cinchEnabled: input.cinchEnabled,
  });

  const playedCard = effective[input.cardIndex];
  let nextPublic = result.publicHand;
  if (
    input.publicHand.trumpUpcard &&
    (openingPlay || (playedCard && playedTrumpUpcard(playedCard, input.publicHand)))
  ) {
    nextPublic = { ...nextPublic, trumpUpcard: null };
  }

  const privateHand = privateHandFromEffective(input.playerId, result.playerHand, nextPublic);

  return {
    ...result,
    publicHand: nextPublic,
    privateHand,
    playerHand: privateHand,
  };
}

export function applyPlayCard(input: ApplyPlayInput): ApplyPlayResult {
  const { publicHand, playerId, cardIndex, actionOrder } = input;
  if (publicHand.phase !== HAND_PHASE.PLAY) {
    throw new Error("Not in trick-play phase");
  }
  if (publicHand.turnPlayerId !== playerId) {
    throw new Error("Not your turn");
  }

  const trick = publicHand.currentTrick;
  if (!trick) throw new Error("No active trick");

  const { isLeading, leadSuit, trickIndex } = normalizeTrickForPlay(publicHand);

  const ctx = buildPlayValidationState({
    hand: input.playerHand,
    publicHand,
  });

  const validationMeta = {
    dealerSeat: publicHand.dealerId ?? null,
    leaderSeat: trick.leadPlayerId ?? null,
    currentTurnSeat: playerId,
    trickIndex,
  };

  const legality = validatePlayIndex(ctx, cardIndex, validationMeta);
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

/** Prefer winning the trick when possible; lead with strength, dump lows when losing. */
export function botPlayCardIndex(hand: Card[], ctx: PlayContext): number {
  const legal = getLegalPlayIndices(ctx);
  if (!legal.length) return 0;

  if (ctx.isLeading || !ctx.trickPlays.length) {
    return legal.reduce((best, idx) =>
      rankValue(hand[idx]) > rankValue(hand[best]) ? idx : best,
    );
  }

  const leadSuit = ctx.leadSuit ?? ctx.trickPlays[0]?.suit;
  if (!leadSuit) {
    return legal.reduce((best, idx) =>
      rankValue(hand[idx]) < rankValue(hand[best]) ? idx : best,
    );
  }

  const winners = legal.filter((idx) => {
    const plays = [
      ...ctx.trickPlays.map((card, i) => ({ playerId: `_${i}`, card })),
      { playerId: "_bot", card: hand[idx] },
    ];
    return resolveTrickWinner(plays, leadSuit, ctx.trumpSuit) === "_bot";
  });

  const pool = winners.length ? winners : legal;
  return pool.reduce((best, idx) =>
    rankValue(hand[idx]) < rankValue(hand[best]) ? idx : best,
  );
}
