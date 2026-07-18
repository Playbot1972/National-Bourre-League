/**
 * Central timing for table presentation (visual playback only).
 * Authoritative game state is unchanged; these values gate UI sequencing.
 */

import { FINAL_HAND_TRICK_PRESENTATION_MS, prefersReducedMotion } from "./trickTiming";

/** Ante chip travel from seat to pot (per coin). */
export const ANTE_CHIP_TRAVEL_MS = 290;

/** Stagger between consecutive ante launches (clockwise, dealer last). */
export const ANTE_CHIP_STAGGER_MS = 78;

/** Breathing beat after all ante coins land, before trump/deal. */
export const ANTE_POST_HOLD_MS = 240;

/** Per-card deal stagger (90–140 ms). */
export const DEAL_CARD_STAGGER_MS = 130;

/** Full deal fan duration (matches bdeal-to-hand). */
export const DEAL_FAN_MS = 600;

/** Dealer upcard / trump reveal hold (readable beat before deal). */
export const TRUMP_REVEAL_HOLD_MS = 3000;

/** Trump merge into holder hand after first opening action (~480 ms). */
export const TRUMP_MERGE_ANIM_MS = 480;

/** Enrollment seat pulse when a player joins or passes. */
export const ENROLLMENT_SEAT_PULSE_MS = 480;

/** Turn ring visible before each draw player's discard/receive. */
export const DRAW_RING_BEAT_MS = 340;

/** Draw discard slide to center pile (280–420 ms). */
export const DRAW_DISCARD_MS = 340;

/** Draw replacement per card (readable, not per-card dead air). */
export const DRAW_REPLACE_MS = 380;

/** Pause after all draws before first lead (400–600 ms). */
export const DRAW_READY_BEAT_MS = 480;

/** Settle / payout hold (800–1200 ms). */
export const SETTLE_HOLD_MS = 880;

/** Next-hand reset pause (400–700 ms). */
export const NEXT_HAND_RESET_MS = 550;

/** Hand reset between sessions (400–700 ms). */
export const HAND_RESET_MS = 500;

/** Maximum time any single presentation phase may hold before forced advance. */
export const PRESENTATION_WATCHDOG_MS = 12_000;

/** Shorter watchdog during draw animations so bots are not stalled by stuck phases. */
export const BOT_DRAW_PRESENTATION_WATCHDOG_MS = 4_000;

/** After the server clears the hand, force settlement if trick presentation is still busy. */
export const HAND_SETTLE_PIPELINE_WATCHDOG_MS = FINAL_HAND_TRICK_PRESENTATION_MS;

export type HandPresentationPhase =
  | "idle"
  | "handReset"
  | "ante"
  | "trumpReveal"
  | "trumpMerge"
  | "enrollment"
  | "decision"
  | "drawPlayer"
  | "drawReady"
  | "play"
  | "settle"
  | "nextHandReset";

export type DrawAnimSubPhase = "ring" | "discard" | "receive" | "done";

export interface HandTimingScale {
  anteChipTravelMs: number;
  anteChipStaggerMs: number;
  antePostHoldMs: number;
  dealCardStaggerMs: number;
  dealFanMs: number;
  trumpRevealHoldMs: number;
  trumpMergeAnimMs: number;
  enrollmentSeatPulseMs: number;
  drawRingBeatMs: number;
  drawDiscardMs: number;
  drawReplaceMs: number;
  drawReadyBeatMs: number;
  settleHoldMs: number;
  nextHandResetMs: number;
  handResetMs: number;
}

export function handTimingScale(reducedMotion = prefersReducedMotion()): HandTimingScale {
  const scale = reducedMotion ? 0.55 : 1;
  const round = (ms: number) => Math.max(80, Math.round(ms * scale));
  return {
    anteChipTravelMs: round(ANTE_CHIP_TRAVEL_MS),
    anteChipStaggerMs: round(ANTE_CHIP_STAGGER_MS),
    antePostHoldMs: round(ANTE_POST_HOLD_MS),
    dealCardStaggerMs: round(DEAL_CARD_STAGGER_MS),
    dealFanMs: round(DEAL_FAN_MS),
    trumpRevealHoldMs: round(TRUMP_REVEAL_HOLD_MS),
    trumpMergeAnimMs: round(TRUMP_MERGE_ANIM_MS),
    enrollmentSeatPulseMs: round(ENROLLMENT_SEAT_PULSE_MS),
    drawRingBeatMs: round(DRAW_RING_BEAT_MS),
    drawDiscardMs: round(DRAW_DISCARD_MS),
    drawReplaceMs: round(DRAW_REPLACE_MS),
    drawReadyBeatMs: round(DRAW_READY_BEAT_MS),
    settleHoldMs: round(SETTLE_HOLD_MS),
    nextHandResetMs: round(NEXT_HAND_RESET_MS),
    handResetMs: round(HAND_RESET_MS),
  };
}

export function antePresentationFlightMs(
  playerCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  if (playerCount <= 0) return 0;
  const scale = reducedMotion ? 0.55 : 1;
  const staggerMs = reducedMotion ? 40 : ANTE_CHIP_STAGGER_MS;
  const travel = Math.round(ANTE_CHIP_TRAVEL_MS * scale);
  return (playerCount - 1) * staggerMs + travel;
}

export function antePresentationScheduleMs(
  playerCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  const t = handTimingScale(reducedMotion);
  return antePresentationFlightMs(playerCount, reducedMotion) + t.antePostHoldMs;
}

export function drawPlayerScheduleMs(
  discardCount: number,
  replaceCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  return drawPlayerAnimScheduleMs({
    subPhase: "discard",
    discardCount,
    replaceCount,
    reducedMotion,
  });
}

export function drawPlayerAnimScheduleMs(input: {
  subPhase: DrawAnimSubPhase;
  discardCount: number;
  replaceCount: number;
  reducedMotion?: boolean;
}): number {
  const t = handTimingScale(input.reducedMotion);
  if (input.subPhase === "ring") return t.drawRingBeatMs;
  if (input.subPhase === "done") return 0;

  const discards = Math.max(0, input.discardCount);
  const replacements = Math.max(0, input.replaceCount);
  if (input.subPhase === "receive") {
    if (replacements === 0) return Math.max(120, Math.round(t.drawReplaceMs * 0.5));
    return replacements * t.drawReplaceMs + 60;
  }
  if (discards === 0 && replacements === 0) {
    return Math.max(120, Math.round(t.drawDiscardMs * 0.55));
  }
  return discards * t.drawDiscardMs + 60;
}

/** Seat whose turn ring should show during draw presentation (ring beat only). */
export function resolveDrawPresentationRingActor(input: {
  phase: HandPresentationPhase;
  drawAnimSubPhase: DrawAnimSubPhase;
  animatingDrawPlayerId: string | null;
}): string | null {
  if (
    input.phase === "drawPlayer" &&
    input.drawAnimSubPhase === "ring" &&
    input.animatingDrawPlayerId
  ) {
    return input.animatingDrawPlayerId;
  }
  return null;
}

export function drawSubPhaseSuppressesTurnRing(subPhase: DrawAnimSubPhase): boolean {
  return subPhase === "discard" || subPhase === "receive";
}

export function suppressesHandTurnIndicator(phase: HandPresentationPhase): boolean {
  return (
    phase !== "idle" &&
    phase !== "enrollment" &&
    phase !== "decision" &&
    phase !== "play" &&
    phase !== "drawPlayer"
  );
}
