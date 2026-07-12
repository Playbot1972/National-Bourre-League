import { test, expect } from "./fixtures/consoleGuard";
import {
  openTableAudioFixture,
  playAndExpectAsset,
  resetTableAudio,
  unlockTableAudio,
} from "./helpers/tableAudio";

test.describe("Table audio — asset mapping (browser E2E)", () => {
  test.beforeEach(async ({ page }) => {
    await openTableAudioFixture(page);
    await unlockTableAudio(page);
    await resetTableAudio(page);
  });

  test("cardSelect plays card-select.wav", async ({ page }) => {
    await playAndExpectAsset(page, "playCardSelect", "cardSelect", "card-select.wav");
  });

  test("draw plays draw.wav", async ({ page }) => {
    await playAndExpectAsset(page, "playDraw", "draw", "draw.wav");
  });

  test("fold plays card-place-heavy.wav", async ({ page }) => {
    await playAndExpectAsset(page, "playFold", "fold", "card-place-heavy.wav");
  });

  test("gameStart plays card-shuffle-normal.wav", async ({ page }) => {
    await playAndExpectAsset(page, "playGameStart", "gameStart", "card-shuffle-normal.wav");
  });

  test("openRoom plays card-shuffle-final.wav", async ({ page }) => {
    await playAndExpectAsset(page, "playOpenRoom", "openRoom", "card-shuffle-final.wav");
  });

  test("potWin plays hand-win-stinger.wav", async ({ page }) => {
    await playAndExpectAsset(page, "playPotWin", "potWin", "hand-win-stinger.wav");
  });

  test("bourre plays Fahhh.wav exactly", async ({ page }) => {
    await playAndExpectAsset(page, "playBourre", "bourre", "Fahhh.wav");
  });

  test("HTMLAudioElement.play monitor records resolved filename", async ({ page }) => {
    await page.evaluate(() => {
      (window as unknown as { __nblTableAudioTest: { playBourre: () => void } }).__nblTableAudioTest.playBourre();
    });
    await page.waitForFunction(() => {
      const monitor = (window as unknown as { getAudioPlayMonitor?: () => { filename?: string }[] })
        .getAudioPlayMonitor?.();
      return monitor?.some((row) => row.filename === "Fahhh.wav");
    });
    const monitor = await page.evaluate(
      () =>
        (window as unknown as { getAudioPlayMonitor?: () => { filename?: string; src: string }[] })
          .getAudioPlayMonitor?.() ?? [],
    );
    expect(monitor.some((row) => row.filename === "Fahhh.wav")).toBe(true);
    expect(monitor.some((row) => row.src.includes("Fahhh.wav"))).toBe(true);
  });

  test("fails audit when asset probe would reject HTML (simulated)", async ({ page }) => {
    await page.route("**/sounds/draw.wav", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!DOCTYPE html><html><body>spa</body></html>",
      });
    });
    await page.evaluate(async () => {
      const api = (window as unknown as {
        __nblTableAudioTest: {
          reset: () => void;
          playDraw: () => void;
          getAudit: () => { result: string; fallbackReason?: string }[];
        };
      }).__nblTableAudioTest;
      api.reset();
      api.playDraw();
      await new Promise((r) => setTimeout(r, 800));
      return api.getAudit();
    });
    const audit = await page.evaluate(
      () =>
        (window as unknown as { __nblTableAudioTest: { getAudit: () => { result: string }[] } })
          .__nblTableAudioTest.getAudit(),
    );
    const last = audit[audit.length - 1];
    expect(last?.result).not.toBe("asset-played");
  });
});
