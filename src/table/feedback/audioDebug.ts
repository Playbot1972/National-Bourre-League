/** Dev-only table audio diagnostics — enable with localStorage `nbl-table-audio-debug=1`. */

export type TableAudioFallbackReason =
  | "no-asset"
  | "audio-locked"
  | "probe-failed"
  | "preload-failed"
  | "play-rejected"
  | "media-error"
  | "procedural-only";

export function isTableAudioDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem("nbl-table-audio-debug") === "1") return true;
  } catch {
    /* private mode */
  }
  return Boolean(import.meta.env?.DEV);
}

export function logTableAudio(
  message: string,
  detail?: Record<string, unknown>,
): void {
  if (!isTableAudioDebugEnabled()) return;
  if (detail) {
    console.info("[table-audio]", message, detail);
  } else {
    console.info("[table-audio]", message);
  }
}
