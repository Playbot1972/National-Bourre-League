/** Regional table presets — each room gets all four in a permanent shuffled order. */
export const PRESET_SESSION_NAMES = Object.freeze([
  "Dirty South",
  "Wild West",
  "East Coast",
  "Midwest",
]);

export const MAX_ROOM_SESSIONS = 4;

export function randomizePresetOrder(rng = Math.random) {
  const pool = [...PRESET_SESSION_NAMES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/** Deterministic shuffle for one-time migration/backfill (stable per room id). */
export function seededPresetOrder(seedText) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  const rng = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 0x80000000;
  };
  return randomizePresetOrder(rng);
}

export function isValidSessionNamePool(pool) {
  if (!Array.isArray(pool) || pool.length !== MAX_ROOM_SESSIONS) return false;
  if (new Set(pool).size !== MAX_ROOM_SESSIONS) return false;
  const sorted = [...pool].sort();
  const expected = [...PRESET_SESSION_NAMES].sort();
  return sorted.every((name, i) => name === expected[i]);
}

export function nextAvailableSessionName(pool, claimedNames = []) {
  const claimed = new Set(claimedNames.filter(Boolean));
  return pool.find((name) => !claimed.has(name)) ?? null;
}

export function countAvailableSessionSlots(pool, claimedNames = []) {
  const claimed = new Set(claimedNames.filter(Boolean));
  return pool.filter((name) => !claimed.has(name)).length;
}

/** Assign preset names to legacy sessions missing sessionName (oldest first). */
export function assignSessionNamesForMigration(pool, sessions = []) {
  const sorted = [...sessions].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  const claimed = new Set(sorted.map((s) => s.sessionName).filter(Boolean));
  const available = pool.filter((name) => !claimed.has(name));
  const assignments = new Map();
  for (const session of sorted) {
    if (session.sessionName) continue;
    const name = available.shift();
    if (name) assignments.set(session.id, name);
  }
  return assignments;
}

export function sessionTabLabel(session) {
  const name = session?.sessionName || "Session";
  const hands = session?.handCount ?? 0;
  return `${name} · ${hands} hand${hands === 1 ? "" : "s"}`;
}

export function canCreateAnotherSession(sessionCount, pool, claimedNames = []) {
  if (sessionCount >= MAX_ROOM_SESSIONS) return false;
  return countAvailableSessionSlots(pool, claimedNames) > 0;
}
