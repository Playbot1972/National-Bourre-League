import type {
  CollectAntesResult,
  RecordHandSettlementInput,
  RecordHandSettlementResult,
  ScoreById,
} from "./types";
import {
  anteAlreadyPosted,
  applyRecordHandFundingToScores,
  applySolventSettlement,
  bourrePlayerIds,
  bourreRemaindersFromSettlement,
  collectNextHandAntes,
  handAnteContribution,
  mergeNextDealFundingIntoScoreById,
  scoreBankroll,
  settleHandDeltas,
} from "./core";

export { applyRecordHandFundingToScores, mergeNextDealFundingIntoScoreById };

/** @deprecated Use recordHandSettlement */
export const simulateRecordHandSettlement = recordHandSettlement;

/**
 * End-to-end hand settlement: nominal deltas → solvent apply → next-deal funding flags.
 * Mirrors recordHandClient / handleRecordHand money path (no persistence).
 */
export function recordHandSettlement(
  input: RecordHandSettlementInput,
): RecordHandSettlementResult {
  const {
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
  } = input;

  const antePot = participants.reduce(
    (sum, pid) =>
      sum +
      (postedAntes[pid] ?? handAnteContribution(scoreById[pid], sessionStake)),
    0,
  );
  const stakeForSettlement = (pid: string) =>
    anteAlreadyPosted(postedAntes, pid)
      ? 0
      : handAnteContribution(scoreById[pid], sessionStake);

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
    bourreMatch,
    potState,
    pot: grossPot,
    cappedPot,
    overflow,
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

  const bourreRemainders = bourreRemaindersFromSettlement(
    bourreIds,
    nominalDeltas,
    solvent.appliedDeltas,
  );

  const bankrolled: ScoreById = { ...scoreById };
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
    bourreRemaindersByPlayer: bourreRemainders,
  });

  return {
    mode,
    winners,
    participants,
    bourreIds,
    potState,
    grossPot,
    cappedPot,
    overflow,
    bourreMatch,
    nominalDeltas,
    appliedDeltas: solvent.appliedDeltas,
    carryOverPot: solvent.carryOverPot,
    bankrolls: solvent.bankrolls,
    bourreRemainders,
    scoreById: funded.scoreById,
    nextDealFunding: funded.nextDealFunding,
    solvent,
    debug: {
      ...funded.debug,
      settledHandPot: potState.currentPot,
      carryOverPot: solvent.carryOverPot,
    },
  };
}

export interface StartNextHandFundingInput {
  scoreById: ScoreById;
  nextDealFunding: RecordHandSettlementResult["nextDealFunding"];
  carryOverPot?: number;
  participantIds: string[];
  sessionStake?: number;
  buyInFallback?: number;
  /** Simulate stale deal read omitting bourré flags */
  staleScoreById?: ScoreById | null;
}

/** Mirror buildPagatHandStartPatch ante collection (no card deal). */
export function startNextHandFunding(input: StartNextHandFundingInput) {
  const {
    scoreById,
    nextDealFunding,
    carryOverPot = 0,
    participantIds,
    sessionStake = 1,
    buyInFallback = 100,
    staleScoreById = null,
  } = input;

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
    nextHandPot: collected.nextHandPot,
    debug: {
      nextDealFundingFlagsReadFromStorage: fundingFromStorage,
      finalAntesCollected: { ...collected.postedAntes },
      nextHandPot: collected.nextHandPot,
      usedStaleRead: staleScoreById != null,
    },
  };
}

/** @deprecated Use startNextHandFunding */
export const simulatePagatHandStartFunding = startNextHandFunding;

/** Settlement → next-deal ante collection with optional stale-read simulation. */
export function runHandMoneyFlow(
  input: RecordHandSettlementInput,
  options: { staleDealRead?: boolean } = {},
) {
  const settlement = recordHandSettlement(input);
  const staleScoreById = options.staleDealRead
    ? Object.fromEntries(
        input.participants.map((pid) => {
          const row = { ...settlement.scoreById[pid] };
          delete row.bourreReplacementDue;
          delete row.skipNextAnte;
          return [pid, row];
        }),
      )
    : null;

  const deal = startNextHandFunding({
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
      nextDealFundingFlagsReadFromStorage:
        deal.debug.nextDealFundingFlagsReadFromStorage,
      finalAntesCollected: deal.debug.finalAntesCollected,
      nextHandPot: deal.debug.nextHandPot,
      staleReadRecovered: options.staleDealRead === true,
    },
  };
}

/** @deprecated Use runHandMoneyFlow */
export const runProductionSettlementDealFlow = runHandMoneyFlow;

export function bourreIdsFromTricks(
  tricksByPlayer: Record<string, number>,
  participants: string[],
) {
  return bourrePlayerIds(tricksByPlayer, participants);
}
