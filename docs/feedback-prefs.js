// feedback-prefs.js — sound/haptics preferences (mirrors src/table/feedback/prefs.ts)

/** @typedef {"on" | "minimal" | "off"} HapticsMode */
/** @typedef {"on" | "minimal" | "off"} SoundMode */
/** @typedef {"classic" | "wood" | "arcade"} SoundPackId */

/** Keep in sync with src/table/feedback/prefs.ts */
export const FEEDBACK_PREFS_KEY = "nbl-feedback";

const SOUND_PACK_IDS = ["classic", "wood", "arcade"];

/** @returns {{ soundMode: SoundMode, soundPackId: SoundPackId, hapticsMode: HapticsMode }} */
export function getFeedbackPrefs() {
  try {
    const stored = localStorage.getItem(FEEDBACK_PREFS_KEY);
    if (!stored) {
      return { soundMode: "on", soundPackId: "classic", hapticsMode: "on" };
    }
    const o = JSON.parse(stored);
    const hapticsMode =
      o.hapticsMode === "off" || o.hapticsMode === "minimal" || o.hapticsMode === "on"
        ? o.hapticsMode
        : o.hapticsEnabled === false
          ? "off"
          : "on";
    let soundMode;
    if (o.soundMode === "on" || o.soundMode === "minimal" || o.soundMode === "off") {
      soundMode = o.soundMode;
    } else if (o.soundEnabled === false) {
      soundMode = "off";
    } else {
      soundMode = "on";
    }
    const soundPackId = SOUND_PACK_IDS.includes(o.soundPackId) ? o.soundPackId : "classic";
    return { soundMode, soundPackId, hapticsMode };
  } catch {
    return { soundMode: "on", soundPackId: "classic", hapticsMode: "on" };
  }
}

/** @param {Partial<{ soundMode: SoundMode, soundPackId: SoundPackId, hapticsMode: HapticsMode }>} partial */
export function saveFeedbackPrefs(partial) {
  const next = { ...getFeedbackPrefs(), ...partial };
  try {
    localStorage.setItem(FEEDBACK_PREFS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export const SOUND_PACK_LABELS = {
  classic: "Classic",
  wood: "Wood & Felt",
  arcade: "Arcade",
};

export function renderFeedbackSettingsHtml() {
  const prefs = getFeedbackPrefs();
  const packOptions = SOUND_PACK_IDS.map(
    (id) =>
      `<option value="${id}" ${prefs.soundPackId === id ? "selected" : ""}>${SOUND_PACK_LABELS[id]}</option>`,
  ).join("");
  return `<section class="feedback-settings" aria-label="Game feedback settings">
    <h5 class="feedback-settings__title">Game feedback</h5>
    <fieldset class="feedback-settings__fieldset">
      <legend>Sound level</legend>
      <label class="feedback-settings__radio">
        <input type="radio" name="feedback-sound-mode" value="on" ${prefs.soundMode === "on" ? "checked" : ""} />
        On
      </label>
      <label class="feedback-settings__radio">
        <input type="radio" name="feedback-sound-mode" value="minimal" ${prefs.soundMode === "minimal" ? "checked" : ""} />
        Minimal
      </label>
      <label class="feedback-settings__radio">
        <input type="radio" name="feedback-sound-mode" value="off" ${prefs.soundMode === "off" ? "checked" : ""} />
        Off
      </label>
    </fieldset>
    <label class="feedback-settings__row">
      <span>Sound theme</span>
      <select id="feedback-sound-pack">${packOptions}</select>
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
    <p class="muted small feedback-settings__hint">Minimal plays trick wins and pot cues only.</p>
  </section>`;
}

/** @param {ParentNode | Document} root */
export function wireFeedbackSettings(root = document) {
  const soundModes = root.querySelectorAll('input[name="feedback-sound-mode"]');
  const soundPack = root.querySelector("#feedback-sound-pack");
  const haptics = root.querySelectorAll('input[name="feedback-haptics"]');
  if (soundModes.length === 0 && haptics.length === 0 && !soundPack) return;

  for (const input of soundModes) {
    input.addEventListener("change", () => {
      if (!(/** @type {HTMLInputElement} */ (input).checked)) return;
      saveFeedbackPrefs({
        soundMode: /** @type {SoundMode} */ (/** @type {HTMLInputElement} */ (input).value),
      });
    });
  }
  soundPack?.addEventListener("change", () => {
    saveFeedbackPrefs({
      soundPackId: /** @type {SoundPackId} */ (/** @type {HTMLSelectElement} */ (soundPack).value),
    });
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
