import {
  buildTurnCountdownState,
  resolveTableActiveActorId,
  turnCountdownActivityKey,
  type TurnCountdownInput,
  type TurnCountdownState,
} from "./turnCountdown";
import { prefersReducedMotion } from "./trickTiming";

let snapshot: TurnCountdownState | null = null;
const listeners = new Set<() => void>();

let intervalId: number | null = null;
let startedAtMs: number | null = null;
let lastActivityKey = "";
let activeActorId: string | null = null;

function clearTicker(): void {
  if (intervalId != null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function countdownChanged(
  prev: TurnCountdownState | null,
  next: TurnCountdownState | null,
): boolean {
  if (prev === next) return false;
  if (!prev || !next) return true;
  if (prev.playerId !== next.playerId || prev.segment !== next.segment) return true;
  return Math.abs(prev.progress - next.progress) > 0.004;
}

function publish(next: TurnCountdownState | null): void {
  if (!countdownChanged(snapshot, next)) return;
  snapshot = next;
  emit();
}

function tickNow(): void {
  if (!activeActorId || startedAtMs == null) return;
  publish(buildTurnCountdownState(activeActorId, startedAtMs, Date.now()));
}

function ensureTicker(): void {
  if (intervalId != null || !activeActorId) return;
  const intervalMs = prefersReducedMotion() ? 250 : 100;
  intervalId = window.setInterval(tickNow, intervalMs);
}

export function subscribeTurnCountdown(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTurnCountdownSnapshot(): TurnCountdownState | null {
  return snapshot;
}

/** Imperative turn timer — updates external store without parent React state. */
export function syncTurnCountdownEngine(input: TurnCountdownInput): void {
  const nextActorId = resolveTableActiveActorId(input);
  const nextActivityKey = turnCountdownActivityKey({ ...input, activeActorId: nextActorId });

  if (!nextActorId) {
    activeActorId = null;
    startedAtMs = null;
    lastActivityKey = nextActivityKey;
    clearTicker();
    publish(null);
    return;
  }

  if (nextActivityKey !== lastActivityKey || startedAtMs == null) {
    startedAtMs = Date.now();
    lastActivityKey = nextActivityKey;
    activeActorId = nextActorId;
    publish(buildTurnCountdownState(nextActorId, startedAtMs, Date.now()));
  } else {
    activeActorId = nextActorId;
  }

  ensureTicker();
}

export function disposeTurnCountdownEngine(): void {
  clearTicker();
  activeActorId = null;
  startedAtMs = null;
  lastActivityKey = "";
  snapshot = null;
  emit();
}
