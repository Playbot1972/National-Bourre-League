/**
 * Stable table/setup roster ordering (pure — safe for node --test).
 * Room members keep joinedAt order from subscribeRoomMembers; session.players is fallback.
 */

/**
 * @param {Array<{ userId?: string }>} members
 * @param {Array<{ playerId?: string }>} sessionPlayers
 * @returns {Array<{ playerId: string }>}
 */
export function rosterPlayerOrder(members = [], sessionPlayers = []) {
  const memberOrder = members
    .filter((m) => m?.userId)
    .map((m) => ({ playerId: m.userId }));
  if (memberOrder.length) return memberOrder;
  return (sessionPlayers || [])
    .filter((p) => p?.playerId)
    .map((p) => ({ playerId: p.playerId }));
}

/**
 * @param {Array<{ playerId: string, displayName?: string }>} scores
 * @param {Array<{ userId?: string }>} members
 * @param {Array<{ playerId?: string }>} sessionPlayers
 * @param {(scores: unknown[], order: Array<{ playerId: string }>) => unknown[]} sortScoresForDisplay
 */
export function sortMergedRosterForDisplay(
  scores,
  members,
  sessionPlayers,
  sortScoresForDisplay,
) {
  return sortScoresForDisplay(scores, rosterPlayerOrder(members, sessionPlayers));
}
