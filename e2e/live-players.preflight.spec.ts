/**
 * Live-player E2E preflight — fast environment gate before the serial suite.
 *
 * Requires: npm run emulators + PLAYWRIGHT_EMULATORS=1
 * Exit: playwright failure = environment/harness not ready (skip heavy suite in CI).
 */
import { test } from "@playwright/test";
import { runLivePlayerPreflight } from "./helpers/livePlayerPreflight";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Live players — preflight", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(120_000);
  test.use({ actionTimeout: 30_000, navigationTimeout: 45_000 });

  test("emulator boot + signup + two-user context smoke", async ({ browser }) => {
    const result = await runLivePlayerPreflight(browser);
    if (!result.ok) {
      const label =
        result.failureClass === "environment"
          ? "ENVIRONMENT_FAILURE"
          : result.failureClass === "app"
            ? "APP_FLOW_FAILURE"
            : "HARNESS_FAILURE";
      throw new Error(`${label}: [${result.stage}] ${result.message}`);
    }
  });
});
