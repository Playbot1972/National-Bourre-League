import { initGameFeedback, playUiButtonFeedback } from "../table/feedback";

/** Table / live play — explicit gameplay and action sounds; skip delegation. */
const TABLE_ROOT_SELECTOR =
  ".btable-session, .btable-wrap, .btable-mobile-wrap, .table-play-overlay";

/** Controls that already fire dedicated audio on the same activation. */
const DEDICATED_SOUND_SELECTORS = ["#delete-room", "[data-delete-room]"];
const DEDICATED_SOUND_SELECTOR = DEDICATED_SOUND_SELECTORS.join(", ");

/** Non-UI press targets (cards, form fields, labels). */
const NON_UI_PRESS_SELECTOR = [
  ".pcard",
  "input",
  "textarea",
  "select",
  "label",
].join(", ");

/** Clickable UI activators that should get the default press sound. */
const UI_ACTIVATOR_SELECTOR = [
  "button",
  'a[href]:not([href=""])',
  '[role="button"]',
  '[role="tab"]',
  ".btn",
  ".nav__link",
  ".app__nav-link",
  ".theme-toggle",
  ".home__feature-link",
  ".tut__dot",
  "[data-rooms-scope]",
  ".profile__menu-item",
  ".auth-tab",
].join(", ");

function matchesAny(el: Element, selectors: readonly string[]): boolean {
  return selectors.some((selector) => {
    try {
      return el.matches(selector);
    } catch {
      return false;
    }
  });
}

function isDisabledActivator(el: HTMLElement): boolean {
  if (el.matches(":disabled")) return true;
  const aria = el.getAttribute("aria-disabled");
  return aria === "true";
}

function isElementLike(target: EventTarget | null): target is Element {
  return (
    target !== null &&
    typeof target === "object" &&
    "closest" in target &&
    typeof (target as Element).closest === "function"
  );
}

/**
 * Resolve the UI control that should receive a default press sound, or null when
 * skipped (table session, cards, disabled, dedicated-sound controls, etc.).
 */
export function resolveUiButtonPressTarget(target: EventTarget | null): HTMLElement | null {
  if (!isElementLike(target)) return null;
  if (target.closest(TABLE_ROOT_SELECTOR)) return null;
  if (target.closest(NON_UI_PRESS_SELECTOR)) return null;

  const activator = target.closest(UI_ACTIVATOR_SELECTOR);
  if (!activator || typeof (activator as HTMLElement).getAttribute !== "function") return null;
  const el = activator as HTMLElement;
  if (el.closest(TABLE_ROOT_SELECTOR)) return null;
  if (matchesAny(el, DEDICATED_SOUND_SELECTORS) || el.closest(DEDICATED_SOUND_SELECTOR)) {
    return null;
  }
  if (isDisabledActivator(el)) return null;
  return el;
}

/** Attach default click.mp3 to clickable UI outside the live table. */
export function bindUiButtonPress(
  root: Document | HTMLElement = document,
  play: () => void = playUiButtonFeedback,
): () => void {
  let inited = false;
  const ensureInit = () => {
    if (inited) return;
    inited = true;
    initGameFeedback();
  };

  const onClick = (event: Event) => {
    if (event instanceof MouseEvent && event.defaultPrevented) return;
    const activator = resolveUiButtonPressTarget(event.target);
    if (!activator) return;
    ensureInit();
    play();
  };

  root.addEventListener("click", onClick, true);
  return () => root.removeEventListener("click", onClick, true);
}
