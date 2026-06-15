import { test, expect } from "@playwright/test";

test.describe("F — co-winner settlement clarity", () => {
  test("co-winner sees tie headline, bourré, pot carry rules, and enabled vote buttons", async ({
    page,
  }) => {
    await page.goto("/e2e-fixtures/settlement-cowin?role=cowinner");
    const panel = page.getByTestId("settlement-panel");
    await expect(panel).toBeVisible();

    await expect(page.locator("[data-testid=settlement-headline]")).toHaveText(
      /Tie — Alice & Bob \(2 tricks each\)/,
    );
    await expect(page.locator("[data-testid=settlement-subhead]")).toContainText(
      "Co-winners must vote",
    );
    await expect(page.locator("[data-testid=settlement-winners]")).toContainText("Alice — 2 tricks");
    await expect(page.locator("[data-testid=settlement-winners]")).toContainText("Bob — 2 tricks");
    await expect(page.locator("[data-testid=settlement-bourre]")).toContainText(
      "Bourré: Dave took 0 tricks",
    );
    await expect(page.locator("[data-testid=settlement-pot]")).toContainText("$12");
    await expect(page.locator("[data-testid=settlement-pot]")).toContainText("carried in");
    await expect(page.locator("[data-testid=settlement-split-preview]")).toContainText("$4 each");
    await expect(page.locator("[data-testid=settlement-carry-push]")).toContainText(
      "carries to the next hand",
    );
    await expect(page.locator("[data-testid=settlement-carry-split]")).toContainText(
      "no carryover",
    );
    await expect(page.locator("[data-testid=settlement-voter-hint]")).toContainText(
      "cast your vote",
    );

    await expect(page.locator("[data-testid=settlement-decline-btn]")).toBeEnabled();
    await expect(page.locator("[data-testid=settlement-agree-btn]")).toBeEnabled();
    await expect(page.locator("[data-testid=settlement-agree-btn]")).toContainText("$4 each");
  });

  test("observer sees disabled buttons and waiting hint", async ({ page }) => {
    await page.goto("/e2e-fixtures/settlement-cowin?role=observer");
    await expect(page.getByTestId("settlement-panel")).toBeVisible();
    await expect(page.locator("[data-testid=settlement-observer-hint]")).toContainText(
      "not a co-winner",
    );
    await expect(page.locator("[data-testid=settlement-decline-btn]")).toBeDisabled();
    await expect(page.locator("[data-testid=settlement-agree-btn]")).toBeDisabled();
  });

  test("partial votes show agreed and waiting lines", async ({ page }) => {
    await page.goto("/e2e-fixtures/settlement-cowin?role=partial");
    const votes = page.locator("[data-testid=settlement-votes]");
    await expect(votes).toContainText("Alice: Agreed to split");
    await expect(votes).toContainText("Bob: Waiting to vote");
  });
});
