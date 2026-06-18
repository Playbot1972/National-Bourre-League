// Pure invite-code helpers (no Firebase imports — safe for node --test).

const UNICODE_DASHES = /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g;
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
const INVITE_FORMAT = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

/** Normalize pasted invite codes: trim, uppercase, unify dashes, ABC-D23 shape. */
export function normalizeInviteCode(code) {
  if (code == null || typeof code !== "string") return "";
  let c = code
    .trim()
    .toUpperCase()
    .replace(ZERO_WIDTH, "")
    .replace(UNICODE_DASHES, "-")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
  const compact = c.replace(/-/g, "");
  if (/^[A-Z0-9]{6}$/.test(compact)) {
    return `${compact.slice(0, 3)}-${compact.slice(3)}`;
  }
  return c;
}

export function isValidInviteCodeFormat(code) {
  return INVITE_FORMAT.test(normalizeInviteCode(code));
}

export function formatInviteCodeDisplay(code) {
  const normalized = normalizeInviteCode(code);
  return normalized || String(code ?? "").trim();
}
