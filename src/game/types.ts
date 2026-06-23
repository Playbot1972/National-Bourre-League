import type { Card, Rank, Suit } from "../types";

export type { Card, Rank, Suit };

/** Public hand phases stored on the session doc (no hidden cards). */
export const HAND_PHASE = {
  REVEAL: "reveal",
  DECISION: "decision",
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

export interface HandDecision {
  active: boolean;
  orderedPlayerIds: string[];
  currentIndex: number;
  turnDeadlineMs: number;
  playingIds: string[];
  passedIds: string[];
  /** Declared discard count when choosing to play (0 = stay pat). */
  plannedDiscards: Record<string, number>;
}

/** Public session.currentHand — safe for all room members. */
export interface PublicHandState {
  phase: HandPhase;
  participantIds: string[];
  dealerId: string | null;
  /** Player who holds the flipped trump card (dealer when enrolled, else last dealt seat). */
  trumpHolderId?: string | null;
  trumpSuit: Suit;
  /** Face-up reveal for trump suit only — same card as one in trumpHolder's private hand. */
  trumpUpcard: SerializedCard | null;
  remainingDeckCount: number;
  currentTrick: CurrentTrickState | null;
  leadSuit: Suit | null;
  playedCards: PlayedCardEntry[];
  turnPlayerId: string | null;
  tricksByPlayer: Record<string, number>;
  deckSeed?: number;
  deckNextIndex?: number;
  /** Face-down stock pile for replacement draws. */
  drawStock?: SerializedCard[];
  /** Spent cards eligible to rebuild stock when it empties. */
  recyclePool?: SerializedCard[];
  /** Current drawer's discards — excluded from recycle until their draw completes. */
  pendingDrawDiscards?: SerializedCard[];
  /** Incremented each time recycle is shuffled back into stock (deterministic reshuffle). */
  recycleShuffleCount?: number;
  actionOrder?: string[];
  drawCompletedIds?: string[];
  maxDrawDiscards?: number;
  cinchEnabled?: boolean;
  /** All seats dealt this hand (includes players who later pass). */
  seatedIds?: string[];
  /** Players who folded during draw (ante forfeited; excluded from play). */
  foldedIds?: string[];
  /** Pagat-style post-reveal play / pass clock. */
  handDecision?: HandDecision | null;
}

export interface PrivateHandState {
  cards: SerializedCard[];
}

export interface DealResult {
  dealOrder: string[];
  participantIds: string[];
  privateHands: Record<string, Card[]>;
  trumpHolderId: string;
  trumpUpcard: Card;
  trumpSuit: Suit;
  remainingDeck: Card[];
  turnPlayerId: string;
  tricksByPlayer: Record<string, number>;
  deckSeed: number;
  deckNextIndex: number;
}

export interface SerializedHandBundle {
  publicHand: PublicHandState;
  privateHandsByPlayer: Record<string, PrivateHandState>;
}
