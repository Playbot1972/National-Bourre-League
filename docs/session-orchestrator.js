/**
 * Session orchestration — debounced, non-render entry for lifecycle + bot requests.
 * Rendering should observe Firestore state; orchestration reacts to snapshots.
 */

/** Debounce rapid snapshot/render storms before running side effects. */
export const SESSION_ORCHESTRATION_DEBOUNCE_MS = 100;

export function logSessionOrchestrator(event, payload = {}) {
  console.info("[session-orchestrator]", event, JSON.stringify(payload));
}
