import { cardsOfSuit, isTrump, rankValue } from "./cardUtils";
import type { Card, Suit } from "../types";
import {
  canPlayCard,
  logPlayValidation,
  type PlayValidationMeta,
} from "./playContext";

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

function toValidationState(ctx: PlayContext) {
  return {
    hand: ctx.hand,
    trumpSuit: ctx.trumpSuit,
    leadSuit: ctx.leadSuit,
    trickPlays: ctx.trickPlays,
    isLeading: ctx.isLeading,
    cinchEnabled: ctx.cinchEnabled,
  };
}

/** Indices in hand that satisfy Bourré follow / trump / overtrump rules. */
export function getLegalPlayIndices(
  ctx: PlayContext,
  meta: PlayValidationMeta = {},
): number[] {
  const state = toValidationState(ctx);
  if (!state.hand.length) return [];

  if (state.isLeading || state.trickPlays.length === 0) {
    const indices: number[] = [];
    for (let i = 0; i < state.hand.length; i += 1) {
      const result = canPlayCard(state, i);
      if (result.allowed) indices.push(i);
      else logPlayValidation(meta, state, i, result);
    }
    return indices;
  }

  const leadSuit = state.leadSuit ?? state.trickPlays[0]?.suit;
  const ledInHand = leadSuit ? cardsOfSuit(state.hand, leadSuit) : [];
  const trumpInHand = cardsOfSuit(state.hand, state.trumpSuit);
  const highLed = leadSuit ? highestLedSuitPlay(state.trickPlays, leadSuit, state.trumpSuit) : null;
  const highTrump = highestTrumpPlay(state.trickPlays, state.trumpSuit);

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
    candidates = [...state.hand];
  }

  const indices: number[] = [];
  for (let i = 0; i < state.hand.length; i += 1) {
    if (candidates.some((c) => c.rank === state.hand[i]!.rank && c.suit === state.hand[i]!.suit)) {
      indices.push(i);
    }
  }
  return indices;
}

export function validatePlayIndex(
  ctx: PlayContext,
  index: number,
  meta: PlayValidationMeta = {},
): LegalityResult {
  const state = toValidationState(ctx);
  const leadResult = canPlayCard(state, index);
  logPlayValidation(meta, state, index, leadResult);

  if (!leadResult.allowed) {
    const code = (leadResult.code ?? "MUST_BEAT_LED_SUIT") as LegalityCode;
    return { ok: false, code, message: leadResult.reason ?? "Illegal play" };
  }

  if (state.isLeading || state.trickPlays.length === 0) {
    return { ok: true };
  }

  const legal = getLegalPlayIndices(ctx, meta);
  if (!legal.includes(index)) {
    const card = ctx.hand[index]!;
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

export { buildPlayValidationState, canPlayCard, logPlayValidation, normalizeTrickForPlay } from "./playContext";
export type { PlayValidationMeta, CanPlayCardResult } from "./playContext";
