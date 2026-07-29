import { test, expect } from "@playwright/test";
import { emulatorReady, goToPrivateRooms, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Delete room success feedback", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("successful delete removes room without leave-instead error", async ({ page }) => {
    const roomName = "Delete Success Room";

    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, "Delete Success Host");
    await goToPrivateRooms(page);

    await page.locator("#create-room").click();
    await page.locator("#create-room-name").fill(roomName);
    await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
    await page.locator("#create-room-ante").selectOption({ index: 1 });
    await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(page.locator(".room-detail__title")).toContainText(roomName, { timeout: 15_000 });

    await page.locator("#back-to-rooms").click();
    await expect(page.locator("#rooms-list-view")).toBeVisible();
    const roomCard = page.locator(".mini-card__title", { hasText: roomName });
    await expect(roomCard).toBeVisible({ timeout: 15_000 });

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator(`[data-delete-room]`).first().click();

    await expect(roomCard).toBeHidden({ timeout: 15_000 });
    await page.waitForTimeout(500);

    const errorText = (await page.locator("#rooms-error").textContent())?.trim() ?? "";
    expect(errorText.toLowerCase()).not.toContain("leave instead");
    await expect(page.locator("#rooms-error")).toBeHidden();
  });
});
