import { test, expect, devices } from "@playwright/test";

async function horizontalOverflow(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
}

const MOBILE_HOME_LAYOUTS = [
  { name: "iPhone portrait", device: devices["iPhone 13"] },
  { name: "iPhone landscape", device: devices["iPhone 13 landscape"] },
  { name: "Android portrait", device: devices["Pixel 5"] },
  { name: "Android landscape", device: devices["Pixel 5 landscape"] },
] as const;

test.describe("G — layout / release quality", () => {
  test("social home has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);
  });

  for (const layout of MOBILE_HOME_LAYOUTS) {
    test(`social home — ${layout.name} has no horizontal overflow`, async ({ browser }) => {
      const context = await browser.newContext({ ...layout.device });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);
      await context.close();
    });
  }

  test("table landscape fixture fits viewport width", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-landscape.html");
    await expect(page.locator("[data-testid=table-fixture]")).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);
  });
});
