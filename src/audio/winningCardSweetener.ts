/**
 * Per-hand winning-card sweetener cycle — plays after card-place thock.
 * Sequence resets at each new hand.
 */

import type { SoundAssetId } from "../table/feedback/soundPacks";

/** Repeating 4-step cycle after each new winning card (post card-place). */
export const WINNING_CARD_SWEETENER_CYCLE: readonly SoundAssetId[] = [
  "bling",
  "lead-sweetener-light",
  "lead-sweetener-strong",
  "arcadecentipede",
];

let winningCardSequenceCount = 0;

export function getWinningCardSequenceCount(): number {
  return winningCardSequenceCount;
}

export function resetWinningCardSequenceCount(): void {
  winningCardSequenceCount = 0;
}

/** @internal test helper */
export function _setWinningCardSequenceCountForTests(count: number): void {
  winningCardSequenceCount = count;
}

/** Increment and return the new count (1-based per hand). */
export function incrementWinningCardSequenceCount(): number {
  winningCardSequenceCount += 1;
  return winningCardSequenceCount;
}

/**
 * Map sequence count to cycle asset (1 → bling, 2 → light, 3 → strong, 4 → arcade…).
 */
export function resolveWinningCardSweetenerAsset(sequenceCount: number): SoundAssetId {
  const index = ((sequenceCount - 1) % 4 + 4) % 4;
  return WINNING_CARD_SWEETENER_CYCLE[index]!;
}
