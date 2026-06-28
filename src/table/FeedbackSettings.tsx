import { useEffect, useState } from "react";
import {
  getFeedbackPrefs,
  hapticsSupported,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
  SOUND_PACK_LABELS,
  type FeedbackPrefs,
  type HapticsMode,
  type SoundMode,
  type SoundPackId,
} from "./feedback";
import { audioSupported, preloadSoundAssets, resetSoundAssetCache } from "./feedback/audio";

export function FeedbackSettings({ compact = false }: { compact?: boolean }) {
  const [prefs, setPrefs] = useState<FeedbackPrefs>(() => getFeedbackPrefs());
  const [open, setOpen] = useState(false);

  useEffect(() => subscribeFeedbackPrefs(setPrefs), []);

  const soundAvail = audioSupported();
  const hapticAvail = hapticsSupported();

  function setSoundMode(mode: SoundMode) {
    saveFeedbackPrefs({ soundMode: mode });
  }

  function setSoundPack(packId: SoundPackId) {
    saveFeedbackPrefs({ soundPackId: packId });
    resetSoundAssetCache();
    void preloadSoundAssets(packId);
  }

  function setHaptics(mode: HapticsMode) {
    saveFeedbackPrefs({ hapticsMode: mode });
  }

  const panel = (
    <div className={`bfeedback-settings${compact ? " bfeedback-settings--compact" : ""}`}>
      <fieldset className="bfeedback-settings__fieldset">
        <legend className="bfeedback-settings__label">Sound level</legend>
        <label className="bfeedback-settings__radio">
          <input
            type="radio"
            name="sound-mode"
            checked={prefs.soundMode === "on"}
            disabled={!soundAvail}
            onChange={() => setSoundMode("on")}
          />
          On
        </label>
        <label className="bfeedback-settings__radio">
          <input
            type="radio"
            name="sound-mode"
            checked={prefs.soundMode === "minimal"}
            disabled={!soundAvail}
            onChange={() => setSoundMode("minimal")}
          />
          Minimal
        </label>
        <label className="bfeedback-settings__radio">
          <input
            type="radio"
            name="sound-mode"
            checked={prefs.soundMode === "off"}
            onChange={() => setSoundMode("off")}
          />
          Off
        </label>
      </fieldset>
      {!soundAvail && (
        <p className="bfeedback-settings__note muted small">Audio not supported in this browser.</p>
      )}
      <label className="bfeedback-settings__row">
        <span className="bfeedback-settings__label">Sound theme</span>
        <select
          value={prefs.soundPackId}
          disabled={!soundAvail || prefs.soundMode === "off"}
          onChange={(e) => setSoundPack(e.target.value as SoundPackId)}
        >
          {(Object.keys(SOUND_PACK_LABELS) as SoundPackId[]).map((id) => (
            <option key={id} value={id}>
              {SOUND_PACK_LABELS[id]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="bfeedback-settings__fieldset">
        <legend className="bfeedback-settings__label">Haptics</legend>
        <label className="bfeedback-settings__radio">
          <input
            type="radio"
            name="haptics-mode"
            checked={prefs.hapticsMode === "on"}
            disabled={!hapticAvail}
            onChange={() => setHaptics("on")}
          />
          On
        </label>
        <label className="bfeedback-settings__radio">
          <input
            type="radio"
            name="haptics-mode"
            checked={prefs.hapticsMode === "minimal"}
            disabled={!hapticAvail}
            onChange={() => setHaptics("minimal")}
          />
          Minimal
        </label>
        <label className="bfeedback-settings__radio">
          <input
            type="radio"
            name="haptics-mode"
            checked={prefs.hapticsMode === "off"}
            onChange={() => setHaptics("off")}
          />
          Off
        </label>
      </fieldset>
      {!hapticAvail && (
        <p className="bfeedback-settings__note muted small">Vibration unavailable on this device.</p>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="bfeedback-settings-wrap">
        <button
          type="button"
          className="bfeedback-settings__toggle btn btn--sm"
          aria-expanded={open}
          aria-controls="table-feedback-settings"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide feedback" : "Sound & haptics"}
        </button>
        {open && (
          <div id="table-feedback-settings" className="bfeedback-settings__popover">
            {panel}
          </div>
        )}
      </div>
    );
  }

  return panel;
}
