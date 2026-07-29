/**
 * Rules-aware Monte Carlo audit of Bourré bot fold, draw, and play heuristics.
 *
 * Usage: npx tsx scripts/bot-intelligence-audit.ts
 */
import { maxDrawDiscards } from "../src/game/drawLimit.ts";
import {
  botShouldFoldDraw,
  botShouldPassDecision,
  estimateHandStrength,
  botDrawDiscardIndices,
  botPlayCardIndex,
  buildBotMoveContext,
  BOT_PASS_P_THRESHOLD,
} from "../src/game/botSearch.ts";
import { effectivePlayerHand } from "../src/game/invariants.ts";
import { getLegalPlayIndices, type PlayContext } from "../src/game/legal.ts";
import { applyPlayerPlayCard } from "../src/game/play.ts";
import { applyPlayerDraw, advanceAfterDraw } from "../src/game/draw.ts";
import { pileFromPublicHand, totalAvailableReplacements } from "../src/game/drawPile.ts";
import { buildPlayValidationState } from "../src/game/playContext.ts";
import { shuffledDeckFromSeed } from "../src/game/deckState.ts";
import { HAND_PHASE } from "../src/game/types.ts";
import type { Card } from "../src/types.ts";
import {
  applyBotDraw,
  applyBotPlay,
  initSimulatedHand,
  type SimulatedHandState,
} from "../src/game/testHelpers.ts";

const quick = process.env.AUDIT_QUICK === "1";
const FOLD_ROLLOUTS = quick ? 20 : 80;
const DRAW_ROLLOUTS = quick ? 15 : 60;
const PLAY_ROLLOUTS = quick ? 10 : 40;
const FOLD_HAND_SAMPLES = quick ? 50 : 400;
const DRAW_DECISION_SAMPLES = quick ? 30 : 250;
const PLAY_DECISION_SAMPLES = quick ? 80 : 600;

const FOLD_STAY_IN_THRESHOLD = 0.12;
const FOLD_FOLD_OUT_THRESHOLD = 0.55;
const DRAW_SUBOPTIMAL_GAP = 0.08;
const PLAY_SUBOPTIMAL_GAP = 0.15;

type FoldCase = {
  seed: number;
  playerId: string;
  n: number;
  strength: number;
  botFolds: boolean;
  pAtLeastOne: number;
  trump: string;
};

type DrawCase = {
  seed: number;
  playerId: string;
  botIndices: number[];
  bestIndices: number[];
  botP: number;
  bestP: number;
  botKeepsTrump: boolean;
  bestKeepsTrump: boolean;
};

type PlayCase = {
  seed: number;
  playerId: string;
  trick: number;
  botIdx: number;
  bestIdx: number;
  botP: number;
  bestP: number;
  illegal: boolean;
  leadSuit: string | null;
};

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function playerIds(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `p${i + 1}`);
}

function cloneState(state: SimulatedHandState): SimulatedHandState {
  return {
    publicHand: structuredClone(state.publicHand),
    privateHands: Object.fromEntries(
      Object.entries(state.privateHands).map(([k, v]) => [k, [...v]]),
    ),
    deck: [...state.deck],
  };
}

function tricksFor(state: SimulatedHandState, playerId: string): number {
  return state.publicHand.tricksByPlayer[playerId] ?? 0;
}

/** Finish draw+play from current state using smart bot policies for every seat. */
function finishHandWithBots(state: SimulatedHandState): SimulatedHandState {
  let current = cloneState(state);
  let guard = 0;
  while (current.publicHand.phase === HAND_PHASE.DRAW && guard < 40) {
    guard += 1;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) break;
    current = applyBotDraw(current, turnId);
  }

  guard = 0;
  while (guard < 200) {
    guard += 1;
    const total = Object.values(current.publicHand.tricksByPlayer).reduce(
      (s, n) => s + (n || 0),
      0,
    );
    if (total >= 5 && current.publicHand.currentTrick === null) break;
    if (current.publicHand.phase !== HAND_PHASE.PLAY) break;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) break;
    current = applyBotPlay(current, turnId);
  }
  return current;
}

function estimateAtLeastOneTrick(
  state: SimulatedHandState,
  heroId: string,
  rollouts: number,
  rng: () => number,
): number {
  let wins = 0;
  for (let r = 0; r < rollouts; r += 1) {
    const rolloutSeed = Math.floor(rng() * 1_000_000_000);
    const base = cloneState(state);
    const final = finishHandWithBots(base);
    if (tricksFor(final, heroId) >= 1) wins += 1;
  }
  return wins / rollouts;
}

function combinations(n: number, k: number): number[][] {
  const out: number[][] = [];
  const buf: number[] = [];
  function walk(start: number, left: number) {
    if (left === 0) {
      out.push([...buf]);
      return;
    }
    for (let i = start; i <= n - left; i += 1) {
      buf.push(i);
      walk(i + 1, left - 1);
      buf.pop();
    }
  }
  walk(0, k);
  return out;
}

function allDiscardCombos(handLen: number, cap: number): number[][] {
  const combos: number[][] = [[]];
  for (let k = 1; k <= cap; k += 1) {
    combos.push(...combinations(handLen, k));
  }
  return combos;
}

/** Run bot draws for seats ahead of hero until it is hero's draw turn. */
function advanceToDrawTurn(state: SimulatedHandState, heroId: string): SimulatedHandState {
  let current = cloneState(state);
  let guard = 0;
  while (current.publicHand.phase === HAND_PHASE.DRAW && guard < 40) {
    guard += 1;
    const turnId = current.publicHand.turnPlayerId;
    if (!turnId) break;
    if (turnId === heroId) break;
    const done = current.publicHand.drawCompletedIds ?? [];
    if (done.includes(heroId)) break;
    current = applyBotDraw(current, turnId);
  }
  if (current.publicHand.turnPlayerId !== heroId) {
    throw new Error(
      `Could not reach draw turn for ${heroId} (turn=${current.publicHand.turnPlayerId})`,
    );
  }
  return current;
}

function applyHeroDraw(
  state: SimulatedHandState,
  heroId: string,
  discardIndices: number[],
): SimulatedHandState {
  if (state.publicHand.turnPlayerId !== heroId) {
    throw new Error(`Hero draw applied out of turn: expected ${heroId}`);
  }
  const max = state.publicHand.maxDrawDiscards ?? 5;
  const drawResult = applyPlayerDraw({
    playerId: heroId,
    privateHand: state.privateHands[heroId],
    publicHand: state.publicHand,
    discardIndices,
    deck: state.deck,
    maxDiscards: max,
  });
  const order = state.publicHand.actionOrder ?? state.publicHand.participantIds;
  return {
    ...state,
    publicHand: advanceAfterDraw(drawResult.publicHand, order, heroId),
    privateHands: { ...state.privateHands, [heroId]: drawResult.privateHand },
  };
}

function estimateDrawCombo(
  state: SimulatedHandState,
  heroId: string,
  discardIndices: number[],
  rollouts: number,
  rng: () => number,
): number {
  let sum = 0;
  for (let r = 0; r < rollouts; r += 1) {
    const atHeroTurn = advanceToDrawTurn(cloneState(state), heroId);
    const afterHero = applyHeroDraw(atHeroTurn, heroId, discardIndices);
    const final = finishHandWithBots(afterHero);
    sum += tricksFor(final, heroId) >= 1 ? 1 : 0;
  }
  return sum / rollouts;
}

function playContext(state: SimulatedHandState, playerId: string): PlayContext {
  const hand = effectivePlayerHand(playerId, state.privateHands[playerId], state.publicHand);
  return buildPlayValidationState({ hand, publicHand: state.publicHand });
}

function estimatePlayEv(
  state: SimulatedHandState,
  playerId: string,
  cardIndex: number,
  rollouts: number,
  rng: () => number,
): number {
  let sum = 0;
  for (let r = 0; r < rollouts; r += 1) {
    const branch = applyChosenPlay(cloneState(state), playerId, cardIndex);
    const final = finishHandWithBots(branch);
    sum += tricksFor(final, playerId);
  }
  return sum / rollouts;
}

function applyChosenPlay(
  state: SimulatedHandState,
  playerId: string,
  cardIndex: number,
): SimulatedHandState {
  const result = applyPlayerPlayCard({
    publicHand: state.publicHand,
    privateHand: state.privateHands[playerId],
    playerId,
    cardIndex,
    actionOrder: state.publicHand.actionOrder ?? state.publicHand.participantIds,
    cinchEnabled: state.publicHand.cinchEnabled === true,
  });
  return {
    ...state,
    publicHand: result.publicHand,
    privateHands: { ...state.privateHands, [playerId]: result.privateHand },
  };
}

function keepsTrump(hand: Card[], indices: number[], trump: string): boolean {
  const discard = new Set(indices);
  return hand.some((c, i) => !discard.has(i) && c.suit === trump);
}

function runFoldAudit(): {
  cases: FoldCase[];
  stayedInLow: FoldCase[];
  foldedHigh: FoldCase[];
  passMismatch: number;
} {
  const cases: FoldCase[] = [];
  const stayedInLow: FoldCase[] = [];
  const foldedHigh: FoldCase[] = [];
  let passMismatch = 0;

  for (let i = 0; i < FOLD_HAND_SAMPLES; i += 1) {
    const n = 2 + (i % 5);
    const ids = playerIds(n);
    const seed = 10_000 + i * 17;
    const rng = mulberry32(seed);
    const state = initSimulatedHand({
      participantIds: ids,
      sortedPlayerIds: ids,
      dealerId: ids[0],
      seed,
    });
    const trump = state.publicHand.trumpSuit;

    for (const pid of ids) {
      const hand = effectivePlayerHand(pid, state.privateHands[pid], state.publicHand);
      const strength = estimateHandStrength(hand, trump);
      const moveCtx = buildBotMoveContext(pid, state.privateHands[pid]!, state.publicHand, state.deck, state.privateHands);
      const botFolds = botShouldFoldDraw(hand, trump, moveCtx);
      const botPasses = botShouldPassDecision(hand, trump, moveCtx);
      if (botFolds !== botPasses) passMismatch += 1;
      const pAtLeastOne = estimateAtLeastOneTrick(state, pid, FOLD_ROLLOUTS, rng);
      const row: FoldCase = { seed, playerId: pid, n, strength, botFolds, pAtLeastOne, trump };
      cases.push(row);
      if (!botFolds && pAtLeastOne < FOLD_STAY_IN_THRESHOLD) stayedInLow.push(row);
      if (botFolds && pAtLeastOne > FOLD_FOLD_OUT_THRESHOLD) foldedHigh.push(row);
    }
  }

  return { cases, stayedInLow, foldedHigh, passMismatch };
}

function runDrawAudit(): {
  decisions: DrawCase[];
  suboptimal: DrawCase[];
  trumpDumped: DrawCase[];
} {
  const decisions: DrawCase[] = [];
  const suboptimal: DrawCase[] = [];
  const trumpDumped: DrawCase[] = [];

  for (let i = 0; i < DRAW_DECISION_SAMPLES; i += 1) {
    const n = 3 + (i % 4);
    const ids = playerIds(n);
    const seed = 50_000 + i * 23;
    const rng = mulberry32(seed);
    const state = initSimulatedHand({
      participantIds: ids,
      sortedPlayerIds: ids,
      dealerId: ids[0],
      seed,
    });
    const heroId = ids[i % n];
    const atHeroTurn = advanceToDrawTurn(state, heroId);
    const hand = effectivePlayerHand(
      heroId,
      atHeroTurn.privateHands[heroId],
      atHeroTurn.publicHand,
    );
    const pile = pileFromPublicHand(atHeroTurn.publicHand, atHeroTurn.deck);
    const available = totalAvailableReplacements(pile);
    const max = atHeroTurn.publicHand.maxDrawDiscards ?? 5;
    const cap = Math.min(max, available);
    const trump = atHeroTurn.publicHand.trumpSuit;
    const moveCtx = buildBotMoveContext(
      heroId,
      atHeroTurn.privateHands[heroId]!,
      atHeroTurn.publicHand,
      atHeroTurn.deck,
      atHeroTurn.privateHands,
    );
    const botIndices = botDrawDiscardIndices(hand, trump, max, available, moveCtx);
    const combos = allDiscardCombos(hand.length, cap);
    let bestIndices = botIndices;
    let bestP = -1;
    const scores: { indices: number[]; p: number }[] = [];
    for (const combo of combos) {
      const p = estimateDrawCombo(atHeroTurn, heroId, combo, DRAW_ROLLOUTS, rng);
      scores.push({ indices: combo, p });
      if (p > bestP) {
        bestP = p;
        bestIndices = combo;
      }
    }
    const botP = scores.find((s) => comboKey(s.indices) === comboKey(botIndices))?.p ?? 0;
    const row: DrawCase = {
      seed,
      playerId: heroId,
      botIndices,
      bestIndices,
      botP,
      bestP,
      botKeepsTrump: keepsTrump(hand, botIndices, trump),
      bestKeepsTrump: keepsTrump(hand, bestIndices, trump),
    };
    decisions.push(row);
    if (bestP - botP > DRAW_SUBOPTIMAL_GAP) suboptimal.push(row);
    const botDiscardsTrump = botIndices.some((idx) => hand[idx]?.suit === trump);
    if (botDiscardsTrump) trumpDumped.push(row);
  }

  return { decisions, suboptimal, trumpDumped };
}

function runPlayAudit(): {
  decisions: PlayCase[];
  suboptimal: PlayCase[];
  illegal: PlayCase[];
} {
  const decisions: PlayCase[] = [];
  const suboptimal: PlayCase[] = [];
  const illegal: PlayCase[] = [];

  for (let i = 0; i < PLAY_DECISION_SAMPLES; i += 1) {
    const n = 3 + (i % 3);
    const ids = playerIds(n);
    const seed = 90_000 + i * 31;
    const rng = mulberry32(seed);
    let state = initSimulatedHand({
      participantIds: ids,
      sortedPlayerIds: ids,
      dealerId: ids[0],
      seed,
    });

    let guard = 0;
    while (state.publicHand.phase === HAND_PHASE.DRAW && guard < 40) {
      guard += 1;
      const turnId = state.publicHand.turnPlayerId;
      if (!turnId) break;
      state = applyBotDraw(state, turnId);
    }

    let collected = 0;
    guard = 0;
    while (collected < 3 && guard < 80) {
      guard += 1;
      if (state.publicHand.phase !== HAND_PHASE.PLAY) break;
      const turnId = state.publicHand.turnPlayerId;
      if (!turnId) break;
      const ctx = playContext(state, turnId);
      const legal = getLegalPlayIndices(ctx);
      const moveCtx = buildBotMoveContext(
        turnId,
        state.privateHands[turnId]!,
        state.publicHand,
        state.deck,
        state.privateHands,
      );
      const botIdx = botPlayCardIndex(ctx.hand, ctx, moveCtx);
      const isIllegal = !legal.includes(botIdx);
      let bestIdx = botIdx;
      let bestEv = -1;
      for (const idx of legal) {
        const ev = estimatePlayEv(state, turnId, idx, PLAY_ROLLOUTS, rng);
        if (ev > bestEv) {
          bestEv = ev;
          bestIdx = idx;
        }
      }
      const botEv = legal.includes(botIdx)
        ? estimatePlayEv(state, turnId, botIdx, PLAY_ROLLOUTS, rng)
        : 0;
      const row: PlayCase = {
        seed,
        playerId: turnId,
        trick: state.publicHand.currentTrick?.trickNumber ?? 0,
        botIdx,
        bestIdx,
        botP: botEv,
        bestP: bestEv,
        illegal: isIllegal,
        leadSuit: ctx.leadSuit,
      };
      decisions.push(row);
      if (isIllegal) illegal.push(row);
      else if (bestEv - botEv > PLAY_SUBOPTIMAL_GAP) suboptimal.push(row);
      collected += 1;
      state = isIllegal
        ? applyChosenPlay(state, turnId, legal[0]!)
        : applyChosenPlay(state, turnId, botIdx);
    }
  }

  return { decisions, suboptimal, illegal };
}

function pct(n: number, d: number): string {
  return d ? `${((100 * n) / d).toFixed(1)}%` : "n/a";
}

function mean(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function comboKey(indices: number[]): string {
  return [...indices].sort((a, b) => a - b).join(",");
}

function main() {
  const prevDebug = console.debug;
  console.debug = () => {};
  try {
    console.log(`Bourré bot intelligence audit (Monte Carlo)${quick ? " [QUICK]" : ""}\n`);

    console.log("Running fold audit...");
    const fold = runFoldAudit();
    console.log("Running draw audit...");
    const draw = runDrawAudit();
    console.log("Running play audit...");
    const play = runPlayAudit();

  const foldCases = fold.cases;
  const foldStayRate = foldCases.filter((c) => !c.botFolds).length / foldCases.length;
  const avgPWhenStay = mean(foldCases.filter((c) => !c.botFolds).map((c) => c.pAtLeastOne));
  const avgPWhenFold = mean(foldCases.filter((c) => c.botFolds).map((c) => c.pAtLeastOne));

  console.log("## Rules Assumptions");
  console.log("- Monte Carlo rollouts use the implemented engine: follow suit, must trump when void, must overtrump when required, optional cinch off in samples.");
  console.log("- Fold audit uses MC P(≥1 trick) via botShouldFoldDraw / botShouldPassDecision with mixed opponent rollouts.");
  console.log("- Draw audit compares all legal discard subsets against rollout-ranked smart bot choices.");
  console.log("- Play audit compares legal plays by rollout EV with mixed opponent continuation.");
  console.log(`- Samples: ${FOLD_HAND_SAMPLES} hands × 2–6 players (${foldCases.length} seat decisions), ${DRAW_DECISION_SAMPLES} draw decisions, ${play.decisions.length} play decisions.`);
  console.log(`- Rollouts per estimate: fold=${FOLD_ROLLOUTS}, draw=${DRAW_ROLLOUTS}, play=${PLAY_ROLLOUTS}.`);
  console.log("");

  console.log("## Fold Audit");
  console.log(
    `- Heuristic: fold if MC P(≥1 trick) < ${FOLD_STAY_IN_THRESHOLD}; pass if < ${BOT_PASS_P_THRESHOLD}; enrollment uses same pass model.`,
  );
  console.log(`- Stay-in rate: ${pct(foldCases.filter((c) => !c.botFolds).length, foldCases.length)} (${foldStayRate.toFixed(3)})`);
  console.log(`- Avg P(≥1 trick) when bot stays in: ${avgPWhenStay.toFixed(3)}`);
  console.log(`- Avg P(≥1 trick) when bot folds: ${avgPWhenFold.toFixed(3)}`);
  console.log(
    `- Stayed in despite P(≥1 trick) < ${FOLD_STAY_IN_THRESHOLD}: ${fold.stayedInLow.length} / ${foldCases.length} (${pct(fold.stayedInLow.length, foldCases.length)})`,
  );
  console.log(
    `- Folded despite P(≥1 trick) > ${FOLD_FOLD_OUT_THRESHOLD}: ${fold.foldedHigh.length} / ${foldCases.length} (${pct(fold.foldedHigh.length, foldCases.length)})`,
  );
  console.log(`- Pass vs draw fold threshold disagreements: ${fold.passMismatch} (strength band 2.0–2.25)`);
  console.log("");

  console.log("## Draw Audit");
  console.log(`- Suboptimal vs best discard combo (ΔP(≥1 trick) > ${DRAW_SUBOPTIMAL_GAP}): ${draw.suboptimal.length} / ${draw.decisions.length} (${pct(draw.suboptimal.length, draw.decisions.length)})`);
  console.log(`- Bot discarded trump at least once: ${draw.trumpDumped.length} / ${draw.decisions.length} (${pct(draw.trumpDumped.length, draw.decisions.length)})`);
  const avgBotP = mean(draw.decisions.map((d) => d.botP));
  const avgBestP = mean(draw.decisions.map((d) => d.bestP));
  console.log(`- Mean bot P(≥1 trick) after draw: ${avgBotP.toFixed(3)}; optimal combo: ${avgBestP.toFixed(3)}; gap ${(avgBestP - avgBotP).toFixed(3)}`);
  console.log("");

  console.log("## Trick Play Audit");
  console.log(`- Illegal bot plays: ${play.illegal.length} / ${play.decisions.length} (${pct(play.illegal.length, play.decisions.length)})`);
  console.log(
    `- Suboptimal vs best legal play (ΔE[tricks] > ${PLAY_SUBOPTIMAL_GAP}): ${play.suboptimal.length} / ${play.decisions.length} (${pct(play.suboptimal.length, play.decisions.length)})`,
  );
  const avgBotEv = mean(play.decisions.filter((d) => !d.illegal).map((d) => d.botP));
  const avgBestEv = mean(play.decisions.filter((d) => !d.illegal).map((d) => d.bestP));
  console.log(`- Mean bot E[tricks] from decision point: ${avgBotEv.toFixed(3)}; best legal: ${avgBestEv.toFixed(3)}`);
  console.log("");

  console.log("## Cases Where Bot Played Dumb");
  const dumbExamples: string[] = [];
  for (const c of fold.stayedInLow.slice(0, 3)) {
    dumbExamples.push(
      `Fold: seed=${c.seed} ${c.playerId} stayed in (strength=${c.strength.toFixed(2)}) but MC P(≥1 trick)=${c.pAtLeastOne.toFixed(2)}`,
    );
  }
  for (const c of fold.foldedHigh.slice(0, 2)) {
    dumbExamples.push(
      `Fold: seed=${c.seed} ${c.playerId} folded (strength=${c.strength.toFixed(2)}) but MC P(≥1 trick)=${c.pAtLeastOne.toFixed(2)}`,
    );
  }
  for (const c of draw.suboptimal.slice(0, 3)) {
    dumbExamples.push(
      `Draw: seed=${c.seed} bot discards [${c.botIndices}] P=${c.botP.toFixed(2)} vs best [${c.bestIndices}] P=${c.bestP.toFixed(2)}`,
    );
  }
  for (const c of play.suboptimal.slice(0, 3)) {
    dumbExamples.push(
      `Play: seed=${c.seed} trick=${c.trick} bot idx=${c.botIdx} E=${c.botP.toFixed(2)} vs best idx=${c.bestIdx} E=${c.bestP.toFixed(2)}`,
    );
  }
  if (!dumbExamples.length) dumbExamples.push("- (none flagged in sample)");
  for (const line of dumbExamples) console.log(line);
  console.log("");

  const foldFail = fold.stayedInLow.length / foldCases.length > 0.08;
  const drawFail = draw.suboptimal.length / draw.decisions.length > 0.25;
  const playFail = play.illegal.length > 0 || play.suboptimal.length / play.decisions.length > 0.2;
  const pass = !(foldFail || drawFail || playFail);

  console.log("## Whether Bot Meets Standard");
  console.log(pass ? "PASS" : "FAIL");
  console.log("");

  console.log("## Required Logic Changes");
  if (pass) {
    console.log("- None required for baseline legality; heuristics are coarse but not egregiously wrong in this sample.");
  } else {
    const changes: string[] = [];
    if (foldFail) {
      changes.push("- Replace fixed strength thresholds with MC or learned P(≥1 trick) for draw-fold and decision-pass.");
    }
    if (drawFail) {
      changes.push("- Replace lowest-non-trump discard with rollout-ranked discard combos (keep high trumps / winners).");
    }
    if (playFail) {
      if (play.illegal.length) changes.push("- Fix legality gaps in botPlayCardIndex (must use full validatePlayIndex).");
      changes.push("- Replace win-with-lowest / dump-lowest with EV-ranked legal plays over rollouts.");
    }
    changes.push("- Gate pre-deal enrollment on the same P(≥1 trick) model (bots currently always join).");
    for (const c of changes) console.log(c);
  }

  // JSON summary for agent
  console.log("\n--- JSON ---");
  console.log(
    JSON.stringify(
      {
        fold: {
          n: foldCases.length,
          stayedInLow: fold.stayedInLow.length,
          foldedHigh: fold.foldedHigh.length,
          avgPStay: avgPWhenStay,
          avgPFold: avgPWhenFold,
        },
        draw: {
          n: draw.decisions.length,
          suboptimal: draw.suboptimal.length,
          trumpDumped: draw.trumpDumped.length,
          avgBotP,
          avgBestP,
        },
        play: {
          n: play.decisions.length,
          illegal: play.illegal.length,
          suboptimal: play.suboptimal.length,
          avgBotEv,
          avgBestEv,
        },
        pass,
      },
      null,
      2,
    ),
  );
  } finally {
    console.debug = prevDebug;
  }
}

main();
