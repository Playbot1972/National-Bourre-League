/**
 * Canonical Bourré settlement rules (Pagat base + NBL house options).
 *
 * Single authoritative money lifecycle — all paths must route through:
 *   collectFundingForHandStart → play → recordHandSettlement → startNextHandFunding
 *
 * ─── LIFECYCLE ───────────────────────────────────────────────────────────────
 *
 * 1. SESSION BUY-IN (`processBuyIn`)
 *    Each seated player receives `buyInAmount` chips. Total chips = N × buy-in.
 *
 * 2. HAND ENROLLMENT / "I'M OUT"
 *    - Pre-deal enrollment pass: `declinedIds` — player sits out, no ante.
 *    - Pagat decision pass: `passedIds` — player folds before play, no ante.
 *    - Draw fold: `applyDrawFold` — forfeits posted ante, leaves hand.
 *    - Only `participantIds` who stayed in are charged antes and appear in settlement.
 *    - Minimum 2 active participants to deal; solo survivor wins carry + posted antes.
 *
 * 3. ANTE COLLECTION (`collectFundingForHandStart` / `processAnte`)
 *    - Collected at **deal start**, not at settlement.
 *    - `nextHandPot = carryOverPot + Σ fundingContribution` from prior settlement flags.
 *    - Normal players: `normal_ante` (= session handStake).
 *    - Bourré from prior hand: `bourre_full_pot_penalty` (= completedHandPot), skips normal ante.
 *    - Tie carry winners: `tie_carry_exempt` (0) when splitPot is off.
 *    - Bust: player pays remaining stack, marked `out`, remainder deferred as bourreReplacementDue.
 *
 * 4. HAND PLAY
 *    Five tricks among active participants. Trick counts on `tricksByPlayer`.
 *
 * 5. HAND WINNER(S)
 *    - Plurality of tricks wins; co-leaders require vote (split) or default carry.
 *    - `bourrePlayerIds`: active participants with 0 tricks after 5 tricks played.
 *
 * 6. PHASE 1 SETTLEMENT (`settleCompletedHand`)
 *    - Single winner: award `completedHandPot` (carryIn + posted antes, LmT-capped).
 *    - Tie + splitPot off: **carry** — pot stays on table (`carryoverPot = completedHandPot`).
 *    - Tie + splitPot on (mode `split`): divide pot among tied winners (seat-order remainder).
 *    - Bourré penalties are NOT deducted in Phase 1.
 *
 * 7. PHASE 2 NEXT-HAND FUNDING (`computeFundingContributionByPlayer` + `applyFundingWithSolvency`)
 *    - Exactly one contribution per participant: bourré pot match OR normal ante OR exempt.
 *    - `nextDealFunding` snapshot persisted on session; merged at deal via `mergeNextDealFundingIntoScoreById`.
 *    - Rebuy (`computeRebuyContributions`) restores bankroll only — never funds the pot.
 *
 * 8. ELIMINATION / REBUY
 *    - `bankroll <= 0` → `out: true`, excluded from future antes unless rebuy restores stack.
 *    - `rebuyEnabled` + session buy-in: explicit top-up via `processRebuy` (mints chips).
 *    - Play continues until one solvent player holds all chips (or session manually finalized).
 *
 * 9. CHIP CONSERVATION
 *    - Settlement + funding are zero-sum (bankrolls + table pot unchanged).
 *    - Only rebuy (and initial buy-in) may increase total chips.
 *
 * ─── SETTLEMENT MODES ────────────────────────────────────────────────────────
 *
 * | mode               | Phase 1              | Phase 2 (non-bourré losers)      |
 * |--------------------|----------------------|----------------------------------|
 * | win                | sole winner takes pot| normal ante                      |
 * | split              | divide among ties    | all active ante (incl. co-winners)|
 * | push / co_win_carry| carry full pot       | non-winners ante; tie leaders exempt |
 * | non_winner_ante_up | carry full pot       | non-winners ante; tie leaders exempt |
 */

import type { ScoreById, SettlementMode } from "./types";
import {
  bourrePlayerIds,
  canEnrollWithBankroll,
  deriveScoreNet,
  scoreBankroll,
  sessionChipTotal,
} from "./core";
import {
  resolveSettlementBranch,
  type FundingReason,
} from "./canonical";
import {
  collectFundingForHandStart,
  recordHandSettlement,
  runHandMoneyFlow,
  type StartNextHandFundingInput,
} from "./pipeline";
import type { RecordHandSettlementInput, RecordHandSettlementResult } from "./types";

export type { FundingReason };

/** Stages in the canonical money lifecycle (for logging / tests). */
export const SETTLEMENT_STAGES = [
  "session_buy_in",
  "hand_enrollment",
  "ante_collect",
  "hand_play",
  "phase1_settlement",
  "phase2_next_funding",
  "rebuy_or_elimination",
  "session_finalize",
] as const;

export type SettlementStage = (typeof SETTLEMENT_STAGES)[number];

export interface HandSettlementSpec {
  mode: SettlementMode;
  winners: string[];
  /** Active hand participants (excludes I'm Out / passed / folded). */
  participants: string[];
  tricksByPlayer: Record<string, number>;
  splitPotEnabled?: boolean;
}

export interface SettlementLifecycleInput extends RecordHandSettlementInput {
  splitPotEnabled?: boolean;
}

export interface SettlementLifecycleResult {
  settlement: RecordHandSettlementResult;
  deal: ReturnType<typeof collectFundingForHandStart>;
  bourreIds: string[];
  chipTotalAfterSettlement: number;
  chipTotalAfterFunding: number;
}

/** Resolve bourré ids and settlement branch from hand outcome + room settings. */
export function resolveHandOutcome(input: HandSettlementSpec): {
  bourreIds: string[];
  branch: ReturnType<typeof resolveSettlementBranch>;
} {
  const bourreIds = bourrePlayerIds(input.tricksByPlayer, input.participants);
  const branch = resolveSettlementBranch(
    input.mode,
    input.winners,
    input.splitPotEnabled === true,
  );
  return { bourreIds, branch };
}

/**
 * Full settle → next-deal funding cycle for one completed hand.
 * Antes for this hand must already be in `postedAntes` / bankrolls.
 */
export function runSettlementLifecycle(
  input: SettlementLifecycleInput,
): SettlementLifecycleResult {
  const settlement = recordHandSettlement(input);
  const deal = collectFundingForHandStart({
    scoreById: settlement.scoreById,
    nextDealFunding: settlement.nextDealFunding,
    carryOverPot: settlement.carryOverPot,
    participantIds: input.participants,
    sessionStake: input.sessionStake ?? 1,
    buyInFallback: input.buyInFallback ?? 100,
  } satisfies StartNextHandFundingInput);

  const buyIn = input.buyInFallback ?? 100;
  const chipTotalAfterSettlement = sessionChipTotal(
    Object.fromEntries(
      input.participants.map((pid) => [
        pid,
        { bankroll: settlement.bankrolls[pid] ?? scoreBankroll(settlement.scoreById[pid], buyIn) },
      ]),
    ),
    { carryOverPot: settlement.carryOverPot, postedAntes: {}, buyInFallback: buyIn },
  );
  const chipTotalAfterFunding = sessionChipTotal(
    Object.fromEntries(
      input.participants.map((pid) => [
        pid,
        { bankroll: deal.bankrolls[pid] ?? 0 },
      ]),
    ),
    {
      carryOverPot: 0,
      postedAntes: deal.postedAntes,
      nextHandPot: deal.nextHandPot,
      buyInFallback: buyIn,
    },
  );

  return {
    settlement,
    deal,
    bourreIds: settlement.bourreIds,
    chipTotalAfterSettlement,
    chipTotalAfterFunding,
  };
}

/** Convenience: settle + fund next hand (alias). */
export const runHandSettlementCycle = runSettlementLifecycle;

/** Players with chips who can still enroll. */
export function solventPlayerIds(
  scoreById: ScoreById,
  playerIds: string[],
  buyInFallback = 100,
): string[] {
  return playerIds.filter((pid) => {
    const row = scoreById[pid];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyInFallback));
  });
}

/** True when exactly one solvent player remains — play-to-zero endgame. */
export function isSoleSurvivor(
  scoreById: ScoreById,
  playerIds: string[],
  buyInFallback = 100,
): { ended: boolean; winnerId: string | null } {
  const solvent = solventPlayerIds(scoreById, playerIds, buyInFallback);
  if (solvent.length === 1) {
    return { ended: true, winnerId: solvent[0] };
  }
  return { ended: false, winnerId: null };
}

/** Apply post-funding bankrolls to score rows (test helper). */
export function scoreByIdAfterFunding(
  prior: ScoreById,
  bankrolls: Record<string, number>,
  buyInFallback: number,
  outIds: string[] = [],
): ScoreById {
  const next: ScoreById = { ...prior };
  for (const [pid, br] of Object.entries(bankrolls)) {
    const row = { ...(next[pid] || {}) };
    row.bankroll = Math.max(0, br);
    row.net = deriveScoreNet(row.bankroll, buyInFallback);
    if (outIds.includes(pid) || row.bankroll <= 0) {
      row.out = true;
    } else {
      delete row.out;
    }
    delete row.skipNextAnte;
    delete row.bourreReplacementDue;
    delete row.fundingContribution;
    next[pid] = row;
  }
  return next;
}

export { runHandMoneyFlow, recordHandSettlement, collectFundingForHandStart };
