/**
 * Pure roster merge helpers — scores, room members, and session.players display names.
 */

/** True when a stored name is the generic session placeholder. */
export function isGenericRosterDisplayName(name) {
  const trimmed = String(name ?? "").trim();
  return !trimmed || trimmed.toLowerCase() === "player";
}

/**
 * Pick the best display name across score, member, and session.player sources.
 * @param {string|null|undefined} scoreDisplayName
 * @param {string|null|undefined} memberDisplayName
 * @param {string|null|undefined} [sessionPlayerDisplayName]
 */
export function resolveRosterDisplayName(
  scoreDisplayName,
  memberDisplayName,
  sessionPlayerDisplayName,
) {
  const member = String(memberDisplayName ?? "").trim();
  const score = String(scoreDisplayName ?? "").trim();
  const sessionPlayer = String(sessionPlayerDisplayName ?? "").trim();

  if (member && isGenericRosterDisplayName(score)) return member;
  if (score && !isGenericRosterDisplayName(score)) return score;
  if (member) return member;
  if (sessionPlayer && !isGenericRosterDisplayName(sessionPlayer)) return sessionPlayer;
  return score || sessionPlayer || member || "Player";
}

/**
 * Replace or append a player entry in session.players (dedupe by playerId).
 * @param {Array<{ playerId?: string, displayName?: string }|string>} players
 * @param {string} playerId
 * @param {string} displayName
 */
export function upsertSessionPlayerEntry(players, playerId, displayName) {
  const list = Array.isArray(players) ? [...players] : [];
  const idx = list.findIndex((p) => {
    const id = typeof p === "string" ? p : p?.playerId;
    return id === playerId;
  });
  const entry = { playerId, displayName };
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.push(entry);
  }
  return list;
}

/**
 * Merge score rows with room members and session.players for roster counts/display.
 * @param {Array<{ playerId?: string, displayName?: string, [key: string]: unknown }>} scores
 * @param {Array<{ userId?: string, displayName?: string }>} members
 * @param {Array<{ playerId?: string, displayName?: string }>} sessionPlayers
 * @param {object|null} [_sessionData]
 * @param {{ isWatchOnly?: (userId: string) => boolean }} [opts]
 */
export function mergeScoresWithMembers(
  scores,
  members,
  sessionPlayers = [],
  _sessionData = null,
  { isWatchOnly = () => false } = {},
) {
  const memberById = new Map(
    members.filter((m) => m.userId).map((m) => [m.userId, m]),
  );
  const map = new Map();

  for (const s of scores) {
    if (!s?.playerId) continue;
    const member = memberById.get(s.playerId);
    map.set(s.playerId, {
      ...s,
      displayName: resolveRosterDisplayName(
        s.displayName,
        member?.displayName,
        sessionPlayers.find((p) => p?.playerId === s.playerId)?.displayName,
      ),
    });
  }

  for (const m of members) {
    if (!m.userId || map.has(m.userId)) continue;
    if (isWatchOnly(m.userId)) continue;
    map.set(m.userId, {
      playerId: m.userId,
      displayName: resolveRosterDisplayName(null, m.displayName),
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
    });
  }

  for (const p of sessionPlayers) {
    if (!p?.playerId || map.has(p.playerId)) continue;
    const member = memberById.get(p.playerId);
    map.set(p.playerId, {
      playerId: p.playerId,
      displayName: resolveRosterDisplayName(p.displayName, member?.displayName),
      tricksWon: 0,
      handsWon: 0,
      net: 0,
      total: 0,
    });
  }

  for (const [playerId, entry] of map) {
    const member = memberById.get(playerId);
    if (member?.displayName && isGenericRosterDisplayName(entry.displayName)) {
      entry.displayName = member.displayName;
    }
  }

  return [...map.values()];
}
