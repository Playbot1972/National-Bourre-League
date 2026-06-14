export const THEME_STORAGE_KEY = "nbl-theme";

export type ThemeMode = "dark" | "light";

export function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
  root.dataset.themeMode = theme;
}

export function saveTheme(theme: ThemeMode): void {
  try {
    if (theme === "light") {
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    } else {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  applyTheme(theme);
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getStoredTheme() === "dark" ? "light" : "dark";
  saveTheme(next);
  return next;
}

export function initTheme(): ThemeMode {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
