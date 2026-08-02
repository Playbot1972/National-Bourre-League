/**
 * Targeted regression tests for ledger audit failure modes (production engine path).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LedgerAuditSession, tricksWithWinner } from "./ledgerAudit";
import {
  computeCarryForAnte,
  checkTableChipInvariant,
  buildTableChipSnapshot,
  ledgerPostedPotSum,
  expectedChipTotalFromBaseline,
} from "./tableInvariant";
import { initialSessionBaseline } from "./sessionLedger";
import { processAnte, processRebuy } from "./processor";
import { emptyLedgerState } from "./replay";
import type { ScoreById } from "./types";

const BUY_IN = 100;
const ANTE = 20;

function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

describe("ledger regression — idle player bankrolls preserved", () => {
  it("subset hand does not zero idle seats", () => {
    const players = ids(3);
    const session = new LedgerAuditSession({
      playerIds: players,
      buyInAmount: BUY_IN,
      sessionStake: ANTE,
    });
    session.startSession();
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: ["p0", "p1"],
      tricksByPlayer: tricksWithWinner(["p0", "p1"], "p0"),
    });
    assert.equal(session.seatedBankroll("p2"), BUY_IN);
    session.assertInvariant("idle seat after subset hand");
  });
});

describe("ledger regression — carry/posted pot snapshots", () => {
  it("computeCarryForAnte folds pending posted antes", () => {
    assert.equal(computeCarryForAnte(40, { p0: 5, p1: 5 }), 50);
  });

  it("funding leaves carry/posted visible in chip total", () => {
    const players = ids(3);
    const session = new LedgerAuditSession({
      playerIds: players,
      buyInAmount: BUY_IN,
      sessionStake: ANTE,
    });
    session.startSession();
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0"),
    });
    const posted = ledgerPostedPotSum(session.ledger.postedAntes);
    const carry = session.carryOverPot;
    const bankrollSum = players.reduce((s, pid) => s + session.seatedBankroll(pid), 0);
    assert.equal(bankrollSum + posted + carry, BUY_IN * 3);
  });
});

describe("ledger regression — pending postedAntes on next ante", () => {
  it("processAnte receives carryForAnte including pending posted", () => {
    const players = ids(3);
    const scoreById: ScoreById = Object.fromEntries(
      players.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]),
    );
    const ledger = emptyLedgerState(BUY_IN);
    ledger.bankrolls = { p0: BUY_IN, p1: BUY_IN, p2: BUY_IN };
    ledger.postedAntes = { p0: 10, p1: 10 };
    ledger.carryOverPot = 30;
    const carryForAnte = computeCarryForAnte(ledger.carryOverPot, ledger.postedAntes);
    const ante = processAnte({
      actionId: "ante:test",
      handId: "2",
      carryOverPot: carryForAnte,
      participantIds: players,
      scoreById,
      sessionStake: ANTE,
      buyInFallback: BUY_IN,
      ledger,
    });
    assert.ok(ante.newEvents.length > 0);
    assert.ok(ledgerPostedPotSum(ante.postedAntes) > 0);
  });
});

describe("ledger regression — bourré bust mint invariant", () => {
  it("bourré with bust mint preserves table chip total via netBourreMint", () => {
    const players = ids(3);
    const session = new LedgerAuditSession({
      playerIds: players,
      buyInAmount: BUY_IN,
      sessionStake: ANTE,
    });
    session.startSession();
    session.setSeatedBankrolls({ p0: 200, p1: 95, p2: 5 });
    session.reconcileChipDrift("bourre preset stacks");
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0", ["p2"]),
    });
    session.reconcileChipDrift("bourre mint hand");
    session.assertInvariant("bourre bust mint");
    assert.ok((session.context.netBourreMint ?? 0) >= 0);
  });
});

describe("ledger regression — rebuy with carry/posted preserved", () => {
  it("mid-session rebuy does not drop inter-hand pot chips", () => {
    const players = ids(3);
    const session = new LedgerAuditSession({
      playerIds: players,
      buyInAmount: BUY_IN,
      sessionStake: 5,
    });
    session.startSession();
    for (let i = 0; i < 3; i += 1) {
      session.playHand({
        handId: `h${i}`,
        winners: ["p0"],
        participants: players,
        tricksByPlayer: tricksWithWinner(players, "p0", i === 2 ? ["p2"] : []),
      });
      session.reconcileChipDrift(`hand ${i}`);
    }
    session.setSeatedBankrolls({
      p0: session.seatedBankroll("p0"),
      p1: session.seatedBankroll("p1"),
      p2: 0,
    });
    session.rebuy("p2");
    assert.ok(session.seatedBankroll("p2") >= BUY_IN);
    session.assertInvariant("rebuy with carry/posted");
  });

  it("production-style rebuy passes ledger carry/posted into processRebuy", () => {
    const ledger = emptyLedgerState(BUY_IN);
    ledger.bankrolls = { p0: 260, p1: 30, p2: 0 };
    ledger.carryOverPot = 10;
    ledger.postedAntes = { p0: 5, p1: 5 };
    const rebuy = processRebuy({
      actionId: "rebuy:p2",
      playerId: "p2",
      buyInAmount: BUY_IN,
      existingEvents: [],
      ledger: { ...ledger },
    });
    assert.equal(rebuy.newBankrolls.p2, BUY_IN);
    assert.equal(rebuy.newEvents[0]?.amount, BUY_IN);
  });
});

describe("ledger regression — production runtime invariant helper", () => {
  it("checkTableChipInvariant ok for conserved session", () => {
    const baseline = initialSessionBaseline(3, BUY_IN);
    const snapshot = buildTableChipSnapshot(
      Object.fromEntries(ids(3).map((pid) => [pid, { bankroll: BUY_IN }])),
      { carryOverPot: 0, postedAntes: {} },
    );
    const result = checkTableChipInvariant(snapshot, baseline);
    assert.equal(result.ok, true);
    assert.equal(result.actual, 300);
  });
});
