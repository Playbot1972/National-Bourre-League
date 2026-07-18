import { isTrump } from "../game/cardUtils";
import { resolveTrickWinner } from "../game/trick";
import type { Rank, Suit } from "../types";
import { totalTricksPlayed } from "./logic";
import type { CurrentTrickState, PlayedCardEntry, SerializedCard } from "./types";

/** Card travel from seat to table center. */
export const TRICK_CARD_TRAVEL_MS = 395;

/** Arrival settle/pop after travel. */
export const TRICK_CARD_SETTLE_MS = 165;

/** Compressed settle during catch-up mode. */
export const TRICK_CARD_SETTLE_CATCHUP_MS = 40;

/** Existing table cards shift sideways when a new card lands. */
export const TRICK_CARD_SHIFT_MS = 220;

/** Full play-to-table presentation (travel + settle) — live mode. */
export const CARD_LAND_MS = TRICK_CARD_TRAVEL_MS + TRICK_CARD_SETTLE_MS;

/** Stagger between revealing trick cards in live mode. */
export const CARD_REVEAL_STAGGER_MS = CARD_LAND_MS + TRICK_CARD_SHIFT_MS / 2;

/** Compressed inter-card cadence in catch-up mode (30–60ms target). */
export const CARD_REVEAL_CATCHUP_STAGGER_MS = 45;

/** Compressed card travel during catch-up mode (120–200ms target). */
export const TRICK_CARD_TRAVEL_CATCHUP_MS = 160;

/** Inter-card fly stagger inside a batched catch-up reveal batch. */
export const BATCH_TRICK_FLY_CATCHUP_STAGGER_MS = 40;

/** Backlog at or above this uses revealThroughCount in one cadence step (extreme only). */
export const REVEAL_CATCHUP_BATCH_THRESHOLD = 8;

/** Authoritative trick presentation timing — live readability vs backlog drain. */
export type TrickPresentationTimingMode = "live" | "catch-up";

export function resolveTrickPresentationTimingMode(input: {
  revealedCount: number;
  targetReveal: number;
  serverTrickPlays: number;
}): TrickPresentationTimingMode {
  return isRevealCatchUpMode(
    input.revealedCount,
    input.targetReveal,
    input.serverTrickPlays,
  )
    ? "catch-up"
    : "live";
}

/** Estimated ms to drain a catch-up backlog (parallel fly: last card lands after stagger chain). */
export function estimateRevealCatchUpDrainMs(
  backlog: number,
  options: { reducedMotion?: boolean } = {},
): number {
  if (backlog <= 0) return 0;
  const reduced = options.reducedMotion === true;
  const mode: TrickPresentationTimingMode = "catch-up";
  if (backlog >= REVEAL_CATCHUP_BATCH_THRESHOLD) {
    const travel = trickCardTravelMs(mode, reduced);
    const flyStagger = batchTrickFlyStaggerMs(mode) * Math.max(0, backlog - 1);
    const leadMs = cardRevealStaggerMs(mode, reduced);
    return leadMs + travel + flyStagger;
  }
  const stagger = cardRevealStaggerMs(mode, reduced);
  const travel = trickCardTravelMs(mode, reduced);
  return stagger * Math.max(0, backlog - 1) + travel;
}

export function estimateLiveRevealDrainMs(
  backlog: number,
  options: { reducedMotion?: boolean } = {},
): number {
  if (backlog <= 0) return 0;
  const reduced = options.reducedMotion === true;
  const stagger = cardRevealStaggerMs("live", reduced);
  const travel = trickCardTravelMs("live", reduced);
  return stagger * Math.max(0, backlog - 1) + travel;
}

export function revealCatchUpBacklog(revealedCount: number, targetReveal: number): number {
  return Math.max(0, targetReveal - revealedCount);
}

export function isRevealCatchUpMode(
  revealedCount: number,
  targetReveal: number,
  serverTrickPlays: number,
): boolean {
  return (
    serverTrickPlays > 0 &&
    revealedCount < targetReveal &&
    revealCatchUpBacklog(revealedCount, targetReveal) > 0
  );
}

export function cardRevealStaggerMs(
  mode: TrickPresentationTimingMode,
  reducedMotion?: boolean,
): number;
export function cardRevealStaggerMs(options: {
  catchUp: boolean;
  reducedMotion?: boolean;
}): number;
export function cardRevealStaggerMs(
  modeOrOptions: TrickPresentationTimingMode | { catchUp: boolean; reducedMotion?: boolean },
  reducedMotion = false,
): number {
  const mode: TrickPresentationTimingMode =
    typeof modeOrOptions === "string"
      ? modeOrOptions
      : modeOrOptions.catchUp
        ? "catch-up"
        : "live";
  const reduced =
    typeof modeOrOptions === "string" ? reducedMotion : (modeOrOptions.reducedMotion ?? false);
  const base =
    mode === "catch-up" ? CARD_REVEAL_CATCHUP_STAGGER_MS : CARD_REVEAL_STAGGER_MS;
  return reduced ? Math.round(base * 0.55) : base;
}

export function trickCardTravelMs(
  mode: TrickPresentationTimingMode,
  reducedMotion?: boolean,
): number;
export function trickCardTravelMs(options: {
  catchUp: boolean;
  reducedMotion?: boolean;
}): number;
export function trickCardTravelMs(
  modeOrOptions: TrickPresentationTimingMode | { catchUp: boolean; reducedMotion?: boolean },
  reducedMotion = false,
): number {
  const mode: TrickPresentationTimingMode =
    typeof modeOrOptions === "string"
      ? modeOrOptions
      : modeOrOptions.catchUp
        ? "catch-up"
        : "live";
  const reduced =
    typeof modeOrOptions === "string" ? reducedMotion : (modeOrOptions.reducedMotion ?? false);
  const base = mode === "catch-up" ? TRICK_CARD_TRAVEL_CATCHUP_MS : TRICK_CARD_TRAVEL_MS;
  return reduced ? Math.round(base * 0.55) : base;
}

export function trickCardSettleMs(
  mode: TrickPresentationTimingMode,
  reducedMotion = false,
): number {
  const base = mode === "catch-up" ? TRICK_CARD_SETTLE_CATCHUP_MS : TRICK_CARD_SETTLE_MS;
  return reducedMotion ? Math.round(base * 0.55) : base;
}

export function trickCardLandMs(
  mode: TrickPresentationTimingMode,
  reducedMotion = false,
): number {
  return trickCardTravelMs(mode, reducedMotion) + trickCardSettleMs(mode, reducedMotion);
}

export function batchTrickFlyStaggerMs(mode: TrickPresentationTimingMode): number;
export function batchTrickFlyStaggerMs(catchUp: boolean): number;
export function batchTrickFlyStaggerMs(modeOrCatchUp: TrickPresentationTimingMode | boolean): number {
  const mode: TrickPresentationTimingMode =
    typeof modeOrCatchUp === "boolean" ? (modeOrCatchUp ? "catch-up" : "live") : modeOrCatchUp;
  return mode === "catch-up" ? BATCH_TRICK_FLY_CATCHUP_STAGGER_MS : 72;
}

/** Stagger between bot plays in the social driver (250–450 ms). */
export const BOT_PLAY_STAGGER_MS = 380;

/** Readability pause after last card before winner highlight. */
export const POST_TRICK_READ_MS = 525;

/** Winner glow inside the read pause (300–500 ms). */
export const WINNER_REVEAL_MS = 400;

/** Longer read when trump beats led suit. */
export const TRUMP_BEAT_READ_MS = 725;

/** Directional collection toward winner seat (rake + gather + packet fly). */
export const TRICK_SWEEP_MS = 900;

/** In-line rake before cards fly to the winner pile. */
export const TRICK_RAKE_MS = 240;

/** Gap before next lead indicators (150–250 ms). */
export const NEXT_LEAD_GAP_MS = 230;

/**
 * Max UI time for the final trick when the server ends the hand early:
 * stagger remaining bot plays (up to 7 after hero leads) + land + full resolution pipeline.
 */
export const FINAL_HAND_TRICK_PRESENTATION_MS =
  CARD_REVEAL_STAGGER_MS * 7 +
  CARD_LAND_MS +
  trickResolutionScheduleMs({}).pipelineMs +
  500;

/** Max wait to drain trick presentation after the server clears the hand. */
export const TRICK_HAND_END_DRAIN_MS = FINAL_HAND_TRICK_PRESENTATION_MS;

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

/** Phases where turn/lead UI must stay suppressed (brief read + winner glow only). */
export function suppressesTurnIndicator(phase: TrickPresentationPhase): boolean {
  return phase === "trickComplete" || phase === "winnerReveal";
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
