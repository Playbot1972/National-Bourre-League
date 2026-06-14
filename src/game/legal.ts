import { cardsOfSuit, isTrump, rankValue } from "./cardUtils";
import type { Card, Suit } from "../types";

export type LegalityCode =
  | "NOT_YOUR_TURN"
  | "INVALID_INDEX"
  | "MUST_FOLLOW_SUIT"
  | "MUST_TRUMP"
  | "MUST_OVERTRUMP"
  | "MUST_BEAT_LED_SUIT"
  | "CINCH_HIGHEST_TRUMP";

export interface LegalityError {
  ok: false;
  code: LegalityCode;
  message: string;
}

export interface LegalityOk {
  ok: true;
}

export type LegalityResult = LegalityOk | LegalityError;

export interface PlayContext {
  hand: Card[];
  trumpSuit: Suit;
  leadSuit: Suit | null;
  trickPlays: Card[];
  isLeading: boolean;
  cinchEnabled?: boolean;
}

function highestLedSuitPlay(plays: Card[], leadSuit: Suit, trumpSuit: Suit): Card | null {
  const led = plays.filter((c) => !isTrump(c, trumpSuit) && c.suit === leadSuit);
  if (!led.length) return null;
  return led.reduce((best, c) => (rankValue(c) > rankValue(best) ? c : best));
}

function highestTrumpPlay(plays: Card[], trumpSuit: Suit): Card | null {
  const trumps = plays.filter((c) => isTrump(c, trumpSuit));
  if (!trumps.length) return null;
  return trumps.reduce((best, c) => (rankValue(c) > rankValue(best) ? c : best));
}

function beatsCard(candidate: Card, target: Card): boolean {
  return rankValue(candidate) > rankValue(target);
}

/** Indices in hand that satisfy Bourré follow / trump / overtrump rules. */
export function getLegalPlayIndices(ctx: PlayContext): number[] {
  const { hand, trumpSuit, leadSuit, trickPlays, isLeading } = ctx;
  if (!hand.length) return [];

  if (isLeading || !leadSuit || trickPlays.length === 0) {
    if (ctx.cinchEnabled && countSureTricks(hand, trumpSuit) >= 3) {
      const trumpCards = cardsOfSuit(hand, trumpSuit);
      if (trumpCards.length) {
        const highest = trumpCards.reduce((a, b) => (rankValue(a) >= rankValue(b) ? a : b));
        const idx = hand.findIndex((c) => c.rank === highest.rank && c.suit === highest.suit);
        return idx >= 0 ? [idx] : [];
      }
    }
    return hand.map((_, i) => i);
  }

  const ledInHand = cardsOfSuit(hand, leadSuit);
  const trumpInHand = cardsOfSuit(hand, trumpSuit);
  const highLed = highestLedSuitPlay(trickPlays, leadSuit, trumpSuit);
  const highTrump = highestTrumpPlay(trickPlays, trumpSuit);

  let candidates: Card[];

  if (ledInHand.length > 0) {
    candidates = ledInHand;
    if (highTrump) {
      // Trick already trumped — following suit still required when able; no trump needed.
    } else if (highLed) {
      const beaters = ledInHand.filter((c) => beatsCard(c, highLed));
      if (beaters.length) candidates = beaters;
    }
  } else if (trumpInHand.length > 0) {
    candidates = trumpInHand;
    if (highTrump) {
      const over = trumpInHand.filter((c) => beatsCard(c, highTrump));
      if (over.length) candidates = over;
    }
  } else {
    candidates = [...hand];
  }

  const indices: number[] = [];
  for (let i = 0; i < hand.length; i += 1) {
    if (candidates.some((c) => c.rank === hand[i].rank && c.suit === hand[i].suit)) {
      indices.push(i);
    }
  }
  return indices;
}

export function validatePlayIndex(ctx: PlayContext, index: number): LegalityResult {
  if (index < 0 || index >= ctx.hand.length) {
    return { ok: false, code: "INVALID_INDEX", message: "Invalid card selection" };
  }
  const legal = getLegalPlayIndices(ctx);
  if (!legal.includes(index)) {
    const card = ctx.hand[index];
    const leadSuit = ctx.leadSuit;
    const ledInHand = leadSuit ? cardsOfSuit(ctx.hand, leadSuit) : [];
    const trumpInHand = cardsOfSuit(ctx.hand, ctx.trumpSuit);
    const highTrump = leadSuit ? highestTrumpPlay(ctx.trickPlays, ctx.trumpSuit) : null;

    if (leadSuit && ledInHand.length && card.suit !== leadSuit) {
      return { ok: false, code: "MUST_FOLLOW_SUIT", message: "You must follow suit" };
    }
    if (leadSuit && !ledInHand.length && trumpInHand.length && !isTrump(card, ctx.trumpSuit)) {
      return { ok: false, code: "MUST_TRUMP", message: "You must play a trump when void in the led suit" };
    }
    if (highTrump && isTrump(card, ctx.trumpSuit) && !beatsCard(card, highTrump)) {
      return { ok: false, code: "MUST_OVERTRUMP", message: "You must overtrump if you can" };
    }
    if (ctx.cinchEnabled) {
      return { ok: false, code: "CINCH_HIGHEST_TRUMP", message: "Cinch: play your highest trump" };
    }
    return { ok: false, code: "MUST_BEAT_LED_SUIT", message: "You must beat the highest card if you can" };
  }
  return { ok: true };
}

/** Simplified cinch detector: three trump including ace or king. */
function countSureTricks(hand: Card[], trumpSuit: Suit): number {
  const trumps = cardsOfSuit(hand, trumpSuit).sort((a, b) => rankValue(b) - rankValue(a));
  return trumps.filter((c) => rankValue(c) >= 13).length;
}
