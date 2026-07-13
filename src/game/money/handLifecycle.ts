/**
 * Hand money lifecycle helpers — settlement pot clearing and per-hand flag reset timing.
 * Maps target spec names onto the existing ScoreById + session pot fields.
 */

import { applyBankrollDelta, eligibleIdsForAnteCollection, scoreBankroll, canEnrollWithBankroll } from "./core";
import type { ScoreById, ScoreRow } from "./types";

export interface TablePotState {
  currentPot: number;
  postedAntes?: Record<string, number>;
}

/** Clear live hand pot after settlement snapshot is captured (carry moves to carryOverPot). */
export function finalizeSettledHandState(state: TablePotState): void {
  state.currentPot = 0;
  if (state.postedAntes) {
    for (const pid of Object.keys(state.postedAntes)) {
      state.postedAntes[pid] = 0;
    }
  }
}

const PER_HAND_FLAG_KEYS = [
  "playedThisHand",
  "foldedThisHand",
  "tricksWonThisHand",
  "isBourreThisHand",
] as const;

/** Reset per-hand player flags only when the next hand actually starts. */
export function prepareForNextHand(scoreById: ScoreById, playerIds: string[]): ScoreById {
  const next: ScoreById = { ...scoreById };
  for (const pid of playerIds) {
    const row: ScoreRow = { ...(next[pid] || {}) };
    row.playedThisHand = false;
    row.foldedThisHand = false;
    row.tricksWonThisHand = 0;
    row.isBourreThisHand = false;
    next[pid] = row;
  }
  return next;
}

/** Players seated, eligible, and with bankroll > 0 — may fund the next hand. */
export function eligibleNextHandPlayers(
  playerIds: string[],
  scoreById: ScoreById,
  buyInFallback = 100,
): string[] {
  return eligibleIdsForAnteCollection(playerIds, scoreById, buyInFallback);
}

/** Bankroll-capped debit — returns amount actually contributed. */
export function cappedContribution(
  bankroll: number,
  amountDue: number,
): { contributed: number; newBankroll: number; busted: boolean } {
  const due = Math.max(0, Number(amountDue) || 0);
  if (due <= 0) {
    return { contributed: 0, newBankroll: Math.max(0, Number(bankroll) || 0), busted: false };
  }
  const result = applyBankrollDelta(bankroll, -due);
  return {
    contributed: Math.abs(result.appliedDelta),
    newBankroll: result.newBankroll,
    busted: result.busted,
  };
}

/** True when fewer than minimumPlayers solvent players remain — block next hand. */
export function shouldEndGameForSolvency(
  playerIds: string[],
  scoreById: ScoreById,
  buyInFallback: number,
  minimumPlayersToContinue = 2,
): boolean {
  return eligibleNextHandPlayers(playerIds, scoreById, buyInFallback).length < minimumPlayersToContinue;
}

/** Per-hand flags are still readable after settlement (not cleared until prepareForNextHand). */
export function perHandFlagsPresent(row: ScoreRow | undefined): boolean {
  if (!row) return false;
  return PER_HAND_FLAG_KEYS.some((key) => row[key] != null);
}
