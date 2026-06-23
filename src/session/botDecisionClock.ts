/** Visible bot play/pass decision window (client-paced; server deadline stays 15s). */
export const BOT_DECISION_DELAY_MIN_MS = 400;
export const BOT_DECISION_DELAY_MAX_MS = 2500;

export interface BotDecisionClock {
  playerId: string;
  startedAtMs: number;
  resolveAtMs: number;
  totalMs: number;
}

export function randomBotDecisionDelayMs(rng: () => number = Math.random): number {
  const span = BOT_DECISION_DELAY_MAX_MS - BOT_DECISION_DELAY_MIN_MS;
  return BOT_DECISION_DELAY_MIN_MS + Math.floor(rng() * (span + 1));
}

export function startBotDecisionClock(
  playerId: string,
  nowMs: number,
  rng: () => number = Math.random,
): BotDecisionClock {
  const totalMs = randomBotDecisionDelayMs(rng);
  return {
    playerId,
    startedAtMs: nowMs,
    resolveAtMs: nowMs + totalMs,
    totalMs,
  };
}

export function computeBotDecisionCountdown(
  nowMs: number,
  clock: BotDecisionClock | null | undefined,
): { fraction: number; secondsLeft: number; expired: boolean } {
  if (!clock) {
    return { fraction: 0, secondsLeft: 0, expired: false };
  }
  const msLeft = Math.max(0, clock.resolveAtMs - nowMs);
  const fraction = clock.totalMs > 0 ? msLeft / clock.totalMs : 0;
  const secondsLeft = Math.max(0, Math.ceil(msLeft / 1000));
  return { fraction, secondsLeft, expired: msLeft <= 0 };
}

export function botDecisionClockKey(
  sessionId: string,
  handNumber: number,
  decisionIndex: number,
): string {
  return `${sessionId}:${handNumber}:${decisionIndex}`;
}
