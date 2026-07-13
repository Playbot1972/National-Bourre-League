import { isGameFlowDebugEnabled } from "./gameFlowDebug";

const SLOW_MODE_KEY = "nbl-ante-debug-slow";

let sequenceOriginMs: number | null = null;
let firstLaunchMs: number | null = null;
let firstLandMs: number | null = null;
let lastLandMs: number | null = null;
let lastHandNumber: number | null = null;

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function isAnteTimingDebugEnabled(): boolean {
  if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
    return true;
  }
  return isGameFlowDebugEnabled();
}

/** `?anteDebugSlow=1` or localStorage `nbl-ante-debug-slow=1` — exaggerates ante motion for QA. */
export function isAnteDebugSlowMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage?.getItem(SLOW_MODE_KEY) === "1") return true;
    return new URLSearchParams(window.location.search).has("anteDebugSlow");
  } catch {
    return false;
  }
}

export function anteTimingMultiplier(): number {
  return isAnteDebugSlowMode() ? 2.2 : 1;
}

function resetMarks(handNumber: number): void {
  if (lastHandNumber !== handNumber) {
    sequenceOriginMs = null;
    firstLaunchMs = null;
    firstLandMs = null;
    lastLandMs = null;
    lastHandNumber = handNumber;
  }
}

function formatElapsed(ms: number | null): string {
  return ms == null ? "n/a" : `${ms}ms`;
}

/** @internal test helper */
export function _resetAnteTimingDebugForTests(): void {
  sequenceOriginMs = null;
  firstLaunchMs = null;
  firstLandMs = null;
  lastLandMs = null;
  lastHandNumber = null;
}

export type AnteTimingEvent =
  | "ante-armed"
  | "sequence-start"
  | "player-launch"
  | "player-landed"
  | "sound-requested"
  | "sequence-complete"
  | "deal-start";

export function anteTimingMark(
  event: AnteTimingEvent,
  detail: Record<string, unknown> = {},
): void {
  if (!isAnteTimingDebugEnabled()) return;

  const t = nowMs();
  const wall = Date.now();
  resetMarks(typeof detail.handNumber === "number" ? detail.handNumber : lastHandNumber ?? -1);

  if (event === "sequence-start") {
    sequenceOriginMs = t;
    firstLaunchMs = null;
    firstLandMs = null;
    lastLandMs = null;
  } else if (event === "player-launch" && firstLaunchMs == null) {
    firstLaunchMs = t;
  } else if (event === "player-landed") {
    if (firstLandMs == null) firstLandMs = t;
    lastLandMs = t;
  }

  const payload: Record<string, unknown> = {
    ...detail,
    wallTs: wall,
    perfMs: Math.round(t),
    sinceSequenceStart: formatElapsed(sequenceOriginMs),
    slowMode: isAnteDebugSlowMode(),
  };

  if (event === "player-launch" && firstLaunchMs != null && sequenceOriginMs != null) {
    payload.sinceSequenceStartToFirstLaunch = formatElapsed(sequenceOriginMs);
  }
  if (event === "player-landed" && firstLandMs === t && sequenceOriginMs != null) {
    payload.sinceSequenceStartToFirstLand = formatElapsed(sequenceOriginMs);
  }
  if (event === "deal-start" && sequenceOriginMs != null) {
    payload.sinceSequenceStartToDealStart = formatElapsed(sequenceOriginMs);
    payload.sinceLastLandToDealStart =
      lastLandMs != null ? formatElapsed(lastLandMs) : "n/a (no land logged)";
    console.log("[nbl-ante-timing] summary", {
      handNumber: detail.handNumber,
      sequenceStartToFirstLaunch:
        firstLaunchMs != null && sequenceOriginMs != null
          ? formatElapsed(sequenceOriginMs)
          : "n/a",
      firstLaunchToFirstLand:
        firstLaunchMs != null && firstLandMs != null
          ? `${Math.round(firstLandMs - firstLaunchMs)}ms`
          : "n/a",
      lastLandToDealStart:
        lastLandMs != null ? formatElapsed(lastLandMs) : "n/a (no land logged)",
      slowMode: isAnteDebugSlowMode(),
    });
  }

  console.log(`[nbl-ante-timing] ${event}`, payload);
}
