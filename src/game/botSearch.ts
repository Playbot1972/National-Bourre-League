import { chooseCardsToDiscard, mapCardsToIndices } from "./botDrawChoice";
import {
  calculateHandStrength,
  evaluatePlayOrFold,
  formatHandForLog,
} from "./botPlayFold";
import type { Card, Suit } from "../types";

function logBotAiDecision(
  hand: Card[],
  trumpSuit: Suit,
  opts: {
    botId?: string;
    play: boolean;
    discard: Card[];
    strength: number;
  },
): void {
  try {
    console.log(
      "[nbl-bot-ai] Bot %s | Hand: %s | Trump: %s | Strength: %d | Decision: %s | Discard: %d (%s)",
      opts.botId ?? "?",
      formatHandForLog(hand),
      trumpSuit,
      Math.round(opts.strength * 100) / 100,
      opts.play ? "PLAY" : "FOLD",
      opts.discard.length,
      formatHandForLog(opts.discard),
    );
  } catch {
    /* non-browser */
  }
}

/** Post-reveal pass — true when bot passes/out. */
export function botShouldPassDecision(
  hand: Card[],
  trumpSuit: Suit,
  _ctx?: unknown,
  botId?: string,
): boolean {
  const play = evaluatePlayOrFold(hand, trumpSuit);
  const strength = calculateHandStrength(hand, trumpSuit);
  logBotAiDecision(hand, trumpSuit, { botId, play, discard: [], strength });
  return !play;
}

/** Draw-phase I'm Out — same play/fold gate as post-reveal. */
export function botShouldFoldDraw(
  hand: Card[],
  trumpSuit: Suit,
  botId?: string,
): boolean {
  const play = evaluatePlayOrFold(hand, trumpSuit);
  const strength = calculateHandStrength(hand, trumpSuit);
  logBotAiDecision(hand, trumpSuit, { botId, play, discard: [], strength });
  return !play;
}

/** Draw-phase discard indices (0–maxDiscards). */
export function botDrawDiscardIndices(
  hand: Card[],
  trumpSuit: Suit,
  maxDiscards: number,
  deckReplacementsAvailable = Number.POSITIVE_INFINITY,
  botId?: string,
): number[] {
  const cap = Math.min(maxDiscards, Math.max(0, deckReplacementsAvailable), 5);
  const discardCards = chooseCardsToDiscard(hand, trumpSuit).slice(0, cap);
  const indices = mapCardsToIndices(discardCards, hand);
  const strength = calculateHandStrength(hand, trumpSuit);
  logBotAiDecision(hand, trumpSuit, {
    botId,
    play: true,
    discard: discardCards,
    strength,
  });
  return indices;
}
