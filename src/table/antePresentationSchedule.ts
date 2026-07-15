import type { AnteCoinDelayPlan } from "../session/botActionTiming";
import { scaledDuration } from "./animations/motionTokens";

/** One seat segment on the authoritative ante GSAP timeline (seconds). */
export interface AnteSeatTimelineEntry {
  playerId: string;
  seatIndex: number;
  thinkStartSec: number;
  thinkDurationSec: number;
  coinSpawnSec: number;
  travelSec: number;
  settleSec: number;
  segmentEndSec: number;
}

/** Build the same cumulative schedule used by `runClockwiseAnteCoinPresentation`. */
export function buildAntePresentationSchedule(
  plan: AnteCoinDelayPlan,
  reducedMotion: boolean,
): AnteSeatTimelineEntry[] {
  const travelSec = scaledDuration(plan.travelMs / 1000, reducedMotion);
  const settleSec = scaledDuration(plan.settleMs / 1000, reducedMotion);
  const entries: AnteSeatTimelineEntry[] = [];
  let cumulativeSec = 0;

  for (let index = 0; index < plan.playerIds.length; index += 1) {
    const thinkDurationSec = (plan.thinkBeforeMs[index] ?? 0) / 1000;
    cumulativeSec += thinkDurationSec;
    const coinSpawnSec = cumulativeSec;
    entries.push({
      playerId: plan.playerIds[index]!,
      seatIndex: index,
      thinkStartSec: coinSpawnSec - thinkDurationSec,
      thinkDurationSec,
      coinSpawnSec,
      travelSec,
      settleSec,
      segmentEndSec: coinSpawnSec + travelSec + settleSec,
    });
    cumulativeSec += travelSec + settleSec;
  }

  return entries;
}

export function antePresentationTotalSec(schedule: AnteSeatTimelineEntry[]): number {
  const last = schedule[schedule.length - 1];
  return last ? last.segmentEndSec : 0;
}

/** Active think window at GSAP timeline seconds (null during travel/settle gaps). */
export function resolveAnteThinkAtTimelineSec(
  elapsedSec: number,
  schedule: AnteSeatTimelineEntry[],
): AnteSeatTimelineEntry | null {
  for (const entry of schedule) {
    if (entry.thinkDurationSec <= 0) continue;
    const thinkEndSec = entry.thinkStartSec + entry.thinkDurationSec;
    if (elapsedSec >= entry.thinkStartSec && elapsedSec < thinkEndSec) {
      return entry;
    }
  }
  return null;
}
