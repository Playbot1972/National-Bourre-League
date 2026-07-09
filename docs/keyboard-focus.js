/**
 * Dismiss iOS/WKWebView keyboards when leaving text-entry contexts (e.g. table open).
 */

/** True when the element should show a software keyboard on mobile. */
export function isTextEntryElement(el) {
  if (!el || typeof el !== "object") return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const type = (el.type || "text").toLowerCase();
    return (
      type === "text" ||
      type === "search" ||
      type === "email" ||
      type === "password" ||
      type === "tel" ||
      type === "url" ||
      type === "number"
    );
  }
  return el.isContentEditable === true;
}

/** Short label for debug logs. */
export function describeActiveElement(el) {
  if (!el) return { tag: "none" };
  if (typeof document !== "undefined" && el === document.body) return { tag: "body" };
  return {
    tag: el.tagName?.toLowerCase() ?? "unknown",
    id: el.id || undefined,
    type: el.type || undefined,
    textEntry: isTextEntryElement(el),
  };
}

/** Blur the focused text field so gameplay does not keep the keyboard open. */
export function blurActiveTextEntry(root = typeof document !== "undefined" ? document : null) {
  if (!root?.activeElement) return null;
  const el = root.activeElement;
  if (!isTextEntryElement(el) || typeof el.blur !== "function") return null;
  el.blur();
  return el.id || el.tagName?.toLowerCase() || "text-entry";
}

/** Room-detail snapshot re-renders should not steal focus during live table play. */
export function shouldRestoreRoomDetailFocus(tablePlayOpen) {
  return !tablePlayOpen;
}
