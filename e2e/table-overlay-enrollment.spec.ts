import { test, expect } from "@playwright/test";
import {
  expectMobileOverlayGameplayFits,
  openOverlayFixture,
  readOverlayGameplayMetrics,
} from "./helpers/overlayLayout";

const ENROLLMENT_LAYOUTS = [
  { name: "iPhone portrait", width: 390, height: 844 },
  { name: "iPhone landscape", width: 844, height: 390 },
] as const;

test.describe("Decision overlay layout stability", () => {
  for (const layout of ENROLLMENT_LAYOUTS) {
    test(`${layout.name} — stage fit holds after I'm in`, async ({ page }) => {
      await page.setViewportSize({ width: layout.width, height: layout.height });
      await openOverlayFixture(page, { players: 4, bots: 1, phase: "decision" });

      const before = await readOverlayGameplayMetrics(page);
      expect(before).not.toBeNull();

      const overlay = page.locator("#table-play-overlay");
      await overlay.getByTestId("seat-opt-in").first().click();
      await expect(overlay.getByTestId("feedback-banner")).toContainText(/in|hand/i);

      await page.waitForTimeout(150);
      const afterJoin = await readOverlayGameplayMetrics(page);
      expect(afterJoin).not.toBeNull();

      expect(afterJoin!.stageW).toBeGreaterThanOrEqual(before!.stageW * 0.9);
      expect(afterJoin!.stageH).toBeGreaterThanOrEqual(before!.stageH * 0.9);

      await expectMobileOverlayGameplayFits(page, {
        portrait: layout.height > layout.width,
      });
    });
  }
});
