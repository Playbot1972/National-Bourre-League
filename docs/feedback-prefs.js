// feedback-prefs.js — sound/haptics preferences (mirrors src/table/feedback/prefs.ts)

/** @typedef {"on" | "minimal" | "off"} HapticsMode */

/** Keep in sync with src/table/feedback/prefs.ts */
export const FEEDBACK_PREFS_KEY = "nbl-feedback";

/** @returns {{ soundEnabled: boolean, hapticsMode: HapticsMode }} */
export function getFeedbackPrefs() {
  try {
    const stored = localStorage.getItem(FEEDBACK_PREFS_KEY);
    if (!stored) return { soundEnabled: true, hapticsMode: "on" };
    const o = JSON.parse(stored);
    const hapticsMode =
      o.hapticsMode === "off" || o.hapticsMode === "minimal" || o.hapticsMode === "on"
        ? o.hapticsMode
        : o.hapticsEnabled === false
          ? "off"
          : "on";
    return { soundEnabled: o.soundEnabled !== false, hapticsMode };
  } catch {
    return { soundEnabled: true, hapticsMode: "on" };
  }
}

/** @param {Partial<{ soundEnabled: boolean, hapticsMode: HapticsMode }>} partial */
export function saveFeedbackPrefs(partial) {
  const next = { ...getFeedbackPrefs(), ...partial };
  try {
    localStorage.setItem(FEEDBACK_PREFS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function renderFeedbackSettingsHtml() {
  const prefs = getFeedbackPrefs();
  return `<section class="feedback-settings" aria-label="Game feedback settings">
    <h5 class="feedback-settings__title">Game feedback</h5>
    <label class="feedback-settings__row">
      <span>Sound effects</span>
      <input type="checkbox" id="feedback-sound-enabled" ${prefs.soundEnabled ? "checked" : ""} />
    </label>
    <fieldset class="feedback-settings__fieldset">
      <legend>Haptics</legend>
      <label class="feedback-settings__radio">
        <input type="radio" name="feedback-haptics" value="on" ${prefs.hapticsMode === "on" ? "checked" : ""} />
        On
      </label>
      <label class="feedback-settings__radio">
        <input type="radio" name="feedback-haptics" value="minimal" ${prefs.hapticsMode === "minimal" ? "checked" : ""} />
        Minimal
      </label>
      <label class="feedback-settings__radio">
        <input type="radio" name="feedback-haptics" value="off" ${prefs.hapticsMode === "off" ? "checked" : ""} />
        Off
      </label>
    </fieldset>
    <p class="muted small feedback-settings__hint">Shuffle and trick-win cues on the live table.</p>
  </section>`;
}

/** @param {ParentNode | Document} root */
export function wireFeedbackSettings(root = document) {
  const sound = root.querySelector("#feedback-sound-enabled");
  const haptics = root.querySelectorAll('input[name="feedback-haptics"]');
  if (!sound && haptics.length === 0) return;

  sound?.addEventListener("change", () => {
    saveFeedbackPrefs({ soundEnabled: /** @type {HTMLInputElement} */ (sound).checked });
  });
  for (const input of haptics) {
    input.addEventListener("change", () => {
      if (!(/** @type {HTMLInputElement} */ (input).checked)) return;
      saveFeedbackPrefs({
        hapticsMode: /** @type {HapticsMode} */ (/** @type {HTMLInputElement} */ (input).value),
      });
    });
  }
}
