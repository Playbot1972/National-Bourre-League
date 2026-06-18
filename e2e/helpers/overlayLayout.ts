import { expect, type Page } from "@playwright/test";

export interface OverlayStageMetrics {
  overlayW: number;
  overlayH: number;
  stageW: number;
  stageH: number;
  widthRatio: number;
  heightRatio: number;
}

/** Read overlay vs felt stage size — catches compacted-table regressions. */
export async function readOverlayStageMetrics(page: Page): Promise<OverlayStageMetrics | null> {
  return page.evaluate(() => {
    const overlay = document.querySelector("#table-play-overlay");
    const stage = document.querySelector("#table-play-overlay .table-stage");
    if (!overlay || !stage) return null;
    const o = overlay.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (o.width <= 0 || o.height <= 0) return null;
    return {
      overlayW: o.width,
      overlayH: o.height,
      stageW: s.width,
      stageH: s.height,
      widthRatio: s.width / o.width,
      heightRatio: s.height / o.height,
    };
  });
}

/**
 * Assert the gameplay stage uses a meaningful share of the full-screen overlay.
 * Thresholds are conservative to allow chrome + hero hand on laptop viewports.
 */
export async function expectOverlayStageFillsViewport(
  page: Page,
  opts: { minWidthRatio?: number; minHeightRatio?: number } = {},
) {
  const minWidthRatio = opts.minWidthRatio ?? 0.38;
  const minHeightRatio = opts.minHeightRatio ?? 0.3;

  const metrics = await readOverlayStageMetrics(page);
  expect(metrics, "overlay and table stage should be measurable").not.toBeNull();
  expect(metrics!.widthRatio, `stage width ratio ${metrics!.widthRatio}`).toBeGreaterThan(
    minWidthRatio,
  );
  expect(metrics!.heightRatio, `stage height ratio ${metrics!.heightRatio}`).toBeGreaterThan(
    minHeightRatio,
  );
}

/** Change table scale in settings and assert the rendered stage grows. */
export async function expectTableScaleAffectsStage(page: Page) {
  const overlay = page.locator("#table-play-overlay");
  const readScale = () =>
    page.evaluate(() => {
      const stage = document.querySelector("#table-play-overlay .table-stage");
      const scaleEl = document.querySelector("#table-play-overlay .btable-desktop__scale");
      if (!stage || !scaleEl) return null;
      const s = stage.getBoundingClientRect();
      const effective = parseFloat(
        getComputedStyle(scaleEl).getPropertyValue("--stage-effective-scale").trim() || "1",
      );
      return { stageW: s.width, effectiveScale: effective };
    });

  const baseline = await readScale();
  expect(baseline).not.toBeNull();

  await overlay.getByTestId("settings-button").click();
  const panel = overlay.getByTestId("settings-panel");
  await expect(panel).toBeVisible();

  const slider = panel.locator(".bsettings__field--row input[type='range']");
  await expect(slider).toBeVisible();
  await slider.fill("1.25");
  await page.waitForTimeout(350);

  const enlarged = await readScale();
  expect(enlarged).not.toBeNull();
  expect(enlarged!.effectiveScale).toBeGreaterThan(baseline!.effectiveScale);
  expect(enlarged!.stageW).toBeGreaterThanOrEqual(baseline!.stageW * 0.98);

  await panel.getByRole("button", { name: "Close" }).first().click();
}
