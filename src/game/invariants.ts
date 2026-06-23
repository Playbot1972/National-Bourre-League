import { cardKey, cardsEqual } from "./cardUtils";
import type { DrawPileState } from "./drawPile";
import type { Card } from "../types";
import type { CurrentTrickState, PlayedCardEntry, PublicHandState } from "./types";

export class CardUniquenessError extends Error {
  duplicates: string[];

  constructor(message: string, duplicates: string[]) {
    super(message);
    this.name = "CardUniquenessError";
    this.duplicates = duplicates;
  }
}

function addKeys(map: Map<string, string>, card: Card, location: string) {
  const key = cardKey(card);
  const prev = map.get(key);
  if (prev) {
    return [key];
  }
  map.set(key, location);
  return [];
}

function assertDrawPileUniqueness(seen: Map<string, string>, pile: DrawPileState): string[] {
  const dupes: string[] = [];
  for (let i = 0; i < pile.stock.length; i += 1) {
    dupes.push(...addKeys(seen, pile.stock[i], `stock[${i}]`));
  }
  for (let i = 0; i < pile.recyclePool.length; i += 1) {
    dupes.push(...addKeys(seen, pile.recyclePool[i], `recycle[${i}]`));
  }
  for (let i = 0; i < pile.pendingDiscards.length; i += 1) {
    dupes.push(...addKeys(seen, pile.pendingDiscards[i], `pending[${i}]`));
  }
  return dupes;
}

/** Fail loudly when the same rank+suit appears in more than one zone. */
export function assertCardUniqueness(input: {
  drawPile?: DrawPileState;
  deck?: Card[];
  deckNextIndex?: number;
  trumpUpcard: Card | null;
  trumpHolderId?: string | null;
  privateHands: Record<string, Card[]>;
  currentTrick?: CurrentTrickState | null;
  playedCards?: PlayedCardEntry[];
}): void {
  const seen = new Map<string, string>();
  const dupes: string[] = [];

  if (input.drawPile) {
    dupes.push(...assertDrawPileUniqueness(seen, input.drawPile));
  } else if (input.deck != null && input.deckNextIndex != null) {
    for (let i = input.deckNextIndex; i < input.deck.length; i += 1) {
      dupes.push(...addKeys(seen, input.deck[i], `deck[${i}]`));
    }
  }

  for (const [playerId, hand] of Object.entries(input.privateHands)) {
    for (let i = 0; i < hand.length; i += 1) {
      dupes.push(...addKeys(seen, hand[i], `hand:${playerId}[${i}]`));
    }
  }

  if (input.trumpUpcard) {
    const trumpKey = cardKey(input.trumpUpcard);
    const holderHand = input.trumpHolderId
      ? input.privateHands[input.trumpHolderId]
      : undefined;
    const mirroredInHolderHand = holderHand?.some((c) => cardKey(c) === trumpKey) ?? false;
    if (!mirroredInHolderHand) {
      dupes.push(...addKeys(seen, input.trumpUpcard, "trumpUpcard"));
    }
  }

  for (const play of input.currentTrick?.plays ?? []) {
    dupes.push(...addKeys(seen, play.card as Card, `trick:${play.playerId}`));
  }

  for (const entry of input.playedCards ?? []) {
    dupes.push(...addKeys(seen, entry.card as Card, `played:t${entry.trickNumber}`));
  }

  if (dupes.length) {
    const unique = [...new Set(dupes)];
    const detail = unique.map((k) => `${k} (${seen.get(k)})`).join(", ");
    throw new CardUniquenessError(`Duplicate card(s) in game state: ${detail}`, unique);
  }
}

export function trumpOwnerId(
  publicHand: Pick<PublicHandState, "dealerId" | "trumpHolderId">,
): string | null {
  return publicHand.trumpHolderId ?? publicHand.dealerId ?? null;
}

export function trumpOnTable(publicHand: Pick<PublicHandState, "trumpUpcard">): boolean {
  return Boolean(publicHand.trumpUpcard);
}

/**
 * Playable hand for draw/play. While the trump reveal is on the table, the holder
 * sees/plays four cards here; legacy sessions may only store four private cards and
 * merge the public trump reveal.
 */
export function effectivePlayerHand(
  playerId: string,
  privateHand: Card[],
  publicHand: Pick<PublicHandState, "dealerId" | "trumpHolderId" | "trumpUpcard">,
): Card[] {
  const hand = [...privateHand];
  const owner = trumpOwnerId(publicHand);
  const trump = publicHand.trumpUpcard as Card | null;
  if (!owner || playerId !== owner || !trump) {
    return hand;
  }
  const trumpInPrivate = hand.some((c) => cardsEqual(c, trump));
  if (trumpInPrivate) {
    // Full private hand — dealer may discard the revealed trump during draw.
    return hand;
  }
  hand.push(trump);
  return hand;
}

/** Persist the holder's full private hand after draw or play. */
export function privateHandFromEffective(
  playerId: string,
  effectiveHand: Card[],
  publicHand: Pick<PublicHandState, "dealerId" | "trumpHolderId" | "trumpUpcard">,
): Card[] {
  const owner = trumpOwnerId(publicHand);
  const trump = publicHand.trumpUpcard as Card | null;
  if (
    owner &&
    playerId === owner &&
    trump &&
    !effectiveHand.some((c) => cardsEqual(c, trump))
  ) {
    return [...effectiveHand, trump];
  }
  return [...effectiveHand];
}

export function effectiveIndexDiscardsTrump(
  playerId: string,
  discardIndices: number[],
  effectiveHand: Card[],
  publicHand: Pick<PublicHandState, "dealerId" | "trumpHolderId" | "trumpUpcard">,
): boolean {
  const owner = trumpOwnerId(publicHand);
  if (!owner || playerId !== owner || !publicHand.trumpUpcard) return false;
  return discardIndices.some((i) => {
    const c = effectiveHand[i];
    return c && cardsEqual(c, publicHand.trumpUpcard as Card);
  });
}

export function playedTrumpUpcard(
  card: Card,
  publicHand: Pick<PublicHandState, "trumpUpcard">,
): boolean {
  return Boolean(publicHand.trumpUpcard && cardsEqual(card, publicHand.trumpUpcard as Card));
}

const CARDS_PER_HAND = 5;

/** Cards still held from trick play history. */
export function cardsRemainingInHand(
  publicHand: Pick<PublicHandState, "playedCards" | "currentTrick">,
  playerId: string,
): number {
  const played = (publicHand.playedCards ?? []).filter((p) => p.playerId === playerId).length;
  const inTrick = (publicHand.currentTrick?.plays ?? []).filter((p) => p.playerId === playerId)
    .length;
  return Math.max(0, CARDS_PER_HAND - played - inTrick);
}

/**
 * Hole-card count for seat display. While the trump reveal is on the table, the
 * holder shows one fewer back until presentation merges trump into the hand.
 */
export function displayHoleCardCount(
  publicHand: Pick<
    PublicHandState,
    "playedCards" | "currentTrick" | "dealerId" | "trumpHolderId" | "trumpUpcard"
  >,
  playerId: string,
  trumpMergedPresentation = false,
): number {
  const base = cardsRemainingInHand(publicHand, playerId);
  if (trumpMergedPresentation) return base;
  const owner = trumpOwnerId(publicHand);
  if (owner === playerId && trumpOnTable(publicHand)) {
    return Math.max(0, base - 1);
  }
  return base;
}

export function trumpRevealMirroredInHolderHand(
  publicHand: Pick<PublicHandState, "trumpHolderId" | "trumpUpcard">,
  privateHands: Record<string, Card[]>,
): boolean {
  if (!publicHand.trumpUpcard || !publicHand.trumpHolderId) return false;
  const holderHand = privateHands[publicHand.trumpHolderId];
  if (!holderHand?.length) return false;
  return holderHand.some((c) => cardsEqual(c, publicHand.trumpUpcard as Card));
}
