import { useContext } from "react";
import { TableThemeContext, type TableThemeContextValue } from "./tableThemeContext";

export function useTableTheme(): TableThemeContextValue {
  const ctx = useContext(TableThemeContext);
  if (!ctx) throw new Error("useTableTheme must be used within TableThemeProvider");
  return ctx;
}

export type { TableThemeContextValue };
