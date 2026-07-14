import { test, expect } from "./fixtures/consoleGuard";
import { openTableFixture } from "./helpers/tableSmoke";

const REACT_310 = /Rendered more hooks than during the previous render|Minified React error #310/;

test.describe("Reveal catch-up presentation", () => {
  test("server reveal+trump sync does not enter ante or block bots", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(msg.text());
    });

    await openTableFixture(page, { players: 4, bots: 1, phase: "reveal", tick: false });

    const root = page.getByTestId("table-root");
    await expect(root).toBeVisible();
    await expect(page.getByTestId("table-felt")).toBeVisible();

    await expect
      .poll(async () => root.getAttribute("data-presentation-phase"), { timeout: 5_000 })
      .not.toBe("ante");

    await expect
      .poll(async () => root.getAttribute("data-presentation-phase"), { timeout: 5_000 })
      .toMatch(/^(idle|drawPlayer|drawReady|play|decision|enrollment)$/);

    await expect(page.getByTestId("trump-button")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".bseat")).toHaveCount(4);

    expect(pageErrors.filter((e) => REACT_310.test(e)), `React errors: ${pageErrors.join("; ")}`).toHaveLength(
      0,
    );
  });
});
