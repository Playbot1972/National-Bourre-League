/**
 * Proof: exact production settlement → next-deal funding chain.
 *
 * Mirrors:
 *   recordHandClient / handleRecordHand
 *     → settleHandDeltas → applySolventSettlement
 *     → nextDealFundingFlags → buildNextDealFundingSnapshot
 *     → session.nextDealFunding + score.bourreReplacementDue
 *   runEnrollmentStepTransaction / buildPagatHandStartPatch
 *     → mergeNextDealFundingIntoScoreById
 *     → collectNextHandAntes → dealInitialHand
 *
 * Run: node scripts/proof-production-settlement-chain.mjs
 */
import {
  settleHandDeltas,
  applySolventSettlement,
  nextDealFundingFlags,
  buildNextDealFundingSnapshot,
  mergeNextDealFundingIntoScoreById,
  collectNextHandAntes,
  bourrePlayerIds,
  anteAlreadyPosted,
  handAnteContribution,
  scoreBankroll,
} from "../docs/bourre-rules.js";
import { dealInitialHand } from "../docs/game-engine.js";

const BUY_IN = 1000;
const ANTE = 1;

/** Step-by-step mirror of recordHandClient settlement half. */
function traceRecordHandClient({
  mode,
  winners,
  participants,
  tricksByPlayer,
  scoreById: scoreByIdIn,
  sessionStake = ANTE,
  carryIn = 0,
  postedAntes = {},
  buyInFallback = BUY_IN,
  limEnabled = false,
}) {
  const log = [];
  const scoreById = JSON.parse(JSON.stringify(scoreByIdIn));
  for (const pid of participants) {
    if (!scoreById[pid]) scoreById[pid] = { bankroll: buyInFallback, net: 0 };
  }

  log.push({
    fn: "recordHandClient",
    step: "inputs",
    startingPot:
      carryIn +
      participants.reduce((s, pid) => s + (postedAntes[pid] ?? 0), 0),
    carryIn,
    postedAntes: { ...postedAntes },
    activePlayers: [...participants],
    tricksByPlayer: { ...tricksByPlayer },
    winners: [...winners],
    mode,
  });

  const antePot = participants.reduce(
    (sum, pid) =>
      sum +
      (postedAntes[pid] ??
        handAnteContribution(scoreById[pid], sessionStake)),
    0,
  );
  const stakeForSettlement = (pid) =>
    anteAlreadyPosted(postedAntes, pid)
      ? 0
      : handAnteContribution(scoreById[pid], sessionStake);

  const handSettlement = settleHandDeltas({
    mode,
    winners,
    participants,
    tricksByPlayer,
    anteAmount: sessionStake,
    limEnabled,
    carryIn,
    antePot,
    stakeForPlayer: stakeForSettlement,
  });
  const {
    deltas: nominalDeltas,
    carryOverPot: nominalCarry,
    bourreIds,
    potState,
  } = handSettlement;

  log.push({
    fn: "settleHandDeltas",
    bourrePlayers: [...bourreIds],
    settledPot: potState.currentPot,
    carryOverPot: nominalCarry,
    nominalDeltas: { ...nominalDeltas },
  });

  const solvent = applySolventSettlement({
    mode,
    winners,
    participants,
    nominalDeltas,
    scoreById,
    carryOverPot: nominalCarry,
    buyInFallback,
    stakeForPlayer: stakeForSettlement,
  });

  log.push({
    fn: "applySolventSettlement",
    appliedDeltas: { ...solvent.appliedDeltas },
    bankrollsAfterSettlement: { ...solvent.bankrolls },
    carryOverPot: solvent.carryOverPot,
  });

  const bourreReplacementDueComputed = {};
  const scorePatches = {};
  for (const pid of participants) {
    const current = { ...scoreById[pid] };
    if (current.skipNextAnte) delete current.skipNextAnte;
    if (current.bourreReplacementDue != null) delete current.bourreReplacementDue;

    const funding = nextDealFundingFlags({
      playerId: pid,
      mode,
      winners,
      bourreIds,
      settledPot: potState.currentPot,
    });

    bourreReplacementDueComputed[pid] = funding.bourreReplacementDue ?? 0;

    const patch = {
      bankroll: solvent.bankrolls[pid] ?? scoreBankroll(current, buyInFallback),
      net: (current.net || 0) + (solvent.appliedDeltas[pid] ?? 0),
    };
    if (funding.bourreReplacementDue != null) {
      patch.bourreReplacementDue = funding.bourreReplacementDue;
    }
    if (funding.skipNextAnte) patch.skipNextAnte = true;
    scorePatches[pid] = patch;
    scoreById[pid] = { ...current, ...patch };
  }

  const sessionNextDealFunding = buildNextDealFundingSnapshot({
    settledPot: potState.currentPot,
    bourreIds,
    participants,
    mode,
    winners,
  });

  log.push({
    fn: "nextDealFundingFlags + buildNextDealFundingSnapshot",
    bourreReplacementDueComputed,
    scorePatchesWritten: scorePatches,
    sessionNextDealFundingWritten: JSON.parse(JSON.stringify(sessionNextDealFunding)),
  });

  return {
    log,
    scoreById,
    session: {
      carryOverPot: solvent.carryOverPot,
      nextDealFunding: sessionNextDealFunding,
    },
    bourreIds,
    potState,
  };
}

/** Mirror runEnrollmentStepTransaction read + buildPagatHandStartPatch funding. */
function traceRunEnrollmentStepTransaction({
  sessionData,
  scoreByIdReadFromFirestore,
  seatedIds,
  dealerId,
  sessionStake = ANTE,
  buyInFallback = BUY_IN,
  seed = 42,
}) {
  const log = [];

  log.push({
    fn: "runEnrollmentStepTransaction",
    step: "read session + scores in transaction",
    sessionNextDealFundingRead: JSON.parse(
      JSON.stringify(sessionData.nextDealFunding ?? null),
    ),
    scoreByIdReadFromFirestore: JSON.parse(JSON.stringify(scoreByIdReadFromFirestore)),
    note: "scoreById may be stale (missing bourreReplacementDue on rows)",
  });

  const merged = mergeNextDealFundingIntoScoreById(
    scoreByIdReadFromFirestore,
    sessionData.nextDealFunding,
  );

  log.push({
    fn: "mergeNextDealFundingIntoScoreById",
    mergedScoreRows: Object.fromEntries(
      seatedIds.map((pid) => [
        pid,
        {
          bankroll: merged[pid]?.bankroll,
          bourreReplacementDue: merged[pid]?.bourreReplacementDue ?? null,
          skipNextAnte: merged[pid]?.skipNextAnte ?? false,
        },
      ]),
    ),
  });

  const collected = collectNextHandAntes({
    carryOverPot: sessionData.carryOverPot || 0,
    participantIds: seatedIds,
    scoreById: merged,
    sessionStake,
    buyInFallback,
  });

  log.push({
    fn: "collectNextHandAntes",
    carryOverPot: sessionData.carryOverPot || 0,
    finalAntesCollected: { ...collected.postedAntes },
    nextHandPot: collected.nextHandPot,
    bankrollsAfterAnteCollection: { ...collected.bankrolls },
    activeParticipantsForDeal: [...collected.activeParticipants],
  });

  let dealStartState = null;
  if (collected.activeParticipants.length >= 2) {
    const deal = dealInitialHand({
      dealerId,
      participantIds: collected.activeParticipants,
      sortedPlayerIds: seatedIds,
      seed,
    });
    dealStartState = {
      phase: "reveal",
      participantIds: deal.participantIds,
      dealOrder: deal.dealOrder,
      turnPlayerId: deal.turnPlayerId,
      postedAntesOnCurrentHand: collected.postedAntes,
      seatedIds,
      dealerId,
    };
    log.push({
      fn: "dealInitialHand (via buildPagatHandStartPatch)",
      dealStartState,
    });
  }

  return { log, collected, merged, dealStartState };
}

function runEndToEndScenario(name, input, { staleScoreRead = false, foldedPlayers = [], seatedIds }) {
  const settlement = traceRecordHandClient(input);
  const staleRead = staleScoreRead
    ? Object.fromEntries(
        seatedIds.map((pid) => {
          const row = {
            ...(settlement.scoreById[pid] ?? { bankroll: input.buyInFallback ?? BUY_IN, net: 0 }),
          };
          delete row.bourreReplacementDue;
          delete row.skipNextAnte;
          return [pid, row];
        }),
      )
    : Object.fromEntries(
        seatedIds.map((pid) => [
          pid,
          settlement.scoreById[pid] ?? { bankroll: input.buyInFallback ?? BUY_IN, net: 0 },
        ]),
      );

  const enrollment = traceRunEnrollmentStepTransaction({
    sessionData: {
      carryOverPot: settlement.session.carryOverPot,
      nextDealFunding: settlement.session.nextDealFunding,
    },
    scoreByIdReadFromFirestore: staleRead,
    seatedIds,
    dealerId: input.dealerId ?? seatedIds[0],
    sessionStake: input.sessionStake ?? ANTE,
    buyInFallback: input.buyInFallback ?? BUY_IN,
    seed: input.seed ?? 99,
  });

  return {
    scenario: name,
    foldedPlayers,
    chronology: [...settlement.log, ...enrollment.log],
    proofs: {
      staleScoreReadSimulated: staleScoreRead,
      bourreReplacementDueOnSession: settlement.session.nextDealFunding,
      finalAntes: enrollment.collected.postedAntes,
      nextHandPot: enrollment.collected.nextHandPot,
    },
  };
}

// --- Scenario 1: Full E2E trace (4 players, 2 bourré) ---
const e2e = runEndToEndScenario(
  "e2e-full-chain",
  {
    mode: "win",
    winners: ["p1"],
    participants: ["p1", "p2", "p3", "p4"],
    tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
    scoreById: Object.fromEntries(
      ["p1", "p2", "p3", "p4"].map((p) => [p, { bankroll: BUY_IN, net: 0 }]),
    ),
    carryIn: 0,
    postedAntes: { p1: 1, p2: 1, p3: 1, p4: 1 },
    dealerId: "p1",
  },
  { seatedIds: ["p1", "p2", "p3", "p4"] },
);

// --- Scenario 2: User example pot=20, A/B/C active, D folded ---
const scenarioFolded = runEndToEndScenario(
  "pot-20-folded-D-excluded",
  {
    mode: "win",
    winners: ["A"],
    participants: ["A", "B", "C"],
    tricksByPlayer: { A: 3, B: 2, C: 0 },
    scoreById: Object.fromEntries(
      ["A", "B", "C", "D"].map((p) => [p, { bankroll: BUY_IN, net: 0 }]),
    ),
    carryIn: 17,
    postedAntes: { A: 1, B: 1, C: 1 },
    dealerId: "A",
  },
  {
    foldedPlayers: ["D"],
    seatedIds: ["A", "B", "C", "D"],
  },
);

// --- Scenario 3: Multi bourré pot=20 ---
const scenarioMultiBourre = runEndToEndScenario(
  "pot-20-multi-bourre",
  {
    mode: "win",
    winners: ["A"],
    participants: ["A", "B", "C"],
    tricksByPlayer: { A: 5, B: 0, C: 0 },
    scoreById: Object.fromEntries(
      ["A", "B", "C"].map((p) => [p, { bankroll: BUY_IN, net: 0 }]),
    ),
    carryIn: 17,
    postedAntes: { A: 1, B: 1, C: 1 },
    dealerId: "A",
  },
  { seatedIds: ["A", "B", "C"] },
);

// --- Scenario 4: Stale snapshot ---
const scenarioStale = runEndToEndScenario(
  "stale-scoreById-recovered-by-session-nextDealFunding",
  {
    mode: "win",
    winners: ["p1"],
    participants: ["p1", "p2", "p3", "p4"],
    tricksByPlayer: { p1: 3, p2: 2, p3: 0, p4: 0 },
    scoreById: Object.fromEntries(
      ["p1", "p2", "p3", "p4"].map((p) => [p, { bankroll: BUY_IN, net: 0 }]),
    ),
    carryIn: 0,
    postedAntes: { p1: 1, p2: 1, p3: 1, p4: 1 },
    dealerId: "p1",
  },
  { staleScoreRead: true, seatedIds: ["p1", "p2", "p3", "p4"] },
);

const expected = {
  scenarioFolded: {
    startingPot: 20,
    C_owes: 20,
    D_owes: 0,
    nextHandAntes: { A: 1, B: 1, C: 20, D: 1 },
    nextHandPot: 20 + 20 + 1 + 1 + 1,
  },
  scenarioMultiBourre: {
    startingPot: 20,
    B_owes: 20,
    C_owes: 20,
    totalBourreReplacement: 40,
    nextHandPot: 20 + 20 + 20 + 1,
  },
};

const actualFolded = scenarioFolded.proofs;
const actualMulti = scenarioMultiBourre.proofs;

const verification = {
  foldedScenario: {
    C_owes_20: actualFolded.finalAntes.C === 20,
    D_owes_0_bourre: actualFolded.finalAntes.D === 1,
    D_not_in_bourreIds:
      !scenarioFolded.chronology
        .find((s) => s.fn === "settleHandDeltas")
        ?.bourrePlayers?.includes("D"),
    nextHandPot:
      actualFolded.nextHandPot === expected.scenarioFolded.nextHandPot,
  },
  multiBourreScenario: {
    B_owes_20: actualMulti.finalAntes.B === 20,
    C_owes_20: actualMulti.finalAntes.C === 20,
    totalReplacement:
      actualMulti.finalAntes.B + actualMulti.finalAntes.C === 40,
    nextHandPot:
      actualMulti.nextHandPot === expected.scenarioMultiBourre.nextHandPot,
  },
  staleScenario: {
    p3_collects_full_pot_not_1:
      scenarioStale.proofs.finalAntes.p3 === 4 &&
      scenarioStale.proofs.finalAntes.p3 !== 1,
    p4_collects_full_pot_not_1: scenarioStale.proofs.finalAntes.p4 === 4,
    staleReadSimulated: true,
  },
};

console.log(
  JSON.stringify(
    {
      productionChain: [
        "finalizeHandFromCardPlay → recordHand",
        "recordHandClient (firestore.js:2375+) OR handleRecordHand (gameHandlers.js:1720+)",
        "  settleHandDeltas (bourre-rules.js)",
        "  applySolventSettlement",
        "  nextDealFundingFlags per score row (firestore.js:2525)",
        "  buildNextDealFundingSnapshot → session.nextDealFunding (firestore.js:2565)",
        "runEnrollmentStepTransaction (firestore.js:1162)",
        "  mergeNextDealFundingIntoScoreById (firestore.js:1173)",
        "buildPagatHandStartPatch → collectNextHandAntes (firestore.js:1432)",
        "  dealInitialHand (firestore.js:1473)",
      ],
      scenarios: {
        e2eFullChain: e2e,
        pot20FoldedDExcluded: scenarioFolded,
        pot20MultiBourre: scenarioMultiBourre,
        staleSnapshotRecovery: scenarioStale,
      },
      expectedVsActual: { expected, verification },
      allVerificationPassed: Object.values(verification).every((group) =>
        Object.values(group).every((v) => v === true),
      ),
    },
    null,
    2,
  ),
);
