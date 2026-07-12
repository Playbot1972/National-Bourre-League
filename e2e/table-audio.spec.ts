import { test, expect } from "./fixtures/consoleGuard";
import {
  openTableAudioFixture,
  playAndExpectAsset,
  resetTableAudio,
  unlockTableAudio,
} from "./helpers/tableAudio";

const GAMEPLAY_EVENTS: Array<{
  playFn: Parameters<typeof playAndExpectAsset>[1];
  event: string;
  filename: string;
}> = [
  { playFn: "playCardSelect", event: "cardSelect", filename: "card-select.wav" },
  { playFn: "playDraw", event: "draw", filename: "draw.wav" },
  { playFn: "playFold", event: "fold", filename: "card-place-heavy.wav" },
  { playFn: "playGameStart", event: "gameStart", filename: "card-shuffle-normal.wav" },
  { playFn: "playOpenRoom", event: "openRoom", filename: "card-shuffle-final.wav" },
  { playFn: "playPotWin", event: "potWin", filename: "hand-win-stinger.wav" },
  { playFn: "playBourre", event: "bourre", filename: "Fahhh.wav" },
  { playFn: "playIllegal", event: "cardIllegal", filename: "card-illegal.wav" },
  { playFn: "playShuffle", event: "shuffle", filename: "card-shuffle-normal.wav" },
  { playFn: "playCardPlace", event: "cardPlace", filename: "card-place-normal.wav" },
  { playFn: "playLeadChange", event: "leadChange", filename: "lead-sweetener-light.wav" },
  { playFn: "playTrickWin", event: "trickWin", filename: "trick-win-big.wav" },
  { playFn: "playTrickCollect", event: "trickCollect", filename: "coin-chime-light.wav" },
];

test.describe("Table audio — asset mapping (browser E2E)", () => {
  test.beforeEach(async ({ page }) => {
    await openTableAudioFixture(page);
    await unlockTableAudio(page);
    await resetTableAudio(page);
  });

  for (const { playFn, event, filename } of GAMEPLAY_EVENTS) {
    test(`${event} plays ${filename} (asset-played)`, async ({ page }) => {
      await playAndExpectAsset(page, playFn, event, filename);
    });
  }

  test("uiButton plays ui-button-press.wav only for UI button action", async ({ page }) => {
    await playAndExpectAsset(page, "playUiButton", "uiButton", "ui-button-press.wav");
  });

  test("gameplay actions never use procedural fallback", async ({ page }) => {
    for (const { playFn, event } of GAMEPLAY_EVENTS) {
      await page.click("body");
      await unlockTableAudio(page);
      await resetTableAudio(page);
      await page.evaluate((fn) => {
        const api = (window as unknown as { __nblTableAudioTest: Record<string, () => void> })
          .__nblTableAudioTest;
        api[fn]();
      }, playFn);
      await page.waitForTimeout(600);
      const audit = await page.evaluate(
        () =>
          (window as unknown as {
            __nblTableAudioTest: { getAudit: () => { event: string; result: string }[] };
          }).__nblTableAudioTest.getAudit(),
      );
      const rows = audit.filter((row) => row.event === event);
      const procedural = rows.filter((row) => row.result.includes("procedural"));
      expect(procedural, `${playFn} must not procedural-fallback`).toHaveLength(0);
      expect(rows.some((row) => row.result === "asset-played"), `${playFn} asset-played`).toBe(true);
    }
  });

  test("gameplay actions never request ui-button-press.wav", async ({ page }) => {
    for (const { playFn, event } of GAMEPLAY_EVENTS) {
      await page.click("body");
      await unlockTableAudio(page);
      await resetTableAudio(page);
      await page.evaluate((fn) => {
        const api = (window as unknown as { __nblTableAudioTest: Record<string, () => void> })
          .__nblTableAudioTest;
        api[fn]();
      }, playFn);
      await page.waitForTimeout(600);
      const audit = await page.evaluate(
        () =>
          (window as unknown as {
            __nblTableAudioTest: {
              getAudit: () => { event: string; filename?: string; result: string }[];
            };
          }).__nblTableAudioTest.getAudit(),
      );
      const rows = audit.filter((row) => row.event === event);
      const buttonMisuse = rows.filter(
        (row) => row.filename === "ui-button-press.wav" && row.result === "asset-played",
      );
      expect(buttonMisuse, `${event} must not play ui-button-press.wav`).toHaveLength(0);
    }
  });

  test("gameplay audit rows never set usedFallback", async ({ page }) => {
    for (const { playFn, event } of GAMEPLAY_EVENTS) {
      await page.click("body");
      await unlockTableAudio(page);
      await resetTableAudio(page);
      await page.evaluate((fn) => {
        const api = (window as unknown as { __nblTableAudioTest: Record<string, () => void> })
          .__nblTableAudioTest;
        api[fn]();
      }, playFn);
      await page.waitForTimeout(600);
      const audit = await page.evaluate(
        () =>
          (window as unknown as {
            __nblTableAudioTest: {
              getAudit: () => { event: string; usedFallback?: boolean; result: string }[];
            };
          }).__nblTableAudioTest.getAudit(),
      );
      const rows = audit.filter((row) => row.event === event);
      const fallbackRows = rows.filter((row) => row.usedFallback === true);
      expect(fallbackRows, `${playFn} usedFallback must be false`).toHaveLength(0);
    }
  });

  test("audio-locked play does not use procedural fallback", async ({ page }) => {
    await openTableAudioFixture(page);
    await resetTableAudio(page);
    await page.evaluate(() => {
      const api = (window as unknown as { __nblTableAudioTest: { playCardSelectLocked: () => void } })
        .__nblTableAudioTest;
      api.playCardSelectLocked();
    });
    await page.waitForTimeout(500);
    const audit = await page.evaluate(
      () =>
        (window as unknown as {
          __nblTableAudioTest: { getAudit: () => { result: string; usedFallback?: boolean }[] };
        }).__nblTableAudioTest.getAudit(),
    );
    expect(audit.some((row) => row.result === "skipped-muted")).toBe(true);
    expect(audit.some((row) => row.result.includes("procedural"))).toBe(false);
    expect(audit.some((row) => row.usedFallback === true)).toBe(false);
  });

  test("draw.wav is not byte-identical to ui-button-press.wav", async ({ page }) => {
    const hashes = await page.evaluate(async () => {
      const load = async (file: string) => {
        const res = await fetch(`/sounds/${file}`);
        const buf = await res.arrayBuffer();
        const digest = await crypto.subtle.digest("SHA-256", buf);
        return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
      };
      return {
        draw: await load("draw.wav"),
        button: await load("ui-button-press.wav"),
      };
    });
    expect(hashes.draw).not.toBe(hashes.button);
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

  test("falls back to procedural when asset cannot decode (simulated)", async ({ page }) => {
    await page.route("**/sounds/draw.wav", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!DOCTYPE html><html><body>spa</body></html>",
      });
    });
    await page.click("body");
    await unlockTableAudio(page);
    await resetTableAudio(page);
    await page.evaluate(async () => {
      const api = (window as unknown as {
        __nblTableAudioTest: {
          playDraw: () => void;
          getAudit: () => { result: string; event: string }[];
        };
      }).__nblTableAudioTest;
      api.playDraw();
      await new Promise((r) => setTimeout(r, 1200));
      return api.getAudit();
    });
    const audit = await page.evaluate(
      () =>
        (window as unknown as { __nblTableAudioTest: { getAudit: () => { result: string; event: string }[] } })
          .__nblTableAudioTest.getAudit(),
    );
    const drawRows = audit.filter((row) => row.event === "draw");
    const last = drawRows[drawRows.length - 1];
    expect(last?.result).not.toBe("asset-played");
    expect(last?.result).toMatch(/procedural/);
  });
});
