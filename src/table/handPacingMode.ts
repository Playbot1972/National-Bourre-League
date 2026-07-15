/**
 * Single source of truth for Ape S. Mode — presentation/tempo pacing only.
 * Does not affect bot intelligence, legality, or card-choice rules.
 */

import type { AnteCoinDelayPlan } from "../session/botActionTiming";
import { buildAnteCoinDelayPlan } from "../session/botActionTiming";
import { BOT_PLAY_STAGGER_MS } from "./trickTiming";

const CLASSIC_ANTE_CHIP_TRAVEL_MS = 220;

export const APE_SPEED_MODE_PREFS_KEY = "nbl-ape-speed-mode";

export type HandPacingMode = "classic" | "apeSpeed";

/** Bot presentation gate soft-unblock — shorter when Ape S. Mode is on. */
export const PACING_SOFT_UNBLOCK_MS: Record<HandPacingMode, number> = {
  classic: 8_500,
  apeSpeed: 5_500,
};

/** Bot presentation gate force-release safety ceiling. */
export const PACING_FORCE_RELEASE_MS: Record<HandPacingMode, number> = {
  classic: 10_000,
  apeSpeed: 7_000,
};

const handLocks = new Map<number, HandPacingMode>();
let activePacingMode: HandPacingMode = "classic";
const listeners = new Set<() => void>();

let prefsTestOverride: boolean | null = null;

export function getApeSpeedModeEnabled(): boolean {
  if (prefsTestOverride !== null) return prefsTestOverride;
  try {
    return localStorage.getItem(APE_SPEED_MODE_PREFS_KEY) === "1";
  } catch {
    return false;
  }
}

/** @internal test helper */
export function setApeSpeedModeEnabledForTests(enabled: boolean | null): void {
  prefsTestOverride = enabled;
}

export function saveApeSpeedModeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(APE_SPEED_MODE_PREFS_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore storage errors */
  }
  for (const listener of listeners) listener();
}

export function subscribeApeSpeedMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resolveHandPacingModeFromPrefs(): HandPacingMode {
  return getApeSpeedModeEnabled() ? "apeSpeed" : "classic";
}

/** Lock pacing for a hand on first access — toggles apply on the next hand only. */
export function lockHandPacingMode(handNumber: number): HandPacingMode {
  let mode = handLocks.get(handNumber);
  if (!mode) {
    mode = resolveHandPacingModeFromPrefs();
    handLocks.set(handNumber, mode);
    pruneHandLocks(handNumber);
  }
  return mode;
}

export function getHandPacingMode(handNumber: number): HandPacingMode {
  return handLocks.get(handNumber) ?? lockHandPacingMode(handNumber);
}

/** Active mode for bot presentation gates (set when the table hand advances). */
export function activateHandPacingModeForHand(handNumber: number): HandPacingMode {
  const mode = lockHandPacingMode(handNumber);
  activePacingMode = mode;
  return mode;
}

export function getActiveHandPacingMode(): HandPacingMode {
  return activePacingMode;
}

function pruneHandLocks(currentHandNumber: number): void {
  for (const key of handLocks.keys()) {
    if (key < currentHandNumber - 2) handLocks.delete(key);
  }
}

/** Reset locks — test helper only. */
export function resetHandPacingModeForTests(): void {
  handLocks.clear();
  activePacingMode = "classic";
  prefsTestOverride = null;
  listeners.clear();
}

/** Readable default: fixed stagger between seats (matches pre–Ape S. GSAP). */
export function classicAntePhaseDurationMs(
  participantCount: number,
  reducedMotion = false,
): number {
  const count = Math.max(1, participantCount);
  const scale = reducedMotion ? 0.35 : 1;
  const stagger = Math.round(BOT_PLAY_STAGGER_MS * scale);
  const travel = Math.round(CLASSIC_ANTE_CHIP_TRAVEL_MS * scale);
  const settle = Math.round(80 * scale);
  return (count - 1) * stagger + travel + settle;
}

/** Readable default: fixed stagger between seats (matches pre–Ape S. GSAP). */
export function buildClassicAnteCoinDelayPlan(
  handNumber: number,
  playerIds: string[],
  reducedMotion = false,
): AnteCoinDelayPlan {
  const scale = reducedMotion ? 0.35 : 1;
  const staggerMs = Math.round(BOT_PLAY_STAGGER_MS * scale);
  const travelMs = Math.round(CLASSIC_ANTE_CHIP_TRAVEL_MS * scale);
  const settleMs = Math.round(80 * scale);
  const thinkBeforeMs = playerIds.map((_, index) => (index === 0 ? 0 : staggerMs));
  const totalThinkMs = thinkBeforeMs.reduce((sum, ms) => sum + ms, 0);
  const totalDurationMs =
    playerIds.length < 1
      ? travelMs + settleMs
      : classicAntePhaseDurationMs(playerIds.length, reducedMotion);
  return {
    handNumber,
    playerIds: [...playerIds],
    thinkBeforeMs,
    totalThinkMs,
    travelMs,
    settleMs,
    totalDurationMs,
  };
}

export function resolveAnteCoinDelayPlan(
  handNumber: number,
  playerIds: string[],
  reducedMotion: boolean,
  pacingMode: HandPacingMode,
): AnteCoinDelayPlan {
  if (pacingMode === "apeSpeed") {
    return buildAnteCoinDelayPlan({
      handNumber,
      playerIds,
      reducedMotion,
    });
  }
  return buildClassicAnteCoinDelayPlan(handNumber, playerIds, reducedMotion);
}
