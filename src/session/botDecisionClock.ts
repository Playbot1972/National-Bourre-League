/** Client-paced bot play/pass delay — independent of the visual avatar ring. */

export const BOT_DECISION_DELAY_MIN_MS = 400;
export const BOT_DECISION_DELAY_MAX_MS = 2500;

export interface BotDecisionClock {
  playerId: string;
  deadlineMs: number;
}

export function botDecisionClockKey(
  sessionId: string,
  handNumber: number,
  turnIndex: number,
): string {
  return `${sessionId}:${handNumber}:${turnIndex}`;
}

/** Random delay in [400ms, 2500ms] for the active bot seat. */
export function startBotDecisionClock(playerId: string, nowMs = Date.now()): BotDecisionClock {
  const span = BOT_DECISION_DELAY_MAX_MS - BOT_DECISION_DELAY_MIN_MS;
  const delay = BOT_DECISION_DELAY_MIN_MS + Math.random() * span;
  return { playerId, deadlineMs: nowMs + delay };
}

export function computeBotDecisionCountdown(
  nowMs: number,
  clock: BotDecisionClock | null | undefined,
): { expired: boolean; secondsLeft: number } {
  if (!clock) return { expired: true, secondsLeft: 0 };
  const msLeft = Math.max(0, clock.deadlineMs - nowMs);
  return {
    expired: msLeft <= 0,
    secondsLeft: Math.max(0, Math.ceil(msLeft / 1000)),
  };
}
