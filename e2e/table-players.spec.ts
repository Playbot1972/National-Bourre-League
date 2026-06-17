import { test, expect } from "@playwright/test";

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

const PHASES = ["enrollment", "draw", "play"] as const;

for (const { players, bots, label } of PLAYER_MATRIX) {
  test.describe(`Table matrix — ${label}`, () => {
    for (const phase of PHASES) {
      test(`${phase} phase renders ${players} seats without overflow`, async ({ page }) => {
        const qs = new URLSearchParams({
          players: String(players),
          bots: String(bots),
          phase,
          tick: phase === "enrollment" ? "1" : "0",
        });
        await page.goto(`/e2e-fixtures/table-session?${qs}`);
        await expect(page.getByTestId("table-root")).toBeVisible({
          timeout: 15_000,
        });

        const seats = page.locator(".bseat");
        await expect(seats).toHaveCount(players);

        if (bots > 0) {
          await expect(page.locator(".bseat__robot-tag")).toHaveCount(bots);
        }

        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);

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

        if (phase === "enrollment") {
          await expect(page.locator(".bseat__timer-ring")).toBeVisible();
          await expect(page.locator(".btable-session__enroll-btn")).toBeVisible();
          await expect(page.locator(".btable-session__enroll-btn")).toContainText("I'm in");
        }

        if (phase === "draw" || phase === "play") {
          await expect(page.locator(".btable-hero")).toBeVisible();
          await expect(page.locator(".center-play")).toBeVisible();
          await expect(page.locator(".deck-stack")).toBeVisible();
        }
      });
    }
  });
}

test.describe("Enrollment timer ticks", () => {
  test("countdown decreases over 2 seconds", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-session?players=4&bots=2&phase=enrollment&tick=1");
    await expect(page.locator(".bseat__enroll-timer")).toBeVisible();
    const first = await page.locator(".bseat__enroll-timer").first().textContent();
    await page.waitForTimeout(2100);
    const second = await page.locator(".bseat__enroll-timer").first().textContent();
    expect(first).not.toEqual(second);
    const firstSec = parseInt(first?.match(/(\d+)s/)?.[1] ?? "99", 10);
    const secondSec = parseInt(second?.match(/(\d+)s/)?.[1] ?? "0", 10);
    expect(secondSec).toBeLessThan(firstSec);
  });
});
