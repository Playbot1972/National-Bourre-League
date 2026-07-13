import { isGameFlowDebugEnabled } from "./gameFlowDebug";

const isDevBuild =
  typeof import.meta !== "undefined" &&
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

/** Grep-friendly hand-opening sequence logs (`?gameFlowDebug=1` or dev build). */
export function handOpenLog(step: string, detail: Record<string, unknown> = {}): void {
  if (!isDevBuild && !isGameFlowDebugEnabled()) return;
  console.log(`[nbl-hand-open] ${step}`, detail);
}
