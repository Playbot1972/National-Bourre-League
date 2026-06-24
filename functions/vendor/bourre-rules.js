// bourre-rules.js — Bourré pot cap, settlement formulas (pure, no Firebase).

/** Pot cap is always ante × this multiplier. */
export const POT_CAP_MULTIPLIER = 20;

/** Per-hand ante used for pot math and LmT (separate from table buy-in). */
export const DEFAULT_HAND_ANTE = 1;

export const DEFAULT_BOURRE_SETTINGS = {
  buyInAmount: 100,
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
    ? Math.max(0.01, Number(raw.anteAmount ?? DEFAULT_HAND_ANTE) || DEFAULT_HAND_ANTE)
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
 * Session chip conservation: bankrolls + table pot (carry + posted antes this deal).
 * @param {Record<string, { bankroll?: number, net?: number }>} scoreById
 */
export function sessionChipTotal(
  scoreById,
  { carryOverPot = 0, postedAntes = {}, buyInFallback = 0 } = {},
) {
  const bankrollSum = Object.values(scoreById || {}).reduce(
    (sum, row) => sum + scoreBankroll(row, buyInFallback),
    0,
  );
  const antePot = Object.values(postedAntes || {}).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0,
  );
  return bankrollSum + Math.max(0, Number(carryOverPot) || 0) + antePot;
}

/**
 * Live hand pot state (public — safe to show all players).
 * @param {{ anteAmount: number, limEnabled?: boolean, carryIn?: number, antePot: number }} input
 */
export function computeHandPotState({ anteAmount, limEnabled = false, carryIn = 0, antePot }) {
  const limOn = limEnabled === true;
  const resolvedAnte = Math.max(0.01, Number(anteAmount) || DEFAULT_HAND_ANTE);
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

export const MAX_TRICKS_PER_HAND = 5;

export function totalTricksPlayed(tricksByPlayer, participantIds) {
  return (participantIds || []).reduce(
    (sum, pid) => sum + (tricksByPlayer?.[pid] ?? 0),
    0,
  );
}

export function isHandComplete(tricksByPlayer, participantIds) {
  return totalTricksPlayed(tricksByPlayer, participantIds) >= MAX_TRICKS_PER_HAND;
}

/**
 * Players who stayed in and took zero tricks — only after the hand is complete.
 * Zero tricks at deal start is not bourré.
 */
export function bourrePlayerIds(tricksByPlayer, participants) {
  if (!tricksByPlayer || !participants?.length) return [];
  if (!isHandComplete(tricksByPlayer, participants)) return [];
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
  antePot: antePotOverride,
}) {
  const limOn = limEnabled === true;
  const potState = computeHandPotState({
    anteAmount,
    limEnabled: limOn,
    carryIn,
    antePot:
      antePotOverride ??
      participants.reduce((sum, pid) => sum + stakeForPlayer(pid), 0),
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
    const deferPotToCarry = bourreIds.length > 0;
    participants.forEach((pid) => {
      const playerStake = stakeForPlayer(pid);
      if (pid === winner) {
        deltas[pid] = deferPotToCarry ? -playerStake : winnerTake - playerStake;
      } else if (bourreIds.includes(pid)) {
        // Bourré pot match is collected on the next deal, not at settlement.
        deltas[pid] = -playerStake;
      } else {
        deltas[pid] = -playerStake;
      }
    });
    carryOverPot = limOn ? overflow : deferPotToCarry ? currentPot : 0;
  }

  // Bourré pot match is always collected on the next deal (bourreReplacementDue),
  // never at settlement — including frozen-pot / carry modes (Pagat).

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

/** Live stack for a score row — bankroll field when current; else buy-in + session net. */
export function scoreBankroll(score, buyInFallback = 0) {
  const buyIn = Math.max(0, Number(buyInFallback) || 0);
  const net = Number(score?.net) || 0;
  const fromLedger = buyIn > 0 ? Math.max(0, buyIn + net) : Math.max(0, net);

  if (score?.bankroll != null && Number.isFinite(Number(score.bankroll))) {
    const stored = Math.max(0, Number(score.bankroll));
    // Recover when settlement updated net but bankroll stayed at create-time buy-in.
    if (net !== 0 && buyIn > 0 && stored === buyIn) return fromLedger;
    return stored;
  }
  return fromLedger;
}

/**
 * Per-player contribution at deal time — normal ante, waived ante, or bourré replacement only.
 * @param {object | null | undefined} scoreRow
 * @param {number} sessionStake
 */
export function handAnteContribution(scoreRow, sessionStake) {
  const replacement = Number(scoreRow?.bourreReplacementDue);
  if (Number.isFinite(replacement) && replacement > 0) {
    return replacement;
  }
  if (scoreRow?.skipNextAnte) return 0;
  const n = scoreRow?.perHandStake ?? sessionStake;
  return Math.max(0.01, Number(n) || sessionStake);
}

/**
 * Sum antes for pot display — uses posted amounts when known, otherwise each
 * player's next-deal obligation (normal ante, waived ante, or bourré replacement).
 */
export function sumProjectedHandAntes(scoreById, playerIds, sessionStake, postedAntes = {}) {
  return (playerIds || []).reduce((sum, pid) => {
    if (
      postedAntes != null &&
      Object.prototype.hasOwnProperty.call(postedAntes, pid)
    ) {
      return sum + Math.max(0, Number(postedAntes[pid]) || 0);
    }
    const row = scoreById?.[pid];
    if (row?.out === true) return sum;
    return sum + handAnteContribution(row, sessionStake);
  }, 0);
}

/**
 * Projected next-hand pot: carry + each seated player's next-deal obligation.
 * Bourré: nextHandPot = previousPot + (previousPot × bourréCount) when carry holds
 * the completed pot and each bourré player posts a full pot match.
 */
export function projectNextHandPot(carryOverPot, scoreById, playerIds, sessionStake, postedAntes = {}) {
  const carry = Math.max(0, Number(carryOverPot) || 0);
  const antePot = sumProjectedHandAntes(scoreById, playerIds, sessionStake, postedAntes);
  return carry + antePot;
}
 * Tied leaders skip ante; bourré players owe the completed pot (replacement only).
 */
export function nextDealFundingFlags({
  playerId,
  mode,
  winners,
  bourreIds,
  maxWinThisHand,
}) {
  const tiedLeader =
    winners.includes(playerId) &&
    winners.length >= 2 &&
    (mode === "co_win_carry" || mode === "non_winner_ante_up" || mode === "split");
  const bourreReplacementDue = bourreIds.includes(playerId) ? maxWinThisHand : null;
  return {
    skipNextAnte: tiedLeader,
    bourreReplacementDue,
  };
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

/**
 * Pagat: when only one player elects to play, they win the pot without trick play.
 * Collects the solo player's ante, awards carry + antes into the pot to the winner.
 */
export function settleSoloDefaultWin({
  winnerId,
  carryIn = 0,
  scoreById,
  buyInFallback = 0,
  stakeForPlayer,
}) {
  const collected = collectHandAntes({
    participants: [winnerId],
    scoreById,
    buyInFallback,
    stakeForPlayer,
  });
  if (!collected.activeParticipants.includes(winnerId)) {
    return {
      ready: false,
      reason: "solo_player_busted",
      bankrolls: collected.bankrolls,
      postedAntes: collected.postedAntes,
      outIds: collected.outIds,
    };
  }
  const posted = collected.postedAntes[winnerId] ?? 0;
  const pot = Math.max(0, Number(carryIn) || 0) + posted;
  const bankrollAfterAnte = collected.bankrolls[winnerId] ?? 0;
  return {
    ready: true,
    winnerId,
    pot,
    postedAntes: collected.postedAntes,
    bankrolls: { [winnerId]: bankrollAfterAnte + pot },
    outIds: collected.outIds,
    carryOverPot: 0,
  };
}

/**
 * Collect per-hand antes when a deal begins. Insufficient stacks contribute
 * remaining chips, mark the player out, and exclude them from the deal.
 * Uncollected bourré replacement (busted before paying full pot match) rolls into carry.
 * @returns {{ bankrolls: Record<string, number>, postedAntes: Record<string, number>, outIds: string[], activeParticipants: string[], uncollectedPenalties: number }}
 */
export function collectHandAntes({
  participants,
  scoreById,
  buyInFallback = 0,
  stakeForPlayer,
}) {
  const bankrolls = {};
  const postedAntes = {};
  const outIds = [];
  const activeParticipants = [];
  let uncollectedPenalties = 0;

  for (const pid of participants) {
    const row = scoreById[pid];
    const replacementDue = Number(row?.bourreReplacementDue);
    const isBourreReplacement =
      Number.isFinite(replacementDue) && replacementDue > 0;
    const stake = Math.max(0, Number(stakeForPlayer(pid)) || 0);
    const br = scoreBankroll(row, buyInFallback);

    if (stake <= 0) {
      bankrolls[pid] = br;
      postedAntes[pid] = 0;
      activeParticipants.push(pid);
      continue;
    }

    const result = applyBankrollDelta(br, -stake);
    bankrolls[pid] = result.newBankroll;
    postedAntes[pid] = Math.abs(result.appliedDelta);

    if (isBourreReplacement && result.busted) {
      uncollectedPenalties += Math.max(0, stake - Math.abs(result.appliedDelta));
    }

    if (result.busted) {
      outIds.push(pid);
      continue;
    }
    activeParticipants.push(pid);
  }

  return {
    bankrolls,
    postedAntes,
    outIds: [...new Set(outIds)],
    activeParticipants,
    uncollectedPenalties,
  };
}

/** Stake already posted at deal time — settlement must not deduct again. */
export function anteAlreadyPosted(postedAntes, playerId) {
  return postedAntes != null && Object.prototype.hasOwnProperty.call(postedAntes, playerId);
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

  const adjustedCarry = Math.max(0, Number(carryOverPot) || 0);

  const totalPool = participants.reduce((sum, pid) => {
    const loss = appliedDeltas[pid] ?? 0;
    return loss < 0 ? sum + Math.abs(loss) : sum;
  }, 0);

  if (mode === "win" && winners.length === 1) {
    const winner = winners[0];
    const potDeferredToCarry = carryOverPot > 0;
    const winDelta = potDeferredToCarry
      ? 0
      : totalPool > 0
        ? totalPool
        : Math.max(0, nominalDeltas[winner] ?? 0);
    const br = scoreBankroll(scoreById[winner], buyInFallback);
    bankrolls[winner] = br + winDelta;
    appliedDeltas[winner] = (appliedDeltas[winner] ?? 0) + winDelta;
  } else if (mode === "split" && winners.length >= 2) {
    const poolWin =
      totalPool > 0
        ? totalPool
        : winners.reduce((sum, wid) => sum + Math.max(0, nominalDeltas[wid] ?? 0), 0);
    const share = poolWin / winners.length;
    for (const winner of winners) {
      const br = scoreBankroll(scoreById[winner], buyInFallback);
      const already = appliedDeltas[winner] ?? 0;
      bankrolls[winner] = br + share;
      appliedDeltas[winner] = already + share;
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
