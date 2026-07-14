import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensureGsapPlugins, gsap } from "./gsapPlugins";

describe("gsapPlugins", () => {
  it("registers MotionPathPlugin when GSAP runtime supports plugins", () => {
    ensureGsapPlugins();
    if (typeof gsap.registerPlugin !== "function") {
      return;
    }
    assert.ok(gsap.plugins.motionPath, "MotionPathPlugin should be registered");
  });
});
