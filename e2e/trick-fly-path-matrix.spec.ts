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
  sawShallowPolish: boolean;
  landed: boolean;
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

/** Post-polish minimum for geometry-close seats on desktop. */
const DESKTOP_MIN_READABLE_OFFSET_PX = 180;

/** Hero paths should stay long — polish must not shorten them. */
const HERO_MIN_OFFSET_PX = 250;

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
    test(`${players} players — fly animation completes with non-zero offset`, async ({
      page,
    }) => {
      const matrix = await runFlyMatrix(page, players);

      expect(matrix.results).toHaveLength(players);
      for (const row of matrix.results) {
        expect(row.sawFlyClass, `${row.playerId} should enter fly-from-hand`).toBe(true);
        expect(row.landed, `${row.playerId} should complete flight`).toBe(true);
        // awaiting-fly is brief once travel starts; fly-from-hand is the authoritative signal.
        if (!row.sawFlyClass) {
          expect(row.sawAwaiting, `${row.playerId} should start hidden`).toBe(true);
        }
        expect(row.maxOffsetPx, `${row.playerId} offset`).toBeGreaterThan(20);
        expect(row.sampleCount, `${row.playerId} samples`).toBeGreaterThan(5);
      }

      const hero = matrix.results.find((r) => r.playerId === "p0");
      expect(hero?.maxOffsetPx ?? 0).toBeGreaterThan(HERO_MIN_OFFSET_PX);
    });
  }

  test("8 players — weakest seat meets readable offset after shallow polish", async ({
    page,
  }) => {
    const matrix = await runFlyMatrix(page, 8);

    expect(matrix.weakest.maxOffsetPx).toBeGreaterThanOrEqual(DESKTOP_MIN_READABLE_OFFSET_PX);
    expect(matrix.weakest.sawFlyClass).toBe(true);

    const shallowRows = matrix.results.filter((r) => r.sawShallowPolish);
    expect(shallowRows.length).toBeGreaterThanOrEqual(1);
    for (const row of shallowRows) {
      expect(row.maxOffsetPx).toBeGreaterThanOrEqual(DESKTOP_MIN_READABLE_OFFSET_PX);
    }

    const hero = matrix.results.find((r) => r.playerId === "p0");
    expect(hero?.sawShallowPolish).toBe(false);
  });
});

test.describe("Trick fly path matrix — mobile portrait", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  for (const players of [2, 4, 8] as const) {
    test(`${players} players — shallow polish on weak seats`, async ({ page }) => {
      const matrix = await runFlyMatrix(page, players);
      for (const row of matrix.results) {
        expect(row.sawFlyClass).toBe(true);
        expect(row.landed).toBe(true);
        expect(row.maxOffsetPx).toBeGreaterThan(15);
      }

      if (players === 8) {
        expect(matrix.weakest.maxOffsetPx).toBeGreaterThanOrEqual(160);
        expect(matrix.weakest.sawShallowPolish).toBe(true);
      }

      const hero = matrix.results.find((r) => r.playerId === "p0");
      expect(hero?.sawShallowPolish).toBe(false);
    });
  }
});
