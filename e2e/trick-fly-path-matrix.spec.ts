import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    __flyPathMatrix: {
      runMatrix: () => Promise<FlyMatrixResult>;
      playerCount: number;
    };
  }
}

interface FlySeatResult {
  playerId: string;
  sawAwaiting: boolean;
  sawFlyClass: boolean;
  maxOffsetPx: number;
  seatClass: string;
}

interface FlyMatrixResult {
  playerCount: number;
  viewport: { width: number; height: number };
  results: FlySeatResult[];
  weakest: FlySeatResult & { maxOffsetPx: number };
}

const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7, 8] as const;

/** Minimum fly offset (px) for a seat to count as a readable travel path on desktop. */
const DESKTOP_READABLE_OFFSET_PX = 80;

async function runFlyMatrix(
  page: import("@playwright/test").Page,
  players: number,
): Promise<FlyMatrixResult> {
  await page.goto(`/e2e-fixtures/table-fly-path-matrix?players=${players}`);
  await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });
  return page.evaluate(() => window.__flyPathMatrix.runMatrix());
}

test.describe("Trick fly path matrix — desktop 2–8 seats", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  for (const players of PLAYER_COUNTS) {
    test(`${players} players — each seat runs fly animation with non-zero offset`, async ({
      page,
    }) => {
      const matrix = await runFlyMatrix(page, players);

      expect(matrix.results).toHaveLength(players);
      for (const row of matrix.results) {
        expect(row.sawAwaiting, `${row.playerId} should start hidden`).toBe(true);
        expect(row.sawFlyClass, `${row.playerId} should enter fly-from-hand`).toBe(true);
        expect(row.maxOffsetPx, `${row.playerId} offset`).toBeGreaterThan(20);
      }

      // Hero (p0) should always have a long, readable path on desktop.
      const hero = matrix.results.find((r) => r.playerId === "p0");
      expect(hero?.maxOffsetPx ?? 0).toBeGreaterThan(250);

      // Weakest seat is recorded for recon — not a hard fail unless motion is absent.
      expect(matrix.weakest.maxOffsetPx).toBeGreaterThan(20);
    });
  }

  test("summary — weakest seats stay above marginal threshold at 8 players", async ({
    page,
  }) => {
    const matrix = await runFlyMatrix(page, 8);
    const marginal = matrix.results.filter((r) => r.maxOffsetPx < DESKTOP_READABLE_OFFSET_PX);
    // Top-rail seats near trick center can be shallow; still animated.
    expect(marginal.length).toBeGreaterThanOrEqual(0);
    expect(marginal.length).toBeLessThanOrEqual(3);
    for (const row of marginal) {
      expect(row.sawFlyClass).toBe(true);
    }
  });
});

test.describe("Trick fly path matrix — mobile portrait", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  for (const players of [2, 4, 8] as const) {
    test(`${players} players — fly classes present on all seats`, async ({ page }) => {
      const matrix = await runFlyMatrix(page, players);
      for (const row of matrix.results) {
        expect(row.sawFlyClass).toBe(true);
        expect(row.maxOffsetPx).toBeGreaterThan(15);
      }
    });
  }
});
