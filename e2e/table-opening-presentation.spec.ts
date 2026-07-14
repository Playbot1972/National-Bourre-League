import { test, expect } from "./fixtures/consoleGuard";
import { openTableFixture } from "./helpers/tableSmoke";

const REACT_310 = /Rendered more hooks than during the previous render|Minified React error #310/;

test.describe("Opening hand presentation — ante through trump reveal", () => {
  test("ante fly-in completes without crash; table stays visible through shuffle and deal", async ({
    page,
  }) => {
    const hookErrors: string[] = [];
    page.on("pageerror", (err) => {
      if (REACT_310.test(err.message)) hookErrors.push(err.message);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error" && REACT_310.test(msg.text())) {
        hookErrors.push(msg.text());
      }
    });

    await openTableFixture(page, { players: 4, bots: 1, phase: "reveal", tick: false });

    const root = page.getByTestId("table-root");
    await expect(root).toBeVisible();
    await expect(page.getByTestId("table-felt")).toBeVisible();
    await expect(page.getByTestId("pot-display")).toBeVisible();

    await expect
      .poll(async () => root.getAttribute("data-presentation-phase"), { timeout: 20_000 })
      .not.toBe("ante");

    await expect(page.getByTestId("table-felt")).toBeVisible();

    await expect
      .poll(async () => root.getAttribute("data-presentation-phase"), { timeout: 25_000 })
      .toMatch(/^(deal|trumpReveal|drawPlayer|drawReady|play|idle)$/);

    await expect(page.locator(".bseat")).toHaveCount(4);
    await expect(page.getByTestId("trump-button")).toBeVisible({ timeout: 15_000 });

    expect(hookErrors, `React hook-order crash: ${hookErrors.join("; ")}`).toHaveLength(0);
  });
});
