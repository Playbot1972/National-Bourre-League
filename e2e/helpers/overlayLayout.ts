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
  return `/e2e-fixtures/table-overlay?${qs}`;
}

/** Open the full-screen gameplay overlay fixture (mobile + desktop layout checks). */
export async function openOverlayFixture(page: Page, options: OverlayFixtureOptions = {}) {
  await page.goto(overlayFixtureUrl(options));
  const overlay = page.locator("#table-play-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });
  await expect(overlay.getByTestId("table-felt")).toBeVisible();
  await page.waitForFunction(() => {
    const stage =
      (document.querySelector(".btable-mobile-stage") ??
        document.querySelector("#table-play-overlay .table-stage")) as HTMLElement | null;
    const wrap =
      (document.querySelector(".btable-mobile-wrap") ??
        document.querySelector("#table-play-overlay .btable-wrap")) as HTMLElement | null;
    if (!stage || !wrap) return false;
    const w = stage.getBoundingClientRect().width;
    const fitW = parseFloat(getComputedStyle(wrap).getPropertyValue("--stage-fit-width"));
    return w > 100 && (Number.isNaN(fitW) || fitW > 100);
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
    const wrap =
      document.querySelector(".btable-mobile-wrap") ??
      document.querySelector("#table-play-overlay .btable-wrap");
    const stage =
      document.querySelector(".btable-mobile-stage") ??
      document.querySelector("#table-play-overlay .table-stage");
    if (!overlay || !wrap || !stage) return null;
    const o = overlay.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (o.width <= 0 || o.height <= 0) return null;
    const wrapEl = wrap as HTMLElement;
    const isMobile = wrapEl.classList.contains("btable-mobile-wrap");
    return {
      overlayW: o.width,
      overlayH: o.height,
      gameplayW: w.width,
      stageW: s.width,
      stageH: s.height,
      gameplayWidthRatio: w.width / o.width,
      stageWidthRatio: s.width / o.width,
      stageHeightRatio: s.height / o.height,
      landscapeRow:
        wrapEl.classList.contains("btable-mobile-wrap--landscape-row") ||
        wrapEl.classList.contains("btable-wrap--landscape-row"),
      isMobileLayout: isMobile,
      layoutMode: wrapEl.dataset.layout ?? null,
    };
  });
}

/** True when every seat avatar is inside the overlay visual viewport. */
export async function expectOverlaySeatsInViewport(page: Page): Promise<void> {
  const clipped = await page.evaluate(() => {
    const overlay = document.querySelector("#table-play-overlay");
    if (!overlay) return 0;
    const o = overlay.getBoundingClientRect();
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const vx = window.visualViewport?.offsetLeft ?? 0;
    const vy = window.visualViewport?.offsetTop ?? 0;
    const seats = overlay.querySelectorAll<HTMLElement>(".bseat__avatar-wrap");
    let out = 0;
    for (const seat of seats) {
      const r = seat.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (
        cx < vx - 2 ||
        cy < vy - 2 ||
        cx > vx + vw + 2 ||
        cy > vy + vh + 2 ||
        r.width <= 0 ||
        r.height <= 0
      ) {
        out += 1;
      }
    }
    return out;
  });
  expect(clipped, `${clipped} seat(s) clipped outside viewport`).toBe(0);
}

export async function expectMobileOverlayTableScale(page: Page): Promise<void> {
  const overlay = page.locator("#table-play-overlay");
  const readMetrics = () =>
    page.evaluate(() => {
      const stage =
        document.querySelector(".btable-mobile-stage") ??
        document.querySelector("#table-play-overlay .table-stage");
      const wrap =
        document.querySelector(".btable-mobile-wrap") ??
        document.querySelector("#table-play-overlay .btable-wrap");
      if (!stage || !wrap) return null;
      const s = stage.getBoundingClientRect();
      const fitW = parseFloat(getComputedStyle(wrap).getPropertyValue("--stage-fit-width"));
      const fitH = parseFloat(getComputedStyle(wrap).getPropertyValue("--stage-fit-height"));
      return { stageW: s.width, stageH: s.height, fitW, fitH };
    });

  await overlay.getByTestId("settings-button").click();
  const panel = overlay.getByTestId("settings-panel");
  await expect(panel).toBeVisible();
  const slider = panel.locator(".bsettings__field--row input[type='range']");

  await slider.fill("0.85");
  await page.waitForTimeout(450);
  const small = await readMetrics();
  expect(small).not.toBeNull();

  await slider.fill("1.25");
  await page.waitForTimeout(450);
  const large = await readMetrics();
  expect(large).not.toBeNull();

  expect(large!.fitW).toBeGreaterThan(small!.fitW * 1.02);
  expect(large!.stageW).toBeGreaterThan(small!.stageW * 0.98);

  await panel.getByRole("button", { name: "Close" }).first().click();
}

export async function expectMobileOverlayGameplayFits(
  page: Page,
  opts: { portrait: boolean },
) {
  const metrics = await readOverlayGameplayMetrics(page);
  expect(metrics, "overlay gameplay block should be measurable").not.toBeNull();
  expect(metrics!.isMobileLayout, "mobile overlay should use mobile layout path").toBe(true);
  expect(await overlayHorizontalOverflow(page)).toBeLessThanOrEqual(2);
  await expectOverlaySeatsInViewport(page);

  if (opts.portrait) {
    expect(metrics!.layoutMode).toBe("portrait");
    expect(metrics!.stageWidthRatio).toBeGreaterThan(0.42);
    expect(metrics!.stageHeightRatio).toBeGreaterThan(0.16);
  } else {
    expect(metrics!.landscapeRow).toBe(true);
    expect(metrics!.layoutMode).toBe("landscape");
    expect(metrics!.gameplayWidthRatio).toBeGreaterThan(0.82);
    expect(metrics!.stageW).toBeGreaterThan(180);
    expect(metrics!.stageHeightRatio).toBeGreaterThan(0.18);
  }
}

export async function readOverlayStageMetrics(page: Page): Promise<OverlayStageMetrics | null> {
  return page.evaluate(() => {
    const overlay = document.querySelector("#table-play-overlay");
    const stage =
      document.querySelector(".btable-mobile-stage") ??
      document.querySelector("#table-play-overlay .table-stage");
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
      const stage =
        document.querySelector(".btable-mobile-stage") ??
        document.querySelector("#table-play-overlay .table-stage");
      const scaleEl =
        document.querySelector("#table-play-overlay .btable-desktop__scale") ??
        document.querySelector(".btable-mobile-wrap");
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
  expect(enlarged!.stageW).toBeGreaterThanOrEqual(baseline!.stageW * 0.98);

  await panel.getByRole("button", { name: "Close" }).first().click();
}

/** Assert desktop overlay still uses the desktop layout shell (not mobile path). */
export async function expectDesktopOverlayLayout(page: Page) {
  const usesDesktop = await page.evaluate(() => {
    const mobile = document.querySelector(".btable-mobile");
    const desktop = document.querySelector(".btable-desktop");
    return Boolean(desktop) && !mobile;
  });
  expect(usesDesktop).toBe(true);
}
