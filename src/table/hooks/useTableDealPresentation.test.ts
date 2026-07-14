import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldRecoverDealPresentation } from "./useTableDealPresentation";

describe("shouldRecoverDealPresentation", () => {
  const dealKey = "1:5:p0,p1,p2,p3";

  it("recovers when deal key committed but GSAP no longer active", () => {
    assert.equal(
      shouldRecoverDealPresentation(dealKey, dealKey, false, "deal"),
      true,
    );
  });

  it("does not recover while deal animation is still active", () => {
    assert.equal(
      shouldRecoverDealPresentation(dealKey, dealKey, true, "deal"),
      false,
    );
  });

  it("does not recover after phase advanced", () => {
    assert.equal(
      shouldRecoverDealPresentation(dealKey, dealKey, false, "trumpReveal"),
      false,
    );
  });

  it("does not recover for a different deal key", () => {
    assert.equal(
      shouldRecoverDealPresentation("1:5:p0,p1", dealKey, false, "deal"),
      false,
    );
  });
});
