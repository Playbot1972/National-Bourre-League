import type { AnteCoinDelayPlan } from "../session/botActionTiming";
import {
  buildAntePresentationSchedule,
  buildAnteRingStateAtTimelineSec,
  type AnteSeatTimelineEntry,
} from "./antePresentationSchedule";

export type { AnteSeatTimelineEntry };

export interface AnteSeatCountdownInput {
  schedule: AnteSeatTimelineEntry[];
  elapsedSec: number | null;
}

export function anteSeatCountdownKey(
  sessionId: string,
  handNumber: number,
  playerIds: string[],
): string {
  return `${sessionId}:${handNumber}:ante:${playerIds.join(",")}`;
}

export function buildAnteSeatCountdownState(input: AnteSeatCountdownInput) {
  const { schedule, elapsedSec } = input;
  if (elapsedSec == null || schedule.length < 1) return null;
  return buildAnteRingStateAtTimelineSec(elapsedSec, schedule);
}

export function buildAnteSeatCountdownFromPlan(
  plan: AnteCoinDelayPlan,
  reducedMotion: boolean,
  elapsedSec: number | null,
) {
  if (elapsedSec == null) return null;
  const schedule = buildAntePresentationSchedule(plan, reducedMotion);
  return buildAnteRingStateAtTimelineSec(elapsedSec, schedule);
}
