import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nextAppVersion } from "./bump-version.js";

describe("nextAppVersion", () => {
  it("increments patch segment", () => {
    assert.equal(nextAppVersion("1.00.64"), "1.00.65");
    assert.equal(nextAppVersion("1.00.09"), "1.00.10");
  });

  it("rolls minor when patch exceeds 99", () => {
    assert.equal(nextAppVersion("1.00.99"), "1.01.00");
  });

  it("rejects invalid format", () => {
    assert.throws(() => nextAppVersion("1.0.64"), /N\.NN\.NN/);
  });
});
