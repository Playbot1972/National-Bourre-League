/**
 * Pure table presentation helpers — map session/hand state to view data.
 * No Firestore writes, timers, or orchestration.
 */

import {
  deserializeCards,
  effectivePlayerHand,
  serializeCards,
  getLegalPlayIndices,
  buildPlayValidationState,
  displayHoleCardCount,
} from "./game-engine.js";
import {
  deriveWinnersFromTricks,
  isHandComplete,
  tricksForPlayer,
  getSessionCurrentHand,
  totalTricksPlayed,
  MAX_TRICKS_PER_HAND,
  tricksToWinHint,
} from "./firestore.js";
import {
  scoreBankroll,
  bourrePlayerIds,
  computeHandPotState,
  projectNextHandPot,
  sumProjectedHandAntes,
} from "./bourre-rules.js";
import { apeClass, apeStatus } from "./ranking.js";
import { canPlayerShowHandChoice, isRobotPlayerId } from "./session-startup.js";
import { resolveActionOrder } from "./firestore.js";
import { handAnteContribution } from "./bourre-rules.js";

function projectedAnteContribution(playerId, scoreRow, sessionStake, postedAntes) {
  if (postedAntes != null && Object.prototype.hasOwnProperty.call(postedAntes, playerId)) {
    return Math.max(0, Number(postedAntes[playerId]) || 0);
  }
  if (scoreRow?.out === true) return 0;
  return handAnteContribution(scoreRow, sessionStake);
}

/** Dealer-relative ante sequence — skips exempt / ineligible players. */
export function resolveAnteContributorIds(session, scoreById, sessionStake) {
  if (session.anteContributorIds?.length) {
    return session.anteContributorIds.filter(Boolean).slice(0, 8);
  }
  const participantIds = (session.participantIds || []).filter(Boolean);
  if (!participantIds.length) return [];
  const ordered = resolveActionOrder(
    {
      actionOrder: session.actionOrder,
      participantIds,
      dealerId: session.dealerId,
      seatedIds: session.seatedIds,
    },
    session.seatedIds,
  );
  return ordered
    .filter(
      (playerId) =>
        projectedAnteContribution(playerId, scoreById[playerId], sessionStake, session.postedAntes) >
        0,
    )
    .slice(0, 8);
}

export function cardKeyFromSerialized(card) {
  if (!card?.rank || !card?.suit) return null;
  return `${card.rank}-${card.suit}`;
}

/** Snapshot for sound/haptic diffing (feedback-only). */
export function buildTableFeedbackSnapshot(sessionObj, { myUid, privateHandCards = [], recentBourreIds = [] }) {
  const currentHand = getSessionCurrentHand(sessionObj) ?? {};
  const participantIds = currentHand.participantIds ?? [];
  const tricks = currentHand.tricksByPlayer ?? {};
  const { ready, winnerIds } = deriveWinnersFromTricks(tricks, participantIds);
  const handComplete = isHandComplete(tricks, participantIds);
  const bourreIds = recentBourreIds.length > 0 ? recentBourreIds : bourrePlayerIds(tricks, participantIds);
  return {
    sessionId: sessionObj?.id ?? null,
    handNumber: sessionObj?.handCount ?? 0,
    phase: currentHand.phase ?? null,
    trumpKey: cardKeyFromSerialized(currentHand.trumpUpcard),
    drawCompletedIds: [...(currentHand.drawCompletedIds ?? [])],
    myTricks: myUid ? tricksForPlayer(tricks, myUid) : 0,
    handComplete,
    myIsWinner: myUid != null && handComplete && ready && winnerIds.includes(myUid),
    myBourre: myUid != null && handComplete && bourreIds.includes(myUid),
    heroCardKeys: (privateHandCards ?? [])
      .map(cardKeyFromSerialized)
      .filter(Boolean)
      .sort()
      .join(","),
  };
}

export function buildHeroCardsForTable(currentHand, privateCardList, playerId, handPhase) {
  const privateCards = privateCardList ?? [];
  if (!currentHand || !playerId || !isHandCardsDealtPhase(handPhase)) {
    return privateCards;
  }
  const participantIds = currentHand.participantIds ?? [];
  if (participantIds.length > 0 && !participantIds.includes(playerId)) {
    return [];
  }
  const effective = effectivePlayerHand(
    playerId,
    deserializeCards(privateCards),
    currentHand,
  );
  return serializeCards(effective);
}

export function computeLegalPlayIndices(currentHand, heroCards, playerId) {
  if (!currentHand || currentHand.phase !== "play" || !heroCards?.length || !playerId) {
    return null;
  }
  const privateHand = deserializeCards(heroCards);
  const hand = effectivePlayerHand(playerId, privateHand, currentHand);
  const ctx = buildPlayValidationState({ hand, publicHand: currentHand });
  return getLegalPlayIndices(ctx, {
    dealerSeat: currentHand.dealerId ?? null,
    leaderSeat: currentHand.currentTrick?.leadPlayerId ?? null,
    currentTurnSeat: currentHand.turnPlayerId ?? null,
    trickIndex: currentHand.currentTrick?.trickNumber ?? 0,
  });
}

export function isHandCardsDealtPhase(handPhase) {
  return (
    handPhase === "reveal" ||
    handPhase === "decision" ||
    handPhase === "draw" ||
    handPhase === "play"
  );
}

export function activeSeatedPlayerIds(sessionPlayers, displayScores) {
  const fromSession = (sessionPlayers || []).map((p) => p.playerId).filter(Boolean);
  const pool = fromSession.length
    ? fromSession
    : displayScores.map((sc) => sc.playerId).filter(Boolean);
  return pool.filter((pid) => {
    const row = displayScores.find((sc) => sc.playerId === pid);
    return row?.out !== true;
  });
}

export function buildTablePotMetrics({
  handParticipantIds,
  sessionPlayers,
  displayScores,
  handStake,
  limEnabled,
  carryOver,
  postedAntes,
}) {
  const scoreById = Object.fromEntries(displayScores.map((x) => [x.playerId, x]));
  const potFundingPlayerIds =
    handParticipantIds.length > 0
      ? handParticipantIds
      : activeSeatedPlayerIds(sessionPlayers, displayScores);
  const antePot = sumProjectedHandAntes(scoreById, potFundingPlayerIds, handStake, postedAntes);
  const potState = computeHandPotState({
    anteAmount: handStake,
    limEnabled,
    carryIn: carryOver,
    antePot,
  });
  const projectedNextPot = projectNextHandPot(
    carryOver,
    scoreById,
    potFundingPlayerIds,
    handStake,
    postedAntes,
  );
  return {
    potFundingPlayerIds,
    potMetrics: {
      anteAmount: potState.anteAmount,
      potCap: potState.potCap,
      currentPot: handParticipantIds.length > 0 ? potState.currentPot : projectedNextPot,
      maxWinThisHand:
        handParticipantIds.length > 0
          ? potState.maxWinThisHand
          : limEnabled
            ? Math.min(projectedNextPot, potState.potCap)
            : projectedNextPot,
      limEnabled: potState.limEnabled,
      overflow: potState.overflow,
    },
  };
}

export function buildEnrollmentLeaderLabel(displayScores, enrollment, myUid, pagatDecision = false) {
  const currentId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
  const name = displayScores.find((sc) => sc.playerId === currentId)?.displayName || "Player";
  if (currentId === myUid) {
    return pagatDecision ? "Your turn — pass or play" : "Your turn — tap I'm in";
  }
  return pagatDecision
    ? `Waiting for ${name} — pass or play clockwise from dealer`
    : `Waiting for ${name} — clockwise from dealer`;
}

export function buildTableLeaderLabel(
  displayScores,
  participantIds,
  tricksThisHand,
  activeWinnerIds,
  handReady,
  maxTricks,
  handComplete,
  totalTricks,
  phase,
  trumpSuit,
) {
  const suitNames = {
    spades: "Spades",
    hearts: "Hearts",
    diamonds: "Diamonds",
    clubs: "Clubs",
  };
  if (phase === "draw") {
    const suitLabel = suitNames[trumpSuit] || trumpSuit || "—";
    return `Trump ${suitLabel} · draw round — discard up to 5 cards or stand pat`;
  }
  if (phase === "play") {
    const suitLabel = suitNames[trumpSuit] || trumpSuit || "—";
    return `Trump ${suitLabel} · tap a legal card to play (${totalTricks}/5 tricks)`;
  }
  if (!participantIds.length) return "Tap I'm in when you're ready to play.";
  if (handComplete && handReady && activeWinnerIds.length === 1) {
    const name =
      displayScores.find((sc) => sc.playerId === activeWinnerIds[0])?.displayName || "Winner";
    const bourreIds = bourrePlayerIds(tricksThisHand, participantIds);
    if (bourreIds.length) {
      const bourreNames = bourreIds
        .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
        .join(" & ");
      return `${name} wins (${maxTricks} tricks) · Bourré: ${bourreNames}`;
    }
    return `${name} wins (${maxTricks} tricks)`;
  }
  if (handComplete && handReady && activeWinnerIds.length >= 2) {
    const names = activeWinnerIds
      .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
      .join(" & ");
    return `Tie — ${names} (${maxTricks} tricks each) · pot carries (no split)`;
  }
  if (handReady && activeWinnerIds.length === 1) {
    const name =
      displayScores.find((sc) => sc.playerId === activeWinnerIds[0])?.displayName || "Leader";
    return `${name} leads (${maxTricks} tricks) — play out to 5 (${totalTricks}/5 played)`;
  }
  if (handReady && activeWinnerIds.length >= 2) {
    const names = activeWinnerIds
      .map((id) => displayScores.find((sc) => sc.playerId === id)?.displayName || id)
      .join(" & ");
    return `Tie at ${maxTricks} — finish all 5 tricks (${totalTricks}/5 played)`;
  }
  const winHint = tricksToWinHint(participantIds.length);
  return `Tap + when you take a trick (${totalTricks}/5 played · most tricks wins, can be ${winHint} with ${participantIds.length} in)`;
}

/**
 * Per-seat HUD flags for the live table (one score row).
 */
export function buildTablePlayerSeatFlags(sc, ctx) {
  const {
    myUid,
    myPhotoUrl,
    sessionBuyIn,
    handParticipantIds,
    tricksThisHand,
    cardsDealt,
    currentHand,
    handComplete,
    handReady,
    activeWinnerIds,
    enrolledDuringSignup,
    declinedEnrollmentIds,
    plannedDiscards,
    enrollmentActive,
    pagatDecisionActive,
    currentEnrollmentPlayerId,
    isFinal,
    totalTricks,
    ratingsByPlayerId,
    applyLocalCommitToPlayerFlags,
    localHandActionCommit,
  } = ctx;

  const isSelf = sc.playerId === myUid;
  const rating = ratingsByPlayerId[sc.playerId];
  const apeScoreVal = rating?.apeScore;
  const lockedInLiveHand =
    handParticipantIds.includes(sc.playerId) &&
    (currentHand?.phase === "draw" || currentHand?.phase === "play");
  const bankroll = scoreBankroll(sc, sessionBuyIn);
  const playerFlags = {
    playerId: sc.playerId,
    displayName: sc.displayName,
    photoURL: isSelf ? myPhotoUrl : null,
    handsWon: sc.handsWon ?? 0,
    sessionStreak: sc.handsWon ?? 0,
    ...(rating && !isRobotPlayerId(sc.playerId)
      ? {
          apeScore: apeScoreVal ?? 0,
          apeClass: rating.apeClass ?? apeClass(apeScoreVal ?? 0),
          apeStatus: rating.apeStatus ?? apeStatus(rating),
        }
      : {}),
    ...(isSelf ? { net: sc.net ?? 0 } : {}),
    bankroll,
    isOut: lockedInLiveHand ? false : sc.out === true || bankroll <= 0,
    ...(isSelf && sc.perHandStake != null ? { perHandStake: sc.perHandStake } : {}),
    inHand:
      handParticipantIds.includes(sc.playerId) || enrolledDuringSignup.includes(sc.playerId),
    tricksThisHand: tricksThisHand[sc.playerId] ?? 0,
    isSelf,
    isDealer: sc.playerId === ctx.dealerId,
    isLeading: !handComplete && handReady && activeWinnerIds.includes(sc.playerId),
    isWinner: handComplete && handReady && activeWinnerIds.includes(sc.playerId),
    enrollmentSatOut: declinedEnrollmentIds.includes(sc.playerId),
    enrollmentJoined: enrolledDuringSignup.includes(sc.playerId),
    decisionPlannedDiscards: plannedDiscards[sc.playerId],
    isRobot: sc.isRobot === true || isRobotPlayerId(sc.playerId),
    showHoleCards:
      cardsDealt && handParticipantIds.includes(sc.playerId) && sc.playerId !== myUid,
    holeCardCount: cardsDealt ? displayHoleCardCount(currentHand || {}, sc.playerId, false) : 0,
    isOnTurn: cardsDealt && currentHand?.turnPlayerId === sc.playerId,
    isActiveActor:
      (enrollmentActive || pagatDecisionActive) && currentEnrollmentPlayerId === sc.playerId
        ? true
        : cardsDealt && currentHand?.turnPlayerId === sc.playerId,
    canToggleInHand: canPlayerShowHandChoice({
      enrollmentGateActive: enrollmentActive,
      isSelf,
      playerId: sc.playerId,
      currentChoicePlayerId: currentEnrollmentPlayerId,
      isFinal,
      bankroll: scoreBankroll(sc, sessionBuyIn),
      isOut: sc.out === true,
    }),
    canPassEnrollment:
      canPlayerShowHandChoice({
        enrollmentGateActive: enrollmentActive,
        isSelf,
        playerId: sc.playerId,
        currentChoicePlayerId: currentEnrollmentPlayerId,
        isFinal,
        bankroll: scoreBankroll(sc, sessionBuyIn),
        isOut: sc.out === true,
      }) && !declinedEnrollmentIds.includes(sc.playerId),
    canEditTricks:
      !cardsDealt &&
      !isFinal &&
      handParticipantIds.includes(sc.playerId) &&
      isSelf &&
      !handComplete &&
      totalTricks < MAX_TRICKS_PER_HAND,
  };

  if (isSelf && localHandActionCommit && applyLocalCommitToPlayerFlags) {
    return applyLocalCommitToPlayerFlags(localHandActionCommit, playerFlags, myUid);
  }
  return playerFlags;
}

export { MAX_TRICKS_PER_HAND, totalTricksPlayed, isHandComplete, deriveWinnersFromTricks };
