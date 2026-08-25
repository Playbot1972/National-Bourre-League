/**
 * Server-authoritative chip purchase grant (consumable IAP).
 */

import { FieldValue } from "firebase-admin/firestore";
import { getChipPackById } from "./vendor/chip-packs.js";
import { verifyChipPurchase } from "./chipPurchaseVerify.js";
import {
  isMoneyEngineV1,
  runV1Rebuy,
  moneyEventsFromFirestoreDocs,
  nextMoneySequence,
  MONEY_EVENTS_COLLECTION,
  MONEY_ENGINE_VERSION,
  assertTableChipInvariantFailClosed,
  baselineFromSessionDoc,
  baselineDocFromBaseline,
  buildSessionChipSnapshot,
  buildLedgerStateFromSession,
  applyRebuyToBaseline,
} from "./vendor/money-persistence.js";
import { processRebuy } from "./vendor/money-engine.js";
import { normalizeBourreSettings } from "./vendor/bourre-rules.js";

export const CHIP_PURCHASE_GRANTS_COLLECTION = "chipPurchaseGrants";

function grantDocId(transactionId) {
  return Buffer.from(String(transactionId)).toString("base64url").slice(0, 400);
}

function sessionRef(db, roomId, sessionId) {
  return db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId);
}

function scoresCol(db, roomId, sessionId) {
  return sessionRef(db, roomId, sessionId).collection("scores");
}

function moneyEventsCol(db, roomId, sessionId) {
  return sessionRef(db, roomId, sessionId).collection(MONEY_EVENTS_COLLECTION);
}

async function loadSessionMoneyEvents(db, roomId, sessionId) {
  const snap = await moneyEventsCol(db, roomId, sessionId).get();
  return moneyEventsFromFirestoreDocs(snap.docs);
}

function appendMoneyEventsInTransaction(tx, db, { roomId, sessionId, events, nextSequence }) {
  if (!events?.length) return;
  const col = moneyEventsCol(db, roomId, sessionId);
  for (const event of events) {
    tx.set(col.doc(event.eventId), {
      ...event,
      metadata: event.metadata || {},
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  tx.update(sessionRef(db, roomId, sessionId), {
    moneyEngineVersion: MONEY_ENGINE_VERSION,
    moneySequence: nextSequence,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function resolveSessionBuyIn(sessionData, bourre) {
  return sessionData.buyInAmount ?? bourre.buyInAmount ?? 0;
}

function rebuyActionId(sessionId, playerId, handNumber) {
  return `rebuy:${sessionId}:${playerId}:${handNumber}`;
}

/**
 * Apply free session rebuy (house rule) — server-owned mirror of legacy client rebuySessionPlayer.
 */
export async function handleApplyFreeSessionRebuy(db, { actorId, roomId, sessionId, playerId }) {
  if (!roomId || !sessionId || !playerId) throw new Error("Missing session context");
  if (playerId !== actorId) throw new Error("You can only rebuy for yourself");

  const roomRef = db.collection("rooms").doc(roomId);
  const sessionRefDoc = sessionRef(db, roomId, sessionId);
  const scoreRef = scoresCol(db, roomId, sessionId).doc(playerId);
  const scoresCollection = scoresCol(db, roomId, sessionId);
  const eventsCol = moneyEventsCol(db, roomId, sessionId);

  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) throw new Error("Room not found");
  const bourre = normalizeBourreSettings(roomSnap.data()?.bourreSettings);

  return db.runTransaction(async (tx) => {
    const [sessionSnap, scoreSnap, scoresSnap, eventsSnap] = await Promise.all([
      tx.get(sessionRefDoc),
      tx.get(scoreRef),
      tx.get(scoresCollection),
      tx.get(eventsCol),
    ]);

    if (!sessionSnap.exists) throw new Error("Session not found");
    const sessionData = sessionSnap.data();
    if (sessionData.status === "final") throw new Error("Session is final");
    if (!scoreSnap.exists) throw new Error("Player not in session");
    if (!bourre.rebuyEnabled) throw new Error("Free rebuy is not enabled for this room");

    const buyIn = resolveSessionBuyIn(sessionData, bourre);
    const handNumber = sessionData.handCount || 0;

    if (isMoneyEngineV1(sessionData)) {
      const existingEvents = moneyEventsFromFirestoreDocs(eventsSnap.docs);
      const actionId = rebuyActionId(sessionId, playerId, handNumber);
      const priorEvent = existingEvents.find(
        (event) => event.actionId === actionId && event.type === "REBUY_APPLIED",
      );
      if (priorEvent) {
        return {
          status: "applied",
          bankroll: priorEvent.amount ?? buyIn,
          chipsGranted: priorEvent.amount ?? buyIn,
          idempotent: true,
        };
      }
    }

    const scoreData = scoreSnap.data();
    const bankroll = Math.max(0, Number(scoreData.bankroll) || 0);
    if (bankroll > 0 && scoreData.out !== true) {
      throw new Error("Rebuy is only available when you are out of chips");
    }

    if (!isMoneyEngineV1(sessionData)) {
      tx.update(scoreRef, {
        bankroll: buyIn,
        out: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { status: "applied", bankroll: buyIn, chipsGranted: buyIn };
    }

    const existingEvents = moneyEventsFromFirestoreDocs(eventsSnap.docs);
    const actionId = rebuyActionId(sessionId, playerId, handNumber);
    const priorEvent = existingEvents.find(
      (event) => event.actionId === actionId && event.type === "REBUY_APPLIED",
    );
    if (priorEvent) {
      return {
        status: "applied",
        bankroll: priorEvent.amount ?? buyIn,
        chipsGranted: priorEvent.amount ?? buyIn,
        idempotent: true,
      };
    }

    const scoreById = Object.fromEntries(scoresSnap.docs.map((doc) => [doc.id, doc.data()]));
    const seatIds = scoresSnap.docs.map((doc) => doc.id);
    const ledger = buildLedgerStateFromSession(sessionData, scoreById, buyIn);
    const rebuy = runV1Rebuy({
      sessionId,
      playerId,
      buyInAmount: buyIn,
      handNumber,
      existingEvents: [],
      ledger,
    });

    if (rebuy.newEvents.length === 0) {
      const replayedBankroll = rebuy.newBankrolls[playerId] ?? buyIn;
      return {
        status: "applied",
        bankroll: replayedBankroll,
        chipsGranted: rebuy.newEvents[0]?.amount ?? buyIn,
        idempotent: true,
      };
    }

    const minted = rebuy.newEvents[0]?.amount ?? buyIn;
    const baseline = baselineFromSessionDoc(sessionData.moneyLedgerBaseline, existingEvents);
    const updatedBaseline = applyRebuyToBaseline(baseline, minted);
    const projectedScoreById = { ...scoreById };
    projectedScoreById[playerId] = {
      ...projectedScoreById[playerId],
      bankroll: rebuy.newBankrolls[playerId] ?? buyIn,
      net: 0,
      out: undefined,
    };

    const snapshot = buildSessionChipSnapshot(projectedScoreById, sessionData, {
      buyInFallback: buyIn,
      playerIds: seatIds,
    });
    assertTableChipInvariantFailClosed(snapshot, updatedBaseline, {
      roomId,
      sessionId,
      handId: handNumber,
      label: "free-rebuy",
    });

    tx.update(scoreRef, {
      bankroll: rebuy.newBankrolls[playerId] ?? buyIn,
      net: 0,
      out: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    appendMoneyEventsInTransaction(tx, db, {
      roomId,
      sessionId,
      events: rebuy.newEvents,
      nextSequence: nextMoneySequence(sessionData, rebuy.newEvents.length),
    });
    tx.update(sessionRefDoc, {
      moneyLedgerBaseline: baselineDocFromBaseline(updatedBaseline),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      status: "applied",
      bankroll: rebuy.newBankrolls[playerId] ?? buyIn,
      chipsGranted: minted,
    };
  });
}

/**
 * Verify store purchase and grant chips to session bankroll (idempotent).
 * Chips are usable immediately when the player is out (between hands).
 */
export async function handleGrantChipPurchase(
  db,
  { actorId, roomId, sessionId, packId, platform, productId, purchaseToken },
) {
  if (!roomId || !sessionId || !packId || !purchaseToken || !productId) {
    throw new Error("Missing purchase context");
  }

  const pack = getChipPackById(packId);
  if (!pack) throw new Error("Unknown chip pack");

  const verified = await verifyChipPurchase({
    platform,
    productId,
    packId,
    purchaseToken,
  });

  const grantId = grantDocId(verified.transactionId);
  const grantRef = db.collection(CHIP_PURCHASE_GRANTS_COLLECTION).doc(grantId);
  const scoreRef = scoresCol(db, roomId, sessionId).doc(actorId);
  const sessionRefDoc = sessionRef(db, roomId, sessionId);

  const existingEvents = await loadSessionMoneyEvents(db, roomId, sessionId);
  const actionId = `chip-purchase:${verified.transactionId}`;

  const [preSessionSnap, preScoreSnap] = await Promise.all([
    sessionRefDoc.get(),
    scoreRef.get(),
  ]);
  if (!preSessionSnap.exists) throw new Error("Session not found");
  if (!preScoreSnap.exists) throw new Error("Join the table before purchasing chips");

  const preSessionData = preSessionSnap.data();
  const preScoreData = preScoreSnap.data();
  const previewBankroll = Math.max(0, Number(preScoreData.bankroll) || 0);

  const ledger = {
    version: MONEY_ENGINE_VERSION,
    buyInFallback: pack.chips,
    bankrolls: { [actorId]: previewBankroll },
    nets: { [actorId]: preScoreData.net ?? 0 },
    carryOverPot: preSessionData.carryOverPot ?? 0,
    postedAntes: {},
    scoreFlags: { [actorId]: { out: preScoreData.out === true } },
    sequence: Number(preSessionData.moneySequence) || 0,
  };

  const grantPreview = processRebuy({
    actionId,
    playerId: actorId,
    buyInAmount: pack.chips,
    handId: preSessionData.handCount != null ? String(preSessionData.handCount) : null,
    existingEvents,
    ledger,
  });

  return db.runTransaction(async (tx) => {
    const existingGrant = await tx.get(grantRef);
    if (existingGrant.exists) {
      const prior = existingGrant.data();
      if (prior.uid !== actorId) throw new Error("Purchase already claimed");
      return {
        status: "already_granted",
        chipsGranted: prior.chipAmount,
        bankroll: prior.resultBankroll ?? null,
      };
    }

    const [sessionSnap, scoreSnap] = await Promise.all([tx.get(sessionRefDoc), tx.get(scoreRef)]);
    if (!sessionSnap.exists) throw new Error("Session not found");
    if (sessionSnap.data().status === "final") throw new Error("Session is final");
    if (!scoreSnap.exists) throw new Error("Join the table before purchasing chips");

    const sessionData = sessionSnap.data();
    const scoreData = scoreSnap.data();
    const currentBankroll = Math.max(0, Number(scoreData.bankroll) || 0);
    const newBankroll =
      grantPreview.newBankrolls[actorId] ?? currentBankroll + pack.chips;

    tx.set(grantRef, {
      uid: actorId,
      packId,
      chipAmount: pack.chips,
      productId,
      platform,
      transactionId: verified.transactionId,
      roomId,
      sessionId,
      resultBankroll: newBankroll,
      grantedAt: FieldValue.serverTimestamp(),
    });

    const scorePatch = {
      bankroll: newBankroll,
      out: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    tx.update(scoreRef, scorePatch);

    if (isMoneyEngineV1(sessionData) && grantPreview.newEvents.length) {
      appendMoneyEventsInTransaction(tx, db, {
        roomId,
        sessionId,
        events: grantPreview.newEvents,
        nextSequence: nextMoneySequence(sessionData, grantPreview.newEvents.length),
      });
    }

    return {
      status: "granted",
      chipsGranted: pack.chips,
      bankroll: newBankroll,
      packName: pack.name,
    };
  });
}
