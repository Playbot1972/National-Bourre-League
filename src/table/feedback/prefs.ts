export const FEEDBACK_PREFS_KEY = "nbl-feedback";

export type HapticsMode = "on" | "minimal" | "off";
export type SoundMode = "on" | "minimal" | "off";

import {
  DEFAULT_SOUND_PACK_ID,
  normalizeSoundPackId,
  type SoundEventKey,
  type SoundPackId,
} from "./soundPacks";

export interface FeedbackPrefs {
  /** @deprecated Use soundMode — kept for migration reads */
  soundEnabled?: boolean;
  soundMode: SoundMode;
  soundPackId: SoundPackId;
  hapticsMode: HapticsMode;
}

const DEFAULT_PREFS: FeedbackPrefs = {
  soundMode: "on",
  soundPackId: DEFAULT_SOUND_PACK_ID,
  hapticsMode: "on",
};

function normalizePrefs(raw: unknown): FeedbackPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREFS };
  const o = raw as Record<string, unknown>;
  const hapticsRaw = o.hapticsMode;
  const hapticsMode: HapticsMode =
    hapticsRaw === "off" || hapticsRaw === "minimal" || hapticsRaw === "on"
      ? hapticsRaw
      : o.hapticsEnabled === false
        ? "off"
        : "on";

  let soundMode: SoundMode;
  if (o.soundMode === "on" || o.soundMode === "minimal" || o.soundMode === "off") {
    soundMode = o.soundMode;
  } else if (o.soundEnabled === false) {
    soundMode = "off";
  } else {
    soundMode = "on";
  }

  return {
    soundMode,
    soundPackId: normalizeSoundPackId(o.soundPackId),
    hapticsMode,
  };
}

export function getFeedbackPrefs(): FeedbackPrefs {
  try {
    const stored = localStorage.getItem(FEEDBACK_PREFS_KEY);
    if (!stored) return { ...DEFAULT_PREFS };
    return normalizePrefs(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveFeedbackPrefs(partial: Partial<FeedbackPrefs>): FeedbackPrefs {
  const next = { ...getFeedbackPrefs(), ...partial };
  try {
    localStorage.setItem(FEEDBACK_PREFS_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
  notifyPrefsListeners(next);
  return next;
}

/** Whether a sound event should play given the user's sound level preference. */
export function shouldPlaySoundEvent(mode: SoundMode, event: SoundEventKey): boolean {
  if (mode === "off") return false;
  if (mode === "on") return true;
  // Minimal — only meaningful gameplay moments, skip ambient cues
  return (
    event === "trickWin" ||
    event === "bigWin" ||
    event === "botHandWin" ||
    event === "bourre"
  );
}

type PrefsListener = (prefs: FeedbackPrefs) => void;
const listeners = new Set<PrefsListener>();

export function subscribeFeedbackPrefs(listener: PrefsListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyPrefsListeners(prefs: FeedbackPrefs): void {
  for (const listener of listeners) {
    listener(prefs);
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldUseHaptics(mode: HapticsMode, intensity: "light" | "medium" | "strong"): boolean {
  if (mode === "off") return false;
  if (mode === "minimal" && intensity === "light") return false;
  if (prefersReducedMotion() && intensity === "light") return false;
  return true;
}
