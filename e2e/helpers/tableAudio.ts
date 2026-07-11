import { expect, type Page } from "@playwright/test";

export interface AudioAuditRow {
  event: string;
  filename?: string;
  result: string;
  triggerType?: string;
  fallbackReason?: string;
}

export async function openTableAudioFixture(page: Page) {
  await page.goto("/e2e-fixtures/table-audio");
  await expect(page.getByTestId("audio-fixture-root")).toBeAttached({ timeout: 15_000 });
  await page.waitForFunction(() => Boolean((window as unknown as { __nblTableAudioTest?: unknown }).__nblTableAudioTest));
}

export async function unlockTableAudio(page: Page) {
  await page.click("body");
  await page.evaluate(async () => {
    const api = (window as unknown as { __nblTableAudioTest: { unlock: () => Promise<void> } })
      .__nblTableAudioTest;
    await api.unlock();
  });
}

export async function resetTableAudio(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __nblTableAudioTest: { reset: () => void } }).__nblTableAudioTest.reset();
  });
}

export async function playAndExpectAsset(
  page: Page,
  playFn: "playCardSelect" | "playDraw" | "playFold" | "playGameStart" | "playOpenRoom" | "playPotWin" | "playBourre",
  event: string,
  expectedFilename: string,
) {
  const row = await page.evaluate(
    async ({ fn, ev, file }) => {
      const api = (window as unknown as {
        __nblTableAudioTest: {
          playCardSelect: () => void;
          playDraw: () => void;
          playFold: () => void;
          playGameStart: () => void;
          playOpenRoom: () => void;
          playPotWin: () => void;
          playBourre: () => void;
          waitForAudit: (
            event: string,
            filename: string,
            timeoutMs?: number,
          ) => Promise<{ event: string; filename?: string; result: string } | null>;
        };
      }).__nblTableAudioTest;
      api[fn]();
      return api.waitForAudit(ev, file, 4000);
    },
    { fn: playFn, ev: event, file: expectedFilename },
  );

  expect(row, `expected ${event} → ${expectedFilename} (asset-played)`).not.toBeNull();
  expect(row?.result).toBe("asset-played");
  expect(row?.filename).toBe(expectedFilename);
  expect(row?.event).toBe(event);
}
