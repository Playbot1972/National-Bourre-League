/**
 * End-to-end bankroll/settlement audit matrix — 2–8 players.
 * Each scenario reconciles: start + antes + payouts + carry + funding.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ScoreById } from "./types";
import {
  formatSettlementAuditTrace,
  runSettlementAudit,
  runSoloWinAudit,
} from "./settlementAudit";
import { processBuyIn } from "./index";

const BUY_IN = 100;
const ANTE = 20;

function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

function freshScores(playerIds: string[]): ScoreById {
  return Object.fromEntries(playerIds.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]));
}

function tricksClearWinner(n: number): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  if (n === 2) {
    t.p0 = 4;
    t.p1 = 1;
    return t;
  }
  for (let i = 1; i < n; i += 1) t[`p${i}`] = 1;
  t.p0 = 5 - (n - 1);
  return t;
}

function tricksTieLeaders(n: number, leaders = 2): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  const per = Math.floor(5 / leaders);
  let rem = 5 - per * leaders;
  for (let i = 0; i < leaders; i += 1) {
    t[`p${i}`] = per + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
  }
  return t;
}

function tricksSingleBourre(n: number): Record<string, number> {
  const t = tricksClearWinner(n);
  const bourrePid = `p${n - 1}`;
  const winnerGain = t[bourrePid] ?? 0;
  t[bourrePid] = 0;
  t.p0 = (t.p0 ?? 0) + winnerGain;
  return t;
}

function tricksMultiBourre(n: number): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  t.p0 = Math.max(2, 5 - (n - 2));
  for (let i = 1; i < n - 1; i += 1) t[`p${i}`] = 1;
  return t;
}

function assertAuditOk(report: ReturnType<typeof runSettlementAudit>, label: string): void {
  if (!report.ok) {
    console.error(formatSettlementAuditTrace(report));
  }
  assert.equal(report.ok, true, `${label}: ${report.errors.join("; ")}`);
}

describe("settlement audit matrix — 2 through 8 players", () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    const all = ids(n);
    const scores = freshScores(all);

    it(`${n}p: clear winner`, () => {
      const tricks = tricksClearWinner(n);
      const report = runSettlementAudit({
        scenarioId: `${n}p-clear-winner`,
        winners: ["p0"],
        participants: all,
        tricksByPlayer: tricks,
        scoreById: scores,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assertAuditOk(report, `${n}p clear winner`);
      assert.equal(report.potBefore, ANTE * n);
      assert.ok(report.players.find((p) => p.playerId === "p0")!.payout > 0);
    });

    it(`${n}p: tie carry (co_win_carry)`, () => {
      const tricks = tricksTieLeaders(n, 2);
      const report = runSettlementAudit({
        scenarioId: `${n}p-tie-carry`,
        mode: "co_win_carry",
        winners: ["p0", "p1"],
        participants: all,
        tricksByPlayer: tricks,
        scoreById: scores,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assertAuditOk(report, `${n}p tie carry`);
      assert.equal(report.potAfterSettlement, ANTE * n);
      assert.equal(report.players.find((p) => p.playerId === "p0")!.fundingContribution, 0);
      assert.equal(report.players.find((p) => p.playerId === "p1")!.fundingContribution, 0);
    });

    it(`${n}p: tie split pot`, () => {
      const tricks = tricksTieLeaders(n, 2);
      const report = runSettlementAudit({
        scenarioId: `${n}p-tie-split`,
        mode: "split",
        winners: ["p0", "p1"],
        participants: all,
        tricksByPlayer: tricks,
        scoreById: scores,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
        splitPotEnabled: true,
      });
      assertAuditOk(report, `${n}p tie split`);
      assert.equal(report.potAfterSettlement, 0);
      const p0 = report.players.find((p) => p.playerId === "p0")!;
      const p1 = report.players.find((p) => p.playerId === "p1")!;
      assert.equal(p0.payout + p1.payout, ANTE * n);
    });

    it(`${n}p: single bourré`, () => {
      const tricks = tricksSingleBourre(n);
      const report = runSettlementAudit({
        scenarioId: `${n}p-single-bourre`,
        winners: ["p0"],
        participants: all,
        tricksByPlayer: tricks,
        scoreById: scores,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assertAuditOk(report, `${n}p single bourré`);
      const bourre = report.players.find((p) => p.isBourre)!;
      const pot = ANTE * n;
      assert.equal(
        bourre.fundingContribution,
        Math.min(bourre.bankrollAfterSettlement, pot),
        "bourré pays full pot up to available stack",
      );
      if (bourre.bankrollAfterSettlement < pot) {
        assert.equal(
          report.settlement.scoreById[bourre.playerId]?.bourreReplacementDue,
          pot - bourre.bankrollAfterSettlement,
        );
      }
    });

    if (n >= 4) {
      it(`${n}p: multi bourré`, () => {
        const tricks = tricksMultiBourre(n);
        const report = runSettlementAudit({
          scenarioId: `${n}p-multi-bourre`,
          winners: ["p0"],
          participants: all,
          tricksByPlayer: tricks,
          scoreById: scores,
          buyInFallback: BUY_IN,
          sessionStake: ANTE,
        });
        assertAuditOk(report, `${n}p multi bourré`);
        const bourreCount = report.players.filter((p) => p.isBourre).length;
        assert.ok(bourreCount >= 1);
      });
    }

    it(`${n}p: subset stay-in (2 of ${n})`, () => {
      const participants = ["p0", "p1"];
      const report = runSettlementAudit({
        scenarioId: `${n}p-subset-2`,
        winners: ["p0"],
        participants,
        tricksByPlayer: { p0: 4, p1: 1 },
        scoreById: scores,
        allPlayerIds: all,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assertAuditOk(report, `${n}p subset`);
      assert.equal(report.potBefore, ANTE * 2);
      for (let i = 2; i < n; i += 1) {
        const idle = report.players.find((p) => p.playerId === `p${i}`);
        assert.equal(idle, undefined);
      }
    });

    it(`${n}p: low bankroll (bourré bust defers remainder)`, () => {
      const lowScores: ScoreById = { ...scores };
      lowScores[`p${n - 1}`] = { bankroll: 30, net: -70 };
      const tricks = tricksMultiBourre(n);
      const report = runSettlementAudit({
        scenarioId: `${n}p-low-bankroll`,
        winners: ["p0"],
        participants: all,
        tricksByPlayer: tricks,
        scoreById: lowScores,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assertAuditOk(report, `${n}p low bankroll`);
      const broke = report.players.find((p) => p.playerId === `p${n - 1}`)!;
      assert.ok(broke.bankrollAfterFunding <= 30);
    });

    it(`${n}p: human vs bot parity`, () => {
      const botIds = ["human", ...Array.from({ length: n - 1 }, (_, i) => `bot_${i}`)];
      const botScores = freshScores(botIds);
      const tricks: Record<string, number> = Object.fromEntries(botIds.map((pid) => [pid, 0]));
      tricks.human = 5 - (n - 1);
      for (let i = 1; i < n; i += 1) tricks[`bot_${i - 1}`] = 1;

      const humanWin = runSettlementAudit({
        scenarioId: `${n}p-human-win`,
        winners: ["human"],
        participants: botIds,
        tricksByPlayer: tricks,
        scoreById: botScores,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assertAuditOk(humanWin, `${n}p human win`);

      const botTricks = { ...tricks };
      botTricks.human = 1;
      botTricks.bot_0 = 5 - (n - 1);
      const botWin = runSettlementAudit({
        scenarioId: `${n}p-bot-win`,
        winners: ["bot_0"],
        participants: botIds,
        tricksByPlayer: botTricks,
        scoreById: botScores,
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assertAuditOk(botWin, `${n}p bot win`);
      assert.equal(humanWin.chipTotalAfterFunding, botWin.chipTotalAfterFunding);
    });
  }
});

describe("settlement audit — fold / solo-win paths", () => {
  it("2p decision pass: folded player loses only ante", () => {
    const scoreById: ScoreById = {
      p0: { bankroll: 80, net: -20 },
      p1: { bankroll: 80, net: -20 },
    };
    const report = runSoloWinAudit({
      scenarioId: "2p-decision-pass",
      winnerId: "p1",
      participants: ["p0", "p1"],
      postedAntes: { p0: ANTE, p1: ANTE },
      scoreById,
      buyInFallback: BUY_IN,
      sessionStake: ANTE,
    });
    assert.equal(report.soloReady, true);
    assertAuditOk(report, "2p decision pass");
    const folder = report.players.find((p) => p.playerId === "p0")!;
    assert.equal(folder.settlementDelta, 0);
    assert.equal(folder.netDelta, -ANTE - ANTE);
    const winner = report.players.find((p) => p.playerId === "p1")!;
    assert.equal(winner.bankrollAfterSettlement, 120);
  });

  for (const n of [3, 4, 5, 6, 7, 8]) {
    it(`${n}p: only one stays in (pre-deal solo)`, () => {
      const all = ids(n);
      const scores = freshScores(all);
      const report = runSoloWinAudit({
        scenarioId: `${n}p-solo-enrollment`,
        winnerId: "p0",
        participants: ["p0"],
        postedAntes: { p0: ANTE },
        scoreById: {
          ...scores,
          p0: { bankroll: 80, net: -20 },
        },
        buyInFallback: BUY_IN,
        sessionStake: ANTE,
      });
      assert.equal(report.soloReady, true);
      assertAuditOk(report, `${n}p solo enrollment`);
    });
  }
});

describe("settlement audit — carry-over chains", () => {
  it("3p tie carry then clear winner resolves carry", () => {
    const participants = ids(3);
    let scoreById = freshScores(participants);
    let carryIn = 0;
    let nextDealFunding = null as ReturnType<typeof runSettlementAudit>["settlement"]["nextDealFunding"] | null;

    const tie = runSettlementAudit({
      scenarioId: "3p-carry-chain-1",
      mode: "co_win_carry",
      winners: ["p0", "p1"],
      participants,
      tricksByPlayer: tricksTieLeaders(3, 2),
      scoreById,
      buyInFallback: BUY_IN,
      sessionStake: ANTE,
      carryIn,
    });
    assertAuditOk(tie, "carry hand 1");
    carryIn = tie.settlement.carryOverPot;
    nextDealFunding = tie.settlement.nextDealFunding;
    scoreById = tie.settlement.scoreById;

    const deal = runSettlementAudit({
      scenarioId: "3p-carry-chain-2",
      winners: ["p0"],
      participants,
      tricksByPlayer: { p0: 3, p1: 1, p2: 1 },
      scoreById,
      buyInFallback: BUY_IN,
      sessionStake: ANTE,
      carryIn,
    });
    assertAuditOk(deal, "carry hand 2");
    assert.ok(deal.potBefore > ANTE * 3);
    void nextDealFunding;
  });
});

describe("settlement audit — buy-in conservation baseline", () => {
  it("processBuyIn seeds N × buy-in", () => {
    for (const n of [2, 3, 4, 5, 6, 7, 8]) {
      const buyIn = processBuyIn({
        actionId: `buyin:${n}`,
        playerIds: ids(n),
        buyInAmount: BUY_IN,
      });
      const total = Object.values(buyIn.newBankrolls).reduce((s, v) => s + v, 0);
      assert.equal(total, n * BUY_IN);
      assert.equal(buyIn.invariants.ok, true);
    }
  });
});
