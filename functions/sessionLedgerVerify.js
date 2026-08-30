/**
 * Read-only session ledger verifier — owner / ledgerOps only.
 */
import { HttpsError } from "firebase-functions/v2/https";
import {
  sessionRef,
  scoresCol,
  moneyEventsCol,
  sessionRosterPlayerIds,
} from "./gameHandlers.js";
import {
  baselineFromSessionDoc,
  buildSessionChipSnapshot,
  checkTableChipInvariant,
  isMoneyEngineV1,
  moneyEventsFromFirestoreDocs,
} from "./vendor/money-persistence.js";
import {
  computeLedgerBaselineFromEvents,
  expectedChipTotalFromBaseline,
  dedupeEventsById,
  sortMoneyEvents,
  replayEvents,
  emptyLedgerState,
  ledgerChipTotal,
  scoreBankroll,
  resolveSessionBuyIn,
  normalizeBourreSettings,
} from "./vendor/money-engine.js";
import { authoritativeCurrentHand } from "./vendor/session-startup.js";

function baselineFieldsMatch(stored, recomputed, tolerance = 0.001) {
  return (
    Math.abs(stored.tableStartingTotal - recomputed.tableStartingTotal) <= tolerance &&
    Math.abs(stored.netCashIn - recomputed.netCashIn) <= tolerance &&
    Math.abs(stored.netCashOut - recomputed.netCashOut) <= tolerance &&
    Math.abs(stored.netBourreMint - recomputed.netBourreMint) <= tolerance
  );
}

function findFirstDivergentEvent(events, buyIn) {
  const sorted = sortMoneyEvents(dedupeEventsById(events));
  if (!sorted.length) return null;
  for (let i = 0; i < sorted.length; i++) {
    const prefix = sorted.slice(0, i + 1);
    const baseline = computeLedgerBaselineFromEvents(prefix);
    const expected = expectedChipTotalFromBaseline(baseline);
    const replayed = replayEvents(prefix, emptyLedgerState(buyIn));
    const actual = ledgerChipTotal(replayed);
    if (Math.abs(actual - expected) > 0.001) {
      const event = sorted[i];
      return {
        sequence: event.sequence,
        eventId: event.eventId,
        type: event.type,
        actionId: event.actionId,
        reason: "chip_total_drift_after_event",
      };
    }
  }
  return null;
}

function classifyRecovery({
  orphans,
  invariantOk,
  moneyEngineV1,
  settlementExists,
  handCount,
  invariantDelta,
}) {
  if (orphans.length > 0) return "ORPHAN_SEAT_RECONCILIATION_REQUIRED";
  if (!moneyEngineV1) return "MISSING_OR_MALFORMED_MONEY_STATE";
  if (!invariantOk) return "TABLE_CHIP_INVARIANT_MISMATCH";
  if (settlementExists && handCount === 0) return "SETTLEMENT_IDEMPOTENCY_CONFLICT";
  if (Math.abs(invariantDelta) > 0.001) return "TABLE_CHIP_INVARIANT_MISMATCH";
  return "HEALTHY";
}

export async function assertLedgerVerifierAccess(db, roomId, actorId, authToken = {}) {
  if (!actorId) throw new HttpsError("unauthenticated", "Sign in required");
  if (authToken?.ledgerOps === true) return;
  const roomSnap = await db.doc(`rooms/${roomId}`).get();
  if (!roomSnap.exists) throw new HttpsError("not-found", "Room not found");
  if (roomSnap.data()?.ownerId === actorId) return;
  throw new HttpsError("permission-denied", "Ledger verification requires room owner or ledgerOps");
}

/**
 * Read-only ledger report for support / accounting review.
 */
export async function handleVerifySessionLedger(
  db,
  { roomId, sessionId, actorId, authToken },
) {
  if (!roomId || !sessionId) {
    throw new HttpsError("invalid-argument", "roomId and sessionId are required");
  }

  await assertLedgerVerifierAccess(db, roomId, actorId, authToken);

  const sessionSnap = await sessionRef(db, roomId, sessionId).get();
  if (!sessionSnap.exists) throw new HttpsError("not-found", "Session not found");
  const sessionData = sessionSnap.data();

  const roomSnap = await db.doc(`rooms/${roomId}`).get();
  const bourre = normalizeBourreSettings(roomSnap.data()?.bourreSettings);
  const buyIn = resolveSessionBuyIn(sessionData, bourre);

  const scoreSnap = await scoresCol(db, roomId, sessionId).get();
  const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
  const rosterIds = new Set(sessionRosterPlayerIds(sessionData));
  const positiveBalanceOrphanRows = [];
  for (const doc of scoreSnap.docs) {
    if (rosterIds.has(doc.id)) continue;
    const bankroll = scoreBankroll(doc.data(), buyIn);
    if (bankroll > 0) {
      positiveBalanceOrphanRows.push({ playerId: doc.id, bankroll });
    }
  }

  const eventsSnap = await moneyEventsCol(db, roomId, sessionId).get();
  const moneyEvents = moneyEventsFromFirestoreDocs(eventsSnap.docs);
  const moneyEngineV1 = isMoneyEngineV1(sessionData);

  const pendingHandNumber = (sessionData.handCount || 0) + 1;
  const expectedSettlementAction = `settle:${sessionId}:${pendingHandNumber}`;
  const matchingSettlementEvents = moneyEvents.filter(
    (e) => e.actionId === expectedSettlementAction,
  );

  const recomputedBaseline = computeLedgerBaselineFromEvents(dedupeEventsById(moneyEvents));
  const storedBaseline = baselineFromSessionDoc(sessionData.moneyLedgerBaseline, moneyEvents);
  const storedMatchesRecomputed = baselineFieldsMatch(storedBaseline, recomputedBaseline);

  const currentHand = authoritativeCurrentHand(sessionData);
  const postedAntes = currentHand?.postedAntes ?? {};
  const postedAnteTotal = Object.values(postedAntes).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );

  const snapshot = buildSessionChipSnapshot(scoreById, sessionData, {
    buyInFallback: buyIn,
    playerIds: scoreSnap.docs.map((d) => d.id),
  });
  const invariantResult = moneyEngineV1
    ? checkTableChipInvariant(snapshot, storedBaseline)
    : { ok: false, actual: 0, expected: 0, errors: ["legacy_session_no_money_engine"] };

  const bankrollSum = Object.values(snapshot.bankrolls).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0,
  );
  const carryOverPot = Math.max(0, Number(sessionData.carryOverPot) || 0);
  const canonicalTotal = bankrollSum + postedAnteTotal + carryOverPot;
  const expectedTotal = expectedChipTotalFromBaseline(storedBaseline);
  const delta = canonicalTotal - expectedTotal;

  const divergenceEvent =
    moneyEngineV1 && !invariantResult.ok
      ? findFirstDivergentEvent(moneyEvents, buyIn)
      : null;

  const recommendedRecoveryClassification = classifyRecovery({
    orphans: positiveBalanceOrphanRows,
    invariantOk: invariantResult.ok,
    moneyEngineV1,
    settlementExists: matchingSettlementEvents.length > 0,
    handCount: sessionData.handCount || 0,
    invariantDelta: delta,
  });

  console.info(
    "[nbl-ledger-verify]",
    JSON.stringify({
      roomId,
      sessionId,
      actorId,
      invariantOk: invariantResult.ok,
      delta,
      classification: recommendedRecoveryClassification,
      orphanCount: positiveBalanceOrphanRows.length,
    }),
  );

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    roomId,
    sessionId,
    sessionStatus: sessionData.status ?? "unknown",
    handCount: sessionData.handCount || 0,
    currentHand: {
      phase: currentHand?.phase ?? null,
      handNumber: currentHand?.handNumber ?? null,
      participantCount: (currentHand?.participantIds ?? []).length,
      postedAnteTotal,
    },
    rosterCount: rosterIds.size,
    scoreDocumentCount: scoreSnap.size,
    positiveBalanceOrphanRows,
    settlementAction: {
      expected: expectedSettlementAction,
      exists: matchingSettlementEvents.length > 0,
      matchingEventCount: matchingSettlementEvents.length,
    },
    baseline: {
      storedMatchesRecomputed,
      expectedTotal,
    },
    chips: {
      bankrollSum,
      postedAnteSum: postedAnteTotal,
      carryOverPot,
      canonicalTotal,
    },
    invariant: {
      ok: invariantResult.ok,
      delta,
      label: "verify:current-state",
      errors: invariantResult.errors ?? [],
    },
    divergence: {
      firstDivergentEvent: divergenceEvent,
    },
    recommendedRecoveryClassification,
    cardsExposed: false,
  };
}
