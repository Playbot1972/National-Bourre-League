/**
 * Proof artifact: settlement → next-deal funding trace.
 * Run: node scripts/proof-settlement-trace.mjs
 */
import {
  bourrePlayerIds,
  handAnteContribution,
} from "../docs/bourre-rules.js";
import {
  runProductionSettlementDealFlow,
  simulateRecordHandSettlement,
} from "../docs/bourre-settlement-flow.js";

const buyIn = 1000;
const ante = 1;
const roster = ["p1", "p2", "p3", "p4"];
const activePlayers = roster;
const foldedPlayers = [];

const carryIn = 0;
const postedAntes = Object.fromEntries(roster.map((pid) => [pid, ante]));
const startingPot = carryIn + roster.length * ante;

const tricksByPlayer = { p1: 3, p2: 2, p3: 0, p4: 0 };
const scoreById = Object.fromEntries(roster.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));

const settlementOnly = simulateRecordHandSettlement({
  mode: "win",
  winners: ["p1"],
  participants: activePlayers,
  tricksByPlayer,
  scoreById: JSON.parse(JSON.stringify(scoreById)),
  sessionStake: ante,
  carryIn,
  postedAntes,
  buyInFallback: buyIn,
});

const full = runProductionSettlementDealFlow({
  mode: "win",
  winners: ["p1"],
  participants: activePlayers,
  tricksByPlayer,
  scoreById: JSON.parse(JSON.stringify(scoreById)),
  sessionStake: ante,
  carryIn,
  postedAntes,
  buyInFallback: buyIn,
});

const settledPot = full.debug.settledHandPot;
const bourrePlayers = bourrePlayerIds(tricksByPlayer, activePlayers);

const trace = {
  chronology: [
    {
      step: "hand-start",
      startingPot,
      carryIn,
      postedAntes: { ...postedAntes },
      activePlayers: [...activePlayers],
      foldedPlayers: [...foldedPlayers],
    },
    {
      step: "after-five-tricks",
      tricksWonByPlayer: { ...tricksByPlayer },
      handWinners: ["p1"],
      bourrePlayers,
    },
    {
      step: "recordHand-settlement",
      settlementMode: "win",
      payoutOrCarryover: {
        winnerImmediatePayout: full.settlement.solvent.appliedDeltas.p1,
        carryOverPot: full.settlement.carryOverPot,
        note: "Pot deferred to carry when bourré present (Pagat)",
      },
      settledPot,
      bourreReplacementDueByPlayer: full.debug.bourreReplacementDuePersisted,
      nextDealFundingSnapshot: full.settlement.nextDealFunding,
    },
    {
      step: "next-hand-start-funding",
      carryOverPotIntoNextHand: full.settlement.carryOverPot,
      finalAntesCollected: full.deal.collected.postedAntes,
      nextHandPot: full.deal.collected.nextHandPot,
      bankrollsAfterAnteCollection: full.deal.collected.bankrolls,
    },
  ],
  proofs: {
    bourreCount: bourrePlayers.length,
    bourreEachPayFullPot: bourrePlayers.every(
      (pid) => full.deal.collected.postedAntes[pid] === settledPot,
    ),
    nonBourrePayNormalAnte: ["p1", "p2"].every(
      (pid) => full.deal.collected.postedAntes[pid] === ante,
    ),
    foldedWouldPayZero: "N/A — no folded players in this trace; see integration test folded-excluded",
    nextHandPotFormula:
      settledPot + settledPot * bourrePlayers.length + ante * (roster.length - bourrePlayers.length),
    nextHandPotActual: full.deal.collected.nextHandPot,
    fundingSnapshotMatchesCollection:
      full.deal.collected.postedAntes.p3 ===
        full.settlement.nextDealFunding.byPlayer.p3.bourreReplacementDue &&
      full.deal.collected.postedAntes.p4 ===
        full.settlement.nextDealFunding.byPlayer.p4.bourreReplacementDue,
  },
  productionChain: [
    "recordHandClient / handleRecordHand",
    "  → settleHandDeltas (bourre-rules.js)",
    "  → applySolventSettlement",
    "  → buildNextDealFundingSnapshot → session.nextDealFunding",
    "  → score row bourreReplacementDue patches",
    "buildPagatHandStartPatch / runEnrollmentStepTransaction",
    "  → mergeNextDealFundingIntoScoreById(scoreById, session.nextDealFunding)",
    "  → collectNextHandAntes",
    "  → dealInitialHand",
  ],
};

console.log(JSON.stringify(trace, null, 2));
