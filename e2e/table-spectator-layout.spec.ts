import { test, expect } from "@playwright/test";

function overlapArea(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
): number {
  const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return xOverlap * yOverlap;
}

async function assertAvatarsClearCenterCluster(page: import("@playwright/test").Page) {
  const root = page.locator("#table-play-overlay").getByTestId("table-root");
  await expect(root).toHaveClass(/btable-wrap--spectator/);
  const cluster = root.locator(".table-center-cluster");
  await expect(cluster).toBeVisible();

  const clusterBox = await cluster.boundingBox();
  expect(clusterBox).not.toBeNull();

  const avatars = root.locator(".bseat__avatar-wrap");
  const count = await avatars.count();
  expect(count).toBeGreaterThan(0);

  const clusterArea = clusterBox!.width * clusterBox!.height;
  const maxOverlapRatio = 0.08;

  for (let i = 0; i < count; i++) {
    const box = await avatars.nth(i).boundingBox();
    if (!box) continue;
    const avatar = {
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
    };
    const clusterRect = {
      left: clusterBox!.x,
      top: clusterBox!.y,
      right: clusterBox!.x + clusterBox!.width,
      bottom: clusterBox!.y + clusterBox!.height,
    };
    const overlap = overlapArea(avatar, clusterRect);
    const ratio = overlap / clusterArea;
    expect(
      ratio,
      `avatar ${i} overlap ratio ${ratio.toFixed(3)} should stay below ${maxOverlapRatio}`,
    ).toBeLessThanOrEqual(maxOverlapRatio);

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const centerInside =
      centerX >= clusterRect.left &&
      centerX <= clusterRect.right &&
      centerY >= clusterRect.top &&
      centerY <= clusterRect.bottom;
    expect(centerInside, `avatar ${i} center should not sit inside center cluster`).toBe(false);
  }
}

test.describe("Watch-only spectator seat layout", () => {
  test("4p watch-only avatars do not intrude on center play cluster", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/e2e-fixtures/table-overlay?players=4&bots=3&phase=play&watchOnly=1");
    await expect(page.locator("#table-play-overlay").getByTestId("table-root")).toBeVisible({
      timeout: 15_000,
    });
    await assertAvatarsClearCenterCluster(page);
  });

  test("6p watch-only avatars do not intrude on center play cluster", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/e2e-fixtures/table-overlay?players=6&bots=5&phase=play&watchOnly=1");
    await expect(page.locator("#table-play-overlay").getByTestId("table-root")).toBeVisible({
      timeout: 15_000,
    });
    await assertAvatarsClearCenterCluster(page);
  });
});
