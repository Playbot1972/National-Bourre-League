import { test, expect } from "@playwright/test";

async function expectedSeatCount(page: import("@playwright/test").Page, players: number): Promise<number> {
  const usesMobileTable = await page.evaluate(() =>
    Boolean(document.querySelector(".btable-mobile-wrap")),
  );
  return usesMobileTable ? Math.max(1, players - 1) : players;
}

async function horizontalOverflow(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** Key 2–8 seat layouts with human/bot mixes for release QA. */
const PLAYER_MATRIX: Array<{ players: number; bots: number; label: string }> = [
  { players: 2, bots: 0, label: "2 humans" },
  { players: 2, bots: 1, label: "2 seats · 1 bot" },
  { players: 3, bots: 1, label: "3 seats · 1 bot" },
  { players: 3, bots: 2, label: "3 seats · 2 bots" },
  { players: 4, bots: 0, label: "4 humans" },
  { players: 4, bots: 2, label: "4 seats · 2 bots" },
  { players: 5, bots: 3, label: "5 seats · 3 bots" },
  { players: 6, bots: 4, label: "6 seats · 4 bots" },
  { players: 7, bots: 5, label: "7 seats · 5 bots" },
  { players: 8, bots: 4, label: "8 seats · 4 bots" },
  { players: 8, bots: 7, label: "8 seats · 7 bots" },
];

const PHASES = ["decision", "draw", "play"] as const;

for (const { players, bots, label } of PLAYER_MATRIX) {
  test.describe(`Table matrix — ${label}`, () => {
    for (const phase of PHASES) {
      test(`${phase} phase renders ${players} seats without overflow`, async ({ page }) => {
        const qs = new URLSearchParams({
          players: String(players),
          bots: String(bots),
          phase,
          tick: phase === "decision" ? "1" : "0",
        });
        await page.goto(`/e2e-fixtures/table-session?${qs}`);
        await expect(page.getByTestId("table-root")).toBeVisible({
          timeout: 15_000,
        });

        const seats = page.locator(".bseat");
        await expect(seats).toHaveCount(await expectedSeatCount(page, players));

        if (bots > 0) {
          await expect(page.locator(".bseat__robot-tag")).toHaveCount(bots);
        }

        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);

        const shortLandscape = await page.evaluate(
          () => window.matchMedia("(orientation: landscape)").matches && window.innerHeight < 500,
        );
        if (!shortLandscape) {
          const avatarsInView = await page.evaluate(() => {
            const viewport = {
              left: 0,
              top: 0,
              right: window.innerWidth,
              bottom: window.innerHeight,
            };
            const nodes = [...document.querySelectorAll(".bseat__avatar")];
            return nodes.every((node) => {
              const r = node.getBoundingClientRect();
              return (
                r.left >= viewport.left - 1 &&
                r.top >= viewport.top - 1 &&
                r.right <= viewport.right + 1 &&
                r.bottom <= viewport.bottom + 1
              );
            });
          });
          expect(avatarsInView).toBe(true);
        }

        if (phase === "decision") {
          const usesMobileTable = await page.evaluate(() =>
            Boolean(document.querySelector(".btable-mobile-wrap")),
          );
          if (!usesMobileTable) {
            await expect(page.getByTestId("decision-panel")).toBeVisible();
          }
          await expect(page.getByTestId("stay-pat-button")).toBeVisible();
        }

        if (phase === "draw" || phase === "play") {
          await expect(page.getByTestId("hero-hand")).toBeVisible();
          await expect(page.getByTestId("pot-display")).toBeVisible();
          await expect(page.getByTestId("table-felt")).toBeVisible();
        }
      });
    }
  });
}

test.describe("Decision timer ticks", () => {
  test("countdown decreases over 2 seconds", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-session?players=4&bots=2&phase=decision&tick=1");
    const timerLocator = page.getByTestId("pass-decision-button");
    await expect(timerLocator).toBeVisible();
    const first = await timerLocator.textContent();
    await page.waitForTimeout(2100);
    const second = await timerLocator.textContent();
    expect(first).not.toEqual(second);
    const firstSec = parseInt(first?.match(/(\d+)s/)?.[1] ?? "99", 10);
    const secondSec = parseInt(second?.match(/(\d+)s/)?.[1] ?? "0", 10);
    expect(secondSec).toBeLessThan(firstSec);
  });
});
