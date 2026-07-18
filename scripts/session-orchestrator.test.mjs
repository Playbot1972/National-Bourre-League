/**
 * Session orchestrator — render must not mutate game truth.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SESSION_ORCHESTRATION_DEBOUNCE_MS } from "../docs/session-orchestrator.js";

describe("session orchestrator", () => {
  const src = readFileSync(fileURLToPath(new URL("../docs/app.js", import.meta.url)), "utf8");

  it("exports debounce constant", () => {
    assert.equal(SESSION_ORCHESTRATION_DEBOUNCE_MS, 100);
  });

  it("renderRoomDetail does not call processRobotActions or startEnrollmentTimer", () => {
    const idx = src.indexOf("function renderRoomDetail()");
    assert.ok(idx >= 0);
    const nextFn = src.indexOf("function buildAddPlayerFormHtml", idx);
    const body = src.slice(idx, nextFn);
    assert.equal(body.includes("processRobotActions"), false);
    assert.equal(body.includes("startEnrollmentTimer"), false);
    assert.equal(body.includes("maybeRecoverHandLifecycle"), false);
  });

  it("syncTableSession does not start enrollment timer or recover lifecycle", () => {
    const idx = src.indexOf("async function syncTableSession");
    const nextFn = src.indexOf("function scheduleTableSessionSync", idx);
    const body = src.slice(idx, nextFn);
    assert.equal(body.includes("startEnrollmentTimer"), false);
    assert.equal(body.includes("maybeRecoverHandLifecycle"), false);
  });

  it("scheduleRenderRoomDetail routes snapshots to orchestration not lifecycle directly", () => {
    const idx = src.indexOf("function scheduleRenderRoomDetail()");
    const body = src.slice(idx, idx + 400);
    assert.ok(body.includes("scheduleSessionOrchestration"));
    assert.equal(body.includes("maybeRecoverHandLifecycle"), false);
  });

  it("onPlayCard intent does not call processRobotActions", () => {
    const intentsSrc = readFileSync(
      fileURLToPath(new URL("../docs/table-intents.js", import.meta.url)),
      "utf8",
    );
    const idx = intentsSrc.indexOf("onPlayCard(cardIndex)");
    assert.ok(idx >= 0);
    const body = intentsSrc.slice(idx, idx + 1200);
    assert.equal(body.includes("processRobotActions"), false);
    assert.equal(src.includes("actions: getTableIntentHandlers()"), true);
  });

  it("has orchestration storm coalesce", () => {
    assert.ok(src.includes("sessionOrchestrationCoalesce"));
    assert.ok(src.includes("clearSessionOrchestrationSchedule"));
    assert.ok(src.includes("stopTablePlaySideEffects"));
  });

  it("enrollment timer delegates to scheduleSessionOrchestration", () => {
    const idx = src.indexOf("function startEnrollmentTimer()");
    const nextFn = src.indexOf("let tablePlayOpen", idx);
    const body = src.slice(idx, nextFn);
    assert.ok(body.includes("scheduleSessionOrchestration"));
    assert.equal(body.includes("processRobotActions"), false);
  });

  it("runSessionOrchestration skips processRobotActions on human-only turns", () => {
    const idx = src.indexOf("function runSessionOrchestration(");
    assert.ok(idx >= 0);
    const nextFn = src.indexOf("function scheduleSessionOrchestration", idx);
    const body = src.slice(idx, nextFn);
    assert.ok(body.includes("if (needsDriver || enrollmentActive || pagatClock)"));
    assert.ok(body.includes("processRobotActions(sessionObj, scores)"));
    assert.equal(body.includes("needsEnrollment"), false);
    assert.equal(body.includes("sessionNeedsEnrollmentDriver"), false);
  });

  it("msSinceLastRobot is null until a robot has played", () => {
    assert.ok(src.includes("lastRobotTrickAt > 0 ? Date.now() - lastRobotTrickAt : null"));
  });
});
