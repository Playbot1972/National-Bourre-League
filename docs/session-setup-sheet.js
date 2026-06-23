/**
 * Legacy mobile bottom-sheet adapter — setup is now a single inline panel.
 * Exports kept so app.js imports stay stable; all are no-ops.
 */

export function requestSessionSetupAddPlayersSnap() {}

export function resetSessionSetupSheet() {}

export function clearSessionSetupSheetSnap() {}

export function initSessionSetupSheet() {}

export function sessionSetupSheetStyleAttr() {
  return "";
}

export function syncSessionSetupSheet() {}

export function shouldUseSessionSetupSheet() {
  return false;
}
