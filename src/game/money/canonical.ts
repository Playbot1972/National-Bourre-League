/**
 * Canonical two-phase money engine — single source of truth for settlement + funding.
 *
 * Phase 1: settleCompletedHand — award completedHandPot (or carry on tie).
 * Phase 2: computeNextHandFunding — bourré penalties + normal antes fund nextPot.
 */

import type { ScoreById, SettlementMode } from "./types";
import {
  applyBankrollDelta,
  bourrePlayerIds,
  computeHandPotState,
  scoreBankroll,
} from "./core";
import {
  tableChipTotal,
  validateChipGrowthInvariant,
  type MoneyInvariantResult,
  type TableChipSnapshot,
} from "./conservation";

export type FundingReason =
  | "bourre_full_pot_penalty"
  | "normal_ante"
  | "tie_carry_exempt"
  | "explicit_exempt"
  | "rebuy";

export interface CanonicalMoneyResult {
  completedHandPot: number;
  carryoverPot: number;
  payoutByPlayer: Record<string, number>;
  splitPayoutByPlayer: Record<string, number>;
  settledStackByPlayer: Record<string, number>;
  fundingContributionByPlayer: Record<string, number>;
  fundingReasonByPlayer: Record<string, FundingReason>;
  rebuyContributionByPlayer: Record<string, number>;
  nextStartStackByPlayer: Record<string, number>;
  nextPot: number;
  splitPot: boolean;
  tie: boolean;
  singleWinnerId: string | null;
  tiedWinnerIds: string[];
  bourrePlayerIds: string[];
}

export interface SettleCompletedHandInput {
  completedHandPot: number;
  stackByPlayer: Record<string, number>;
  participants: string[];
  singleWinnerId?: string | null;
  tiedWinnerIds?: string[];
  bourrePlayerIds?: string[];
  splitPot: boolean;
  /** Push / unanimous carry — full pot rolls without payout. */
  potCarry?: boolean;
  /** Canonical seat order for deterministic split remainder. */
  seatOrder?: string[];
  /** @deprecated Use seatOrder */
  participantOrder?: string[];
}

export interface ComputeNextHandFundingInput {
  settledStackByPlayer: Record<string, number>;
  completedHandPot: number;
  carryoverPot: number;
  anteAmount: number;
  participantIds: string[];
  bourrePlayerIds: string[];
  tiedWinnerIds: string[];
  splitPot: boolean;
  tie: boolean;
  /** Room split-pot checkbox — tied carry winners pay ante when true. */
  splitPotOptionEnabled?: boolean;
  seatOrder?: string[];
  explicitExemptPlayerIds?: string[];
  bourreReplacementRemainderByPlayer?: Record<string, number>;
  rebuyContributionByPlayer?: Record<string, number>;
}

export interface ComputeRebuyContributionsInput {
  stackByPlayer: Record<string, number>;
  participantIds: string[];
  rebuyEnabled: boolean;
  /** Session buy-in — the app’s explicit rebuy top-up amount. */
  rebuyAmount: number;
  /** When set, only these players receive rebuy (e.g. bot auto-rebuy plan). */
  rebuyPlayerIds?: string[];
  outByPlayer?: Record<string, boolean>;
}

export interface NextDealFundingSnapshot {
  completedHandPot: number;
  carryoverPot: number;
  nextPot: number;
  bourrePlayerIds: string[];
  tiedWinnerIds: string[];
  splitPot: boolean;
  tie: boolean;
  splitPotOptionEnabled?: boolean;
  fundingContributionByPlayer: Record<string, number>;
  fundingReasonByPlayer: Record<string, FundingReason>;
  rebuyContributionByPlayer?: Record<string, number>;
  byPlayer: Record<
    string,
    {
      fundingContribution: number;
      fundingReason: FundingReason;
      skipNextAnte: boolean;
      bourreReplacementDue: number | null;
      rebuyContribution?: number;
    }
  >;
}

/** carryoverPot = completedHandPot when tie AND splitPot is false; otherwise 0. */
export function computeCarryoverPot(
  completedHandPot: number,
  tie: boolean,
  splitPot: boolean,
): number {
  if (tie && !splitPot) {
    return Math.max(0, Number(completedHandPot) || 0);
  }
  return 0;
}

/** Divide completedHandPot among tied winners; remainder by seat order among tied winners. */
export function computeSplitPotPayout(
  completedHandPot: number,
  tiedWinnerIds: string[],
  seatOrder: string[],
): Record<string, number> {
  const pot = Math.max(0, Number(completedHandPot) || 0);
  const winners = tiedWinnerIds.filter((id) => seatOrder.includes(id));
  const splitPayoutByPlayer: Record<string, number> = {};
  if (!winners.length || pot <= 0) {
    return splitPayoutByPlayer;
  }

  const base = Math.floor(pot / winners.length);
  let remainder = pot - base * winners.length;

  const orderedWinners = seatOrder.filter((id) => winners.includes(id));
  for (const pid of orderedWinners) {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    splitPayoutByPlayer[pid] = base + extra;
  }
  return splitPayoutByPlayer;
}

/**
 * Centralized rebuy — bankroll restoration only (does NOT fund nextPot).
 * Rebuy amount is session buy-in (existing explicit app rule).
 */
export function computeRebuyContributions(input: ComputeRebuyContributionsInput): {
  rebuyContributionByPlayer: Record<string, number>;
  rebuyPlayerIds: string[];
} {
  const {
    stackByPlayer,
    participantIds,
    rebuyEnabled,
    rebuyAmount,
    rebuyPlayerIds,
    outByPlayer = {},
  } = input;

  const rebuyContributionByPlayer: Record<string, number> = {};
  const triggered: string[] = [];
  const amount = Math.max(0, Number(rebuyAmount) || 0);

  if (!rebuyEnabled || amount <= 0) {
    return { rebuyContributionByPlayer, rebuyPlayerIds: triggered };
  }

  const candidates =
    rebuyPlayerIds != null
      ? rebuyPlayerIds.filter((pid) => participantIds.includes(pid))
      : participantIds.filter((pid) => {
          const stack = Math.max(0, Number(stackByPlayer[pid]) || 0);
          return stack <= 0 || outByPlayer[pid] === true;
        });

  for (const pid of candidates) {
    rebuyContributionByPlayer[pid] = amount;
    triggered.push(pid);
  }

  return { rebuyContributionByPlayer, rebuyPlayerIds: triggered };
}

/**
 * Phase 1 — settle the hand that just ended.
 * Bourré next-hand penalties are NOT applied here.
 */
export function settleCompletedHand(input: SettleCompletedHandInput): Pick<
  CanonicalMoneyResult,
  | "completedHandPot"
  | "carryoverPot"
  | "payoutByPlayer"
  | "splitPayoutByPlayer"
  | "settledStackByPlayer"
  | "splitPot"
  | "tie"
  | "singleWinnerId"
  | "tiedWinnerIds"
  | "bourrePlayerIds"
> {
  const {
    completedHandPot,
    stackByPlayer,
    participants,
    singleWinnerId = null,
    tiedWinnerIds = [],
    bourrePlayerIds = [],
    splitPot,
    potCarry = false,
    seatOrder = input.participantOrder ?? participants,
  } = input;

  const pot = Math.max(0, Number(completedHandPot) || 0);
  const tie = tiedWinnerIds.length >= 2 || potCarry;
  const payoutByPlayer: Record<string, number> = {};
  const splitPayoutByPlayer: Record<string, number> = {};
  const settledStackByPlayer: Record<string, number> = {};

  for (const pid of participants) {
    settledStackByPlayer[pid] = Math.max(0, Number(stackByPlayer[pid]) || 0);
    payoutByPlayer[pid] = 0;
    splitPayoutByPlayer[pid] = 0;
  }

  if (tie && !splitPot) {
    const carryoverPot = computeCarryoverPot(pot, true, false);
    return {
      completedHandPot: pot,
      carryoverPot,
      payoutByPlayer,
      splitPayoutByPlayer,
      settledStackByPlayer,
      splitPot: false,
      tie: true,
      singleWinnerId: null,
      tiedWinnerIds: [...tiedWinnerIds],
      bourrePlayerIds: [...bourrePlayerIds],
    };
  }

  if (tie && splitPot) {
    const splits = computeSplitPotPayout(pot, tiedWinnerIds, seatOrder);
    for (const [pid, amount] of Object.entries(splits)) {
      splitPayoutByPlayer[pid] = amount;
      payoutByPlayer[pid] = amount;
      settledStackByPlayer[pid] = (settledStackByPlayer[pid] ?? 0) + amount;
    }
    return {
      completedHandPot: pot,
      carryoverPot: 0,
      payoutByPlayer,
      splitPayoutByPlayer,
      settledStackByPlayer,
      splitPot: true,
      tie: true,
      singleWinnerId: null,
      tiedWinnerIds: [...tiedWinnerIds],
      bourrePlayerIds: [...bourrePlayerIds],
    };
  }

  const winner = singleWinnerId ?? tiedWinnerIds[0] ?? null;
  if (winner && participants.includes(winner)) {
    payoutByPlayer[winner] = pot;
    settledStackByPlayer[winner] = (settledStackByPlayer[winner] ?? 0) + pot;
  }

  return {
    completedHandPot: pot,
    carryoverPot: 0,
    payoutByPlayer,
    splitPayoutByPlayer,
    settledStackByPlayer,
    splitPot: false,
    tie: false,
    singleWinnerId: winner,
    tiedWinnerIds: [],
    bourrePlayerIds: [...bourrePlayerIds],
  };
}

/** Phase 2 — exactly one funding contribution per player. */
export function computeFundingContributionByPlayer(
  input: ComputeNextHandFundingInput,
): {
  fundingContributionByPlayer: Record<string, number>;
  fundingReasonByPlayer: Record<string, FundingReason>;
} {
  const {
    completedHandPot,
    carryoverPot,
    anteAmount,
    participantIds,
    bourrePlayerIds,
    tiedWinnerIds,
    splitPot,
    tie,
    explicitExemptPlayerIds = [],
    bourreReplacementRemainderByPlayer = {},
    splitPotOptionEnabled = false,
  } = input;

  const fundingContributionByPlayer: Record<string, number> = {};
  const fundingReasonByPlayer: Record<string, FundingReason> = {};
  const pot = Math.max(0, Number(completedHandPot) || 0);
  const ante = Math.max(0.01, Number(anteAmount) || 1);
  const exempt = new Set(explicitExemptPlayerIds);

  for (const pid of participantIds) {
    const remainder = bourreReplacementRemainderByPlayer[pid];
    if (remainder != null && remainder > 0) {
      fundingContributionByPlayer[pid] = remainder;
      fundingReasonByPlayer[pid] = "bourre_full_pot_penalty";
      continue;
    }

    if (bourrePlayerIds.includes(pid)) {
      fundingContributionByPlayer[pid] = pot;
      fundingReasonByPlayer[pid] = "bourre_full_pot_penalty";
    } else if (
      tie &&
      !splitPot &&
      !splitPotOptionEnabled &&
      tiedWinnerIds.includes(pid)
    ) {
      fundingContributionByPlayer[pid] = 0;
      fundingReasonByPlayer[pid] = "tie_carry_exempt";
    } else if (exempt.has(pid)) {
      fundingContributionByPlayer[pid] = 0;
      fundingReasonByPlayer[pid] = "explicit_exempt";
    } else {
      fundingContributionByPlayer[pid] = ante;
      fundingReasonByPlayer[pid] = "normal_ante";
    }
  }

  void carryoverPot;
  return { fundingContributionByPlayer, fundingReasonByPlayer };
}

/** Apply funding + optional rebuy to stacks. Rebuy does NOT increase nextPot. */
export function applyNextHandFunding(
  input: ComputeNextHandFundingInput,
): Pick<
  CanonicalMoneyResult,
  | "fundingContributionByPlayer"
  | "fundingReasonByPlayer"
  | "rebuyContributionByPlayer"
  | "nextStartStackByPlayer"
  | "nextPot"
  | "carryoverPot"
> {
  const { settledStackByPlayer, carryoverPot, participantIds, rebuyContributionByPlayer = {} } =
    input;
  const { fundingContributionByPlayer, fundingReasonByPlayer } =
    computeFundingContributionByPlayer(input);

  const rebuyByPlayer: Record<string, number> = {};
  for (const pid of participantIds) {
    rebuyByPlayer[pid] = Math.max(0, Number(rebuyContributionByPlayer[pid]) || 0);
  }

  const nextStartStackByPlayer: Record<string, number> = {};
  for (const pid of participantIds) {
    const settled = Math.max(0, Number(settledStackByPlayer[pid]) || 0);
    const contribution = Math.max(0, Number(fundingContributionByPlayer[pid]) || 0);
    const rebuy = rebuyByPlayer[pid] ?? 0;
    nextStartStackByPlayer[pid] = Math.max(0, settled - contribution + rebuy);
  }

  const contributionSum = participantIds.reduce(
    (sum, pid) => sum + Math.max(0, Number(fundingContributionByPlayer[pid]) || 0),
    0,
  );
  const nextPot = Math.max(0, Number(carryoverPot) || 0) + contributionSum;

  return {
    fundingContributionByPlayer,
    fundingReasonByPlayer,
    rebuyContributionByPlayer: rebuyByPlayer,
    nextStartStackByPlayer,
    nextPot,
    carryoverPot: Math.max(0, Number(carryoverPot) || 0),
  };
}

/** Build session.nextDealFunding from canonical Phase 2 outputs. */
export function buildNextDealFunding(
  phase1: ReturnType<typeof settleCompletedHand>,
  phase2: ReturnType<typeof applyNextHandFunding>,
  participantIds: string[],
  bourreReplacementRemainderByPlayer: Record<string, number> = {},
  options: { splitPotOptionEnabled?: boolean } = {},
): NextDealFundingSnapshot {
  const byPlayer: NextDealFundingSnapshot["byPlayer"] = {};

  for (const pid of participantIds) {
    const contribution = phase2.fundingContributionByPlayer[pid] ?? 0;
    const reason = phase2.fundingReasonByPlayer[pid] ?? "normal_ante";
    const remainder = bourreReplacementRemainderByPlayer[pid] ?? null;
    const rebuy = phase2.rebuyContributionByPlayer?.[pid] ?? 0;
    byPlayer[pid] = {
      fundingContribution: contribution,
      fundingReason: reason,
      skipNextAnte: reason === "tie_carry_exempt" || reason === "explicit_exempt",
      bourreReplacementDue:
        remainder != null && remainder > 0 ? remainder : null,
      ...(rebuy > 0 ? { rebuyContribution: rebuy } : {}),
    };
    if (reason === "bourre_full_pot_penalty") {
      byPlayer[pid].skipNextAnte = true;
    }
  }

  return {
    completedHandPot: phase1.completedHandPot,
    carryoverPot: phase1.carryoverPot,
    nextPot: phase2.nextPot,
    bourrePlayerIds: [...phase1.bourrePlayerIds],
    tiedWinnerIds: [...phase1.tiedWinnerIds],
    splitPot: phase1.splitPot,
    tie: phase1.tie,
    splitPotOptionEnabled: options.splitPotOptionEnabled === true,
    fundingContributionByPlayer: { ...phase2.fundingContributionByPlayer },
    fundingReasonByPlayer: { ...phase2.fundingReasonByPlayer },
    rebuyContributionByPlayer: { ...(phase2.rebuyContributionByPlayer ?? {}) },
    byPlayer,
  };
}

/** Map legacy SettlementMode + room splitPot setting to canonical branch. */
export function resolveSettlementBranch(
  mode: SettlementMode,
  winners: string[],
  splitPotEnabled: boolean,
): { splitPot: boolean; tie: boolean; tiedWinnerIds: string[]; singleWinnerId: string | null; potCarry?: boolean } {
  if (mode === "split") {
    return {
      splitPot: true,
      tie: winners.length >= 2,
      tiedWinnerIds: [...winners],
      singleWinnerId: null,
    };
  }
  if (mode === "push") {
    return {
      splitPot: false,
      tie: true,
      tiedWinnerIds: [...winners],
      singleWinnerId: null,
      potCarry: true,
    };
  }
  if (mode === "win" && winners.length === 1) {
    return {
      splitPot: false,
      tie: false,
      tiedWinnerIds: [],
      singleWinnerId: winners[0],
    };
  }
  const tieModes: SettlementMode[] = ["co_win_carry", "non_winner_ante_up", "push"];
  if (tieModes.includes(mode) || winners.length >= 2) {
    return {
      splitPot: splitPotEnabled && mode === "split",
      tie: true,
      tiedWinnerIds: [...winners],
      singleWinnerId: null,
    };
  }
  return {
    splitPot: false,
    tie: false,
    tiedWinnerIds: [],
    singleWinnerId: winners[0] ?? null,
  };
}

export interface ValidateMoneyInvariantsInput {
  result: CanonicalMoneyResult;
  participantIds: string[];
  anteAmount: number;
  expectedChipTotal?: number;
  stackBeforeSettlement?: Record<string, number>;
  /** Active pot before settlement (carry + posted antes this hand). */
  carryInBeforeSettlement?: number;
  postedAntesBeforeSettlement?: Record<string, number>;
}

export type { MoneyInvariantResult, TableChipSnapshot };

/** Bourré penalty posted to pot minus bankroll actually collected (mint if positive). */
export function bourrePotMintByPlayer(
  settledStackByPlayer: Record<string, number>,
  nextStartStackByPlayer: Record<string, number>,
  fundingReasonByPlayer: Record<string, FundingReason>,
  postedToPotByPlayer: Record<string, number>,
  rebuyContributionByPlayer: Record<string, number> = {},
): Record<string, number> {
  const mintByPlayer: Record<string, number> = {};
  for (const [pid, reason] of Object.entries(fundingReasonByPlayer)) {
    if (reason !== "bourre_full_pot_penalty") continue;
    const posted = Math.max(0, Number(postedToPotByPlayer[pid]) || 0);
    const settled = Math.max(0, Number(settledStackByPlayer[pid]) || 0);
    const next = Math.max(0, Number(nextStartStackByPlayer[pid]) || 0);
    const rebuy = Math.max(0, Number(rebuyContributionByPlayer[pid]) || 0);
    const bankrollPaid = Math.max(0, settled - next + rebuy);
    const mint = posted - bankrollPaid;
    if (mint > 0) mintByPlayer[pid] = mint;
  }
  return mintByPlayer;
}

/** Assert canonical money invariants from the prompt. */
export function validateMoneyInvariants(
  input: ValidateMoneyInvariantsInput,
): MoneyInvariantResult {
  const {
    result,
    participantIds,
    anteAmount,
    expectedChipTotal,
    stackBeforeSettlement,
    carryInBeforeSettlement = 0,
    postedAntesBeforeSettlement = {},
  } = input;
  const errors: string[] = [];
  const pot = result.completedHandPot;

  if (result.tie && !result.splitPot) {
    if (result.carryoverPot !== pot) {
      errors.push(`tie carry: carryoverPot ${result.carryoverPot} !== completedHandPot ${pot}`);
    }
    const payoutSum = Object.values(result.payoutByPlayer).reduce((s, n) => s + n, 0);
    if (payoutSum !== 0) {
      errors.push(`tie carry: expected zero immediate payout, got ${payoutSum}`);
    }
  }

  if (!result.tie && result.singleWinnerId) {
    if (result.carryoverPot !== 0) {
      errors.push(`single winner: carryoverPot must be 0, got ${result.carryoverPot}`);
    }
    const winnerPayout = result.payoutByPlayer[result.singleWinnerId] ?? 0;
    if (winnerPayout !== pot) {
      errors.push(`single winner: payout ${winnerPayout} !== completedHandPot ${pot}`);
    }
  }

  if (result.tie && result.splitPot) {
    if (result.carryoverPot !== 0) {
      errors.push(`split pot: carryoverPot must be 0, got ${result.carryoverPot}`);
    }
    const splitSum = Object.values(result.splitPayoutByPlayer).reduce((s, n) => s + n, 0);
    if (splitSum !== pot) {
      errors.push(`split pot: splitPayoutByPlayer ${splitSum} !== completedHandPot ${pot}`);
    }
    for (const pid of result.tiedWinnerIds) {
      const reason = result.fundingReasonByPlayer[pid];
      if (reason !== "normal_ante" && reason !== "bourre_full_pot_penalty" && reason !== "explicit_exempt") {
        if (reason === "tie_carry_exempt") {
          errors.push(`${pid}: tied split-pot winner must not be tie_carry_exempt`);
        }
      }
    }
  }

  const fundingSum = participantIds.reduce(
    (s, pid) => s + (result.fundingContributionByPlayer[pid] ?? 0),
    0,
  );
  if (result.nextPot !== result.carryoverPot + fundingSum) {
    errors.push(
      `nextPot ${result.nextPot} !== carryoverPot ${result.carryoverPot} + funding ${fundingSum}`,
    );
  }

  for (const pid of participantIds) {
    const reason = result.fundingReasonByPlayer[pid];
    const contrib = result.fundingContributionByPlayer[pid] ?? 0;
    if (reason === "bourre_full_pot_penalty" && contrib > 0 && contrib !== pot) {
      if (contrib < pot) {
        // bust remainder — allowed
      } else if (contrib !== pot) {
        errors.push(`${pid}: bourré contribution ${contrib} !== completedHandPot ${pot}`);
      }
    }
    if (reason === "bourre_full_pot_penalty" && reason === result.fundingReasonByPlayer[pid]) {
      const alsoAnte =
        result.fundingReasonByPlayer[pid] === "normal_ante" &&
        result.bourrePlayerIds.includes(pid);
      if (alsoAnte) {
        errors.push(`${pid}: charged both bourré penalty and normal ante`);
      }
    }
    if (
      result.bourrePlayerIds.includes(pid) &&
      reason === "bourre_full_pot_penalty" &&
      result.fundingReasonByPlayer[pid] === "normal_ante"
    ) {
      errors.push(`${pid}: bourré player charged normal ante`);
    }
  }

  for (const pid of participantIds) {
    const settled = result.settledStackByPlayer[pid] ?? 0;
    const contrib = result.fundingContributionByPlayer[pid] ?? 0;
    const rebuy = result.rebuyContributionByPlayer[pid] ?? 0;
    const next = result.nextStartStackByPlayer[pid] ?? 0;
    if (next !== Math.max(0, settled - contrib + rebuy)) {
      errors.push(
        `${pid}: nextStart ${next} !== settled ${settled} - contrib ${contrib} + rebuy ${rebuy}`,
      );
    }
  }

  const rebuyByPlayer = Object.fromEntries(
    participantIds.map((pid) => [pid, result.rebuyContributionByPlayer[pid] ?? 0]),
  );
  const rebuySum = Object.values(rebuyByPlayer).reduce((s, n) => s + n, 0);

  if (stackBeforeSettlement) {
    const settlementBefore: TableChipSnapshot = {
      bankrolls: stackBeforeSettlement,
      carryOverPot: carryInBeforeSettlement,
      postedAntes: postedAntesBeforeSettlement,
    };
    const settlementAfter: TableChipSnapshot = {
      bankrolls: result.settledStackByPlayer,
      carryOverPot: result.carryoverPot,
      postedAntes: {},
    };
    const settlementGrowth = validateChipGrowthInvariant({
      before: settlementBefore,
      after: settlementAfter,
      label: "settlement",
    });
    errors.push(...settlementGrowth.errors);

    const postedToPot = Object.fromEntries(
      participantIds.map((pid) => [pid, result.fundingContributionByPlayer[pid] ?? 0]),
    );
    const bourreMint = bourrePotMintByPlayer(
      result.settledStackByPlayer,
      result.nextStartStackByPlayer,
      result.fundingReasonByPlayer,
      postedToPot,
      rebuyByPlayer,
    );
    const bourreMintSum = Object.values(bourreMint).reduce((s, n) => s + n, 0);

    const fundingBefore: TableChipSnapshot = settlementAfter;
    const fundingAfter: TableChipSnapshot = {
      bankrolls: result.nextStartStackByPlayer,
      carryOverPot: result.nextPot,
      postedAntes: {},
    };
    const fundingGrowth = validateChipGrowthInvariant({
      before: fundingBefore,
      after: fundingAfter,
      rebuyContributionByPlayer: rebuyByPlayer,
      label: "next-hand funding",
    });
    errors.push(...fundingGrowth.errors);

    if (bourreMintSum > 0.001) {
      errors.push(
        `bourré penalty minted ${bourreMintSum} chips without bankroll deduction (only explicit rebuy may mint)`,
      );
    }

    const payoutDelta = Object.values(result.payoutByPlayer).reduce((s, n) => s + n, 0);
    const settleBankrollDelta =
      Object.values(result.settledStackByPlayer).reduce((s, n) => s + n, 0) -
      Object.values(stackBeforeSettlement).reduce((s, n) => s + n, 0);
    const potBefore =
      Math.max(0, Number(carryInBeforeSettlement) || 0) +
      Object.values(postedAntesBeforeSettlement).reduce((s, n) => s + Math.max(0, Number(n) || 0), 0);
    const potAfter = Math.max(0, Number(result.carryoverPot) || 0);
    const potDelta = potAfter - potBefore;
    if (Math.abs(settleBankrollDelta + potDelta) > 0.001) {
      errors.push("settlement must be zero-sum (bankroll + pot unchanged)");
    }
    if (Math.abs(settleBankrollDelta - payoutDelta) > 0.001 && potBefore > 0) {
      errors.push("settlement payout does not reconcile with stack deltas");
    }
  }

  if (expectedChipTotal != null && stackBeforeSettlement) {
    const endTotal = tableChipTotal({
      bankrolls: result.nextStartStackByPlayer,
      carryOverPot: result.carryoverPot,
      postedAntes: Object.fromEntries(
        participantIds.map((pid) => [pid, result.fundingContributionByPlayer[pid] ?? 0]),
      ),
    });
    const startTotal = tableChipTotal({
      bankrolls: stackBeforeSettlement,
      carryOverPot: carryInBeforeSettlement,
      postedAntes: postedAntesBeforeSettlement,
    });
    const allowedEnd = expectedChipTotal + rebuySum;
    if (Math.abs(endTotal - allowedEnd) > 0.001 && Math.abs(endTotal - startTotal - rebuySum) > 0.001) {
      errors.push(
        `session chip total ${endTotal} !== start ${startTotal} + rebuy ${rebuySum}`,
      );
    }
  }

  void anteAmount;

  return { ok: errors.length === 0, errors };
}

/** Full canonical flow: Phase 1 + Phase 2. */
export function runCanonicalMoneyFlow(opts: {
  mode: SettlementMode;
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  scoreById: ScoreById;
  sessionStake: number;
  carryIn?: number;
  postedAntes?: Record<string, number>;
  buyInFallback?: number;
  limEnabled?: boolean;
  splitPotEnabled?: boolean;
  explicitExemptPlayerIds?: string[];
}): CanonicalMoneyResult & { nextDealFunding: NextDealFundingSnapshot } {
  const {
    mode,
    winners,
    participants,
    tricksByPlayer,
    scoreById,
    sessionStake,
    carryIn = 0,
    postedAntes = {},
    buyInFallback = 100,
    limEnabled = false,
    splitPotEnabled = false,
    explicitExemptPlayerIds = [],
  } = opts;

  const antePot = participants.reduce((sum, pid) => {
    if (postedAntes[pid] != null) return sum + Math.max(0, Number(postedAntes[pid]) || 0);
    return sum;
  }, 0);

  const potState = computeHandPotState({
    anteAmount: sessionStake,
    limEnabled,
    carryIn,
    antePot,
  });
  const completedHandPot = potState.maxWinThisHand;
  const bourreIds = bourrePlayerIds(tricksByPlayer, participants);
  const branch = resolveSettlementBranch(mode, winners, splitPotEnabled);

  const stackByPlayer: Record<string, number> = {};
  for (const pid of participants) {
    stackByPlayer[pid] = scoreBankroll(scoreById[pid], buyInFallback);
  }

  const phase1 = settleCompletedHand({
    completedHandPot,
    stackByPlayer,
    participants,
    singleWinnerId: branch.singleWinnerId,
    tiedWinnerIds: branch.tiedWinnerIds,
    bourrePlayerIds: bourreIds,
    splitPot: branch.splitPot,
    potCarry: branch.potCarry === true,
    participantOrder: participants,
  });

  const bourreReplacementRemainderByPlayer: Record<string, number> = {};
  const phase2Input: ComputeNextHandFundingInput = {
    settledStackByPlayer: { ...phase1.settledStackByPlayer },
    completedHandPot,
    carryoverPot: phase1.carryoverPot,
    anteAmount: sessionStake,
    participantIds: participants,
    bourrePlayerIds: bourreIds,
    tiedWinnerIds: phase1.tiedWinnerIds,
    splitPot: phase1.splitPot,
    tie: phase1.tie,
    splitPotOptionEnabled: splitPotEnabled,
    explicitExemptPlayerIds,
    bourreReplacementRemainderByPlayer,
  };

  const phase2 = applyNextHandFunding(phase2Input);

  const nextDealFunding = buildNextDealFunding(
    phase1,
    phase2,
    participants,
    bourreReplacementRemainderByPlayer,
    { splitPotOptionEnabled: splitPotEnabled },
  );

  const result: CanonicalMoneyResult = {
    ...phase1,
    ...phase2,
  };

  return { ...result, nextDealFunding };
}

/** Apply funding with solvent clamping (bust → out, bourré remainder). */
export function applyFundingWithSolvency(
  input: ComputeNextHandFundingInput,
  buyInFallback = 100,
): {
  collected: {
    bankrolls: Record<string, number>;
    postedAntes: Record<string, number>;
    outIds: string[];
    activeParticipants: string[];
  };
  nextPot: number;
  bourreReplacementRemainderByPlayer: Record<string, number>;
  fundingContributionByPlayer: Record<string, number>;
  fundingReasonByPlayer: Record<string, FundingReason>;
} {
  const { fundingContributionByPlayer, fundingReasonByPlayer } =
    computeFundingContributionByPlayer(input);

  const bankrolls: Record<string, number> = {};
  const postedAntes: Record<string, number> = {};
  const outIds: string[] = [];
  const activeParticipants: string[] = [];
  const bourreReplacementRemainderByPlayer: Record<string, number> = {};

  for (const pid of input.participantIds) {
    const settled = Math.max(0, Number(input.settledStackByPlayer[pid]) || 0);
    const owed = Math.max(0, Number(fundingContributionByPlayer[pid]) || 0);

    if (owed <= 0) {
      bankrolls[pid] = settled;
      postedAntes[pid] = 0;
      activeParticipants.push(pid);
      continue;
    }

    const result = applyBankrollDelta(settled, -owed);
    bankrolls[pid] = result.newBankroll;
    postedAntes[pid] = Math.abs(result.appliedDelta);

    if (result.busted) {
      outIds.push(pid);
      if (
        fundingReasonByPlayer[pid] === "bourre_full_pot_penalty" &&
        owed > Math.abs(result.appliedDelta)
      ) {
        bourreReplacementRemainderByPlayer[pid] = owed - Math.abs(result.appliedDelta);
      }
    } else {
      activeParticipants.push(pid);
    }
  }

  const contributionSum = input.participantIds.reduce(
    (sum, pid) => sum + (postedAntes[pid] ?? 0),
    0,
  );
  const nextPot = Math.max(0, Number(input.carryoverPot) || 0) + contributionSum;

  void buyInFallback;
  return {
    collected: {
      bankrolls,
      postedAntes,
      outIds: [...new Set(outIds)],
      activeParticipants,
    },
    nextPot,
    bourreReplacementRemainderByPlayer,
    fundingContributionByPlayer,
    fundingReasonByPlayer,
  };
}

/**
 * @deprecated Use canonical settleCompletedHand + computeFundingContributionByPlayer.
 */
export function settleHandDeltas({
  mode,
  winners,
  participants,
  tricksByPlayer,
  anteAmount,
  limEnabled = false,
  carryIn = 0,
  stakeForPlayer,
  antePot: antePotOverride,
  splitPotEnabled = false,
}: {
  mode: SettlementMode;
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  anteAmount: number;
  limEnabled?: boolean;
  carryIn?: number;
  stakeForPlayer: (pid: string) => number;
  antePot?: number;
  splitPotEnabled?: boolean;
}) {
  const antePot =
    antePotOverride ??
    participants.reduce((sum, pid) => sum + stakeForPlayer(pid), 0);
  const potState = computeHandPotState({
    anteAmount,
    limEnabled,
    carryIn,
    antePot,
  });
  const bourreIds = bourrePlayerIds(tricksByPlayer, participants);
  const branch = resolveSettlementBranch(mode, winners, splitPotEnabled);

  const stackByPlayer = Object.fromEntries(
    participants.map((pid) => [pid, 100]),
  );
  const phase1 = settleCompletedHand({
    completedHandPot: potState.maxWinThisHand,
    stackByPlayer,
    participants,
    singleWinnerId: branch.singleWinnerId,
    tiedWinnerIds: branch.tiedWinnerIds,
    bourrePlayerIds: bourreIds,
    splitPot: branch.splitPot,
    potCarry: branch.potCarry === true,
    participantOrder: participants,
  });

  const funding = computeFundingContributionByPlayer({
    settledStackByPlayer: phase1.settledStackByPlayer,
    completedHandPot: potState.maxWinThisHand,
    carryoverPot: phase1.carryoverPot,
    anteAmount,
    participantIds: participants,
    bourrePlayerIds: bourreIds,
    tiedWinnerIds: phase1.tiedWinnerIds,
    splitPot: phase1.splitPot,
    tie: phase1.tie,
  });

  const deltas: Record<string, number> = {};
  for (const pid of participants) {
    const payout = phase1.payoutByPlayer[pid] ?? 0;
    const stake = stakeForPlayer(pid);
    deltas[pid] = payout - stake;
    if (bourreIds.includes(pid) && phase1.carryoverPot === 0 && mode === "win") {
      deltas[pid] -= funding.fundingContributionByPlayer[pid] ?? 0;
    }
  }

  const bourreMatch = bourreIds.length * potState.maxWinThisHand;

  return {
    deltas,
    carryOverPot: phase1.carryoverPot,
    bourreIds,
    bourreMatch,
    potState,
    pot: potState.currentPot,
    cappedPot: potState.maxWinThisHand,
    overflow: potState.overflow,
  };
}
