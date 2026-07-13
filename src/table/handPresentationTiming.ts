/**
 * Central timing for table presentation (visual playback only).
 * Authoritative game state is unchanged; these values gate UI sequencing.
 */

import { prefersReducedMotion } from "./trickTiming";

/** Ante chip travel to pot (180–260 ms). */
export const ANTE_CHIP_TRAVEL_MS = 220;

/** Per-card deal stagger (90–140 ms). */
export const DEAL_CARD_STAGGER_MS = 130;

/** Full deal fan duration (matches bdeal-to-hand). */
export const DEAL_FAN_MS = 600;

/** Dealer upcard / trump reveal hold (~5 s so the suit is readable). */
export const TRUMP_REVEAL_HOLD_MS = 5000;

/** Trump merge into holder hand after first opening action (~480 ms). */
export const TRUMP_MERGE_ANIM_MS = 480;

/** Enrollment seat pulse when a player joins or passes. */
export const ENROLLMENT_SEAT_PULSE_MS = 480;

/** Draw discard slide to center pile (280–420 ms). */
export const DRAW_DISCARD_MS = 400;

/** Draw replacement per card (100–160 ms). */
export const DRAW_REPLACE_MS = 700;

/** Pause after all draws before first lead (400–600 ms). */
export const DRAW_READY_BEAT_MS = 500;

/** Settle / payout hold (800–1200 ms). */
export const SETTLE_HOLD_MS = 1000;

/** Next-hand reset pause (400–700 ms). */
export const NEXT_HAND_RESET_MS = 550;

/** Hand reset between sessions (400–700 ms). */
export const HAND_RESET_MS = 500;

/** Maximum time any single presentation phase may hold before forced advance. */
export const PRESENTATION_WATCHDOG_MS = 12_000;

/** Shorter watchdog during draw animations so bots are not stalled by stuck phases. */
export const BOT_DRAW_PRESENTATION_WATCHDOG_MS = 4_000;

/** After the server clears the hand, force settlement if trick presentation is still busy. */
export const HAND_SETTLE_PIPELINE_WATCHDOG_MS = 4_000;

export type HandPresentationPhase =
  | "idle"
  | "handReset"
  | "ante"
  | "deal"
  | "trumpReveal"
  | "trumpMerge"
  | "enrollment"
  | "decision"
  | "drawPlayer"
  | "drawReady"
  | "play"
  | "settle"
  | "nextHandReset";

export type DrawAnimSubPhase = "discard" | "receive" | "done";

export interface HandTimingScale {
  anteChipTravelMs: number;
  dealCardStaggerMs: number;
  dealFanMs: number;
  trumpRevealHoldMs: number;
  trumpMergeAnimMs: number;
  enrollmentSeatPulseMs: number;
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
    dealCardStaggerMs: round(DEAL_CARD_STAGGER_MS),
    dealFanMs: round(DEAL_FAN_MS),
    trumpRevealHoldMs: round(TRUMP_REVEAL_HOLD_MS),
    trumpMergeAnimMs: round(TRUMP_MERGE_ANIM_MS),
    enrollmentSeatPulseMs: round(ENROLLMENT_SEAT_PULSE_MS),
    drawDiscardMs: round(DRAW_DISCARD_MS),
    drawReplaceMs: round(DRAW_REPLACE_MS),
    drawReadyBeatMs: round(DRAW_READY_BEAT_MS),
    settleHoldMs: round(SETTLE_HOLD_MS),
    nextHandResetMs: round(NEXT_HAND_RESET_MS),
    handResetMs: round(HAND_RESET_MS),
  };
}

export function drawPlayerScheduleMs(
  discardCount: number,
  replaceCount: number,
  reducedMotion = prefersReducedMotion(),
): number {
  const t = handTimingScale(reducedMotion);
  const discards = Math.max(0, discardCount);
  const replacements = Math.max(0, replaceCount);
  if (discards === 0 && replacements === 0) {
    return Math.max(120, Math.round(t.drawDiscardMs * 0.6));
  }
  return discards * t.drawDiscardMs + replacements * t.drawReplaceMs + 80;
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
