// Join Room input-mode helpers (pure, no Firebase — safe for node --test).

import { isValidInviteCodeFormat, normalizeInviteCode } from "./invite-code.js";

/** Class toggled on `.room-actions` while invite code input is non-empty. */
export const JOIN_MODE_CLASS = "room-actions--join-mode";

/** Minimum normalized length before join mode disables Play Now / Create. */
export const JOIN_MODE_MIN_CODE_LENGTH = 6;

/**
 * True when the user is intentionally entering a join code (not stray whitespace).
 * Play Now stays enabled until the trimmed code is long enough to be a real invite.
 */
export function isJoinModeActive(codeValue) {
  const trimmed = String(codeValue ?? "").trim();
  if (!trimmed) return false;
  if (isValidInviteCodeFormat(trimmed)) return true;
  return normalizeInviteCode(trimmed).replace(/-/g, "").length >= JOIN_MODE_MIN_CODE_LENGTH;
}
