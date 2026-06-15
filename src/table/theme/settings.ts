export type TableThemeId = "carbon" | "simple" | "night-felt" | "arena";
export type DeckMode = "classic" | "four-color";
export type CardScale = "sm" | "md" | "lg";
/** `tiled` is scaffolded for future multi-table monitoring. */
export type LayoutMode = "single" | "tiled";

export interface TableHotkeyMap {
  focusTable: string;
  toggleSettings: string;
  standPat: string;
  /** Reserved for multi-table focus cycling. */
  nextTable: string;
}

export interface TableSettings {
  themeId: TableThemeId;
  deckMode: DeckMode;
  cardScale: CardScale;
  highContrast: boolean;
  /** Desktop zoom factor for the felt (0.85–1.35). */
  tableScale: number;
  layoutMode: LayoutMode;
  hotkeys: TableHotkeyMap;
}

export const TABLE_SETTINGS_STORAGE_KEY = "nbl-table-settings";

export const DEFAULT_HOTKEYS: TableHotkeyMap = {
  focusTable: "F",
  toggleSettings: ",",
  standPat: "P",
  nextTable: "Tab",
};

export const DEFAULT_TABLE_SETTINGS: TableSettings = {
  themeId: "night-felt",
  deckMode: "classic",
  cardScale: "md",
  highContrast: false,
  tableScale: 1,
  layoutMode: "single",
  hotkeys: { ...DEFAULT_HOTKEYS },
};

export const TABLE_THEME_LABELS: Record<TableThemeId, string> = {
  carbon: "Carbon",
  simple: "Simple",
  "night-felt": "Night Felt",
  arena: "Arena",
};

export function clampTableScale(value: number): number {
  return Math.max(0.85, Math.min(1.35, value));
}

export function loadTableSettings(): TableSettings {
  try {
    const raw = localStorage.getItem(TABLE_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TABLE_SETTINGS, hotkeys: { ...DEFAULT_HOTKEYS } };
    const parsed = JSON.parse(raw) as Partial<TableSettings>;
    return {
      ...DEFAULT_TABLE_SETTINGS,
      ...parsed,
      tableScale: clampTableScale(parsed.tableScale ?? DEFAULT_TABLE_SETTINGS.tableScale),
      hotkeys: { ...DEFAULT_HOTKEYS, ...parsed.hotkeys },
    };
  } catch {
    return { ...DEFAULT_TABLE_SETTINGS, hotkeys: { ...DEFAULT_HOTKEYS } };
  }
}

export function saveTableSettings(settings: TableSettings): void {
  try {
    localStorage.setItem(TABLE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function applyTableSettingsToElement(el: HTMLElement, settings: TableSettings): void {
  el.dataset.tableTheme = settings.themeId;
  el.dataset.deckMode = settings.deckMode;
  el.dataset.cardScale = settings.cardScale;
  el.dataset.highContrast = settings.highContrast ? "true" : "false";
  el.dataset.layoutMode = settings.layoutMode;
  el.style.setProperty("--table-scale", String(settings.tableScale));
}
