/**
 * Client-side public-table matchQueue joinId lifecycle (Play Now).
 * Persists joinId per user so retries/resumes use the same idempotency key.
 */

const STORAGE_PREFIX = "nbl-public-table-join:";

export const PUBLIC_TABLE_QUEUE_RESUME_MESSAGE = "Resuming matchmaking…";
export const PUBLIC_TABLE_QUEUE_RECOVERY_MESSAGE = "Reconnecting to matchmaking…";
export const PUBLIC_TABLE_QUEUE_RETRY_MESSAGE =
  "Matchmaking was reset — try Play Now again.";

function storageKey(uid) {
  return `${STORAGE_PREFIX}${uid}`;
}

/** Mint a new joinId for public matchmaking. */
export function createPublicTableJoinId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `join_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );
}

/** @param {string|null|undefined} uid */
export function loadStoredPublicTableJoinId(uid) {
  if (!uid || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(uid));
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    return trimmed || null;
  } catch {
    return null;
  }
}

/** @param {string|null|undefined} uid @param {string} joinId */
export function saveStoredPublicTableJoinId(uid, joinId) {
  if (!uid || !joinId || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(uid), joinId.trim());
  } catch {
    /* quota / private mode */
  }
}

/** @param {string|null|undefined} uid */
export function clearStoredPublicTableJoinId(uid) {
  if (!uid || typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey(uid));
  } catch {
    /* ignore */
  }
}

/**
 * Reuse a persisted joinId when present; otherwise mint and store a new one.
 * @param {string|null|undefined} uid
 * @returns {{ joinId: string, resumed: boolean }}
 */
export function resolvePublicTableJoinId(uid) {
  const existing = loadStoredPublicTableJoinId(uid);
  if (existing) {
    return { joinId: existing, resumed: true };
  }
  const joinId = createPublicTableJoinId();
  saveStoredPublicTableJoinId(uid, joinId);
  return { joinId, resumed: false };
}

/**
 * After server queue cleanup, mint a fresh joinId and persist it.
 * @param {string|null|undefined} uid
 * @returns {string}
 */
export function forceNewPublicTableJoinId(uid) {
  clearStoredPublicTableJoinId(uid);
  const joinId = createPublicTableJoinId();
  saveStoredPublicTableJoinId(uid, joinId);
  return joinId;
}

/**
 * Callable error when matchQueue.activeJoinId !== request joinId.
 * @param {unknown} err
 * @returns {boolean}
 */
export function isPublicTableJoinIdMismatchError(err) {
  const code = String(err?.code ?? "");
  const normalizedCode = code.replace(/^functions\//, "");
  const msg = String(err?.message ?? err ?? "");
  return normalizedCode === "already-exists" && /different joinid/i.test(msg);
}
