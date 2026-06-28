/**
 * Regression: canonical v1 bankroll display path (scoreBankroll + deriveScoreNet)
 * across 2–8 player tables. Ensures stored bankroll is never over-credited via
 * stale net when stack returns to buy-in after the next ante.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MoneyEvent, ScoreById } from "./types";
import {
  deriveScoreNet,
  ledgerChipTotal,
  ledgerFromScoreById,
  MONEY_ENGINE_VERSION,
  processAnte,
  processBuyIn,
  processHandSettlement,
  processRebuy,
  replayEvents,
  scoreBankroll,
} from "./index";

const BUY_IN = 100;
const ANTE = 20;

const EMPTY_LEDGER = {
  version: MONEY_ENGINE_VERSION,
  buyInFallback: BUY_IN,
  bankrolls: {} as Record<string, number>,
  nets: {} as Record<string, number>,
  carryOverPot: 0,
  postedAntes: {} as Record<string, number>,
  scoreFlags: {},
  sequence: 0,
};

function tableIds(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `p${i}`);
}

/** Stored bankroll is authoritative; net must match bankroll − buyIn. */
function assertCanonicalScoreRows(
  scoreById: ScoreById,
  playerIds: string[],
  buyIn = BUY_IN,
): void {
  for (const pid of playerIds) {
    const row = scoreById[pid];
    if (row?.bankroll == null) continue;
    assert.equal(
      scoreBankroll(row, buyIn),
      row.bankroll,
      `${pid}: scoreBankroll must equal stored bankroll (no stale-net inflation)`,
    );
    assert.equal(
      row.net,
      deriveScoreNet(row.bankroll, buyIn),
      `${pid}: net must equal bankroll − buyIn`,
    );
  }
}

/** Legacy bug: buyIn + net when bankroll === buyIn after next-hand ante. */
function legacyInflatedBankroll(row: ScoreById[string], buyIn = BUY_IN): number | null {
  if (row?.bankroll == null) return null;
  const stored = Math.max(0, Number(row.bankroll));
  const net = Number(row?.net) || 0;
  if (net !== 0 && buyIn > 0 && stored === buyIn) return buyIn + net;
  return null;
}

interface HandScenario {
  label: string;
  playerCount: number;
  tricksByPlayer: Record<string, number>;
  winners: string[];
  mode?: "win" | "split";
}

/** Five tricks total; bourré only when a seated player finishes with zero tricks. */
function tricksForScenario(
  playerCount: number,
  kind:
    | "no-bourre"
    | "single-bourre"
    | "multi-bourre"
    | "min-bourre",
): Record<string, number> {
  const ids = tableIds(playerCount);
  const tricks = Object.fromEntries(ids.map((pid) => [pid, 0]));

  if (kind === "no-bourre") {
    if (playerCount === 2) {
      tricks.p0 = 4;
      tricks.p1 = 1;
    } else if (playerCount <= 5) {
      for (let i = 0; i < playerCount; i += 1) {
        tricks[`p${i}`] = 1;
      }
      tricks.p0 = MAX_TRICKS - (playerCount - 1);
    } else {
      throw new Error(`no-bourre impossible with ${playerCount} players (only 5 tricks)`);
    }
    return tricks;
  }

  if (kind === "single-bourre") {
    if (playerCount === 2) {
      tricks.p0 = 5;
      return tricks;
    }
    if (playerCount === 3) {
      tricks.p0 = 3;
      tricks.p1 = 2;
      return tricks;
    }
    throw new Error(`single-bourre needs playerCount ≤ 3 with 5-trick hands`);
  }

  if (kind === "min-bourre") {
    for (let i = 0; i < Math.min(5, playerCount); i += 1) {
      tricks[`p${i}`] = 1;
    }
    return tricks;
  }

  // multi-bourre: winner + three trick losers, rest bourré
  tricks.p0 = 2;
  tricks.p1 = 1;
  tricks.p2 = 1;
  tricks.p3 = 1;
  return tricks;
}

const MAX_TRICKS = 5;

function runTwoHandV1Cycle(scenario: HandScenario): {
  playerIds: string[];
  events: MoneyEvent[];
  afterSettle: ScoreById;
  afterSecondAnte: ReturnType<typeof replayEvents>;
  carryOverPot: number;
  expectedTotal: number;
} {
  const playerIds = tableIds(scenario.playerCount);
  const expectedTotal = playerIds.length * BUY_IN;

  const buyInResult = processBuyIn({
    actionId: `buyin:${scenario.label}`,
    playerIds,
    buyInAmount: BUY_IN,
  });
  let events: MoneyEvent[] = [...buyInResult.newEvents];
  let scoreById: ScoreById = Object.fromEntries(
    playerIds.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]),
  );

  const ante1 = processAnte({
    actionId: `ante:${scenario.label}:1`,
    handId: "1",
    carryOverPot: 0,
    participantIds: playerIds,
    scoreById,
    sessionStake: ANTE,
    buyInFallback: BUY_IN,
    existingEvents: events,
  });
  events = [...events, ...ante1.newEvents];
  const bankrolled1 = Object.fromEntries(
    playerIds.map((pid) => [
      pid,
      { ...scoreById[pid], bankroll: ante1.newBankrolls[pid] ?? scoreById[pid].bankroll },
    ]),
  );

  const settle1 = processHandSettlement({
    actionId: `settle:${scenario.label}:1`,
    handId: "1",
    mode: scenario.mode ?? "win",
    winners: scenario.winners,
    participants: playerIds,
    tricksByPlayer: scenario.tricksByPlayer,
    scoreById: bankrolled1,
    sessionStake: ANTE,
    carryIn: 0,
    postedAntes: ante1.postedAntes,
    buyInFallback: BUY_IN,
    existingEvents: events,
  });
  events = [...events, ...settle1.newEvents];
  const afterSettle = settle1.settlement.scoreById;

  const ante2 = processAnte({
    actionId: `ante:${scenario.label}:2`,
    handId: "2",
    carryOverPot: settle1.carryOverPot,
    participantIds: playerIds,
    scoreById: afterSettle,
    sessionStake: ANTE,
    buyInFallback: BUY_IN,
    nextDealFunding: settle1.settlement.nextDealFunding,
    existingEvents: events,
  });
  events = [...events, ...ante2.newEvents];

  const replayed = replayEvents(events, { ...EMPTY_LEDGER, buyInFallback: BUY_IN });

  return {
    playerIds,
    events,
    afterSettle,
    afterSecondAnte: replayed,
    carryOverPot: settle1.carryOverPot,
    expectedTotal,
  };
}

function potTotal(state: { carryOverPot: number; postedAntes: Record<string, number> }): number {
  const posted = Object.values(state.postedAntes).reduce((s, n) => s + Math.max(0, Number(n) || 0), 0);
  return Math.max(0, state.carryOverPot) + posted;
}

describe("money engine — bankroll display regression (2–8 players)", () => {
  const tableSizes = [2, 3, 4, 5, 6, 7, 8] as const;

  const scenarios: HandScenario[] = [
    {
      label: "2p-no-bourre",
      playerCount: 2,
      tricksByPlayer: tricksForScenario(2, "no-bourre"),
      winners: ["p0"],
    },
    {
      label: "3p-single-bourre",
      playerCount: 3,
      tricksByPlayer: tricksForScenario(3, "single-bourre"),
      winners: ["p0"],
    },
    {
      label: "4p-no-bourre-all-losers-took-trick",
      playerCount: 4,
      tricksByPlayer: tricksForScenario(4, "no-bourre"),
      winners: ["p0"],
    },
    {
      label: "5p-no-bourre",
      playerCount: 5,
      tricksByPlayer: tricksForScenario(5, "no-bourre"),
      winners: ["p0"],
    },
    {
      label: "8p-min-bourre",
      playerCount: 8,
      tricksByPlayer: tricksForScenario(8, "min-bourre"),
      winners: ["p0"],
    },
    {
      label: "8p-multi-bourre",
      playerCount: 8,
      tricksByPlayer: tricksForScenario(8, "multi-bourre"),
      winners: ["p0"],
    },
  ];

  for (const scenario of scenarios) {
    it(`${scenario.label}: settlement + hand-2 ante keeps scoreBankroll canonical`, () => {
      const result = runTwoHandV1Cycle(scenario);

      assertCanonicalScoreRows(result.afterSettle, result.playerIds);
      assert.equal(ledgerChipTotal(result.afterSecondAnte), result.expectedTotal);

      for (const pid of result.playerIds) {
        const replayBr = result.afterSecondAnte.bankrolls[pid] ?? 0;
        const row = {
          bankroll: replayBr,
          net: deriveScoreNet(replayBr, BUY_IN),
        };
        assert.equal(scoreBankroll(row, BUY_IN), replayBr);
        assert.equal(row.net, deriveScoreNet(replayBr, BUY_IN));
      }

      if (scenario.label === "2p-no-bourre") {
        assert.equal(result.afterSettle.p0?.bankroll, 120);
        assert.equal(result.afterSettle.p1?.bankroll, 80);
        assert.equal(result.afterSecondAnte.bankrolls.p0, 100);
        assert.equal(result.afterSecondAnte.bankrolls.p1, 60);
        assert.equal(potTotal(result.afterSecondAnte), 40);
        assert.equal(legacyInflatedBankroll({ bankroll: 100, net: 20 }, BUY_IN), 120);
        assert.notEqual(scoreBankroll({ bankroll: 100, net: 20 }, BUY_IN), 120);
      }
    });
  }

  for (const n of tableSizes) {
    it(`${n}-player table: chip conservation through settle → next ante`, () => {
      const kind =
        n <= 5 ? "no-bourre" : n === 8 ? "multi-bourre" : "min-bourre";
      const result = runTwoHandV1Cycle({
        label: `${n}p-generic`,
        playerCount: n,
        tricksByPlayer: tricksForScenario(n, kind),
        winners: ["p0"],
      });
      assert.equal(ledgerChipTotal(result.afterSecondAnte), n * BUY_IN);
      assert.ok(potTotal(result.afterSecondAnte) >= 0);
      assertCanonicalScoreRows(
        Object.fromEntries(
          result.playerIds.map((pid) => [
            pid,
            {
              bankroll: result.afterSecondAnte.bankrolls[pid],
              net: deriveScoreNet(result.afterSecondAnte.bankrolls[pid] ?? 0, BUY_IN),
            },
          ]),
        ),
        result.playerIds,
      );
    });
  }

  it("3p bourré carry: next-hand pot = carry + non-bourré antes only", () => {
    const result = runTwoHandV1Cycle({
      label: "3p-carry-funding",
      playerCount: 3,
      tricksByPlayer: tricksForScenario(3, "single-bourre"),
      winners: ["p0"],
    });
    assert.equal(result.carryOverPot, 60);
    assert.equal(result.afterSettle.p2?.skipNextAnte, true);
    assert.equal(result.afterSecondAnte.postedAntes.p2 ?? 0, 0);
    assert.equal(result.afterSecondAnte.postedAntes.p0, ANTE);
    assert.equal(result.afterSecondAnte.postedAntes.p1, ANTE);
    assert.equal(potTotal(result.afterSecondAnte), 100);
    assertCanonicalScoreRows(result.afterSettle, result.playerIds);
  });

  it("8p multi-bourré: busted bourré players defer replacement; carry seeds pot", () => {
    const result = runTwoHandV1Cycle({
      label: "8p-carry-multi",
      playerCount: 8,
      tricksByPlayer: tricksForScenario(8, "multi-bourre"),
      winners: ["p0"],
    });
    const bourreIds = ["p4", "p5", "p6", "p7"];
    for (const pid of bourreIds) {
      assert.equal(result.afterSettle[pid]?.bankroll, 0);
      assert.equal(result.afterSettle[pid]?.bourreReplacementDue, 80);
      assert.equal(result.afterSecondAnte.bankrolls[pid], 0);
      assert.equal(result.afterSecondAnte.postedAntes[pid] ?? 0, 0);
      assert.equal(result.afterSecondAnte.scoreFlags[pid]?.out, true);
    }
    assert.equal(result.carryOverPot, 320);
    assert.equal(ledgerChipTotal(result.afterSecondAnte), 8 * BUY_IN);
    assertCanonicalScoreRows(result.afterSettle, result.playerIds);
  });

  it("rebuy after zero bankroll: scoreBankroll matches replayed stack", () => {
    const rebuy = processRebuy({
      actionId: "rebuy:p2",
      playerId: "p2",
      buyInAmount: BUY_IN,
      ledger: ledgerFromScoreById(
        { p2: { bankroll: 0, net: -100, out: true } },
        { buyInFallback: BUY_IN },
      ),
    });
    assert.equal(rebuy.newBankrolls.p2, BUY_IN);
    const row = { bankroll: BUY_IN, net: deriveScoreNet(BUY_IN, BUY_IN) };
    assert.equal(scoreBankroll(row, BUY_IN), BUY_IN);
    assert.equal(row.net, 0);
    assert.equal(legacyInflatedBankroll({ bankroll: BUY_IN, net: 40 }), 140);
    assert.notEqual(scoreBankroll({ bankroll: BUY_IN, net: 0 }, BUY_IN), 140);
  });

  it("4p losers with tricks owe only ante — bankrolls drop by posted ante only", () => {
    const result = runTwoHandV1Cycle({
      label: "4p-losers-ante-only",
      playerCount: 4,
      tricksByPlayer: tricksForScenario(4, "no-bourre"),
      winners: ["p0"],
    });
    assert.equal(result.afterSettle.p0?.bankroll, 160);
    assert.equal(result.afterSettle.p1?.bankroll, 80);
    assert.equal(result.afterSettle.p2?.bankroll, 80);
    assert.equal(result.afterSettle.p3?.bankroll, 80);
    assert.equal(result.afterSettle.p1?.net, -20);
    assert.equal(result.carryOverPot, 0);
    assert.equal(result.afterSecondAnte.bankrolls.p0, 140);
    assert.equal(result.afterSecondAnte.bankrolls.p1, 60);
    for (const pid of ["p0", "p1", "p2", "p3"]) {
      assert.equal(
        scoreBankroll(
          {
            bankroll: result.afterSecondAnte.bankrolls[pid],
            net: deriveScoreNet(result.afterSecondAnte.bankrolls[pid] ?? 0, BUY_IN),
          },
          BUY_IN,
        ),
        result.afterSecondAnte.bankrolls[pid],
      );
    }
  });
});
