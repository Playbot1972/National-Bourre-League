import type {
  RecordHandSettlementInput,
  RecordHandSettlementResult,
  ScoreById,
} from "./types";
import {
  anteAlreadyPosted,
  bourrePlayerIds,
  collectNextHandAntes,
  computeHandPotState,
  deriveScoreNet,
  handAnteContribution,
  mergeNextDealFundingIntoScoreById,
  scoreBankroll,
} from "./core";
import {
  applyFundingWithSolvency,
  buildNextDealFunding,
  computeFundingContributionByPlayer,
  resolveSettlementBranch,
  runCanonicalMoneyFlow,
  settleCompletedHand,
  validateMoneyInvariants,
} from "./canonical";

export { mergeNextDealFundingIntoScoreById };

/** @deprecated Use recordHandSettlement */
export const simulateRecordHandSettlement = recordHandSettlement;

/**
 * End-to-end hand settlement via canonical two-phase money engine.
 * Phase 1: settle completed hand. Phase 2: compute nextDealFunding (applied at deal).
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
    splitPotEnabled = false,
  } = input as RecordHandSettlementInput & { splitPotEnabled?: boolean };

  const antePot = participants.reduce(
    (sum, pid) =>
      sum +
      (postedAntes[pid] ?? handAnteContribution(scoreById[pid], sessionStake)),
    0,
  );

  const potState = computeHandPotState({
    anteAmount: sessionStake,
    limEnabled,
    carryIn,
    antePot,
  });

  const bourreIds = bourrePlayerIds(tricksByPlayer, participants);
  const branch = resolveSettlementBranch(mode, winners, splitPotEnabled);

  const stackByPlayer: Record<string, number> = {};
  for (const pid of participants) {
    stackByPlayer[pid] = scoreBankroll(scoreById[pid], buyInFallback);
  }

  const phase1 = settleCompletedHand({
    completedHandPot: potState.maxWinThisHand,
    stackByPlayer,
    participants,
    singleWinnerId: branch.singleWinnerId,
    tiedWinnerIds: branch.tiedWinnerIds,
    bourrePlayerIds: bourreIds,
    splitPot: branch.splitPot,
    participantOrder: participants,
  });

  const phase2Plan = computeFundingContributionByPlayer({
    settledStackByPlayer: phase1.settledStackByPlayer,
    completedHandPot: potState.maxWinThisHand,
    carryoverPot: phase1.carryoverPot,
    anteAmount: sessionStake,
    participantIds: participants,
    bourrePlayerIds: bourreIds,
    tiedWinnerIds: phase1.tiedWinnerIds,
    splitPot: phase1.splitPot,
    tie: phase1.tie,
  });

  const solventFunding = applyFundingWithSolvency(
    {
      settledStackByPlayer: phase1.settledStackByPlayer,
      completedHandPot: potState.maxWinThisHand,
      carryoverPot: phase1.carryoverPot,
      anteAmount: sessionStake,
      participantIds: participants,
      bourrePlayerIds: bourreIds,
      tiedWinnerIds: phase1.tiedWinnerIds,
      splitPot: phase1.splitPot,
      tie: phase1.tie,
    },
    buyInFallback,
  );

  const bourreRemainders = solventFunding.bourreReplacementRemainderByPlayer;

  const nextDealFunding = buildNextDealFunding(
    phase1,
    {
      ...phase2Plan,
      nextStartStackByPlayer: solventFunding.collected.bankrolls,
      nextPot: solventFunding.nextPot,
      carryoverPot: phase1.carryoverPot,
    },
    participants,
    bourreRemainders,
  );

  for (const pid of participants) {
    const remainder = bourreRemainders[pid];
    if (remainder != null && remainder > 0 && nextDealFunding.byPlayer[pid]) {
      nextDealFunding.byPlayer[pid].bourreReplacementDue = remainder;
      nextDealFunding.byPlayer[pid].fundingContribution = remainder;
      nextDealFunding.byPlayer[pid].fundingReason = "bourre_full_pot_penalty";
    }
  }

  const appliedDeltas: Record<string, number> = {};
  const bankrolls: Record<string, number> = {};
  for (const pid of participants) {
    const before = stackByPlayer[pid] ?? 0;
    const after = phase1.settledStackByPlayer[pid] ?? before;
    appliedDeltas[pid] = after - before;
    bankrolls[pid] = after;
  }

  const bankrolled: ScoreById = { ...scoreById };
  for (const pid of participants) {
    const bankroll = bankrolls[pid] ?? scoreBankroll(bankrolled[pid], buyInFallback);
    const row = { ...bankrolled[pid], bankroll, net: deriveScoreNet(bankroll, buyInFallback) };
    const flags = nextDealFunding.byPlayer[pid];
    if (flags?.skipNextAnte) row.skipNextAnte = true;
    if (flags?.bourreReplacementDue != null) {
      row.bourreReplacementDue = flags.bourreReplacementDue;
    }
    if (flags?.fundingContribution != null) {
      row.fundingContribution = flags.fundingContribution;
    }
    bankrolled[pid] = row;
  }

  const canonicalResult = {
    ...phase1,
    ...phase2Plan,
    rebuyContributionByPlayer: {},
    splitPayoutByPlayer: phase1.splitPayoutByPlayer,
    nextStartStackByPlayer: Object.fromEntries(
      participants.map((pid) => [
        pid,
        Math.max(
          0,
          (phase1.settledStackByPlayer[pid] ?? 0) -
            (phase2Plan.fundingContributionByPlayer[pid] ?? 0),
        ),
      ]),
    ),
    nextPot: nextDealFunding.nextPot,
  };

  validateMoneyInvariants({
    result: canonicalResult,
    participantIds: participants,
    anteAmount: sessionStake,
    stackBeforeSettlement: stackByPlayer,
  });

  const nominalDeltas = { ...appliedDeltas };
  const bourreMatch = bourreIds.length * potState.maxWinThisHand;

  return {
    mode,
    winners,
    participants,
    bourreIds,
    potState,
    grossPot: potState.currentPot,
    cappedPot: potState.maxWinThisHand,
    overflow: potState.overflow,
    bourreMatch,
    nominalDeltas,
    appliedDeltas,
    carryOverPot: phase1.carryoverPot,
    bankrolls,
    bourreRemainders,
    scoreById: bankrolled,
    nextDealFunding: {
      ...nextDealFunding,
      settledPot: potState.maxWinThisHand,
    },
    solvent: {
      appliedDeltas,
      bankrolls,
      bustedIds: [],
      outIds: participants.filter((pid) => (bankrolls[pid] ?? 0) <= 0),
      carryOverPot: phase1.carryoverPot,
      shortfall: 0,
    },
    debug: {
      settledPot: potState.currentPot,
      settledHandPot: potState.currentPot,
      carryOverPot: phase1.carryoverPot,
      activePlayers: [...participants],
      bourrePlayers: [...bourreIds],
      bourreReplacementDuePersisted: bourreRemainders,
      fundingFlagsRead: Object.fromEntries(
        participants.map((pid) => [pid, nextDealFunding.byPlayer[pid] ?? {}]),
      ),
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
  staleScoreById?: ScoreById | null;
}

/** Apply authoritative nextDealFunding at deal start (no alternate math). */
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

  const hasAuthoritativeFunding =
    nextDealFunding?.fundingContributionByPlayer != null ||
    Object.values(nextDealFunding?.byPlayer ?? {}).some(
      (f) => f?.fundingContribution != null,
    );

  if (hasAuthoritativeFunding && nextDealFunding) {
    const settledStackByPlayer: Record<string, number> = {};
    for (const pid of participantIds) {
      settledStackByPlayer[pid] = scoreBankroll(merged[pid], buyInFallback);
    }

    const fundingInput = {
      settledStackByPlayer,
      completedHandPot:
        nextDealFunding.completedHandPot ??
        nextDealFunding.settledPot ??
        0,
      carryoverPot: carryOverPot,
      anteAmount: sessionStake,
      participantIds,
      bourrePlayerIds: nextDealFunding.bourrePlayerIds ?? [],
      tiedWinnerIds: nextDealFunding.tiedWinnerIds ?? [],
      splitPot: nextDealFunding.splitPot === true,
      tie: nextDealFunding.tie === true,
      bourreReplacementRemainderByPlayer: Object.fromEntries(
        participantIds
          .map((pid) => [pid, merged[pid]?.bourreReplacementDue ?? null] as const)
          .filter(([, v]) => v != null && v > 0),
      ),
    };

    const solvent = applyFundingWithSolvency(fundingInput, buyInFallback);

    const fundingFromStorage = Object.fromEntries(
      participantIds.map((pid) => [
        pid,
        {
          bourreReplacementDue: merged[pid]?.bourreReplacementDue ?? null,
          skipNextAnte: merged[pid]?.skipNextAnte === true,
          fundingContribution:
            nextDealFunding.byPlayer[pid]?.fundingContribution ??
            nextDealFunding.fundingContributionByPlayer?.[pid] ??
            null,
          fundingReason: nextDealFunding.byPlayer[pid]?.fundingReason ?? null,
        },
      ]),
    );

    return {
      collected: {
        ...solvent.collected,
        carryIn: carryOverPot,
        antePot: Object.values(solvent.collected.postedAntes).reduce(
          (s, n) => s + n,
          0,
        ),
        nextHandPot: solvent.nextPot,
      },
      mergedScoreById: merged,
      nextHandPot: solvent.nextPot,
      debug: {
        nextDealFundingFlagsReadFromStorage: fundingFromStorage,
        finalAntesCollected: { ...solvent.collected.postedAntes },
        nextHandPot: solvent.nextPot,
        usedStaleRead: staleScoreById != null,
        canonicalFunding: true,
      },
    };
  }

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
      canonicalFunding: false,
    },
  };
}

/** @deprecated Use startNextHandFunding */
export const simulatePagatHandStartFunding = startNextHandFunding;

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
          delete row.fundingContribution;
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

export { runCanonicalMoneyFlow, validateMoneyInvariants };
