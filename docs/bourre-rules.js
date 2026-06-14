// bourre-rules.js — Bourré pot cap, settlement formulas (pure, no Firebase).

/** Pot cap is always ante × this multiplier. */
export const POT_CAP_MULTIPLIER = 20;

export const DEFAULT_BOURRE_SETTINGS = {
  anteAmount: 1,
  limEnabled: true,
};

/** Normalize room/session Bourré settings. */
export function normalizeBourreSettings(raw = {}) {
  const anteAmount = Math.max(1, Number(raw.anteAmount ?? raw.handStake) || 1);
  return {
    anteAmount,
    potCap: anteAmount * POT_CAP_MULTIPLIER,
    limEnabled: raw.limEnabled !== false,
  };
}

/**
 * Live hand pot state (public — safe to show all players).
 * @param {{ anteAmount: number, limEnabled?: boolean, carryIn?: number, antePot: number }} input
 */
export function computeHandPotState({ anteAmount, limEnabled = true, carryIn = 0, antePot }) {
  const settings = normalizeBourreSettings({ anteAmount, limEnabled });
  const currentPot = Math.max(0, Number(antePot) || 0) + Math.max(0, Number(carryIn) || 0);
  const potCap = settings.potCap;
  const maxWinThisHand = limEnabled ? Math.min(currentPot, potCap) : currentPot;
  const overflow = limEnabled ? Math.max(0, currentPot - potCap) : 0;
  const winnerTake = maxWinThisHand;
  const bourrePenalty = maxWinThisHand;

  return {
    anteAmount: settings.anteAmount,
    limEnabled: settings.limEnabled,
    potCap,
    currentPot,
    maxWinThisHand,
    winnerTake,
    bourrePenalty,
    overflow,
  };
}

function bourrePlayerIds(tricksByPlayer, participants) {
  if (!tricksByPlayer) return [];
  return participants.filter((pid) => (tricksByPlayer[pid] ?? 0) === 0);
}

/**
 * Settlement deltas for one recorded hand.
 * @param {object} opts
 * @returns {{ deltas: Record<string, number>, carryOverPot: number, bourreIds: string[], bourreMatch: number, potState: object }}
 */
export function settleHandDeltas({
  mode,
  winners,
  participants,
  tricksByPlayer,
  anteAmount,
  limEnabled = true,
  carryIn = 0,
  stakeForPlayer,
}) {
  const potState = computeHandPotState({
    anteAmount,
    limEnabled,
    carryIn,
    antePot: participants.reduce((sum, pid) => sum + stakeForPlayer(pid), 0),
  });
  const { currentPot, winnerTake, bourrePenalty, overflow } = potState;
  const bourreIds = bourrePlayerIds(tricksByPlayer, participants);
  const bourreMatch = bourreIds.length * bourrePenalty;

  const deltas = {};
  let carryOverPot = 0;

  if (mode === "push" || mode === "non_winner_ante_up") {
    carryOverPot = currentPot;
    participants.forEach((pid) => {
      deltas[pid] = -stakeForPlayer(pid);
    });
  } else if (mode === "split") {
    const share = winnerTake / winners.length;
    participants.forEach((pid) => {
      const playerStake = stakeForPlayer(pid);
      deltas[pid] = winners.includes(pid) ? share - playerStake : -playerStake;
    });
    carryOverPot = limEnabled ? overflow : 0;
  } else {
    const winner = winners[0];
    participants.forEach((pid) => {
      const playerStake = stakeForPlayer(pid);
      if (pid === winner) {
        deltas[pid] = winnerTake - playerStake;
      } else if (bourreIds.includes(pid)) {
        deltas[pid] = -playerStake - bourrePenalty;
      } else {
        deltas[pid] = -playerStake;
      }
    });
    carryOverPot = bourreMatch + (limEnabled ? overflow : 0);
  }

  if (bourreMatch > 0 && mode !== "win") {
    for (const pid of bourreIds) {
      deltas[pid] -= bourrePenalty;
    }
    carryOverPot += bourreMatch;
    if (limEnabled && mode !== "split") {
      carryOverPot += overflow;
    }
  }

  return {
    deltas,
    carryOverPot,
    bourreIds,
    bourreMatch,
    potState,
    pot: currentPot,
    cappedPot: winnerTake,
    overflow,
  };
}
