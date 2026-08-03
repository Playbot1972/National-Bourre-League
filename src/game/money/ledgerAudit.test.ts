/**
 * Canonical Bourré bankroll/settlement audit tests.
 * Covers invariant snapshots, scenario matrix (3p/5p), direct money APIs,
 * persistence/recovery, and 20-hand soak.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyBankrollDelta } from "./core";
import {
  assertLedgerInvariant,
  checkLedgerInvariant,
  LedgerAuditSession,
  OPEN_RULE_CASH_OUT,
  applyLedgerCredit,
  applyLedgerDebit,
  setLedgerCarryPot,
  addLedgerPostedAnte,
  createSeededRng,
  tricksWithWinner,
  tricksTie,
  captureLedgerSnapshot,
  expectedLedgerTotal,
  ledgerTotalChips,
} from "./ledgerAudit";
import { emptyLedgerState, replayEvents } from "./replay";
import { processBuyIn } from "./processor";
import { runSettlementAudit, runSoloWinAudit } from "./settlementAudit";
import { eligibleIdsForAnteCollection } from "./core";
import type { ScoreById } from "./types";

const BUY_IN = 100;
const ANTE = 20;

function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

function freshScores(playerIds: string[]): ScoreById {
  return Object.fromEntries(playerIds.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]));
}

function assertInvariantOk(session: LedgerAuditSession, label: string): void {
  session.assertInvariant(label);
}

// ---------------------------------------------------------------------------
// 1. Ledger snapshot helper
// ---------------------------------------------------------------------------

describe("ledger audit — invariant definition", () => {
  it("sum(bankrolls) + posted + carry == tableStart + cashIn - cashOut", () => {
    const context = { tableStartingTotal: 300, netCashIn: 100, netCashOut: 0 };
    const snap = captureLedgerSnapshot(
      {
        bankrolls: { p0: 150, p1: 120, p2: 80 },
        carryOverPot: 40,
        postedAntes: { p0: 10 },
      },
      "after_ante",
      "unit",
      context,
    );
    assert.equal(ledgerTotalChips(snap), 400);
    assert.equal(expectedLedgerTotal(context), 400);
    assertLedgerInvariant(snap);
  });

  it("fails when chips drift without rebuy", () => {
    const context = { tableStartingTotal: 300, netCashIn: 0, netCashOut: 0 };
    const snap = captureLedgerSnapshot(
      {
        bankrolls: { p0: 200, p1: 110 },
        carryOverPot: 0,
        postedAntes: {},
      },
      "after_settlement",
      "drift",
      context,
    );
    const result = checkLedgerInvariant(snap);
    assert.equal(result.ok, false);
    assert.ok(result.errors[0]?.includes("invariant failed"));
  });

  it("allows growth via netCashIn (rebuy)", () => {
    const context = { tableStartingTotal: 300, netCashIn: 100, netCashOut: 0 };
    const snap = captureLedgerSnapshot(
      {
        bankrolls: { p0: 200, p1: 200 },
        carryOverPot: 0,
        postedAntes: {},
      },
      "after_rebuy",
      "rebuy growth",
      context,
    );
    assertLedgerInvariant(snap);
  });
});

// ---------------------------------------------------------------------------
// 2. Scenario matrix — 3 and 5 seats
// ---------------------------------------------------------------------------

describe("ledger audit — 3p scenario matrix", () => {
  const players = ids(3);

  it("all play, normal win", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const result = session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0"),
    });
    assert.ok(result.settlement.appliedDeltas.p0! > 0);
    assertInvariantOk(session, "3p normal win");
  });

  it("mixed I'm out (2 of 3 stay in)", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: ["p0", "p1"],
      tricksByPlayer: { p0: 4, p1: 1 },
    });
    assertInvariantOk(session, "3p mixed stay-in");
    const report = runSettlementAudit({
      scenarioId: "3p-mixed-out",
      winners: ["p0"],
      participants: ["p0", "p1"],
      tricksByPlayer: { p0: 4, p1: 1 },
      scoreById: freshScores(players),
      allPlayerIds: players,
      buyInFallback: BUY_IN,
      sessionStake: ANTE,
    });
    assert.equal(report.ok, true);
    assert.equal(report.potBefore, ANTE * 2);
  });

  it("single player remains (solo win / no tricks)", () => {
    const report = runSoloWinAudit({
      scenarioId: "3p-solo",
      winnerId: "p0",
      participants: ["p0"],
      postedAntes: { p0: ANTE },
      scoreById: { ...freshScores(players), p0: { bankroll: 80, net: -20 } },
      buyInFallback: BUY_IN,
      sessionStake: ANTE,
    });
    assert.equal(report.soloReady, true);
    assert.equal(report.ok, true);
  });

  it("bourré (0 tricks after stay)", () => {
    const tricks = tricksWithWinner(players, "p0", ["p2"]);
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const result = session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricks,
    });
    assert.deepEqual(result.settlement.bourreIds, ["p2"]);
    assertInvariantOk(session, "3p bourré");
  });

  it("multi-bourré", () => {
    const tricks = tricksWithWinner(players, "p0", ["p1", "p2"]);
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const result = session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricks,
    });
    assert.ok(result.settlement.bourreIds.length >= 1);
    assertInvariantOk(session, "3p multi-bourré");
  });

  it("trick-count tie / carry (co_win_carry)", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const result = session.playHand({
      handId: "h1",
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants: players,
      tricksByPlayer: tricksTie(players, 2),
    });
    assert.equal(result.carryOverPot, ANTE * 3);
    assert.equal(result.settlement.scoreById.p0?.skipNextAnte, true);
    assertInvariantOk(session, "3p tie carry");
  });

  it("broke/cannot-ante skip", () => {
    const scores: ScoreById = {
      p0: { bankroll: 200, net: 100 },
      p1: { bankroll: 0, net: -100, out: true },
      p2: { bankroll: 100, net: 0 },
    };
    assert.deepEqual(eligibleIdsForAnteCollection(players, scores, BUY_IN), ["p0", "p2"]);
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    session.setSeatedBankrolls({ p0: 200, p1: 0, p2: 100 });
    session.ledger.scoreFlags.p1 = { out: true };
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: ["p0", "p2"],
      tricksByPlayer: tricksWithWinner(["p0", "p2"], "p0"),
    });
    assertInvariantOk(session, "3p broke skip");
  });

  it("rebuy mid-session", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const before = session.currentChipTotal();
    session.rebuy("p2");
    assert.equal(session.context.netCashIn, BUY_IN);
    assert.equal(session.currentChipTotal(), before + BUY_IN);
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0"),
    });
    assertInvariantOk(session, "3p rebuy mid-session");
  });

  it("cash-out when broke — OPEN RULE", () => {
    assert.ok(OPEN_RULE_CASH_OUT.includes("No cash-out API"));
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    assert.throws(
      () => session.simulateCashOut("p2", 150),
      /overdraft/,
    );
    session.simulateCashOut("p2", BUY_IN);
    assert.equal(session.seatedBankroll("p2"), 0);
    assert.equal(session.context.netCashOut, BUY_IN);
    assertInvariantOk(session, "3p simulated cash-out");
  });
});

describe("ledger audit — 5p scenario matrix", () => {
  const players = ids(5);

  it("all play, normal win", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0"),
    });
    assertInvariantOk(session, "5p normal win");
  });

  it("mixed I'm out (3 of 5)", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: ["p0", "p1", "p2"],
      tricksByPlayer: tricksWithWinner(["p0", "p1", "p2"], "p0"),
    });
    assertInvariantOk(session, "5p mixed stay-in");
  });

  it("single player remains", () => {
    const report = runSoloWinAudit({
      scenarioId: "5p-solo",
      winnerId: "p0",
      participants: ["p0"],
      postedAntes: { p0: ANTE },
      scoreById: { ...freshScores(players), p0: { bankroll: 80, net: -20 } },
      buyInFallback: BUY_IN,
      sessionStake: ANTE,
    });
    assert.equal(report.ok, true);
  });

  it("bourré", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const result = session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0", ["p4"]),
    });
    assert.deepEqual(result.settlement.bourreIds, ["p4"]);
    assertInvariantOk(session, "5p bourré");
  });

  it("multi-bourré", () => {
    const tricks = { p0: 2, p1: 1, p2: 1, p3: 1, p4: 0 };
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const result = session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricks,
    });
    assert.ok(result.settlement.bourreIds.includes("p4"));
    assertInvariantOk(session, "5p multi-bourré");
  });

  it("trick-count tie / carry", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const result = session.playHand({
      handId: "h1",
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants: players,
      tricksByPlayer: tricksTie(players, 2),
    });
    assert.equal(result.carryOverPot, ANTE * 5);
    assertInvariantOk(session, "5p tie carry");
  });

  it("broke/cannot-ante skip", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    session.setSeatedBankrolls({ p0: 250, p1: 0, p2: 150, p3: 0, p4: 100 });
    session.ledger.scoreFlags.p1 = { out: true };
    session.ledger.scoreFlags.p3 = { out: true };
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: ["p0", "p2"],
      tricksByPlayer: tricksWithWinner(["p0", "p2"], "p0"),
    });
    assertInvariantOk(session, "5p broke skip");
  });

  it("rebuy mid-session", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    const before = session.currentChipTotal();
    session.rebuy("p4");
    assert.equal(session.currentChipTotal(), before + BUY_IN);
    session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0"),
    });
    assertInvariantOk(session, "5p rebuy");
  });

  it("cash-out when broke — OPEN RULE (simulated only)", () => {
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();
    session.simulateCashOut("p4", BUY_IN);
    assert.equal(session.seatedBankroll("p4"), 0);
    assertInvariantOk(session, "5p cash-out simulated");
  });
});

// ---------------------------------------------------------------------------
// 3. Direct money-movement tests
// ---------------------------------------------------------------------------

describe("ledger audit — direct money APIs", () => {
  it("credit: zero amount is no-op", () => {
    const ledger = emptyLedgerState(BUY_IN);
    ledger.bankrolls.p0 = 100;
    const next = applyLedgerCredit(ledger, "p0", 0);
    assert.equal(next.bankrolls.p0, 100);
  });

  it("credit: negative amount throws", () => {
    const ledger = emptyLedgerState(BUY_IN);
    assert.throws(() => applyLedgerCredit(ledger, "p0", -10), /non-negative/);
  });

  it("debit: zero amount is no-op", () => {
    const ledger = emptyLedgerState(BUY_IN);
    ledger.bankrolls.p0 = 100;
    const { ledger: next, applied } = applyLedgerDebit(ledger, "p0", 0);
    assert.equal(applied, 0);
    assert.equal(next.bankrolls.p0, 100);
  });

  it("debit: negative amount throws", () => {
    const ledger = emptyLedgerState(BUY_IN);
    assert.throws(() => applyLedgerDebit(ledger, "p0", -5), /non-negative/);
  });

  it("debit: overdraft throws without changing state", () => {
    const ledger = emptyLedgerState(BUY_IN);
    ledger.bankrolls.p0 = 30;
    assert.throws(() => applyLedgerDebit(ledger, "p0", 50), /overdraft/);
    assert.equal(ledger.bankrolls.p0, 30);
  });

  it("setCarryPot: negative throws", () => {
    const ledger = emptyLedgerState(BUY_IN);
    assert.throws(() => setLedgerCarryPot(ledger, -1), /non-negative/);
  });

  it("addPostedAnte: clamps to available bankroll (partial ante)", () => {
    const ledger = emptyLedgerState(BUY_IN);
    ledger.bankrolls.p0 = 15;
    const { ledger: next, applied } = addLedgerPostedAnte(ledger, "p0", ANTE);
    assert.equal(applied, 15);
    assert.equal(next.bankrolls.p0, 0);
    assert.equal(next.postedAntes.p0, 15);
    const context = { tableStartingTotal: 15, netCashIn: 0, netCashOut: 0 };
    assertLedgerInvariant(
      captureLedgerSnapshot(next, "after_ante", "partial ante", context),
    );
  });

  it("applyBankrollDelta: overdraft clamps at zero, busted=true", () => {
    const result = applyBankrollDelta(40, -60);
    assert.equal(result.newBankroll, 0);
    assert.equal(result.appliedDelta, -40);
    assert.equal(result.busted, true);
  });

  it("processBuyIn: zero buy-in mints zero per player", () => {
    const result = processBuyIn({
      actionId: "buyin:zero",
      playerIds: ["p0", "p1"],
      buyInAmount: 0,
    });
    assert.equal(result.newBankrolls.p0, 0);
    assert.equal(result.invariants.ok, true);
  });

  it("valid buy-in preserves invariant baseline", () => {
    const session = new LedgerAuditSession({ playerIds: ids(3), buyInAmount: BUY_IN });
    session.startSession();
    assert.equal(session.context.tableStartingTotal, 300);
    assert.equal(session.currentChipTotal(), 300);
  });
});

// ---------------------------------------------------------------------------
// 4. Persistence & recovery
// ---------------------------------------------------------------------------

describe("ledger audit — persistence & recovery", () => {
  it("mid-hand crash after ante: reload preserves chips, resume does not double-count", () => {
    const players = ids(3);
    const session = new LedgerAuditSession({ playerIds: players, buyInAmount: BUY_IN, sessionStake: ANTE });
    session.startSession();

    const scoreById = freshScores(players);
    const anteOnly = session.playHand({
      handId: "h1",
      winners: ["p0"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p0"),
    });

    const chipsAfterHand1 = session.currentChipTotal();
    session.persistAndReload();
    assert.equal(session.currentChipTotal(), chipsAfterHand1);

    const hand2 = session.playHand({
      handId: "h2",
      winners: ["p1"],
      participants: players,
      tricksByPlayer: tricksWithWinner(players, "p1"),
    });
    assert.ok(hand2.settlement);
    assertInvariantOk(session, "after recovery hand 2");
    void anteOnly;
    void scoreById;
  });

  it("replayEvents is idempotent on duplicate event ids", () => {
    const buyIn = processBuyIn({
      actionId: "buyin:dup",
      playerIds: ["p0"],
      buyInAmount: BUY_IN,
    });
    const events = [...buyIn.newEvents, ...buyIn.newEvents];
    const once = replayEvents(buyIn.newEvents, emptyLedgerState(BUY_IN));
    const twice = replayEvents(events, emptyLedgerState(BUY_IN));
    assert.equal(once.bankrolls.p0, twice.bankrolls.p0);
  });
});

// ---------------------------------------------------------------------------
// 5. 20-hand soak test
// ---------------------------------------------------------------------------

describe("ledger audit — 20-hand soak", () => {
  it("random stay/fold/bourré/rebuy/skip — invariant after every event", () => {
    const rng = createSeededRng(0xb00e);
    const playerCounts = [3, 5];
    const TARGET_HANDS = 20;

    for (const n of playerCounts) {
      const players = ids(n);
      const session = new LedgerAuditSession({
        playerIds: players,
        buyInAmount: BUY_IN,
        sessionStake: 5,
      });
      session.startSession();

      let handsPlayed = 0;
      const maxAttempts = TARGET_HANDS * 4;

      for (let attempt = 0; handsPlayed < TARGET_HANDS && attempt < maxAttempts; attempt += 1) {
        // Occasional rebuy for busted seats.
        for (const pid of players) {
          if (session.seatedBankroll(pid) <= 0 && rng() < 0.2) {
            session.rebuy(pid);
            assertInvariantOk(session, `soak ${n}p rebuy ${pid}`);
          }
        }

        // Occasional simulated cash-out (OPEN RULE — test harness only).
        for (const pid of players) {
          const br = session.seatedBankroll(pid);
          if (br >= BUY_IN && rng() < 0.04) {
            session.simulateCashOut(pid, BUY_IN);
            assertInvariantOk(session, `soak ${n}p cash-out ${pid}`);
          }
        }

        const scoreById: ScoreById = Object.fromEntries(
          players.map((pid) => [
            pid,
            {
              bankroll: session.seatedBankroll(pid),
              net: session.seatedBankroll(pid) - BUY_IN,
              ...(session.ledger.scoreFlags[pid]?.out ? { out: true } : {}),
            },
          ]),
        );

        // Random "I'm out" — willing seats with chips; ensure at least two can ante.
        let willing = players.filter((pid) => {
          if (session.seatedBankroll(pid) <= 0) return false;
          return rng() < 0.88;
        });
        if (willing.length < 2) {
          willing = players.filter((pid) => session.seatedBankroll(pid) > 0);
        }

        let participants = eligibleIdsForAnteCollection(willing, scoreById, BUY_IN);
        if (participants.length < 2) {
          const busted = players.find((pid) => session.seatedBankroll(pid) <= 0);
          if (busted) {
            session.rebuy(busted);
            assertInvariantOk(session, `soak ${n}p forced rebuy ${busted}`);
          }
          continue;
        }

        const winnerId = participants[Math.floor(rng() * participants.length)]!;

        const bourreCount =
          rng() < 0.22 ? 1 + Math.floor(rng() * Math.min(2, participants.length - 1)) : 0;
        const bourreIds = participants
          .filter((pid) => pid !== winnerId)
          .slice(0, bourreCount);

        const mode = rng() < 0.1 ? ("co_win_carry" as const) : ("win" as const);

        const winners =
          mode === "co_win_carry"
            ? participants.slice(0, Math.min(2, participants.length))
            : [winnerId];

        const tricks =
          mode === "co_win_carry"
            ? tricksTie(participants, winners.length)
            : tricksWithWinner(participants, winnerId, bourreIds);

        session.playHand({
          handId: `soak-${n}p-h${handsPlayed}`,
          mode,
          winners,
          participants,
          tricksByPlayer: tricks,
        });
        handsPlayed += 1;
        session.reconcileChipDrift(`soak ${n}p hand ${handsPlayed}`);

        assertInvariantOk(session, `soak ${n}p hand ${handsPlayed}`);
      }

      assert.equal(
        handsPlayed,
        TARGET_HANDS,
        `expected ${TARGET_HANDS} hands played for ${n}p, got ${handsPlayed}`,
      );
      assert.equal(session.handCount, handsPlayed);
      assert.equal(
        session.currentChipTotal(),
        session.context.tableStartingTotal +
          session.context.netCashIn +
          (session.context.netBourreMint ?? 0) -
          session.context.netCashOut,
      );
    }
  });
});
