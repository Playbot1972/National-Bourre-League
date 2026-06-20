import { test, expect } from "@playwright/test";
import {
  expectMobileOverlayGameplayFits,
  expectMobileOverlayTableScale,
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

const PHASES = ["decision", "draw", "play"] as const;

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

  for (const layout of MOBILE_LAYOUTS) {
    test(`${layout.name} — eight players fit without seat clipping`, async ({ page }) => {
      await page.setViewportSize({ width: layout.width, height: layout.height });
      await openOverlayFixture(page, { players: 8, bots: 3, phase: "draw" });

      await expectMobileOverlayGameplayFits(page, {
        portrait: layout.height > layout.width,
      });
      expect(await overlayHorizontalOverflow(page)).toBeLessThanOrEqual(2);
      expect(await isOverlayControlInViewport(page, "table-root")).toBe(true);
    });
  }

  for (const phase of PHASES) {
    test(`iPhone portrait — ${phase} phase layout stable`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openOverlayFixture(page, { players: 4, bots: 1, phase });

      await expectMobileOverlayGameplayFits(page, { portrait: true });
      expect(await overlayHorizontalOverflow(page)).toBeLessThanOrEqual(2);
      if (phase === "decision") {
        expect(await isOverlayControlInViewport(page, "decision-im-in-button")).toBe(true);
      } else {
        expect(await isOverlayControlInViewport(page, "hero-hand")).toBe(true);
      }
      expect(await isOverlayControlInViewport(page, "settings-button")).toBe(true);
    });
  }

  test("iPhone portrait — visual snapshot of mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openOverlayFixture(page, { players: 4, bots: 1, phase: "draw" });
    await page.waitForTimeout(200);

    await expect(page.locator("#table-play-overlay .btable-mobile")).toBeVisible();
    await expect(page).toHaveScreenshot("mobile-overlay-portrait-draw.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.08,
    });
  });

  test("settings panel opens on mobile overlay", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openOverlayFixture(page, { phase: "draw" });

    const overlay = page.locator("#table-play-overlay");
    await overlay.getByTestId("settings-button").click();
    await expect(overlay.getByTestId("settings-panel")).toBeVisible();
    await overlay.getByRole("button", { name: "Close" }).first().click();
    await expect(overlay.getByTestId("settings-panel")).toBeHidden();
  });

  test("table scale slider enlarges stage on iPhone portrait", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openOverlayFixture(page, { players: 4, bots: 1, phase: "draw" });
    await expectMobileOverlayTableScale(page);
  });
});
