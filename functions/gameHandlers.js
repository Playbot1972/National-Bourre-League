/**
 * Server-authoritative Bourré hand mutations.
 * Uses the same pure engine as the client (functions/vendor/game-engine.js).
 */
import { HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  dealInitialHand,
  playerOrderFromDealer,
  serializeHandState,
  serializePagatRevealHand,
  deserializeCards,
  serializeCards,
  shuffledDeckFromSeed,
  pileFromPublicHand,
  totalAvailableReplacements,
  applyPlayerDraw,
  advanceAfterDraw,
  applyDrawFold,
  revealToDraw,
  applyPlayerPlayCard,
  botDrawDiscardIndices,
  botPlayCardIndex,
  buildPlayValidationState,
  effectivePlayerHand,
  maxDrawDiscards,
  HAND_PHASE,
  activateHandDecision,
  applyDecisionPlay,
  applyDecisionPass,
  applyDecisionTimeout,
  currentDecisionPlayer,
  decisionAsEnrollmentView,
  buildHandDecision,
  resolveActionOrder,
} from "./vendor/game-engine.js";
import { settleHandDeltas, applySolventSettlement, scoreBankroll, resolveSessionBuyIn, collectHandAntes, collectNextHandAntes, anteAlreadyPosted, canEnrollWithBankroll, settleSoloDefaultWin, handAnteContribution, nextDealFundingFlags, buildNextDealFundingSnapshot, mergeNextDealFundingIntoScoreById, bourreRemaindersFromSettlement, logBourreAccounting, sessionChipTotal, splitPotVoteAllowed } from "./vendor/bourre-rules.js";
import {
  buildHandFlowSnapshot,
  canSubmitHandAction,
  canActForPlayer,
  enrollmentDeadlineMs,
  resolveBotAdvanceHint,
  assertHandActionAllowed,
  assertSettlementEntryAllowed,
  assertSessionChipConserved,
  checkInvariant,
} from "./vendor/session-startup.js";
import { nextRiskStake } from "./vendor/risk-stakes.js";
import {
  planBotAutoRebuys,
  patchSessionPlayersWithRebuyNames,
  sessionHasRobotScores,
} from "./vendor/bot-rebuy.js";

export const HAND_ENROLLMENT_MS = 12_000;
export const MAX_TRICKS_PER_HAND = 5;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

function handActionHttpsError(action, reason) {
  if (reason === "actor_mismatch") {
    const msg =
      action === "play_card"
        ? "You can only play for yourself (or drive a robot)"
        : action === "draw_fold"
          ? "You can only fold for yourself (or drive a robot)"
          : "You can only draw for yourself (or drive a robot)";
    return new HttpsError("permission-denied", msg);
  }
  if (reason === "not_draw") return new HttpsError("failed-precondition", "Not in draw phase");
  if (reason === "not_play") return new HttpsError("failed-precondition", "Not in trick-play phase");
  if (reason === "not_your_turn") {
    return new HttpsError(
      "failed-precondition",
      action === "play_card" ? "Not your turn" : "Not your turn to draw",
    );
  }
  if (reason === "draw_already_complete") {
    return new HttpsError("failed-precondition", "Draw already completed");
  }
  return new HttpsError("failed-precondition", `Action blocked (${reason})`);
}

function assertCanSubmitHandAction(sessionData, action, playerId, actorId) {
  const currentHand = getSessionCurrentHand(sessionData);
  try {
    assertHandActionAllowed(
      sessionData,
      action,
      playerId,
      actorId,
      currentHand.drawCompletedIds ?? [],
    );
  } catch (err) {
    if (err?.name === "HandInvariantError" && err.code === "action_blocked") {
      throw handActionHttpsError(action, err.context?.reason ?? "blocked");
    }
    if (err?.name === "HandInvariantError" && err.code === "illegal_transition") {
      throw new HttpsError("failed-precondition", `Action blocked (illegal phase transition: ${action})`);
    }
    if (err?.name === "HandInvariantError") {
      throw new HttpsError("failed-precondition", err.message);
    }
    throw err;
  }
}

function assertRecordHandChipConservation({
  scoreById,
  carryOverPot,
  postedAntes,
  buyIn,
  solvent,
  participants,
  deltas,
}) {
  const beforeTotal = sessionChipTotal(scoreById, {
    carryOverPot,
    postedAntes,
    buyInFallback: buyIn,
  });
  const afterScores = { ...scoreById };
  for (const pid of participants) {
    afterScores[pid] = {
      ...afterScores[pid],
      bankroll: solvent.bankrolls[pid] ?? scoreBankroll(afterScores[pid], buyIn),
      net: (afterScores[pid].net || 0) + (deltas[pid] ?? 0),
    };
  }
  const afterTotal = sessionChipTotal(afterScores, {
    carryOverPot: solvent.carryOverPot,
    postedAntes: {},
    buyInFallback: buyIn,
  });
  assertSessionChipConserved(beforeTotal, afterTotal, {
    boundary: "handleRecordHand",
    participantCount: participants.length,
  });
}

export { canActForPlayer } from "./vendor/session-startup.js";

export function sessionRef(db, roomId, sessionId) {
  return db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId);
}

export function scoresCol(db, roomId, sessionId) {
  return sessionRef(db, roomId, sessionId).collection("scores");
}

export function handsCol(db, roomId, sessionId) {
  return sessionRef(db, roomId, sessionId).collection("hands");
}

export function privateHandRef(db, roomId, sessionId, playerId) {
  return sessionRef(db, roomId, sessionId).collection("privateHands").doc(playerId);
}

export async function assertRoomMember(db, roomId, uid) {
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required");
  const snap = await db.doc(`roomMembers/${roomId}_${uid}`).get();
  if (!snap.exists) throw new HttpsError("permission-denied", "Not a room member");
}

function emptyPreDealHand() {
  return { tricksByPlayer: {}, participantIds: [] };
}

function handPhaseStarted(hand) {
  const phase = hand?.phase ?? null;
  return (
    phase === HAND_PHASE.REVEAL ||
    phase === HAND_PHASE.DECISION ||
    phase === HAND_PHASE.DRAW ||
    phase === HAND_PHASE.PLAY
  );
}

function sessionHandDealStarted(sessionData) {
  if (!sessionData) return false;
  if (handPhaseStarted(sessionData.currentHand)) return true;
  if (handPhaseStarted(sessionData.liveEnrollment?.deal?.publicHand)) return true;
  return handPhaseStarted(getSessionCurrentHand(sessionData));
}

function rawCurrentHand(sessionData) {
  return sessionData?.currentHand ?? emptyPreDealHand();
}

function getSessionEnrollment(sessionData) {
  const hand = getSessionCurrentHand(sessionData);
  const phase = hand?.phase;
  if (
    phase === HAND_PHASE.REVEAL ||
    phase === HAND_PHASE.DRAW ||
    phase === HAND_PHASE.PLAY
  ) {
    return null;
  }
  if (phase === HAND_PHASE.DECISION) {
    const view = decisionAsEnrollmentView(hand.handDecision);
    return view?.active ? view : null;
  }
  const live = sessionData?.liveEnrollment;
  const livePhase = live?.deal?.publicHand?.phase ?? null;
  if (live?.active) return live;
  if (
    livePhase === HAND_PHASE.DRAW ||
    livePhase === HAND_PHASE.PLAY ||
    livePhase === HAND_PHASE.REVEAL ||
    livePhase === HAND_PHASE.DECISION
  ) {
    return null;
  }
  if (sessionData?.handEnrollment?.active) return sessionData.handEnrollment;
  return sessionData?.handEnrollment ?? null;
}

function getSessionHandDecision(sessionData) {
  const hand = getSessionCurrentHand(sessionData);
  if (hand?.phase === HAND_PHASE.DECISION && hand?.handDecision?.active) {
    return hand.handDecision;
  }
  return null;
}

function isClearedPreDealHand(hand) {
  const h = hand ?? emptyPreDealHand();
  if (h.phase === "draw" || h.phase === "play") return false;
  if ((h.participantIds?.length ?? 0) > 0) return false;
  const tricks = h.tricksByPlayer ?? {};
  return !Object.values(tricks).some((n) => (n || 0) > 0);
}

function handInProgress(hand) {
  if (!hand) return false;
  const phase = hand.phase ?? null;
  if (
    phase !== HAND_PHASE.DRAW &&
    phase !== HAND_PHASE.PLAY &&
    phase !== HAND_PHASE.REVEAL &&
    phase !== HAND_PHASE.DECISION
  ) {
    return false;
  }
  const participantIds = hand.participantIds ?? [];
  if (participantIds.length === 0) return false;
  const tricks = hand.tricksByPlayer ?? {};
  if (isHandComplete(tricks, participantIds)) return false;
  if (totalTricksPlayed(tricks, participantIds) >= MAX_TRICKS_PER_HAND) return false;
  return true;
}

function handProgressScore(hand) {
  if (!hand) return 0;
  const phase = hand.phase ?? "";
  let score =
    phase === HAND_PHASE.PLAY
      ? 1000
      : phase === HAND_PHASE.DRAW
        ? 100
        : phase === HAND_PHASE.DECISION
          ? 50
          : phase === HAND_PHASE.REVEAL
            ? 25
            : 0;
  score += (hand.drawCompletedIds?.length ?? 0) * 10;
  const participants = hand.participantIds ?? [];
  score += totalTricksPlayed(hand.tricksByPlayer ?? {}, participants);
  const decision = hand.handDecision;
  if (phase === HAND_PHASE.DECISION && decision) {
    score += (decision.currentIndex ?? 0) * 5;
    score += (decision.playingIds?.length ?? 0) * 2;
    score += (decision.passedIds?.length ?? 0) * 2;
  }
  return score;
}

function preferInProgressHand(current, livePublic) {
  if (!handInProgress(livePublic)) return current;
  if (!handInProgress(current)) return livePublic;
  return handProgressScore(livePublic) >= handProgressScore(current) ? livePublic : current;
}

function authoritativeCurrentHand(sessionData) {
  const current = sessionData?.currentHand ?? emptyPreDealHand();
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  const livePhase = livePublic?.phase ?? null;
  const enrollmentActive = Boolean(
    sessionData?.liveEnrollment?.active || sessionData?.handEnrollment?.active,
  );

  if (handInProgress(current) && handInProgress(livePublic)) {
    const currentEarly =
      current.phase === HAND_PHASE.REVEAL || current.phase === HAND_PHASE.DECISION;
    const liveDrawDone = livePublic?.drawCompletedIds?.length ?? 0;
    const currentDrawDone = current.drawCompletedIds?.length ?? 0;
    const liveTricks = totalTricksPlayed(
      livePublic?.tricksByPlayer ?? {},
      livePublic?.participantIds ?? [],
    );
    const currentTricks = totalTricksPlayed(
      current.tricksByPlayer ?? {},
      current.participantIds ?? [],
    );
    if (
      currentEarly &&
      livePublic?.phase === HAND_PHASE.DRAW &&
      currentTricks === 0 &&
      liveTricks === 0 &&
      liveDrawDone > 0 &&
      currentDrawDone === 0
    ) {
      return current;
    }
    return preferInProgressHand(current, livePublic);
  }

  if (handInProgress(current)) return current;

  if (isClearedPreDealHand(current) && livePublic && !handInProgress(livePublic)) {
    return emptyPreDealHand();
  }

  if (livePhase === "draw" || livePhase === "play" || livePhase === "reveal" || livePhase === "decision") {
    if (handInProgress(livePublic)) {
      const liveTricks = totalTricksPlayed(
        livePublic?.tricksByPlayer ?? {},
        livePublic?.participantIds ?? [],
      );
      if (
        isClearedPreDealHand(current) &&
        liveTricks === 0 &&
        livePhase === "draw" &&
        !sessionData?.liveEnrollment?.active
      ) {
        return emptyPreDealHand();
      }
      return livePublic;
    }
    if (isClearedPreDealHand(current)) return emptyPreDealHand();
    return current;
  }

  if (livePhase && livePublic) return livePublic;
  return current;
}

function isHandComplete(tricksByPlayer, participantIds) {
  return totalTricksPlayed(tricksByPlayer, participantIds) >= MAX_TRICKS_PER_HAND;
}

function isStaleLiveDealSnapshot(sessionData) {
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  if (!livePublic?.phase) return false;
  if (getSessionEnrollment(sessionData)?.active) return false;
  if (sessionData?.pendingCoWinSettlement) return false;
  if (!isClearedPreDealHand(sessionData?.currentHand)) return false;
  return isHandComplete(livePublic.tricksByPlayer || {}, livePublic.participantIds || []);
}

function shouldClearStaleLiveEnrollment(sessionData) {
  if (!sessionData?.liveEnrollment?.deal) return false;
  if (isStaleLiveDealSnapshot(sessionData)) return true;
  const livePhase = sessionData.liveEnrollment.deal.publicHand?.phase ?? null;
  const enrollmentActive = Boolean(
    sessionData?.liveEnrollment?.active || sessionData?.handEnrollment?.active,
  );
  if ((livePhase === "draw" || livePhase === "play") && !enrollmentActive) {
    return isClearedPreDealHand(sessionData?.currentHand);
  }
  if (livePhase === "draw" || livePhase === "play") return false;
  return isClearedPreDealHand(sessionData?.currentHand);
}

function getSessionCurrentHand(sessionData) {
  return authoritativeCurrentHand(sessionData);
}

function publicHandSessionUpdate(sessionData, nextPublicHand) {
  if (sessionData?.liveEnrollment?.deal) {
    return {
      "liveEnrollment.deal.publicHand": nextPublicHand,
      currentHand: nextPublicHand,
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
  return { currentHand: nextPublicHand, updatedAt: FieldValue.serverTimestamp() };
}

function embeddedPrivateHandData(sessionData, playerId) {
  const hand = sessionData?.liveEnrollment?.deal?.privateHandsByPlayer?.[playerId];
  if (!hand?.cards) return null;
  return { cards: hand.cards };
}

async function readPrivateHandInTransaction(tx, db, roomId, sessionId, sessionData, playerId) {
  const embedded = embeddedPrivateHandData(sessionData, playerId);
  if (embedded) return embedded;
  const privateSnap = await tx.get(privateHandRef(db, roomId, sessionId, playerId));
  return privateSnap.exists ? privateSnap.data() : null;
}

function writePrivateHandInTransaction(tx, db, ref, sessionData, roomId, sessionId, playerId, serializedCards) {
  const phase = getSessionCurrentHand(sessionData)?.phase ?? null;
  const hasDealMirror = Boolean(sessionData?.liveEnrollment?.deal);
  const inDrawOrPlay = phase === HAND_PHASE.DRAW || phase === HAND_PHASE.PLAY;
  if (hasDealMirror || sessionData?.liveEnrollment?.deal?.privateHandsByPlayer || inDrawOrPlay) {
    tx.update(ref, {
      [`liveEnrollment.deal.privateHandsByPlayer.${playerId}.cards`]: serializedCards,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }
  tx.set(privateHandRef(db, roomId, sessionId, playerId), {
    cards: serializedCards,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function enrollmentOrderFromDealer(dealerId, sortedPlayerIds) {
  return playerOrderFromDealer(dealerId, sortedPlayerIds);
}

export function buildHandEnrollment(sortedPlayerIds, dealerId, scoreById = {}, buyIn = 1, nowMs = Date.now()) {
  const activeIds = sortedPlayerIds.filter((id) => {
    const row = scoreById[id];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyIn));
  });
  const orderedPlayerIds = enrollmentOrderFromDealer(dealerId, activeIds);
  return {
    active: true,
    orderedPlayerIds,
    currentIndex: 0,
    turnDeadlineMs: nowMs + HAND_ENROLLMENT_MS,
    enrolledIds: [],
    declinedIds: [],
  };
}

function buildScorePatchesFromAnteCollection(collected, dealIds) {
  const patches = {};
  const touched = new Set([...collected.outIds, ...dealIds]);
  for (const pid of touched) {
    if (collected.bankrolls[pid] == null) continue;
    const patch = { bankroll: collected.bankrolls[pid] };
    if (collected.outIds.includes(pid)) {
      patch.out = true;
    } else if (dealIds.includes(pid)) {
      patch.out = FieldValue.delete();
    }
    if (collected.postedAntes[pid] != null) {
      patch.bourreReplacementDue = FieldValue.delete();
      patch.skipNextAnte = FieldValue.delete();
    }
    patches[pid] = patch;
  }
  return patches;
}

function buildDealCompletionPatch(
  dealerId,
  enrolledIds,
  sortedPlayerIds,
  seed,
  dealingRule,
  dealContextExtras = {},
) {
  const { scoreById = {}, sessionStake = 1, buyIn = 1, carryIn = 0, handCount = 0 } =
    dealContextExtras;
  const collected = collectNextHandAntes({
    carryOverPot: carryIn,
    participantIds: enrolledIds,
    scoreById,
    sessionStake,
    buyInFallback: buyIn,
  });
  logBourreAccounting("next-hand-antes", {
    handCount,
    carryIn,
    nextHandPot: collected.nextHandPot,
    postedAntes: collected.postedAntes,
    bankrolls: collected.bankrolls,
    bourreReplacementDue: Object.fromEntries(
      enrolledIds.map((pid) => [pid, scoreById[pid]?.bourreReplacementDue ?? null]),
    ),
  });
  const dealIds = collected.activeParticipants;
  if (dealIds.length < 2) {
    if (dealIds.length === 1) {
      return buildSoloWinPatch(
        dealIds[0],
        { carryOverPot: carryIn, handCount },
        {
          ...dealContextExtras,
          dealerId,
          sortedPlayerIds,
          sessionStake,
          buyIn,
          scoreById,
        },
      );
    }
    return {
      handEnrollment: FieldValue.delete(),
      liveEnrollment: FieldValue.delete(),
      currentHand: emptyPreDealHand(),
      scorePatches: buildScorePatchesFromAnteCollection(collected, dealIds),
    };
  }

  const deal = dealInitialHand({
    dealerId,
    participantIds: dealIds,
    sortedPlayerIds,
    seed: seed ?? Date.now(),
  });
  const bundle = serializePagatRevealHand(deal, {
    dealerId,
    actionOrder: deal.dealOrder,
    seatedIds: sortedPlayerIds,
    maxDrawDiscards: maxDrawDiscards(dealIds.length, dealingRule),
  });
  return {
    handEnrollment: FieldValue.delete(),
    liveEnrollment: FieldValue.delete(),
    currentHand: {
      ...bundle.publicHand,
      postedAntes: collected.postedAntes,
    },
    privateHandsByPlayer: bundle.privateHandsByPlayer,
    scorePatches: buildScorePatchesFromAnteCollection(collected, dealIds),
  };
}

function applySoloWinInTransaction(tx, ref, db, roomId, sessionId, patch) {
  if (patch.scorePatches) {
    for (const [playerId, scorePatch] of Object.entries(patch.scorePatches)) {
      tx.update(scoresCol(db, roomId, sessionId).doc(playerId), {
        ...scorePatch,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
  tx.update(ref, {
    handCount: patch.handNumber,
    handStakeLocked: true,
    carryOverPot: patch.carryOverPot ?? 0,
    ...(patch.newDealerId ? { dealerId: patch.newDealerId } : {}),
    handEnrollment: FieldValue.delete(),
    liveEnrollment: FieldValue.delete(),
    currentHand: patch.currentHand ?? emptyPreDealHand(),
    pendingCoWinSettlement: FieldValue.delete(),
    nextDealFunding: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function buildSoloWinPatch(winnerId, sessionData, dealContext) {
  const { scoreById = {}, sessionStake = 1, buyIn = 1 } = dealContext;
  const stakeFor = (pid) => playerHandStake(scoreById, pid, sessionStake);
  const settled = settleSoloDefaultWin({
    winnerId,
    carryIn: sessionData.carryOverPot || 0,
    scoreById,
    buyInFallback: buyIn,
    stakeForPlayer: stakeFor,
  });
  if (!settled.ready) return null;
  const handNumber = (sessionData.handCount || 0) + 1;
  const currentDealer = dealContext.dealerId ?? sessionData.dealerId ?? null;
  const newDealerId = rotateDealerSeat(dealContext.sortedPlayerIds ?? [], currentDealer);
  const br = settled.bankrolls[winnerId];
  const scorePatches = {
    [winnerId]: {
      bankroll: br,
      net:
        (scoreById[winnerId]?.net || 0) +
        settled.pot -
        (settled.postedAntes[winnerId] ?? 0),
      handsWon: (scoreById[winnerId]?.handsWon || 0) + 1,
      tricksWon: scoreById[winnerId]?.tricksWon || 0,
      out: br <= 0 ? true : FieldValue.delete(),
    },
  };
  return {
    soloWin: true,
    winnerId,
    handNumber,
    pot: settled.pot,
    carryOverPot: 0,
    scorePatches,
    currentHand: emptyPreDealHand(),
    newDealerId,
  };
}

function tryAutoEnrollmentDeal(sessionData, sortedIds, scoreById, buyIn, sessionStake, dealingRule) {
  const optIn = sessionData?.tableOptInIds || [];
  if (!optIn.length) return null;
  const eligible = sortedIds.filter((id) => {
    if (!optIn.includes(id)) return false;
    const row = scoreById[id];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyIn));
  });
  if (eligible.length < 2) return null;
  return buildDealCompletionPatch(
    sessionData.dealerId,
    eligible,
    sortedIds,
    Date.now(),
    dealingRule,
    { scoreById, sessionStake, buyIn },
  );
}

function enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, dealContext = null) {
  const nextIndex = enrollment.currentIndex + 1;
  if (nextIndex < enrollment.orderedPlayerIds.length) {
    return {
      handEnrollment: {
        ...enrollment,
        enrolledIds,
        declinedIds,
        currentIndex: nextIndex,
        turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
      },
      currentHand: emptyPreDealHand(),
    };
  }
  if (enrolledIds.length < 2) {
    return {
      handEnrollment: {
        ...enrollment,
        enrolledIds: [],
        declinedIds: [],
        currentIndex: 0,
        turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
      },
      currentHand: emptyPreDealHand(),
    };
  }
  if (!dealContext?.sortedPlayerIds?.length) {
    throw new HttpsError("failed-precondition", "Missing deal context for enrollment completion");
  }
  return buildDealCompletionPatch(
    dealContext.dealerId,
    enrolledIds,
    dealContext.sortedPlayerIds,
    dealContext.seed,
    dealContext.dealingRule,
    {
      scoreById: dealContext.scoreById ?? {},
      sessionStake: dealContext.sessionStake ?? 1,
      buyIn: dealContext.buyIn ?? 1,
      carryIn: dealContext.carryIn ?? 0,
      handCount: dealContext.handCount ?? 0,
    },
  );
}

function sortedScorePlayerIds(scoreDocs) {
  return scoreDocs
    .map((d) => ({ id: d.id, displayName: d.data()?.displayName || "" }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((r) => r.id);
}

function seatPlayerIds(sessionData, scoreDocs) {
  const scoreById = Object.fromEntries(
    scoreDocs.map((d) => [d.id, d.data()?.displayName || ""]),
  );
  const fromSession = (sessionData?.players || [])
    .map((p) => p?.playerId)
    .filter((id) => id && id in scoreById);
  const seen = new Set(fromSession);
  const extras = Object.keys(scoreById)
    .filter((id) => !seen.has(id))
    .sort((a, b) => scoreById[a].localeCompare(scoreById[b]));
  return [...fromSession, ...extras];
}

function actionOrderFromHand(currentHand, sortedPlayerIds) {
  return resolveActionOrder(currentHand ?? {}, sortedPlayerIds);
}

function sortedPlayerIdsFromSession(sessionData) {
  const fromEnrollment = sessionData?.liveEnrollment?.deal?.sortedPlayerIds;
  if (fromEnrollment?.length) return fromEnrollment;
  return getSessionCurrentHand(sessionData)?.seatedIds ?? null;
}

function writePrivateHands(tx, db, roomId, sessionId, privateHandsByPlayer) {
  if (!privateHandsByPlayer) return;
  for (const [playerId, hand] of Object.entries(privateHandsByPlayer)) {
    tx.set(privateHandRef(db, roomId, sessionId, playerId), {
      cards: hand.cards,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

/** Firestore transactions require every read before any write on touched docs. */
async function primePatchScoreReads(tx, db, roomId, sessionId, patch) {
  if (!patch?.scorePatches) return;
  for (const playerId of Object.keys(patch.scorePatches)) {
    await tx.get(scoresCol(db, roomId, sessionId).doc(playerId));
  }
}

async function primeDealPatchReads(tx, db, roomId, sessionId, patch) {
  await primePatchScoreReads(tx, db, roomId, sessionId, patch);
  if (!patch?.privateHandsByPlayer) return;
  for (const playerId of Object.keys(patch.privateHandsByPlayer)) {
    await tx.get(privateHandRef(db, roomId, sessionId, playerId));
  }
}

/** Keep liveEnrollment in sync with enrollment steps (client reads liveEnrollment first). */
function applyEnrollmentPatchInTransaction(tx, ref, db, roomId, sessionId, patch) {
  if (patch.scorePatches) {
    for (const [playerId, scorePatch] of Object.entries(patch.scorePatches)) {
      tx.update(scoresCol(db, roomId, sessionId).doc(playerId), {
        ...scorePatch,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
  if (patch.privateHandsByPlayer) {
    const sessionUpdate = {
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: patch.currentHand,
          privateHandsByPlayer: patch.privateHandsByPlayer,
        },
      },
      handEnrollment: FieldValue.delete(),
      currentHand: patch.currentHand,
      updatedAt: FieldValue.serverTimestamp(),
    };
    sessionUpdate.nextDealFunding = FieldValue.delete();
    tx.update(ref, sessionUpdate);
    return;
  }
  tx.update(ref, {
    liveEnrollment: patch.handEnrollment,
    handEnrollment: patch.handEnrollment,
    ...(patch.currentHand ? { currentHand: patch.currentHand } : {}),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function deletePrivateHandsForSession(db, roomId, sessionId, batch) {
  const snap = await sessionRef(db, roomId, sessionId).collection("privateHands").get();
  snap.docs.forEach((d) => batch.delete(d.ref));
}

function totalTricksPlayed(tricksByPlayer, participantIds) {
  return (participantIds || []).reduce(
    (sum, pid) => sum + (tricksByPlayer?.[pid] || 0),
    0,
  );
}

function tricksForPlayer(tricksByPlayer, playerId) {
  return tricksByPlayer?.[playerId] ?? 0;
}

export function deriveWinnersFromTricks(tricksByPlayer, participantIds) {
  const participants = [...new Set((participantIds || []).filter(Boolean))];
  if (participants.length < 2) {
    return { ready: false, winnerIds: [], maxTricks: 0 };
  }
  let maxTricks = 0;
  for (const pid of participants) {
    maxTricks = Math.max(maxTricks, tricksByPlayer?.[pid] || 0);
  }
  if (maxTricks === 0) {
    return { ready: false, winnerIds: [], maxTricks };
  }
  const winnerIds = participants.filter((pid) => (tricksByPlayer?.[pid] || 0) === maxTricks);
  return { ready: true, winnerIds, maxTricks };
}

function sameCoWinProposal(a, b) {
  if (!a || !b) return false;
  const ap = [...(a.participantIds || [])].sort().join(",");
  const bp = [...(b.participantIds || [])].sort().join(",");
  const aw = [...(a.winnerIds || [])].sort().join(",");
  const bw = [...(b.winnerIds || [])].sort().join(",");
  return ap === bp && aw === bw;
}

function stakeForPlayer(scoreById, playerId, sessionStake) {
  const row = scoreById[playerId];
  const n = row?.perHandStake ?? sessionStake;
  return Math.max(1, Number(n) || sessionStake);
}

function playerHandStake(scoreById, playerId, sessionStake) {
  return handAnteContribution(scoreById[playerId], sessionStake);
}

function nextDealerId(scoreDocs, currentDealerId, sessionData) {
  const ids = seatPlayerIds(sessionData, scoreDocs);
  return rotateDealerSeat(ids, currentDealerId);
}

function rotateDealerSeat(sortedIds, currentDealerId) {
  if (!sortedIds?.length) return null;
  const idx = sortedIds.indexOf(currentDealerId);
  const base = idx >= 0 ? idx : 0;
  return sortedIds[(base + 1) % sortedIds.length];
}

async function recomputeSessionTotals(db, roomId, sessionId) {
  const snap = await scoresCol(db, roomId, sessionId).get();
  const byPlayer = {};
  const netByPlayer = {};
  let tricks = 0;
  snap.docs.forEach((d) => {
    const s = d.data();
    byPlayer[s.playerId] = s.tricksWon || 0;
    netByPlayer[s.playerId] = s.net || 0;
    tricks += s.tricksWon || 0;
  });
  await sessionRef(db, roomId, sessionId).update({
    totals: { byPlayer, netByPlayer, tricks },
    rounds: tricks,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function getRoomSnap(db, roomId) {
  return db.collection("rooms").doc(roomId).get();
}

async function getDealingRule(db, roomId) {
  const roomSnap = await getRoomSnap(db, roomId);
  return roomSnap.data()?.houseRules?.dealing ?? null;
}

const BOT_ADVANCE_MAX_STEPS = 64;

async function executeBotDraw(db, roomId, sessionId, playerId, actorId, dealingRule) {
  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  const sessionData = sessionSnap.data() || {};
  const ch = getSessionCurrentHand(sessionData) || {};
  const embedded = embeddedPrivateHandData(sessionData, playerId);
  let privateHand;
  if (embedded?.cards) {
    privateHand = deserializeCards(embedded.cards);
  } else {
    const privateSnap = await privateHandRef(db, roomId, sessionId, playerId).get();
    if (!privateSnap.exists) {
      throw new HttpsError("failed-precondition", `Bot private hand missing (${playerId})`);
    }
    privateHand = deserializeCards(privateSnap.data().cards || []);
  }
  const effective = effectivePlayerHand(playerId, privateHand, ch);
  const maxDraw =
    ch.maxDrawDiscards ?? maxDrawDiscards(ch.participantIds?.length ?? 2, dealingRule);
  const deckSeed = ch.deckSeed;
  const deck = deckSeed != null ? shuffledDeckFromSeed(deckSeed) : undefined;
  const pile = pileFromPublicHand(ch, deck);
  const deckRemaining = totalAvailableReplacements(pile);
  const discardIndices = botDrawDiscardIndices(effective, ch.trumpSuit, maxDraw, deckRemaining);
  return runSubmitDrawTransaction(db, { roomId, sessionId, playerId, discardIndices });
}

async function executeBotPlay(db, roomId, sessionId, playerId, actorId) {
  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  const ch = sessionSnap.data()?.currentHand || {};
  const privateSnap = await privateHandRef(db, roomId, sessionId, playerId).get();
  if (!privateSnap.exists) {
    throw new HttpsError("failed-precondition", `Bot private hand missing (${playerId})`);
  }
  const privateHand = deserializeCards(privateSnap.data().cards || []);
  const hand = effectivePlayerHand(playerId, privateHand, ch);
  const ctx = buildPlayValidationState({ hand, publicHand: ch });
  const cardIndex = botPlayCardIndex(hand, ctx);
  const { handComplete } = await runPlayCardTransaction(db, {
    roomId,
    sessionId,
    playerId,
    cardIndex,
  });
  if (handComplete) {
    return finalizeHandFromCardPlay(db, roomId, sessionId, actorId);
  }
  return { status: "ok" };
}

/** Chain bot enrollment, draw, play, and co-win votes until a human must act. */
export async function advanceBotsAfterAction(db, roomId, sessionId, actorId) {
  const dealingRule = await getDealingRule(db, roomId);
  const steps = [];
  for (let step = 0; step < BOT_ADVANCE_MAX_STEPS; step += 1) {
    const snap = await sessionRef(db, roomId, sessionId).get();
    const sessionData = snap.data();
    if (!sessionData || sessionData.status === "final") {
      return { status: "noop", steps, reason: "session_final_or_missing" };
    }

    const snapshot = buildHandFlowSnapshot({ session: sessionData });
    const hint = resolveBotAdvanceHint({
      snapshot,
      session: sessionData,
      nowMs: Date.now(),
    });
    if (!hint) {
      if (step === 0) {
        console.info(
          "[bot-advance]",
          "skip",
          JSON.stringify({
            requester: actorId,
            owner: "server",
            roomId,
            sessionId,
            phase: snapshot.phase,
            reason: "no_bot_hint",
          }),
        );
      }
      return { status: "ok", steps };
    }

    console.info(
      "[bot-advance]",
      "execute",
      JSON.stringify({
        requester: actorId,
        owner: "server",
        roomId,
        sessionId,
        step,
        phase: snapshot.phase,
        kind: hint.kind,
        turnPlayerId: hint.turnPlayerId,
      }),
    );
    steps.push({ kind: hint.kind, turnPlayerId: hint.turnPlayerId, phase: snapshot.phase });

    switch (hint.kind) {
      case "cowin": {
        const pending = sessionData.pendingCoWinSettlement;
        await handleVoteCoWinSettlement(db, {
          roomId,
          sessionId,
          participantIds: pending.participantIds || sessionData.currentHand?.participantIds || [],
          winnerIds: pending.winnerIds,
          voterId: hint.turnPlayerId,
          choice: "push",
          recordedBy: actorId,
          actorId,
        });
        break;
      }
      case "enrollment_timeout":
        await handleTimeoutEnrollment(db, { roomId, sessionId, actorId });
        break;
      case "enrollment":
        await handleSetHandParticipation(db, {
          roomId,
          sessionId,
          playerId: hint.turnPlayerId,
          inHand: true,
          actorId,
        });
        break;
      case "decision_timeout":
        await handleTimeoutEnrollment(db, { roomId, sessionId, actorId });
        break;
      case "decision":
        await handleSetHandParticipation(db, {
          roomId,
          sessionId,
          playerId: hint.turnPlayerId,
          inHand: true,
          actorId,
          discardCount: 0,
        });
        break;
      case "draw":
        await executeBotDraw(db, roomId, sessionId, hint.turnPlayerId, actorId, dealingRule);
        break;
      case "play":
        await executeBotPlay(db, roomId, sessionId, hint.turnPlayerId, actorId);
        break;
      default:
        return { status: "ok", steps, reason: "unknown_hint" };
    }
  }
  checkInvariant(
    false,
    "bot_advance_step_cap",
    `Bot advance hit ${BOT_ADVANCE_MAX_STEPS} steps without human pause`,
    { roomId, sessionId, actorId },
  );
  return { status: "ok", steps, capped: true };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleEnsureHandEnrollment(db, { roomId, sessionId, actorId }) {
  await assertRoomMember(db, roomId, actorId);
  const ref = sessionRef(db, roomId, sessionId);
  let sessionSnap = await ref.get();
  if (!sessionSnap.exists) throw new HttpsError("not-found", "Session not found");
  let data = sessionSnap.data();
  if (data.status === "final") return { status: "noop" };

  if (shouldClearStaleLiveEnrollment(data)) {
    await ref.update({
      liveEnrollment: FieldValue.delete(),
      handEnrollment: FieldValue.delete(),
      currentHand: emptyPreDealHand(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    sessionSnap = await ref.get();
    data = sessionSnap.data();
  }

  const existing = getSessionEnrollment(data);
  if (sessionHandDealStarted(data)) {
    return { status: "noop" };
  }

  if (existing?.active) {
    await ref.update({
      handEnrollment: FieldValue.delete(),
      liveEnrollment: FieldValue.delete(),
      currentHand: emptyPreDealHand(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    sessionSnap = await ref.get();
    data = sessionSnap.data();
  }

  if (sessionHandDealStarted(data)) {
    return { status: "noop" };
  }

  let hand = rawCurrentHand(data);
  let phase = hand.phase ?? null;
  const participantIds = hand.participantIds || [];
  const tricks = hand.tricksByPlayer || {};
  const hasTrickProgress = Object.values(tricks).some((n) => (n || 0) > 0);
  if (participantIds.length > 0 || hasTrickProgress) {
    const staleRoster = participantIds.length > 0 && !phase && !hasTrickProgress;
    if (isClearedPreDealHand(data.currentHand) || staleRoster) {
      await ref.update({
        liveEnrollment: FieldValue.delete(),
        handEnrollment: FieldValue.delete(),
        currentHand: emptyPreDealHand(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      sessionSnap = await ref.get();
      data = sessionSnap.data();
      hand = rawCurrentHand(data);
      phase = hand.phase ?? null;
    } else if (!handPhaseStarted(hand)) {
      await ref.update({
        liveEnrollment: FieldValue.delete(),
        handEnrollment: FieldValue.delete(),
        currentHand: emptyPreDealHand(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      sessionSnap = await ref.get();
      data = sessionSnap.data();
      hand = rawCurrentHand(data);
      phase = hand.phase ?? null;
    } else {
      return { status: "noop" };
    }
  }
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const sortedIds = seatPlayerIds(data, scoreSnap.docs);
  if (sortedIds.length < 2) return { status: "noop" };

  const roomSnap = await getRoomSnap(db, roomId);
  const dealingRule = roomSnap.data()?.houseRules?.dealing ?? null;
  const buyIn = resolveSessionBuyIn(data, roomSnap.data()?.bourreSettings ?? {});
  const sessionStake = data.handStake ?? 1;
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));

  const eligibleIds = sortedIds.filter((id) => {
    const row = scoreById[id];
    if (row?.out === true) return false;
    return canEnrollWithBankroll(scoreBankroll(row, buyIn));
  });
  if (eligibleIds.length < 1) return { status: "noop" };

  const dealExtras = { sessionStake, buyIn, dealingRule, eligibleIds, sortedIds };

  let dealResult = { status: "noop" };
  await db.runTransaction(async (tx) => {
    const sessionSnap = await tx.get(ref);
    if (!sessionSnap.exists) return;
    const freshData = sessionSnap.data();
    const scoreSnap = await tx.get(scoresCol(db, roomId, sessionId));
    const freshScoreById = mergeNextDealFundingIntoScoreById(
      Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()])),
      freshData.nextDealFunding,
    );
    const autoPatch = buildDealCompletionPatch(
      freshData.dealerId,
      dealExtras.eligibleIds,
      dealExtras.sortedIds,
      Date.now(),
      dealExtras.dealingRule,
      {
        sessionStake: dealExtras.sessionStake,
        buyIn: dealExtras.buyIn,
        scoreById: freshScoreById,
        carryIn: freshData.carryOverPot || 0,
        handCount: freshData.handCount || 0,
      },
    );
    if (!autoPatch) return;
    if (autoPatch?.soloWin) {
      await primePatchScoreReads(tx, db, roomId, sessionId, autoPatch);
      applySoloWinInTransaction(tx, ref, db, roomId, sessionId, autoPatch);
      dealResult = { status: "solo_win" };
      return;
    }
    if (autoPatch?.privateHandsByPlayer) {
      await primeDealPatchReads(tx, db, roomId, sessionId, autoPatch);
      writePrivateHands(tx, db, roomId, sessionId, autoPatch.privateHandsByPlayer);
      applyEnrollmentPatchInTransaction(tx, ref, db, roomId, sessionId, autoPatch);
      dealResult = { status: "auto_dealt" };
      return;
    }
    if (autoPatch?.scorePatches && Object.keys(autoPatch.scorePatches).length > 0) {
      await primePatchScoreReads(tx, db, roomId, sessionId, autoPatch);
      for (const [playerId, scorePatch] of Object.entries(autoPatch.scorePatches)) {
        tx.update(scoresCol(db, roomId, sessionId).doc(playerId), {
          ...scorePatch,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  });
  if (dealResult.status === "solo_win" || dealResult.status === "auto_dealt") {
    await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  }
  return dealResult;
}

export async function handleTimeoutEnrollment(db, { roomId, sessionId, actorId }) {
  await assertRoomMember(db, roomId, actorId);
  const dealingRule = await getDealingRule(db, roomId);
  const ref = sessionRef(db, roomId, sessionId);
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const sessionSnap = await ref.get();
  const sessionData = sessionSnap.data() || {};
  const sortedPlayerIds = seatPlayerIds(sessionData, scoreSnap.docs);
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  const roomSnap = await getRoomSnap(db, roomId);
  const buyIn = resolveSessionBuyIn(sessionData, roomSnap.data()?.bourreSettings ?? {});
  const sessionStake = sessionData.handStake ?? 1;
  const dealContext = {
    dealerId: sessionData.dealerId,
    sortedPlayerIds,
    dealingRule,
    scoreById,
    buyIn,
    sessionStake,
  };

  const pagatHand = getSessionCurrentHand(sessionData);
  const pagatDecision = getSessionHandDecision(sessionData);
  if (pagatHand?.phase === HAND_PHASE.DECISION && pagatDecision?.active) {
    if (Date.now() < enrollmentDeadlineMs(pagatDecision)) return { status: "noop" };
    const pagatResult = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { status: "noop" };
      const data = snap.data();
      const hand = getSessionCurrentHand(data);
      const decision = getSessionHandDecision(data);
      if (hand?.phase !== HAND_PHASE.DECISION || !decision?.active) return { status: "noop" };
      if (Date.now() < enrollmentDeadlineMs(decision)) return { status: "noop" };
      const step = applyDecisionTimeout(hand, decision, dealContext);
      if (step.kind === "soloWin") {
        const patch = buildSoloWinPatch(step.winnerId, data, dealContext);
        if (!patch) return { status: "noop" };
        await primePatchScoreReads(tx, db, roomId, sessionId, patch);
        applySoloWinInTransaction(tx, ref, db, roomId, sessionId, patch);
        return { status: "solo_win", winnerId: step.winnerId };
      }
      const patch = decisionStepPatch(step);
      if (!patch?.currentHand) return { status: "noop" };
      tx.update(ref, publicHandSessionUpdate(data, patch.currentHand));
      return { status: step.kind === "draw" ? "draw" : "advanced" };
    });
    await advanceBotsAfterAction(db, roomId, sessionId, actorId);
    return pagatResult;
  }

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { status: "noop" };
    const data = snap.data();
    const enrollment = getSessionEnrollment(data);
    if (!enrollment?.active || Date.now() < enrollmentDeadlineMs(enrollment)) return { status: "noop" };

    const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
    const enrolledIds = [...(enrollment.enrolledIds || [])];
    const declinedIds = [...(enrollment.declinedIds || []), currentId];
    const scoreSnap = await tx.get(scoresCol(db, roomId, sessionId));
    const freshScoreById = mergeNextDealFundingIntoScoreById(
      Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()])),
      data.nextDealFunding,
    );
    const patch = enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
      dealerId: data.dealerId,
      sortedPlayerIds,
      seed: Date.now(),
      dealingRule,
      scoreById: freshScoreById,
      buyIn,
      sessionStake,
      carryIn: data.carryOverPot || 0,
      handCount: data.handCount || 0,
    });
    await primeDealPatchReads(tx, db, roomId, sessionId, patch);
    writePrivateHands(tx, db, roomId, sessionId, patch.privateHandsByPlayer);
    applyEnrollmentPatchInTransaction(tx, ref, db, roomId, sessionId, patch);
    return { status: patch.privateHandsByPlayer ? "dealt" : "advanced" };
  });
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return result;
}

function decisionStepPatch(step) {
  if (step.kind === "continue" || step.kind === "draw" || step.kind === "restart" || step.kind === "soloWin") {
    return { currentHand: step.publicHand };
  }
  return null;
}

export async function handleAdvanceHandReveal(db, { roomId, sessionId, actorId }) {
  await assertRoomMember(db, roomId, actorId);
  const dealingRule = await getDealingRule(db, roomId);
  const ref = sessionRef(db, roomId, sessionId);
  let alreadyPastReveal = false;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const hand = getSessionCurrentHand(snap.data());
    if (hand?.phase !== HAND_PHASE.REVEAL) {
      if (
        hand?.phase === HAND_PHASE.DECISION ||
        hand?.phase === HAND_PHASE.DRAW ||
        hand?.phase === HAND_PHASE.PLAY
      ) {
        alreadyPastReveal = true;
        return;
      }
      throw new HttpsError("failed-precondition", "Not in reveal phase");
    }
    const nextHand = revealToDraw(hand, dealingRule);
    tx.update(ref, publicHandSessionUpdate(snap.data(), nextHand));
  });
  if (alreadyPastReveal) {
    return { status: "ok", phase: "past_reveal" };
  }
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return { status: "draw" };
}

export async function handleSetHandParticipation(
  db,
  { roomId, sessionId, playerId, inHand, actorId, discardCount = 0 },
) {
  if (!playerId || !actorId) throw new HttpsError("invalid-argument", "Missing player");
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only change your own hand participation");
  }
  await assertRoomMember(db, roomId, actorId);

  const ref = sessionRef(db, roomId, sessionId);
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  let sessionData = (await ref.get()).data() || {};
  const sortedPlayerIds = seatPlayerIds(sessionData, scoreSnap.docs);
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  const dealingRule = await getDealingRule(db, roomId);
  const roomSnap = await getRoomSnap(db, roomId);
  const buyIn = resolveSessionBuyIn(sessionData, roomSnap.data()?.bourreSettings ?? {});
  const sessionStake = sessionData.handStake ?? 1;

  const pagatHandBefore = getSessionCurrentHand(sessionData);
  if (pagatHandBefore?.phase === HAND_PHASE.REVEAL && pagatHandBefore?.handDecision) {
    await handleAdvanceHandReveal(db, { roomId, sessionId, actorId });
    sessionData = (await ref.get()).data() || {};
  }

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const data = snap.data();
    if (data.status === "final") throw new HttpsError("failed-precondition", "Session is final");

    const pagatHand = getSessionCurrentHand(data);
    const pagatDecision = getSessionHandDecision(data);
    if (pagatHand?.phase === HAND_PHASE.DECISION && pagatDecision) {
      const turnId = currentDecisionPlayer(pagatDecision);
      if (playerId !== turnId) {
        throw new HttpsError(
          "failed-precondition",
          inHand ? "Not your turn to play yet" : "Not your turn to pass yet",
        );
      }
      const dealContext = {
        dealerId: data.dealerId,
        sortedPlayerIds,
        dealingRule,
      };
      const step = inHand
        ? applyDecisionPlay(pagatHand, pagatDecision, playerId, discardCount, dealContext)
        : applyDecisionPass(pagatHand, pagatDecision, playerId, dealContext);
      if (step.kind === "soloWin") {
        const patch = buildSoloWinPatch(step.winnerId, data, {
          dealerId: data.dealerId,
          sortedPlayerIds,
          dealingRule,
          scoreById,
          sessionStake,
          buyIn,
        });
        if (!patch) throw new HttpsError("failed-precondition", "Could not settle solo win");
        await primePatchScoreReads(tx, db, roomId, sessionId, patch);
        applySoloWinInTransaction(tx, ref, db, roomId, sessionId, patch);
        return { status: "solo_win", winnerId: step.winnerId };
      }
      const patch = decisionStepPatch(step);
      if (!patch?.currentHand) {
        throw new HttpsError("failed-precondition", "Decision step did not apply");
      }
      tx.update(ref, publicHandSessionUpdate(data, patch.currentHand));
      return { status: step.kind === "draw" ? "draw" : "advanced" };
    }

    const enrollment = getSessionEnrollment(data);
    if (enrollment?.active) {
      const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
      if (!inHand) {
        if (playerId !== currentId) {
          throw new HttpsError("failed-precondition", "Not your turn to pass yet");
        }
        if ((enrollment.declinedIds || []).includes(playerId)) return { status: "noop" };
        const enrolledIds = [...(enrollment.enrolledIds || [])];
        const declinedIds = [...(enrollment.declinedIds || []), playerId];
        const scoreSnapTx = await tx.get(scoresCol(db, roomId, sessionId));
        const freshScoreById = mergeNextDealFundingIntoScoreById(
          Object.fromEntries(scoreSnapTx.docs.map((d) => [d.id, d.data()])),
          data.nextDealFunding,
        );
        const patch = enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
          dealerId: data.dealerId,
          sortedPlayerIds,
          seed: Date.now(),
          dealingRule,
          scoreById: freshScoreById,
          buyIn,
          sessionStake,
          carryIn: data.carryOverPot || 0,
          handCount: data.handCount || 0,
        });
        await primeDealPatchReads(tx, db, roomId, sessionId, patch);
        writePrivateHands(tx, db, roomId, sessionId, patch.privateHandsByPlayer);
        applyEnrollmentPatchInTransaction(tx, ref, db, roomId, sessionId, patch);
        return { status: patch.privateHandsByPlayer ? "dealt" : "advanced" };
      }
      if (playerId !== currentId) {
        throw new HttpsError("failed-precondition", "Not your turn to join yet");
      }
      if ((enrollment.enrolledIds || []).includes(playerId)) return { status: "noop" };
      const enrolledIds = [...(enrollment.enrolledIds || []), playerId];
      const declinedIds = [...(enrollment.declinedIds || [])];
      const scoreSnapTx = await tx.get(scoresCol(db, roomId, sessionId));
      const freshScoreById = mergeNextDealFundingIntoScoreById(
        Object.fromEntries(scoreSnapTx.docs.map((d) => [d.id, d.data()])),
        data.nextDealFunding,
      );
      const patch = enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
        dealerId: data.dealerId,
        sortedPlayerIds,
        seed: Date.now(),
        dealingRule,
        scoreById: freshScoreById,
        buyIn,
        sessionStake,
        carryIn: data.carryOverPot || 0,
        handCount: data.handCount || 0,
      });
      await primeDealPatchReads(tx, db, roomId, sessionId, patch);
      writePrivateHands(tx, db, roomId, sessionId, patch.privateHandsByPlayer);
      applyEnrollmentPatchInTransaction(tx, ref, db, roomId, sessionId, patch);
      return { status: patch.privateHandsByPlayer ? "dealt" : "advanced", joined: true };
    }

    const currentHand = getSessionCurrentHand(data);
    const livePhase = currentHand?.phase ?? null;
    if (
      livePhase === HAND_PHASE.REVEAL ||
      livePhase === HAND_PHASE.DECISION ||
      livePhase === HAND_PHASE.DRAW ||
      livePhase === HAND_PHASE.PLAY
    ) {
      throw new HttpsError(
        "failed-precondition",
        "This hand is already in progress — use Play, Pass, or Stay pat.",
      );
    }
    const tricksByPlayer = { ...(currentHand.tricksByPlayer || {}) };
    let participantIds = [...(currentHand.participantIds || [])];
    if (inHand) {
      if (!participantIds.includes(playerId)) participantIds.push(playerId);
    } else {
      participantIds = participantIds.filter((id) => id !== playerId);
      delete tricksByPlayer[playerId];
    }
    tx.update(ref, {
      currentHand: { ...currentHand, tricksByPlayer, participantIds },
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { status: "updated" };
  });

  if (result.joined) {
    await ref.update({
      tableOptInIds: FieldValue.arrayUnion(playerId),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return result;
}

async function runSubmitDrawTransaction(db, { roomId, sessionId, playerId, discardIndices }) {
  const ref = sessionRef(db, roomId, sessionId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

    assertCanSubmitHandAction(sessionData, "submit_draw", playerId, playerId);

    const currentHand = getSessionCurrentHand(sessionData);

    const handData = await readPrivateHandInTransaction(
      tx,
      db,
      roomId,
      sessionId,
      sessionData,
      playerId,
    );
    if (!handData) throw new HttpsError("not-found", "Private hand not found");

    const hand = deserializeCards(handData.cards || []);
    const deckSeed = currentHand.deckSeed;
    if (deckSeed == null) throw new HttpsError("failed-precondition", "Missing deck seed on session");

    const deck = shuffledDeckFromSeed(deckSeed);
    const maxDraw =
      currentHand.maxDrawDiscards ?? maxDrawDiscards(currentHand.participantIds?.length ?? 2);

    const drawResult = applyPlayerDraw({
      playerId,
      privateHand: hand,
      publicHand: currentHand,
      discardIndices: discardIndices || [],
      deck,
      maxDiscards: maxDraw,
    });

    const nextPublic = advanceAfterDraw(
      drawResult.publicHand,
      actionOrderFromHand(currentHand, sortedPlayerIdsFromSession(sessionData)),
      playerId,
    );

    writePrivateHandInTransaction(
      tx,
      db,
      ref,
      sessionData,
      roomId,
      sessionId,
      playerId,
      serializeCards(drawResult.privateHand),
    );
    tx.update(ref, publicHandSessionUpdate(sessionData, nextPublic));
    return { status: "ok", phase: nextPublic.phase };
  });
}

export async function handleSubmitDraw(
  db,
  { roomId, sessionId, playerId, discardIndices, actorId },
) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only draw for yourself (or drive a robot)");
  }
  await assertRoomMember(db, roomId, actorId);
  let result;
  try {
    result = await runSubmitDrawTransaction(db, {
      roomId,
      sessionId,
      playerId,
      discardIndices,
    });
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("failed-precondition", err?.message || "Draw failed");
  }
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return result;
}

export async function handleFoldDraw(db, { roomId, sessionId, playerId, actorId }) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only fold for yourself (or drive a robot)");
  }
  await assertRoomMember(db, roomId, actorId);
  const ref = sessionRef(db, roomId, sessionId);
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const dealingRule = await getDealingRule(db, roomId);
  const roomSnap = await getRoomSnap(db, roomId);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

    assertCanSubmitHandAction(sessionData, "draw_fold", playerId, playerId);

    const currentHand = getSessionCurrentHand(sessionData);

    const foldResult = applyDrawFold(
      currentHand,
      actionOrderFromHand(currentHand, sortedPlayerIdsFromSession(sessionData)),
      playerId,
    );

    if (foldResult.kind === "soloWin") {
      const sortedPlayerIds = seatPlayerIds(sessionData, scoreSnap.docs);
      const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
      const buyIn = resolveSessionBuyIn(sessionData, roomSnap.data()?.bourreSettings ?? {});
      const sessionStake = sessionData.handStake ?? 1;
      const patch = buildSoloWinPatch(foldResult.winnerId, sessionData, {
        dealerId: sessionData.dealerId,
        sortedPlayerIds,
        dealingRule,
        scoreById,
        sessionStake,
        buyIn,
      });
      if (!patch) throw new HttpsError("failed-precondition", "Could not settle solo win");
      await primePatchScoreReads(tx, db, roomId, sessionId, patch);
      writePrivateHandInTransaction(
        tx,
        db,
        ref,
        sessionData,
        roomId,
        sessionId,
        playerId,
        [],
      );
      applySoloWinInTransaction(tx, ref, db, roomId, sessionId, patch);
      return { status: "solo_win", winnerId: foldResult.winnerId };
    }

    writePrivateHandInTransaction(
      tx,
      db,
      ref,
      sessionData,
      roomId,
      sessionId,
      playerId,
      [],
    );

    tx.update(ref, publicHandSessionUpdate(sessionData, foldResult.publicHand));
    return { status: "folded", phase: foldResult.publicHand.phase };
  });

  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return result;
}

async function runPlayCardTransaction(db, { roomId, sessionId, playerId, cardIndex }) {
  const ref = sessionRef(db, roomId, sessionId);
  let handComplete = false;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

    assertCanSubmitHandAction(sessionData, "play_card", playerId, playerId);

    const currentHand = getSessionCurrentHand(sessionData);

    const handData = await readPrivateHandInTransaction(
      tx,
      db,
      roomId,
      sessionId,
      sessionData,
      playerId,
    );
    if (!handData) throw new HttpsError("not-found", "Private hand not found");

    const hand = deserializeCards(handData.cards || []);
    const result = applyPlayerPlayCard({
      publicHand: currentHand,
      privateHand: hand,
      playerId,
      cardIndex,
      actionOrder: actionOrderFromHand(currentHand, sortedPlayerIdsFromSession(sessionData)),
      cinchEnabled: currentHand.cinchEnabled === true,
    });

    handComplete = result.handComplete;

    writePrivateHandInTransaction(
      tx,
      db,
      ref,
      sessionData,
      roomId,
      sessionId,
      playerId,
      serializeCards(result.privateHand),
    );
    tx.update(ref, publicHandSessionUpdate(sessionData, result.publicHand));
  });

  return { handComplete };
}

async function finalizeHandFromCardPlay(db, roomId, sessionId, recordedBy) {
  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  if (!sessionSnap.exists) return { status: "noop" };
  const sessionData = sessionSnap.data();
  const rawHand = sessionData.currentHand ?? emptyPreDealHand();
  if (isClearedPreDealHand(rawHand)) return { status: "already_cleared" };

  const currentHand =
    (rawHand.participantIds?.length ?? 0) > 0 ? rawHand : getSessionCurrentHand(sessionData);
  const participantIds = currentHand.participantIds || [];
  const tricksByPlayer = currentHand.tricksByPlayer || {};
  const { ready, winnerIds } = deriveWinnersFromTricks(tricksByPlayer, participantIds);

  if (!ready) {
    assertSettlementEntryAllowed(sessionData, { settlement: "push" });
    await handleRecordHand(db, {
      roomId,
      sessionId,
      winnerIds: [],
      participantIds,
      settlement: "push",
      recordedBy,
      tricksByPlayer,
    });
    return { status: "settled", settlement: "push" };
  }

  if (winnerIds.length === 1) {
    assertSettlementEntryAllowed(sessionData, { settlement: "win" });
    await handleRecordHand(db, {
      roomId,
      sessionId,
      winnerIds,
      participantIds,
      settlement: "win",
      recordedBy,
      tricksByPlayer,
    });
    return { status: "settled", settlement: "win" };
  }

  const roomSnap = await getRoomSnap(db, roomId);
  const allowSplitVote = splitPotVoteAllowed(roomSnap.data()?.bourreSettings);
  if (allowSplitVote) {
    const pending = sessionData.pendingCoWinSettlement;
    const proposal = { participantIds, winnerIds };
    const nextPending = sameCoWinProposal(pending, proposal)
      ? pending
      : { ...proposal, votes: {}, updatedAt: FieldValue.serverTimestamp() };

    await sessionRef(db, roomId, sessionId).update({
      pendingCoWinSettlement: nextPending,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { status: "cowin_pending", winnerIds };
  }

  await handleRecordHand(db, {
    roomId,
    sessionId,
    winnerIds,
    participantIds,
    settlement: "co_win_carry",
    recordedBy,
    tricksByPlayer,
  });
  return { status: "settled", settlement: "co_win_carry" };
}

export async function handlePlayCard(db, { roomId, sessionId, playerId, cardIndex, actorId }) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only play for yourself (or drive a robot)");
  }
  await assertRoomMember(db, roomId, actorId);

  const { handComplete } = await runPlayCardTransaction(db, {
    roomId,
    sessionId,
    playerId,
    cardIndex,
  });
  const result = handComplete
    ? await finalizeHandFromCardPlay(db, roomId, sessionId, actorId)
    : { status: "ok" };
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return result;
}

export async function handleRecordHand(
  db,
  {
    roomId,
    sessionId,
    winnerId,
    winnerIds,
    participantIds,
    settlement,
    recordedBy,
    actorId,
    tricksByPlayer,
  },
) {
  const recorder = recordedBy || actorId;
  await assertRoomMember(db, roomId, recorder);

  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  if (!sessionSnap.exists) throw new HttpsError("not-found", "Session not found");
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

  const winners = [
    ...new Set((winnerIds?.length ? winnerIds : winnerId ? [winnerId] : []).filter(Boolean)),
  ];
  const participants = [...new Set((participantIds || []).filter(Boolean))];
  if (participants.length < 2) {
    throw new HttpsError("invalid-argument", "At least two players must be in the hand");
  }

  let mode = settlement || (winners.length === 1 ? "win" : null);
  if (winners.length >= 2 && !mode) {
    throw new HttpsError("invalid-argument", "Co-winners must choose push or split");
  }
  if (winners.length === 1 && mode !== "win") mode = "win";
  if (winners.length >= 2 && mode === "win") {
    throw new HttpsError("invalid-argument", "Use push or split when there are co-winners");
  }
  const potCarryMode =
    mode === "push" || mode === "non_winner_ante_up" || mode === "co_win_carry";
  if (!potCarryMode && winners.length === 0) {
    throw new HttpsError("invalid-argument", "Select at least one winner");
  }
  for (const wid of winners) {
    if (!participants.includes(wid)) {
      throw new HttpsError("invalid-argument", "Every winner must be in the hand");
    }
  }

  assertSettlementEntryAllowed(sessionData, { settlement: mode });

  const stake = sessionData.handStake ?? 1;
  const limEnabled = sessionData.limEnabled === true;
  const carryIn = sessionData.carryOverPot || 0;
  const handNumber = (sessionData.handCount || 0) + 1;

  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  for (const pid of participants) {
    if (!scoreById[pid]) throw new HttpsError("invalid-argument", "Unknown player in hand");
  }

  const postedAntes = getSessionCurrentHand(sessionData)?.postedAntes ?? {};
  const antePot = participants.reduce(
    (sum, pid) => sum + (postedAntes[pid] ?? playerHandStake(scoreById, pid, stake)),
    0,
  );
  const stakeForPot = (pid) => postedAntes[pid] ?? playerHandStake(scoreById, pid, stake);
  const stakeForSettlement = (pid) =>
    anteAlreadyPosted(postedAntes, pid) ? 0 : playerHandStake(scoreById, pid, stake);

  const handSettlement = settleHandDeltas({
    mode,
    winners,
    participants,
    tricksByPlayer,
    anteAmount: stake,
    limEnabled,
    carryIn,
    antePot,
    stakeForPlayer: stakeForSettlement,
  });

  const {
    deltas: nominalDeltas,
    carryOverPot: nominalCarry,
    bourreIds,
    bourreMatch,
    potState,
    pot: grossPot,
    cappedPot,
    overflow,
  } = handSettlement;

  const roomSnap = await db.doc(`rooms/${roomId}`).get();
  const roomBourre = roomSnap.data()?.bourreSettings ?? {};
  const buyIn = resolveSessionBuyIn(sessionData, roomBourre);

  const solvent = applySolventSettlement({
    mode,
    winners,
    participants,
    nominalDeltas,
    scoreById,
    carryOverPot: nominalCarry,
    buyInFallback: buyIn,
    stakeForPlayer: stakeForSettlement,
  });

  const deltas = solvent.appliedDeltas;
  const carryOverPot = solvent.carryOverPot;
  const bourreRemainders = bourreRemaindersFromSettlement(bourreIds, nominalDeltas, deltas);

  assertRecordHandChipConservation({
    scoreById,
    carryOverPot: carryIn,
    postedAntes,
    buyIn,
    solvent,
    participants,
    deltas,
  });

  const batch = db.batch();
  batch.set(handsCol(db, roomId, sessionId).doc(), {
    handNumber,
    winnerId: winners.length === 1 ? winners[0] : null,
    winnerIds: winners,
    settlement: mode,
    participantIds: participants,
    tricksByPlayer: tricksByPlayer || null,
    bourreIds: tricksByPlayer ? bourreIds : [],
    bourreCarryOver: bourreMatch,
    stake,
    pot: grossPot,
    cappedPot,
    potCap: potState.potCap,
    overflow,
    carryIn,
    deltas,
    recordedBy: recorder || null,
    createdAt: FieldValue.serverTimestamp(),
  });

  participants.forEach((pid) => {
    const current = scoreById[pid];
    const isWinner = winners.includes(pid);
    const tricksWon =
      (current.tricksWon || 0) +
      (isWinner && mode === "split" ? 1 : mode === "win" && isWinner ? 1 : 0);
    const patch = {
      net: (current.net || 0) + deltas[pid],
      bankroll: solvent.bankrolls[pid] ?? scoreBankroll(current, buyIn),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if ((solvent.bankrolls[pid] ?? 0) <= 0) {
      patch.out = true;
    } else {
      patch.out = FieldValue.delete();
    }
    if (current.skipNextAnte) patch.skipNextAnte = FieldValue.delete();
    if (current.bourreReplacementDue != null) {
      patch.bourreReplacementDue = FieldValue.delete();
    }
    const funding = nextDealFundingFlags({
      playerId: pid,
      mode,
      winners,
      bourreIds,
      settledPot: potState.currentPot,
      bourreReplacementRemainder: bourreRemainders[pid] ?? null,
    });
    if (funding.bourreReplacementDue != null) {
      patch.bourreReplacementDue = funding.bourreReplacementDue;
    }
    if (funding.skipNextAnte) {
      patch.skipNextAnte = true;
    }
    if (isWinner && (mode === "split" || mode === "win")) {
      patch.handsWon = (current.handsWon || 0) + 1;
      patch.tricksWon = tricksWon;
      patch.total = Math.max(0, tricksWon);
    }
    if (mode === "non_winner_ante_up" || mode === "co_win_carry") {
      if (winners.includes(pid)) {
        patch.perHandStake = FieldValue.delete();
      } else {
        patch.perHandStake = nextRiskStake(stakeForPlayer(scoreById, pid, stake));
      }
    }
    batch.update(scoresCol(db, roomId, sessionId).doc(pid), patch);
  });

  for (const scoreDocSnap of scoreSnap.docs) {
    const pid = scoreDocSnap.id;
    if (scoreDocSnap.data().skipNextAnte && !participants.includes(pid)) {
      batch.update(scoresCol(db, roomId, sessionId).doc(pid), {
        skipNextAnte: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  const newDealerId = nextDealerId(scoreSnap.docs, sessionData.dealerId, sessionData);
  const seatIds = seatPlayerIds(sessionData, scoreSnap.docs);
  const nextDealFunding = buildNextDealFundingSnapshot({
    settledPot: potState.currentPot,
    bourreIds,
    participants,
    mode,
    winners,
    bourreRemaindersByPlayer: bourreRemainders,
  });
  await deletePrivateHandsForSession(db, roomId, sessionId, batch);
  batch.update(sessionRef(db, roomId, sessionId), {
    handCount: handNumber,
    handStakeLocked: true,
    carryOverPot,
    dealerId: newDealerId,
    pendingCoWinSettlement: FieldValue.delete(),
    nextDealFunding,
    handEnrollment: FieldValue.delete(),
    liveEnrollment: FieldValue.delete(),
    currentHand: emptyPreDealHand(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  try {
    await applyBotAutoRebuysAfterSettlement(db, roomId, sessionId, { buyIn });
  } catch (err) {
    console.warn("handleRecordHand: bot auto-rebuy deferred", err);
  }
  await recomputeSessionTotals(db, roomId, sessionId);
  return { status: "settled", settlement: mode, handNumber };
}

async function applyBotAutoRebuysAfterSettlement(db, roomId, sessionId, { buyIn }) {
  const sessionRefDoc = sessionRef(db, roomId, sessionId);
  const [sessionSnap, scoreSnap] = await Promise.all([
    sessionRefDoc.get(),
    scoresCol(db, roomId, sessionId).get(),
  ]);
  if (!sessionSnap.exists) return { applied: [] };
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") return { applied: [] };

  const scoreRows = scoreSnap.docs.map((d) => ({ playerId: d.id, ...d.data() }));
  if (!sessionHasRobotScores(scoreRows)) return { applied: [] };

  const plan = planBotAutoRebuys({ scoreRows, buyIn });
  if (plan.length === 0) return { applied: [] };

  const optInIds = new Set(sessionData.tableOptInIds || []);
  const batch = db.batch();
  for (const item of plan) {
    optInIds.add(item.playerId);
    batch.update(scoresCol(db, roomId, sessionId).doc(item.playerId), {
      bankroll: buyIn,
      out: FieldValue.delete(),
      displayName: item.displayName,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  batch.update(sessionRefDoc, {
    players: patchSessionPlayersWithRebuyNames(sessionData.players, plan),
    tableOptInIds: [...optInIds],
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  logBourreAccounting("bot-auto-rebuy", {
    roomId,
    sessionId,
    playerIds: plan.map((p) => p.playerId),
    names: plan.map((p) => p.displayName),
    buyIn,
  });
  return { applied: plan.map((p) => p.playerId) };
}

export async function handleAdvanceBots(db, { roomId, sessionId, actorId }) {
  console.info(
    "[bot-advance]",
    "request",
    JSON.stringify({ requester: actorId, owner: "server", roomId, sessionId }),
  );
  await assertRoomMember(db, roomId, actorId);
  const result = await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  console.info(
    "[bot-advance]",
    "complete",
    JSON.stringify({ requester: actorId, owner: "server", roomId, sessionId, result }),
  );
  return { status: "ok", ...result };
}

export async function handleVoteCoWinSettlement(
  db,
  { roomId, sessionId, participantIds, winnerIds, voterId, choice, recordedBy, actorId },
) {
  const voter = voterId || actorId;
  if (choice !== "push" && choice !== "split") {
    throw new HttpsError("invalid-argument", "Vote must be decline or agree to split");
  }
  const memberId = isRobotPlayerId(voter) ? recordedBy || actorId : voter;
  await assertRoomMember(db, roomId, memberId);

  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  if (!sessionSnap.exists) throw new HttpsError("not-found", "Session not found");
  const sessionData = sessionSnap.data();
  if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

  const winners = [...new Set((winnerIds || []).filter(Boolean))];
  const participants = [...new Set((participantIds || []).filter(Boolean))];
  if (winners.length < 2) throw new HttpsError("invalid-argument", "Co-winners only");
  if (!winners.includes(voter)) throw new HttpsError("permission-denied", "Only co-winners can vote");

  const tricksByPlayer = sessionData.currentHand?.tricksByPlayer || {};
  const recordArgs = {
    winnerIds: winners,
    participantIds: participants,
    recordedBy: recordedBy || voter,
    actorId: voter,
    tricksByPlayer,
  };

  if (choice === "push") {
    const result = await handleRecordHand(db, {
      roomId,
      sessionId,
      ...recordArgs,
      settlement: "non_winner_ante_up",
    });
    return { status: "settled", settlement: "non_winner_ante_up", votes: { [voter]: "push" }, ...result };
  }

  const pending = sessionData.pendingCoWinSettlement;
  const sameProposal =
    pending &&
    pending.winnerIds?.length === winners.length &&
    pending.winnerIds.every((w) => winners.includes(w)) &&
    pending.participantIds?.length === participants.length &&
    pending.participantIds.every((p) => participants.includes(p));

  const votes = sameProposal
    ? { ...(pending.votes || {}), [voter]: "split" }
    : { [voter]: "split" };

  const allAgreeSplit = winners.every((w) => votes[w] === "split");
  if (!allAgreeSplit) {
    await sessionRef(db, roomId, sessionId).update({
      pendingCoWinSettlement: {
        participantIds: participants,
        winnerIds: winners,
        votes,
        updatedAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { status: "pending", votes };
  }

  const result = await handleRecordHand(db, {
    roomId,
    sessionId,
    ...recordArgs,
    settlement: "split",
  });
  return { status: "settled", settlement: "split", votes, ...result };
}
