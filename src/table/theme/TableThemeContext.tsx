import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyTableSettingsToElement,
  DEFAULT_TABLE_SETTINGS,
  loadTableSettings,
  saveTableSettings,
  type TableSettings,
} from "./settings";
import { TableThemeContext } from "./tableThemeContext";

function TableRoomShell({ settings, children }: { settings: TableSettings; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) applyTableSettingsToElement(ref.current, settings);
  }, [settings]);
  return (
    <div ref={ref} className="btable-room">
      {children}
    </div>
  );
}

export function TableThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TableSettings>(() => loadTableSettings());

  const updateSettings = useCallback((patch: Partial<TableSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch, hotkeys: { ...prev.hotkeys, ...patch.hotkeys } };
      saveTableSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const next = { ...DEFAULT_TABLE_SETTINGS, hotkeys: { ...DEFAULT_TABLE_SETTINGS.hotkeys } };
    saveTableSettings(next);
    setSettings(next);
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings],
  );

  return (
    <TableThemeContext.Provider value={value}>
      <TableRoomShell settings={settings}>{children}</TableRoomShell>
    </TableThemeContext.Provider>
  );
}
