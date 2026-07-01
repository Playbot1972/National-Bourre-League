import {
  resolveTableActiveActorId,
  turnCountdownActivityKey,
  type TurnCountdownInput,
} from "./turnCountdown";

/** Config-only snapshot — timer ticks run locally inside TurnCountdownRing. */
export interface TurnCountdownConfig {
  playerId: string;
  activityKey: string;
  startedAtMs: number;
}

let config: TurnCountdownConfig | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function configChanged(prev: TurnCountdownConfig | null, next: TurnCountdownConfig | null): boolean {
  if (prev === next) return false;
  if (!prev || !next) return true;
  return (
    prev.playerId !== next.playerId ||
    prev.activityKey !== next.activityKey ||
    prev.startedAtMs !== next.startedAtMs
  );
}

function publish(next: TurnCountdownConfig | null): void {
  if (!configChanged(config, next)) return;
  config = next;
  emit();
}

export function subscribeTurnCountdownConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTurnCountdownConfig(): TurnCountdownConfig | null {
  return config;
}

/** Sync turn timer ownership — no interval ticks at the store layer. */
export function syncTurnCountdownEngine(input: TurnCountdownInput): void {
  const nextActorId = resolveTableActiveActorId(input);
  const nextActivityKey = turnCountdownActivityKey({ ...input, activeActorId: nextActorId });

  if (!nextActorId) {
    publish(null);
    return;
  }

  if (!config || config.activityKey !== nextActivityKey) {
    publish({
      playerId: nextActorId,
      activityKey: nextActivityKey,
      startedAtMs: Date.now(),
    });
    return;
  }

  if (config.playerId !== nextActorId) {
    publish({ ...config, playerId: nextActorId });
  }
}

export function disposeTurnCountdownEngine(): void {
  config = null;
  emit();
}
