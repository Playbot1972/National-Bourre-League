import type { AnteCoinDelayPlan } from "../session/botActionTiming";
import {
  buildDurationCountdownState,
  type TurnCountdownSegment,
  type TurnCountdownState,
} from "./turnCountdown";

export interface AnteSeatThinkWindow {
  playerId: string;
  seatIndex: number;
  thinkStartMs: number;
  thinkDurationMs: number;
}

export interface AnteSeatCountdownInput {
  playerIds: string[];
  plan: AnteCoinDelayPlan | null;
  startedAtMs: number | null;
  nowMs: number;
}

/** Build clockwise think windows from the cached ante delay plan. */
export function buildAnteSeatThinkWindows(
  playerIds: string[],
  thinkBeforeMs: number[],
): AnteSeatThinkWindow[] {
  const windows: AnteSeatThinkWindow[] = [];
  let cursor = 0;
  for (let index = 0; index < playerIds.length; index += 1) {
    const thinkDurationMs = Math.max(0, thinkBeforeMs[index] ?? 0);
    if (thinkDurationMs <= 0) {
      continue;
    }
    windows.push({
      playerId: playerIds[index]!,
      seatIndex: index,
      thinkStartMs: cursor,
      thinkDurationMs,
    });
    cursor += thinkDurationMs;
    cursor += 0; // travel handled separately in GSAP; ring is think-only
  }
  return windows;
}

export function anteSeatCountdownKey(
  sessionId: string,
  handNumber: number,
  playerIds: string[],
): string {
  return `${sessionId}:${handNumber}:ante:${playerIds.join(",")}`;
}

/** Which seat is in its ante think window at elapsed ms (clockwise order). */
export function resolveAnteSeatThinkAtElapsed(
  elapsedMs: number,
  playerIds: string[],
  thinkBeforeMs: number[],
  seatGapMs: number,
): AnteSeatThinkWindow | null {
  let cursor = 0;
  for (let index = 0; index < playerIds.length; index += 1) {
    const thinkDurationMs = Math.max(0, thinkBeforeMs[index] ?? 0);
    const thinkEndMs = cursor + thinkDurationMs;
    if (thinkDurationMs > 0 && elapsedMs >= cursor && elapsedMs < thinkEndMs) {
      return {
        playerId: playerIds[index]!,
        seatIndex: index,
        thinkStartMs: cursor,
        thinkDurationMs,
      };
    }
    cursor = thinkEndMs + Math.max(0, seatGapMs);
  }
  return null;
}

export function buildAnteSeatCountdownState(input: AnteSeatCountdownInput): TurnCountdownState | null {
  const { playerIds, plan, startedAtMs, nowMs } = input;
  if (!plan || startedAtMs == null || playerIds.length < 1) return null;

  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const seatGapMs = plan.travelMs + plan.settleMs;
  const active = resolveAnteSeatThinkAtElapsed(
    elapsedMs,
    playerIds,
    plan.thinkBeforeMs,
    seatGapMs,
  );
  if (!active) return null;

  const windowStartedAt = startedAtMs + active.thinkStartMs;
  return buildDurationCountdownState(
    active.playerId,
    windowStartedAt,
    nowMs,
    active.thinkDurationMs,
  );
}

export function anteSeatCountdownSegment(
  remainingMs: number,
  totalMs: number,
): TurnCountdownSegment {
  if (totalMs <= 0) return "red";
  const ratio = remainingMs / totalMs;
  if (ratio > 2 / 3) return "green";
  if (ratio > 1 / 3) return "yellow";
  return "red";
}
