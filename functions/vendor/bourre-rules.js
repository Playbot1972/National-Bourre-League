// bourre-rules.js — Bourré pot cap, settlement formulas (pure, no Firebase).

/** Pot cap is always ante × this multiplier. */
export const POT_CAP_MULTIPLIER = 20;

/** Per-hand ante used for pot math and LmT (separate from table buy-in). */
export const DEFAULT_HAND_ANTE = 1;

export const DEFAULT_BOURRE_SETTINGS = {
  buyInAmount: 1,
  anteAmount: DEFAULT_HAND_ANTE,
  limEnabled: false,
};

/**
 * Normalize room/session Bourré settings.
 * buyInAmount — starting stack each player brings to the table.
 * anteAmount — per-hand ante for pot/LmT (not the buy-in dropdown).
 *
 * Legacy rooms stored only anteAmount on the old dropdown; treat that as buy-in
 * and default per-hand ante to 1.
 */
export function normalizeBourreSettings(raw = {}) {
  const hasExplicitBuyIn = raw.buyInAmount != null;
  const buyInAmount = Math.max(
    1,
    Number(hasExplicitBuyIn ? raw.buyInAmount : raw.anteAmount ?? raw.handStake) || 1,
  );
  const anteAmount = hasExplicitBuyIn
    ? Math.max(1, Number(raw.anteAmount ?? DEFAULT_HAND_ANTE) || DEFAULT_HAND_ANTE)
    : DEFAULT_HAND_ANTE;
  return {
    buyInAmount,
    anteAmount,
    potCap: anteAmount * POT_CAP_MULTIPLIER,
    limEnabled: raw.limEnabled === true,
  };
}

/** Starting stack for a session — prefers session buy-in, then room settings. */
export function resolveSessionBuyIn(sessionData, roomBourreSettings) {
  const fromSession = sessionData?.buyInAmount;
  if (fromSession != null && Number(fromSession) > 0) {
    return Math.max(1, Number(fromSession) || 1);
  }
  return normalizeBourreSettings(roomBourreSettings).buyInAmount;
}

/**
 * Live hand pot state (public — safe to show all players).
 * @param {{ anteAmount: number, limEnabled?: boolean, carryIn?: number, antePot: number }} input
 */
export function computeHandPotState({ anteAmount, limEnabled = false, carryIn = 0, antePot }) {
  const limOn = limEnabled === true;
  const settings = normalizeBourreSettings({ anteAmount, limEnabled: limOn });
  const currentPot = Math.max(0, Number(antePot) || 0) + Math.max(0, Number(carryIn) || 0);
  const potCap = settings.potCap;
  const maxWinThisHand = limOn ? Math.min(currentPot, potCap) : currentPot;
  const overflow = limOn ? Math.max(0, currentPot - potCap) : 0;
  const winnerTake = maxWinThisHand;
  const bourrePenalty = maxWinThisHand;

  return {
    anteAmount: settings.anteAmount,
    limEnabled: limOn,
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
  limEnabled = false,
  carryIn = 0,
  stakeForPlayer,
}) {
  const limOn = limEnabled === true;
  const potState = computeHandPotState({
    anteAmount,
    limEnabled: limOn,
    carryIn,
    antePot: participants.reduce((sum, pid) => sum + stakeForPlayer(pid), 0),
  });
  const { currentPot, winnerTake, bourrePenalty, overflow } = potState;
  const bourreIds = bourrePlayerIds(tricksByPlayer, participants);
  const bourreMatch = bourreIds.length * bourrePenalty;

  const deltas = {};
  let carryOverPot = 0;

  if (mode === "push" || mode === "non_winner_ante_up" || mode === "co_win_carry") {
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
    carryOverPot = limOn ? overflow : 0;
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
    carryOverPot = bourreMatch + (limOn ? overflow : 0);
  }

  if (bourreMatch > 0 && mode !== "win" && mode !== "split") {
    for (const pid of bourreIds) {
      deltas[pid] -= bourrePenalty;
    }
    carryOverPot += bourreMatch;
    if (limOn && mode !== "split") {
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
