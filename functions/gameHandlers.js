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
  deserializeCards,
  serializeCards,
  shuffledDeckFromSeed,
  remainingDeckCount,
  applyPlayerDraw,
  advanceAfterDraw,
  applyPlayerPlayCard,
  maxDrawDiscards,
  HAND_PHASE,
} from "./vendor/game-engine.js";
import { settleHandDeltas } from "./vendor/bourre-rules.js";
import { nextRiskStake } from "./vendor/risk-stakes.js";

export const HAND_ENROLLMENT_MS = 12_000;
export const MAX_TRICKS_PER_HAND = 5;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

export function canActForPlayer(playerId, actorId) {
  if (!playerId || !actorId) return false;
  if (playerId === actorId) return true;
  return isRobotPlayerId(playerId);
}

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

function enrollmentOrderFromDealer(dealerId, sortedPlayerIds) {
  return playerOrderFromDealer(dealerId, sortedPlayerIds);
}

export function buildHandEnrollment(sortedPlayerIds, dealerId, nowMs = Date.now()) {
  const orderedPlayerIds = enrollmentOrderFromDealer(dealerId, sortedPlayerIds);
  return {
    active: true,
    orderedPlayerIds,
    currentIndex: 0,
    turnDeadlineMs: nowMs + HAND_ENROLLMENT_MS,
    enrolledIds: [],
    declinedIds: [],
  };
}

function buildDealCompletionPatch(dealerId, enrolledIds, sortedPlayerIds, seed, dealingRule) {
  const deal = dealInitialHand({
    dealerId,
    participantIds: enrolledIds,
    sortedPlayerIds,
    seed: seed ?? Date.now(),
  });
  const { publicHand, privateHandsByPlayer } = serializeHandState(deal, {
    dealerId,
    actionOrder: deal.dealOrder,
    maxDrawDiscards: maxDrawDiscards(enrolledIds.length, dealingRule),
  });
  return {
    handEnrollment: FieldValue.delete(),
    currentHand: publicHand,
    privateHandsByPlayer,
  };
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
  );
}

function sortedScorePlayerIds(scoreDocs) {
  return scoreDocs
    .map((d) => ({ id: d.id, displayName: d.data()?.displayName || "" }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((r) => r.id);
}

function actionOrderFromHand(currentHand) {
  if (currentHand?.actionOrder?.length) return currentHand.actionOrder;
  return currentHand?.participantIds || [];
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
  const row = scoreById[playerId];
  if (row?.skipNextAnte) return 0;
  return stakeForPlayer(scoreById, playerId, sessionStake);
}

function nextDealerId(scoreDocs, currentDealerId) {
  const ids = sortedScorePlayerIds(scoreDocs);
  if (ids.length === 0) return null;
  const idx = ids.indexOf(currentDealerId);
  const base = idx >= 0 ? idx : 0;
  return ids[(base + 1) % ids.length];
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

async function getDealingRule(db, roomId) {
  const roomSnap = await db.collection("rooms").doc(roomId).get();
  return roomSnap.data()?.houseRules?.dealing ?? null;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleEnsureHandEnrollment(db, { roomId, sessionId, actorId }) {
  await assertRoomMember(db, roomId, actorId);
  const ref = sessionRef(db, roomId, sessionId);
  const sessionSnap = await ref.get();
  if (!sessionSnap.exists) throw new HttpsError("not-found", "Session not found");
  const data = sessionSnap.data();
  if (data.status === "final" || data.handEnrollment?.active) return { status: "noop" };
  const phase = data.currentHand?.phase;
  if (phase === "draw" || phase === "play") return { status: "noop" };
  const participantIds = data.currentHand?.participantIds || [];
  const tricks = data.currentHand?.tricksByPlayer || {};
  if (participantIds.length > 0 || Object.values(tricks).some((n) => (n || 0) > 0)) {
    return { status: "noop" };
  }
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const sortedIds = sortedScorePlayerIds(scoreSnap.docs);
  if (sortedIds.length < 2) return { status: "noop" };
  await ref.update({
    handEnrollment: buildHandEnrollment(sortedIds, data.dealerId),
    currentHand: emptyPreDealHand(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { status: "started" };
}

export async function handleTimeoutEnrollment(db, { roomId, sessionId, actorId }) {
  await assertRoomMember(db, roomId, actorId);
  const dealingRule = await getDealingRule(db, roomId);
  const ref = sessionRef(db, roomId, sessionId);
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const sortedPlayerIds = sortedScorePlayerIds(scoreSnap.docs);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { status: "noop" };
    const sessionData = snap.data();
    const enrollment = sessionData.handEnrollment;
    if (!enrollment?.active || Date.now() < enrollment.turnDeadlineMs) return { status: "noop" };

    const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
    const enrolledIds = [...(enrollment.enrolledIds || [])];
    const declinedIds = [...(enrollment.declinedIds || []), currentId];
    const patch = enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
      dealerId: sessionData.dealerId,
      sortedPlayerIds,
      seed: Date.now(),
      dealingRule,
    });
    writePrivateHands(tx, db, roomId, sessionId, patch.privateHandsByPlayer);
    const { privateHandsByPlayer: _omit, ...sessionPatch } = patch;
    tx.update(ref, { ...sessionPatch, updatedAt: FieldValue.serverTimestamp() });
    return { status: patch.privateHandsByPlayer ? "dealt" : "advanced" };
  });
}

export async function handleSetHandParticipation(
  db,
  { roomId, sessionId, playerId, inHand, actorId },
) {
  if (!playerId || !actorId) throw new HttpsError("invalid-argument", "Missing player");
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only change your own hand participation");
  }
  await assertRoomMember(db, roomId, actorId);

  const ref = sessionRef(db, roomId, sessionId);
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const sortedPlayerIds = sortedScorePlayerIds(scoreSnap.docs);
  const dealingRule = await getDealingRule(db, roomId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

    const enrollment = sessionData.handEnrollment;
    if (enrollment?.active) {
      if (!inHand) throw new HttpsError("failed-precondition", "Wait for your turn or let the timer run out");
      const currentId = enrollment.orderedPlayerIds[enrollment.currentIndex];
      if (playerId !== currentId) throw new HttpsError("failed-precondition", "Not your turn to join yet");
      const enrolledIds = [...(enrollment.enrolledIds || []), playerId];
      const declinedIds = [...(enrollment.declinedIds || [])];
      const patch = enrollmentPatchAfterStep(enrollment, enrolledIds, declinedIds, {
        dealerId: sessionData.dealerId,
        sortedPlayerIds,
        seed: Date.now(),
        dealingRule,
      });
      writePrivateHands(tx, db, roomId, sessionId, patch.privateHandsByPlayer);
      const { privateHandsByPlayer: _omit, ...sessionPatch } = patch;
      tx.update(ref, { ...sessionPatch, updatedAt: FieldValue.serverTimestamp() });
      return { status: patch.privateHandsByPlayer ? "dealt" : "advanced" };
    }

    const currentHand = sessionData.currentHand || emptyPreDealHand();
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
}

export async function handleSubmitDraw(
  db,
  { roomId, sessionId, playerId, discardIndices, actorId },
) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only draw for yourself (or drive a robot)");
  }
  await assertRoomMember(db, roomId, actorId);

  const ref = sessionRef(db, roomId, sessionId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

    const currentHand = sessionData.currentHand || {};
    if (currentHand.phase !== HAND_PHASE.DRAW) {
      throw new HttpsError("failed-precondition", "Not in draw phase");
    }
    if (currentHand.turnPlayerId !== playerId) {
      throw new HttpsError("failed-precondition", "Not your turn to draw");
    }
    if ((currentHand.drawCompletedIds || []).includes(playerId)) {
      throw new HttpsError("failed-precondition", "Draw already completed");
    }

    const privateRef = privateHandRef(db, roomId, sessionId, playerId);
    const privateSnap = await tx.get(privateRef);
    if (!privateSnap.exists) throw new HttpsError("not-found", "Private hand not found");

    const hand = deserializeCards(privateSnap.data().cards || []);
    const deckSeed = currentHand.deckSeed;
    if (deckSeed == null) throw new HttpsError("failed-precondition", "Missing deck seed on session");

    const deck = shuffledDeckFromSeed(deckSeed);
    const deckNextIndex = currentHand.deckNextIndex ?? 0;
    const maxDraw =
      currentHand.maxDrawDiscards ?? maxDrawDiscards(currentHand.participantIds?.length ?? 2);

    const drawResult = applyPlayerDraw({
      playerId,
      privateHand: hand,
      publicHand: currentHand,
      discardIndices: discardIndices || [],
      deck,
      deckNextIndex,
      maxDiscards: maxDraw,
    });

    let nextPublic = advanceAfterDraw(
      drawResult.publicHand,
      actionOrderFromHand(currentHand),
      playerId,
    );
    nextPublic = {
      ...nextPublic,
      remainingDeckCount: remainingDeckCount(deck, drawResult.deckNextIndex),
    };

    tx.set(privateRef, {
      cards: serializeCards(drawResult.privateHand),
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.update(ref, { currentHand: nextPublic, updatedAt: FieldValue.serverTimestamp() });
    return { status: "ok", phase: nextPublic.phase };
  });
}

async function finalizeHandFromCardPlay(db, roomId, sessionId, recordedBy) {
  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  if (!sessionSnap.exists) return { status: "noop" };
  const sessionData = sessionSnap.data();
  const currentHand = sessionData.currentHand || {};
  const participantIds = currentHand.participantIds || [];
  const tricksByPlayer = currentHand.tricksByPlayer || {};
  const { ready, winnerIds } = deriveWinnersFromTricks(tricksByPlayer, participantIds);

  if (!ready) {
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

export async function handlePlayCard(db, { roomId, sessionId, playerId, cardIndex, actorId }) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only play for yourself (or drive a robot)");
  }
  await assertRoomMember(db, roomId, actorId);

  const ref = sessionRef(db, roomId, sessionId);
  let handComplete = false;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Session not found");
    const sessionData = snap.data();
    if (sessionData.status === "final") throw new HttpsError("failed-precondition", "Session is final");

    const currentHand = sessionData.currentHand || {};
    if (currentHand.phase !== HAND_PHASE.PLAY) {
      throw new HttpsError("failed-precondition", "Not in trick-play phase");
    }

    const privateRef = privateHandRef(db, roomId, sessionId, playerId);
    const privateSnap = await tx.get(privateRef);
    if (!privateSnap.exists) throw new HttpsError("not-found", "Private hand not found");

    const hand = deserializeCards(privateSnap.data().cards || []);
    const result = applyPlayerPlayCard({
      publicHand: currentHand,
      privateHand: hand,
      playerId,
      cardIndex,
      actionOrder: actionOrderFromHand(currentHand),
      cinchEnabled: currentHand.cinchEnabled === true,
    });

    handComplete = result.handComplete;

    tx.set(privateRef, {
      cards: serializeCards(result.privateHand),
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.update(ref, { currentHand: result.publicHand, updatedAt: FieldValue.serverTimestamp() });
  });

  if (handComplete) {
    return finalizeHandFromCardPlay(db, roomId, sessionId, actorId);
  }
  return { status: "ok" };
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
  const potCarryMode = mode === "push" || mode === "non_winner_ante_up";
  if (!potCarryMode && winners.length === 0) {
    throw new HttpsError("invalid-argument", "Select at least one winner");
  }
  for (const wid of winners) {
    if (!participants.includes(wid)) {
      throw new HttpsError("invalid-argument", "Every winner must be in the hand");
    }
  }

  const stake = sessionData.handStake ?? 1;
  const limEnabled = sessionData.limEnabled === true;
  const carryIn = sessionData.carryOverPot || 0;
  const handNumber = (sessionData.handCount || 0) + 1;

  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  for (const pid of participants) {
    if (!scoreById[pid]) throw new HttpsError("invalid-argument", "Unknown player in hand");
  }

  const handSettlement = settleHandDeltas({
    mode,
    winners,
    participants,
    tricksByPlayer,
    anteAmount: stake,
    limEnabled,
    carryIn,
    stakeForPlayer: (pid) => playerHandStake(scoreById, pid, stake),
  });

  const {
    deltas,
    carryOverPot,
    bourreIds,
    bourreMatch,
    potState,
    pot: grossPot,
    cappedPot,
    overflow,
  } = handSettlement;

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
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (current.skipNextAnte) patch.skipNextAnte = FieldValue.delete();
    if (bourreIds.length > 0 && tricksByPlayer) {
      const tricks = tricksForPlayer(tricksByPlayer, pid);
      if (tricks >= 1 || bourreIds.includes(pid)) patch.skipNextAnte = true;
    }
    if (isWinner && (mode === "split" || mode === "win")) {
      patch.handsWon = (current.handsWon || 0) + 1;
      patch.tricksWon = tricksWon;
      patch.total = Math.max(0, tricksWon);
    }
    if (mode === "non_winner_ante_up") {
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

  const newDealerId = nextDealerId(scoreSnap.docs, sessionData.dealerId);
  await deletePrivateHandsForSession(db, roomId, sessionId, batch);
  batch.update(sessionRef(db, roomId, sessionId), {
    handCount: handNumber,
    handStakeLocked: true,
    carryOverPot,
    dealerId: newDealerId,
    pendingCoWinSettlement: FieldValue.delete(),
    handEnrollment: buildHandEnrollment(sortedScorePlayerIds(scoreSnap.docs), newDealerId),
    currentHand: emptyPreDealHand(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  await recomputeSessionTotals(db, roomId, sessionId);
  return { status: "settled", settlement: mode, handNumber };
}

export async function handleVoteCoWinSettlement(
  db,
  { roomId, sessionId, participantIds, winnerIds, voterId, choice, recordedBy, actorId },
) {
  const voter = voterId || actorId;
  if (choice !== "push" && choice !== "split") {
    throw new HttpsError("invalid-argument", "Vote must be decline or agree to split");
  }
  await assertRoomMember(db, roomId, voter);

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
