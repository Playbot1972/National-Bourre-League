/**
 * Two-client public-table Play Now — emulator integration.
 *
 * Requires auth + firestore + functions emulators:
 *   npm run emulators
 *   PLAYWRIGHT_EMULATORS=1 npm run test:e2e:public-table
 */
import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { signUpHost, signUpGuest, goToPrivateRooms } from "./helpers/roomFlow";
import {
  clearEmulatorAuthAndFirestore,
  emulatorSuiteReady,
  readMatchQueueForPage,
  readPageAuthUid,
  scoreRowExistsForPage,
} from "./helpers/publicTableEmulator";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function patchSessionHand(roomId: string, sessionId: string, currentHand: Record<string, unknown>) {
  execFileSync(
    "node",
    ["e2ePublicTableHelpers.mjs", "patch", roomId, sessionId, JSON.stringify(currentHand)],
    {
      cwd: resolve(repoRoot, "functions"),
      env: {
        ...process.env,
        FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
        MIXED_PUBLIC_TABLES_SERVER_ENABLED: "true",
      },
      stdio: "pipe",
    },
  );
}

function applyPendingReplacementsHandoff(roomId: string, sessionId: string) {
  execFileSync(
    "node",
    ["e2ePublicTableHelpers.mjs", "apply-replacements", roomId, sessionId],
    {
      cwd: resolve(repoRoot, "functions"),
      env: {
        ...process.env,
        FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
        MIXED_PUBLIC_TABLES_SERVER_ENABLED: "true",
      },
      stdio: "pipe",
    },
  );
}

function tableOverlay(page: Page) {
  return page.locator("#table-play-overlay");
}

async function clickPlayNow(page: Page) {
  await goToPrivateRooms(page);
  await page.locator('[data-testid="play-now-mode"] input[value="mixed"]').check();
  const playNow = page.locator('[data-testid="play-now"]');
  await expect(playNow).toBeEnabled({ timeout: 15_000 });
  await playNow.click();
}

async function signUpAndGoHome(page: Page, label: string, signUp: (page: Page, label: string) => Promise<void>) {
  await page.goto("/");
  await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
  await signUp(page, label);
}

async function waitForTableMounted(page: Page) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 90_000 });
  return overlay;
}

async function assertTableStaysMounted(page: Page, ms = 4_000) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("table-root")).toBeVisible();
  await page.waitForTimeout(ms);
  await expect(overlay.getByTestId("table-root")).toBeVisible();
}

test.describe("Public table — two-client emulator", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(360_000);

  test.beforeEach(async ({ request }) => {
    await clearEmulatorAuthAndFirestore(request);
  });

  test.beforeAll(async () => {
    test.skip(!(await emulatorSuiteReady()), "Firebase emulators not reachable (auth/firestore/functions + :4000 UI)");
  });

  test("[emulator] host Play Now + guest joins same session with stable table", async ({
    browser,
    request,
  }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    try {
      await signUpAndGoHome(hostPage, "PT Host", signUpHost);
      await clickPlayNow(hostPage);
      await waitForTableMounted(hostPage);
      await assertTableStaysMounted(hostPage);

      await signUpAndGoHome(guestPage, "PT Guest", signUpGuest);
      await clickPlayNow(guestPage);
      await waitForTableMounted(guestPage);

      const hostUid = await readPageAuthUid(hostPage);
      const guestUid = await readPageAuthUid(guestPage);
      expect(hostUid).toBeTruthy();
      expect(guestUid).toBeTruthy();

      const hostQueue = await readMatchQueueForPage(hostPage);
      const guestQueue = await readMatchQueueForPage(guestPage);
      expect(hostQueue?.roomId).toBeTruthy();
      expect(guestQueue?.roomId).toBe(hostQueue?.roomId);
      expect(guestQueue?.sessionId).toBe(hostQueue?.sessionId);
      expect(guestQueue?.sessionKey).toBe(hostQueue?.sessionKey);
      expect(["seated", "spectating"]).toContain(guestQueue?.status);

      await assertTableStaysMounted(hostPage);
      await assertTableStaysMounted(guestPage);
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });

  test("[emulator] mid-hand join is watch-only; promotion after hand boundary", async ({
    browser,
    request,
  }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    try {
      await signUpAndGoHome(hostPage, "Mid Host", signUpHost);
      await clickPlayNow(hostPage);
      await waitForTableMounted(hostPage);

      const hostUid = await readPageAuthUid(hostPage);
      expect(hostUid).toBeTruthy();
      const hostQueue = await readMatchQueueForPage(hostPage);
      const roomId = hostQueue?.roomId;
      const sessionId = hostQueue?.sessionId;
      expect(roomId).toBeTruthy();
      expect(sessionId).toBeTruthy();

      patchSessionHand(roomId!, sessionId!, {
        phase: "play",
        tricksByPlayer: { [hostUid!]: 1 },
        participantIds: [hostUid!, "bot_placeholder"],
        turnPlayerId: hostUid!,
      });

      await signUpAndGoHome(guestPage, "Mid Guest", signUpGuest);
      await clickPlayNow(guestPage);
      await waitForTableMounted(guestPage);

      const guestUid = await readPageAuthUid(guestPage);
      expect(guestUid).toBeTruthy();

      const guestQueue = await readMatchQueueForPage(guestPage);
      expect(guestQueue?.roomId).toBe(roomId);
      expect(guestQueue?.sessionId).toBe(sessionId);
      expect(guestQueue?.status).toBe("spectating");

      await expect(guestPage.getByTestId("watch-only-banner")).toBeVisible({ timeout: 30_000 });
      expect(await scoreRowExistsForPage(guestPage, roomId!, sessionId!, guestUid!)).toBe(false);

      patchSessionHand(roomId!, sessionId!, {
        tricksByPlayer: {},
        participantIds: [],
      });

      applyPendingReplacementsHandoff(roomId!, sessionId!);

      await expect
        .poll(async () => scoreRowExistsForPage(guestPage, roomId!, sessionId!, guestUid!), {
          timeout: 30_000,
        })
        .toBe(true);

      await expect(guestPage.getByTestId("watch-only-banner")).toHaveCount(0, { timeout: 30_000 });
      await assertTableStaysMounted(hostPage);
      await assertTableStaysMounted(guestPage);
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });
});
