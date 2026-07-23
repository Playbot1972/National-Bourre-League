/**
 * Deterministic bankroll/settlement audit helpers.
 * Reconciles per-hand deltas: start + antes + payouts + carry + funding.
 */
import type { ScoreById, SettlementMode } from "./types";
import {
  collectFundingForHandStart,
  runHandMoneyFlow,
} from "./pipeline";
import {
  bourrePlayerIds,
  buildSoloWinSettlement,
  collectHandAntes,
  deriveScoreNet,
  scoreBankroll,
  sessionChipTotal,
} from "./core";
import { tableChipTotal, type TableChipSnapshot } from "./conservation";
import type { RecordHandSettlementResult } from "./types";

export const SETTLEMENT_AUDIT_DEBUG =
  (typeof process !== "undefined" && process.env?.BOURRE_SETTLEMENT_AUDIT === "1") || false;

export interface AuditPlayerRow {
  playerId: string;
  bankrollStart: number;
  postedAnte: number;
  bankrollAfterAnte: number;
  tricks: number;
  isWinner: boolean;
  isBourre: boolean;
  payout: number;
  bankrollAfterSettlement: number;
  settlementDelta: number;
  fundingContribution: number;
  fundingReason: string | null;
  bankrollAfterFunding: number;
  fundingDelta: number;
  netDelta: number;
}

export interface SettlementAuditReport {
  scenarioId: string;
  playerCount: number;
  mode: SettlementMode;
  participants: string[];
  winners: string[];
  ok: boolean;
  errors: string[];
  carryIn: number;
  potBefore: number;
  potAfterSettlement: number;
  potAfterFunding: number;
  chipTotalBefore: number;
  chipTotalAfterSettlement: number;
  chipTotalAfterFunding: number;
  players: AuditPlayerRow[];
  settlement: RecordHandSettlementResult;
}

export interface RunSettlementAuditInput {
  scenarioId: string;
  mode?: SettlementMode;
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  scoreById: ScoreById;
  buyInFallback?: number;
  sessionStake?: number;
  carryIn?: number;
  splitPotEnabled?: boolean;
  /** All seated player ids (includes idle non-participants). */
  allPlayerIds?: string[];
}

function potFromSnapshot(snapshot: TableChipSnapshot): number {
  return (
    Math.max(0, Number(snapshot.carryOverPot) || 0) +
    Object.values(snapshot.postedAntes ?? {}).reduce(
      (sum, raw) => sum + Math.max(0, Number(raw) || 0),
      0,
    )
  );
}

function reconcilePlayerDelta(
  row: AuditPlayerRow,
  errors: string[],
  tolerance = 0.001,
): void {
  const expectedSettlement = row.payout;
  if (Math.abs(row.settlementDelta - expectedSettlement) > tolerance) {
    errors.push(
      `${row.playerId}: settlement delta ${row.settlementDelta} !== payout ${expectedSettlement}`,
    );
  }
  const expectedFunding =
    row.bankrollAfterSettlement - row.fundingContribution - row.bankrollAfterFunding;
  if (Math.abs(expectedFunding) > tolerance) {
    errors.push(
      `${row.playerId}: funding ${row.fundingContribution} does not reconcile (${row.bankrollAfterSettlement} → ${row.bankrollAfterFunding})`,
    );
  }
  const expectedNet =
    row.bankrollAfterFunding - row.bankrollStart;
  if (Math.abs(row.netDelta - expectedNet) > tolerance) {
    errors.push(
      `${row.playerId}: net delta ${row.netDelta} !== end-start ${expectedNet}`,
    );
  }
}

/** Run one hand through fund → settle → next-fund and reconcile all deltas. */
export function runSettlementAudit(input: RunSettlementAuditInput): SettlementAuditReport {
  const buyIn = input.buyInFallback ?? 100;
  const stake = input.sessionStake ?? 20;
  const carryIn = input.carryIn ?? 0;
  const mode = input.mode ?? "win";
  const allIds = input.allPlayerIds ?? input.participants;
  const errors: string[] = [];

  const bankrollStart: Record<string, number> = {};
  for (const pid of allIds) {
    bankrollStart[pid] = scoreBankroll(input.scoreById[pid], buyIn);
  }

  const collected = collectHandAntes({
    participants: input.participants,
    scoreById: input.scoreById,
    buyInFallback: buyIn,
    stakeForPlayer: () => stake,
  });

  const postedAntes = collected.postedAntes;
  const bankrolled: ScoreById = { ...input.scoreById };
  for (const pid of input.participants) {
    const br = collected.bankrolls[pid] ?? scoreBankroll(input.scoreById[pid], buyIn);
    bankrolled[pid] = { ...bankrolled[pid], bankroll: br, net: deriveScoreNet(br, buyIn) };
  }

  const beforeSnapshot: TableChipSnapshot = {
    bankrolls: { ...bankrollStart },
    carryOverPot: carryIn,
    postedAntes: {},
  };
  const afterAnteSnapshot: TableChipSnapshot = {
    bankrolls: Object.fromEntries(
      allIds.map((pid) => [
        pid,
        input.participants.includes(pid)
          ? (collected.bankrolls[pid] ?? bankrollStart[pid])
          : bankrollStart[pid],
      ]),
    ),
    carryOverPot: carryIn,
    postedAntes,
  };

  const chipTotalBefore = tableChipTotal(beforeSnapshot);
  const potBefore = potFromSnapshot(afterAnteSnapshot);

  const flow = runHandMoneyFlow({
    mode,
    winners: input.winners,
    participants: input.participants,
    tricksByPlayer: input.tricksByPlayer,
    scoreById: bankrolled,
    sessionStake: stake,
    carryIn,
    postedAntes,
    buyInFallback: buyIn,
    splitPotEnabled: input.splitPotEnabled,
  });

  const settlement = flow.settlement;
  const deal = flow.deal.collected;
  const bourreIds = bourrePlayerIds(input.tricksByPlayer, input.participants);

  const afterSettlementSnapshot: TableChipSnapshot = {
    bankrolls: Object.fromEntries(
      allIds.map((pid) => [
        pid,
        input.participants.includes(pid)
          ? (settlement.bankrolls[pid] ?? scoreBankroll(bankrolled[pid], buyIn))
          : bankrollStart[pid],
      ]),
    ),
    carryOverPot: settlement.carryOverPot,
    postedAntes: {},
  };

  const afterFundingBankrolls = Object.fromEntries(
    allIds.map((pid) => [
      pid,
      input.participants.includes(pid)
        ? (deal.bankrolls[pid] ?? afterSettlementSnapshot.bankrolls[pid] ?? 0)
        : bankrollStart[pid],
    ]),
  );

  const afterFundingSnapshot: TableChipSnapshot = {
    bankrolls: afterFundingBankrolls,
    carryOverPot: 0,
    postedAntes: deal.postedAntes ?? {},
  };
  const nextHandPot =
    flow.deal.nextHandPot ??
    (deal.carryIn ?? 0) +
      Object.values(deal.postedAntes ?? {}).reduce(
        (sum, raw) => sum + Math.max(0, Number(raw) || 0),
        0,
      );

  const chipTotalAfterSettlement = tableChipTotal(afterSettlementSnapshot);
  const chipTotalAfterFunding =
    Object.values(afterFundingBankrolls).reduce((s, n) => s + n, 0) + nextHandPot;
  const potAfterSettlement = potFromSnapshot(afterSettlementSnapshot);
  const potAfterFunding = nextHandPot;

  if (Math.abs(chipTotalAfterSettlement - chipTotalBefore) > 0.001) {
    errors.push(
      `settlement not zero-sum: chips ${chipTotalBefore} → ${chipTotalAfterSettlement}`,
    );
  }
  if (Math.abs(chipTotalAfterFunding - chipTotalBefore) > 0.001) {
    errors.push(
      `full cycle not zero-sum: chips ${chipTotalBefore} → ${chipTotalAfterFunding}`,
    );
  }
  if (Math.abs(potAfterSettlement + Object.values(afterSettlementSnapshot.bankrolls).reduce((s, n) => s + n, 0) - chipTotalAfterSettlement) > 0.001) {
    errors.push("potAfterSettlement does not reconcile with chip total");
  }

  const players: AuditPlayerRow[] = input.participants.map((pid) => {
    const brAfterAnte = collected.bankrolls[pid] ?? bankrollStart[pid];
    const brAfterSettle = settlement.bankrolls[pid] ?? brAfterAnte;
    const brAfterFund = deal.bankrolls[pid] ?? brAfterSettle;
    const funding = settlement.nextDealFunding.byPlayer[pid];
    const payout = settlement.appliedDeltas[pid] ?? brAfterSettle - brAfterAnte;
    const row: AuditPlayerRow = {
      playerId: pid,
      bankrollStart: bankrollStart[pid] ?? buyIn,
      postedAnte: postedAntes[pid] ?? 0,
      bankrollAfterAnte: brAfterAnte,
      tricks: input.tricksByPlayer[pid] ?? 0,
      isWinner: input.winners.includes(pid),
      isBourre: bourreIds.includes(pid),
      payout,
      bankrollAfterSettlement: brAfterSettle,
      settlementDelta: brAfterSettle - brAfterAnte,
      fundingContribution: deal.postedAntes[pid] ?? funding?.fundingContribution ?? 0,
      fundingReason: funding?.fundingReason ?? null,
      bankrollAfterFunding: brAfterFund,
      fundingDelta: brAfterFund - brAfterSettle,
      netDelta: brAfterFund - (bankrollStart[pid] ?? buyIn),
    };
    reconcilePlayerDelta(row, errors);
    return row;
  });

  const report: SettlementAuditReport = {
    scenarioId: input.scenarioId,
    playerCount: input.participants.length,
    mode,
    participants: input.participants,
    winners: input.winners,
    ok: errors.length === 0,
    errors,
    carryIn,
    potBefore,
    potAfterSettlement,
    potAfterFunding,
    chipTotalBefore,
    chipTotalAfterSettlement,
    chipTotalAfterFunding,
    players,
    settlement,
  };

  if (SETTLEMENT_AUDIT_DEBUG) {
    console.info("[settlement-audit]", formatSettlementAuditTrace(report));
  }

  return report;
}

/** Audit prefunded solo-win path (decision pass / draw fold). */
export function runSoloWinAudit(input: {
  scenarioId: string;
  winnerId: string;
  participants: string[];
  postedAntes: Record<string, number>;
  scoreById: ScoreById;
  buyInFallback?: number;
  sessionStake?: number;
  carryIn?: number;
}): SettlementAuditReport & { soloReady: boolean } {
  const buyIn = input.buyInFallback ?? 100;
  const stake = input.sessionStake ?? 20;
  const errors: string[] = [];

  const bankrollStart = Object.fromEntries(
    input.participants.map((pid) => {
      const posted = input.postedAntes[pid] ?? 0;
      const current = scoreBankroll(input.scoreById[pid], buyIn);
      return [pid, current + posted];
    }),
  );

  const settled = buildSoloWinSettlement({
    winnerId: input.winnerId,
    carryIn: input.carryIn ?? 0,
    postedAntes: input.postedAntes,
    scoreById: input.scoreById,
    buyInFallback: buyIn,
    participants: input.participants,
    sessionStake: stake,
  });

  if (!settled.ready) {
    return {
      scenarioId: input.scenarioId,
      playerCount: input.participants.length,
      mode: "win",
      participants: input.participants,
      winners: [input.winnerId],
      ok: false,
      errors: [`solo win not ready: ${(settled as { reason?: string }).reason ?? "unknown"}`],
      carryIn: input.carryIn ?? 0,
      potBefore: 0,
      potAfterSettlement: 0,
      potAfterFunding: 0,
      chipTotalBefore: sessionChipTotal(input.scoreById, { buyInFallback: buyIn }),
      chipTotalAfterSettlement: 0,
      chipTotalAfterFunding: 0,
      players: [],
      settlement: {} as RecordHandSettlementResult,
      soloReady: false,
    };
  }

  const settledBankrolls = settled.settledBankrolls ?? settled.bankrolls ?? {};
  const chipBefore = Object.values(bankrollStart).reduce((s, n) => s + n, 0) +
    (input.carryIn ?? 0);

  const chipAfterSettle = Object.values(settledBankrolls).reduce((s, n) => s + (Number(n) || 0), 0);

  if (Math.abs(chipBefore - chipAfterSettle) > 0.001) {
    errors.push(`solo win settlement not zero-sum: ${chipBefore} → ${chipAfterSettle}`);
  }

  const fundedScore = settled.fundedScoreById ?? input.scoreById;
  const deal = collectFundingForHandStart({
    scoreById: fundedScore,
    nextDealFunding: settled.nextDealFunding,
    carryOverPot: 0,
    participantIds: input.participants,
    sessionStake: stake,
    buyInFallback: buyIn,
  });

  const chipAfterFund =
    Object.values(deal.bankrolls).reduce((s, n) => s + (Number(n) || 0), 0) +
    (deal.nextHandPot ?? 0);

  if (Math.abs(chipBefore - chipAfterFund) > 0.001) {
    errors.push(`solo win full cycle not zero-sum: ${chipBefore} → ${chipAfterFund}`);
  }

  const players: AuditPlayerRow[] = input.participants.map((pid) => {
    const brStart = bankrollStart[pid] ?? buyIn;
    const posted = input.postedAntes[pid] ?? 0;
    const brAfterAnte = scoreBankroll(input.scoreById[pid], buyIn);
    const brAfterSettle = settledBankrolls[pid] ?? brAfterAnte;
    const brAfterFund = deal.bankrolls[pid] ?? brAfterSettle;
    const funding = deal.postedAntes[pid] ?? 0;
    const row: AuditPlayerRow = {
      playerId: pid,
      bankrollStart: brStart,
      postedAnte: posted,
      bankrollAfterAnte: brAfterAnte,
      tricks: 0,
      isWinner: pid === input.winnerId,
      isBourre: false,
      payout: brAfterSettle - brAfterAnte,
      bankrollAfterSettlement: brAfterSettle,
      settlementDelta: brAfterSettle - brAfterAnte,
      fundingContribution: funding,
      fundingReason: null,
      bankrollAfterFunding: brAfterFund,
      fundingDelta: brAfterFund - brAfterSettle,
      netDelta: brAfterFund - brStart,
    };
    return row;
  });

  for (const pid of input.participants) {
    if (pid !== input.winnerId && players.find((p) => p.playerId === pid)) {
      const row = players.find((p) => p.playerId === pid)!;
      if (row.settlementDelta !== 0) {
        errors.push(`${pid}: folded player should have zero settlement delta, got ${row.settlementDelta}`);
      }
      if (row.postedAnte > 0 && row.netDelta !== -row.postedAnte - (deal.postedAntes[pid] ?? 0)) {
        const expectedNet = -(row.postedAnte) - (deal.postedAntes[pid] ?? 0);
        if (Math.abs(row.netDelta - expectedNet) > 0.001) {
          errors.push(
            `${pid}: fold path net delta ${row.netDelta} !== -ante -nextAnte (${expectedNet})`,
          );
        }
      }
    }
  }

  const report: SettlementAuditReport = {
    scenarioId: input.scenarioId,
    playerCount: input.participants.length,
    mode: "win",
    participants: input.participants,
    winners: [input.winnerId],
    ok: errors.length === 0,
    errors,
    carryIn: input.carryIn ?? 0,
    potBefore:
      (input.carryIn ?? 0) +
      Object.values(input.postedAntes).reduce((s, n) => s + Math.max(0, Number(n) || 0), 0),
    potAfterSettlement: 0,
    potAfterFunding: deal.nextHandPot,
    chipTotalBefore: chipBefore,
    chipTotalAfterSettlement: chipAfterSettle,
    chipTotalAfterFunding: chipAfterFund,
    players,
    settlement: {} as RecordHandSettlementResult,
  };

  if (SETTLEMENT_AUDIT_DEBUG) {
    console.info("[settlement-audit]", formatSettlementAuditTrace(report));
  }

  return { ...report, soloReady: true };
}

export function formatSettlementAuditTrace(report: SettlementAuditReport): string {
  const lines: string[] = [
    `=== ${report.scenarioId} (${report.playerCount}p, mode=${report.mode}) ===`,
    `ok=${report.ok} errors=${report.errors.length}`,
    `pot: ${report.potBefore} → settle:${report.potAfterSettlement} → fund:${report.potAfterFunding}`,
    `chips: ${report.chipTotalBefore} → ${report.chipTotalAfterSettlement} → ${report.chipTotalAfterFunding}`,
    `winners=[${report.winners.join(",")}] participants=[${report.participants.join(",")}]`,
  ];
  if (report.errors.length) {
    lines.push("ERRORS:");
    for (const e of report.errors) lines.push(`  - ${e}`);
  }
  for (const p of report.players) {
    lines.push(
      `  ${p.playerId}: start=${p.bankrollStart} ante=${p.postedAnte} tricks=${p.tricks}` +
        ` settleΔ=${p.settlementDelta} fund=${p.fundingContribution}(${p.fundingReason})` +
        ` end=${p.bankrollAfterFunding} netΔ=${p.netDelta}` +
        `${p.isBourre ? " BOURRÉ" : ""}${p.isWinner ? " WIN" : ""}`,
    );
  }
  return lines.join("\n");
}
