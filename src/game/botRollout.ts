import { createDeck } from "./deck";
import { shuffledDeckFromSeed } from "./deckState";
import { advanceAfterDraw, applyPlayerDraw } from "./draw";
import { pileFromPublicHand, totalAvailableReplacements } from "./drawPile";
import {
  heuristicDrawDiscardIndices,
  heuristicPlayCardIndex,
  randomLegalDrawDiscardIndices,
  randomLegalPlayCardIndex,
} from "./botHeuristic";
import { cardKey } from "./cardUtils";
import { effectivePlayerHand, trumpOwnerId } from "./invariants";
import { getLegalPlayIndices } from "./legal";
import { applyPlayerPlayCard } from "./play";
import { buildPlayValidationState } from "./playContext";
import { CARDS_PER_PLAYER } from "./playerOrder";
import { HAND_PHASE } from "./types";
import type { Card } from "../types";
import type { PublicHandState } from "./types";

export interface SimulatedHandState {
  publicHand: PublicHandState;
  privateHands: Record<string, Card[]>;
  deck: Card[];
}

export type OpponentPolicy = "heuristic" | "randomLegal" | "mixed";

export interface RolloutConfig {
  rollouts?: number;
  opponentPolicy?: OpponentPolicy;
  seed?: number;
}

export interface TrickOutlook {
  pAtLeastOne: number;
  expectedTricks: number;
}

export interface BotMoveContext {
  playerId: string;
  publicHand: PublicHandState;
  privateHands?: Record<string, Card[]>;
  deck?: Card[];
  seed?: number;
}

const DEFAULT_ROLLOUTS = 12;

export function buildBotMoveContext(
  playerId: string,
  privateHand: Card[],
  publicHand: PublicHandState,
  deck?: Card[],
  otherPrivateHands?: Record<string, Card[]>,
): BotMoveContext {
  const privateHands: Record<string, Card[]> = { ...(otherPrivateHands ?? {}) };
  privateHands[playerId] = privateHand;
  return {
    playerId,
    publicHand,
    privateHands,
    deck,
    seed: publicHand.deckSeed ?? undefined,
  };
}

export function cloneSimState(state: SimulatedHandState): SimulatedHandState {
  return {
    publicHand: structuredClone(state.publicHand),
    privateHands: Object.fromEntries(
      Object.entries(state.privateHands).map(([k, v]) => [k, [...v]]),
    ),
    deck: [...state.deck],
  };
}

export function tricksForPlayer(state: SimulatedHandState, playerId: string): number {
  return state.publicHand.tricksByPlayer[playerId] ?? 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(parts: (string | number | null | undefined)[]): number {
  let h = 2166136261;
  for (const part of parts) {
    const s = String(part ?? "");
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

function expectedPrivateCount(playerId: string, publicHand: PublicHandState): number {
  const owner = trumpOwnerId(publicHand);
  if (owner === playerId && publicHand.trumpUpcard) {
    return CARDS_PER_PLAYER - 1;
  }
  return CARDS_PER_PLAYER;
}

function collectKnownCards(
  publicHand: PublicHandState,
  privateHands: Record<string, Card[]>,
): Set<string> {
  const known = new Set<string>();
  for (const hand of Object.values(privateHands)) {
    for (const c of hand) known.add(cardKey(c));
  }
  if (publicHand.trumpUpcard) {
    known.add(cardKey(publicHand.trumpUpcard as Card));
  }
  return known;
}

/** Fill unknown opponent private hands by sampling the remaining deck. */
export function completePrivateHands(
  ctx: BotMoveContext,
  rolloutIndex: number,
): Record<string, Card[]> {
  const { playerId, publicHand, privateHands = {} } = ctx;
  const participantIds = publicHand.participantIds;
  const result: Record<string, Card[]> = {};
  for (const id of participantIds) {
    if (privateHands[id]?.length) {
      result[id] = [...privateHands[id]!];
    }
  }

  const missing = participantIds.filter((id) => !result[id]?.length);
  if (!missing.length) return result;

  const known = collectKnownCards(publicHand, result);
  const pool = createDeck().filter((c) => !known.has(cardKey(c)));
  const rng = mulberry32(
    hashSeed([ctx.seed ?? publicHand.deckSeed, playerId, rolloutIndex, "deal"]),
  );
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }

  let cursor = 0;
  for (const id of missing) {
    const need = expectedPrivateCount(id, publicHand);
    result[id] = pool.slice(cursor, cursor + need);
    cursor += need;
  }
  return result;
}

export function simulatedStateFromContext(
  ctx: BotMoveContext,
  rolloutIndex = 0,
): SimulatedHandState {
  const deck =
    ctx.deck ??
    shuffledDeckFromSeed(ctx.publicHand.deckSeed ?? ctx.seed ?? 42);
  return {
    publicHand: structuredClone(ctx.publicHand),
    privateHands: completePrivateHands(ctx, rolloutIndex),
    deck: [...deck],
  };
}

function seatPolicy(
  seatId: string,
  heroId: string,
  policy: OpponentPolicy,
  rolloutIndex: number,
): "heuristic" | "randomLegal" {
  if (seatId === heroId) return "heuristic";
  if (policy === "heuristic") return "heuristic";
  if (policy === "randomLegal") return "randomLegal";
  return rolloutIndex % 2 === 0 ? "randomLegal" : "heuristic";
}

function heroInnerDrawIndices(state: SimulatedHandState, heroId: string): number[] {
  const hand = effectivePlayerHand(heroId, state.privateHands[heroId]!, state.publicHand);
  const pile = pileFromPublicHand(state.publicHand, state.deck);
  const available = totalAvailableReplacements(pile);
  const max = state.publicHand.maxDrawDiscards ?? 5;
  const trump = state.publicHand.trumpSuit;
  const cap = Math.min(max, Math.max(0, available));
  if (cap <= 0 || !hand.length) return [];
  const full = heuristicDrawDiscardIndices(hand, trump, max, available);
  if (!full.length) return [];
  if (full.length >= hand.length) return [];
  return full.slice(0, Math.min(2, full.length));
}

function drawDiscardForSeat(
  state: SimulatedHandState,
  seatId: string,
  policy: "heuristic" | "randomLegal",
  rng: () => number,
  forcedIndices?: number[],
  heroId?: string,
): number[] {
  if (forcedIndices) return forcedIndices;
  if (heroId && seatId === heroId) {
    return heroInnerDrawIndices(state, heroId);
  }
  const hand = effectivePlayerHand(seatId, state.privateHands[seatId]!, state.publicHand);
  const pile = pileFromPublicHand(state.publicHand, state.deck);
  const available = totalAvailableReplacements(pile);
  const max = state.publicHand.maxDrawDiscards ?? 5;
  if (policy === "randomLegal") {
    return randomLegalDrawDiscardIndices(hand, max, available, rng);
  }
  return heuristicDrawDiscardIndices(hand, state.publicHand.trumpSuit, max, available);
}

function playIndexForSeat(
  state: SimulatedHandState,
  seatId: string,
  policy: "heuristic" | "randomLegal",
  rng: () => number,
  forcedIndex?: number,
): number {
  if (forcedIndex != null) return forcedIndex;
  const hand = effectivePlayerHand(seatId, state.privateHands[seatId]!, state.publicHand);
  const ctx = buildPlayValidationState({ hand, publicHand: state.publicHand });
  if (policy === "randomLegal") return randomLegalPlayCardIndex(hand, ctx, rng);
  return heuristicPlayCardIndex(hand, ctx);
}

export interface FinishHandOptions {
  heroId: string;
  opponentPolicy?: OpponentPolicy;
  rolloutIndex?: number;
  heroDrawDiscard?: number[];
  heroPlayIndex?: number;
}

/** Complete draw + play from current state; hero may have a forced candidate move. */
export function finishHandRollout(
  state: SimulatedHandState,
  options: FinishHandOptions,
): SimulatedHandState {
  const {
    heroId,
    opponentPolicy = "mixed",
    rolloutIndex = 0,
    heroDrawDiscard,
    heroPlayIndex,
  } = options;
  const rng = mulberry32(hashSeed([state.publicHand.deckSeed, heroId, rolloutIndex, "play"]));
  let current = cloneSimState(state);

  let guard = 0;
  while (current.publicHand.phase === HAND_PHASE.DRAW && guard < 40) {
    guard += 1;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) break;
    const policy = seatPolicy(turnId, heroId, opponentPolicy, rolloutIndex);
    const discardIndices = drawDiscardForSeat(
      current,
      turnId,
      policy,
      rng,
      turnId === heroId ? heroDrawDiscard : undefined,
      heroId,
    );
    const max = current.publicHand.maxDrawDiscards ?? 5;
    const drawResult = applyPlayerDraw({
      playerId: turnId,
      privateHand: current.privateHands[turnId]!,
      publicHand: current.publicHand,
      discardIndices,
      deck: current.deck,
      maxDiscards: max,
    });
    const order = current.publicHand.actionOrder ?? current.publicHand.participantIds;
    current = {
      ...current,
      publicHand: advanceAfterDraw(drawResult.publicHand, order, turnId),
      privateHands: { ...current.privateHands, [turnId]: drawResult.privateHand },
    };
  }

  guard = 0;
  while (guard < 200) {
    guard += 1;
    const total = Object.values(current.publicHand.tricksByPlayer).reduce(
      (s, n) => s + (n || 0),
      0,
    );
    if (total >= 5 && current.publicHand.currentTrick === null) break;
    if (current.publicHand.phase !== HAND_PHASE.PLAY) break;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) break;

    const hand = effectivePlayerHand(turnId, current.privateHands[turnId]!, current.publicHand);
    const ctx = buildPlayValidationState({ hand, publicHand: current.publicHand });
    const legal = getLegalPlayIndices(ctx);
    const policy = seatPolicy(turnId, heroId, opponentPolicy, rolloutIndex);
    let cardIndex = playIndexForSeat(
      current,
      turnId,
      policy,
      rng,
      turnId === heroId && heroPlayIndex != null ? heroPlayIndex : undefined,
    );
    if (!legal.includes(cardIndex)) {
      cardIndex = legal[0] ?? 0;
    }

    const result = applyPlayerPlayCard({
      publicHand: current.publicHand,
      privateHand: current.privateHands[turnId]!,
      playerId: turnId,
      cardIndex,
      actionOrder: current.publicHand.actionOrder ?? current.publicHand.participantIds,
      cinchEnabled: current.publicHand.cinchEnabled === true,
    });
    current = {
      ...current,
      publicHand: result.publicHand,
      privateHands: { ...current.privateHands, [turnId]: result.privateHand },
    };
  }
  return current;
}

export function estimateTrickOutlook(
  state: SimulatedHandState,
  heroId: string,
  config: RolloutConfig = {},
): TrickOutlook {
  const rollouts = config.rollouts ?? DEFAULT_ROLLOUTS;
  const opponentPolicy = config.opponentPolicy ?? "mixed";
  let atLeastOne = 0;
  let trickSum = 0;
  for (let r = 0; r < rollouts; r += 1) {
    const final = finishHandRollout(cloneSimState(state), {
      heroId,
      opponentPolicy,
      rolloutIndex: r + (config.seed ?? 0),
    });
    const tricks = tricksForPlayer(final, heroId);
    if (tricks >= 1) atLeastOne += 1;
    trickSum += tricks;
  }
  return {
    pAtLeastOne: atLeastOne / rollouts,
    expectedTricks: trickSum / rollouts,
  };
}

export function advanceToPlayerDrawTurn(
  state: SimulatedHandState,
  heroId: string,
): SimulatedHandState {
  let current = cloneSimState(state);
  let guard = 0;
  while (current.publicHand.phase === HAND_PHASE.DRAW && guard < 40) {
    guard += 1;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) break;
    if (turnId === heroId) break;
    const done = current.publicHand.drawCompletedIds ?? [];
    if (done.includes(heroId)) break;
    const rng = mulberry32(hashSeed([current.publicHand.deckSeed, heroId, guard, "adv"]));
    const policy = seatPolicy(turnId, heroId, "mixed", guard);
    const discardIndices = drawDiscardForSeat(current, turnId, policy, rng);
    const max = current.publicHand.maxDrawDiscards ?? 5;
    const drawResult = applyPlayerDraw({
      playerId: turnId,
      privateHand: current.privateHands[turnId]!,
      publicHand: current.publicHand,
      discardIndices,
      deck: current.deck,
      maxDiscards: max,
    });
    const order = current.publicHand.actionOrder ?? current.publicHand.participantIds;
    current = {
      ...current,
      publicHand: advanceAfterDraw(drawResult.publicHand, order, turnId),
      privateHands: { ...current.privateHands, [turnId]: drawResult.privateHand },
    };
  }
  return current;
}

export function applyHeroDrawDiscard(
  state: SimulatedHandState,
  heroId: string,
  discardIndices: number[],
): SimulatedHandState {
  const max = state.publicHand.maxDrawDiscards ?? 5;
  const drawResult = applyPlayerDraw({
    playerId: heroId,
    privateHand: state.privateHands[heroId]!,
    publicHand: state.publicHand,
    discardIndices,
    deck: state.deck,
    maxDiscards: max,
  });
  const order = state.publicHand.actionOrder ?? state.publicHand.participantIds;
  return {
    ...state,
    publicHand: advanceAfterDraw(drawResult.publicHand, order, heroId),
    privateHands: { ...state.privateHands, [heroId]: drawResult.privateHand },
  };
}

export function applyHeroPlayCard(
  state: SimulatedHandState,
  heroId: string,
  cardIndex: number,
): SimulatedHandState {
  const result = applyPlayerPlayCard({
    publicHand: state.publicHand,
    privateHand: state.privateHands[heroId]!,
    playerId: heroId,
    cardIndex,
    actionOrder: state.publicHand.actionOrder ?? state.publicHand.participantIds,
    cinchEnabled: state.publicHand.cinchEnabled === true,
  });
  return {
    ...state,
    publicHand: result.publicHand,
    privateHands: { ...state.privateHands, [heroId]: result.privateHand },
  };
}

/** Compare discard sets ignoring order. */
export function discardComboKey(indices: number[]): string {
  return [...indices].sort((a, b) => a - b).join(",");
}

export function allLegalDiscardCombos(handLen: number, cap: number): number[][] {
  const combos: number[][] = [[]];
  const buf: number[] = [];
  const walk = (start: number, left: number) => {
    if (left === 0) {
      combos.push([...buf]);
      return;
    }
    for (let i = start; i <= handLen - left; i += 1) {
      buf.push(i);
      walk(i + 1, left - 1);
      buf.pop();
    }
  };
  for (let k = 1; k <= cap; k += 1) walk(0, k);
  return combos;
}
