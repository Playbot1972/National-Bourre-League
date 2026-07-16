import type { SerializedCard } from "./types";

export interface HeroPlayHandoffState {
  playKey: string;
  card: SerializedCard;
  slotIndex: number;
  /** Index in currentTrick.plays once the server play is known. */
  trickIndex: number | null;
}

const HANDOFF_WATCHDOG_MS = 4_000;

let active: HeroPlayHandoffState | null = null;
let tableEstablished = false;
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
    tableEstablished = false;
    notify();
  }, HANDOFF_WATCHDOG_MS);
}

/** Begin bridging hero hand card until the trick slot is a readable table presence. */
export function beginHeroPlayHandoff(
  state: Omit<HeroPlayHandoffState, "trickIndex"> & { trickIndex?: number | null },
): void {
  active = {
    ...state,
    trickIndex: state.trickIndex ?? null,
  };
  tableEstablished = false;
  armWatchdog();
  notify();
}

export function setHeroPlayTrickIndex(trickIndex: number): void {
  if (!active) return;
  if (active.trickIndex === trickIndex) return;
  active = { ...active, trickIndex };
  notify();
}

export function isHeroTableEstablished(): boolean {
  return !active || tableEstablished;
}

/** Opponent slots after the hero play wait until the hero card is established on the table. */
export function shouldDeferOpponentFly(slotIndex: number): boolean {
  if (!active || tableEstablished) return false;
  if (active.trickIndex == null) return false;
  return slotIndex > active.trickIndex;
}

export function getHeroPlayHandoff(): HeroPlayHandoffState | null {
  return active;
}

export function isHeroPlayHandoffActive(playKey?: string): boolean {
  if (!active) return false;
  if (playKey) return active.playKey === playKey;
  return true;
}

/** Called when the hero trick card has landed — hand ghost may clear. */
export function completeHeroPlayHandoff(playKey: string): void {
  if (active?.playKey !== playKey) return;
  tableEstablished = true;
  active = null;
  clearWatchdog();
  notify();
}

export function cancelHeroPlayHandoff(): void {
  if (!active) return;
  active = null;
  tableEstablished = false;
  clearWatchdog();
  notify();
}

export function subscribeHeroPlayHandoff(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
