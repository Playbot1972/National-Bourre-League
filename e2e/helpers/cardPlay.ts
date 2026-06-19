import type { Locator, Page } from "@playwright/test";

export async function playCardLocator(page: Page, index = 0): Promise<Locator> {
  return page.locator(`[data-testid="play-button"][data-card-index="${index}"]`).first();
}

export async function nonPlayableCardLocator(page: Page, index = 3): Promise<Locator> {
  return page.locator(`[data-testid="play-button-disabled"][data-card-index="${index}"]`).first();
}

export async function fixturePlayLog(page: Page): Promise<Array<{ index: number; at: number }>> {
  return page.evaluate(() => window.__fixturePlayLog ?? []);
}

async function cardCenter(card: Locator): Promise<{ x: number; y: number }> {
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  if (!box) throw new Error("Card has no bounding box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

type PointerKind = "touch" | "mouse";

async function dispatchPointer(
  card: Locator,
  phase: "down" | "move" | "up" | "cancel",
  coords: { x: number; y: number },
  pointerType: PointerKind,
) {
  await card.evaluate(
    (el, { phase, coords, pointerType }) => {
      const type = `pointer${phase}` as "pointerdown" | "pointermove" | "pointerup" | "pointercancel";
      const buttons = phase === "down" || phase === "move" ? 1 : 0;
      el.dispatchEvent(
        new PointerEvent(type, {
          clientX: coords.x,
          clientY: coords.y,
          pointerId: 1,
          pointerType,
          button: 0,
          buttons,
          bubbles: true,
          cancelable: true,
          isPrimary: true,
        }),
      );
    },
    { phase, coords, pointerType },
  );
}

/** Single tap / click on a playable card. */
export async function tapPlayCard(page: Page, card: Locator, { useTouch = false } = {}) {
  const pointerType: PointerKind = useTouch ? "touch" : "mouse";
  const { x, y } = await cardCenter(card);
  if (!useTouch) {
    await card.evaluate((el) => (el as HTMLButtonElement).click());
    return;
  }
  await dispatchPointer(card, "down", { x, y }, pointerType);
  await dispatchPointer(card, "up", { x, y }, pointerType);
}

/** Press-and-hold past the hold threshold, then release. */
export async function holdPlayCard(
  page: Page,
  card: Locator,
  { holdMs = 260, useTouch = false } = {},
) {
  const pointerType: PointerKind = useTouch ? "touch" : "mouse";
  const { x, y } = await cardCenter(card);
  await dispatchPointer(card, "down", { x, y }, pointerType);
  await page.waitForTimeout(holdMs);
  await dispatchPointer(card, "up", { x, y }, pointerType);
}

/** Upward swipe/flick on a playable card. */
export async function swipeUpPlayCard(
  page: Page,
  card: Locator,
  { distance = 44, useTouch = false } = {},
) {
  const pointerType: PointerKind = useTouch ? "touch" : "mouse";
  const { x, y } = await cardCenter(card);
  await dispatchPointer(card, "down", { x, y }, pointerType);
  await dispatchPointer(card, "move", { x, y: y - distance }, pointerType);
  await dispatchPointer(card, "up", { x, y: y - distance }, pointerType);
}

declare global {
  interface Window {
    __fixturePlayLog?: Array<{ index: number; at: number }>;
  }
}
