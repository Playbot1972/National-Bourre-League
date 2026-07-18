import type { TurnCountdownSegment, TurnCountdownState } from "./turnCountdown";

/** Visible bot play think window — one stable draw per eligible turn. */
export interface BotThinkWindow {
  turnKey: string;
  playerId: string;
  startedAtMs: number;
  totalMs: number;
  /** When set, ring countdown runs from this instant; null/0 = ring shell only. */
  countingStartedAtMs?: number | null;
}

let currentWindow: BotThinkWindow | null = null;
const listeners = new Set<() => void>();

export function isRobotPlayerId(playerId: string | null | undefined): boolean {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

export function botPlayTurnKey(input: {
  handNumber?: number | null;
  trickNumber?: number | null;
  turnPlayerId?: string | null;
}): string {
  return `${input.handNumber ?? 0}:${input.trickNumber ?? 0}:${input.turnPlayerId ?? ""}`;
}

export function publishBotThinkWindow(window: BotThinkWindow | null): void {
  currentWindow = window;
  for (const listener of listeners) listener();
}

export function getBotThinkWindow(): BotThinkWindow | null {
  return currentWindow;
}

export function subscribeBotThinkWindow(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Segment thresholds scaled to the active bot think duration. */
export function botThinkCountdownSegment(
  remainingMs: number,
  totalMs: number,
): TurnCountdownSegment {
  if (totalMs <= 0) return "red";
  const ratio = remainingMs / totalMs;
  if (ratio > 2 / 3) return "green";
  if (ratio > 1 / 3) return "yellow";
  return "red";
}

/** Ring state for a fixed-duration bot think window (not the 15s human cycle). */
export function buildBotThinkCountdownState(
  playerId: string,
  startedAtMs: number,
  totalMs: number,
  nowMs: number,
  activationDelayMs = 0,
  countingStartedAtMs?: number | null,
): TurnCountdownState | null {
  if (totalMs <= 0) return null;
  const countFrom =
    countingStartedAtMs != null
      ? countingStartedAtMs
      : startedAtMs > 0
        ? startedAtMs
        : null;
  if (countFrom == null || countFrom <= 0) {
    return {
      playerId,
      remainingMs: totalMs,
      progress: 1,
      segment: "green",
    };
  }
  const elapsed = Math.max(0, nowMs - countFrom - activationDelayMs);
  const remainingMs = Math.max(0, totalMs - elapsed);
  return {
    playerId,
    remainingMs,
    progress: remainingMs / totalMs,
    segment: botThinkCountdownSegment(remainingMs, totalMs),
  };
}
