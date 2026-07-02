import { isTrump } from "../game/cardUtils";
import { resolveTrickWinner } from "../game/trick";
import type { Rank, Suit } from "../types";
import { totalTricksPlayed } from "./logic";
import type { CurrentTrickState, PlayedCardEntry, SerializedCard } from "./types";

/** Card travel from seat to table center. */
export const TRICK_CARD_TRAVEL_MS = 395;

/** Arrival settle/pop after travel. */
export const TRICK_CARD_SETTLE_MS = 165;

/** Existing table cards shift sideways when a new card lands. */
export const TRICK_CARD_SHIFT_MS = 220;

/** Full play-to-table presentation (travel + settle). */
export const CARD_LAND_MS = TRICK_CARD_TRAVEL_MS + TRICK_CARD_SETTLE_MS;

/** Stagger between revealing trick cards — slightly after land so prior card finishes. */
export const CARD_REVEAL_STAGGER_MS = CARD_LAND_MS + TRICK_CARD_SHIFT_MS / 2;

/** Stagger between bot plays in the social driver (250–450 ms). */
export const BOT_PLAY_STAGGER_MS = 380;

/** Readability pause after last card before winner highlight (1600 ms — within 1400–1800 spec). */
export const POST_TRICK_READ_MS = 1850;

/** Winner glow inside the read pause (300–500 ms). */
export const WINNER_REVEAL_MS = 400;

/** Longer read when trump beats led suit. */
export const TRUMP_BEAT_READ_MS = 2050;

/** Directional collection toward winner seat (rake + gather + packet fly). */
export const TRICK_SWEEP_MS = 1_080;

/** In-line rake before cards fly to the winner pile. */
export const TRICK_RAKE_MS = 240;

/** Gap before next lead indicators (150–250 ms). */
export const NEXT_LEAD_GAP_MS = 230;

/** Extra read beat after trick 5 before hand settle (end-of-hand clarity). */
export const FINAL_TRICK_EXTRA_READ_MS = 900;

/** Max wait to drain trick presentation after the server clears the hand. */
export const TRICK_HAND_END_DRAIN_MS = 9_500;

/** Force-advance a stuck trick presentation phase (timers cleared without advancing). */
export const TRICK_PIPELINE_STUCK_MS = 8_500;

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

/** Phases where the turn countdown ring is hidden until the trick pipeline drains. */
export function suppressesTurnIndicator(phase: TrickPresentationPhase): boolean {
  return (
    phase === "trickComplete" ||
    phase === "winnerReveal" ||
    phase === "collectTrick" ||
    phase === "nextLeadReady"
  );
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
  finalTrick?: boolean;
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
  const finalExtraMs = options.finalTrick
    ? Math.round(FINAL_TRICK_EXTRA_READ_MS * (options.reducedMotion ? 0.55 : 1))
    : 0;
  const readTotalMs =
    (options.trumpBeat ? timing.trumpBeatReadMs : timing.postTrickReadMs) + finalExtraMs;
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

/** Time to reveal remaining trick cards before resolution can commit. */
export function trickRevealCatchUpMs(
  revealedCount: number,
  targetCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  const remaining = Math.max(0, targetCount - revealedCount);
  if (remaining === 0) return 0;
  const stagger = reducedMotion
    ? Math.round(CARD_REVEAL_STAGGER_MS * 0.55)
    : CARD_REVEAL_STAGGER_MS;
  const landMs = reducedMotion ? Math.round(CARD_LAND_MS * 0.55) : CARD_LAND_MS;
  return remaining * stagger + landMs;
}

export function trickWinnerDelta(
  prev: Record<string, number>,
  next: Record<string, number>,
  participantIds: string[],
): string | null {
  const roster =
    participantIds.length > 0
      ? participantIds
      : [...new Set([...Object.keys(prev), ...Object.keys(next)])];
  for (const pid of roster) {
    if ((next[pid] ?? 0) > (prev[pid] ?? 0)) return pid;
  }
  return null;
}

/** Participant roster for trick resolution when the server clears seats mid-snapshot. */
export function trickResolutionParticipantIds(
  participantIds: string[],
  prevTricks: Record<string, number>,
  nextTricks: Record<string, number>,
): string[] {
  if (participantIds.length > 0) return participantIds;
  return [...new Set([...Object.keys(prevTricks), ...Object.keys(nextTricks)])];
}

export function serializedPlays(trick: CurrentTrickState | null | undefined): TrickPlay[] {
  return trick?.plays?.map((p) => ({ playerId: p.playerId, card: p.card })) ?? [];
}

/** Current trick leader from cards played so far (updates as each card lands). */
export function currentTrickLeaderId(
  plays: TrickPlay[],
  leadSuit: string | null | undefined,
  trumpSuit: string | null | undefined,
): string | null {
  if (!plays.length) return null;
  if (plays.length === 1) return plays[0]!.playerId;
  if (!leadSuit || !trumpSuit) return plays[plays.length - 1]!.playerId;
  return resolveTrickWinner(
    plays.map((p) => ({
      playerId: p.playerId,
      card: { rank: p.card.rank as Rank, suit: p.card.suit as Suit },
    })),
    leadSuit as Suit,
    trumpSuit as Suit,
  );
}

/** Recover full trick plays when the server resolves atomically (last card not in prevTrick). */
export function completedTrickPlays(input: {
  prevTrick: CurrentTrickState | null | undefined;
  playedCards?: PlayedCardEntry[];
  trickNumber: number;
}): TrickPlay[] {
  const prevPlays = serializedPlays(input.prevTrick);
  const historyPlays =
    input.playedCards
      ?.filter((entry) => entry.trickNumber === input.trickNumber)
      .map((entry) => ({ playerId: entry.playerId, card: entry.card })) ?? [];

  if (historyPlays.length > prevPlays.length) return historyPlays;
  return prevPlays;
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
  playedCards?: PlayedCardEntry[];
}): FrozenTrick | null {
  const { prevTricks, nextTricks, prevTrick, playedCards } = input;
  const participantIds = trickResolutionParticipantIds(
    input.participantIds,
    prevTricks,
    nextTricks,
  );
  const prevTotal = totalTricksPlayed(prevTricks, participantIds);
  const nextTotal = totalTricksPlayed(nextTricks, participantIds);
  if (nextTotal <= prevTotal) return null;

  const winnerId = trickWinnerDelta(prevTricks, nextTricks, participantIds);
  const trickNumber = prevTrick?.trickNumber ?? nextTotal;
  const plays = completedTrickPlays({ prevTrick, playedCards, trickNumber });
  if (!winnerId || !plays.length) return null;

  return {
    trickNumber,
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
