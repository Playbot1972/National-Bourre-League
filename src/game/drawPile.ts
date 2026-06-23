import type { Card } from "../types";
import { shuffleDeck } from "./deck";
import { deserializeCards, serializeCards } from "./serialize";
import { shuffledDeckFromSeed } from "./deckState";
import type { PublicHandState } from "./types";

/** In-memory draw pile: stock, spent recycle pool, and the active player's pending discards. */
export interface DrawPileState {
  stock: Card[];
  recyclePool: Card[];
  pendingDiscards: Card[];
  recycleShuffleCount: number;
}

export function emptyDrawPile(): DrawPileState {
  return { stock: [], recyclePool: [], pendingDiscards: [], recycleShuffleCount: 0 };
}

export function createDrawPileFromStock(stock: Card[]): DrawPileState {
  return { stock: [...stock], recyclePool: [], pendingDiscards: [], recycleShuffleCount: 0 };
}

/** Cards that can still be drawn (stock + recycle; pending discards are excluded). */
export function totalAvailableReplacements(pile: DrawPileState): number {
  return pile.stock.length + pile.recyclePool.length;
}

export function cloneDrawPile(pile: DrawPileState): DrawPileState {
  return {
    stock: [...pile.stock],
    recyclePool: [...pile.recyclePool],
    pendingDiscards: [...pile.pendingDiscards],
    recycleShuffleCount: pile.recycleShuffleCount,
  };
}

function reshuffleRecycleIntoStock(pile: DrawPileState, deckSeed: number): DrawPileState {
  if (!pile.recyclePool.length) return pile;
  const shuffleSeed = (deckSeed ^ ((pile.recycleShuffleCount + 1) * 0x9e3779b9)) >>> 0;
  return {
    stock: shuffleDeck(pile.recyclePool, shuffleSeed),
    recyclePool: [],
    pendingDiscards: [...pile.pendingDiscards],
    recycleShuffleCount: pile.recycleShuffleCount + 1,
  };
}

/** Draw replacements from stock; reshuffle recycle when stock is exhausted mid-draw. */
export function drawFromPile(
  pile: DrawPileState,
  count: number,
  deckSeed: number,
): { pile: DrawPileState; cards: Card[] } {
  if (count <= 0) {
    return { pile: cloneDrawPile(pile), cards: [] };
  }

  let current = cloneDrawPile(pile);
  const cards: Card[] = [];

  while (cards.length < count) {
    if (current.stock.length === 0) {
      if (current.recyclePool.length === 0) {
        throw new Error(
          `Not enough cards in draw pile (${totalAvailableReplacements(pile)} available, tried to draw ${count})`,
        );
      }
      current = reshuffleRecycleIntoStock(current, deckSeed);
    }
    const need = count - cards.length;
    const take = Math.min(need, current.stock.length);
    cards.push(...current.stock.splice(0, take));
  }

  return { pile: current, cards };
}

export interface ApplyDrawPileInput {
  pile: DrawPileState;
  discardedCards: Card[];
  drawCount: number;
  deckSeed: number;
}

/**
 * Replacement draw: hold the player's discards aside, draw from stock (recycle when
 * stock empties), then move those discards into the recycle pool.
 */
export function applyDrawPile(input: ApplyDrawPileInput): {
  pile: DrawPileState;
  replacements: Card[];
} {
  const drawCount = input.drawCount;
  if (drawCount === 0) {
    return { pile: cloneDrawPile(input.pile), replacements: [] };
  }

  const pileWithPending: DrawPileState = {
    ...cloneDrawPile(input.pile),
    pendingDiscards: [...input.discardedCards],
  };

  const { pile: afterDraw, cards: replacements } = drawFromPile(
    pileWithPending,
    drawCount,
    input.deckSeed,
  );

  return {
    pile: {
      ...afterDraw,
      recyclePool: [...afterDraw.recyclePool, ...afterDraw.pendingDiscards],
      pendingDiscards: [],
    },
    replacements,
  };
}

export function pileFromPublicHand(publicHand: PublicHandState, deck?: Card[]): DrawPileState {
  if (publicHand.drawStock != null) {
    return {
      stock: deserializeCards(publicHand.drawStock),
      recyclePool: deserializeCards(publicHand.recyclePool ?? []),
      pendingDiscards: deserializeCards(publicHand.pendingDrawDiscards ?? []),
      recycleShuffleCount: publicHand.recycleShuffleCount ?? 0,
    };
  }

  const seed = publicHand.deckSeed;
  const fullDeck = deck ?? (seed != null ? shuffledDeckFromSeed(seed) : []);
  const deckNextIndex = publicHand.deckNextIndex ?? 0;
  return createDrawPileFromStock(fullDeck.slice(deckNextIndex));
}

export function publicHandWithPile(
  publicHand: PublicHandState,
  pile: DrawPileState,
): PublicHandState {
  return {
    ...publicHand,
    drawStock: serializeCards(pile.stock),
    recyclePool: serializeCards(pile.recyclePool),
    pendingDrawDiscards: serializeCards(pile.pendingDiscards),
    recycleShuffleCount: pile.recycleShuffleCount,
    remainingDeckCount: pile.stock.length,
  };
}
