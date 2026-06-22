import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dealInitialHand } from "../game/deal";
import { revealToDraw } from "../game/draw";
import { serializePagatRevealHand } from "../game/serialize";
import { HAND_PHASE } from "../game/types";
import {
  authoritativeCurrentHand,
  isLegacyEnrollmentActive,
  isPagatDecisionActive,
  resolveTableEnrollmentActive,
} from "./liveHand";

const SORTED = ["p1", "p2", "p3", "p4"];
const MY_UID = "p2";

describe("table hand choice gate (hands 1–4 regression)", () => {
  it("reveal advance opens draw (not I'm-in decision)", () => {
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
    const next = revealToDraw(bundle.publicHand, null);
    assert.equal(next.phase, HAND_PHASE.DRAW);
    assert.equal(next.handDecision, null);
    assert.deepEqual(next.drawCompletedIds, []);
    assert.ok(next.turnPlayerId);
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

  it("does not show I'm-in enrollment during draw on hands 2–4 after auto-deal", () => {
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
      const drawHand = revealToDraw(bundle.publicHand, null);
      const cardsDealt = true;
      const participantCount = drawHand.participantIds?.length ?? 0;

      assert.equal(drawHand.phase, HAND_PHASE.DRAW, `hand ${hand}`);
      assert.equal(
        isPagatDecisionActive(drawHand.phase, drawHand.handDecision),
        false,
        `hand ${hand}`,
      );

      const enrollmentActive = resolveTableEnrollmentActive({
        cardsDealt,
        handParticipantCount: participantCount,
        legacyEnrollmentActive: false,
        pagatDecisionActive: false,
      });
      assert.equal(enrollmentActive, false, `hand ${hand} must not show I'm-in UI`);

      assert.deepEqual(drawHand.drawCompletedIds, [], `hand ${hand} fresh draw state`);
      assert.ok(drawHand.turnPlayerId, `hand ${hand} has draw turn`);
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
