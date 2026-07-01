import type { ProfilerOnRenderCallback } from "react";

export const TABLE_RENDER_PROFILE_DEBUG_KEY = "nbl-table-render-profile";

/** Node/tests only — simulate import.meta.env.DEV without a Vite dev server. */
let devModeOverrideForTests: boolean | undefined;

export function setTableRenderProfileDevForTests(value?: boolean): void {
  devModeOverrideForTests = value;
}

function isDevEnvironment(): boolean {
  if (devModeOverrideForTests !== undefined) return devModeOverrideForTests;
  return typeof import.meta !== "undefined" && import.meta.env?.DEV === true;
}

export function isTableRenderProfileEnabled(): boolean {
  if (isDevEnvironment()) return true;
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage?.getItem(TABLE_RENDER_PROFILE_DEBUG_KEY) === "1") return true;
    return new URLSearchParams(window.location.search).get("tableProfile") === "1";
  } catch {
    return false;
  }
}

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
  if (!isTableRenderProfileEnabled()) return;
  onRenderProfile(id, phase, actualDuration, baseDuration, startTime, commitTime);
};
