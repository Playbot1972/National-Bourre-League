import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appJs = readFileSync(join(root, "docs/app.js"), "utf8");

describe("bot presentation gate delegation (docs/app.js)", () => {
  it("delegates shouldBlockRobotForPresentation to evaluateBotPresentationGate when exported", () => {
    assert.match(appJs, /tableMountApi\?\.evaluateBotPresentationGate/);
    assert.match(appJs, /legacyShouldBlockRobotForPresentation/);
    assert.match(
      appJs,
      /typeof gateFn === "function"[\s\S]*return result\.blocked[\s\S]*legacyShouldBlockRobotForPresentation/,
    );
  });

  it("keeps legacy fallback timeouts at 5.5s / 7s only in legacy path", () => {
    const legacyStart = appJs.indexOf("function legacyShouldBlockRobotForPresentation");
    assert.ok(legacyStart >= 0);
    const legacyBody = appJs.slice(legacyStart, legacyStart + 2500);
    assert.match(legacyBody, /ROBOT_PRESENTATION_FORCE_MS/);
    assert.match(legacyBody, /ROBOT_PRESENTATION_SOFT_MS/);
    assert.doesNotMatch(legacyBody, /robot-turn-timeout(?!-legacy)/);
  });

  it("passes structured debug context into bridge gate evaluation", () => {
    assert.match(appJs, /sessionId: openSessionId/);
    assert.match(appJs, /handNumber: ctx\.handNumber/);
    assert.match(appJs, /trickNumber: ctx\.trickNumber/);
    assert.match(appJs, /presentationSubstate: gate\?\.handPresentationPhase/);
  });
});
