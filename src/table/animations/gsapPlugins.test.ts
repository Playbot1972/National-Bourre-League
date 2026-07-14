import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { _resetGsapPluginsForTests, ensureGsapPlugins } from "./gsapPlugins";

describe("gsapPlugins", () => {
  it("ensureGsapPlugins is safe to call repeatedly in jsdom", () => {
    _resetGsapPluginsForTests();
    assert.doesNotThrow(() => {
      ensureGsapPlugins();
      ensureGsapPlugins();
    });
  });
});
