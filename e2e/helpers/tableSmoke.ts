import { expect, type Page } from "@playwright/test";

export type TableFixturePhase = "decision" | "reveal" | "draw" | "play" | "enrollment";

export interface TableFixtureOptions {
  players?: number;
  bots?: number;
  /** `enrollment` is accepted as an alias for Pagat `decision`. */
  phase?: TableFixturePhase;
  tick?: boolean;
}

export function tableFixtureUrl(options: TableFixtureOptions = {}): string {
  const qs = new URLSearchParams({
    players: String(options.players ?? 4),
    bots: String(options.bots ?? 1),
    phase: options.phase ?? "decision",
    tick: options.tick === false ? "0" : "1",
  });
  return `/e2e-fixtures/table-session?${qs}`;
}

/** Navigate to the seeded table-session fixture and wait for the felt. */
export async function openTableFixture(page: Page, options: TableFixtureOptions = {}) {
  await page.goto(tableFixtureUrl(options));
  await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("table-felt")).toBeVisible();
}

export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

/** True when an element's center lies inside the viewport (mobile overlap check). */
export async function isElementInViewport(page: Page, testId: string): Promise<boolean> {
  const locator = page.getByTestId(testId).first();
  await locator.scrollIntoViewIfNeeded();
  return locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (
      cx >= 0 &&
      cy >= 0 &&
      cx <= window.innerWidth &&
      cy <= window.innerHeight &&
      rect.width > 0 &&
      rect.height > 0
    );
  });
}
