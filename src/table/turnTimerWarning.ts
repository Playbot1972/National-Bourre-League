/** Elapsed ms from ring start before the looping timer warning may begin. */
export const TURN_TIMER_WARNING_START_ELAPSED_MS = 15_000;

export type TurnTimerWarningStopReason =
  | "playerAction"
  | "timeout"
  | "turnChange"
  | "cleanup"
  | "overlap";

/** Delay until timer warning should start (0 = start immediately). */
export function turnTimerWarningDelayMs(ringStartedAtMs: number, nowMs: number): number {
  const elapsed = Math.max(0, nowMs - ringStartedAtMs);
  return Math.max(0, TURN_TIMER_WARNING_START_ELAPSED_MS - elapsed);
}

export function turnCountdownElapsedMs(ringStartedAtMs: number, nowMs: number): number {
  return Math.max(0, nowMs - ringStartedAtMs);
}

export function shouldStartTurnTimerWarning(
  elapsedMs: number,
  alreadyStarted: boolean,
): boolean {
  return !alreadyStarted && elapsedMs >= TURN_TIMER_WARNING_START_ELAPSED_MS;
}
