// bourre-rules.js — Bourré pot cap, settlement formulas (pure, no Firebase).

/** Pot cap is always ante × this multiplier. */
export const POT_CAP_MULTIPLIER = 20;

/** Per-hand ante used for pot math and LmT (separate from table buy-in). */
export const DEFAULT_HAND_ANTE = 1;

export const DEFAULT_BOURRE_SETTINGS = {
  buyInAmount: 1,
  anteAmount: DEFAULT_HAND_ANTE,
  limEnabled: false,
  /** Optional house rule — manual top-up when bankroll hits zero (off by default). */
  rebuyEnabled: false,
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
    rebuyEnabled: raw.rebuyEnabled === true,
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
  const resolvedAnte = Math.max(1, Number(anteAmount) || DEFAULT_HAND_ANTE);
  const potCap = resolvedAnte * POT_CAP_MULTIPLIER;
  const currentPot = Math.max(0, Number(antePot) || 0) + Math.max(0, Number(carryIn) || 0);
  const maxWinThisHand = limOn ? Math.min(currentPot, potCap) : currentPot;
  const overflow = limOn ? Math.max(0, currentPot - potCap) : 0;
  const winnerTake = maxWinThisHand;
  const bourrePenalty = maxWinThisHand;

  return {
    anteAmount: resolvedAnte,
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

/** Live stack for a score row — prefers bankroll field, else buy-in + net. */
export function scoreBankroll(score, buyInFallback = 0) {
  if (score?.bankroll != null && Number.isFinite(Number(score.bankroll))) {
    return Math.max(0, Number(score.bankroll));
  }
  const buyIn = Math.max(0, Number(buyInFallback) || 0);
  const net = Number(score?.net) || 0;
  if (buyIn > 0) return Math.max(0, buyIn + net);
  return Math.max(0, net);
}

/** Apply a settlement delta against a bankroll; negative deltas clamp at zero. */
export function applyBankrollDelta(bankroll, delta) {
  const start = Math.max(0, Number(bankroll) || 0);
  const d = Number(delta) || 0;
  if (d >= 0) {
    return { newBankroll: start + d, appliedDelta: d, busted: false };
  }
  const owed = Math.abs(d);
  const paid = Math.min(start, owed);
  return {
    newBankroll: start - paid,
    appliedDelta: -paid,
    busted: owed > 0 && paid < owed,
  };
}

/** True when a player may opt into the next hand. */
export function canEnrollWithBankroll(bankroll) {
  return Math.max(0, Number(bankroll) || 0) > 0;
}

/** Amount not collected when a loss was clamped to remaining stack. */
export function settlementShortfall(nominalDelta, appliedDelta) {
  const nom = Number(nominalDelta) || 0;
  const app = Number(appliedDelta) || 0;
  if (nom < 0 && app > nom) return app - nom;
  return 0;
}

/**
 * Clamp nominal settlement deltas to each player's bankroll.
 * Winners are rebalanced to the actual pool collected from losers.
 */
export function applySolventSettlement({
  mode,
  winners,
  participants,
  nominalDeltas,
  scoreById,
  carryOverPot,
  buyInFallback = 0,
  stakeForPlayer = () => 0,
}) {
  const appliedDeltas = {};
  const bankrolls = {};
  const bustedIds = [];

  for (const pid of participants) {
    const br = scoreBankroll(scoreById[pid], buyInFallback);
    const nominal = nominalDeltas[pid] ?? 0;
    if (nominal < 0) {
      const result = applyBankrollDelta(br, nominal);
      appliedDeltas[pid] = result.appliedDelta;
      bankrolls[pid] = result.newBankroll;
      if (result.busted) bustedIds.push(pid);
    } else {
      appliedDeltas[pid] = 0;
      bankrolls[pid] = br;
    }
  }

  for (const pid of participants) {
    const stake = Math.max(0, Number(stakeForPlayer(pid)) || 0);
    if (stake <= 0) continue;
    if ((nominalDeltas[pid] ?? 0) < 0) continue;
    const br = bankrolls[pid] ?? scoreBankroll(scoreById[pid], buyInFallback);
    const result = applyBankrollDelta(br, -stake);
    appliedDeltas[pid] = (appliedDeltas[pid] ?? 0) + result.appliedDelta;
    bankrolls[pid] = result.newBankroll;
    if (result.busted) bustedIds.push(pid);
  }

  let shortfall = 0;
  for (const pid of participants) {
    shortfall += settlementShortfall(nominalDeltas[pid] ?? 0, appliedDeltas[pid] ?? 0);
  }

  const adjustedCarry = Math.max(0, (Number(carryOverPot) || 0) - shortfall);

  const totalPool = participants.reduce((sum, pid) => {
    const loss = appliedDeltas[pid] ?? 0;
    return loss < 0 ? sum + Math.abs(loss) : sum;
  }, 0);

  if (mode === "win" && winners.length === 1) {
    const winner = winners[0];
    const winDelta = totalPool;
    const br = scoreBankroll(scoreById[winner], buyInFallback);
    bankrolls[winner] = br + winDelta;
    appliedDeltas[winner] = (appliedDeltas[winner] ?? 0) + winDelta;
  } else if (mode === "split" && winners.length >= 2) {
    const share = totalPool / winners.length;
    for (const winner of winners) {
      const br = scoreBankroll(scoreById[winner], buyInFallback);
      const already = appliedDeltas[winner] ?? 0;
      const winDelta = share + already;
      bankrolls[winner] = br + share;
      appliedDeltas[winner] = winDelta;
    }
  } else {
    for (const pid of participants) {
      const nominal = nominalDeltas[pid] ?? 0;
      if (nominal > 0 && !winners.includes(pid)) {
        const br = bankrolls[pid] ?? scoreBankroll(scoreById[pid], buyInFallback);
        const result = applyBankrollDelta(br, nominal);
        appliedDeltas[pid] = result.appliedDelta;
        bankrolls[pid] = result.newBankroll;
      }
    }
  }

  const outIds = participants.filter((pid) => (bankrolls[pid] ?? 0) <= 0);

  return {
    appliedDeltas,
    bankrolls,
    bustedIds: [...new Set(bustedIds)],
    outIds,
    carryOverPot: adjustedCarry,
    shortfall,
  };
}
