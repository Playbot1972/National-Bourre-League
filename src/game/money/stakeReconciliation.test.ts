/**
 * End-to-end stake reconciliation: buy-in → ante → settlement → next-hand funding.
 * Sweeps player counts (2–8), buy-ins (10–10_000), and antes (0.01–10_000).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ScoreById } from "./types";
import {
  bourrePlayerIds,
  collectHandAntes,
  deriveScoreNet,
  processBuyIn,
  scoreBankroll,
  sessionChipTotal,
} from "./index";
import { runSettlementLifecycle } from "./settlementRules";

const BUY_INS = [10, 100, 1000, 10_000] as const;
const ANTES = [0.01, 1, 20, 1000, 10_000] as const;
const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7, 8] as const;
const TOLERANCE = 0.02;

function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

function freshScores(playerIds: string[], buyIn: number): ScoreById {
  return Object.fromEntries(
    playerIds.map((pid) => [pid, { bankroll: buyIn, net: 0 }]),
  );
}

function postAnteScores(
  scoreById: ScoreById,
  postedAntes: Record<string, number>,
  buyIn: number,
): ScoreById {
  const next: ScoreById = {};
  for (const [pid, row] of Object.entries(scoreById)) {
    const posted = postedAntes[pid] ?? 0;
    const br = Math.max(0, (row.bankroll ?? buyIn) - posted);
    next[pid] = { ...row, bankroll: br, net: deriveScoreNet(br, buyIn) };
  }
  return next;
}

function tricksClearWinner(n: number): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  if (n === 2) {
    t.p0 = 4;
    t.p1 = 1;
    return t;
  }
  for (let i = 0; i < n; i += 1) {
    t[`p${i}`] = 1;
  }
  t.p0 = 5 - (n - 1);
  return t;
}

function tricksSingleBourre(n: number): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  const bourreId = `p${n - 1}`;
  t[bourreId] = 0;
  if (n === 2) {
    t.p0 = 5;
    return t;
  }
  if (n === 3) {
    t.p0 = 3;
    t.p1 = 2;
    return t;
  }
  if (n === 4) {
    t.p0 = 3;
    t.p1 = 1;
    t.p2 = 1;
    return t;
  }
  t.p0 = 2;
  let tricks = 2;
  for (let i = 1; i < n - 1 && tricks < 5; i += 1) {
    t[`p${i}`] = 1;
    tricks += 1;
  }
  return t;
}

function tricksMultiBourre(n: number): Record<string, number> {
  const t: Record<string, number> = Object.fromEntries(ids(n).map((pid) => [pid, 0]));
  t.p0 = 2;
  t.p1 = 1;
  t.p2 = 1;
  t.p3 = 1;
  return t;
}

function tableTotalAfterDeal(
  deal: { bankrolls: Record<string, number>; nextHandPot: number },
): number {
  const bankrollSum = Object.values(deal.bankrolls).reduce((sum, n) => sum + (n ?? 0), 0);
  return bankrollSum + deal.nextHandPot;
}

function assertTableConserved(
  deal: { bankrolls: Record<string, number>; nextHandPot: number },
  playerCount: number,
  buyIn: number,
  label: string,
): void {
  assertNear(tableTotalAfterDeal(deal), playerCount * buyIn, label);
}

function assertNear(actual: number, expected: number, label: string): void {
  assert.ok(
    Math.abs(actual - expected) <= TOLERANCE,
    `${label}: expected ${expected}, got ${actual}`,
  );
}

interface CycleInput {
  buyIn: number;
  ante: number;
  participants: string[];
  allPlayerIds?: string[];
  winners: string[];
  tricksByPlayer: Record<string, number>;
  mode?: "win" | "co_win_carry";
  scoreById?: ScoreById;
}

function runStakeCycle(input: CycleInput) {
  const { buyIn, ante, participants } = input;
  const all = input.allPlayerIds ?? participants;
  const baseScores = input.scoreById ?? freshScores(all, buyIn);
  const collected = collectHandAntes({
    participants,
    scoreById: baseScores,
    buyInFallback: buyIn,
    stakeForPlayer: () => ante,
  });
  const bankrolled = postAnteScores(baseScores, collected.postedAntes, buyIn);

  return runSettlementLifecycle({
    mode: input.mode ?? "win",
    winners: input.winners,
    participants,
    tricksByPlayer: input.tricksByPlayer,
    scoreById: bankrolled,
    sessionStake: ante,
    carryIn: 0,
    postedAntes: collected.postedAntes,
    buyInFallback: buyIn,
  });
}

function idleChipTotal(
  allPlayerIds: string[],
  handParticipants: string[],
  deal: { bankrolls: Record<string, number>; postedAntes: Record<string, number> },
  idleScores: ScoreById,
  buyIn: number,
): number {
  const inHand = sessionChipTotal(
    Object.fromEntries(
      handParticipants.map((pid) => [pid, { bankroll: deal.bankrolls[pid] ?? 0 }]),
    ),
    { carryOverPot: 0, postedAntes: deal.postedAntes, buyInFallback: buyIn },
  );
  const idle = allPlayerIds
    .filter((pid) => !handParticipants.includes(pid))
    .reduce((sum, pid) => sum + scoreBankroll(idleScores[pid], buyIn), 0);
  return inHand + idle;
}

describe("stake reconciliation — buy-in baseline", () => {
  for (const buyIn of BUY_INS) {
    for (const n of PLAYER_COUNTS) {
      it(`processBuyIn seeds ${n} × ${buyIn}`, () => {
        const playerIds = ids(n);
        const result = processBuyIn({
          playerIds,
          buyInAmount: buyIn,
        });
        const total = Object.values(result.newBankrolls).reduce((s, v) => s + v, 0);
        assertNear(total, n * buyIn, "buy-in total");
        assert.equal(result.invariants.ok, true);
      });
    }
  }
});

describe("stake reconciliation — clear winner (2–8p)", () => {
  for (const buyIn of BUY_INS) {
    for (const ante of ANTES) {
      if (ante > buyIn) continue;
      for (const n of PLAYER_COUNTS) {
        it(`${n}p buyIn=${buyIn} ante=${ante} conserves chips`, () => {
          const participants = ids(n);
          const result = runStakeCycle({
            buyIn,
            ante,
            participants,
            winners: ["p0"],
            tricksByPlayer: tricksClearWinner(n),
          });
          const expected = n * buyIn;
          assertNear(result.chipTotalAfterSettlement, expected, "after settlement");
          assertNear(result.chipTotalAfterFunding, expected, "after funding");
          assert.ok(result.deal.nextHandPot > 0);
        });
      }
    }
  }
});

describe("stake reconciliation — bourré (2p)", () => {
  for (const buyIn of BUY_INS) {
    for (const ante of ANTES) {
      if (ante > buyIn) continue;
      it(`2p buyIn=${buyIn} ante=${ante} bourré penalty funds next pot, no double ante`, () => {
        const participants = ids(2);
        const result = runStakeCycle({
          buyIn,
          ante,
          participants,
          winners: ["p0"],
          tricksByPlayer: { p0: 5, p1: 0 },
        });
        assert.deepEqual(result.bourreIds, ["p1"]);
        const pot = ante * 2;
        assertNear(result.settlement.bankrolls.p0 ?? 0, buyIn - ante + pot, "winner bankroll");
        assertNear(result.settlement.bankrolls.p1 ?? 0, buyIn - ante, "bourré bankroll after phase 1");
        assert.equal(result.settlement.scoreById.p1?.skipNextAnte, true);
        if (ante === buyIn) {
          assertNear(result.deal.postedAntes.p1 ?? 0, 0, "bourré bust defers full pot penalty");
          assert.ok(
            (result.settlement.scoreById.p1?.bourreReplacementDue ?? 0) > 0 ||
              (result.deal.bankrolls.p1 ?? 0) === 0,
            "bourré bust path records deferral or zero stack",
          );
        } else {
          assertNear(result.deal.postedAntes.p1 ?? 0, pot, "bourré pays full pot at funding");
          assertNear(result.deal.postedAntes.p0 ?? 0, ante, "winner pays normal ante");
        }
        assertTableConserved(result.deal, 2, buyIn, "chip conservation");
      });
    }
  }
});

describe("stake reconciliation — bourré (3–5p single bourré)", () => {
  for (const buyIn of BUY_INS) {
    for (const ante of ANTES) {
      if (ante > buyIn) continue;
      for (const n of [3, 4, 5] as const) {
        it(`${n}p buyIn=${buyIn} ante=${ante} single bourré skips normal ante`, () => {
          const participants = ids(n);
          const tricks = tricksSingleBourre(n);
          const bourreId = `p${n - 1}`;
          assert.deepEqual(bourrePlayerIds(tricks, participants), [bourreId]);

          const result = runStakeCycle({
            buyIn,
            ante,
            participants,
            winners: ["p0"],
            tricksByPlayer: tricks,
          });
          assert.deepEqual(result.bourreIds, [bourreId]);
          assert.equal(result.settlement.scoreById[bourreId]?.skipNextAnte, true);
          if (ante === buyIn) {
            assertTableConserved(result.deal, n, buyIn, "chip conservation");
            return;
          }
          const completedPot = ante * n;
          const posted = result.deal.postedAntes[bourreId] ?? 0;
          const stackAfterAnte = buyIn - ante;
          if (stackAfterAnte >= completedPot) {
            assertNear(posted, completedPot, "bourré penalty");
          } else {
            assertNear(posted, stackAfterAnte, "bourré pays remaining stack when short");
          }
          for (const pid of participants) {
            if (pid === bourreId) continue;
            assertNear(result.deal.postedAntes[pid] ?? 0, ante, `${pid} normal ante`);
          }
          assertTableConserved(result.deal, n, buyIn, "chip conservation");
        });
      }
    }
  }
});

describe("stake reconciliation — bourré (6–8p multi-bourré)", () => {
  for (const buyIn of BUY_INS) {
    for (const ante of ANTES) {
      if (ante > buyIn) continue;
      for (const n of [6, 7, 8] as const) {
        it(`${n}p buyIn=${buyIn} ante=${ante} multi-bourré never double-charges ante`, () => {
          const participants = ids(n);
          const tricks = tricksMultiBourre(n);
          const bourreIds = bourrePlayerIds(tricks, participants);
          assert.ok(bourreIds.length >= n - 5, "at least n-5 bourrés with five tricks");

          const result = runStakeCycle({
            buyIn,
            ante,
            participants,
            winners: ["p0"],
            tricksByPlayer: tricks,
          });
          for (const pid of bourreIds) {
            assert.equal(result.settlement.scoreById[pid]?.skipNextAnte, true);
            const posted = result.deal.postedAntes[pid] ?? 0;
            assert.ok(
              posted === 0 || posted >= ante,
              `${pid} pays bourré penalty or defers — not a lone normal ante`,
            );
          }
          assertTableConserved(result.deal, n, buyIn, "chip conservation");
        });
      }
    }
  }
});

describe("stake reconciliation — I'm Out (subset participants)", () => {
  for (const buyIn of BUY_INS) {
    for (const ante of ANTES) {
      if (ante > buyIn) continue;
      for (const n of [4, 6, 8] as const) {
        it(`${n}p buyIn=${buyIn} ante=${ante} only 2 active — idle stacks untouched`, () => {
          const all = ids(n);
          const participants = ["p0", "p1"];
          const scores = freshScores(all, buyIn);
          const result = runStakeCycle({
            buyIn,
            ante,
            participants,
            allPlayerIds: all,
            winners: ["p0"],
            tricksByPlayer: { p0: 4, p1: 1 },
            scoreById: scores,
          });
          assertNear(result.settlement.potState.maxWinThisHand, ante * 2, "pot from active only");
          for (let i = 2; i < n; i += 1) {
            assertNear(scoreBankroll(scores[`p${i}`], buyIn), buyIn, `p${i} idle bankroll`);
          }
          assertNear(
            idleChipTotal(all, participants, result.deal, scores, buyIn),
            n * buyIn,
            "table total with idle players",
          );
        });
      }
    }
  }
});

describe("stake reconciliation — tie carry", () => {
  for (const buyIn of BUY_INS) {
    for (const ante of ANTES) {
      if (ante > buyIn) continue;
      it(`3p buyIn=${buyIn} ante=${ante} co_win_carry exempts tied leaders from next ante`, () => {
        const participants = ids(3);
        const result = runStakeCycle({
          buyIn,
          ante,
          participants,
          winners: ["p0", "p1"],
          tricksByPlayer: { p0: 2, p1: 2, p2: 1 },
          mode: "co_win_carry",
        });
        assertNear(result.settlement.carryOverPot, ante * 3, "carried pot");
        assert.equal(result.settlement.nextDealFunding.byPlayer.p0.skipNextAnte, true);
        assert.equal(result.settlement.nextDealFunding.byPlayer.p1.skipNextAnte, true);
        if (ante < buyIn) {
          assertNear(result.deal.postedAntes.p2 ?? 0, ante, "non-leader antes");
        }
        assertTableConserved(result.deal, 3, buyIn, "chip conservation");
      });
    }
  }
});

describe("stake reconciliation — bourré shortfall regression", () => {
  it("5p buyIn=100 ante=20: bourré collects full stack toward pot, not remainder-only", () => {
    const buyIn = 100;
    const ante = 20;
    const participants = ids(5);
    const result = runStakeCycle({
      buyIn,
      ante,
      participants,
      winners: ["p0"],
      tricksByPlayer: tricksSingleBourre(5),
    });
    assert.deepEqual(result.bourreIds, ["p4"]);
    assertNear(result.deal.postedAntes.p4 ?? 0, 80, "bourré pays affordable stack");
    assert.equal(result.settlement.scoreById.p4?.bourreReplacementDue, 20);
    assertNear(result.deal.nextHandPot, 80 + ante * 4, "next pot = bourré stack + other antes");
    assertTableConserved(result.deal, 5, buyIn, "chip conservation");
  });
});
