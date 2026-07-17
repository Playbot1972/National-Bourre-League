import assert from "node:assert/strict";
import { dealInitialHand, type DealInitialHandInput } from "./deal";
import { CARDS_PER_PLAYER, openingLeaderId } from "./playerOrder";
import { maxDrawDiscards } from "./drawLimit";
import {
  advanceAfterDraw,
  applyPlayerDraw,
  type ApplyPlayerDrawResult,
} from "./draw";
import { pileFromPublicHand, totalAvailableReplacements } from "./drawPile";
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
import { buildPlayValidationState } from "./playContext";
import { shuffledDeckFromSeed } from "./deckState";
import { serializeHandState } from "./serialize";
import { HAND_PHASE } from "./types";
import type { Card, Suit } from "../types";
import type { PublicHandState } from "./types";
import { deserializeCards } from "./serialize";
import { runEnrollmentPhase, type DealCompletionContext } from "./enrollment";
import { resolveTrickWinner } from "./trick";

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

/** Assert no card appears in draw pile, trump upcard, hands, trick, or played pile. */
export function assertNoDuplicateCards(state: SimulatedHandState): void {
  const trump = state.publicHand.trumpUpcard
    ? deserializeCards([state.publicHand.trumpUpcard])[0]
    : null;
  assertCardUniqueness({
    drawPile: pileFromPublicHand(state.publicHand, state.deck),
    trumpUpcard: trump,
    trumpHolderId: state.publicHand.trumpHolderId ?? state.publicHand.dealerId,
    privateHands: state.privateHands,
    currentTrick: state.publicHand.currentTrick,
    playedCards: state.publicHand.playedCards,
  });
}

function playContextForTurn(
  state: SimulatedHandState,
  playerId: string,
): PlayContext {
  const hand = effectivePlayerHand(
    playerId,
    state.privateHands[playerId],
    state.publicHand,
  );
  return buildPlayValidationState({
    hand,
    publicHand: state.publicHand,
  });
}

export function botDiscardFor(state: SimulatedHandState, playerId: string): number[] {
  const hand = effectivePlayerHand(
    playerId,
    state.privateHands[playerId],
    state.publicHand,
  );
  const pile = pileFromPublicHand(state.publicHand, state.deck);
  const available = totalAvailableReplacements(pile);
  return botDrawDiscardIndices(
    hand,
    state.publicHand.trumpSuit,
    state.publicHand.maxDrawDiscards ?? 5,
    available,
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
    maxDiscards: state.publicHand.maxDrawDiscards ?? 5,
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

function trickTotal(tricks: Record<string, number>): number {
  return Object.values(tricks).reduce((s, n) => s + (n || 0), 0);
}

/** Post-deal: five cards each, draw phase, correct opening leader. */
export function assertPostDealInvariants(state: SimulatedHandState): void {
  const { publicHand: ph, privateHands } = state;
  const participants = ph.participantIds;
  assert.equal(ph.phase, HAND_PHASE.DRAW);
  assert.ok(participants.length >= 2);
  for (const pid of participants) {
    assert.equal(privateHands[pid]?.length ?? 0, CARDS_PER_PLAYER, `${pid} deal size`);
    assert.equal(ph.tricksByPlayer[pid] ?? 0, 0);
  }
  const expectedLead = openingLeaderId(ph.dealerId, participants, ph.seatedIds ?? participants);
  assert.equal(ph.turnPlayerId, expectedLead);
  assert.ok(ph.trumpSuit);
  assert.ok(ph.trumpHolderId);
}

/** Post-draw: play phase, five cards each, empty first trick. */
export function assertPostDrawInvariants(state: SimulatedHandState): void {
  const { publicHand: ph, privateHands } = state;
  assert.equal(ph.phase, HAND_PHASE.PLAY);
  for (const pid of ph.participantIds) {
    assert.equal(privateHands[pid]?.length ?? 0, CARDS_PER_PLAYER, `${pid} post-draw size`);
  }
  const leadId = ph.actionOrder?.[0] ?? ph.participantIds[0];
  assert.equal(ph.turnPlayerId, leadId);
  assert.ok(ph.currentTrick);
  assert.equal(ph.currentTrick?.plays.length ?? 0, 0);
}

/** Play phase with per-trick winner verification against resolveTrickWinner. */
export function runPlayPhaseVerified(state: SimulatedHandState): SimulatedHandState {
  let current = state;
  let prevTrickTotal = trickTotal(current.publicHand.tricksByPlayer);
  let guard = 0;
  while (!isHandPlayComplete(current) && guard < 200) {
    guard += 1;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) throw new Error("Play phase missing turnPlayerId");
    if (current.publicHand.phase !== HAND_PHASE.PLAY) {
      throw new Error(`Expected play phase, got ${current.publicHand.phase}`);
    }
    if (!current.publicHand.participantIds.includes(turnId)) {
      throw new Error(`Turn owner ${turnId} not in participants`);
    }
    const trickNum = current.publicHand.currentTrick?.trickNumber ?? 0;
    const tricksBeforeTrick = { ...current.publicHand.tricksByPlayer };
    current = applyBotPlay(current, turnId);
    const newTotal = trickTotal(current.publicHand.tricksByPlayer);
    if (newTotal > prevTrickTotal) {
      const trickPlays = current.publicHand.playedCards.filter((p) => p.trickNumber === trickNum);
      const n = current.publicHand.participantIds.length;
      assert.equal(trickPlays.length, n, `trick ${trickNum} play count`);
      const plays = trickPlays.map((p) => ({
        playerId: p.playerId,
        card: p.card as Card,
      }));
      const leadSuit = plays[0]!.card.suit as Suit;
      const expectedWinner = resolveTrickWinner(
        plays,
        leadSuit,
        current.publicHand.trumpSuit,
      );
      const winner = current.publicHand.participantIds.find(
        (pid) =>
          (current.publicHand.tricksByPlayer[pid] ?? 0) > (tricksBeforeTrick[pid] ?? 0),
      );
      if (winner !== expectedWinner) {
        throw new Error(
          `Trick ${trickNum}: expected ${expectedWinner}, got ${winner ?? "none"}`,
        );
      }
      prevTrickTotal = newTotal;
    }
  }
  if (!isHandPlayComplete(current)) {
    throw new Error("Verified play phase did not complete within step limit");
  }
  return current;
}

/** Deal → draw → verified play with step invariants. */
export function simulateFullHandVerified(
  overrides: Parameters<typeof simulateFullHand>[0] = {},
): SimulatedHandState {
  const participantIds = overrides.participantIds ?? [...DEFAULT_PLAYERS];
  const sortedPlayerIds = overrides.sortedPlayerIds ?? [...participantIds];
  const dealerId = overrides.dealerId ?? "p1";
  const seed = overrides.seed ?? 42;
  const skipEnrollment = overrides.skipEnrollment !== false;

  if (skipEnrollment) {
    let state = initSimulatedHand(overrides);
    assertNoDuplicateCards(state);
    assertPostDealInvariants(state);
    state = runDrawPhase(state);
    assertNoDuplicateCards(state);
    assertPostDrawInvariants(state);
    state = runPlayPhaseVerified(state);
    assertNoDuplicateCards(state);
    return state;
  }

  const dealCtx: DealCompletionContext = {
    dealerId,
    sortedPlayerIds,
    seed,
    dealingRule: null,
  };
  const join = overrides.enrollmentJoin ?? (() => true);
  const enrolled = runEnrollmentPhase(sortedPlayerIds, dealerId, join, dealCtx, seed);
  if (enrolled.kind !== "deal") {
    throw new Error(`Enrollment did not deal: ${enrolled.kind}`);
  }

  const privateHands: Record<string, Card[]> = {};
  for (const [pid, doc] of Object.entries(enrolled.privateHandsByPlayer)) {
    privateHands[pid] = deserializeCards(doc.cards);
  }

  let state: SimulatedHandState = {
    publicHand: enrolled.currentHand,
    privateHands,
    deck: shuffledDeckFromSeed(enrolled.currentHand.deckSeed ?? seed),
  };
  assertNoDuplicateCards(state);
  assertPostDealInvariants(state);
  state = runDrawPhase(state);
  assertNoDuplicateCards(state);
  assertPostDrawInvariants(state);
  state = runPlayPhaseVerified(state);
  assertNoDuplicateCards(state);
  return state;
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

/** Full enrollment → deal → draw → play for N players; returns final state. */
export function simulateFullHand(
  overrides: Partial<DealInitialHandInput> & {
    seed?: number;
    skipEnrollment?: boolean;
    enrollmentJoin?: (playerId: string) => boolean;
  } = {},
): SimulatedHandState {
  const participantIds = overrides.participantIds ?? [...DEFAULT_PLAYERS];
  const sortedPlayerIds = overrides.sortedPlayerIds ?? [...participantIds];
  const dealerId = overrides.dealerId ?? "p1";
  const seed = overrides.seed ?? 42;

  if (overrides.skipEnrollment !== false) {
    let state = initSimulatedHand(overrides);
    assertNoDuplicateCards(state);
    state = runDrawPhase(state);
    const leadId = state.publicHand.actionOrder?.[0] ?? state.publicHand.participantIds[0];
    assertFirstTrickEmpty(state, leadId);
    state = runPlayPhase(state);
    return state;
  }

  const dealCtx: DealCompletionContext = {
    dealerId,
    sortedPlayerIds,
    seed,
    dealingRule: null,
  };
  const join = overrides.enrollmentJoin ?? (() => true);
  const enrolled = runEnrollmentPhase(sortedPlayerIds, dealerId, join, dealCtx, seed);
  if (enrolled.kind !== "deal") {
    throw new Error(`Enrollment did not deal: ${enrolled.kind}`);
  }

  const privateHands: Record<string, Card[]> = {};
  for (const [pid, doc] of Object.entries(enrolled.privateHandsByPlayer)) {
    privateHands[pid] = deserializeCards(doc.cards);
  }

  let state: SimulatedHandState = {
    publicHand: enrolled.currentHand,
    privateHands,
    deck: shuffledDeckFromSeed(enrolled.currentHand.deckSeed ?? seed),
  };
  assertNoDuplicateCards(state);
  state = runDrawPhase(state);
  const leadId = state.publicHand.actionOrder?.[0] ?? state.publicHand.participantIds[0];
  assertFirstTrickEmpty(state, leadId);
  state = runPlayPhase(state);
  return state;
}
