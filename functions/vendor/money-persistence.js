// money-persistence.js — Firestore helpers for v1 money engine atomic writes.
// Pure orchestration; imports engine from ./money-engine.js (built from src/game/money/).

import {
  MONEY_ENGINE_VERSION,
  isMoneyEngineV1,
  assertMoneyEngineCompatible,
  processBuyIn,
  processHandSettlement,
  processAnte,
  processRebuy,
  computeFinalBankrolls,
  recordHandSettlement,
  mergeNextDealFundingIntoScoreById,
  deriveScoreNet,
  startNextHandFunding,
  collectFundingForHandStart,
} from "./money-engine.js";

export {
  MONEY_ENGINE_VERSION,
  isMoneyEngineV1,
  assertMoneyEngineCompatible,
  processBuyIn,
  processHandSettlement,
  processAnte,
  processRebuy,
  computeFinalBankrolls,
  recordHandSettlement,
  mergeNextDealFundingIntoScoreById,
  startNextHandFunding,
  collectFundingForHandStart,
};

/** Subcollection path segment for immutable money events. */
export const MONEY_EVENTS_COLLECTION = "moneyEvents";

/**
 * Serialize money events for Firestore (plain objects).
 * @param {import('./money-engine.js').MoneyEvent[]} events
 */
export function serializeMoneyEvents(events) {
  return (events || []).map((e) => ({
    eventId: e.eventId,
    actionId: e.actionId,
    handId: e.handId,
    phase: e.phase,
    sequence: e.sequence,
    type: e.type,
    playerId: e.playerId,
    amount: e.amount,
    metadata: e.metadata || {},
    timestamp: e.timestamp ?? Date.now(),
  }));
}

/**
 * Append money events + session markers inside an existing batch/transaction.
 * Caller must commit atomically with score patches.
 *
 * @param {import('firebase/firestore').WriteBatch | import('firebase/firestore').Transaction} writer
 * @param {object} ctx
 * @param {import('firebase/firestore').Firestore} ctx.db
 * @param {string} ctx.roomId
 * @param {string} ctx.sessionId
 * @param {import('./money-engine.js').MoneyEvent[]} ctx.events
 * @param {number} ctx.nextSequence — session moneySequence after append
 * @param {typeof import('firebase/firestore').doc} ctx.doc
 * @param {typeof import('firebase/firestore').serverTimestamp} ctx.serverTimestamp
 */
export function appendMoneyEventsToWriter(writer, ctx) {
  const { db, roomId, sessionId, events, nextSequence, doc, serverTimestamp } = ctx;
  if (!events?.length) return;

  const base = doc(db, "rooms", roomId, "sessions", sessionId, MONEY_EVENTS_COLLECTION);
  for (const event of events) {
    writer.set(doc(base, event.eventId), {
      ...event,
      metadata: event.metadata || {},
      createdAt: serverTimestamp(),
    });
  }

  writer.update(doc(db, "rooms", roomId, "sessions", sessionId), {
    moneyEngineVersion: MONEY_ENGINE_VERSION,
    moneySequence: nextSequence,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Build session create money events for initial buy-ins.
 * @param {string} sessionId
 * @param {string[]} playerIds
 * @param {number} buyInAmount
 */
export function buildSessionBuyInMoney(sessionId, playerIds, buyInAmount) {
  return processBuyIn({
    actionId: `session:buyin:${sessionId}`,
    playerIds,
    buyInAmount,
  });
}

/**
 * Run v1 hand settlement through the money engine.
 * Legacy sessions (no moneyEngineVersion) should use recordHandSettlement directly.
 */
export function runV1HandSettlement(input) {
  const {
    sessionId,
    handNumber,
    mode,
    winners,
    participants,
    tricksByPlayer,
    scoreById,
    sessionStake,
    limEnabled,
    carryIn,
    postedAntes,
    buyInFallback,
    existingEvents = [],
  } = input;

  return processHandSettlement({
    actionId: `settle:${sessionId}:${handNumber}`,
    handId: String(handNumber),
    sessionId,
    mode,
    winners,
    participants,
    tricksByPlayer,
    scoreById,
    sessionStake,
    limEnabled,
    carryIn,
    postedAntes,
    buyInFallback,
    existingEvents,
  });
}

/**
 * Run v1 ante collection for deal start.
 */
export function runV1AnteCollection(input) {
  const {
    sessionId,
    handNumber,
    carryOverPot,
    participantIds,
    scoreById,
    sessionStake,
    buyInFallback,
    nextDealFunding,
    existingEvents = [],
  } = input;

  return processAnte({
    actionId: `ante:${sessionId}:${handNumber}`,
    handId: String(handNumber),
    carryOverPot,
    participantIds,
    scoreById,
    sessionStake,
    buyInFallback,
    nextDealFunding,
    existingEvents,
  });
}

/**
 * V1 deal start: ante collection + score row patches (bankroll + net).
 * @param {object} input
 * @param {import('./money-engine.js').CollectAntesResult} input.collected
 * @param {string[]} input.dealIds
 * @param {number} input.buyIn
 */
export function buildV1DealScorePatches(collected, dealIds, buyIn = 100) {
  const patches = {};
  const touched = new Set([...(collected.outIds || []), ...dealIds]);
  for (const pid of touched) {
    if (collected.bankrolls[pid] == null) continue;
    const bankroll = collected.bankrolls[pid];
    const patch = { bankroll, net: deriveScoreNet(bankroll, buyIn) };
    if (collected.outIds?.includes(pid)) {
      patch.out = true;
    }
    if (collected.postedAntes[pid] != null) {
      patch.bourreReplacementDue = null;
      patch.skipNextAnte = null;
    }
    patches[pid] = patch;
  }
  return patches;
}

/**
 * Run v1 rebuy through money engine.
 */
export function runV1Rebuy(input) {
  const { sessionId, playerId, buyInAmount, handNumber = null, existingEvents = [] } = input;
  return processRebuy({
    actionId: `rebuy:${sessionId}:${playerId}:${handNumber ?? "session"}`,
    playerId,
    buyInAmount,
    handId: handNumber != null ? String(handNumber) : null,
    existingEvents,
  });
}

/**
 * Canonical finalization before session close — validates replay vs score rows.
 */
export function finalizeSessionBankrolls(input) {
  const {
    events,
    scoreById,
    buyInFallback,
    carryOverPot = 0,
    postedAntes = {},
    playerCount,
  } = input;
  return computeFinalBankrolls({
    events,
    scoreById,
    buyInFallback,
    carryOverPot,
    postedAntes,
    playerCount,
  });
}

/**
 * Load existing money events from Firestore snapshot docs into engine shape.
 * @param {Array<{ id: string, data: () => object }>} docs
 */
export function moneyEventsFromFirestoreDocs(docs) {
  return (docs || []).map((d) => {
    const data = typeof d.data === "function" ? d.data() : d;
    return {
      eventId: data.eventId ?? d.id,
      actionId: data.actionId,
      handId: data.handId ?? null,
      phase: data.phase,
      sequence: data.sequence,
      type: data.type,
      playerId: data.playerId ?? null,
      amount: data.amount,
      metadata: data.metadata || {},
      timestamp: data.timestamp,
    };
  });
}

/**
 * Next monotonic moneySequence after appending events.
 */
export function nextMoneySequence(sessionData, newEventCount) {
  const current = Number(sessionData?.moneySequence) || 0;
  return current + Math.max(0, newEventCount);
}
