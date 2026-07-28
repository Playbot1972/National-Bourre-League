import { test, expect } from "@playwright/test";
import { emulatorReady, goToPrivateRooms, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Create room page-2 single submit", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("page-2 Create Room succeeds on first click after selecting ante", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, "Page2 Submit Host");
    await goToPrivateRooms(page);

    const modal = page.locator("#create-room-modal");
    const roomName = "Page2 Single Submit Room";

    await page.locator("#create-room").click();
    await expect(modal).toBeVisible();

    await page.locator("#create-room-name").fill(roomName);
    await page.locator("#create-room-submit").evaluate((el) => (el as HTMLButtonElement).click());
    await expect(page.locator("#create-room-form")).toHaveAttribute("data-step", "settings");

    await page.locator("#create-room-ante").selectOption({ index: 2 });

    await page.locator("#create-room-submit").evaluate((el) => (el as HTMLButtonElement).click());

    await expect(modal).toBeHidden({ timeout: 15_000 });
    await expect(page.locator(".room-detail__title")).toContainText(roomName);
    await expect(page.locator('button.session-tab[data-open-session]')).toHaveCount(1, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("session-setup-window")).toBeVisible();
  });

  test("invalid buy-in shows inline error without opening the room", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, "Page2 Invalid Host");
    await goToPrivateRooms(page);

    const modal = page.locator("#create-room-modal");
    await page.locator("#create-room").click();
    await page.locator("#create-room-name").fill("Invalid Buy-in Room");
    await page.locator("#create-room-submit").evaluate((el) => (el as HTMLButtonElement).click());
    await expect(page.locator("#create-room-form")).toHaveAttribute("data-step", "settings");

    await page.locator("#create-room-buy-in").fill("0");
    await page.locator("#create-room-ante").selectOption({ index: 1 });
    await page.locator("#create-room-submit").evaluate((el) => (el as HTMLButtonElement).click());

    await expect(modal).toBeVisible();
    await expect(page.locator("#create-room-error")).toBeVisible();
    await expect(page.locator("#create-room-error")).toContainText(/buy-in/i);
    await expect(page.locator('button.session-tab[data-open-session]')).toHaveCount(0);
  });
});
