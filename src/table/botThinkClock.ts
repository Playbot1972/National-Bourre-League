/** Visible bot turn window — client-paced “thinking” before draw/play/enrollment actions. */
export const BOT_THINK_MIN_MS = 400;
export const BOT_THINK_MAX_MS = 2_500;

export interface BotThinkClock {
  activityKey: string;
  playerId: string;
  startedAtMs: number;
  durationMs: number;
  resolveAtMs: number;
}

let clock: BotThinkClock | null = null;

export function randomBotThinkDurationMs(rng: () => number = Math.random): number {
  const span = BOT_THINK_MAX_MS - BOT_THINK_MIN_MS;
  return Math.min(
    BOT_THINK_MAX_MS,
    BOT_THINK_MIN_MS + Math.floor(rng() * (span + 1)),
  );
}

export function ensureBotThinkClock(
  activityKey: string,
  playerId: string,
  nowMs: number = Date.now(),
  rng: () => number = Math.random,
): BotThinkClock {
  if (clock && clock.activityKey === activityKey && clock.playerId === playerId) {
    return clock;
  }
  const durationMs = randomBotThinkDurationMs(rng);
  clock = {
    activityKey,
    playerId,
    startedAtMs: nowMs,
    durationMs,
    resolveAtMs: nowMs + durationMs,
  };
  return clock;
}

export function getBotThinkClock(): BotThinkClock | null {
  return clock;
}

export function resetBotThinkClock(): void {
  clock = null;
}

export function isBotThinkClockBlocking(nowMs: number = Date.now()): boolean {
  if (!clock) return false;
  return nowMs < clock.resolveAtMs;
}

export function botThinkRemainingMs(nowMs: number = Date.now()): number {
  if (!clock) return 0;
  return Math.max(0, clock.resolveAtMs - nowMs);
}
