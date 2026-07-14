import {
  playBigWinSound,
  playBourreSound,
  playCardIllegalSound,
  playCardSelectSound,
  playDeleteRoomSound,
  playDrawCountSound,
  playFoldSound,
  playGameStartSound,
  playOpenRoomSound,
  playShuffleSound,
  playTrickWinSound,
  playUiButtonSound,
  ensureAudioUnlockedSync,
} from "./audio";
import { triggerHaptic } from "./haptics";
import {
  getFeedbackPrefs,
  prefersReducedMotion,
  shouldPlaySoundEvent,
  shouldUseHaptics,
  type FeedbackPrefs,
} from "./prefs";
import type { SoundEventKey } from "./soundPacks";

/** Align with `.bpot__card` deal-in stagger in table.css */
export const DEAL_ANIM_STAGGER_MS = 80;
export const DEAL_ANIM_DURATION_MS = 500;

const SHUFFLE_COOLDOWN_MS = 700;
const DRAW_COOLDOWN_MS = 500;
const TRICK_WIN_COOLDOWN_MS = 450;
const BIG_WIN_COOLDOWN_MS = 1200;
const BOURRE_COOLDOWN_MS = 2000;
const GAME_START_COOLDOWN_MS = 1500;
const ILLEGAL_ACTION_COOLDOWN_MS = 280;

let lastShuffleAt = 0;
let lastDrawAt = 0;
let lastTrickWinAt = 0;
let lastBigWinAt = 0;
let lastBourreAt = 0;
let lastGameStartAt = 0;
let lastIllegalActionAt = 0;
let shuffleTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

function readPrefs(): FeedbackPrefs {
  return getFeedbackPrefs();
}

function fireHaptic(intensity: "light" | "medium" | "strong"): void {
  const prefs = readPrefs();
  if (!shouldUseHaptics(prefs.hapticsMode, intensity)) return;
  triggerHaptic(intensity);
}

function maybePlaySound(event: SoundEventKey, playFn: () => void): void {
  const prefs = readPrefs();
  if (!shouldPlaySoundEvent(prefs.soundMode, event)) return;
  playFn();
}

export function initGameFeedback(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const unlock = () => {
    ensureAudioUnlockedSync("init-pointerdown");
  };
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export interface ShuffleFeedbackOptions {
  /** Delay before audio/haptic to match deal animation (ms). */
  delayMs?: number;
}

export function playShuffleFeedback(options: ShuffleFeedbackOptions = {}): void {
  const now = Date.now();
  if (now - lastShuffleAt < SHUFFLE_COOLDOWN_MS) return;

  if (shuffleTimer) {
    clearTimeout(shuffleTimer);
    shuffleTimer = null;
  }

  const delayMs =
    options.delayMs ??
    (prefersReducedMotion() ? 0 : Math.round(DEAL_ANIM_STAGGER_MS * 0.5));

  shuffleTimer = window.setTimeout(() => {
    shuffleTimer = null;
    lastShuffleAt = Date.now();
    maybePlaySound("shuffle", playShuffleSound);
    fireHaptic("light");
  }, delayMs);
}

export function playDrawCountFeedback(cardCount: number): void {
  ensureAudioUnlockedSync("draw-confirm");
  const now = Date.now();
  if (now - lastDrawAt < DRAW_COOLDOWN_MS) return;
  lastDrawAt = now;
  maybePlaySound("draw", () => playDrawCountSound(cardCount));
  fireHaptic("light");
}

/** @deprecated Prefer playDrawCountFeedback on draw confirm; generic fallback only. */
export function playDrawFeedback(): void {
  playDrawCountFeedback(0);
}

export function playTrickWinFeedback(): void {
  const now = Date.now();
  if (now - lastTrickWinAt < TRICK_WIN_COOLDOWN_MS) return;
  lastTrickWinAt = now;
  maybePlaySound("trickWin", playTrickWinSound);
  fireHaptic("medium");
}

export function playBigWinFeedback(): void {
  const now = Date.now();
  if (now - lastBigWinAt < BIG_WIN_COOLDOWN_MS) return;
  lastBigWinAt = now;
  maybePlaySound("bigWin", playBigWinSound);
  fireHaptic("strong");
}

export function playBourreFeedback(): void {
  const now = Date.now();
  if (now - lastBourreAt < BOURRE_COOLDOWN_MS) return;
  lastBourreAt = now;
  maybePlaySound("bourre", playBourreSound);
  fireHaptic("medium");
}

export function playGameStartFeedback(): void {
  const now = Date.now();
  if (now - lastGameStartAt < GAME_START_COOLDOWN_MS) return;
  lastGameStartAt = now;
  maybePlaySound("gameStart", playGameStartSound);
  fireHaptic("light");
}

export function playIllegalActionFeedback(): void {
  const now = Date.now();
  if (now - lastIllegalActionAt < ILLEGAL_ACTION_COOLDOWN_MS) return;
  lastIllegalActionAt = now;
  maybePlaySound("cardIllegal", playCardIllegalSound);
  fireHaptic("light");
}

export function playOpenRoomFeedback(): void {
  maybePlaySound("openRoom", playOpenRoomSound);
}

export function playDeleteRoomFeedback(): void {
  maybePlaySound("deleteRoom", playDeleteRoomSound);
}

export function playCardSelectFeedback(): void {
  maybePlaySound("cardSelect", playCardSelectSound);
}

export function playUiButtonFeedback(): void {
  maybePlaySound("uiButton", playUiButtonSound);
}

export function playFoldFeedback(): void {
  maybePlaySound("fold", playFoldSound);
}

export function playActionSuccessFeedback(): void {
  fireHaptic("light");
}

export {
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
  prefersReducedMotion,
  shouldPlaySoundEvent,
  type FeedbackPrefs,
  type HapticsMode,
  type SoundMode,
} from "./prefs";
export { resetSoundAssetCache } from "./audio";
