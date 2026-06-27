export const BEST_PLAY_PREFS_KEY = "nbl-best-play";

export function getBestPlayEnabled(): boolean {
  try {
    return localStorage.getItem(BEST_PLAY_PREFS_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveBestPlayEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(BEST_PLAY_PREFS_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore storage errors */
  }
}
