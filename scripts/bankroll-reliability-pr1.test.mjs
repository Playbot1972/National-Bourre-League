/**
 * PR1 bankroll reliability — money authority, fail-closed invariant helpers,
 * cash-out/removal ledger, solo-win/sole-survivor paths, pot UI metrics.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  runV1CashOut,
  runV1SoloWinSettlement,
  runV1SoleSurvivorEnd,
  baselineFromSessionDoc,
  initialSessionBaseline,
  buildSessionChipSnapshot,
  assertTableChipInvariantFailClosed,
  checkTableChipInvariant,
} from "../docs/money-persistence.js";
import { MONEY_ENGINE_VERSION, processBuyIn } from "../docs/money-engine.js";

const BUY_IN = 1000;
const ANTE = 50;

/** Six-seat / 6000 baseline — conserved mid-hand snapshot. */
const SIX_SEAT_IDS = ["p1", "p2", "p3", "p4", "p5", "p6"];
const SIX_SEAT_BANKROLLS = {
  p1: 950,
  p2: 950,
  p3: 950,
  p4: 950,
  p5: 950,
  p6: 950,
};
const SIX_SEAT_POSTED = {
  p1: 50,
  p2: 50,
  p3: 50,
  p4: 50,
  p5: 50,
  p6: 50,
};

/** Incident-derived drift fixture (3250 on table vs 6000 baseline). */
const DRIFT_BANKROLLS = {
  p1: 2400,
  p2: 150,
  p3: 550,
  p4: 0,
  p5: 0,
  p6: 0,
};

function scoreByIdFromBankrolls(bankrolls, buyIn = BUY_IN) {
  return Object.fromEntries(
    Object.entries(bankrolls).map(([pid, bankroll]) => [
      pid,
      { playerId: pid, bankroll, net: bankroll - buyIn },
    ]),
  );
}

function sessionSnapshot(scoreById, carryOverPot, postedAntes) {
  return buildSessionChipSnapshot(scoreById, {
    carryOverPot,
    currentHand: { postedAntes },
  }, {
    buyInFallback: BUY_IN,
    playerIds: Object.keys(scoreById),
  });
}

describe("bankroll reliability PR1", () => {
  it("six-seat 6000 baseline fixture satisfies canonical invariant when conserved", () => {
    const baseline = initialSessionBaseline(6, BUY_IN);
    const scoreById = scoreByIdFromBankrolls(SIX_SEAT_BANKROLLS);
    const snapshot = sessionSnapshot(scoreById, 0, SIX_SEAT_POSTED);
    const result = checkTableChipInvariant(snapshot, baseline);
    assert.equal(result.ok, true, result.errors.join("; "));
    assert.equal(result.expected, 6000);
    assert.equal(result.actual, 6000);
  });

  it("incident drift fixture fails canonical invariant (fail-closed path)", () => {
    const baseline = initialSessionBaseline(6, BUY_IN);
    const scoreById = scoreByIdFromBankrolls(DRIFT_BANKROLLS);
    const snapshot = sessionSnapshot(scoreById, 150, SIX_SEAT_POSTED);
    const result = checkTableChipInvariant(snapshot, baseline);
    assert.equal(result.ok, false);
    assert.throws(
      () =>
        assertTableChipInvariantFailClosed(snapshot, baseline, {
          label: "incident-drift",
          sessionId: "s",
        }),
      /fail-closed/,
    );
  });

  it("assertTableChipInvariantFailClosed throws on drift", () => {
    const baseline = initialSessionBaseline(2, BUY_IN);
    const scoreById = scoreByIdFromBankrolls({ a: 500, b: 500 });
    const snapshot = sessionSnapshot(scoreById, 0, {});
    assert.throws(
      () =>
        assertTableChipInvariantFailClosed(snapshot, baseline, {
          label: "test-fail-closed",
          sessionId: "s",
        }),
      /fail-closed/,
    );
  });

  it("runV1CashOut emits balanced CASH_OUT_APPLIED and lowers table total", () => {
    const sessionId = "sess_rm";
    const playerId = "guest";
    const baseline = initialSessionBaseline(2, BUY_IN);
    const ledger = {
      version: MONEY_ENGINE_VERSION,
      buyInFallback: BUY_IN,
      bankrolls: { host: BUY_IN, [playerId]: 250 },
      nets: {},
      carryOverPot: 0,
      postedAntes: {},
      scoreFlags: {},
      sequence: 0,
    };
    const cashOut = runV1CashOut({
      sessionId,
      playerId,
      amount: 250,
      existingEvents: [],
      ledger,
    });
    assert.equal(cashOut.newEvents.length, 1);
    assert.equal(cashOut.newEvents[0].type, "CASH_OUT_APPLIED");
    assert.equal(cashOut.newEvents[0].amount, 250);
    assert.equal(cashOut.newBankrolls[playerId], 0);
    assert.equal(cashOut.invariants.ok, true);
    assert.equal(baseline.tableStartingTotal, 2000);
  });

  it("runV1SoloWinSettlement uses canonical settlement ledger events", () => {
    const sessionId = "solo_sess";
    const winnerId = "w1";
    const buyInEvents = processBuyIn({
      actionId: `session:buyin:${sessionId}`,
      playerIds: ["w1", "w2"],
      buyInAmount: BUY_IN,
    });
    const scoreById = scoreByIdFromBankrolls({ w1: BUY_IN, w2: BUY_IN });
    const result = runV1SoloWinSettlement({
      sessionId,
      handNumber: 1,
      winnerId,
      carryIn: 100,
      postedAntes: {},
      scoreById,
      buyInFallback: BUY_IN,
      participants: [winnerId, "w2"],
      sessionStake: ANTE,
      existingEvents: buyInEvents.newEvents,
    });
    assert.ok(result.newEvents.length > 0);
    assert.ok(result.newEvents.some((e) => e.type === "WINNER_CREDITED"));
    assert.ok(result.settlement.bankrolls[winnerId] > BUY_IN);
    assert.equal(result.invariants.ok, true);
  });

  it("runV1SoleSurvivorEnd awards pot via WINNER_CREDITED", () => {
    const sessionId = "sole_sess";
    const winnerId = "w1";
    const scoreById = scoreByIdFromBankrolls({ w1: 200, w2: 0 });
    const ledger = {
      version: MONEY_ENGINE_VERSION,
      buyInFallback: BUY_IN,
      bankrolls: { w1: 200, w2: 0 },
      nets: { w1: -800, w2: -1000 },
      carryOverPot: 80,
      postedAntes: { w1: 20, w2: 20 },
      scoreFlags: {},
      sequence: 0,
    };
    const result = runV1SoleSurvivorEnd({
      sessionId,
      winnerId,
      carryIn: 80,
      postedAntes: { w1: 20, w2: 20 },
      scoreById,
      buyInFallback: BUY_IN,
      sortedPlayerIds: ["w1", "w2"],
      existingEvents: [],
      ledger,
    });
    assert.equal(result.potAwarded, 120);
    assert.equal(result.newEvents.some((e) => e.type === "WINNER_CREDITED"), true);
    assert.equal(result.newBankrolls[winnerId], 320);
    assert.equal(result.invariants.ok, true);
  });

  it("firestore.rules block client moneyEvents writes", () => {
    const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
    assert.match(rules, /match \/moneyEvents\/\{eventId\}/);
    assert.match(rules, /allow write: if false/);
    assert.match(rules, /sessionMoneyFieldsChanged/);
    assert.match(rules, /scoreLedgerFieldsChanged/);
  });
});
