import { dealInitialHand, type DealInitialHandInput } from "./deal";
import { maxDrawDiscards } from "./drawLimit";
import {
  advanceAfterDraw,
  applyPlayerDraw,
  type ApplyPlayerDrawResult,
} from "./draw";
import {
  assertCardUniqueness,
  effectivePlayerHand,
} from "./invariants";
import {
  applyPlayerPlayCard,
  botDrawDiscardIndices,
  botPlayCardIndex,
} from "./play";
import { getLegalPlayIndices, type PlayContext } from "./legal";
import { shuffledDeckFromSeed } from "./deckState";
import { serializeHandState } from "./serialize";
import { HAND_PHASE } from "./types";
import type { Card } from "../types";
import type { PublicHandState } from "./types";
import { deserializeCards } from "./serialize";

export const DEFAULT_PLAYERS = ["p1", "p2", "p3", "p4"] as const;

export function dealForTest(
  overrides: Partial<DealInitialHandInput> & { seed?: number } = {},
) {
  const participantIds = overrides.participantIds ?? [...DEFAULT_PLAYERS];
  const sortedPlayerIds = overrides.sortedPlayerIds ?? [...participantIds];
  return dealInitialHand({
    dealerId: overrides.dealerId ?? "p1",
    participantIds,
    sortedPlayerIds,
    seed: overrides.seed ?? 42,
  });
}

export function publicHandFromDeal(
  deal: ReturnType<typeof dealForTest>,
  dealerId = "p1",
): PublicHandState {
  const bundle = serializeHandState(deal, {
    dealerId,
    actionOrder: deal.dealOrder,
    maxDrawDiscards: maxDrawDiscards(deal.participantIds.length),
  });
  return bundle.publicHand;
}

export interface SimulatedHandState {
  publicHand: PublicHandState;
  privateHands: Record<string, Card[]>;
  deck: Card[];
}

export function initSimulatedHand(
  overrides: Partial<DealInitialHandInput> & { seed?: number } = {},
): SimulatedHandState {
  const deal = dealForTest(overrides);
  const dealerId = overrides.dealerId ?? "p1";
  return {
    publicHand: publicHandFromDeal(deal, dealerId),
    privateHands: { ...deal.privateHands },
    deck: shuffledDeckFromSeed(deal.deckSeed),
  };
}

/** Assert no card appears in deck remainder, trump upcard, hands, trick, or played pile. */
export function assertNoDuplicateCards(state: SimulatedHandState): void {
  const trump = state.publicHand.trumpUpcard
    ? deserializeCards([state.publicHand.trumpUpcard])[0]
    : null;
  assertCardUniqueness({
    deck: state.deck,
    deckNextIndex: state.publicHand.deckNextIndex ?? 0,
    trumpUpcard: trump,
    privateHands: state.privateHands,
    currentTrick: state.publicHand.currentTrick,
    playedCards: state.publicHand.playedCards,
  });
}

function playContextForTurn(
  state: SimulatedHandState,
  playerId: string,
): PlayContext {
  const trick = state.publicHand.currentTrick!;
  const trickPlays = trick.plays.map((p) => deserializeCards([p.card])[0]);
  const isLeading = trickPlays.length === 0;
  const hand = effectivePlayerHand(
    playerId,
    state.privateHands[playerId],
    state.publicHand,
  );
  return {
    hand,
    trumpSuit: state.publicHand.trumpSuit,
    leadSuit: isLeading ? null : (state.publicHand.leadSuit ?? trickPlays[0]?.suit),
    trickPlays,
    isLeading,
    cinchEnabled: state.publicHand.cinchEnabled === true,
  };
}

export function botDiscardFor(state: SimulatedHandState, playerId: string): number[] {
  const hand = effectivePlayerHand(
    playerId,
    state.privateHands[playerId],
    state.publicHand,
  );
  return botDrawDiscardIndices(
    hand,
    state.publicHand.trumpSuit,
    state.publicHand.maxDrawDiscards ?? 4,
  );
}

export function botPlayFor(state: SimulatedHandState, playerId: string): number {
  const ctx = playContextForTurn(state, playerId);
  return botPlayCardIndex(ctx.hand, ctx);
}

export function applyBotDraw(state: SimulatedHandState, playerId: string): SimulatedHandState {
  const discardIndices = botDiscardFor(state, playerId);
  const result: ApplyPlayerDrawResult = applyPlayerDraw({
    playerId,
    privateHand: state.privateHands[playerId],
    publicHand: state.publicHand,
    discardIndices,
    deck: state.deck,
    deckNextIndex: state.publicHand.deckNextIndex ?? 0,
    maxDiscards: state.publicHand.maxDrawDiscards ?? 4,
  });
  const order = state.publicHand.actionOrder ?? state.publicHand.participantIds;
  const nextPublic = advanceAfterDraw(result.publicHand, order, playerId);
  const next: SimulatedHandState = {
    ...state,
    publicHand: nextPublic,
    privateHands: { ...state.privateHands, [playerId]: result.privateHand },
  };
  assertNoDuplicateCards(next);
  return next;
}

export function applyBotPlay(state: SimulatedHandState, playerId: string): SimulatedHandState {
  const cardIndex = botPlayFor(state, playerId);
  const legal = getLegalPlayIndices(playContextForTurn(state, playerId));
  if (!legal.includes(cardIndex)) {
    throw new Error(`Bot chose illegal card index ${cardIndex} for ${playerId}`);
  }
  const result = applyPlayerPlayCard({
    publicHand: state.publicHand,
    privateHand: state.privateHands[playerId],
    playerId,
    cardIndex,
    actionOrder: state.publicHand.actionOrder ?? state.publicHand.participantIds,
    cinchEnabled: state.publicHand.cinchEnabled === true,
  });
  const next: SimulatedHandState = {
    ...state,
    publicHand: result.publicHand,
    privateHands: { ...state.privateHands, [playerId]: result.privateHand },
  };
  assertNoDuplicateCards(next);
  return next;
}

/** Run draw phase for all participants using bot discard logic. */
export function runDrawPhase(state: SimulatedHandState): SimulatedHandState {
  let current = state;
  let guard = 0;
  while (current.publicHand.phase === HAND_PHASE.DRAW && guard < 32) {
    guard += 1;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) throw new Error("Draw phase missing turnPlayerId");
    current = applyBotDraw(current, turnId);
  }
  if (current.publicHand.phase !== HAND_PHASE.PLAY) {
    throw new Error(`Expected play phase after draw, got ${current.publicHand.phase}`);
  }
  return current;
}

/** Play until handComplete using bot play logic. */
export function runPlayPhase(state: SimulatedHandState): SimulatedHandState {
  let current = state;
  let guard = 0;
  while (!isHandPlayComplete(current) && guard < 200) {
    guard += 1;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) throw new Error("Play phase missing turnPlayerId");
    if (current.publicHand.phase !== HAND_PHASE.PLAY) {
      throw new Error(`Expected play phase, got ${current.publicHand.phase}`);
    }
    current = applyBotPlay(current, turnId);
  }
  if (!isHandPlayComplete(current)) {
    throw new Error("Play phase did not complete within step limit");
  }
  return current;
}

export function isHandPlayComplete(state: SimulatedHandState): boolean {
  const tricks = state.publicHand.tricksByPlayer;
  const total = Object.values(tricks).reduce((s, n) => s + (n || 0), 0);
  return total >= 5 && state.publicHand.currentTrick === null;
}

function assertFirstTrickEmpty(state: SimulatedHandState, expectedLead: string): void {
  const trick = state.publicHand.currentTrick;
  if (!trick) throw new Error("Missing trick at play start");
  if (trick.plays.length !== 0) throw new Error("First trick must start empty");
  if (state.publicHand.turnPlayerId !== expectedLead) {
    throw new Error(
      `Expected ${expectedLead} to lead, got ${state.publicHand.turnPlayerId}`,
    );
  }
}

/** Full deal → draw → play for N players; returns final state. */
export function simulateFullHand(
  overrides: Partial<DealInitialHandInput> & { seed?: number } = {},
): SimulatedHandState {
  let state = initSimulatedHand(overrides);
  assertNoDuplicateCards(state);
  state = runDrawPhase(state);
  const leadId = state.publicHand.actionOrder?.[0] ?? state.publicHand.participantIds[0];
  assertFirstTrickEmpty(state, leadId);
  state = runPlayPhase(state);
  return state;
}
