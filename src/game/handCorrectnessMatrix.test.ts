/**
 * Hand correctness matrix — 2–8 players, step-by-step invariants through
 * deal → draw → trick-verified play → settlement → multi-hand transitions.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveWinnersFromTricks } from "../table/logic";
import { nextDealerId } from "../session/logic";
import {
  countEligibleForNextHand,
  shouldFinalizeForSoleSurvivor,
} from "../session/sessionSolvency";
import { maxDrawDiscards } from "./drawLimit";
import { deriveScoreNet, scoreBankroll } from "./money/core";
import {
  processAnte,
  processBuyIn,
  processHandSettlement,
} from "./money/processor";
import type { ScoreById } from "./money/types";
import {
  assertNoDuplicateCards,
  assertPostDealInvariants,
  assertPostDrawInvariants,
  initSimulatedHand,
  isHandPlayComplete,
  runDrawPhase,
  runPlayPhaseVerified,
  simulateFullHandVerified,
} from "./testHelpers";

const TABLE_SIZES = [2, 3, 4, 5, 6, 7, 8] as const;
const MATRIX_SEEDS = [1, 7, 42] as const;
const BUY_IN = 100;
const ANTE = 10;

function playerIds(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `p${i + 1}`);
}

function settlementMode(winnerIds: string[]) {
  if (winnerIds.length === 0) return "push" as const;
  if (winnerIds.length === 1) return "win" as const;
  return "split" as const;
}

describe("hand correctness matrix — 2–8 players", () => {
  for (const count of TABLE_SIZES) {
    const ids = playerIds(count);

    describe(`${count} players`, () => {
      for (const seed of MATRIX_SEEDS) {
        it(`all-in full hand (seed ${seed}): deal → draw → 5 verified tricks`, () => {
          const final = simulateFullHandVerified({
            participantIds: ids,
            sortedPlayerIds: ids,
            dealerId: ids[0],
            seed: 5000 + count * 100 + seed,
          });
          assert.ok(isHandPlayComplete(final));
          const total = Object.values(final.publicHand.tricksByPlayer).reduce(
            (s, n) => s + (n || 0),
            0,
          );
          assert.equal(total, 5);
          assert.equal(
            final.publicHand.playedCards.length,
            5 * final.publicHand.participantIds.length,
          );
          assertNoDuplicateCards(final);
          const { ready, maxTricks } = deriveWinnersFromTricks(
            final.publicHand.tricksByPlayer,
            final.publicHand.participantIds,
          );
          assert.ok(ready);
          assert.ok(maxTricks > 0);
        });
      }

      it("draw-heavy path: bot discards respect pile cap", () => {
        const state = initSimulatedHand({
          participantIds: ids,
          sortedPlayerIds: ids,
          dealerId: ids[0],
          seed: 6000 + count,
        });
        assertPostDealInvariants(state);
        const maxDisc = maxDrawDiscards(count);
        assert.equal(state.publicHand.maxDrawDiscards ?? maxDisc, maxDisc);
        const afterDraw = runDrawPhase(state);
        assertPostDrawInvariants(afterDraw);
        for (const pid of afterDraw.publicHand.participantIds) {
          assert.equal(afterDraw.privateHands[pid]?.length, 5);
        }
        const final = runPlayPhaseVerified(afterDraw);
        assert.ok(isHandPlayComplete(final));
      });

      if (count >= 3) {
        it("enrollment path: only joined players dealt and play", () => {
          const sitOut = count > 5 ? new Set(ids.slice(count - (count - 5))) : new Set<string>();
          const final = simulateFullHandVerified({
            skipEnrollment: false,
            sortedPlayerIds: ids,
            dealerId: ids[0],
            seed: 7000 + count,
            enrollmentJoin: (id) => !sitOut.has(id),
          });
          assert.ok(isHandPlayComplete(final));
          const enrolled = ids.filter((id) => !sitOut.has(id));
          for (const pid of final.publicHand.participantIds) {
            assert.ok(enrolled.includes(pid), `${pid} should be enrolled`);
          }
          assert.ok(final.publicHand.participantIds.length >= 2);
        });
      }

      it("3-hand sequence: card play + settlement + dealer rotation", () => {
        let dealerId: string | null = ids[0]!;
        let carryIn = 0;
        let scoreById: ScoreById = Object.fromEntries(
          ids.map((pid) => [pid, { bankroll: BUY_IN, net: 0 }]),
        );
        const buyIn = processBuyIn({
          actionId: `matrix-buyin-${count}`,
          playerIds: ids,
          buyInAmount: BUY_IN,
        });
        assert.ok(buyIn.invariants.ok);
        let events = [...buyIn.newEvents];
        let nextDealFunding: ReturnType<
          typeof processHandSettlement
        >["settlement"]["nextDealFunding"] | null = null;

        for (let hand = 0; hand < 3; hand += 1) {
          const handNum = hand + 1;
          const solvent = ids.filter(
            (pid) =>
              scoreById[pid]?.out !== true && scoreBankroll(scoreById[pid], BUY_IN) > 0,
          );
          if (solvent.length < 2) break;

          const anteResult = processAnte({
            actionId: `matrix-ante-${count}-${handNum}`,
            handId: String(handNum),
            carryOverPot: carryIn,
            participantIds: solvent,
            scoreById,
            sessionStake: ANTE,
            buyInFallback: BUY_IN,
            nextDealFunding,
            existingEvents: events,
          });
          assert.ok(anteResult.invariants.ok, `hand ${handNum} ante`);
          events = [...events, ...anteResult.newEvents];
          for (const pid of solvent) {
            const br = anteResult.newBankrolls[pid];
            if (br != null) {
              scoreById = {
                ...scoreById,
                [pid]: {
                  ...scoreById[pid],
                  bankroll: br,
                  net: deriveScoreNet(br, BUY_IN),
                },
              };
            }
          }

          const final = simulateFullHandVerified({
            participantIds: solvent,
            sortedPlayerIds: ids,
            dealerId,
            seed: 8000 + count * 10 + hand,
          });
          assert.ok(isHandPlayComplete(final));

          const tricks = final.publicHand.tricksByPlayer;
          const participants = final.publicHand.participantIds;
          const { winnerIds } = deriveWinnersFromTricks(tricks, participants);
          const postedAntes = anteResult.postedAntes ?? {};

          const settle = processHandSettlement({
            actionId: `matrix-settle-${count}-${handNum}`,
            handId: String(handNum),
            sessionId: `matrix-${count}`,
            mode: settlementMode(winnerIds),
            winners: winnerIds,
            participants,
            tricksByPlayer: tricks,
            anteAmount: ANTE,
            limEnabled: false,
            carryIn,
            postedAntes: anteResult.postedAntes ?? {},
            scoreById,
            buyInFallback: BUY_IN,
            sessionStake: ANTE,
            stakeForPlayer: () => ANTE,
            existingEvents: events,
          });
          assert.ok(
            settle.invariants.ok,
            `hand ${handNum} settlement: ${settle.invariants.errors?.join("; ")}`,
          );
          events = [...events, ...settle.newEvents];

          for (const pid of participants) {
            const br = settle.newBankrolls[pid];
            if (br != null) {
              scoreById = {
                ...scoreById,
                [pid]: {
                  ...scoreById[pid],
                  bankroll: br,
                  net: deriveScoreNet(br, BUY_IN),
                },
              };
            }
          }
          carryIn = settle.carryOverPot;
          nextDealFunding = settle.settlement.nextDealFunding;
          dealerId = nextDealerId(ids, dealerId);
          assert.ok(dealerId);
        }
      });
    });
  }

  it("sole survivor: eligibility gate stops contested next hand", () => {
    const ids = playerIds(4);
    const scoreById: ScoreById = {
      p1: { bankroll: 400, net: 300 },
      p2: { bankroll: 0, out: true },
      p3: { bankroll: 0, out: true },
      p4: { bankroll: 0, out: true },
    };
    const eligible = countEligibleForNextHand(ids, scoreById, BUY_IN);
    assert.equal(eligible, 1);
    assert.equal(shouldFinalizeForSoleSurvivor(eligible), true);
  });

  it("broke player excluded from enrollment deal", () => {
    const ids = playerIds(4);
    const final = simulateFullHandVerified({
      skipEnrollment: false,
      sortedPlayerIds: ids,
      dealerId: ids[0],
      seed: 9001,
      enrollmentJoin: (id) => id !== "p4",
    });
    assert.ok(!final.publicHand.participantIds.includes("p4"));
    assert.ok(isHandPlayComplete(final));
  });
});
