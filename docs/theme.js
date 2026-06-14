// theme.js — dark (default) + US currency light mode

export const THEME_STORAGE_KEY = "nbl-theme";
export const THEMES = /** @type {const} */ (["dark", "light"]);

/** @returns {"dark" | "light"} */
export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** @param {"dark" | "light"} theme */
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
  root.dataset.themeMode = theme;
}

/** @param {"dark" | "light"} theme */
export function saveTheme(theme) {
  try {
    if (theme === "light") {
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    } else {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
  applyTheme(theme);
}

/** @returns {"dark" | "light"} */
export function toggleTheme() {
  const next = getStoredTheme() === "dark" ? "light" : "dark";
  saveTheme(next);
  return next;
}

/** Apply saved theme (call on boot). */
export function initTheme() {
  applyTheme(getStoredTheme());
}

/** @param {HTMLElement | null} button */
export function syncThemeToggleButton(button) {
  if (!button) return;
  const isLight = getStoredTheme() === "light";
  button.setAttribute("aria-pressed", String(isLight));
  button.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode (US currency)",
  );
  button.title = isLight ? "Dark mode" : "Light mode · US currency";
  const icon = button.querySelector(".theme-toggle__icon");
  if (icon) icon.textContent = isLight ? "☾" : "☀";
}

/** @param {HTMLElement | null} button */
export function wireThemeToggle(button) {
  if (!button || button.dataset.themeBound) return;
  button.dataset.themeBound = "1";
  syncThemeToggleButton(button);
  button.addEventListener("click", () => {
    toggleTheme();
    syncThemeToggleButton(button);
  });
}
