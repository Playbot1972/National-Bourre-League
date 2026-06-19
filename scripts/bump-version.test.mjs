import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nextAppVersion, formatVersionLabel, formatVersionDisplayLabel } from "./lib/version-format.mjs";

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

describe("formatVersionLabel", () => {
  it("adds dev marker for local builds", () => {
    assert.equal(formatVersionLabel("1.01.30", "abc12345", "dev"), "v1.01.30+abc12345 dev");
  });

  it("omits dev marker for production builds", () => {
    assert.equal(formatVersionLabel("1.01.30", "abc12345", "production"), "v1.01.30+abc12345");
  });
});

describe("formatVersionDisplayLabel", () => {
  it("strips build metadata for user-facing labels", () => {
    assert.equal(formatVersionDisplayLabel("v1.01.49+b3636750"), "v1.01.49");
    assert.equal(formatVersionDisplayLabel("v1.01.30+abc12345 dev"), "v1.01.30");
  });
});
