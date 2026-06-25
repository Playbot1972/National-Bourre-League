import { describe, it } from "node:test";
import assert from "node:assert/strict";

function classify(result) {
  if (result.status === 403) {
    return { ok: false, reason: "missing_cloud_run_invoker" };
  }
  if (result.status === 401 && result.body?.error?.status === "UNAUTHENTICATED") {
    return { ok: true, reason: "callable_reachable" };
  }
  return { ok: false, reason: "unexpected_status" };
}

describe("verify-game-callables classifier", () => {
  it("treats 401 UNAUTHENTICATED as reachable callable", () => {
    const verdict = classify({
      status: 401,
      body: { error: { status: "UNAUTHENTICATED", message: "Sign in required" } },
    });
    assert.equal(verdict.ok, true);
  });

  it("treats 403 as missing Cloud Run invoker", () => {
    const verdict = classify({ status: 403, body: "<html>Forbidden</html>" });
    assert.equal(verdict.ok, false);
    assert.equal(verdict.reason, "missing_cloud_run_invoker");
  });
});
