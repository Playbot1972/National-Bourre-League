/** Opt-in play-click tracing: localStorage nbl-play-click-debug=1 or ?playClickDebug=1 */
export function isPlayClickDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage?.getItem("nbl-play-click-debug") === "1") return true;
    return new URLSearchParams(window.location.search).has("playClickDebug");
  } catch {
    return false;
  }
}

export function logPlayClick(step: string, data?: Record<string, unknown>): void {
  if (!isPlayClickDebugEnabled()) return;
  console.log("[PLAY-CLICK]", step, data ?? {});
}
