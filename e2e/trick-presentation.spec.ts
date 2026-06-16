import { test, expect } from "./fixtures/consoleGuard";
import {
  POST_TRICK_HOLD_MS,
  TRICK_SWEEP_MS,
  TRUMP_BEAT_HOLD_MS,
} from "../src/table/trickTiming";

test.describe("Trick presentation — premium hold timing", () => {
  test("all four trick cards stay visible through hold with winner tag", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = page.getByTestId("trick-row");
    await expect(trickRow).toHaveAttribute("data-trick-phase", "hold", { timeout: 8_000 });

    const plays = trickRow.locator(".btrick__play .pcard");
    await expect(trickRow).toHaveAttribute("data-trick-card-count", "4");
    await expect(plays).toHaveCount(4);
    for (let i = 0; i < 4; i += 1) {
      await expect(plays.nth(i)).toBeVisible();
    }

    await expect(page.getByTestId("trick-winner-tag")).toBeVisible();
    await expect(page.getByTestId("trick-winner-tag")).toContainText(/takes it/i);
    await expect(trickRow.locator(".btrick__play--winner")).toHaveCount(1);

    const holdStartedAt = Date.now();
    while (Date.now() - holdStartedAt < POST_TRICK_HOLD_MS - 500) {
      await expect(trickRow).toHaveAttribute("data-trick-phase", "hold");
      await expect(plays).toHaveCount(4);
      await page.waitForTimeout(200);
    }

    await expect(trickRow).toHaveAttribute("data-trick-phase", "sweep", { timeout: 1_200 });
    await expect(trickRow).toHaveAttribute("data-trick-phase", "live", {
      timeout: TRICK_SWEEP_MS + 400,
    });
    await expect(trickRow).toHaveAttribute("data-trick-card-count", "0");
  });

  test("trump-beat tricks use longer hold before sweep", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?trumpBeat=1&resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = page.getByTestId("trick-row");
    await expect(trickRow).toHaveAttribute("data-trick-phase", "hold", { timeout: 8_000 });

    const holdStartedAt = Date.now();
    await expect(trickRow).toHaveAttribute("data-trick-phase", "sweep", {
      timeout: TRUMP_BEAT_HOLD_MS + 800,
    });
    expect(Date.now() - holdStartedAt).toBeGreaterThanOrEqual(TRUMP_BEAT_HOLD_MS - 450);
  });

  test("trump suit reminder shows after upcard clears in play", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=99999");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId("trump-suit-reminder")).toBeVisible();
    await expect(page.getByTestId("trump-button")).toHaveCount(0);
    await expect(page.locator(".center-play__trump-suit--reminder")).toContainText(/trump/i);
  });
});
