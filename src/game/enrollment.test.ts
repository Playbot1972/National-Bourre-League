import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyEnrollmentIn,
  applyEnrollmentPass,
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

  it("pass marks current player declined and advances", () => {
    const enrollment = buildHandEnrollment(SORTED, "p1", 1_000);
    const step = applyEnrollmentPass(
      enrollment,
      "p2",
      { dealerId: "p1", sortedPlayerIds: SORTED, ...DEAL_CTX },
      2_000,
    );
    assert.equal(step.kind, "continue");
    if (step.kind !== "continue") return;
    assert.deepEqual(step.handEnrollment.declinedIds, ["p2"]);
    assert.equal(step.handEnrollment.currentIndex, 1);
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

  it("3-player table advances through consecutive timeouts", () => {
    const ids = ["p1", "p2", "p3"];
    const ctx = { dealerId: "p1", sortedPlayerIds: ids, seed: 1, dealingRule: null };
    let enrollment = buildHandEnrollment(ids, "p1", 1_000);
    assert.equal(currentEnrollmentPlayer(enrollment), "p2");

    const step1 = applyEnrollmentTimeout(enrollment, ctx, 13_000);
    assert.equal(step1.kind, "continue");
    if (step1.kind !== "continue") return;
    assert.equal(currentEnrollmentPlayer(step1.handEnrollment), "p3");
    assert.deepEqual(step1.handEnrollment.declinedIds, ["p2"]);

    const step2 = applyEnrollmentTimeout(step1.handEnrollment, ctx, 26_000);
    assert.equal(step2.kind, "continue");
    if (step2.kind !== "continue") return;
    assert.equal(currentEnrollmentPlayer(step2.handEnrollment), "p1");
    assert.deepEqual(step2.handEnrollment.declinedIds, ["p2", "p3"]);

    const step3 = applyEnrollmentTimeout(step2.handEnrollment, ctx, 39_000);
    assert.equal(step3.kind, "restart");
    if (step3.kind !== "restart") return;
    assert.equal(currentEnrollmentPlayer(step3.handEnrollment), "p2");
    assert.deepEqual(step3.handEnrollment.declinedIds, []);
    assert.deepEqual(step3.handEnrollment.enrolledIds, []);
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
