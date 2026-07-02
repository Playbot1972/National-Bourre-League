import {
  resolveTableActiveActorId,
  turnCountdownActivityKey,
  TURN_COUNTDOWN_MS,
  type TurnCountdownInput,
} from "./turnCountdown";
import { isRobotPlayerId } from "../session/handPhaseMachine";
import { ensureBotThinkClock, resetBotThinkClock } from "./botThinkClock";

/** Config-only snapshot — timer ticks run locally inside TurnCountdownRing. */
export interface TurnCountdownConfig {
  playerId: string;
  activityKey: string;
  startedAtMs: number;
  durationMs: number;
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
    prev.startedAtMs !== next.startedAtMs ||
    prev.durationMs !== next.durationMs
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
    const startedAtMs = Date.now();
    const durationMs = isRobotPlayerId(nextActorId)
      ? ensureBotThinkClock(nextActivityKey, nextActorId, startedAtMs).durationMs
      : TURN_COUNTDOWN_MS;
    publish({
      playerId: nextActorId,
      activityKey: nextActivityKey,
      startedAtMs,
      durationMs,
    });
    return;
  }

  if (config.playerId !== nextActorId) {
    const durationMs = isRobotPlayerId(nextActorId)
      ? ensureBotThinkClock(nextActivityKey, nextActorId, config.startedAtMs).durationMs
      : TURN_COUNTDOWN_MS;
    publish({ ...config, playerId: nextActorId, durationMs });
  }
}

export function disposeTurnCountdownEngine(): void {
  config = null;
  resetBotThinkClock();
  emit();
}
