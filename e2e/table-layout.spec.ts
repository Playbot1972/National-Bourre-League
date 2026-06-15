import { test, expect } from "@playwright/test";

async function horizontalOverflow(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
}

test.describe("G — layout / release quality", () => {
  test("social home has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);
  });

  test("table landscape fixture fits viewport width", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-landscape.html");
    await expect(page.locator("[data-testid=table-fixture]")).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);
  });
});
