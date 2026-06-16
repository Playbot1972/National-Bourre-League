import { isTrump } from "../game/cardUtils";
import { resolveTrickWinner } from "../game/trick";
import type { Rank, Suit } from "../types";
import { totalTricksPlayed } from "./logic";
import type { CurrentTrickState, SerializedCard } from "./types";

/** Card play lands on the felt — premium table pace (~2× standard). */
export const CARD_LAND_MS = 500;

/** Winner glow / lift after the last card. */
export const WINNER_HIGHLIGHT_MS = 1600;

/** Default post-trick hold before sweep (desktop). */
export const POST_TRICK_HOLD_MS = 3000;

/** Post-trick hold on narrow / touch viewports. */
export const POST_TRICK_HOLD_MOBILE_MS = 3600;

/** Longer hold when trump beats the led suit. */
export const TRUMP_BEAT_HOLD_MS = 4000;

/** Sweep completed trick cards toward the winner pile. */
export const TRICK_SWEEP_MS = 900;

export type TrickPlay = { playerId: string; card: SerializedCard };

export type TrickPresentationPhase = "live" | "hold" | "sweep";

export interface FrozenTrick {
  trickNumber: number;
  leadSuit: string | null;
  plays: TrickPlay[];
  winnerId: string;
}

export function trickWinnerDelta(
  prev: Record<string, number>,
  next: Record<string, number>,
  participantIds: string[],
): string | null {
  for (const pid of participantIds) {
    if ((next[pid] ?? 0) > (prev[pid] ?? 0)) return pid;
  }
  return null;
}

export function serializedPlays(trick: CurrentTrickState | null | undefined): TrickPlay[] {
  return trick?.plays?.map((p) => ({ playerId: p.playerId, card: p.card })) ?? [];
}

export function trumpBeatLedSuit(
  plays: TrickPlay[],
  leadSuit: string | null | undefined,
  trumpSuit: string | null | undefined,
): boolean {
  if (!plays.length || !leadSuit || !trumpSuit || leadSuit === trumpSuit) return false;
  const winnerId = resolveTrickWinner(
    plays.map((p) => ({
      playerId: p.playerId,
      card: { rank: p.card.rank as Rank, suit: p.card.suit as Suit },
    })),
    leadSuit as Suit,
    trumpSuit as Suit,
  );
  const winnerPlay = plays.find((p) => p.playerId === winnerId);
  return Boolean(
    winnerPlay &&
      isTrump(
        { rank: winnerPlay.card.rank as Rank, suit: winnerPlay.card.suit as Suit },
        trumpSuit as Suit,
      ),
  );
}

export function postTrickHoldMs(options: { mobile?: boolean; trumpBeat?: boolean }): number {
  if (options.trumpBeat) return TRUMP_BEAT_HOLD_MS;
  if (options.mobile) return POST_TRICK_HOLD_MOBILE_MS;
  return POST_TRICK_HOLD_MS;
}

export function detectTrickResolution(input: {
  prevTricks: Record<string, number>;
  nextTricks: Record<string, number>;
  participantIds: string[];
  prevTrick: CurrentTrickState | null | undefined;
}): FrozenTrick | null {
  const { prevTricks, nextTricks, participantIds, prevTrick } = input;
  const prevTotal = totalTricksPlayed(prevTricks, participantIds);
  const nextTotal = totalTricksPlayed(nextTricks, participantIds);
  if (nextTotal <= prevTotal) return null;

  const winnerId = trickWinnerDelta(prevTricks, nextTricks, participantIds);
  const plays = serializedPlays(prevTrick);
  if (!winnerId || !plays.length) return null;

  return {
    trickNumber: prevTrick?.trickNumber ?? nextTotal,
    leadSuit: prevTrick?.leadSuit ?? null,
    plays,
    winnerId,
  };
}

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
}
