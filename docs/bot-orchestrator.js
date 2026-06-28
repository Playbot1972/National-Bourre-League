/**
 * Bot advancement ownership — pure helpers for server-authoritative vs legacy client drive.
 * When SERVER_HAND_AUTHORITY is on and the live table is open, only the server
 * (gameAdvanceBots → advanceBotsAfterAction) may execute bot moves. The client
 * may request advancement, not compete with direct robotSubmitDraw / robotPlayCard.
 */

/** Client may request server bot advancement (not execute bot moves locally). */
export function shouldRequestServerBotAdvance(serverHandAuthority, tablePlayOpen) {
  return serverHandAuthority === true && tablePlayOpen === true;
}

/** Legacy honor-system: viewing member drives bots via client Firestore paths. */
export function shouldClientDriveBotsDirectly(serverHandAuthority) {
  return serverHandAuthority !== true;
}

/** @deprecated Use shouldRequestServerBotAdvance */
export function shouldUseServerBotAdvanceForDraw(serverHandAuthority, tablePlayOpen) {
  return shouldRequestServerBotAdvance(serverHandAuthority, tablePlayOpen);
}

/** @deprecated Use shouldClientDriveBotsDirectly */
export function shouldClientDriveRobotDraw(serverHandAuthority) {
  return shouldClientDriveBotsDirectly(serverHandAuthority);
}

export function logBotOrchestrator(event, payload = {}) {
  console.info("[bot-orchestrator]", event, JSON.stringify(payload));
}
