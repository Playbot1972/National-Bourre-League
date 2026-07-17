import { test, expect } from "./fixtures/consoleGuard";
import { POST_TRICK_READ, trickResolutionSchedule } from "./helpers/pacingTimings";
import { TRUMP_BEAT_READ_MS } from "../src/table/trickTiming";

async function waitForFullTrick(page: import("@playwright/test").Page) {
  const trickRow = page.getByTestId("trick-row");
  await expect(trickRow).toHaveAttribute("data-trick-card-count", "4", { timeout: 8_000 });
  await expect(trickRow.locator(".btrick__play .pcard")).toHaveCount(4);
  return trickRow;
}

test.describe("Trick presentation — premium hold timing", () => {
  test("all four trick cards stay visible before winner reveal", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = await waitForFullTrick(page);
    await expect(page.getByTestId("trick-winner-tag")).toHaveCount(0);

    const schedule = trickResolutionSchedule();
    await expect(trickRow).toHaveAttribute("data-trick-phase", "winnerReveal", {
      timeout: 900 + schedule.readTotalMs + 400,
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

    const pageStart = Date.now();
    const trickRow = await waitForFullTrick(page);
    await expect(trickRow).toHaveAttribute("data-trick-phase", "live", {
      timeout: TRUMP_BEAT_READ_MS + 1_200,
    });
    expect(Date.now() - pageStart).toBeGreaterThanOrEqual(TRUMP_BEAT_READ_MS - 400);
  });

  test("atomic server resolve keeps all four cards visible", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?atomic=1&resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = await waitForFullTrick(page);
    await expect
      .poll(async () => trickRow.getAttribute("data-trick-phase"), { timeout: 8_000 })
      .toMatch(/trickComplete|winnerReveal|collectTrick/);
    await expect(trickRow.locator(".btrick__play .pcard")).toHaveCount(4);
  });

  test("turn ring returns at collectTrick (step 3 — not held through sweep)", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = await waitForFullTrick(page);
    const schedule = trickResolutionSchedule();

    await expect(trickRow).toHaveAttribute("data-trick-phase", "winnerReveal", {
      timeout: 900 + schedule.readTotalMs + 400,
    });
    await expect(
      page.locator('[data-pacing-active-actor="true"] [data-testid="turn-countdown-ring"]'),
    ).toHaveCount(0);

    await expect(trickRow).toHaveAttribute("data-trick-phase", "collectTrick", {
      timeout: schedule.winnerRevealMs + 500,
    });
    await expect(
      page.locator('[data-pacing-active-actor="true"] [data-testid="turn-countdown-ring"]'),
    ).toBeVisible();

    await expect(trickRow).toHaveAttribute("data-trick-phase", "live", {
      timeout: schedule.sweepMs + schedule.nextLeadGapMs + 600,
    });
  });

  test("post-trick read compresses to ~525ms before collection (step 3)", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=900");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const trickRow = await waitForFullTrick(page);
    const schedule = trickResolutionSchedule();
    const pipelineStart = Date.now();

    await expect(trickRow).toHaveAttribute("data-trick-phase", "collectTrick", {
      timeout: 900 + schedule.readTotalMs + schedule.winnerRevealMs + 600,
    });

    const readPipelineMs = Date.now() - pipelineStart;
    expect(readPipelineMs).toBeGreaterThanOrEqual(POST_TRICK_READ - 350);
    expect(readPipelineMs).toBeLessThanOrEqual(POST_TRICK_READ + schedule.winnerRevealMs + 500);
  });

  test("trump suit reminder shows after upcard clears in play", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trick-hold?resolveDelay=99999");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId("trump-suit-reminder")).toBeVisible();
    await expect(page.getByTestId("trump-button")).toBeHidden();
  });
});
