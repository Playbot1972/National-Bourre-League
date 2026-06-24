/**
 * Temporary game-flow debug logging (social app / app.js).
 * Enable: localStorage.setItem('nbl-game-flow-debug', '1') then reload,
 * or add ?gameFlowDebug=1 to the URL.
 */

const DEBUG_KEY = "nbl-game-flow-debug";

export function isGameFlowDebugEnabled() {
  try {
    if (localStorage.getItem(DEBUG_KEY) === "1") return true;
    return new URLSearchParams(location.search).has("gameFlowDebug");
  } catch {
    return false;
  }
}

export function logGameFlow(source, event, data) {
  if (!isGameFlowDebugEnabled()) return;
  const ts = typeof performance !== "undefined" ? `${performance.now().toFixed(1)}ms` : "";
  console.info(`[nbl-flow ${ts}] ${source} :: ${event}`, data ?? "");
}
