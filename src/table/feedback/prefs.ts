export const FEEDBACK_PREFS_KEY = "nbl-feedback";

export type HapticsMode = "on" | "minimal" | "off";

export interface FeedbackPrefs {
  soundEnabled: boolean;
  hapticsMode: HapticsMode;
}

const DEFAULT_PREFS: FeedbackPrefs = {
  soundEnabled: true,
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
  return {
    soundEnabled: o.soundEnabled !== false,
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
