import { isTrump } from "../game/cardUtils";
import { resolveTrickWinner } from "../game/trick";
import type { Rank, Suit } from "../types";
import { totalTricksPlayed } from "./logic";
import type { CurrentTrickState, SerializedCard } from "./types";

/** Card travel to center (180–260 ms). */
export const CARD_LAND_MS = 220;

/** Stagger between bot plays in the social driver (250–450 ms). */
export const BOT_PLAY_STAGGER_MS = 350;

/** Readability pause after last card before winner highlight (2000 ms per spec). */
export const POST_TRICK_READ_MS = 2000;

/** Winner glow inside the read pause (300–500 ms). */
export const WINNER_REVEAL_MS = 400;

/** Longer read when trump beats led suit. */
export const TRUMP_BEAT_READ_MS = 1800;

/** Directional collection toward winner seat (250–400 ms). */
export const TRICK_SWEEP_MS = 300;

/** Gap before next lead indicators (150–250 ms). */
export const NEXT_LEAD_GAP_MS = 200;

/** @deprecated Use POST_TRICK_READ_MS — kept for gradual migration. */
export const POST_TRICK_HOLD_MS = POST_TRICK_READ_MS;

/** @deprecated */
export const POST_TRICK_HOLD_MOBILE_MS = POST_TRICK_READ_MS;

/** @deprecated */
export const TRUMP_BEAT_HOLD_MS = TRUMP_BEAT_READ_MS;

/** @deprecated Use WINNER_REVEAL_MS */
export const WINNER_HIGHLIGHT_MS = WINNER_REVEAL_MS;

/** Minimum robot action spacing — must exceed full trick resolution pipeline. */
export const MIN_TRICK_PIPELINE_MS =
  CARD_LAND_MS + POST_TRICK_READ_MS + TRICK_SWEEP_MS + NEXT_LEAD_GAP_MS + 120;

export type TrickPlay = { playerId: string; card: SerializedCard };

/**
 * Visual trick pipeline (UI only — server state may advance earlier).
 *
 * live → trickComplete → winnerReveal → collectTrick → nextLeadReady → live
 */
export type TrickPresentationPhase =
  | "live"
  | "trickComplete"
  | "winnerReveal"
  | "collectTrick"
  | "nextLeadReady";

/** Phases where turn/lead UI must stay suppressed. */
export function suppressesTurnIndicator(phase: TrickPresentationPhase): boolean {
  return phase !== "live";
}

export interface FrozenTrick {
  trickNumber: number;
  leadSuit: string | null;
  plays: TrickPlay[];
  winnerId: string;
}

export interface TrickTimingScale {
  cardLandMs: number;
  postTrickReadMs: number;
  winnerRevealMs: number;
  trickSweepMs: number;
  nextLeadGapMs: number;
  trumpBeatReadMs: number;
}

export function trickTimingScale(reducedMotion = false): TrickTimingScale {
  const scale = reducedMotion ? 0.55 : 1;
  return {
    cardLandMs: Math.round(CARD_LAND_MS * scale),
    postTrickReadMs: Math.round(POST_TRICK_READ_MS * scale),
    winnerRevealMs: Math.round(WINNER_REVEAL_MS * scale),
    trickSweepMs: Math.round(TRICK_SWEEP_MS * scale),
    nextLeadGapMs: Math.round(NEXT_LEAD_GAP_MS * scale),
    trumpBeatReadMs: Math.round(TRUMP_BEAT_READ_MS * scale),
  };
}

export function postTrickReadMs(options: {
  mobile?: boolean;
  trumpBeat?: boolean;
  reducedMotion?: boolean;
}): number {
  const timing = trickTimingScale(options.reducedMotion);
  if (options.trumpBeat) return timing.trumpBeatReadMs;
  void options.mobile;
  return timing.postTrickReadMs;
}

/** @deprecated Use postTrickReadMs */
export function postTrickHoldMs(options: {
  mobile?: boolean;
  trumpBeat?: boolean;
}): number {
  return postTrickReadMs(options);
}

export function trickResolutionScheduleMs(options: {
  trumpBeat?: boolean;
  reducedMotion?: boolean;
}): {
  readBeforeWinnerMs: number;
  winnerRevealMs: number;
  readTotalMs: number;
  sweepMs: number;
  nextLeadGapMs: number;
  pipelineMs: number;
} {
  const timing = trickTimingScale(options.reducedMotion);
  const readTotalMs = options.trumpBeat ? timing.trumpBeatReadMs : timing.postTrickReadMs;
  const winnerRevealMs = Math.min(timing.winnerRevealMs, readTotalMs - 200);
  const readBeforeWinnerMs = Math.max(200, readTotalMs - winnerRevealMs);
  const sweepMs = timing.trickSweepMs;
  const nextLeadGapMs = timing.nextLeadGapMs;
  return {
    readBeforeWinnerMs,
    winnerRevealMs,
    readTotalMs,
    sweepMs,
    nextLeadGapMs,
    pipelineMs: readTotalMs + sweepMs + nextLeadGapMs,
  };
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

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
