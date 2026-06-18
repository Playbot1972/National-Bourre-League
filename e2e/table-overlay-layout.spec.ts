import { test, expect } from "@playwright/test";
import {
  expectOverlayStageFillsViewport,
  expectTableScaleAffectsStage,
  readOverlayStageMetrics,
} from "./helpers/overlayLayout";

test.describe("Table overlay layout — full-screen stage fit", () => {
  test("overlay fixture stage fills viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/e2e-fixtures/table-overlay?players=4&bots=1&phase=draw");

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });
    await expect(overlay.getByTestId("table-felt")).toBeVisible();

    await expectOverlayStageFillsViewport(page);
  });

  test("table scale slider changes rendered stage size", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/e2e-fixtures/table-overlay?players=4&bots=1&phase=draw");
    await expect(page.locator("#table-play-overlay").getByTestId("table-root")).toBeVisible({
      timeout: 15_000,
    });

    await expectTableScaleAffectsStage(page);
  });

  test("close control is present on overlay fixture", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-overlay");
    await expect(page.locator("#close-table-play")).toBeVisible();
    const metrics = await readOverlayStageMetrics(page);
    expect(metrics).not.toBeNull();
    expect(metrics!.overlayW).toBeGreaterThan(600);
  });
});
