/**
 * End-to-end money engine — long multi-hand sessions for 2–8 players.
 * Verifies chip conservation, session bankroll ceiling, and canonical score rows
 * across normal wins, bourré, ties, carry, split, bust/out, and rebuys.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MoneyEvent, ScoreById } from "./types";
import {
  deriveScoreNet,
  ledgerChipTotal,
  MONEY_ENGINE_VERSION,
  processAnte,
  processBuyIn,
  processHandSettlement,
  processRebuy,
  replayEvents,
  scoreBankroll,
  sessionChipTotal,
  solventPlayerIds,
} from "./index";
import { tableChipTotal } from "./conservation";

const EMPTY_LEDGER = {
  version: MONEY_ENGINE_VERSION,
  buyInFallback: 100,
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

function maxSessionChips(playerCount: number, buyIn: number, totalRebuys = 0): number {
  return playerCount * buyIn + totalRebuys;
}

function potTotal(carryOverPot: number, postedAntes: Record<string, number>): number {
  const posted = Object.values(postedAntes).reduce(
    (sum, raw) => sum + Math.max(0, Number(raw) || 0),
    0,
  );
  return Math.max(0, carryOverPot) + posted;
}

function assertCanonicalScoreRows(
  scoreById: ScoreById,
  playerIds: string[],
  buyIn: number,
  label: string,
): void {
  for (const pid of playerIds) {
    const row = scoreById[pid];
    if (row?.bankroll == null) continue;
    assert.equal(
      scoreBankroll(row, buyIn),
      row.bankroll,
      `${label}: ${pid} scoreBankroll must equal stored bankroll`,
    );
    assert.equal(
      row.net,
      deriveScoreNet(row.bankroll, buyIn),
      `${label}: ${pid} net must equal bankroll − buyIn`,
    );
  }
}

interface InvariantContext {
  label: string;
  playerIds: string[];
  buyIn: number;
  ante: number;
  expectedTotal: number;
  carryOverPot: number;
  postedAntes: Record<string, number>;
  nextHandPot?: number;
  scoreById: ScoreById;
  events: MoneyEvent[];
  handNumber: number;
}

function assertSessionInvariants(ctx: InvariantContext): void {
  const {
    label,
    playerIds,
    buyIn,
    expectedTotal,
    carryOverPot,
    postedAntes,
    nextHandPot,
    scoreById,
    events,
    handNumber,
  } = ctx;

  const replayed = replayEvents(events, { ...EMPTY_LEDGER, buyInFallback: buyIn });
  const replayTotal = ledgerChipTotal(replayed);

  assert.ok(
    replayTotal <= expectedTotal,
    `${label} hand ${handNumber}: chip total ${replayTotal} exceeds ceiling ${expectedTotal}`,
  );

  for (const pid of playerIds) {
    const br = scoreBankroll(scoreById[pid], buyIn);
    assert.ok(
      br <= expectedTotal,
      `${label} hand ${handNumber}: ${pid} bankroll ${br} exceeds session cap ${expectedTotal}`,
    );
  }

  assertCanonicalScoreRows(scoreById, playerIds, buyIn, `${label} hand ${handNumber}`);
}

type HandScenarioKind =
  | "normal"
  | "bourre"
  | "tie_carry"
  | "split"
  | "subset"
  | "bourre_2p"
  | "multi_bourre";

interface HandScenario {
  kind: HandScenarioKind;
  mode: "win" | "split" | "co_win_carry";
  winners: string[];
  participants: string[];
  tricksByPlayer: Record<string, number>;
  splitPotEnabled?: boolean;
}

function tricksNoBourre(playerCount: number, winnerIdx: number): Record<string, number> {
  const tricks = Object.fromEntries(tableIds(playerCount).map((pid) => [pid, 0]));
  if (playerCount === 2) {
    tricks[`p${winnerIdx % 2}`] = 4;
    tricks[`p${(winnerIdx + 1) % 2}`] = 1;
    return tricks;
  }
  for (let i = 0; i < playerCount; i += 1) {
    tricks[`p${i}`] = 1;
  }
  tricks[`p${winnerIdx % playerCount}`] = 5 - (playerCount - 1);
  return tricks;
}

function tricksSingleBourre(playerCount: number, winnerIdx: number): Record<string, number> {
  const tricks = Object.fromEntries(tableIds(playerCount).map((pid) => [pid, 0]));
  if (playerCount === 2) {
    tricks[`p${winnerIdx % 2}`] = 5;
    return tricks;
  }
  if (playerCount === 3) {
    tricks[`p${winnerIdx % 3}`] = 3;
    tricks[`p${(winnerIdx + 1) % 3}`] = 2;
    return tricks;
  }
  tricks[`p${winnerIdx % playerCount}`] = 2;
  tricks[`p${(winnerIdx + 1) % playerCount}`] = 1;
  tricks[`p${(winnerIdx + 2) % playerCount}`] = 1;
  tricks[`p${(winnerIdx + 3) % playerCount}`] = 1;
  return tricks;
}

function tricksTieCarry(playerCount: number): Record<string, number> {
  const tricks = Object.fromEntries(tableIds(playerCount).map((pid) => [pid, 0]));
  if (playerCount === 2) {
    tricks.p0 = 2;
    tricks.p1 = 3;
    return tricks;
  }
  tricks.p0 = 2;
  tricks.p1 = 2;
  tricks.p2 = 1;
  for (let i = 3; i < playerCount; i += 1) {
    tricks[`p${i}`] = 0;
  }
  return tricks;
}

function tricksMultiBourre(playerCount: number): Record<string, number> {
  const tricks = Object.fromEntries(tableIds(playerCount).map((pid) => [pid, 0]));
  tricks.p0 = 2;
  tricks.p1 = 1;
  tricks.p2 = 1;
  tricks.p3 = 1;
  return tricks;
}

function tricksMinBourre(playerCount: number): Record<string, number> {
  const tricks = Object.fromEntries(tableIds(playerCount).map((pid) => [pid, 0]));
  for (let i = 0; i < Math.min(5, playerCount); i += 1) {
    tricks[`p${i}`] = 1;
  }
  return tricks;
}

function pickScenario(
  handIndex: number,
  playerCount: number,
  allIds: string[],
  scoreById: ScoreById,
  buyIn: number,
  splitPotEnabled: boolean,
): HandScenario {
  const kind = (
    [
      "normal",
      "bourre",
      "tie_carry",
      "split",
      "subset",
      "bourre_2p",
      "multi_bourre",
    ] as HandScenarioKind[]
  )[handIndex % 7];

  const winnerIdx = handIndex % playerCount;
  const solvent = solventPlayerIds(scoreById, allIds, buyIn);

  let participants = solvent.length >= 2 ? [...solvent] : allIds.filter((pid) => !scoreById[pid]?.out);

  if (kind === "subset" && playerCount >= 4 && solvent.length >= 3) {
    participants = solvent.slice(0, Math.max(2, Math.min(3, solvent.length)));
  } else if (solvent.length < 2) {
    participants = allIds.filter((pid) => scoreBankroll(scoreById[pid], buyIn) > 0);
  }

  if (participants.length < 2) {
    participants = allIds.slice(0, Math.min(2, allIds.length));
  }

  switch (kind) {
    case "normal": {
      const tricks = tricksNoBourre(participants.length, winnerIdx % participants.length);
      const winner = participants[winnerIdx % participants.length];
      return {
        kind,
        mode: "win",
        winners: [winner],
        participants,
        tricksByPlayer: Object.fromEntries(
          participants.map((pid) => [pid, tricks[pid] ?? 0]),
        ),
      };
    }
    case "bourre": {
      const tricks = tricksSingleBourre(participants.length, winnerIdx % participants.length);
      const winner = participants[winnerIdx % participants.length];
      return {
        kind,
        mode: "win",
        winners: [winner],
        participants,
        tricksByPlayer: Object.fromEntries(
          participants.map((pid) => [pid, tricks[pid] ?? 0]),
        ),
      };
    }
    case "tie_carry": {
      const tricks = tricksTieCarry(participants.length);
      const sorted = [...participants].sort(
        (a, b) => (tricks[b] ?? 0) - (tricks[a] ?? 0),
      );
      const top = tricks[sorted[0]] ?? 0;
      const winners = sorted.filter((pid) => (tricks[pid] ?? 0) === top);
      return {
        kind,
        mode: "co_win_carry",
        winners,
        participants,
        tricksByPlayer: Object.fromEntries(
          participants.map((pid) => [pid, tricks[pid] ?? 0]),
        ),
      };
    }
    case "split": {
      const tricks = tricksTieCarry(participants.length);
      const sorted = [...participants].sort(
        (a, b) => (tricks[b] ?? 0) - (tricks[a] ?? 0),
      );
      const top = tricks[sorted[0]] ?? 0;
      const winners = sorted.filter((pid) => (tricks[pid] ?? 0) === top).slice(0, 2);
      return {
        kind,
        mode: "split",
        winners: winners.length >= 2 ? winners : [participants[0]],
        participants,
        tricksByPlayer: Object.fromEntries(
          participants.map((pid) => [pid, tricks[pid] ?? 0]),
        ),
        splitPotEnabled,
      };
    }
    case "subset": {
      const tricks = tricksNoBourre(participants.length, 0);
      return {
        kind,
        mode: "win",
        winners: [participants[0]],
        participants,
        tricksByPlayer: Object.fromEntries(
          participants.map((pid) => [pid, tricks[pid] ?? 0]),
        ),
      };
    }
    case "bourre_2p": {
      if (participants.length >= 2) {
        const pair = participants.slice(0, 2);
        return {
          kind,
          mode: "win",
          winners: [pair[0]],
          participants: pair,
          tricksByPlayer: { [pair[0]]: 5, [pair[1]]: 0 },
        };
      }
      return pickScenario(handIndex, playerCount, allIds, scoreById, buyIn, splitPotEnabled);
    }
    case "multi_bourre":
    default: {
      const tricks =
        participants.length >= 6 ? tricksMultiBourre(participants.length) : tricksMinBourre(participants.length);
      return {
        kind: "multi_bourre",
        mode: "win",
        winners: [participants[0]],
        participants,
        tricksByPlayer: Object.fromEntries(
          participants.map((pid) => [pid, tricks[pid] ?? 0]),
        ),
      };
    }
  }
}

interface LongSessionResult {
  label: string;
  playerCount: number;
  buyIn: number;
  handsPlayed: number;
  expectedTotal: number;
  totalRebuys: number;
  events: MoneyEvent[];
  finalScoreById: ScoreById;
}

function runLongSession(opts: {
  label: string;
  playerCount: number;
  buyIn: number;
  ante: number;
  handCount: number;
  splitPotEnabled?: boolean;
  rebuyEvery?: number;
}): LongSessionResult {
  const {
    label,
    playerCount,
    buyIn,
    ante,
    handCount,
    splitPotEnabled = false,
    rebuyEvery = 0,
  } = opts;
  const playerIds = tableIds(playerCount);

  const buyInResult = processBuyIn({
    actionId: `buyin:${label}`,
    playerIds,
    buyInAmount: buyIn,
  });
  let events: MoneyEvent[] = [...buyInResult.newEvents];
  let scoreById: ScoreById = Object.fromEntries(
    playerIds.map((pid) => [pid, { bankroll: buyIn, net: 0 }]),
  );
  let carryOverPot = 0;
  let nextDealFunding: ReturnType<typeof processHandSettlement>["settlement"]["nextDealFunding"] | null =
    null;
  let totalRebuys = 0;

  assert.equal(buyInResult.invariants.ok, true, `${label}: buy-in invariants`);

  for (let hand = 0; hand < handCount; hand += 1) {
    const handNum = hand + 1;
    if (rebuyEvery > 0 && hand > 0 && hand % rebuyEvery === 0) {
      const busted = playerIds.find(
        (pid) => scoreById[pid]?.out === true || scoreBankroll(scoreById[pid], buyIn) <= 0,
      );
      if (busted) {
        const rebuy = processRebuy({
          actionId: `rebuy:${label}:${handNum}:${busted}`,
          playerId: busted,
          buyInAmount: buyIn,
          ledger: {
            ...EMPTY_LEDGER,
            buyInFallback: buyIn,
            bankrolls: Object.fromEntries(
              playerIds.map((pid) => [pid, scoreBankroll(scoreById[pid], buyIn)]),
            ),
            nets: Object.fromEntries(
              playerIds.map((pid) => [pid, scoreById[pid]?.net ?? 0]),
            ),
          },
        });
        events = [...events, ...rebuy.newEvents];
        totalRebuys += buyIn;
        scoreById = {
          ...scoreById,
          [busted]: {
            bankroll: buyIn,
            net: deriveScoreNet(buyIn, buyIn),
          },
        };
        delete scoreById[busted]?.out;
        assert.equal(rebuy.invariants.ok, true, `${label} hand ${handNum}: rebuy invariants`);
      }
    }

    const expectedTotal = maxSessionChips(playerCount, buyIn, totalRebuys);

    const preScenario = pickScenario(
      hand,
      playerCount,
      playerIds,
      scoreById,
      buyIn,
      splitPotEnabled,
    );
    const enrolledForAnte = playerIds.filter((pid) => {
      if (scoreById[pid]?.out === true) return false;
      return scoreBankroll(scoreById[pid], buyIn) > 0;
    });
    const anteParticipants =
      preScenario.kind === "subset" && preScenario.participants.length >= 2
        ? preScenario.participants
        : enrolledForAnte.length >= 2
          ? enrolledForAnte
          : playerIds.slice(0, 2);

    const anteResult = processAnte({
      actionId: `ante:${label}:${handNum}`,
      handId: String(handNum),
      carryOverPot,
      participantIds: anteParticipants,
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
      nextDealFunding,
      existingEvents: events,
    });
    events = [...events, ...anteResult.newEvents];

    const bankrolled: ScoreById = { ...scoreById };
    for (const pid of anteParticipants) {
      bankrolled[pid] = {
        ...scoreById[pid],
        bankroll: anteResult.newBankrolls[pid] ?? scoreBankroll(scoreById[pid], buyIn),
        net: deriveScoreNet(anteResult.newBankrolls[pid] ?? 0, buyIn),
      };
    }

    assertSessionInvariants({
      label: `${label} (post-ante)`,
      playerIds,
      buyIn,
      ante,
      expectedTotal,
      carryOverPot: 0,
      postedAntes: anteResult.postedAntes,
      nextHandPot: anteResult.collected?.nextHandPot,
      scoreById: bankrolled,
      events,
      handNumber: handNum,
    });

    const playParticipants = preScenario.participants.filter((pid) =>
      anteParticipants.includes(pid),
    );
    const participants =
      playParticipants.length >= 2 ? playParticipants : anteParticipants.slice(0, 2);
    const scenarioWinners = preScenario.winners.filter((pid) => participants.includes(pid));
    const winners = scenarioWinners.length > 0 ? scenarioWinners : [participants[0]];

    const fundedHandPot =
      anteResult.collected?.nextHandPot ?? potTotal(carryOverPot, anteResult.postedAntes);

    const settleResult = processHandSettlement({
      actionId: `settle:${label}:${handNum}`,
      handId: String(handNum),
      mode: preScenario.mode,
      winners,
      participants,
      tricksByPlayer: Object.fromEntries(
        participants.map((pid) => [pid, preScenario.tricksByPlayer[pid] ?? 0]),
      ),
      scoreById: bankrolled,
      sessionStake: ante,
      carryIn: carryOverPot,
      postedAntes: anteResult.postedAntes,
      buyInFallback: buyIn,
      splitPotEnabled: preScenario.splitPotEnabled,
      existingEvents: events,
    });
    events = [...events, ...settleResult.newEvents];

    scoreById = { ...bankrolled, ...settleResult.settlement.scoreById };
    for (const pid of playerIds) {
      if (!participants.includes(pid)) {
        scoreById[pid] = bankrolled[pid];
      }
      if ((scoreById[pid]?.bankroll ?? 0) <= 0) {
        scoreById[pid] = { ...scoreById[pid], out: true };
      }
    }

    carryOverPot = settleResult.carryOverPot;
    nextDealFunding = settleResult.settlement.nextDealFunding;

    const winnerGains = participants.reduce((sum, pid) => {
      const before = scoreBankroll(bankrolled[pid], buyIn);
      const after = scoreBankroll(scoreById[pid], buyIn);
      return sum + Math.max(0, after - before);
    }, 0);
    assert.ok(
      winnerGains <= fundedHandPot + 0.001,
      `${label} hand ${handNum}: winner gains ${winnerGains} exceed funded pot ${fundedHandPot}`,
    );

    assertSessionInvariants({
      label: `${label} (post-settle)`,
      playerIds,
      buyIn,
      ante,
      expectedTotal,
      carryOverPot,
      postedAntes: {},
      scoreById,
      events,
      handNumber: handNum,
    });
  }

  return {
    label,
    playerCount,
    buyIn,
    handsPlayed: handCount,
    expectedTotal: maxSessionChips(playerCount, buyIn, totalRebuys),
    totalRebuys,
    events,
    finalScoreById: scoreById,
  };
}

describe("e2e money engine — long sessions (2–8 players)", () => {
  const tableSizes = [2, 3, 4, 5, 6, 7, 8] as const;

  for (const n of tableSizes) {
    it(`${n} players × 60 hands: conservation + bankroll cap (buy-in 100)`, () => {
      const result = runLongSession({
        label: `${n}p-60`,
        playerCount: n,
        buyIn: 100,
        ante: 20,
        handCount: 60,
        splitPotEnabled: n >= 4,
        rebuyEvery: n >= 6 ? 12 : 0,
      });
      assert.equal(result.expectedTotal, n * 100 + result.totalRebuys);
      const replayed = replayEvents(result.events, { ...EMPTY_LEDGER, buyInFallback: 100 });
      const finalTotal = ledgerChipTotal(replayed);
      assert.ok(
        finalTotal <= result.expectedTotal,
        `final chips ${finalTotal} exceed ceiling ${result.expectedTotal}`,
      );
    });
  }

  it("6 players × 100 hands × $1000 buy-in: session cap 6000, no inflation", () => {
    const buyIn = 1000;
    const ante = 100;
    const playerCount = 6;
    const sessionCap = playerCount * buyIn;

    const result = runLongSession({
      label: "6p-100-1k",
      playerCount,
      buyIn,
      ante,
      handCount: 100,
      splitPotEnabled: true,
      rebuyEvery: 15,
    });

    assert.equal(result.expectedTotal, sessionCap + result.totalRebuys);
    const replayed = replayEvents(result.events, { ...EMPTY_LEDGER, buyInFallback: buyIn });
    const finalTotal = ledgerChipTotal(replayed);
    assert.ok(finalTotal <= result.expectedTotal);

    for (const pid of tableIds(playerCount)) {
      const br = scoreBankroll(result.finalScoreById[pid], buyIn);
      assert.ok(
        br <= result.expectedTotal,
        `${pid} final bankroll ${br} exceeds session cap ${result.expectedTotal}`,
      );
    }

    const maxBr = Math.max(
      ...tableIds(playerCount).map((pid) => scoreBankroll(result.finalScoreById[pid], buyIn)),
    );
    assert.ok(maxBr <= sessionCap + result.totalRebuys);
    assert.ok(maxBr <= 6000 + result.totalRebuys, `peak bankroll ${maxBr} suggests chip minting`);
  });

  it("2p bourré loop × 80 hands: concentrates chips without minting", () => {
    const result = runLongSession({
      label: "2p-bourre-80",
      playerCount: 2,
      buyIn: 100,
      ante: 20,
      handCount: 80,
    });
    const stacks = tableIds(2).map((pid) => scoreBankroll(result.finalScoreById[pid], 100));
    assert.equal(stacks.reduce((a, b) => a + b, 0) + potTotal(0, {}), 200);
    assert.ok(Math.max(...stacks) <= 200);
  });

  it("8p multi-bourré stress × 50 hands with periodic rebuys", () => {
    const result = runLongSession({
      label: "8p-stress",
      playerCount: 8,
      buyIn: 100,
      ante: 20,
      handCount: 50,
      rebuyEvery: 8,
    });
    assert.ok(result.totalRebuys >= 0);
    const replayed = replayEvents(result.events, { ...EMPTY_LEDGER, buyInFallback: 100 });
    assert.ok(ledgerChipTotal(replayed) <= 800 + result.totalRebuys);
  });
});

describe("e2e money engine — regression pins", () => {
  it("stale net cannot inflate displayed bankroll after return-to-buy-in ante", () => {
    const row = { bankroll: 100, net: 40 };
    assert.equal(scoreBankroll(row, 100), 100);
    assert.notEqual(100 + 40, scoreBankroll(row, 100));
  });

  it("tie carry post-ante: sessionChipTotal uses nextHandPot (carry + posted antes)", () => {
    const BUY_IN = 100;
    const ANTE = 20;
    const participants = ["p0", "p1", "p2"];
    const buyIn = processBuyIn({
      actionId: "buyin:carry-pin",
      playerIds: participants,
      buyInAmount: BUY_IN,
    });
    let events = [...buyIn.newEvents];
    let scoreById = Object.fromEntries(
      participants.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]),
    );
    let carryOverPot = 0;
    let nextDealFunding = null;

    for (let hand = 1; hand <= 4; hand += 1) {
      const ante = processAnte({
        actionId: `ante:carry:${hand}`,
        handId: String(hand),
        carryOverPot,
        participantIds: participants,
        scoreById,
        sessionStake: ANTE,
        buyInFallback: BUY_IN,
        nextDealFunding,
        existingEvents: events,
      });
      events = [...events, ...ante.newEvents];
      const bankrolled = Object.fromEntries(
        participants.map((pid) => [
          pid,
          {
            ...scoreById[pid],
            bankroll: ante.newBankrolls[pid] ?? scoreBankroll(scoreById[pid], BUY_IN),
            net: deriveScoreNet(ante.newBankrolls[pid] ?? 0, BUY_IN),
          },
        ]),
      );
      const legacyTotal = sessionChipTotal(bankrolled, {
        carryOverPot: 0,
        postedAntes: ante.postedAntes,
        buyInFallback: BUY_IN,
      });
      const canonicalTotal = sessionChipTotal(bankrolled, {
        nextHandPot: ante.collected?.nextHandPot,
        buyInFallback: BUY_IN,
      });
      assert.equal(canonicalTotal, 300);
      if (hand === 4) {
        assert.ok(legacyTotal < 300, "legacy formula undercounts when carry funds the pot");
      }

      if (hand === 4) break;

      const settle = processHandSettlement({
        actionId: `settle:carry:${hand}`,
        handId: String(hand),
        mode: hand === 3 ? "co_win_carry" : "win",
        winners: hand === 3 ? ["p0", "p1"] : ["p0"],
        participants,
        tricksByPlayer:
          hand === 3
            ? { p0: 2, p1: 2, p2: 1 }
            : hand === 2
              ? { p0: 3, p1: 2, p2: 0 }
              : { p0: 3, p1: 1, p2: 1 },
        scoreById: bankrolled,
        sessionStake: ANTE,
        carryIn: carryOverPot,
        postedAntes: ante.postedAntes,
        buyInFallback: BUY_IN,
        existingEvents: events,
      });
      events = [...events, ...settle.newEvents];
      scoreById = { ...bankrolled, ...settle.settlement.scoreById };
      carryOverPot = settle.carryOverPot;
      nextDealFunding = settle.settlement.nextDealFunding;
    }
  });

  it("6×1000 session: single player may hold all 6000 but never 6001", () => {
    const playerCount = 6;
    const buyIn = 1000;
    const result = runLongSession({
      label: "6p-cap-pin",
      playerCount,
      buyIn,
      ante: 50,
      handCount: 40,
    });
    const maxBr = Math.max(
      ...tableIds(playerCount).map((pid) => scoreBankroll(result.finalScoreById[pid], buyIn)),
    );
    assert.ok(maxBr <= 6000 + result.totalRebuys);
    assert.notEqual(maxBr, 15000);
  });
});
