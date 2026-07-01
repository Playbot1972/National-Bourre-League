export const HAND_TRANSITION = {
  DRAW_START: "DRAW_START",
  DRAW_SUBMIT: "DRAW_SUBMIT",
  DRAW_RESOLVE: "DRAW_RESOLVE",
  TRICK_END: "TRICK_END",
  HAND_END: "HAND_END",
  ROUND_ADVANCE: "ROUND_ADVANCE",
} as const;

export type HandTransitionEvent =
  (typeof HAND_TRANSITION)[keyof typeof HAND_TRANSITION];

const DEBUG_KEY = "nbl-game-flow-debug";

function isHandTransitionLogEnabled(): boolean {
  if (typeof globalThis === "undefined") return false;
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    if (storage?.getItem(DEBUG_KEY) === "1") return true;
    const location = (globalThis as { location?: Location }).location;
    if (location?.search) {
      return new URLSearchParams(location.search).has("gameFlowDebug");
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Structured hand transition logs — enable via nbl-game-flow-debug or ?gameFlowDebug=1 */
export function logHandTransition(
  event: HandTransitionEvent,
  data?: Record<string, unknown>,
  { force = false }: { force?: boolean } = {},
): void {
  if (!force && !isHandTransitionLogEnabled()) return;
  const ts =
    typeof performance !== "undefined" ? `${performance.now().toFixed(1)}ms` : "";
  console.info(`[HAND-TRANSITION ${ts}] ${event}`, data ?? "");
}

/** Server-side transition logs (Cloud Functions — always emitted). */
export function logServerHandTransition(
  event: HandTransitionEvent,
  data?: Record<string, unknown>,
): void {
  console.info("[HAND-TRANSITION]", event, JSON.stringify(data ?? {}));
}
