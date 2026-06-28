import { useTableTheme } from "./theme/useTableTheme";
import {
  TABLE_THEME_LABELS,
  CARD_PACK_LABELS,
  type CardPackId,
  type CardScale,
  type DeckMode,
  type LayoutMode,
  type TableThemeId,
} from "./theme/settings";

interface TableSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function TableSettingsPanel({ open, onClose }: TableSettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useTableTheme();

  if (!open) return null;

  return (
    <div className="bsettings" role="dialog" aria-label="Table appearance" data-testid="settings-panel">
      <div className="bsettings__panel">
        <header className="bsettings__head">
          <h6 className="bsettings__title">Table room</h6>
          <button type="button" className="bsettings__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <label className="bsettings__field">
          <span>Theme</span>
          <select
            value={settings.themeId}
            onChange={(e) => updateSettings({ themeId: e.target.value as TableThemeId })}
          >
            {(Object.keys(TABLE_THEME_LABELS) as TableThemeId[]).map((id) => (
              <option key={id} value={id}>
                {TABLE_THEME_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="bsettings__field">
          <span>Card style</span>
          <select
            value={settings.cardPackId}
            onChange={(e) => updateSettings({ cardPackId: e.target.value as CardPackId })}
          >
            {(Object.keys(CARD_PACK_LABELS) as CardPackId[]).map((id) => (
              <option key={id} value={id}>
                {CARD_PACK_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="bsettings__field">
          <span>Deck</span>
          <select
            value={settings.deckMode}
            onChange={(e) => updateSettings({ deckMode: e.target.value as DeckMode })}
          >
            <option value="classic">Classic two-color</option>
            <option value="four-color">Four-color contrast</option>
          </select>
        </label>

        <label className="bsettings__field">
          <span>Card size</span>
          <select
            value={settings.cardScale}
            onChange={(e) => updateSettings({ cardScale: e.target.value as CardScale })}
          >
            <option value="sm">Compact</option>
            <option value="md">Standard</option>
            <option value="lg">Large</option>
          </select>
        </label>

        <label className="bsettings__field bsettings__field--row">
          <span>Table scale</span>
          <input
            type="range"
            min={0.85}
            max={1.35}
            step={0.05}
            value={settings.tableScale}
            onChange={(e) => updateSettings({ tableScale: Number(e.target.value) })}
          />
          <span className="bsettings__range-val">{Math.round(settings.tableScale * 100)}%</span>
        </label>

        <label className="bsettings__check">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => updateSettings({ highContrast: e.target.checked })}
          />
          High contrast
        </label>

        <fieldset className="bsettings__fieldset">
          <legend>Layout (scaffold)</legend>
          <label className="bsettings__check">
            <input
              type="radio"
              name="layout"
              checked={settings.layoutMode === "single"}
              onChange={() => updateSettings({ layoutMode: "single" as LayoutMode })}
            />
            Single table
          </label>
          <label className="bsettings__check bsettings__check--muted">
            <input
              type="radio"
              name="layout"
              checked={settings.layoutMode === "tiled"}
              onChange={() => updateSettings({ layoutMode: "tiled" as LayoutMode })}
            />
            Tiled multi-room (preview)
          </label>
        </fieldset>

        <details className="bsettings__hotkeys">
          <summary>Hotkeys (scaffold)</summary>
          <ul className="bsettings__hotkey-list muted small">
            <li>
              <kbd>{settings.hotkeys.focusTable}</kbd> Focus table
            </li>
            <li>
              <kbd>{settings.hotkeys.toggleSettings}</kbd> Settings
            </li>
            <li>
              <kbd>{settings.hotkeys.standPat}</kbd> Stand pat (reserved)
            </li>
            <li>
              <kbd>{settings.hotkeys.nextTable}</kbd> Next table (reserved)
            </li>
          </ul>
        </details>

        <footer className="bsettings__foot">
          <button type="button" className="btn btn--sm" onClick={resetSettings}>
            Reset defaults
          </button>
        </footer>
      </div>
      <button type="button" className="bsettings__backdrop" onClick={onClose} aria-label="Close" />
    </div>
  );
}
