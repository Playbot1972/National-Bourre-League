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
  nextDealFunding: {
    settledPot: number;
    bourreIds: string[];
    byPlayer: Record<string, NextDealFundingFlags>;
  };
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
