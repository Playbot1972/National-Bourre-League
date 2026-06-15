import { useEffect, useState } from "react";
import {
  getFeedbackPrefs,
  hapticsSupported,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
  type FeedbackPrefs,
  type HapticsMode,
} from "./feedback";
import { audioSupported } from "./feedback/audio";

export function FeedbackSettings({ compact = false }: { compact?: boolean }) {
  const [prefs, setPrefs] = useState<FeedbackPrefs>(() => getFeedbackPrefs());
  const [open, setOpen] = useState(false);

  useEffect(() => subscribeFeedbackPrefs(setPrefs), []);

  const soundAvail = audioSupported();
  const hapticAvail = hapticsSupported();

  function setSound(enabled: boolean) {
    saveFeedbackPrefs({ soundEnabled: enabled });
  }

  function setHaptics(mode: HapticsMode) {
    saveFeedbackPrefs({ hapticsMode: mode });
  }

  const panel = (
    <div className={`bfeedback-settings${compact ? " bfeedback-settings--compact" : ""}`}>
      <label className="bfeedback-settings__row">
        <span className="bfeedback-settings__label">Sound effects</span>
        <input
          type="checkbox"
          checked={prefs.soundEnabled}
          disabled={!soundAvail}
          onChange={(e) => setSound(e.target.checked)}
        />
      </label>
      {!soundAvail && (
        <p className="bfeedback-settings__note muted small">Audio not supported in this browser.</p>
      )}
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
