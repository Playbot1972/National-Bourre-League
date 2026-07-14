import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeAnteStaggerMs } from "./antePresentationTiming";

describe("antePresentationTiming", () => {
  it("compresses stagger for larger tables", () => {
    assert.ok(computeAnteStaggerMs(8, false) < computeAnteStaggerMs(3, false));
  });

  it("shortens stagger under reduced motion", () => {
    assert.ok(computeAnteStaggerMs(6, true) < computeAnteStaggerMs(6, false));
  });
});
