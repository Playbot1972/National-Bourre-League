import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyCallableProbe } from "./verify-game-callables.mjs";

describe("verify-game-callables classifier", () => {
  it("treats 401 UNAUTHENTICATED as reachable callable", () => {
    const verdict = classifyCallableProbe({
      name: "gameAdvanceBots",
      status: 401,
      body: { error: { status: "UNAUTHENTICATED", message: "Sign in required" } },
    });
    assert.equal(verdict.ok, true);
  });

  it("treats 400 INVALID_ARGUMENT as reachable callable", () => {
    const verdict = classifyCallableProbe({
      name: "gamePlayCard",
      status: 400,
      body: { error: { status: "INVALID_ARGUMENT", message: "Bad Request" } },
    });
    assert.equal(verdict.ok, true);
  });

  it("treats 403 as missing Cloud Run invoker", () => {
    const verdict = classifyCallableProbe({
      name: "gameAdvanceBots",
      status: 403,
      body: "<html>Forbidden</html>",
    });
    assert.equal(verdict.ok, false);
    assert.equal(verdict.reason, "missing_cloud_run_invoker");
  });
});
