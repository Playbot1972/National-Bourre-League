import { playBigWinSound, playShuffleSound, playTrickWinSound, unlockAudio } from "./audio";
import { triggerHaptic } from "./haptics";
import {
  getFeedbackPrefs,
  prefersReducedMotion,
  shouldUseHaptics,
  type FeedbackPrefs,
} from "./prefs";

/** Align with `.bpot__card` deal-in stagger in table.css */
export const DEAL_ANIM_STAGGER_MS = 80;
export const DEAL_ANIM_DURATION_MS = 500;

const SHUFFLE_COOLDOWN_MS = 700;
const TRICK_WIN_COOLDOWN_MS = 450;
const BIG_WIN_COOLDOWN_MS = 1200;
const ILLEGAL_ACTION_COOLDOWN_MS = 280;

let lastShuffleAt = 0;
let lastTrickWinAt = 0;
let lastBigWinAt = 0;
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

export function initGameFeedback(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const unlock = () => {
    void unlockAudio();
  };
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export interface ShuffleFeedbackOptions {
  /** Delay before audio/haptic to match deal animation (ms). */
  delayMs?: number;
}

export function playShuffleFeedback(options: ShuffleFeedbackOptions = {}): void {
  const prefs = readPrefs();
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
    if (prefs.soundEnabled) playShuffleSound();
    fireHaptic("light");
  }, delayMs);
}

export function playTrickWinFeedback(): void {
  const prefs = readPrefs();
  const now = Date.now();
  if (now - lastTrickWinAt < TRICK_WIN_COOLDOWN_MS) return;
  lastTrickWinAt = now;
  if (prefs.soundEnabled) playTrickWinSound();
  fireHaptic("medium");
}

export function playBigWinFeedback(): void {
  const prefs = readPrefs();
  const now = Date.now();
  if (now - lastBigWinAt < BIG_WIN_COOLDOWN_MS) return;
  lastBigWinAt = now;
  if (prefs.soundEnabled) playBigWinSound();
  fireHaptic("strong");
}

export function playIllegalActionFeedback(): void {
  const now = Date.now();
  if (now - lastIllegalActionAt < ILLEGAL_ACTION_COOLDOWN_MS) return;
  lastIllegalActionAt = now;
  fireHaptic("light");
}

export function playActionSuccessFeedback(): void {
  fireHaptic("light");
}

export {
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
  prefersReducedMotion,
  type FeedbackPrefs,
  type HapticsMode,
} from "./prefs";
