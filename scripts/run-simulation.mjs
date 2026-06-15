/**
 * Monte Carlo hand simulation — enrollment, deal, draw, play, settlement.
 * Uses the same engine helpers as unit tests (src/game/testHelpers.ts).
 *
 * Usage: npx tsx scripts/run-simulation.mjs
 */
import { maxDrawDiscards } from "../src/game/drawLimit.ts";
import { deriveWinnersFromTricks } from "../src/table/logic.ts";
import { settleHandDeltas } from "../docs/bourre-rules.js";
import { nextDealerId } from "../src/session/logic.ts";
import {
  assertNoDuplicateCards,
  isHandPlayComplete,
  simulateFullHand,
} from "../src/game/testHelpers.ts";

function playerIds(count) {
  return Array.from({ length: count }, (_, i) => `p${i + 1}`);
}

function deckSupportsFullDraw(participantCount) {
  const dealt = participantCount * 5;
  const remaining = 52 - dealt;
  return participantCount * maxDrawDiscards(participantCount) <= remaining;
}

function settlementMode(winnerIds) {
  if (winnerIds.length === 0) return "push";
  if (winnerIds.length === 1) return "win";
  return "split";
}

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${err instanceof Error ? err.message : err}`);
  }
}

const SEEDS_PER_TABLE = 40;
const ENROLLMENT_SEEDS = 20;
const SESSION_HANDS = 5;
const SESSION_COUNT = 12;

console.log("Monte Carlo simulation — Bourré engine + rules\n");

for (let count = 2; count <= 8; count += 1) {
  const ids = playerIds(count);

  if (deckSupportsFullDraw(count)) {
    for (let s = 0; s < SEEDS_PER_TABLE; s += 1) {
      const seed = count * 10_000 + s;
      check(`${count}p all-in seed=${seed}`, () => {
        const final = simulateFullHand({
          participantIds: ids,
          sortedPlayerIds: ids,
          dealerId: ids[0],
          seed,
        });
        assertNoDuplicateCards(final);
        if (!isHandPlayComplete(final)) throw new Error("hand did not complete");
        const total = Object.values(final.publicHand.tricksByPlayer).reduce(
          (sum, n) => sum + (n || 0),
          0,
        );
        if (total !== 5) throw new Error(`expected 5 tricks, got ${total}`);
        const { ready } = deriveWinnersFromTricks(
          final.publicHand.tricksByPlayer,
          final.publicHand.participantIds,
        );
        if (!ready) throw new Error("winners not ready after hand");
      });
    }
  }

  if (count >= 3) {
    for (let s = 0; s < ENROLLMENT_SEEDS; s += 1) {
      const seed = count * 20_000 + s;
      const sitOutCount = Math.max(1, count - 5);
      const sitOut = new Set(ids.slice(count - sitOutCount));
      check(`${count}p enrollment sit-out seed=${seed}`, () => {
        const final = simulateFullHand({
          skipEnrollment: false,
          sortedPlayerIds: ids,
          dealerId: ids[0],
          seed,
          enrollmentJoin: (id) => !sitOut.has(id),
        });
        assertNoDuplicateCards(final);
        if (!isHandPlayComplete(final)) throw new Error("hand did not complete");
        const n = final.publicHand.participantIds.length;
        if (n < 2) throw new Error(`too few participants: ${n}`);
        const total = Object.values(final.publicHand.tricksByPlayer).reduce(
          (sum, v) => sum + (v || 0),
          0,
        );
        if (total !== 5) throw new Error(`expected 5 tricks, got ${total}`);
      });
    }
  }
}

for (let session = 0; session < SESSION_COUNT; session += 1) {
  check(`multi-hand session ${session + 1} (${SESSION_HANDS} hands)`, () => {
    const sorted = playerIds(4);
    let dealerId = sorted[0];
    let carryIn = 0;
    for (let hand = 0; hand < SESSION_HANDS; hand += 1) {
      const final = simulateFullHand({
        participantIds: sorted,
        sortedPlayerIds: sorted,
        dealerId,
        seed: session * 100 + hand,
      });
      assertNoDuplicateCards(final);
      if (!isHandPlayComplete(final)) throw new Error(`hand ${hand} stuck`);
      const tricks = final.publicHand.tricksByPlayer;
      const participants = final.publicHand.participantIds;
      const { winnerIds } = deriveWinnersFromTricks(tricks, participants);
      const settled = settleHandDeltas({
        mode: settlementMode(winnerIds),
        winners: winnerIds,
        participants,
        tricksByPlayer: tricks,
        anteAmount: 1,
        limEnabled: hand % 2 === 0,
        carryIn,
        stakeForPlayer: () => 1,
      });
      for (const pid of participants) {
        if (typeof settled.deltas[pid] !== "number") {
          throw new Error(`missing delta for ${pid}`);
        }
      }
      for (const pid of settled.bourreIds) {
        if ((tricks[pid] ?? 0) !== 0) {
          throw new Error(`bourré ${pid} had tricks`);
        }
      }
      carryIn = settled.carryOverPot;
      dealerId = nextDealerId(sorted, dealerId);
      if (!dealerId) throw new Error("dealer rotation failed");
    }
  });
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log("All simulations passed — rules enforced (legality, uniqueness, tricks, settlement).");
