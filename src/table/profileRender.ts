import type { ProfilerOnRenderCallback } from "react";

/** Log [PROFILE] when a subtree render exceeds the threshold (default 8ms). */
export function onRenderProfile(
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  thresholdMs = 8,
): void {
  if (actualDuration <= thresholdMs) return;
  console.log("[PROFILE]", {
    id,
    phase,
    actualDuration: Number(actualDuration.toFixed(2)),
    baseDuration: Number(baseDuration.toFixed(2)),
    startTime: Number(startTime.toFixed(2)),
    commitTime: Number(commitTime.toFixed(2)),
  });
}

export const tableOnRenderProfile: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  onRenderProfile(id, phase, actualDuration, baseDuration, startTime, commitTime);
};
