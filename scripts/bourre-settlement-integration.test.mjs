/**
 * Integration tests: recordHand → nextDealFunding → buildPagatHandStart → collectNextHandAntes.
 * Mirrors the production persistence flow without Firebase.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runProductionSettlementDealFlow,
  simulatePagatHandStartFunding,
  simulateRecordHandSettlement,
} from "../docs/bourre-settlement-flow.js";
import { handAnteContribution, DEFAULT_HAND_ANTE } from "../docs/bourre-rules.js";

const buyIn = 1000;
const handAnte = 1;
const four = ["p1", "p2", "p3", "p4"];
const three = ["p1", "p2", "p3"];

function freshScores(ids) {
  return Object.fromEntries(ids.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
}

function logIntegrationCase(label, result) {
  const d = result.debug;
  console.info(`[bourre-integration] ${label}`, JSON.stringify(d, null, 2));
}

describe("production settlement → deal funding integration", () => {
  it("single bourré player pays full prior pot on next deal", () => {
    const scoreById = freshScores(four);
    const postedAntes = { p1: 1, p2: 1, p3: 1, p4: 1 };
    const result = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 1 },
      scoreById,
      sessionStake: handAnte,
      carryIn: 0,
      postedAntes,
      buyInFallback: buyIn,
    });
    logIntegrationCase("single-bourre", result);

    const settledPot = 4;
    assert.equal(result.debug.settledHandPot, settledPot);
    assert.deepEqual(result.debug.bourrePlayers, ["p3"]);
    assert.equal(result.debug.bourreReplacementDuePersisted.p3, settledPot);
    assert.equal(result.deal.collected.postedAntes.p3, settledPot);
    assert.equal(result.deal.collected.postedAntes.p1, handAnte);
    assert.notEqual(result.deal.collected.postedAntes.p3, handAnte);
  });

  it("multiple bourré players each pay full prior pot", () => {
    const previousPot = 250;
    const carryIn = previousPot - handAnte * four.length;
    const scoreById = freshScores(four);
    const postedAntes = Object.fromEntries(four.map((pid) => [pid, handAnte]));
    const result = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
      scoreById,
      sessionStake: handAnte,
      carryIn,
      postedAntes,
      buyInFallback: buyIn,
    });
    logIntegrationCase("multi-bourre-250", result);

    assert.equal(result.debug.settledHandPot, previousPot);
    assert.deepEqual(result.debug.bourrePlayers, ["p3", "p4"]);
    assert.equal(result.deal.collected.postedAntes.p3, previousPot);
    assert.equal(result.deal.collected.postedAntes.p4, previousPot);
    assert.equal(result.deal.collected.postedAntes.p1, handAnte);
    assert.equal(result.deal.collected.postedAntes.p2, handAnte);
    assert.equal(
      result.deal.collected.nextHandPot,
      previousPot + previousPot * 2 + handAnte * 2,
    );
  });

  it("folded player (not in participants) pays zero bourré penalty", () => {
    const active = ["p1", "p2"];
    const scoreById = freshScores(three);
    const postedAntes = { p1: 1, p2: 1 };
    const result = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: active,
      tricksByPlayer: { p1: 3, p2: 2 },
      scoreById,
      sessionStake: handAnte,
      postedAntes,
      buyInFallback: buyIn,
    });
    logIntegrationCase("folded-excluded", result);

    assert.deepEqual(result.debug.bourrePlayers, []);
    assert.equal(result.debug.bourreReplacementDuePersisted.p3, undefined);
    const deal = simulatePagatHandStartFunding({
      scoreById: result.settlement.scoreById,
      nextDealFunding: result.settlement.nextDealFunding,
      carryOverPot: result.settlement.carryOverPot,
      participantIds: three,
      sessionStake: handAnte,
      buyInFallback: buyIn,
    });
    assert.equal(deal.collected.postedAntes.p3, handAnte);
    assert.notEqual(deal.collected.postedAntes.p3, result.debug.settledHandPot);
  });

  it("stale score rows missing bourreReplacementDue recover via session nextDealFunding", () => {
    const scoreById = freshScores(four);
    const postedAntes = Object.fromEntries(four.map((pid) => [pid, handAnte]));
    const fresh = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
      scoreById,
      sessionStake: handAnte,
      postedAntes,
      buyInFallback: buyIn,
    });
    const stale = runProductionSettlementDealFlow(
      {
        mode: "win",
        winners: ["p1"],
        participants: four,
        tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
        scoreById,
        sessionStake: handAnte,
        postedAntes,
        buyInFallback: buyIn,
      },
      { staleDealRead: true },
    );
    logIntegrationCase("stale-read-recovery", stale);

    assert.equal(stale.deal.collected.postedAntes.p3, fresh.deal.collected.postedAntes.p3);
    assert.equal(stale.deal.collected.postedAntes.p4, fresh.deal.collected.postedAntes.p4);
    assert.ok(stale.deal.collected.postedAntes.p3 > handAnte);
    assert.equal(stale.debug.staleReadRecovered, true);
  });

  it("regression: historical pays ~1 instead of full pot when funding snapshot absent", () => {
    const settledPot = 250;
    const scoreById = freshScores(four);
    const settlement = simulateRecordHandSettlement({
      mode: "win",
      winners: ["p1"],
      participants: four,
      tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
      scoreById,
      sessionStake: handAnte,
      carryIn: settledPot - handAnte * four.length,
      postedAntes: Object.fromEntries(four.map((pid) => [pid, handAnte])),
      buyInFallback: buyIn,
    });

    const staleRows = Object.fromEntries(
      four.map((pid) => {
        const row = { ...settlement.scoreById[pid] };
        delete row.bourreReplacementDue;
        return [pid, row];
      }),
    );

    const withoutSnapshot = simulatePagatHandStartFunding({
      scoreById: settlement.scoreById,
      nextDealFunding: null,
      carryOverPot: settlement.carryOverPot,
      participantIds: four,
      sessionStake: handAnte,
      buyInFallback: buyIn,
      staleScoreById: staleRows,
    });

    const withSnapshot = simulatePagatHandStartFunding({
      scoreById: settlement.scoreById,
      nextDealFunding: settlement.nextDealFunding,
      carryOverPot: settlement.carryOverPot,
      participantIds: four,
      sessionStake: handAnte,
      buyInFallback: buyIn,
      staleScoreById: staleRows,
    });

    logIntegrationCase("historical-ante-bug", {
      debug: {
        settledHandPot: settlement.debug.settledHandPot,
        bourrePlayers: settlement.debug.bourrePlayers,
        withoutSnapshotAntes: withoutSnapshot.debug.finalAntesCollected,
        withSnapshotAntes: withSnapshot.debug.finalAntesCollected,
      },
    });

    assert.equal(withoutSnapshot.collected.postedAntes.p3, handAnte);
    assert.equal(withoutSnapshot.collected.postedAntes.p4, handAnte);
    assert.equal(withSnapshot.collected.postedAntes.p3, settledPot);
    assert.equal(withSnapshot.collected.postedAntes.p4, settledPot);
    assert.equal(
      handAnteContribution(staleRows.p3, handAnte),
      handAnte,
      "stale row alone charges base ante",
    );
  });

  it("no bourré: normal antes only, no replacement flags", () => {
    const scoreById = freshScores(three);
    const postedAntes = { p1: 1, p2: 1, p3: 1 };
    const result = runProductionSettlementDealFlow({
      mode: "win",
      winners: ["p1"],
      participants: three,
      tricksByPlayer: { p1: 3, p2: 1, p3: 1 },
      scoreById,
      sessionStake: handAnte,
      postedAntes,
      buyInFallback: buyIn,
    });
    logIntegrationCase("no-bourre", result);

    assert.deepEqual(result.debug.bourrePlayers, []);
    assert.equal(result.deal.collected.postedAntes.p1, handAnte);
    assert.equal(result.deal.collected.postedAntes.p2, handAnte);
    assert.equal(result.deal.collected.postedAntes.p3, handAnte);
    assert.equal(result.settlement.carryOverPot, 0);
  });
});
