/** Plain score row — no Firestore or UI fields required beyond money state. */
export interface ScoreRow {
  bankroll?: number;
  net?: number;
  out?: boolean;
  skipNextAnte?: boolean;
  bourreReplacementDue?: number;
  perHandStake?: number;
  tricksWon?: number;
  handsWon?: number;
  total?: number;
  /** Authoritative next-hand funding amount from nextDealFunding — do not recompute. */
  fundingContribution?: number;
}

export type ScoreById = Record<string, ScoreRow>;

export type SettlementMode =
  | "win"
  | "split"
  | "push"
  | "non_winner_ante_up"
  | "co_win_carry";

export interface HandPotState {
  anteAmount: number;
  limEnabled: boolean;
  potCap: number;
  currentPot: number;
  maxWinThisHand: number;
  winnerTake: number;
  bourrePenalty: number;
  overflow: number;
}

export interface CollectAntesResult {
  bankrolls: Record<string, number>;
  postedAntes: Record<string, number>;
  outIds: string[];
  activeParticipants: string[];
  uncollectedPenalties: number;
  carryIn?: number;
  antePot?: number;
  nextHandPot?: number;
}

export interface SolventSettlementResult {
  appliedDeltas: Record<string, number>;
  bankrolls: Record<string, number>;
  bustedIds: string[];
  outIds: string[];
  carryOverPot: number;
  shortfall: number;
}

export interface NextDealFundingFlags {
  skipNextAnte: boolean;
  bourreReplacementDue: number | null;
  /** Authoritative next-hand contribution — consumer only, do not recompute. */
  fundingContribution?: number;
  fundingReason?:
    | "bourre_full_pot_penalty"
    | "normal_ante"
    | "tie_carry_exempt"
    | "explicit_exempt";
}

export interface NextDealFundingSnapshot {
  completedHandPot: number;
  carryoverPot: number;
  nextPot: number;
  bourrePlayerIds: string[];
  tiedWinnerIds: string[];
  splitPot: boolean;
  tie: boolean;
  fundingContributionByPlayer?: Record<string, number>;
  fundingReasonByPlayer?: Record<string, string>;
  byPlayer: Record<string, NextDealFundingFlags>;
  /** @deprecated Use completedHandPot */
  settledPot?: number;
}

export interface RecordHandSettlementInput {
  mode: SettlementMode;
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  scoreById: ScoreById;
  sessionStake?: number;
  limEnabled?: boolean;
  carryIn?: number;
  postedAntes?: Record<string, number>;
  buyInFallback?: number;
}

export interface RecordHandSettlementResult {
  mode: SettlementMode;
  winners: string[];
  participants: string[];
  bourreIds: string[];
  potState: HandPotState;
  grossPot: number;
  cappedPot: number;
  overflow: number;
  bourreMatch: number;
  nominalDeltas: Record<string, number>;
  appliedDeltas: Record<string, number>;
  carryOverPot: number;
  bankrolls: Record<string, number>;
  bourreRemainders: Record<string, number>;
  scoreById: ScoreById;
  nextDealFunding: NextDealFundingSnapshot;
  solvent: SolventSettlementResult;
  debug: {
    settledPot: number;
    settledHandPot: number;
    carryOverPot: number;
    activePlayers: string[];
    bourrePlayers: string[];
    bourreReplacementDuePersisted: Record<string, number>;
    fundingFlagsRead: Record<string, NextDealFundingFlags>;
  };
}

/** Immutable money event types — every bankroll-affecting action. */
export type MoneyEventType =
  | "BUY_IN_APPLIED"
  | "ANTE_DEDUCTED"
  | "POT_FUNDED"
  | "SETTLEMENT_DEBIT"
  | "WINNER_CREDITED"
  | "BOURRE_LIABILITY"
  | "SPLIT_POT_APPLIED"
  | "REBUY_APPLIED"
  | "NEXT_DEAL_FUNDING"
  | "CARRY_OVER_SET"
  | "ADJUSTMENT_RECONCILIATION";

export type MoneyPhase =
  | "session_start"
  | "ante_collect"
  | "hand_settlement"
  | "rebuy"
  | "next_deal"
  | "session_finalize";

export interface MoneyEvent {
  eventId: string;
  actionId: string;
  handId: string | null;
  phase: MoneyPhase;
  sequence: number;
  type: MoneyEventType;
  playerId: string | null;
  amount: number;
  metadata: Record<string, unknown>;
  timestamp?: number;
}

export interface MoneyLedgerState {
  version: string;
  buyInFallback: number;
  bankrolls: Record<string, number>;
  nets: Record<string, number>;
  carryOverPot: number;
  postedAntes: Record<string, number>;
  scoreFlags: Record<
    string,
    {
      skipNextAnte?: boolean;
      bourreReplacementDue?: number;
      out?: boolean;
      perHandStake?: number;
    }
  >;
  /** Highest sequence applied (monotonic). */
  sequence: number;
}

export interface MoneyEngineResult {
  delta: Record<string, number>;
  newEvents: MoneyEvent[];
  newBankrolls: Record<string, number>;
  carryOverPot: number;
  postedAntes: Record<string, number>;
  invariants: MoneyInvariantReport;
  version: string;
}

export interface MoneyInvariantReport {
  ok: boolean;
  chipTotal: number;
  expectedChipTotal?: number;
  errors: string[];
  warnings: string[];
}

export interface FinalBankrollResult {
  bankrolls: Record<string, number>;
  nets: Record<string, number>;
  carryOverPot: number;
  chipTotal: number;
  invariants: MoneyInvariantReport;
  explanation: string;
}

export const MONEY_ENGINE_VERSION = "v1" as const;
