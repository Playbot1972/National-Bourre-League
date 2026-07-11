import {
  playBigWinSound,
  playBourreSound,
  playCardIllegalSound,
  playCardSelectSound,
  playDrawSound,
  playGameStartSound,
  playShuffleSound,
  playTrickWinSound,
  playUiButtonSound,
  unlockAudio,
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
import { recordTableAudioAudit } from "./audioAudit";
import { SOUND_EVENT_TRIGGER_TYPE } from "./soundPacks";

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
const CARD_SELECT_COOLDOWN_MS = 90;
const UI_BUTTON_COOLDOWN_MS = 120;

let lastShuffleAt = 0;
let lastDrawAt = 0;
let lastTrickWinAt = 0;
let lastBigWinAt = 0;
let lastBourreAt = 0;
let lastGameStartAt = 0;
let lastIllegalActionAt = 0;
let lastCardSelectAt = 0;
let lastUiButtonAt = 0;
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

function maybePlaySound(
  event: SoundEventKey,
  playFn: () => void,
  meta: { source: string; action?: string } = { source: "service" },
): void {
  const prefs = readPrefs();
  if (!shouldPlaySoundEvent(prefs.soundMode, event)) {
    recordTableAudioAudit({
      triggerType: SOUND_EVENT_TRIGGER_TYPE[event],
      event,
      result: "skipped-muted",
      fallbackReason: `soundMode:${prefs.soundMode}`,
      source: meta.source,
      action: meta.action ?? event,
    });
    return;
  }
  playFn();
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
  /** Use the heavier final shuffle sting (e.g. last deal card). */
  variant?: "normal" | "final";
}

export function playShuffleFeedback(options: ShuffleFeedbackOptions = {}): void {
  unlockIfInteractive();
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
    const variant = options.variant ?? "normal";
    maybePlaySound(
      variant === "final" ? "shuffleFinal" : "shuffle",
      () => playShuffleSound(variant, { source: "playShuffleFeedback", action: "deal-shuffle" }),
      { source: "playShuffleFeedback", action: "deal-shuffle" },
    );
    fireHaptic("light");
  }, delayMs);
}

function unlockIfInteractive(): void {
  void unlockAudio();
}

export function playDrawFeedback(): void {
  unlockIfInteractive();
  const now = Date.now();
  if (now - lastDrawAt < DRAW_COOLDOWN_MS) return;
  lastDrawAt = now;
  maybePlaySound("draw", () => playDrawSound({ source: "playDrawFeedback", action: "draw-replace" }), {
    source: "playDrawFeedback",
    action: "draw-replace",
  });
  fireHaptic("light");
}

export function playTrickWinFeedback(): void {
  const now = Date.now();
  if (now - lastTrickWinAt < TRICK_WIN_COOLDOWN_MS) return;
  lastTrickWinAt = now;
  maybePlaySound(
    "trickWin",
    () => playTrickWinSound(1, true, { source: "playTrickWinFeedback", action: "trick-won" }),
    { source: "playTrickWinFeedback", action: "trick-won" },
  );
  fireHaptic("medium");
}

export function playBigWinFeedback(): void {
  const now = Date.now();
  if (now - lastBigWinAt < BIG_WIN_COOLDOWN_MS) return;
  lastBigWinAt = now;
  maybePlaySound("bigWin", () => playBigWinSound({ source: "playBigWinFeedback", action: "hand-win" }), {
    source: "playBigWinFeedback",
    action: "hand-win",
  });
  fireHaptic("strong");
}

export function playBourreFeedback(): void {
  const now = Date.now();
  if (now - lastBourreAt < BOURRE_COOLDOWN_MS) return;
  lastBourreAt = now;
  maybePlaySound("bourre", () => playBourreSound({ source: "playBourreFeedback", action: "bourre" }), {
    source: "playBourreFeedback",
    action: "bourre",
  });
  fireHaptic("medium");
}

export function playGameStartFeedback(): void {
  const now = Date.now();
  if (now - lastGameStartAt < GAME_START_COOLDOWN_MS) return;
  lastGameStartAt = now;
  maybePlaySound(
    "gameStart",
    () => playGameStartSound({ source: "playGameStartFeedback", action: "game-start" }),
    { source: "playGameStartFeedback", action: "game-start" },
  );
  fireHaptic("light");
}

export function playIllegalActionFeedback(): void {
  unlockIfInteractive();
  const now = Date.now();
  if (now - lastIllegalActionAt < ILLEGAL_ACTION_COOLDOWN_MS) return;
  lastIllegalActionAt = now;
  maybePlaySound(
    "cardIllegal",
    () => playCardIllegalSound({ source: "playIllegalActionFeedback", action: "card-illegal" }),
    { source: "playIllegalActionFeedback", action: "card-illegal" },
  );
  fireHaptic("light");
}

export function playCardSelectFeedback(): void {
  unlockIfInteractive();
  const now = Date.now();
  if (now - lastCardSelectAt < CARD_SELECT_COOLDOWN_MS) return;
  lastCardSelectAt = now;
  maybePlaySound(
    "cardSelect",
    () => playCardSelectSound({ source: "playCardSelectFeedback", action: "card-select" }),
    { source: "playCardSelectFeedback", action: "card-select" },
  );
}

export function playUiButtonFeedback(): void {
  unlockIfInteractive();
  const now = Date.now();
  if (now - lastUiButtonAt < UI_BUTTON_COOLDOWN_MS) return;
  lastUiButtonAt = now;
  maybePlaySound(
    "uiButton",
    () => playUiButtonSound({ source: "playUiButtonFeedback", action: "ui-button" }),
    { source: "playUiButtonFeedback", action: "ui-button" },
  );
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
