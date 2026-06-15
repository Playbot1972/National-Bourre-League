import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyEnrollmentIn,
  applyEnrollmentTimeout,
  buildHandEnrollment,
  currentEnrollmentPlayer,
  runEnrollmentPhase,
} from "./enrollment";
import { playerOrderFromDealer } from "./playerOrder";

const SORTED = ["p1", "p2", "p3", "p4"];
const DEAL_CTX = { seed: 42, dealingRule: null as string | null };

describe("C — in/out enrollment", () => {
  it("starts with first seat left of dealer", () => {
    const enrollment = buildHandEnrollment(SORTED, "p1", 1_000);
    assert.equal(currentEnrollmentPlayer(enrollment), "p2");
    assert.deepEqual(enrollment.orderedPlayerIds, playerOrderFromDealer("p1", SORTED));
  });

  it("advances clockwise when player joins", () => {
    let enrollment = buildHandEnrollment(SORTED, "p1", 1_000);
    const step = applyEnrollmentIn(enrollment, "p2", { dealerId: "p1", sortedPlayerIds: SORTED, ...DEAL_CTX }, 2_000);
    assert.equal(step.kind, "continue");
    if (step.kind !== "continue") return;
    assert.equal(step.handEnrollment.currentIndex, 1);
    assert.deepEqual(step.handEnrollment.enrolledIds, ["p2"]);
  });

  it("rejects join when not your turn", () => {
    const enrollment = buildHandEnrollment(SORTED, "p1", 1_000);
    assert.throws(
      () => applyEnrollmentIn(enrollment, "p3", { dealerId: "p1", sortedPlayerIds: SORTED, ...DEAL_CTX }),
      /Not your turn/,
    );
  });

  it("timeout marks current player declined and advances", () => {
    const enrollment = buildHandEnrollment(SORTED, "p1", 1_000);
    const step = applyEnrollmentTimeout(
      enrollment,
      { dealerId: "p1", sortedPlayerIds: SORTED, ...DEAL_CTX },
      2_000,
    );
    assert.equal(step.kind, "continue");
    if (step.kind !== "continue") return;
    assert.deepEqual(step.handEnrollment.declinedIds, ["p2"]);
    assert.equal(step.handEnrollment.currentIndex, 1);
  });

  it("restarts when fewer than two players enroll", () => {
    const result = runEnrollmentPhase(
      SORTED,
      "p1",
      () => false,
      DEAL_CTX,
      1_000,
    );
    assert.equal(result.kind, "restart");
  });

  it("deals when at least two players enroll", () => {
    const result = runEnrollmentPhase(
      SORTED,
      "p1",
      (id) => id === "p2" || id === "p3",
      DEAL_CTX,
      1_000,
    );
    assert.equal(result.kind, "deal");
    if (result.kind !== "deal") return;
    assert.deepEqual(result.currentHand.participantIds.sort(), ["p2", "p3"]);
    assert.equal(result.currentHand.phase, "draw");
    assert.equal(result.handEnrollment, null);
  });

  it("all-in enrollment produces full table deal", () => {
    const result = runEnrollmentPhase(SORTED, "p1", () => true, DEAL_CTX, 1_000);
    assert.equal(result.kind, "deal");
    if (result.kind !== "deal") return;
    assert.equal(result.currentHand.participantIds.length, 4);
  });
});
