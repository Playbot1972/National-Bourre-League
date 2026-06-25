/**
 * Draw-phase robot driver selection when SERVER_HAND_AUTHORITY is enabled.
 * Pure helpers — used by app.js and unit tests.
 */

/** Server advanceSessionBots owns bot draws (via advanceBotsAfterAction). */
export function shouldUseServerBotAdvanceForDraw(serverHandAuthority, tablePlayOpen) {
  return serverHandAuthority === true && tablePlayOpen === true;
}

/** Legacy honor-system path: viewing member calls robotSubmitDraw directly. */
export function shouldClientDriveRobotDraw(serverHandAuthority) {
  return serverHandAuthority !== true;
}
