#!/usr/bin/env node
/**
 * Production-path ledger invariant trace — uses runV1AnteCollection / runV1HandSettlement
 * (same wrappers as docs/firestore.js and functions/gameHandlers.js).
 *
 * Usage:
 *   node scripts/ledger-invariant-trace.mjs 3p
 *   node scripts/ledger-invariant-trace.mjs 5p-idle
 *   node scripts/ledger-invariant-trace.mjs soak
 */
import assert from "node:assert/strict";
import {
  processBuyIn,
  deriveScoreNet,
  scoreBankroll,
} from "../docs/money-engine.js";
import {
  runV1AnteCollection,
  runV1HandSettlement,
  runV1Rebuy,
  assertTableChipInvariant,
  computeCarryForAnte,
  baselineFromSessionDoc,
  buildSessionChipSnapshot,
  applyRebuyToBaseline,
  applyBourreMintToBaseline,
  initialSessionBaseline,
  baselineDocFromBaseline,
  detectBourreMintDelta,
  compareUiToLedgerSnapshot,
} from "../docs/money-persistence.js";
import { emptyLedgerState } from "../docs/money-engine.js";

const BUY_IN = 100;
const ANTE = 20;

function ids(n) {
  return Array.from({ length: n }, (_, i) => `p${i}`);
}

function freshScores(playerIds) {
  return Object.fromEntries(playerIds.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]));
}

function tricksWithWinner(participants, winnerId, bourreIds = []) {
  const tricks = Object.fromEntries(participants.map((pid) => [pid, 0]));
  const nonBourre = participants.filter((pid) => !bourreIds.includes(pid));
  const others = nonBourre.filter((pid) => pid !== winnerId);
  tricks[winnerId] = Math.max(1, 5 - others.length);
  let rem = 5 - tricks[winnerId];
  for (const pid of others) {
    tricks[pid] = rem > 0 ? 1 : 0;
    if (rem > 0) rem -= 1;
  }
  return tricks;
}

function tricksTie(participants, leaders = 2) {
  const tricks = Object.fromEntries(participants.map((pid) => [pid, 0]));
  const leadersList = participants.slice(0, leaders);
  const per = Math.floor(5 / leaders);
  let rem = 5 - per * leaders;
  for (const pid of leadersList) {
    tricks[pid] = per + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
  }
  return tricks;
}

function logStep(label, result) {
  console.log(
    JSON.stringify({
      label,
      ok: result.ok,
      actual: result.actual,
      expected: result.expected,
      bankrollSum: result.bankrollSum,
      potSum: result.potSum,
      carryPot: result.carryPot,
    }),
  );
  if (!result.ok) {
    console.error(result.errors);
    process.exit(1);
  }
}

function checkInvariant(state, label, handId) {
  const snapshot = buildSessionChipSnapshot(state.scoreById, {
    carryOverPot: state.carryOverPot,
    currentHand: { postedAntes: state.postedAntes },
    buyInFallback: BUY_IN,
    playerIds: state.playerIds,
  });
  const result = assertTableChipInvariant(snapshot, state.baseline, {
    sessionId: "trace",
    label,
    handId,
  });
  logStep(label, result);
  return result;
}

function runProductionHand(state, handId, input) {
  const { mode = "win", winners, participants, tricksByPlayer } = input;
  const pendingPosted = state.postedAntes ?? {};
  const carryForAnte = computeCarryForAnte(state.carryOverPot, pendingPosted);

  const ante = runV1AnteCollection({
    sessionId: "trace",
    handNumber: handId,
    carryOverPot: carryForAnte,
    participantIds: participants,
    scoreById: state.scoreById,
    sessionStake: state.ante,
    buyInFallback: BUY_IN,
    nextDealFunding: state.nextDealFunding,
    existingEvents: state.events,
    ledger: {
      ...emptyLedgerState(BUY_IN),
      bankrolls: Object.fromEntries(
        state.playerIds.map((pid) => [pid, scoreBankroll(state.scoreById[pid], BUY_IN)]),
      ),
      carryOverPot: state.carryOverPot,
      postedAntes: { ...state.postedAntes },
    },
  });
  state.events = [...state.events, ...ante.newEvents];
  for (const pid of participants) {
    if (ante.newBankrolls[pid] != null) {
      state.scoreById[pid] = {
        ...state.scoreById[pid],
        bankroll: ante.newBankrolls[pid],
        net: deriveScoreNet(ante.newBankrolls[pid], BUY_IN),
      };
    }
  }
  state.postedAntes = { ...ante.postedAntes };
  checkInvariant(state, `after-ante:h${handId}`, handId);

  const settlement = runV1HandSettlement({
    sessionId: "trace",
    handNumber: handId,
    mode,
    winners,
    participants,
    tricksByPlayer,
    scoreById: state.scoreById,
    sessionStake: state.ante,
    carryIn: carryForAnte,
    postedAntes: ante.postedAntes,
    buyInFallback: BUY_IN,
    existingEvents: state.events,
  });
  state.events = [...state.events, ...settlement.newEvents];
  state.carryOverPot = settlement.carryOverPot;
  state.nextDealFunding = settlement.settlement.nextDealFunding;
  state.postedAntes = {};
  for (const pid of state.playerIds) {
    const br =
      settlement.newBankrolls[pid] ?? scoreBankroll(state.scoreById[pid], BUY_IN);
    state.scoreById[pid] = {
      ...state.scoreById[pid],
      bankroll: br,
      net: deriveScoreNet(br, BUY_IN),
    };
  }
  checkInvariant(state, `after-settlement:h${handId}`, handId);
}

function run3pScripted() {
  const players = ids(3);
  const buyIn = processBuyIn({
    actionId: "buyin:3p",
    playerIds: players,
    buyInAmount: BUY_IN,
  });
  const state = {
    playerIds: players,
    ante: ANTE,
    events: buyIn.newEvents,
    baseline: initialSessionBaseline(3, BUY_IN),
    scoreById: freshScores(players),
    carryOverPot: 0,
    postedAntes: {},
    nextDealFunding: null,
  };
  checkInvariant(state, "session-start", 0);

  // Hand 1: mixed I'm out (2 of 3)
  runProductionHand(state, 1, {
    winners: ["p0"],
    participants: ["p0", "p1"],
    tricksByPlayer: tricksWithWinner(["p0", "p1"], "p0"),
  });
  assert.equal(scoreBankroll(state.scoreById.p2, BUY_IN), BUY_IN, "idle p2 unchanged");

  // Hand 2: bourré on p2
  runProductionHand(state, 2, {
    winners: ["p0"],
    participants: players,
    tricksByPlayer: tricksWithWinner(players, "p0", ["p2"]),
  });

  console.log("3p scripted run: all invariant checks ok:true");
}

function run5pIdleScripted() {
  const players = ids(5);
  const buyIn = processBuyIn({
    actionId: "buyin:5p",
    playerIds: players,
    buyInAmount: BUY_IN,
  });
  const state = {
    playerIds: players,
    ante: 5,
    events: buyIn.newEvents,
    baseline: initialSessionBaseline(5, BUY_IN),
    scoreById: freshScores(players),
    carryOverPot: 0,
    postedAntes: {},
    nextDealFunding: null,
  };
  state.scoreById.p4 = { bankroll: 0, net: -BUY_IN, out: true };
  const redistribute = Math.floor(BUY_IN / 4);
  for (const pid of ["p0", "p1", "p2", "p3"]) {
    state.scoreById[pid] = {
      bankroll: BUY_IN + redistribute,
      net: redistribute,
    };
  }
  checkInvariant(state, "session-start-5p", 0);

  const active = ["p0", "p1", "p2", "p3"];
  for (let h = 1; h <= 8; h += 1) {
    const winner = active[h % active.length];
    const bourre = h % 3 === 0 ? [active[(h + 1) % active.length]] : [];
    runProductionHand(state, h, {
      winners: [winner],
      participants: active,
      tricksByPlayer: tricksWithWinner(active, winner, bourre),
    });
    assert.equal(scoreBankroll(state.scoreById.p4, BUY_IN), 0, "idle/broke p4 stays 0");
  }
  console.log("5p idle-seat run: all invariant checks ok:true");
}

function runSoak() {
  const rng = mulberry32(0xdeadbeef);
  const TARGET = 20;

  for (const n of [3, 5]) {
    const players = ids(n);
    const buyIn = processBuyIn({
      actionId: `buyin:soak-${n}p`,
      playerIds: players,
      buyInAmount: BUY_IN,
    });
    const state = {
      playerIds: players,
      ante: 5,
      events: buyIn.newEvents,
      baseline: initialSessionBaseline(n, BUY_IN),
      scoreById: freshScores(players),
      carryOverPot: 0,
      postedAntes: {},
      nextDealFunding: null,
    };
    let hands = 0;
    for (let attempt = 0; hands < TARGET && attempt < TARGET * 4; attempt += 1) {
      if (state.scoreById.p2 && state.scoreById.p2.bankroll <= 0 && rng() < 0.2) {
        const rebuy = runV1Rebuy({
          sessionId: "soak",
          playerId: "p2",
          buyInAmount: BUY_IN,
          existingEvents: state.events,
          ledger: {
            ...emptyLedgerState(BUY_IN),
            bankrolls: Object.fromEntries(
              players.map((pid) => [pid, scoreBankroll(state.scoreById[pid], BUY_IN)]),
            ),
            carryOverPot: state.carryOverPot,
            postedAntes: { ...state.postedAntes },
          },
        });
        state.events = [...state.events, ...rebuy.newEvents];
        state.baseline = applyRebuyToBaseline(state.baseline, BUY_IN);
        state.scoreById.p2 = { bankroll: rebuy.newBankrolls.p2 ?? BUY_IN, net: 0 };
        checkInvariant(state, `rebuy-p2-${hands}`, hands);
      }

      const willing = players.filter(
        (pid) => scoreBankroll(state.scoreById[pid], BUY_IN) > 0 && rng() < 0.9,
      );
      if (willing.length < 2) continue;
      const winner = willing[Math.floor(rng() * willing.length)];
      const bourre =
        rng() < 0.2
          ? willing.filter((pid) => pid !== winner).slice(0, 1)
          : [];
      const mode = rng() < 0.1 ? "co_win_carry" : "win";
      const winners =
        mode === "co_win_carry" ? willing.slice(0, 2) : [winner];
      const tricks =
        mode === "co_win_carry"
          ? tricksTie(willing, winners.length)
          : tricksWithWinner(willing, winner, bourre);

      runProductionHand(state, hands + 1, {
        mode,
        winners,
        participants: willing,
        tricksByPlayer: tricks,
      });

      const uiBankrolls = Object.fromEntries(
        players.map((pid) => [pid, scoreBankroll(state.scoreById[pid], BUY_IN)]),
      );
      const snapshot = buildSessionChipSnapshot(state.scoreById, {
        carryOverPot: state.carryOverPot,
        currentHand: { postedAntes: state.postedAntes },
      });
      const uiPot =
        Object.values(state.postedAntes).reduce((s, v) => s + v, 0) + state.carryOverPot;
      const uiMatches = compareUiToLedgerSnapshot(
        { bankrolls: uiBankrolls, pot: uiPot, carryPot: state.carryOverPot },
        snapshot,
      );
      console.log(
        JSON.stringify({
          tableId: "soak",
          handId: hands + 1,
          seatCount: n,
          uiMatchesLedger: uiMatches,
        }),
      );
      if (!uiMatches) process.exit(1);
      hands += 1;
    }
    assert.equal(hands, TARGET, `${n}p soak expected ${TARGET} hands`);
  }
  console.log("20-hand soak: all invariant checks ok:true, uiMatchesLedger:true");
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const mode = process.argv[2] ?? "3p";
if (mode === "3p") run3pScripted();
else if (mode === "5p-idle") run5pIdleScripted();
else if (mode === "soak") runSoak();
else {
  console.error("Usage: node scripts/ledger-invariant-trace.mjs [3p|5p-idle|soak]");
  process.exit(1);
}
