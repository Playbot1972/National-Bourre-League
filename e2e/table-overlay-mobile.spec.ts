import { test, expect } from "@playwright/test";
import {
  expectMobileOverlayGameplayFits,
  isOverlayControlInViewport,
  openOverlayFixture,
  overlayHorizontalOverflow,
} from "./helpers/overlayLayout";

const MOBILE_LAYOUTS = [
  { name: "iPhone portrait", width: 390, height: 844 },
  { name: "iPhone landscape", width: 844, height: 390 },
  { name: "Android portrait", width: 412, height: 915 },
  { name: "Android landscape", width: 915, height: 412 },
] as const;

test.describe("Mobile gameplay overlay layout", () => {
  for (const layout of MOBILE_LAYOUTS) {
    test(`${layout.name} — no horizontal overflow and controls reachable`, async ({ page }) => {
      await page.setViewportSize({ width: layout.width, height: layout.height });
      await openOverlayFixture(page, { players: 4, bots: 1, phase: "draw" });

      await expectMobileOverlayGameplayFits(page, {
        portrait: layout.height > layout.width,
      });

      for (const testId of ["table-root", "hero-hand", "settings-button", "draw-button"] as const) {
        expect(await isOverlayControlInViewport(page, testId)).toBe(true);
      }
    });
  }

  test("settings panel opens on mobile overlay", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openOverlayFixture(page, { phase: "draw" });

    const overlay = page.locator("#table-play-overlay");
    await overlay.getByTestId("settings-button").click();
    await expect(overlay.getByTestId("settings-panel")).toBeVisible();
    await overlay.getByRole("button", { name: "Close" }).first().click();
    await expect(overlay.getByTestId("settings-panel")).toBeHidden();
  });
});
