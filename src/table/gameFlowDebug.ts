/**
 * Temporary game-flow debug logging.
 * Enable: localStorage.setItem('nbl-game-flow-debug', '1') then reload,
 * or add ?gameFlowDebug=1 to the URL.
 */

const DEBUG_KEY = "nbl-game-flow-debug";

let debugForced = false;
let logCaptureSink: ((line: string, data?: Record<string, unknown>) => void) | null = null;

/** Node/tests only — capture `[nbl-flow]` lines without a browser. */
export function forceGameFlowDebugForTests(
  sink?: (line: string, data?: Record<string, unknown>) => void,
): () => void {
  debugForced = true;
  logCaptureSink = sink ?? null;
  return () => {
    debugForced = false;
    logCaptureSink = null;
  };
}

export function isGameFlowDebugEnabled(): boolean {
  if (debugForced) return true;
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage?.getItem(DEBUG_KEY) === "1") return true;
    return new URLSearchParams(window.location.search).has("gameFlowDebug");
  } catch {
    return false;
  }
}

/** Structured presentation phase transition — enable via gameFlowDebug. */
export function logPresentationPhase(
  machine: "hand" | "trick",
  from: string,
  to: string,
  meta?: Record<string, unknown>,
): void {
  logGameFlow(
    machine === "hand" ? "handPresentation" : "trickPresentation",
    "phase-transition",
    { from, to, ...meta },
  );
}

export function logGameFlow(
  source: string,
  event: string,
  data?: Record<string, unknown>,
): void {
  if (!isGameFlowDebugEnabled()) return;
  const ts =
    typeof performance !== "undefined" ? `${performance.now().toFixed(1)}ms` : "";
  const line = `[nbl-flow ${ts}] ${source} :: ${event}`;
  if (logCaptureSink) {
    logCaptureSink(line.trim(), data);
    return;
  }
  console.info(line, data ?? "");
}
