import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  projectedAnteContribution,
  resolveAnteContributorIds,
} from "./antePresentationOrder";

describe("antePresentationOrder", () => {
  const session = {
    dealerId: "d",
    participantIds: ["d", "p1", "p2", "p3"],
    seatedIds: ["d", "p1", "p2", "p3"],
    actionOrder: undefined,
    handEnrollment: undefined,
    postedAntes: undefined,
    anteContributorIds: undefined,
  };

  it("starts left of dealer and walks clockwise", () => {
    const ids = resolveAnteContributorIds(session, {}, 1);
    assert.deepEqual(ids, ["p1", "p2", "p3", "d"]);
  });

  it("skips exempt players with skipNextAnte", () => {
    const ids = resolveAnteContributorIds(
      session,
      { p2: { skipNextAnte: true } },
      1,
    );
    assert.deepEqual(ids, ["p1", "p3", "d"]);
  });

  it("skips players with zero posted ante", () => {
    const ids = resolveAnteContributorIds(
      { ...session, postedAntes: { p1: 0 } },
      {},
      1,
    );
    assert.deepEqual(ids, ["p2", "p3", "d"]);
  });

  it("skips out players", () => {
    const ids = resolveAnteContributorIds(
      session,
      { p1: { out: true } },
      1,
    );
    assert.deepEqual(ids, ["p2", "p3", "d"]);
  });

  it("honors precomputed anteContributorIds when provided", () => {
    const ids = resolveAnteContributorIds(
      { ...session, anteContributorIds: ["p3", "p1"] },
      {},
      1,
    );
    assert.deepEqual(ids, ["p3", "p1"]);
  });

  it("includes bourré replacement contributions", () => {
    assert.equal(
      projectedAnteContribution("b", { bourreReplacementDue: 12 }, 1),
      12,
    );
  });
});
