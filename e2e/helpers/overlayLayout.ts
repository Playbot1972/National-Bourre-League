import { expect, type Page } from "@playwright/test";

export interface OverlayStageMetrics {
  overlayW: number;
  overlayH: number;
  stageW: number;
  stageH: number;
  widthRatio: number;
  heightRatio: number;
}

export interface OverlayFixtureOptions {
  players?: number;
  bots?: number;
  phase?: "enrollment" | "draw" | "play";
}

export function overlayFixtureUrl(options: OverlayFixtureOptions = {}): string {
  const qs = new URLSearchParams({
    players: String(options.players ?? 4),
    bots: String(options.bots ?? 1),
    phase: options.phase ?? "draw",
  });
  return `/e2e-fixtures/table-overlay.html?${qs}`;
}

/** Open the full-screen gameplay overlay fixture (mobile + desktop layout checks). */
export async function openOverlayFixture(page: Page, options: OverlayFixtureOptions = {}) {
  await page.goto(overlayFixtureUrl(options));
  const overlay = page.locator("#table-play-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });
  await expect(overlay.getByTestId("table-felt")).toBeVisible();
  await page.waitForFunction(() => {
    const stage = document.querySelector("#table-play-overlay .table-stage") as HTMLElement | null;
    const wrap = document.querySelector("#table-play-overlay .btable-wrap") as HTMLElement | null;
    if (!stage || !wrap) return false;
    const w = stage.getBoundingClientRect().width;
    const fitW = parseFloat(getComputedStyle(wrap).getPropertyValue("--stage-fit-width"));
    return w > 180 && fitW > 180;
  });
}

export async function overlayHorizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const overlay = document.querySelector("#table-play-overlay");
    if (!overlay) return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const el = overlay as HTMLElement;
    return el.scrollWidth - el.clientWidth;
  });
}

/** True when element center is inside the visual viewport. */
export async function isOverlayControlInViewport(page: Page, testId: string): Promise<boolean> {
  const overlay = page.locator("#table-play-overlay");
  const locator = overlay.getByTestId(testId).first();
  await locator.scrollIntoViewIfNeeded();
  return locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const vx = window.visualViewport?.offsetLeft ?? 0;
    const vy = window.visualViewport?.offsetTop ?? 0;
    return (
      cx >= vx &&
      cy >= vy &&
      cx <= vx + vw &&
      cy <= vy + vh &&
      rect.width > 0 &&
      rect.height > 0
    );
  });
}

/** Combined gameplay block (stage + hero) width vs overlay — better for landscape row layout. */
export async function readOverlayGameplayMetrics(page: Page) {
  return page.evaluate(() => {
    const overlay = document.querySelector("#table-play-overlay");
    const wrap = document.querySelector("#table-play-overlay .btable-wrap");
    const stage = document.querySelector("#table-play-overlay .table-stage");
    if (!overlay || !wrap || !stage) return null;
    const o = overlay.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (o.width <= 0 || o.height <= 0) return null;
    return {
      overlayW: o.width,
      overlayH: o.height,
      gameplayW: w.width,
      stageW: s.width,
      stageH: s.height,
      gameplayWidthRatio: w.width / o.width,
      stageWidthRatio: s.width / o.width,
      stageHeightRatio: s.height / o.height,
      landscapeRow: wrap.classList.contains("btable-wrap--landscape-row"),
    };
  });
}

export async function expectMobileOverlayGameplayFits(
  page: Page,
  opts: { portrait: boolean },
) {
  const metrics = await readOverlayGameplayMetrics(page);
  expect(metrics, "overlay gameplay block should be measurable").not.toBeNull();
  expect(await overlayHorizontalOverflow(page)).toBeLessThanOrEqual(2);

  if (opts.portrait) {
    expect(metrics!.stageWidthRatio).toBeGreaterThan(0.42);
    expect(metrics!.stageHeightRatio).toBeGreaterThan(0.16);
  } else {
    expect(metrics!.landscapeRow).toBe(true);
    expect(metrics!.gameplayWidthRatio).toBeGreaterThan(0.82);
    expect(metrics!.stageW).toBeGreaterThan(180);
    expect(metrics!.stageHeightRatio).toBeGreaterThan(0.18);
  }
}
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
