import { test, expect } from "@playwright/test";
import {
  createRoom,
  emulatorReady,
  joinRoomWithCode,
  readRoomInviteCode,
  signUpGuest,
  signUpHost,
} from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Join room by invite code", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("second player joins with pasted code in a separate browser", async ({ browser }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    try {
      await hostPage.goto("/");
      await expect(hostPage.locator("#app-version")).toBeVisible({ timeout: 15_000 });
      await signUpHost(hostPage, "Code Host");
      await createRoom(hostPage, "Invite Code Room");
      const inviteCode = await readRoomInviteCode(hostPage);

      await guestPage.goto("/");
      await expect(guestPage.locator("#app-version")).toBeVisible({ timeout: 15_000 });
      await signUpGuest(guestPage, "Code Guest");
      await joinRoomWithCode(guestPage, inviteCode);

      await expect(guestPage.locator(".room-detail__title")).toContainText("Invite Code Room", {
        timeout: 20_000,
      });
      await expect(guestPage.locator("#rooms-error")).toContainText(/joined/i, { timeout: 5_000 });
      await expect(guestPage.locator(".members__name").filter({ hasText: "Code Guest" })).toBeVisible({
        timeout: 15_000,
      });

      await guestPage.locator("#back-to-rooms").click();
      await expect(guestPage.locator(".mini-card__title").filter({ hasText: "Invite Code Room" })).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });

  test("shows a clear error for an invalid code format", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto("/");
      await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
      await signUpHost(page, "Invalid Code Host");
      await page.getByRole("link", { name: "Private Rooms", exact: true }).click();
      await page.getByTestId("join-code-input").fill("BAD");
      await page.getByTestId("join-code-submit").click();
      await expect(page.locator("#rooms-error")).toContainText(/invalid invite code/i, {
        timeout: 5_000,
      });
    } finally {
      await context.close();
    }
  });
});
