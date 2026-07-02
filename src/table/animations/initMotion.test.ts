import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isMotionPathPluginRegistered,
  registerGsapMotionPlugins,
} from "./initMotion";

describe("initMotion", () => {
  it("registers MotionPathPlugin exactly once", () => {
    registerGsapMotionPlugins();
    assert.equal(isMotionPathPluginRegistered(), true);
    registerGsapMotionPlugins();
    assert.equal(isMotionPathPluginRegistered(), true);
  });
});
