import { test, expect } from "@playwright/test";
import { tapPreselectCard, waitForHeroCardInteractive } from "./helpers/cardPlay";

test.describe("Play preselect queue", () => {
  test("queued card survives opponent turn advance", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-session?players=4&bots=1&phase=play&turn=p1&tick=0");
    await expect(page.getByTestId("hero-hand")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("table-felt")).toBeVisible();
    await waitForHeroCardInteractive(page, 1);

    const card = page.locator('[data-testid="hero-hand"] .pcard[data-card-index="1"]').first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-playable", "true");

    await tapPreselectCard(page, card);
    await expect(page.getByTestId("play-preselect-hint")).toBeVisible();
    await expect(card.locator("..")).toHaveClass(/hand__slot--play-preselected/);

    await page.evaluate(() => {
      window.__fixtureAdvancePlayTurn?.("p2");
    });

    await expect(page.getByTestId("play-preselect-hint")).toBeVisible();
    await expect(card.locator("..")).toHaveClass(/hand__slot--play-preselected/);
  });

  test("queued card clears on phase boundary", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-session?players=4&bots=1&phase=play&turn=p1&tick=0");
    await expect(page.getByTestId("hero-hand")).toBeVisible({ timeout: 15_000 });
    await waitForHeroCardInteractive(page, 2);

    const card = page.locator('[data-testid="hero-hand"] .pcard[data-card-index="2"]').first();
    await tapPreselectCard(page, card);
    await expect(page.getByTestId("play-preselect-hint")).toBeVisible();

    await page.evaluate(() => {
      const root = document.getElementById("table-root");
      if (!root) return;
      const url = new URL(window.location.href);
      url.searchParams.set("phase", "draw");
      window.history.replaceState({}, "", url.toString());
      window.location.reload();
    });

    await expect(page.getByTestId("hero-hand")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("play-preselect-hint")).toHaveCount(0);
  });
});

declare global {
  interface Window {
    __fixtureAdvancePlayTurn?: (nextTurnId: string) => void;
  }
}
