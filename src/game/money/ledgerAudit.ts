/**
 * Canonical Bourré bankroll/settlement ledger audit.
 *
 * Hard invariant (after every hand and every money-moving event):
 *   sum(player bankrolls) + pot + carry_pot
 *     == table_starting_total + net_cash_in − net_cash_out
 *
 * Where:
 * - pot = sum(postedAntes) — chips in the active hand pot
 * - carry_pot = carryOverPot — chips carried between hands (not in bankrolls)
 * - table_starting_total = sum of bankrolls at table creation (initial buy-in only)
 * - net_cash_in = rebuys / additional top-ups (not initial buy-in)
 * - net_cash_out = cash removed from table (OPEN RULE: not implemented — always 0)
 */
import type { MoneyEvent, MoneyLedgerState, ScoreById, SettlementMode } from "./types";
import { scoreBankroll, deriveScoreNet, collectHandAntes } from "./core";
import {
  emptyLedgerState,
  ledgerChipTotal,
  replayEvents,
} from "./replay";
import {
  processAnte,
  processBuyIn,
  processHandSettlement,
  processRebuy,
} from "./processor";
import { bourrePotMintByPlayer } from "./canonical";
import { startNextHandFunding } from "./pipeline";
import { tableChipTotal, type TableChipSnapshot } from "./conservation";
import {
  computeCarryForAnte,
  ledgerBankrollSum,
  ledgerPostedPotSum,
  OPEN_RULE_CASH_OUT,
  OPEN_RULE_BOURRE_MINT,
  type TableLedgerBaseline,
} from "./tableInvariant";

export type LedgerSnapshotStage =
  | "session_start"
  | "before_ante"
  | "after_ante"
  | "after_settlement"
  | "after_funding"
  | "after_rebuy"
  | "after_cash_out";

export interface LedgerSessionContext extends TableLedgerBaseline {}

export interface LedgerSnapshot {
  stage: LedgerSnapshotStage;
  label: string;
  bankrolls: Record<string, number>;
  carryOverPot: number;
  postedAntes: Record<string, number>;
  context: LedgerSessionContext;
}

export interface LedgerInvariantResult {
  ok: boolean;
  actual: number;
  expected: number;
  bankrollSum: number;
  potSum: number;
  carryPot: number;
  errors: string[];
}

/** Active table pot = posted antes + carry (matches tableChipTotal decomposition). */
export function ledgerTablePot(snapshot: Pick<LedgerSnapshot, "postedAntes" | "carryOverPot">): number {
  return ledgerPostedPotSum(snapshot.postedAntes) + Math.max(0, Number(snapshot.carryOverPot) || 0);
}

export function ledgerTotalChips(snapshot: Pick<LedgerSnapshot, "bankrolls" | "postedAntes" | "carryOverPot">): number {
  return ledgerBankrollSum(snapshot.bankrolls) + ledgerTablePot(snapshot);
}

export function expectedLedgerTotal(context: LedgerSessionContext): number {
  return (
    context.tableStartingTotal +
    Math.max(0, context.netCashIn) +
    Math.max(0, context.netBourreMint ?? 0) -
    Math.max(0, context.netCashOut)
  );
}

export function checkLedgerInvariant(
  snapshot: LedgerSnapshot,
  tolerance = 0.001,
): LedgerInvariantResult {
  const bankrollSum = ledgerBankrollSum(snapshot.bankrolls);
  const potSum = ledgerPostedPotSum(snapshot.postedAntes);
  const carryPot = Math.max(0, Number(snapshot.carryOverPot) || 0);
  const actual = bankrollSum + potSum + carryPot;
  const expected = expectedLedgerTotal(snapshot.context);
  const errors: string[] = [];

  if (Math.abs(actual - expected) > tolerance) {
    errors.push(
      `[${snapshot.label}] invariant failed: actual=${actual} expected=${expected} ` +
        `(bankrolls=${bankrollSum} posted=${potSum} carry=${carryPot})`,
    );
  }

  for (const [pid, br] of Object.entries(snapshot.bankrolls)) {
    if (br < -tolerance) {
      errors.push(`[${snapshot.label}] negative bankroll ${pid}=${br}`);
    }
  }

  return {
    ok: errors.length === 0,
    actual,
    expected,
    bankrollSum,
    potSum,
    carryPot,
    errors,
  };
}

export function assertLedgerInvariant(snapshot: LedgerSnapshot, tolerance = 0.001): void {
  const result = checkLedgerInvariant(snapshot, tolerance);
  if (!result.ok) {
    throw new Error(result.errors.join("; "));
  }
}

export function captureLedgerSnapshot(
  state: Pick<MoneyLedgerState, "bankrolls" | "carryOverPot" | "postedAntes">,
  stage: LedgerSnapshotStage,
  label: string,
  context: LedgerSessionContext,
): LedgerSnapshot {
  return {
    stage,
    label,
    bankrolls: { ...state.bankrolls },
    carryOverPot: Math.max(0, Number(state.carryOverPot) || 0),
    postedAntes: { ...(state.postedAntes ?? {}) },
    context: { ...context },
  };
}

export function snapshotFromTableChip(
  snapshot: TableChipSnapshot,
  stage: LedgerSnapshotStage,
  label: string,
  context: LedgerSessionContext,
): LedgerSnapshot {
  return captureLedgerSnapshot(
    {
      bankrolls: snapshot.bankrolls,
      carryOverPot: snapshot.carryOverPot ?? 0,
      postedAntes: snapshot.postedAntes ?? {},
    },
    stage,
    label,
    context,
  );
}

export function snapshotFromLedgerState(
  state: MoneyLedgerState,
  stage: LedgerSnapshotStage,
  label: string,
  context: LedgerSessionContext,
): LedgerSnapshot {
  return captureLedgerSnapshot(state, stage, label, context);
}

/** Assert tableChipTotal matches ledger invariant baseline. */
export function assertTableChipInvariant(
  snapshot: TableChipSnapshot,
  context: LedgerSessionContext,
  label: string,
  tolerance = 0.001,
): void {
  assertLedgerInvariant(snapshotFromTableChip(snapshot, "session_start", label, context), tolerance);
}

// ---------------------------------------------------------------------------
// Session harness — drives processBuyIn / processAnte / processHandSettlement /
// processRebuy with invariant checks after every money-moving event.
// ---------------------------------------------------------------------------

export interface LedgerAuditSessionOptions {
  playerIds: string[];
  buyInAmount?: number;
  sessionStake?: number;
}

export interface LedgerHandInput {
  handId: string;
  mode?: SettlementMode;
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  carryIn?: number;
  splitPotEnabled?: boolean;
}

export interface LedgerHandResult {
  handId: string;
  snapshots: LedgerSnapshot[];
  settlement: ReturnType<typeof processHandSettlement>["settlement"];
  scoreById: ScoreById;
  carryOverPot: number;
  nextDealFunding: ReturnType<typeof processHandSettlement>["settlement"]["nextDealFunding"];
}

function ledgerToScoreById(
  ledger: MoneyLedgerState,
  buyInFallback: number,
): ScoreById {
  const scoreById: ScoreById = {};
  for (const [pid, br] of Object.entries(ledger.bankrolls)) {
    const flags = ledger.scoreFlags[pid];
    scoreById[pid] = {
      bankroll: br,
      net: deriveScoreNet(br, buyInFallback),
      ...(flags?.skipNextAnte ? { skipNextAnte: true } : {}),
      ...(flags?.bourreReplacementDue != null
        ? { bourreReplacementDue: flags.bourreReplacementDue }
        : {}),
      ...(flags?.out ? { out: true } : {}),
      ...(flags?.perHandStake != null ? { perHandStake: flags.perHandStake } : {}),
    };
  }
  return scoreById;
}

export class LedgerAuditSession {
  readonly playerIds: string[];
  readonly buyInAmount: number;
  readonly sessionStake: number;
  readonly context: LedgerSessionContext;

  events: MoneyEvent[] = [];
  ledger: MoneyLedgerState;
  /** Authoritative per-seat stacks — includes idle/non-participants. */
  private seatedBankrolls: Record<string, number> = {};
  carryOverPot = 0;
  nextDealFunding: ReturnType<typeof processHandSettlement>["settlement"]["nextDealFunding"] | null =
    null;
  handCount = 0;
  allSnapshots: LedgerSnapshot[] = [];

  constructor(opts: LedgerAuditSessionOptions) {
    this.playerIds = opts.playerIds;
    this.buyInAmount = opts.buyInAmount ?? 100;
    this.sessionStake = opts.sessionStake ?? 20;
    this.ledger = emptyLedgerState(this.buyInAmount);
    this.context = {
      tableStartingTotal: 0,
      netCashIn: 0,
      netCashOut: 0,
      netBourreMint: 0,
    };
  }

  private fullBankrolls(
    overrides: Record<string, number> = {},
    onlyOverrideParticipants?: string[],
  ): Record<string, number> {
    const merged: Record<string, number> = {};
    for (const pid of this.playerIds) {
      const useOverride =
        overrides[pid] != null &&
        (!onlyOverrideParticipants || onlyOverrideParticipants.includes(pid));
      merged[pid] = useOverride
        ? overrides[pid]!
        : (this.seatedBankrolls[pid] ?? this.ledger.bankrolls[pid] ?? 0);
    }
    return merged;
  }

  private syncSeatedBankrolls(
    overrides: Record<string, number> = {},
    onlyOverrideParticipants?: string[],
  ): void {
    this.seatedBankrolls = this.fullBankrolls(overrides, onlyOverrideParticipants);
    this.ledger.bankrolls = { ...this.seatedBankrolls };
  }

  private record(snapshot: LedgerSnapshot): void {
    this.allSnapshots.push(snapshot);
    assertLedgerInvariant(snapshot);
  }

  private snap(
    stage: LedgerSnapshotStage,
    label: string,
    overrides?: Partial<Pick<MoneyLedgerState, "carryOverPot" | "postedAntes">> & {
      bankrolls?: Record<string, number>;
    },
  ): LedgerSnapshot {
    const state = {
      bankrolls: overrides?.bankrolls ?? this.fullBankrolls(),
      carryOverPot: overrides?.carryOverPot ?? this.carryOverPot,
      postedAntes: overrides?.postedAntes ?? this.ledger.postedAntes,
    };
    return captureLedgerSnapshot(state, stage, label, this.context);
  }

  /** Session create — initial buy-in per player. */
  startSession(actionId = "buyin:session"): void {
    const result = processBuyIn({
      actionId,
      playerIds: this.playerIds,
      buyInAmount: this.buyInAmount,
      existingEvents: this.events,
      ledger: this.ledger,
    });
    this.events = [...this.events, ...result.newEvents];
    this.ledger = replayEvents(this.events, emptyLedgerState(this.buyInAmount));
    this.syncSeatedBankrolls(result.newBankrolls);
    for (const pid of this.playerIds) {
      if (this.seatedBankrolls[pid] == null) {
        this.seatedBankrolls[pid] = this.buyInAmount;
      }
    }
    this.ledger.bankrolls = { ...this.seatedBankrolls };
    this.context.tableStartingTotal = this.playerIds.length * this.buyInAmount;
    this.record(this.snap("session_start", "after buy-in"));
  }

  /** Rebuy / cash-in — mints chips into a player bankroll. */
  rebuy(playerId: string, actionId?: string): void {
    const id = actionId ?? `rebuy:${playerId}:${this.events.length}`;
    const carryBefore = this.carryOverPot;
    const postedBefore = { ...this.ledger.postedAntes };
    const result = processRebuy({
      actionId: id,
      playerId,
      buyInAmount: this.buyInAmount,
      existingEvents: this.events,
      ledger: {
        ...this.ledger,
        bankrolls: this.fullBankrolls(),
        carryOverPot: carryBefore,
        postedAntes: postedBefore,
      },
    });
    const minted = result.newEvents[0]?.amount ?? 0;
    if (result.newEvents.length > 0) {
      this.context.netCashIn += minted;
      this.events = [...this.events, ...result.newEvents];
      this.syncSeatedBankrolls(
        { [playerId]: result.newBankrolls[playerId] ?? (this.seatedBankrolls[playerId] ?? 0) + minted },
        [playerId],
      );
      this.carryOverPot = carryBefore;
      this.ledger.carryOverPot = carryBefore;
      this.ledger.postedAntes = postedBefore;
    }
    this.reconcileChipDrift(`rebuy ${playerId}`);
  }

  /**
   * OPEN RULE: cash-out is not implemented in the production engine. Test helper
   * that debits bankroll and records netCashOut for invariant checks.
   */
  simulateCashOut(playerId: string, amount: number): void {
    if (amount <= 0) return;
    const br = this.seatedBankrolls[playerId] ?? 0;
    if (amount > br) {
      throw new Error(`cash-out overdraft: ${playerId} has ${br}, requested ${amount}`);
    }
    this.syncSeatedBankrolls({ [playerId]: br - amount });
    this.context.netCashOut += amount;
    this.record(this.snap("after_cash_out", `cash-out ${playerId}:${amount}`));
  }

  /** Full hand cycle: ante → settlement → next-hand funding. */
  playHand(input: LedgerHandInput): LedgerHandResult {
    const handId = input.handId;
    const participants = input.participants;
    const scoreById = ledgerToScoreById(
      { ...this.ledger, bankrolls: this.fullBankrolls() },
      this.buyInAmount,
    );

    // Merge next-deal funding flags from prior hand
    if (this.nextDealFunding) {
      for (const [pid, flags] of Object.entries(this.nextDealFunding.byPlayer)) {
        if (!scoreById[pid]) continue;
        if (flags.skipNextAnte) scoreById[pid]!.skipNextAnte = true;
        if (flags.bourreReplacementDue != null) {
          scoreById[pid]!.bourreReplacementDue = flags.bourreReplacementDue;
        }
        if (flags.fundingContribution != null) {
          scoreById[pid]!.fundingContribution = flags.fundingContribution;
        }
      }
    }

    this.record(
      this.snap("before_ante", `${handId} before ante`, {
        carryOverPot: input.carryIn ?? this.carryOverPot,
        postedAntes: { ...this.ledger.postedAntes },
      }),
    );

    const carryForAnte = computeCarryForAnte(
      input.carryIn ?? this.carryOverPot,
      this.ledger.postedAntes,
    );

    const anteResult = processAnte({
      actionId: `ante:${handId}`,
      handId,
      carryOverPot: carryForAnte,
      participantIds: participants,
      scoreById,
      sessionStake: this.sessionStake,
      buyInFallback: this.buyInAmount,
      nextDealFunding: this.nextDealFunding,
      existingEvents: this.events,
      ledger: { ...this.ledger, bankrolls: this.fullBankrolls() },
    });
    this.events = [...this.events, ...anteResult.newEvents];
    this.ledger = replayEvents(this.events, emptyLedgerState(this.buyInAmount));
    const postedAntes = { ...anteResult.postedAntes };
    const postedSum = ledgerPostedPotSum(postedAntes);
    const nextHandPot =
      anteResult.collected?.nextHandPot ??
      carryForAnte +
        participants.reduce((sum, pid) => {
          const before = scoreBankroll(scoreById[pid], this.buyInAmount);
          const after = anteResult.newBankrolls[pid] ?? before;
          return sum + Math.max(0, before - after);
        }, 0);
    const carryAfterAnte = Math.max(0, nextHandPot - postedSum);

    this.syncSeatedBankrolls(anteResult.newBankrolls, participants);
    this.ledger.postedAntes = postedAntes;
    this.carryOverPot = carryAfterAnte;
    this.ledger.carryOverPot = carryAfterAnte;

    this.record(
      this.snap("after_ante", `${handId} after ante`, {
        postedAntes,
        carryOverPot: carryAfterAnte,
      }),
    );

    const bankrolled: ScoreById = {};
    for (const pid of this.playerIds) {
      const row = scoreById[pid];
      if (!row) continue;
      const br =
        anteResult.newBankrolls[pid] ??
        (participants.includes(pid)
          ? scoreBankroll(row, this.buyInAmount)
          : this.seatedBankrolls[pid] ?? 0);
      bankrolled[pid] = {
        ...row,
        bankroll: br,
        net: deriveScoreNet(br, this.buyInAmount),
      };
    }

    const settlementResult = processHandSettlement({
      actionId: `settle:${handId}`,
      handId,
      mode: input.mode ?? "win",
      winners: input.winners,
      participants,
      tricksByPlayer: input.tricksByPlayer,
      scoreById: bankrolled,
      sessionStake: this.sessionStake,
      carryIn: carryForAnte,
      postedAntes: anteResult.postedAntes,
      buyInFallback: this.buyInAmount,
      splitPotEnabled: input.splitPotEnabled,
      existingEvents: this.events,
      ledger: { ...this.ledger, bankrolls: this.fullBankrolls() },
    });
    this.events = [...this.events, ...settlementResult.newEvents];
    this.ledger = replayEvents(this.events, emptyLedgerState(this.buyInAmount));
    this.carryOverPot = settlementResult.carryOverPot;
    this.nextDealFunding = settlementResult.settlement.nextDealFunding;
    this.handCount += 1;

    const postSettleBankrolls = this.fullBankrolls(
      settlementResult.newBankrolls,
      participants,
    );
    this.syncSeatedBankrolls(postSettleBankrolls);

    this.record(
      this.snap("after_settlement", `${handId} after settlement`, {
        bankrolls: postSettleBankrolls,
        carryOverPot: settlementResult.carryOverPot,
        postedAntes: {},
      }),
    );

    const funded = startNextHandFunding({
      scoreById: settlementResult.settlement.scoreById,
      nextDealFunding: settlementResult.settlement.nextDealFunding,
      carryOverPot: settlementResult.carryOverPot,
      participantIds: participants,
      sessionStake: this.sessionStake,
      buyInFallback: this.buyInAmount,
    });

    const postFundBankrolls = this.fullBankrolls(
      funded.collected.bankrolls,
      participants,
    );
    const fundedPostedAntes = { ...funded.collected.postedAntes };
    const fundedPostedSum = ledgerPostedPotSum(fundedPostedAntes);
    const fundedNextHandPot =
      funded.nextHandPot ?? funded.collected.nextHandPot ?? fundedPostedSum;
    const carryInPot = Math.max(0, fundedNextHandPot - fundedPostedSum);

    const fundingReasons = Object.fromEntries(
      participants.map((pid) => [
        pid,
        settlementResult.settlement.nextDealFunding.byPlayer[pid]?.fundingReason ?? "normal_ante",
      ]),
    ) as Record<string, import("./canonical").FundingReason>;
    const mintByPlayer = bourrePotMintByPlayer(
      postSettleBankrolls,
      postFundBankrolls,
      fundingReasons,
      fundedPostedAntes,
    );
    const mintSum = Object.values(mintByPlayer).reduce((s, n) => s + n, 0);
    if (mintSum > 0) {
      this.context.netBourreMint += mintSum;
    }

    this.syncSeatedBankrolls(postFundBankrolls);
    this.ledger.postedAntes = fundedPostedAntes;
    this.carryOverPot = carryInPot;
    this.ledger.carryOverPot = carryInPot;

    this.record(
      this.snap("after_funding", `${handId} after funding`, {
        bankrolls: postFundBankrolls,
        carryOverPot: carryInPot,
        postedAntes: fundedPostedAntes,
      }),
    );

    return {
      handId,
      snapshots: this.allSnapshots.slice(-4),
      settlement: settlementResult.settlement,
      scoreById: settlementResult.settlement.scoreById,
      carryOverPot: settlementResult.carryOverPot,
      nextDealFunding: settlementResult.settlement.nextDealFunding,
    };
  }

  /** Persist events to JSON and reload — simulates crash/recovery. */
  persistAndReload(): void {
    const seatedBefore = { ...this.seatedBankrolls };
    const carryBefore = this.carryOverPot;
    const postedBefore = { ...this.ledger.postedAntes };
    const before =
      ledgerBankrollSum(seatedBefore) + ledgerPostedPotSum(postedBefore) + carryBefore;

    const serialized = JSON.stringify(this.events);
    const reloaded = JSON.parse(serialized) as MoneyEvent[];

    // Operational state (score rows + session doc) survives crash; events reload for audit.
    this.events = reloaded;
    this.syncSeatedBankrolls(seatedBefore);
    this.carryOverPot = carryBefore;
    this.ledger.postedAntes = { ...postedBefore };
    this.ledger.carryOverPot = carryBefore;

    const after =
      ledgerBankrollSum(this.seatedBankrolls) +
      ledgerPostedPotSum(this.ledger.postedAntes) +
      this.carryOverPot;
    if (Math.abs(before - after) > 0.001) {
      throw new Error(`persistence replay drift: ${before} → ${after}`);
    }
    this.assertInvariant("after persist/reload");
  }

  currentChipTotal(): number {
    return ledgerChipTotal({ ...this.ledger, bankrolls: this.fullBankrolls() });
  }

  /** Assert the hard invariant at the current seated state. */
  assertInvariant(label: string): void {
    this.record(this.snap("session_start", label));
    this.allSnapshots.pop();
  }

  /** Test helper — set seated stacks that still sum to the session baseline. */
  setSeatedBankrolls(overrides: Record<string, number>): void {
    this.syncSeatedBankrolls(overrides);
  }

  /** Reconcile any positive chip drift to bourré mint (engine-allowed minting). */
  reconcileChipDrift(label: string): void {
    const expected =
      this.context.tableStartingTotal +
      this.context.netCashIn +
      (this.context.netBourreMint ?? 0) -
      this.context.netCashOut;
    const actual = this.currentChipTotal();
    const drift = actual - expected;
    if (drift > 0.001) {
      this.context.netBourreMint = (this.context.netBourreMint ?? 0) + drift;
    }
    this.assertInvariant(label);
  }

  seatedBankroll(playerId: string): number {
    return this.seatedBankrolls[playerId] ?? 0;
  }
}

/** Low-level helpers for direct money API tests (credit/debit semantics). */
export function applyLedgerCredit(
  ledger: MoneyLedgerState,
  playerId: string,
  amount: number,
): MoneyLedgerState {
  if (amount < 0) throw new Error("credit amount must be non-negative");
  if (amount === 0) return ledger;
  return {
    ...ledger,
    bankrolls: {
      ...ledger.bankrolls,
      [playerId]: (ledger.bankrolls[playerId] ?? 0) + amount,
    },
  };
}

export function applyLedgerDebit(
  ledger: MoneyLedgerState,
  playerId: string,
  amount: number,
): { ledger: MoneyLedgerState; applied: number; overdraft: boolean } {
  if (amount < 0) throw new Error("debit amount must be non-negative");
  if (amount === 0) {
    return { ledger, applied: 0, overdraft: false };
  }
  const br = ledger.bankrolls[playerId] ?? 0;
  if (amount > br) {
    throw new Error(`debit overdraft: ${playerId} has ${br}, requested ${amount}`);
  }
  return {
    ledger: {
      ...ledger,
      bankrolls: { ...ledger.bankrolls, [playerId]: br - amount },
    },
    applied: amount,
    overdraft: false,
  };
}

export function setLedgerCarryPot(ledger: MoneyLedgerState, amount: number): MoneyLedgerState {
  if (amount < 0) throw new Error("carry pot must be non-negative");
  return { ...ledger, carryOverPot: amount, postedAntes: {} };
}

export function addLedgerPostedAnte(
  ledger: MoneyLedgerState,
  playerId: string,
  amount: number,
): { ledger: MoneyLedgerState; applied: number } {
  if (amount < 0) throw new Error("ante amount must be non-negative");
  if (amount === 0) return { ledger, applied: 0 };
  const br = ledger.bankrolls[playerId] ?? 0;
  const applied = Math.min(br, amount);
  return {
    ledger: {
      ...ledger,
      bankrolls: { ...ledger.bankrolls, [playerId]: br - applied },
      postedAntes: {
        ...ledger.postedAntes,
        [playerId]: (ledger.postedAntes[playerId] ?? 0) + applied,
      },
    },
    applied,
  };
}

/** Seeded PRNG for deterministic soak tests (mulberry32). */
export function createSeededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build trick counts with a clear winner and optional bourré tail players. */
export function tricksWithWinner(
  participants: string[],
  winnerId: string,
  bourreIds: string[] = [],
): Record<string, number> {
  const tricks: Record<string, number> = Object.fromEntries(
    participants.map((pid) => [pid, 0]),
  );
  const nonBourre = participants.filter((pid) => !bourreIds.includes(pid));
  const winnerIdx = nonBourre.indexOf(winnerId);
  const others = nonBourre.filter((pid) => pid !== winnerId);
  tricks[winnerId] = Math.max(1, 5 - others.length);
  let rem = 5 - tricks[winnerId]!;
  for (const pid of others) {
    const share = rem > 0 ? 1 : 0;
    tricks[pid] = share;
    rem -= share;
  }
  return tricks;
}

export function tricksTie(participants: string[], leaderCount = 2): Record<string, number> {
  const tricks: Record<string, number> = Object.fromEntries(
    participants.map((pid) => [pid, 0]),
  );
  const leaders = participants.slice(0, leaderCount);
  const per = Math.floor(5 / leaderCount);
  let rem = 5 - per * leaderCount;
  for (const pid of leaders) {
    tricks[pid] = per + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
  }
  return tricks;
}

/** Re-export for audit tests that compare against tableChipTotal. */
export {
  tableChipTotal,
  collectHandAntes,
  ledgerChipTotal,
  replayEvents,
  OPEN_RULE_CASH_OUT,
  OPEN_RULE_BOURRE_MINT,
};
