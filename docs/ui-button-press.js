/**
 * Default click.mp3 for social app chrome (nav, pills, modals).
 * Live table controls use explicit feedback APIs — skipped via TABLE_ROOT_SELECTOR.
 */

const TABLE_ROOT_SELECTOR =
  ".btable-session, .btable-wrap, .btable-mobile-wrap, .table-play-overlay";
const DEDICATED_SOUND_SELECTORS = ["#delete-room", "[data-delete-room]"];
const DEDICATED_SOUND_SELECTOR = DEDICATED_SOUND_SELECTORS.join(", ");
const NON_UI_PRESS_SELECTOR = ".pcard, input, textarea, select, label";
const UI_ACTIVATOR_SELECTOR = [
  "button",
  'a[href]:not([href=""])',
  '[role="button"]',
  '[role="tab"]',
  ".btn",
  ".nav__link",
  ".theme-toggle",
  ".home__feature-link",
  "[data-rooms-scope]",
  ".profile__menu-item",
  ".auth-tab",
].join(", ");

const UI_BUTTON_SOUND = "/sounds/click.mp3";
const FEEDBACK_PREFS_KEY = "nbl-feedback";

let audioClip = null;
let unlocked = false;

function shouldPlayUiButtonSound() {
  try {
    const raw = localStorage.getItem(FEEDBACK_PREFS_KEY);
    if (!raw) return true;
    const prefs = JSON.parse(raw);
    if (prefs.soundMode === "off" || prefs.soundEnabled === false) return false;
    return true;
  } catch {
    return true;
  }
}

function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  if (!audioClip) audioClip = new Audio(UI_BUTTON_SOUND);
  audioClip.volume = 0.4;
  void audioClip.play().then(() => {
    audioClip.pause();
    audioClip.currentTime = 0;
  }).catch(() => {});
}

function playUiButtonPress() {
  if (!shouldPlayUiButtonSound()) return;
  if (!audioClip) audioClip = new Audio(UI_BUTTON_SOUND);
  audioClip.volume = 0.4;
  audioClip.currentTime = 0;
  void audioClip.play().catch(() => {});
}

function matchesAny(el, selectors) {
  return selectors.some((selector) => {
    try {
      return el.matches(selector);
    } catch {
      return false;
    }
  });
}

function isDisabledActivator(el) {
  if (el.matches(":disabled")) return true;
  return el.getAttribute("aria-disabled") === "true";
}

export function resolveUiButtonPressTarget(target) {
  if (!target || typeof target.closest !== "function") return null;
  if (target.closest(TABLE_ROOT_SELECTOR)) return null;
  if (target.closest(NON_UI_PRESS_SELECTOR)) return null;
  const activator = target.closest(UI_ACTIVATOR_SELECTOR);
  if (!activator || typeof activator.getAttribute !== "function") return null;
  if (activator.closest(TABLE_ROOT_SELECTOR)) return null;
  if (matchesAny(activator, DEDICATED_SOUND_SELECTORS) || activator.closest(DEDICATED_SOUND_SELECTOR)) {
    return null;
  }
  if (isDisabledActivator(activator)) return null;
  return activator;
}

export function bindUiButtonPress(root = document) {
  const onPointerDown = () => unlockAudio();
  const onClick = (event) => {
    if (event.defaultPrevented) return;
    if (!resolveUiButtonPressTarget(event.target)) return;
    playUiButtonPress();
  };
  root.addEventListener("pointerdown", onPointerDown, { capture: true, once: false });
  root.addEventListener("click", onClick, true);
  return () => {
    root.removeEventListener("pointerdown", onPointerDown, true);
    root.removeEventListener("click", onClick, true);
  };
}
