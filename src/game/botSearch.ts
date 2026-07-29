import { isTrump, rankValue } from "./cardUtils";
import { effectivePlayerHand } from "./invariants";
import { getLegalPlayIndices, type PlayContext } from "./legal";
import {
  heuristicDrawDiscardIndices,
  heuristicPlayCardIndex,
} from "./botHeuristic";
import {
  advanceToPlayerDrawTurn,
  allLegalDiscardCombos,
  applyHeroDrawDiscard,
  applyHeroPlayCard,
  buildBotMoveContext,
  cloneSimState,
  discardComboKey,
  estimateTrickOutlook,
  finishHandRollout,
  simulatedStateFromContext,
  tricksForPlayer,
  type BotMoveContext,
  type RolloutConfig,
} from "./botRollout";
import { buildPlayValidationState } from "./playContext";
import type { Card, Suit } from "../types";
import type { SimulatedHandState } from "./botRollout";

export type { BotMoveContext } from "./botRollout";
export { buildBotMoveContext } from "./botRollout";

/** Fold when MC P(≥1 trick) falls below this (matches audit). */
export const BOT_FOLD_P_THRESHOLD = 0.12;
/** Slightly stricter for pre-deal pass / enrollment. */
export const BOT_PASS_P_THRESHOLD = 0.15;
/** EV tie tolerance for play — prefer cheapest winner within this band. */
export const BOT_PLAY_EV_TIE = 0.05;

const FOLD_ROLLOUTS = 12;
const DRAW_ROLLOUTS = 6;
const PLAY_ROLLOUTS = 6;

const outlookCache = new Map<string, { pAtLeastOne: number; expectedTricks: number }>();

function cacheKey(kind: string, ctx: BotMoveContext, extra = ""): string {
  const hand = effectivePlayerHand(
    ctx.playerId,
    ctx.privateHands?.[ctx.playerId] ?? [],
    ctx.publicHand,
  );
  const handKey = hand.map((c) => `${c.rank}${c.suit[0]}`).join(",");
  return [
    kind,
    ctx.playerId,
    ctx.publicHand.phase,
    ctx.publicHand.deckSeed,
    ctx.publicHand.turnPlayerId,
    handKey,
    extra,
  ].join("|");
}

function cachedOutlook(
  state: SimulatedHandState,
  heroId: string,
  config: RolloutConfig,
  cacheExtra: string,
): { pAtLeastOne: number; expectedTricks: number } {
  const key = cacheKey(
    "outlook",
    {
      playerId: heroId,
      publicHand: state.publicHand,
      privateHands: state.privateHands,
      seed: config.seed,
    },
    `${config.rollouts}:${cacheExtra}`,
  );
  const hit = outlookCache.get(key);
  if (hit) return hit;
  const result = estimateTrickOutlook(state, heroId, config);
  if (outlookCache.size > 500) outlookCache.clear();
  outlookCache.set(key, result);
  return result;
}

function stateForDecision(ctx: BotMoveContext): SimulatedHandState {
  return simulatedStateFromContext(ctx, 0);
}

function scoreDiscardCombo(
  base: SimulatedHandState,
  heroId: string,
  discardIndices: number[],
): { pAtLeastOne: number; expectedTricks: number } {
  let pSum = 0;
  let eSum = 0;
  for (let r = 0; r < DRAW_ROLLOUTS; r += 1) {
    const sampled = simulatedStateFromContext(
      {
        playerId: heroId,
        publicHand: base.publicHand,
        privateHands: base.privateHands,
        deck: base.deck,
        seed: (base.publicHand.deckSeed ?? 0) + r,
      },
      r,
    );
    const atHero = advanceToPlayerDrawTurn(sampled, heroId);
    const afterDraw = applyHeroDrawDiscard(atHero, heroId, discardIndices);
    const final = finishHandRollout(afterDraw, {
      heroId,
      opponentPolicy: "mixed",
      rolloutIndex: r,
    });
    const tricks = tricksForPlayer(final, heroId);
    if (tricks >= 1) pSum += 1;
    eSum += tricks;
  }
  return { pAtLeastOne: pSum / DRAW_ROLLOUTS, expectedTricks: eSum / DRAW_ROLLOUTS };
}

function compareDiscardScores(
  a: { pAtLeastOne: number; expectedTricks: number },
  b: { pAtLeastOne: number; expectedTricks: number },
): number {
  if (Math.abs(a.pAtLeastOne - b.pAtLeastOne) > 0.001) {
    return a.pAtLeastOne - b.pAtLeastOne;
  }
  return a.expectedTricks - b.expectedTricks;
}

/** Probability-aware draw-fold / I'm Out. */
export function botShouldFoldDraw(
  hand: Card[],
  _trumpSuit: Suit,
  ctx?: BotMoveContext,
): boolean {
  if (!hand.length) return false;
  if (!ctx) {
    return heuristicFoldFallback(hand, _trumpSuit);
  }
  const state = stateForDecision(ctx);
  const outlook = cachedOutlook(
    state,
    ctx.playerId,
    {
      rollouts: FOLD_ROLLOUTS,
      opponentPolicy: "mixed",
      seed: ctx.seed,
    },
    "fold",
  );
  return outlook.pAtLeastOne < BOT_FOLD_P_THRESHOLD;
}

/** Probability-aware post-reveal pass / enrollment decline. */
export function botShouldPassDecision(
  hand: Card[],
  _trumpSuit: Suit,
  ctx?: BotMoveContext,
): boolean {
  if (!hand.length) return false;
  if (!ctx) {
    return heuristicFoldFallback(hand, _trumpSuit, true);
  }
  const state = stateForDecision(ctx);
  const outlook = cachedOutlook(
    state,
    ctx.playerId,
    {
      rollouts: FOLD_ROLLOUTS,
      opponentPolicy: "mixed",
      seed: ctx.seed,
    },
    "pass",
  );
  return outlook.pAtLeastOne < BOT_PASS_P_THRESHOLD;
}

function heuristicFoldFallback(hand: Card[], trumpSuit: Suit, pass = false): boolean {
  let score = 0;
  for (const card of hand) {
    const rv = rankValue(card);
    if (isTrump(card, trumpSuit)) score += 2.5 + rv / 13;
    else if (rv >= 12) score += 1.8;
    else if (rv >= 11) score += 1.2;
    else if (rv >= 10) score += 0.8;
    else if (rv >= 9) score += 0.4;
    else if (rv >= 7) score += 0.15;
  }
  const threshold = pass ? 2.0 : 2.25;
  return score < threshold;
}

function prunedDiscardCombos(
  handLen: number,
  cap: number,
  heuristicPick: number[],
): number[][] {
  const byKey = new Map<string, number[]>();
  const add = (indices: number[]) => byKey.set(discardComboKey(indices), [...indices]);
  add([]);
  for (let i = 0; i < handLen; i += 1) add([i]);
  add(heuristicPick);
  for (const combo of allLegalDiscardCombos(handLen, Math.min(cap, 2))) {
    add(combo);
  }
  if (cap > 2) {
    for (const combo of allLegalDiscardCombos(handLen, cap)) {
      if (combo.length === cap) add(combo);
    }
  }
  return [...byKey.values()];
}

/** Search legal discard subsets (including pat) and pick best by rollout metrics. */
export function botDrawDiscardIndices(
  hand: Card[],
  trumpSuit: Suit,
  maxDiscards: number,
  deckReplacementsAvailable = Number.POSITIVE_INFINITY,
  ctx?: BotMoveContext,
): number[] {
  const cap = Math.min(maxDiscards, Math.max(0, deckReplacementsAvailable));
  if (cap <= 0 || !hand.length) return [];

  if (!ctx) {
    return heuristicDrawDiscardIndices(hand, trumpSuit, maxDiscards, deckReplacementsAvailable);
  }

  const state = stateForDecision(ctx);
  const atHero = advanceToPlayerDrawTurn(state, ctx.playerId);
  const heuristicPick = heuristicDrawDiscardIndices(
    hand,
    trumpSuit,
    maxDiscards,
    deckReplacementsAvailable,
  );
  const combos = prunedDiscardCombos(hand.length, cap, heuristicPick);

  let best = combos[0] ?? [];
  let bestScore = scoreDiscardCombo(atHero, ctx.playerId, best);
  for (const combo of combos) {
    const score = scoreDiscardCombo(atHero, ctx.playerId, combo);
    if (compareDiscardScores(score, bestScore) > 0) {
      best = combo;
      bestScore = score;
    }
  }
  return [...best].sort((a, b) => a - b);
}

function playEv(state: SimulatedHandState, heroId: string, cardIndex: number): number {
  let sum = 0;
  for (let r = 0; r < PLAY_ROLLOUTS; r += 1) {
    const branch = applyHeroPlayCard(cloneSimState(state), heroId, cardIndex);
    const final = finishHandRollout(branch, {
      heroId,
      opponentPolicy: "mixed",
      rolloutIndex: r,
    });
    sum += tricksForPlayer(final, heroId);
  }
  return sum / PLAY_ROLLOUTS;
}

/** Rank legal plays by rollout EV; cheapest winner breaks ties. */
export function botPlayCardIndex(
  hand: Card[],
  playCtx: PlayContext,
  ctx?: BotMoveContext,
): number {
  const legal = getLegalPlayIndices(playCtx);
  if (!legal.length) return 0;

  if (!ctx) {
    return heuristicPlayCardIndex(hand, playCtx);
  }

  const state = stateForDecision(ctx);
  let bestIdx = legal[0]!;
  let bestEv = -1;
  for (const idx of legal) {
    const ev = playEv(state, ctx.playerId, idx);
    if (ev > bestEv + BOT_PLAY_EV_TIE) {
      bestEv = ev;
      bestIdx = idx;
    } else if (Math.abs(ev - bestEv) <= BOT_PLAY_EV_TIE) {
      bestIdx = cheaperWinnerTieBreak(hand, playCtx, bestIdx, idx);
    }
  }
  return bestIdx;
}

function cheaperWinnerTieBreak(
  hand: Card[],
  playCtx: PlayContext,
  a: number,
  b: number,
): number {
  return heuristicPlayCardIndex(hand, playCtx) === b ? b : a;
}

/** Rough trick-taking potential — retained for UI hints / tests. */
export function estimateHandStrength(hand: Card[], trumpSuit: Suit): number {
  let score = 0;
  for (const card of hand) {
    const rv = rankValue(card);
    if (isTrump(card, trumpSuit)) {
      score += 2.5 + rv / 13;
    } else if (rv >= 12) {
      score += 1.8;
    } else if (rv >= 11) {
      score += 1.2;
    } else if (rv >= 10) {
      score += 0.8;
    } else if (rv >= 9) {
      score += 0.4;
    } else if (rv >= 7) {
      score += 0.15;
    }
  }
  return score;
}

/** Build play context + move context for table/session wiring. */
export function botPlayContextFromState(
  playerId: string,
  privateHand: Card[],
  publicHand: BotMoveContext["publicHand"],
  deck?: Card[],
): { playCtx: PlayContext; moveCtx: BotMoveContext } {
  const hand = effectivePlayerHand(playerId, privateHand, publicHand);
  const playCtx = buildPlayValidationState({ hand, publicHand });
  const moveCtx = buildBotMoveContext(playerId, privateHand, publicHand, deck);
  return { playCtx, moveCtx };
}
