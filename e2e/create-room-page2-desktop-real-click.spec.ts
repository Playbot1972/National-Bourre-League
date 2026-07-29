import { test, expect } from "@playwright/test";
import { emulatorReady, goToPrivateRooms, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Create room page-2 desktop real click", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, `Desktop Real ${Date.now()}`);
    await goToPrivateRooms(page);
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  async function openPage2(page: import("@playwright/test").Page) {
    await page.locator("#create-room").click();
    await page.locator("#create-room-name").fill("Desktop Real Click Room");
    await page.locator("#create-room-form").evaluate((f) => f.requestSubmit());
    await expect(page.locator("#create-room-form")).toHaveAttribute("data-step", "settings");
  }

  for (const spec of [
    { id: "1", label: "type 5 no rebuy", rebuy: false, blur: false, stepper: false, ante: false },
    { id: "2", label: "type 5 blur first", rebuy: false, blur: true, stepper: false, ante: false },
    { id: "3", label: "stepper to 5", rebuy: false, blur: false, stepper: true, ante: false },
    { id: "4", label: "type 5 change ante", rebuy: false, blur: false, stepper: false, ante: true },
    { id: "5", label: "type 5 toggle rebuy", rebuy: true, blur: false, stepper: false, ante: false },
  ]) {
    test(`case ${spec.id}: ${spec.label} — real click submits once`, async ({ page }) => {
      await openPage2(page);

      const buyIn = page.locator("#create-room-buy-in");
      if (spec.stepper) {
        await buyIn.focus();
        for (let i = 0; i < 95; i += 1) await buyIn.press("ArrowDown");
      } else {
        await buyIn.click();
        await buyIn.press("ControlOrMeta+a");
        await buyIn.type("5");
        if (spec.blur) await buyIn.blur();
      }
      if (spec.ante) await page.locator("#create-room-ante").selectOption({ index: 2 });
      if (spec.rebuy) {
        await page.locator("#create-room-rebuy-enabled").evaluate((el) => {
          (el as HTMLInputElement).checked = true;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }

      const before = await page.evaluate(() => ({
        buyInValue: (document.getElementById("create-room-buy-in") as HTMLInputElement).value,
        valueAsNumber: (document.getElementById("create-room-buy-in") as HTMLInputElement).valueAsNumber,
        activeElement: document.activeElement?.id,
      }));

      await page.locator("#create-room-submit").click();

      await expect(page.locator("#create-room-modal")).toBeHidden({ timeout: 15_000 });
      await expect(page.locator('button.session-tab[data-open-session]')).toHaveCount(1, {
        timeout: 15_000,
      });
      expect(before.buyInValue).toBe("5");
    });
  }
});
