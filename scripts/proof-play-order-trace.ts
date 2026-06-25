/**
 * Proof artifact: one-hand play-order trace (Pagat dealer-left clockwise).
 * Run: npx tsx scripts/proof-play-order-trace.ts
 */
import {
  buildHandEnrollment,
  currentEnrollmentPlayer,
} from "../src/game/enrollment";
import {
  buildHandDecision,
  currentDecisionPlayer,
  applyDecisionPass,
  applyDecisionPlay,
  activateHandDecision,
} from "../src/game/decision";
import { dealInitialHand } from "../src/game/deal";
import { revealToDraw, advanceAfterDraw, applyPlayerDraw } from "../src/game/draw";
import { applyPlayerPlayCard } from "../src/game/play";
import { getLegalPlayIndices } from "../src/game/legal";
import { buildPlayValidationState } from "../src/game/playContext";
import { effectivePlayerHand } from "../src/game/invariants";
import {
  openingLeaderId,
  playerOrderFromDealer,
  resolveActionOrder,
} from "../src/game/playerOrder";
import { serializePagatRevealHand } from "../src/game/serialize";
import { deserializeCards } from "../src/game/serialize";
import { shuffledDeckFromSeed } from "../src/game/deckState";
import { nextDealerId } from "../src/session/logic";
import { HAND_PHASE } from "../src/game/types";
import type { Card } from "../src/types";

const ROSTER = ["alice", "bob", "carol", "dave"] as const;
const dealerPlayerId = "bob";
const dealerSeat = ROSTER.indexOf(dealerPlayerId);

const normalizedClockwiseFromDealerLeft = playerOrderFromDealer(dealerPlayerId, [...ROSTER]);

const deal = dealInitialHand({
  dealerId: dealerPlayerId,
  participantIds: [...ROSTER],
  sortedPlayerIds: [...ROSTER],
  seed: 4242,
});

const bundle = serializePagatRevealHand(deal, {
  dealerId: dealerPlayerId,
  actionOrder: deal.dealOrder,
  seatedIds: [...ROSTER],
});

// --- Play/pass order (carol passes) ---
const playPassLog: Array<{ step: number; playerId: string; action: string }> = [];
let hand = activateHandDecision(bundle.publicHand, 1_000);
let decision = hand.handDecision!;
const ctx = { dealerId: dealerPlayerId, sortedPlayerIds: [...ROSTER], dealingRule: null };

const decisionSteps: Array<{ actor: string; action: "pass" | "play" }> = [
  { actor: "carol", action: "pass" },
  { actor: "dave", action: "play" },
  { actor: "alice", action: "play" },
  { actor: "bob", action: "play" },
];

for (const { actor, action } of decisionSteps) {
  while (currentDecisionPlayer(decision) !== actor) {
    /* align */
  }
  playPassLog.push({ step: playPassLog.length + 1, playerId: actor, action });
  const step =
    action === "pass"
      ? applyDecisionPass(hand, decision, actor, ctx, 2_000)
      : applyDecisionPlay(hand, decision, actor, 0, ctx, 2_000);
  if (step.kind === "continue") {
    decision = step.handDecision!;
    hand = step.publicHand;
  } else if (step.kind === "draw") {
    hand = step.publicHand;
    break;
  }
}

hand = revealToDraw(hand);
const activePlayers = [...hand.participantIds];
const passedPlayers = ["carol"];
const actionOrder = resolveActionOrder(hand, [...ROSTER]);

// --- Draw (stand pat) ---
const privateHands: Record<string, Card[]> = Object.fromEntries(
  Object.entries(bundle.privateHandsByPlayer).map(([id, doc]) => [
    id,
    deserializeCards(doc.cards),
  ]),
);
const deck = shuffledDeckFromSeed(hand.deckSeed ?? 4242);

for (const pid of actionOrder) {
  if ((hand.drawCompletedIds || []).includes(pid)) continue;
  const drawResult = applyPlayerDraw({
    playerId: pid,
    privateHand: privateHands[pid],
    publicHand: hand,
    discardIndices: [],
    deck,
    maxDiscards: hand.maxDrawDiscards ?? 5,
  });
  hand = drawResult.publicHand;
  privateHands[pid] = drawResult.privateHand;
  hand = advanceAfterDraw(hand, actionOrder, pid);
}

const openingLeaderTrick1 = hand.turnPlayerId!;
const expectedOpening = openingLeaderId(dealerPlayerId, activePlayers, [...ROSTER]);

// --- Play all 5 tricks, log leaders ---
const trickLog: Array<{
  trick: number;
  leaderPlayerId: string;
  playOrder: string[];
  winnerPlayerId: string;
}> = [];

let trickNum = 0;
while (hand.phase === HAND_PHASE.PLAY && trickNum < 5) {
  trickNum += 1;
  const leader = hand.currentTrick?.leadPlayerId ?? hand.turnPlayerId!;
  const playOrder: string[] = [];
  let turn: string | null = leader;

  for (let i = 0; i < activePlayers.length; i += 1) {
    const pid = turn!;
    const effective = effectivePlayerHand(pid, privateHands[pid], hand);
    const playCtx = buildPlayValidationState({ hand: effective, publicHand: hand });
    const legal = getLegalPlayIndices(playCtx);
    const cardIndex = legal[0] ?? 0;
    playOrder.push(pid);

    const result = applyPlayerPlayCard({
      publicHand: hand,
      privateHand: privateHands[pid],
      playerId: pid,
      cardIndex,
      actionOrder,
    });
    hand = result.publicHand;
    privateHands[pid] = result.privateHand;

    if (result.trickResolved) {
      const winner =
        hand.turnPlayerId ??
        Object.entries(hand.tricksByPlayer).find(([, n]) => n === trickNum)?.[0] ??
        pid;
      trickLog.push({ trick: trickNum, leaderPlayerId: leader, playOrder, winnerPlayerId: winner });
      break;
    }
    turn = hand.turnPlayerId;
  }
  if (!hand.currentTrick && trickNum >= 5) break;
}

const enrollmentOrder = buildHandEnrollment([...ROSTER], dealerPlayerId, 1_000).orderedPlayerIds;
const decisionOrder = buildHandDecision([...ROSTER], dealerPlayerId, true).orderedPlayerIds;

const rawJoinOrderBugCheck = resolveActionOrder({
  dealerId: dealerPlayerId,
  participantIds: [...ROSTER],
  actionOrder: [...ROSTER],
});

console.log(
  JSON.stringify(
    {
      proof: "play-order-trace",
      dealerPlayerId,
      dealerSeat,
      rosterJoinOrder: ROSTER,
      normalizedClockwiseFromDealerLeft,
      dealOrder: deal.dealOrder,
      enrollmentPlayPassOrder: enrollmentOrder,
      pagatDecisionPlayPassOrder: decisionOrder,
      decisionPlayPassLog: playPassLog,
      activePlayersAfterDecision: activePlayers,
      passedPlayers,
      drawClockwiseOrder: actionOrder,
      openingLeaderTrick1,
      expectedOpeningLeader: expectedOpening,
      openingLeaderCorrect: openingLeaderTrick1 === expectedOpening,
      trickLeaders: trickLog.map((t) => ({
        trick: t.trick,
        leader: t.leaderPlayerId,
        playOrderClockwise: t.playOrder,
        winner: t.winnerPlayerId,
        nextTrickLeader: trickLog[t.trick]?.winnerPlayerId,
      })),
      tricksByPlayer: hand.tricksByPlayer,
      dealerRotationAfterHand: {
        before: dealerPlayerId,
        after: nextDealerId([...ROSTER], dealerPlayerId),
      },
      assertions: {
        dealStartsLeftOfDealer: deal.dealOrder[0] === "carol",
        enrollmentStartsLeftOfDealer: currentEnrollmentPlayer(
          buildHandEnrollment([...ROSTER], dealerPlayerId, 1_000),
        ) === "carol",
        decisionStartsLeftOfDealer: playPassLog[0]?.playerId === "carol",
        openingIsNextActiveAfterPass: openingLeaderTrick1 === "dave",
        trick2LeaderIsTrick1Winner:
          trickLog.length >= 2
            ? trickLog[1].leaderPlayerId === trickLog[0].winnerPlayerId
            : null,
        noRawJoinOrderBug: rawJoinOrderBugCheck[0] === "carol",
      },
    },
    null,
    2,
  ),
);
