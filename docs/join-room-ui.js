// Join Room input-mode helpers (pure, no Firebase — safe for node --test).

/** Class toggled on `.room-actions` while invite code input is non-empty. */
export const JOIN_MODE_CLASS = "room-actions--join-mode";

/** True when the invite code field has any characters (join mode active). */
export function isJoinModeActive(codeValue) {
  return String(codeValue ?? "").length > 0;
}
