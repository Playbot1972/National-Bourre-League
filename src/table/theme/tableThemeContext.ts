import { createContext } from "react";
import type { TableSettings } from "./settings";

export interface TableThemeContextValue {
  settings: TableSettings;
  updateSettings: (patch: Partial<TableSettings>) => void;
  resetSettings: () => void;
}

export const TableThemeContext = createContext<TableThemeContextValue | null>(null);
