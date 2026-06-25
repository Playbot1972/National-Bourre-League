// bourre-settlement-flow.js — integration helpers mirroring recordHand → deal funding.
// Pure logic (no Firebase). Used by firestore.js, gameHandlers.js, and integration tests.

import {
  settleHandDeltas,
  applySolventSettlement,
  nextDealFundingFlags,
  buildNextDealFundingSnapshot,
  mergeNextDealFundingIntoScoreById,
  collectNextHandAntes,
  scoreBankroll,
  anteAlreadyPosted,
  handAnteContribution,
  bourrePlayerIds,
} from "./bourre-rules.js";

export { buildNextDealFundingSnapshot, mergeNextDealFundingIntoScoreById };

/**
 * Mirror recordHandClient score-row funding patches (next-deal flags only).
 * @returns {{ scoreById: Record<string, object>, nextDealFunding: object, debug: object }}
 */
export function applyRecordHandFundingToScores({
  scoreById,
  participants,
  mode,
  winners,
  bourreIds,
  potState,
}) {
  const settledPot = potState.currentPot;
  const next = { ...scoreById };
  const persisted = {};
  const fundingRead = {};

  for (const pid of participants) {
    const current = { ...(next[pid] || {}) };
    if (current.skipNextAnte) delete current.skipNextAnte;
    if (current.bourreReplacementDue != null) delete current.bourreReplacementDue;

    const funding = nextDealFundingFlags({
      playerId: pid,
      mode,
      winners,
      bourreIds,
      settledPot,
    });
    fundingRead[pid] = { ...funding };
    if (funding.bourreReplacementDue != null) {
      current.bourreReplacementDue = funding.bourreReplacementDue;
      persisted[pid] = funding.bourreReplacementDue;
    }
    if (funding.skipNextAnte) {
      current.skipNextAnte = true;
    }
    next[pid] = current;
  }

  const nextDealFunding = buildNextDealFundingSnapshot({
    settledPot,
    bourreIds,
    participants,
    mode,
    winners,
  });

  return {
    scoreById: next,
    nextDealFunding,
    debug: {
      settledPot,
      activePlayers: [...participants],
      bourrePlayers: [...bourreIds],
      bourreReplacementDuePersisted: persisted,
      fundingFlagsRead: fundingRead,
    },
  };
}

/**
 * Full settlement step: settleHandDeltas → applySolventSettlement → funding patches.
 */
export function simulateRecordHandSettlement({
  mode,
  winners,
  participants,
  tricksByPlayer,
  scoreById,
  sessionStake = 1,
  limEnabled = false,
  carryIn = 0,
  postedAntes = {},
  buyInFallback = 100,
}) {
  const antePot = participants.reduce(
    (sum, pid) =>
      sum +
      (postedAntes[pid] ??
        handAnteContribution(scoreById[pid], sessionStake)),
    0,
  );
  const stakeForSettlement = (pid) =>
    anteAlreadyPosted(postedAntes, pid) ? 0 : handAnteContribution(scoreById[pid], sessionStake);

  const handSettlement = settleHandDeltas({
    mode,
    winners,
    participants,
    tricksByPlayer,
    anteAmount: sessionStake,
    limEnabled,
    carryIn,
    antePot,
    stakeForPlayer: stakeForSettlement,
  });

  const {
    deltas: nominalDeltas,
    carryOverPot: nominalCarry,
    bourreIds,
    potState,
  } = handSettlement;

  const solvent = applySolventSettlement({
    mode,
    winners,
    participants,
    nominalDeltas,
    scoreById,
    carryOverPot: nominalCarry,
    buyInFallback,
    stakeForPlayer: stakeForSettlement,
  });

  const bankrolled = { ...scoreById };
  for (const pid of participants) {
    bankrolled[pid] = {
      ...bankrolled[pid],
      bankroll: solvent.bankrolls[pid] ?? scoreBankroll(bankrolled[pid], buyInFallback),
      net: (bankrolled[pid]?.net || 0) + (solvent.appliedDeltas[pid] ?? 0),
    };
  }

  const funded = applyRecordHandFundingToScores({
    scoreById: bankrolled,
    participants,
    mode,
    winners,
    bourreIds,
    potState,
  });

  return {
    ...funded,
    carryOverPot: solvent.carryOverPot,
    potState,
    bourreIds,
    solvent,
    debug: {
      ...funded.debug,
      settledHandPot: potState.currentPot,
      carryOverPot: solvent.carryOverPot,
    },
  };
}

/**
 * Mirror buildPagatHandStartPatch ante collection (no card deal).
 * @param {object} opts
 * @param {Record<string, object>} [opts.staleScoreById] — omit bourreReplacementDue to simulate stale read
 */
export function simulatePagatHandStartFunding({
  scoreById,
  nextDealFunding,
  carryOverPot = 0,
  participantIds,
  sessionStake = 1,
  buyInFallback = 100,
  staleScoreById = null,
}) {
  const readRows = staleScoreById ?? scoreById;
  const merged = mergeNextDealFundingIntoScoreById(readRows, nextDealFunding);
  const collected = collectNextHandAntes({
    carryOverPot,
    participantIds,
    scoreById: merged,
    sessionStake,
    buyInFallback,
  });

  const fundingFromStorage = Object.fromEntries(
    participantIds.map((pid) => [
      pid,
      {
        bourreReplacementDue: merged[pid]?.bourreReplacementDue ?? null,
        skipNextAnte: merged[pid]?.skipNextAnte === true,
      },
    ]),
  );

  return {
    collected,
    mergedScoreById: merged,
    debug: {
      nextDealFundingFlagsReadFromStorage: fundingFromStorage,
      finalAntesCollected: { ...collected.postedAntes },
      nextHandPot: collected.nextHandPot,
      usedStaleRead: staleScoreById != null,
    },
  };
}

/** End-to-end: recordHand settlement → next deal ante collection. */
export function runProductionSettlementDealFlow(input, { staleDealRead = false } = {}) {
  const settlement = simulateRecordHandSettlement(input);
  const staleScoreById = staleDealRead
    ? Object.fromEntries(
        input.participants.map((pid) => {
          const row = { ...settlement.scoreById[pid] };
          delete row.bourreReplacementDue;
          delete row.skipNextAnte;
          return [pid, row];
        }),
      )
    : null;

  const deal = simulatePagatHandStartFunding({
    scoreById: settlement.scoreById,
    nextDealFunding: settlement.nextDealFunding,
    carryOverPot: settlement.carryOverPot,
    participantIds: input.participants,
    sessionStake: input.sessionStake ?? 1,
    buyInFallback: input.buyInFallback ?? 100,
    staleScoreById,
  });

  return {
    settlement,
    deal,
    debug: {
      settledHandPot: settlement.debug.settledHandPot,
      activePlayers: settlement.debug.activePlayers,
      bourrePlayers: settlement.debug.bourrePlayers,
      bourreReplacementDuePersisted: settlement.debug.bourreReplacementDuePersisted,
      nextDealFundingSnapshot: settlement.nextDealFunding,
      nextDealFundingFlagsReadFromStorage: deal.debug.nextDealFundingFlagsReadFromStorage,
      finalAntesCollected: deal.debug.finalAntesCollected,
      nextHandPot: deal.debug.nextHandPot,
      staleReadRecovered: staleDealRead,
    },
  };
}

export function bourreIdsFromTricks(tricksByPlayer, participants) {
  return bourrePlayerIds(tricksByPlayer, participants);
}
