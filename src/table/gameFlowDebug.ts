/**
 * Temporary game-flow debug logging.
 * Enable: localStorage.setItem('nbl-game-flow-debug', '1') then reload,
 * or add ?gameFlowDebug=1 to the URL.
 */

const DEBUG_KEY = "nbl-game-flow-debug";

export function isGameFlowDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage?.getItem(DEBUG_KEY) === "1") return true;
    return new URLSearchParams(window.location.search).has("gameFlowDebug");
  } catch {
    return false;
  }
}

export function logGameFlow(
  source: string,
  event: string,
  data?: Record<string, unknown>,
): void {
  if (!isGameFlowDebugEnabled()) return;
  const ts =
    typeof performance !== "undefined" ? `${performance.now().toFixed(1)}ms` : "";
  console.info(`[nbl-flow ${ts}] ${source} :: ${event}`, data ?? "");
}
