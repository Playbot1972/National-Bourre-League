import { test, expect } from "./fixtures/consoleGuard";
import { TRUMP_BEAT_READ_MS, trickResolutionScheduleMs } from "../src/table/trickTiming";

test.describe("Trick presentation — premium hold timing", () => {
  test("all four trick cards stay visible through trickComplete before winner reveal", async ({
    page,
  }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = page.getByTestId("trick-row");
    await expect(trickRow).toHaveAttribute("data-trick-phase", "trickComplete", {
      timeout: 8_000,
    });

    const plays = trickRow.locator(".btrick__play .pcard");
    await expect(trickRow).toHaveAttribute("data-trick-card-count", "4");
    await expect(plays).toHaveCount(4);
    await expect(page.getByTestId("trick-winner-tag")).toHaveCount(0);

    const schedule = trickResolutionScheduleMs({});
    await expect(trickRow).toHaveAttribute("data-trick-phase", "winnerReveal", {
      timeout: schedule.readBeforeWinnerMs + 600,
    });
    await expect(page.getByTestId("trick-winner-tag")).toBeVisible();

    await expect(trickRow).toHaveAttribute("data-trick-phase", "collectTrick", {
      timeout: schedule.winnerRevealMs + 500,
    });
    await expect(trickRow).toHaveAttribute("data-trick-phase", "live", {
      timeout: schedule.sweepMs + schedule.nextLeadGapMs + 600,
    });
  });

  test("trump-beat tricks use longer read before collection", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?trumpBeat=1&resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = page.getByTestId("trick-row");
    await expect(trickRow).toHaveAttribute("data-trick-phase", "trickComplete", {
      timeout: 8_000,
    });

    const trickCompleteAt = Date.now();
    await expect(trickRow).toHaveAttribute("data-trick-phase", "live", {
      timeout: TRUMP_BEAT_READ_MS + 1_200,
    });
    expect(Date.now() - trickCompleteAt).toBeGreaterThanOrEqual(TRUMP_BEAT_READ_MS - 400);
  });

  test("trump suit reminder shows after upcard clears in play", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=99999");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId("trump-suit-reminder")).toBeVisible();
    await expect(page.getByTestId("trump-button")).toHaveCount(0);
  });
});
