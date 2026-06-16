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
  botDrawDiscardIndices,
  botPlayCardIndex,
  effectivePlayerHand,
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

function getSessionEnrollment(sessionData) {
  const live = sessionData?.liveEnrollment;
  const livePhase = live?.deal?.publicHand?.phase ?? null;
  if (live?.active) return live;
  if (livePhase === "draw" || livePhase === "play") return null;
  if (sessionData?.handEnrollment?.active) return sessionData.handEnrollment;
  return sessionData?.handEnrollment ?? null;
}

function isClearedPreDealHand(hand) {
  const h = hand ?? emptyPreDealHand();
  if (h.phase === "draw" || h.phase === "play") return false;
  if ((h.participantIds?.length ?? 0) > 0) return false;
  const tricks = h.tricksByPlayer ?? {};
  return !Object.values(tricks).some((n) => (n || 0) > 0);
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
  if (livePhase === "draw" || livePhase === "play") return false;
  return isClearedPreDealHand(sessionData?.currentHand);
}

function getSessionCurrentHand(sessionData) {
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  if (livePublic?.phase) return livePublic;
  return sessionData?.currentHand ?? emptyPreDealHand();
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

function nextDealerId(scoreDocs, currentDealerId, sessionData) {
  const ids = seatPlayerIds(sessionData, scoreDocs);
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

async function getRoomSnap(db, roomId) {
  return db.collection("rooms").doc(roomId).get();
}

async function getDealingRule(db, roomId) {
  const roomSnap = await getRoomSnap(db, roomId);
  return roomSnap.data()?.houseRules?.dealing ?? null;
}

function tiesHouseRuleAllowsSplit(houseRules) {
  const text = String(houseRules?.ties ?? "").toLowerCase();
  if (!text) return false;
  if (text.includes("no split") || text.includes("carries")) return false;
  return text.includes("split evenly") || /\bsplit\b/.test(text);
}

const BOT_ADVANCE_MAX_STEPS = 48;

async function executeBotDraw(db, roomId, sessionId, playerId, actorId, dealingRule) {
  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  const ch = sessionSnap.data()?.currentHand || {};
  const privateSnap = await privateHandRef(db, roomId, sessionId, playerId).get();
  if (!privateSnap.exists) {
    throw new HttpsError("failed-precondition", `Bot private hand missing (${playerId})`);
  }
  const privateHand = deserializeCards(privateSnap.data().cards || []);
  const effective = effectivePlayerHand(playerId, privateHand, ch);
  const maxDraw =
    ch.maxDrawDiscards ?? maxDrawDiscards(ch.participantIds?.length ?? 2, dealingRule);
  const discardIndices = botDrawDiscardIndices(effective, ch.trumpSuit, maxDraw);
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
  const trick = ch.currentTrick;
  const trickPlays = (trick?.plays || []).map((p) => p.card);
  const isLeading = trickPlays.length === 0;
  const cardIndex = botPlayCardIndex(hand, {
    hand,
    trumpSuit: ch.trumpSuit,
    leadSuit: isLeading ? null : ch.leadSuit || trickPlays[0]?.suit,
    trickPlays,
    isLeading,
    cinchEnabled: ch.cinchEnabled === true,
  });
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
  for (let step = 0; step < BOT_ADVANCE_MAX_STEPS; step += 1) {
    const snap = await sessionRef(db, roomId, sessionId).get();
    const sessionData = snap.data();
    if (!sessionData || sessionData.status === "final") return;

    const pending = sessionData.pendingCoWinSettlement;
    if (pending?.winnerIds?.length >= 2) {
      const votes = pending.votes || {};
      const botWinner = pending.winnerIds.find(
        (id) => isRobotPlayerId(id) && votes[id] !== "split" && votes[id] !== "push",
      );
      if (botWinner) {
        await handleVoteCoWinSettlement(db, {
          roomId,
          sessionId,
          participantIds: pending.participantIds || sessionData.currentHand?.participantIds || [],
          winnerIds: pending.winnerIds,
          voterId: botWinner,
          choice: "push",
          recordedBy: actorId,
          actorId,
        });
        continue;
      }
      return;
    }

    const enrollment = sessionData.handEnrollment;
    if (enrollment?.active) {
      if (Date.now() >= enrollment.turnDeadlineMs) {
        await handleTimeoutEnrollment(db, { roomId, sessionId, actorId });
        continue;
      }
      const currentId = enrollment.orderedPlayerIds?.[enrollment.currentIndex];
      if (
        currentId &&
        isRobotPlayerId(currentId) &&
        !(enrollment.enrolledIds || []).includes(currentId)
      ) {
        await handleSetHandParticipation(db, {
          roomId,
          sessionId,
          playerId: currentId,
          inHand: true,
          actorId,
        });
        continue;
      }
      return;
    }

    const currentHand = sessionData.currentHand || {};
    const participants = currentHand.participantIds || [];
    if (!participants.length) return;

    if (currentHand.phase === HAND_PHASE.DRAW) {
      const turnId = currentHand.turnPlayerId;
      const drawDone = currentHand.drawCompletedIds || [];
      if (
        turnId &&
        isRobotPlayerId(turnId) &&
        participants.includes(turnId) &&
        !drawDone.includes(turnId)
      ) {
        await executeBotDraw(db, roomId, sessionId, turnId, actorId, dealingRule);
        continue;
      }
      return;
    }

    if (currentHand.phase === HAND_PHASE.PLAY) {
      const turnId = currentHand.turnPlayerId;
      const tricks = currentHand.tricksByPlayer || {};
      if (totalTricksPlayed(tricks, participants) >= MAX_TRICKS_PER_HAND) return;
      if (turnId && isRobotPlayerId(turnId) && participants.includes(turnId)) {
        await executeBotPlay(db, roomId, sessionId, turnId, actorId);
        continue;
      }
      return;
    }

    return;
  }
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
  if (existing?.active) {
    const refreshedEnrollment = {
      ...existing,
      turnDeadlineMs: Date.now() + HAND_ENROLLMENT_MS,
    };
    await ref.update({
      handEnrollment: refreshedEnrollment,
      liveEnrollment: refreshedEnrollment,
      currentHand: emptyPreDealHand(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await advanceBotsAfterAction(db, roomId, sessionId, actorId);
    return { status: "refreshed" };
  }

  const currentHand = getSessionCurrentHand(data);
  const phase = currentHand?.phase;
  if (phase === "draw" || phase === "play") return { status: "noop" };
  const participantIds = currentHand?.participantIds || [];
  const tricks = currentHand?.tricksByPlayer || {};
  if (participantIds.length > 0 || Object.values(tricks).some((n) => (n || 0) > 0)) {
    if (isClearedPreDealHand(data.currentHand)) {
      await ref.update({
        liveEnrollment: FieldValue.delete(),
        handEnrollment: FieldValue.delete(),
        currentHand: emptyPreDealHand(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      sessionSnap = await ref.get();
      data = sessionSnap.data();
    } else {
      return { status: "noop" };
    }
  }
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const sortedIds = sortedScorePlayerIds(scoreSnap.docs);
  if (sortedIds.length < 2) return { status: "noop" };
  const enrollment = buildHandEnrollment(sortedIds, data.dealerId);
  await ref.update({
    handEnrollment: enrollment,
    liveEnrollment: enrollment,
    currentHand: emptyPreDealHand(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return { status: "started" };
}

export async function handleTimeoutEnrollment(db, { roomId, sessionId, actorId }) {
  await assertRoomMember(db, roomId, actorId);
  const dealingRule = await getDealingRule(db, roomId);
  const ref = sessionRef(db, roomId, sessionId);
  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const sortedPlayerIds = sortedScorePlayerIds(scoreSnap.docs);

  const result = await db.runTransaction(async (tx) => {
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
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return result;
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

  const result = await db.runTransaction(async (tx) => {
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

export async function handleSubmitDraw(
  db,
  { roomId, sessionId, playerId, discardIndices, actorId },
) {
  if (!canActForPlayer(playerId, actorId)) {
    throw new HttpsError("permission-denied", "You can only draw for yourself (or drive a robot)");
  }
  await assertRoomMember(db, roomId, actorId);
  const result = await runSubmitDrawTransaction(db, {
    roomId,
    sessionId,
    playerId,
    discardIndices,
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

  return { handComplete };
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

  const roomSnap = await getRoomSnap(db, roomId);
  const allowSplitVote = tiesHouseRuleAllowsSplit(roomSnap.data()?.houseRules);
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
    if (bourreIds.includes(pid)) {
      patch.skipNextAnte = true;
    }
    if (
      winners.includes(pid) &&
      winners.length >= 2 &&
      (mode === "co_win_carry" || mode === "non_winner_ante_up" || mode === "split")
    ) {
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
  await deletePrivateHandsForSession(db, roomId, sessionId, batch);
  batch.update(sessionRef(db, roomId, sessionId), {
    handCount: handNumber,
    handStakeLocked: true,
    carryOverPot,
    dealerId: newDealerId,
    pendingCoWinSettlement: FieldValue.delete(),
    handEnrollment: FieldValue.delete(),
    liveEnrollment: FieldValue.delete(),
    currentHand: emptyPreDealHand(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  await recomputeSessionTotals(db, roomId, sessionId);
  return { status: "settled", settlement: mode, handNumber };
}

export async function handleAdvanceBots(db, { roomId, sessionId, actorId }) {
  await assertRoomMember(db, roomId, actorId);
  await advanceBotsAfterAction(db, roomId, sessionId, actorId);
  return { status: "ok" };
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
