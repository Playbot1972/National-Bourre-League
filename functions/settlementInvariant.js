/**
 * Settlement table invariant checks — structured HttpsError mapping for record-hand.
 */
import { HttpsError } from "firebase-functions/v2/https";
import {
  checkTableChipInvariant,
  baselineFromSessionDoc,
  buildSessionChipSnapshot,
  isMoneyEngineV1,
} from "./vendor/money-persistence.js";

function settlementActionId(sessionId, handNumber) {
  return `settle:${sessionId}:${handNumber}`;
}

function logInvariantCheck(ctx, result) {
  const payload = {
    ok: result.ok,
    label: ctx.label,
    roomId: ctx.roomId ?? null,
    sessionId: ctx.sessionId ?? null,
    handId: ctx.handId ?? null,
    actual: result.actual,
    expected: result.expected,
    bankrollSum: result.bankrollSum,
    potSum: result.potSum,
    carryPot: result.carryPot,
    errors: result.errors,
  };
  if (result.ok) {
    console.info("[nbl-table-invariant]", payload);
    return;
  }
  console.error("[nbl-table-invariant]", payload);
}

/**
 * Non-throwing settlement invariant check (v1 money sessions).
 * @returns {{ ok: boolean, result: import('./vendor/money-engine.js').TableInvariantResult | null, sessionId: string, handNumber: number, actionId: string, label: string }}
 */
export function checkSettlementTableInvariant({
  roomId,
  sessionId,
  sessionData,
  scoreById,
  label,
  handId = null,
  existingEvents = [],
  buyIn = 100,
  playerIds = null,
}) {
  if (!isMoneyEngineV1(sessionData)) {
    return { ok: true, result: null, sessionId, handNumber: handId ?? 0, actionId: "", label };
  }
  const handNumber = Number(handId) || 0;
  const actionId = settlementActionId(sessionId, handNumber);
  const baseline = baselineFromSessionDoc(sessionData.moneyLedgerBaseline, existingEvents);
  const snapshot = buildSessionChipSnapshot(scoreById, sessionData, {
    buyInFallback: buyIn,
    playerIds,
  });
  const result = checkTableChipInvariant(snapshot, baseline);
  const ctx = { roomId, sessionId, handId: handNumber, label };
  logInvariantCheck(ctx, result);
  return { ok: result.ok, result, sessionId, handNumber, actionId, label };
}

/**
 * Pre-commit fail-closed — zero writes preserved (caller must run before batch.commit).
 */
export function throwPreCommitInvariantMismatch(checkOutcome) {
  if (checkOutcome.ok) return;
  const { result, sessionId, handNumber, actionId, label } = checkOutcome;
  console.error(
    "[nbl-record-hand-blocked]",
    JSON.stringify({
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
      sessionId,
      handNumber,
      actionId,
      label,
      expected: result.expected,
      actual: result.actual,
      delta: result.actual - result.expected,
      committed: false,
    }),
  );
  throw new HttpsError(
    "failed-precondition",
    "Table ledger blocked — settlement was not applied.",
    {
      code: "TABLE_CHIP_INVARIANT_MISMATCH",
      sessionId,
      handNumber,
      actionId,
      label,
      expected: result.expected,
      actual: result.actual,
      delta: result.actual - result.expected,
      bankrollSum: result.bankrollSum,
      potSum: result.potSum,
      carryPot: result.carryPot,
      committed: false,
    },
  );
}

/**
 * Post-commit drift — settlement already committed; distinct code and logging.
 */
export function throwPostCommitInvariantDrift(checkOutcome) {
  if (checkOutcome.ok) return;
  const { result, sessionId, handNumber, actionId, label } = checkOutcome;
  console.error(
    "POST_COMMIT_INVARIANT_DRIFT",
    JSON.stringify({
      code: "POST_COMMIT_INVARIANT_DRIFT",
      sessionId,
      handNumber,
      actionId,
      label,
      expected: result.expected,
      actual: result.actual,
      delta: result.actual - result.expected,
      committed: true,
    }),
  );
  throw new HttpsError(
    "failed-precondition",
    "The hand was recorded, but this table requires an accounting review. Do not retry settlement.",
    {
      code: "POST_COMMIT_INVARIANT_DRIFT",
      committed: true,
      sessionId,
      handNumber,
      actionId,
      label,
      expected: result.expected,
      actual: result.actual,
      delta: result.actual - result.expected,
      bankrollSum: result.bankrollSum,
      potSum: result.potSum,
      carryPot: result.carryPot,
    },
  );
}
