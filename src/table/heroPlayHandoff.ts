import type { SerializedCard } from "./types";

export interface HeroPlayHandoffState {
  playKey: string;
  card: SerializedCard;
  slotIndex: number;
}

const HANDOFF_WATCHDOG_MS = 4_000;

let active: HeroPlayHandoffState | null = null;
let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function clearWatchdog() {
  if (watchdogTimer != null) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
}

function armWatchdog() {
  clearWatchdog();
  watchdogTimer = setTimeout(() => {
    watchdogTimer = null;
    if (!active) return;
    active = null;
    notify();
  }, HANDOFF_WATCHDOG_MS);
}

/** Begin bridging hero hand card until the trick slot enters visible travel. */
export function beginHeroPlayHandoff(state: HeroPlayHandoffState): void {
  active = state;
  armWatchdog();
  notify();
}

export function getHeroPlayHandoff(): HeroPlayHandoffState | null {
  return active;
}

export function isHeroPlayHandoffActive(playKey?: string): boolean {
  if (!active) return false;
  if (playKey) return active.playKey === playKey;
  return true;
}

/** Called when the hero trick slot starts fly-from-hand (visible travel). */
export function completeHeroPlayHandoff(playKey: string): void {
  if (active?.playKey !== playKey) return;
  active = null;
  clearWatchdog();
  notify();
}

export function cancelHeroPlayHandoff(): void {
  if (!active) return;
  active = null;
  clearWatchdog();
  notify();
}

export function subscribeHeroPlayHandoff(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
