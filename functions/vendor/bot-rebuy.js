// Bot auto-rebuy after hand settlement (pure planning + shared helpers).

import { scoreBankroll } from "./bourre-rules.js";
import { pickUniqueRobotNames } from "./play-now.js";

export function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

export function isRobotScoreRow(row, playerId) {
  return row?.isRobot === true || isRobotPlayerId(playerId);
}

export function sessionHasRobotScores(scoreRows) {
  return scoreRows.some((row) => isRobotScoreRow(row, row.playerId));
}

/**
 * Plan post-settlement auto-rebuy for busted bots (zero bankroll / out flag).
 * Keeps the same internal player id; assigns a fresh display name.
 */
export function planBotAutoRebuys({ scoreRows, buyIn, rng = Math.random }) {
  const bustedBots = scoreRows.filter((row) => {
    const pid = row.playerId;
    if (!isRobotScoreRow(row, pid)) return false;
    if (row.out === true) return true;
    return scoreBankroll(row, buyIn) <= 0;
  });
  if (bustedBots.length === 0) return [];

  const takenNames = scoreRows.map((row) => row.displayName).filter(Boolean);
  const names = pickUniqueRobotNames(bustedBots.length, takenNames, rng);

  return bustedBots.map((row, index) => ({
    playerId: row.playerId,
    displayName: names[index],
  }));
}

/** Merge rebuy display names into session.players roster entries. */
export function patchSessionPlayersWithRebuyNames(players, plan) {
  const byId = Object.fromEntries(plan.map((p) => [p.playerId, p.displayName]));
  return (players || []).map((p) => {
    if (!p) return p;
    const id = typeof p === "string" ? p : p.playerId;
    if (!id || !byId[id]) return p;
    if (typeof p === "string") return { playerId: p, displayName: byId[id] };
    return { ...p, displayName: byId[id] };
  });
}
