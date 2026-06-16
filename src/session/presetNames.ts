/** Regional table presets — mirrored in docs/session-presets.js for runtime. */

export const PRESET_SESSION_NAMES = [
  "Dirty South",
  "Wild West",
  "East Coast",
  "Midwest",
] as const;

export const MAX_ROOM_SESSIONS = 4;

export type PresetSessionName = (typeof PRESET_SESSION_NAMES)[number];

export interface SessionRow {
  id: string;
  sessionName?: string;
  createdAt?: number;
}

export function randomizePresetOrder(rng: () => number = Math.random): string[] {
  const pool = [...PRESET_SESSION_NAMES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function seededPresetOrder(seedText: string): string[] {
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

export function isValidSessionNamePool(pool: unknown): pool is string[] {
  if (!Array.isArray(pool) || pool.length !== MAX_ROOM_SESSIONS) return false;
  if (new Set(pool).size !== MAX_ROOM_SESSIONS) return false;
  const sorted = [...pool].sort();
  const expected = [...PRESET_SESSION_NAMES].sort();
  return sorted.every((name, i) => name === expected[i]);
}

export function nextAvailableSessionName(pool: string[], claimedNames: string[] = []): string | null {
  const claimed = new Set(claimedNames.filter(Boolean));
  return pool.find((name) => !claimed.has(name)) ?? null;
}

export function countAvailableSessionSlots(pool: string[], claimedNames: string[] = []): number {
  const claimed = new Set(claimedNames.filter(Boolean));
  return pool.filter((name) => !claimed.has(name)).length;
}

export function assignSessionNamesForMigration(
  pool: string[],
  sessions: SessionRow[] = [],
): Map<string, string> {
  const sorted = [...sessions].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  const claimed = new Set(sorted.map((s) => s.sessionName).filter(Boolean));
  const available = pool.filter((name) => !claimed.has(name));
  const assignments = new Map<string, string>();
  for (const session of sorted) {
    if (session.sessionName) continue;
    const name = available.shift();
    if (name) assignments.set(session.id, name);
  }
  return assignments;
}

export function canCreateAnotherSession(
  sessionCount: number,
  pool: string[],
  claimedNames: string[] = [],
): boolean {
  if (sessionCount >= MAX_ROOM_SESSIONS) return false;
  if (!isValidSessionNamePool(pool)) {
    return true;
  }
  const claimed = claimedNames.filter(Boolean);
  if (countAvailableSessionSlots(pool, claimed) > 0) return true;
  return sessionCount < claimed.length;
}

export function pickClaimedNamesForCreate(
  liveClaimed: string[] = [],
  docClaimed: string[] = [],
): string[] {
  const live = liveClaimed.filter(Boolean);
  const doc = docClaimed.filter(Boolean);
  if (live.length === 0 && doc.length > 0) {
    return [];
  }
  if (doc.length === live.length) {
    const docKey = [...doc].sort().join("\0");
    const liveKey = [...live].sort().join("\0");
    return docKey === liveKey ? doc : live;
  }
  return live.length <= doc.length ? live : doc;
}

/** Only sessions that exist — preset names are not listed until created. */
export function createdSessionsForTabs(pool: string[], sessions: SessionRow[] = []): SessionRow[] {
  const created = sessions.filter((s) => s.sessionName);
  if (!isValidSessionNamePool(pool)) {
    return [...created].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }
  const order = new Map(pool.map((name, index) => [name, index]));
  return [...created].sort(
    (a, b) => (order.get(a.sessionName!) ?? 99) - (order.get(b.sessionName!) ?? 99),
  );
}

/** Simulate concurrent claims on the last slot — only one succeeds. */
export function claimSessionNameConcurrent(
  pool: string[],
  claimedNames: string[],
): { ok: true; name: string } | { ok: false; reason: "cap" | "none" } {
  if (claimedNames.filter(Boolean).length >= MAX_ROOM_SESSIONS) {
    return { ok: false, reason: "cap" };
  }
  const name = nextAvailableSessionName(pool, claimedNames);
  if (!name) return { ok: false, reason: "none" };
  return { ok: true, name };
}
