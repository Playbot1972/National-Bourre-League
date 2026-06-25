#!/usr/bin/env node
/**
 * PR #344 proof trace: 3-player $20 ante target scenario.
 * Run: node scripts/proof-pr344-target-scenario.mjs
 */
import {
  collectHandAntes,
  collectNextHandAntes,
  sessionChipTotal,
  settleHandDeltas,
  applySolventSettlement,
  anteAlreadyPosted,
  handAnteContribution,
  bourreRemaindersFromSettlement,
  buildNextDealFundingSnapshot,
  mergeNextDealFundingIntoScoreById,
} from "../docs/bourre-rules.js";
import {
  simulateRecordHandSettlement,
  runProductionSettlementDealFlow,
  applyRecordHandFundingToScores,
} from "../docs/bourre-settlement-flow.js";

const BUY_IN = 100;
const ANTE = 20;
const HUMAN = "human";
const BOT1 = "bot1";
const BOT2 = "bot2";
const THREE = [HUMAN, BOT1, BOT2];

function chipSnapshot(label, bankrolls, { carryOverPot = 0, postedAntes = {} } = {}) {
  const scoreById = Object.fromEntries(
    THREE.map((pid) => [pid, { bankroll: bankrolls[pid] ?? 0 }]),
  );
  const total = sessionChipTotal(scoreById, {
    carryOverPot,
    postedAntes,
    buyInFallback: BUY_IN,
  });
  return {
    step: label,
    bankrolls: { ...bankrolls },
    carryOverPot,
    postedAntes: { ...postedAntes },
    tablePot:
      Math.max(0, Number(carryOverPot) || 0) +
      Object.values(postedAntes).reduce((s, n) => s + Math.max(0, Number(n) || 0), 0),
    sessionChipTotal: total,
    conserved: total === 300,
  };
}

function rows(snap) {
  return THREE.map((pid) => ({
    player: pid,
    bankroll: snap.bankrolls[pid],
    postedAnte: snap.postedAntes[pid] ?? null,
    skipNextAnte: snap.funding?.[pid]?.skipNextAnte ?? null,
  }));
}

/** Legacy frozen-pot model (pre-PR #344) for before/after comparison. */
function legacyFrozenPotNextHandPot(carryOverPot, bourreReplacementDue, normalAntes) {
  return carryOverPot + bourreReplacementDue + normalAntes;
}

function traceManualSteps() {
  const scoreById = Object.fromEntries(
    THREE.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]),
  );
  const steps = [];

  steps.push(
    chipSnapshot(
      "1_initial_state",
      Object.fromEntries(THREE.map((pid) => [pid, BUY_IN])),
    ),
  );

  const dealAntes = collectHandAntes({
    participants: THREE,
    scoreById,
    buyInFallback: BUY_IN,
    stakeForPlayer: () => ANTE,
  });
  for (const pid of THREE) scoreById[pid].bankroll = dealAntes.bankrolls[pid];
  steps.push(
    chipSnapshot("2_after_ante_collection", dealAntes.bankrolls, {
      postedAntes: dealAntes.postedAntes,
    }),
  );

  const postedAntes = dealAntes.postedAntes;
  const stakeForSettlement = (pid) =>
    anteAlreadyPosted(postedAntes, pid) ? 0 : ANTE;
  const antePot = THREE.reduce((s, pid) => s + postedAntes[pid], 0);

  const nominal = settleHandDeltas({
    mode: "win",
    winners: [HUMAN],
    participants: THREE,
    tricksByPlayer: { [HUMAN]: 3, [BOT1]: 2, [BOT2]: 0 },
    anteAmount: ANTE,
    limEnabled: false,
    carryIn: 0,
    antePot,
    stakeForPlayer: stakeForSettlement,
  });

  const solvent = applySolventSettlement({
    mode: "win",
    winners: [HUMAN],
    participants: THREE,
    nominalDeltas: nominal.deltas,
    scoreById,
    carryOverPot: nominal.carryOverPot,
    buyInFallback: BUY_IN,
    stakeForPlayer: stakeForSettlement,
  });

  for (const pid of THREE) scoreById[pid].bankroll = solvent.bankrolls[pid];

  const funding = applyRecordHandFundingToScores({
    scoreById,
    participants: THREE,
    mode: "win",
    winners: [HUMAN],
    bourreIds: nominal.bourreIds,
    potState: nominal.potState,
    bourreRemaindersByPlayer: bourreRemaindersFromSettlement(
      nominal.bourreIds,
      nominal.deltas,
      solvent.appliedDeltas,
    ),
  });

  const afterPayout = chipSnapshot("3_after_hand_payout", solvent.bankrolls, {
    carryOverPot: solvent.carryOverPot,
  });
  afterPayout.funding = funding.debug.fundingFlagsRead;
  afterPayout.bourreIds = nominal.bourreIds;
  afterPayout.sessionNextDealFunding = funding.nextDealFunding;
  steps.push(afterPayout);

  const bourreFunding = chipSnapshot(
    "4_after_bourre_next_pot_funding",
    solvent.bankrolls,
    { carryOverPot: solvent.carryOverPot },
  );
  bourreFunding.note =
    "carryOverPot holds bourré $60 paid at settlement; bot2.skipNextAnte=true";
  bourreFunding.funding = funding.nextDealFunding.byPlayer;
  steps.push(bourreFunding);

  const merged = mergeNextDealFundingIntoScoreById(
    scoreById,
    funding.nextDealFunding,
  );
  const nextDeal = collectNextHandAntes({
    carryOverPot: solvent.carryOverPot,
    participantIds: THREE,
    scoreById: merged,
    sessionStake: ANTE,
    buyInFallback: BUY_IN,
  });

  const afterNextAnte = chipSnapshot("5_after_next_hand_ante_collection", nextDeal.bankrolls, {
    carryOverPot: solvent.carryOverPot,
    postedAntes: nextDeal.postedAntes,
  });
  afterNextAnte.nextHandPot = nextDeal.nextHandPot;
  afterNextAnte.anteObligations = Object.fromEntries(
    THREE.map((pid) => [pid, handAnteContribution(merged[pid], ANTE)]),
  );
  steps.push(afterNextAnte);

  return {
    steps,
    nominal,
    solvent,
    nextDeal,
    legacyBugNextHandPot: legacyFrozenPotNextHandPot(60, 60, 40),
  };
}

function traceProductionPath() {
  const scoreById = Object.fromEntries(
    THREE.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]),
  );
  const postedAntes = Object.fromEntries(THREE.map((pid) => [pid, ANTE]));

  const settlement = simulateRecordHandSettlement({
    mode: "win",
    winners: [HUMAN],
    participants: THREE,
    tricksByPlayer: { [HUMAN]: 3, [BOT1]: 2, [BOT2]: 0 },
    scoreById,
    sessionStake: ANTE,
    postedAntes,
    buyInFallback: BUY_IN,
  });

  const prod = runProductionSettlementDealFlow({
    mode: "win",
    winners: [HUMAN],
    participants: THREE,
    tricksByPlayer: { [HUMAN]: 3, [BOT1]: 2, [BOT2]: 0 },
    scoreById: Object.fromEntries(THREE.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }])),
    sessionStake: ANTE,
    postedAntes,
    buyInFallback: BUY_IN,
  });

  return {
    mirrorsRecordHandClient: {
      module: "docs/firestore.js → recordHandClient",
      chain: [
        "settleHandDeltas",
        "applySolventSettlement",
        "bourreRemaindersFromSettlement",
        "nextDealFundingFlags + buildNextDealFundingSnapshot",
        "session.carryOverPot + session.nextDealFunding batch write",
      ],
      bankrollsAfter: Object.fromEntries(
        THREE.map((pid) => [pid, settlement.scoreById[pid].bankroll]),
      ),
      carryOverPot: settlement.carryOverPot,
      nextDealFunding: settlement.nextDealFunding,
      bourreReplacementDuePersisted: settlement.debug.bourreReplacementDuePersisted,
    },
    mirrorsHandleRecordHand: {
      module: "functions/gameHandlers.js → handleRecordHand",
      chain: [
        "settleHandDeltas (vendor/bourre-rules.js)",
        "applySolventSettlement",
        "bourreRemaindersFromSettlement",
        "nextDealFundingFlags + buildNextDealFundingSnapshot",
        "session.carryOverPot + session.nextDealFunding batch write",
      ],
      bankrollsAfter: Object.fromEntries(
        THREE.map((pid) => [pid, prod.settlement.scoreById[pid].bankroll]),
      ),
      carryOverPot: prod.settlement.carryOverPot,
      nextDealFunding: prod.settlement.nextDealFunding,
    },
    mirrorsBuildPagatHandStartPatch: {
      module: "docs/firestore.js + gameHandlers.js → enrollment deal",
      chain: [
        "mergeNextDealFundingIntoScoreById(scoreById, session.nextDealFunding)",
        "collectNextHandAntes({ carryOverPot, scoreById, sessionStake })",
      ],
      postedAntes: prod.deal.collected.postedAntes,
      nextHandPot: prod.deal.collected.nextHandPot,
      bankrollsAfter: prod.deal.collected.bankrolls,
    },
  };
}

const manual = traceManualSteps();
const production = traceProductionPath();

const proof = {
  pr: 344,
  scenario: "3 players, $100 buy-in, $20 ante, Human 3 / Bot1 2 / Bot2 bourré",
  tests: {
    added: [
      'bourre-rules.test.mjs → "3-player $20 ante target scenario" → "winner takes pot; bourré pays at settlement; next pot = bourré + two antes"',
    ],
    updated: [
      'bourre-rules.test.mjs → "does not double-deduct ante when already posted at deal"',
      'bourre-rules.test.mjs → "conserves chips through deal and win settlement for three players"',
      'bourre-rules.test.mjs → "each bourré player pays full pot at settlement and skips next ante"',
      'bourre-rules.test.mjs → "win with bourré: winner takes pot; bourré pays at settlement and skips next ante"',
      'bourre-rules.test.mjs → "bourré win: winner takes pot; two bourré seed next pot + antes"',
      'bourre-rules.test.mjs → suite renamed: "bourré at settlement + next-deal funding"',
      'pagat-rules-compliance.test.mjs → rules 10–15 (settlement-at-hand-end semantics)',
      'bourre-settlement-integration.test.mjs → full production funding path',
      'settlementCopy.test.ts → "buildHandOutcomeView for single winner with bourré"',
    ],
  },
  accounting: {
    before_pr344_bug: {
      after_hand_payout: { human: 80, bot1: 80, bot2: 80, carryOverPot: 60 },
      next_hand_pot: 160,
      note: "Frozen pot + bourreReplacementDue on next deal: 60 + 60 + 20 + 20",
    },
    after_pr344: manual.steps.reduce((acc, s) => {
      acc[s.step] = {
        bankrolls: s.bankrolls,
        carryOverPot: s.carryOverPot,
        postedAntes: s.postedAntes,
        nextHandPot: s.nextHandPot ?? undefined,
        sessionChipTotal: s.sessionChipTotal,
        conserved: s.conserved,
      };
      return acc;
    }, {}),
  },
  confirmations: {
    total300EveryStep: manual.steps.every((s) => s.conserved),
    nextHandPotIs100Not160: manual.nextDeal.nextHandPot === 100,
    legacyBugWouldBe160: manual.legacyBugNextHandPot === 160,
    bourreExemptFromNextAnte: manual.steps[4].anteObligations[BOT2] === 0,
    twoTrickLoserAntesNormally: manual.steps[4].anteObligations[BOT1] === ANTE,
    bot2PostedAnteNextDeal: manual.nextDeal.postedAntes[BOT2] === 0,
    bot1PostedAnteNextDeal: manual.nextDeal.postedAntes[BOT1] === ANTE,
  },
  productionPath: production,
  verification: {
    allPassed:
      manual.steps.every((s) => s.conserved) &&
      manual.nextDeal.nextHandPot === 100 &&
      manual.legacyBugNextHandPot === 160 &&
      manual.nextDeal.postedAntes[BOT2] === 0 &&
      manual.nextDeal.postedAntes[BOT1] === ANTE,
  },
};

console.log(JSON.stringify(proof, null, 2));
if (!proof.verification.allPassed) process.exitCode = 1;
