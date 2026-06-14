import type { Card, Rank, Suit } from "../types";

export type { Card, Rank, Suit };

/** Public hand phases stored on the session doc (no hidden cards). */
export const HAND_PHASE = {
  DRAW: "draw",
  PLAY: "play",
} as const;

export type HandPhase = (typeof HAND_PHASE)[keyof typeof HAND_PHASE];

export interface SerializedCard {
  rank: Rank;
  suit: Suit;
}

export interface PlayedCardEntry {
  playerId: string;
  card: SerializedCard;
  trickNumber: number;
}

export interface CurrentTrickState {
  trickNumber: number;
  leadPlayerId: string;
  leadSuit: Suit | null;
  plays: Array<{ playerId: string; card: SerializedCard }>;
}

/** Public session.currentHand — safe for all room members. */
export interface PublicHandState {
  phase: HandPhase;
  participantIds: string[];
  dealerId: string | null;
  trumpSuit: Suit;
  trumpUpcard: SerializedCard;
  remainingDeckCount: number;
  currentTrick: CurrentTrickState | null;
  leadSuit: Suit | null;
  playedCards: PlayedCardEntry[];
  turnPlayerId: string | null;
  tricksByPlayer: Record<string, number>;
}

export interface PrivateHandState {
  cards: SerializedCard[];
}

export interface DealResult {
  dealOrder: string[];
  participantIds: string[];
  privateHands: Record<string, Card[]>;
  trumpUpcard: Card;
  trumpSuit: Suit;
  remainingDeck: Card[];
  turnPlayerId: string;
  tricksByPlayer: Record<string, number>;
}

export interface SerializedHandBundle {
  publicHand: PublicHandState;
  privateHandsByPlayer: Record<string, PrivateHandState>;
}
