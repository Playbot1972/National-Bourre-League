/**
 * GSAP motionPath — MotionPathPlugin registration + safe arc fallback.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("gsap motionPath wiring", () => {
  const initSrc = readFileSync(
    fileURLToPath(new URL("../src/table/animations/initMotion.ts", import.meta.url)),
    "utf8",
  );
  const arcSrc = readFileSync(
    fileURLToPath(new URL("../src/table/animations/arcTween.ts", import.meta.url)),
    "utf8",
  );
  const dealSrc = readFileSync(
    fileURLToPath(new URL("../src/table/animations/dealPresentationMotion.ts", import.meta.url)),
    "utf8",
  );

  it("registers MotionPathPlugin once in initMotion", () => {
    assert.ok(initSrc.includes('from "gsap/MotionPathPlugin"'));
    assert.ok(initSrc.includes("gsap.registerPlugin(MotionPathPlugin)"));
    assert.ok(initSrc.includes("ensureGsapMotionPlugins"));
  });

  it("arc tween helper falls back when motionPath plugin is unavailable", () => {
    assert.ok(arcSrc.includes("isMotionPathAvailable()"));
    assert.ok(arcSrc.includes("keyframes"));
    assert.ok(arcSrc.includes("export function tweenAlongArc"));
  });

  it("deal presentation uses tweenAlongArc instead of raw motionPath", () => {
    assert.ok(dealSrc.includes('from "./arcTween"'));
    assert.ok(dealSrc.includes("tweenAlongArc"));
    assert.equal(dealSrc.includes("motionPath:"), false);
  });
});
