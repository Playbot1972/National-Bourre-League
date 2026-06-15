/** Pure session/table helpers mirrored from docs/firestore.js and docs/app.js. */

export interface ScoreRow {
  playerId: string;
  displayName?: string;
  tricksWon?: number;
  handsWon?: number;
  net?: number;
  total?: number;
}

export interface MemberRow {
  userId?: string;
  displayName?: string;
}

export interface SessionPlayerRow {
  playerId?: string;
  displayName?: string;
}

export function isRobotPlayerId(playerId: string | null | undefined): boolean {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

let botCounter = 0;

/** Deterministic bot ids for tests; pass a label for stable output. */
export function createRobotPlayerId(label?: string): string {
  if (label) return `bot_${label}`;
  botCounter += 1;
  return `bot_${botCounter.toString(36).padStart(6, "0")}`;
}

export function sortScoresForDisplay(
  scores: ScoreRow[],
  players: Array<{ playerId: string }> = [],
): ScoreRow[] {
  const order = new Map(players.map((p, i) => [p.playerId, i]));
  return [...scores].sort((a, b) => {
    const ai = order.has(a.playerId) ? order.get(a.playerId)! : 999;
    const bi = order.has(b.playerId) ? order.get(b.playerId)! : 999;
    if (ai !== bi) return ai - bi;
    return (a.displayName || "").localeCompare(b.displayName || "");
  });
}

export function mergeScoresWithMembers(
  scores: ScoreRow[],
  members: MemberRow[] = [],
  sessionPlayers: SessionPlayerRow[] = [],
): ScoreRow[] {
  const map = new Map(scores.map((s) => [s.playerId, s]));
  for (const m of members) {
    if (!m.userId || map.has(m.userId)) continue;
    map.set(m.userId, {
      playerId: m.userId,
      displayName: m.displayName,
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
    });
  }
  for (const p of sessionPlayers) {
    if (!p?.playerId || map.has(p.playerId)) continue;
    map.set(p.playerId, {
      playerId: p.playerId,
      displayName: p.displayName || "Player",
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
    });
  }
  return [...map.values()];
}

export function sessionHasRobots(players: Array<{ playerId?: string }>): boolean {
  return players.some((p) => isRobotPlayerId(p.playerId));
}

export function nextDealerId(sortedPlayerIds: string[], currentDealerId: string | null): string | null {
  if (sortedPlayerIds.length === 0) return null;
  const idx = currentDealerId ? sortedPlayerIds.indexOf(currentDealerId) : -1;
  const base = idx >= 0 ? idx : 0;
  return sortedPlayerIds[(base + 1) % sortedPlayerIds.length];
}
