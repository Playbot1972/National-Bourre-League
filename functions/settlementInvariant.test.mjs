/**
 * Structured settlement invariant error mapping (unit).
 *
 * Run: cd functions && node --test settlementInvariant.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HttpsError } from "firebase-functions/v2/https";
import {
  throwPreCommitInvariantMismatch,
  throwPostCommitInvariantDrift,
} from "./settlementInvariant.js";

const baseResult = {
  ok: false,
  expected: 3000,
  actual: 3100,
  bankrollSum: 2800,
  potSum: 150,
  carryPot: 150,
  errors: ["chip_total_mismatch"],
};

function driftOutcome() {
  return {
    ok: false,
    result: baseResult,
    sessionId: "sess_unit",
    handNumber: 1,
    actionId: "settle:sess_unit:1",
    label: "after-bot-auto-rebuy:1",
  };
}

describe("settlementInvariant structured errors", () => {
  it("pre-commit throws TABLE_CHIP_INVARIANT_MISMATCH with committed false", () => {
    assert.throws(
      () => throwPreCommitInvariantMismatch(driftOutcome()),
      (err) => {
        assert.equal(err instanceof HttpsError, true);
        assert.equal(err.code, "failed-precondition");
        assert.match(err.message, /settlement was not applied/i);
        assert.equal(err.details.code, "TABLE_CHIP_INVARIANT_MISMATCH");
        assert.equal(err.details.committed, false);
        assert.equal(err.details.sessionId, "sess_unit");
        assert.equal(err.details.handNumber, 1);
        assert.equal(err.details.actionId, "settle:sess_unit:1");
        assert.equal(err.details.expected, 3000);
        assert.equal(err.details.actual, 3100);
        assert.equal(err.details.delta, 100);
        return true;
      },
    );
  });

  it("post-commit throws POST_COMMIT_INVARIANT_DRIFT with committed true", () => {
    assert.throws(
      () => throwPostCommitInvariantDrift(driftOutcome()),
      (err) => {
        assert.equal(err instanceof HttpsError, true);
        assert.equal(err.code, "failed-precondition");
        assert.match(err.message, /accounting review/i);
        assert.equal(err.details.code, "POST_COMMIT_INVARIANT_DRIFT");
        assert.equal(err.details.committed, true);
        assert.equal(err.details.sessionId, "sess_unit");
        assert.equal(err.details.handNumber, 1);
        assert.equal(err.details.expected, 3000);
        assert.equal(err.details.actual, 3100);
        assert.equal(err.details.delta, 100);
        return true;
      },
    );
  });

  it("ok outcomes do not throw", () => {
    throwPreCommitInvariantMismatch({ ok: true, result: null });
    throwPostCommitInvariantDrift({ ok: true, result: null });
  });
});
