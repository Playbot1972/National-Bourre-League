import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { activateHandDecision } from "../game/decision";
import { dealInitialHand } from "../game/deal";
import { serializePagatRevealHand } from "../game/serialize";
import { HAND_PHASE } from "../game/types";
import {
  authoritativeCurrentHand,
  canPlayerShowHandChoice,
  isLegacyEnrollmentActive,
  isPagatDecisionActive,
  resolveCurrentHandChoicePlayerId,
  resolveTableEnrollmentActive,
} from "./liveHand";

const SORTED = ["p1", "p2", "p3", "p4"];
const MY_UID = "p2";

function buggyEnrollmentActive(
  cardsDealt: boolean,
  participantCount: number,
  legacyActive: boolean,
  pagatDecision: boolean,
): boolean {
  return !cardsDealt && participantCount === 0 && (legacyActive || pagatDecision);
}

describe("table hand choice gate (hands 1–4 regression)", () => {
  it("reveal advance opens decision, not draw", () => {
    const deal = dealInitialHand({
      dealerId: "p1",
      participantIds: SORTED,
      sortedPlayerIds: SORTED,
      seed: 99,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: "p1",
      actionOrder: deal.dealOrder,
      seatedIds: SORTED,
    });
    const next = activateHandDecision(bundle.publicHand, 1_000);
    assert.equal(next.phase, HAND_PHASE.DECISION);
    assert.equal(next.handDecision?.active, true);
  });

  it("legacy enrollment gate works on hand 1 before deal", () => {
    assert.equal(
      isLegacyEnrollmentActive({
        cardsDealt: false,
        handParticipantCount: 0,
        enrollmentActive: true,
      }),
      true,
    );
    assert.equal(
      resolveTableEnrollmentActive({
        cardsDealt: false,
        handParticipantCount: 0,
        legacyEnrollmentActive: true,
        pagatDecisionActive: false,
      }),
      true,
    );
  });

  it("keeps play/pass controls on hands 2–4 after auto-deal + reveal", () => {
    for (let hand = 2; hand <= 4; hand += 1) {
      const dealerId = "p1";
      const deal = dealInitialHand({
        dealerId,
        participantIds: SORTED,
        sortedPlayerIds: SORTED,
        seed: hand * 17,
      });
      const bundle = serializePagatRevealHand(deal, {
        dealerId,
        actionOrder: deal.dealOrder,
        seatedIds: SORTED,
      });
      const decisionHand = activateHandDecision(bundle.publicHand, hand * 1_000);
      const cardsDealt = true;
      const participantCount = decisionHand.participantIds?.length ?? 0;

      assert.equal(
        buggyEnrollmentActive(cardsDealt, participantCount, false, true),
        false,
        `hand ${hand}: old gate hid decision controls`,
      );

      const pagatDecisionActive = isPagatDecisionActive(
        decisionHand.phase,
        decisionHand.handDecision,
      );
      assert.equal(pagatDecisionActive, true, `hand ${hand}`);

      const enrollmentActive = resolveTableEnrollmentActive({
        cardsDealt,
        handParticipantCount: participantCount,
        legacyEnrollmentActive: false,
        pagatDecisionActive,
      });
      assert.equal(enrollmentActive, true, `hand ${hand}`);

      const currentChoicePlayerId = resolveCurrentHandChoicePlayerId({
        pagatDecisionActive,
        handDecision: decisionHand.handDecision,
        legacyEnrollmentActive: false,
        enrollment: null,
      });
      assert.equal(currentChoicePlayerId, MY_UID, `hand ${hand} opens left of dealer`);

      assert.equal(
        canPlayerShowHandChoice({
          enrollmentGateActive: enrollmentActive,
          isSelf: true,
          playerId: MY_UID,
          currentChoicePlayerId,
          isFinal: false,
          bankroll: 10,
          isOut: false,
        }),
        true,
        `hand ${hand}`,
      );
    }
  });

  it("prefers fresh reveal over stale draw mirror with completed draw ids", () => {
    const session = {
      liveEnrollment: {
        active: false,
        deal: {
          publicHand: {
            phase: "draw",
            participantIds: SORTED,
            tricksByPlayer: Object.fromEntries(SORTED.map((id) => [id, 0])),
            drawCompletedIds: [MY_UID, "p3", "p4"],
            turnPlayerId: "p1",
          },
        },
      },
      currentHand: {
        phase: "reveal",
        participantIds: SORTED,
        tricksByPlayer: Object.fromEntries(SORTED.map((id) => [id, 0])),
        drawCompletedIds: [],
        handDecision: { active: false, orderedPlayerIds: SORTED, currentIndex: 0 },
      },
    };
    const hand = authoritativeCurrentHand(session);
    assert.equal(hand.phase, "reveal");
    assert.deepEqual(hand.drawCompletedIds, []);
  });
});
