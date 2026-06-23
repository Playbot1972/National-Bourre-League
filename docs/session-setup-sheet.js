/**
 * Mobile-only bottom sheet for the regional session setup window (Add guest / robot).
 * Desktop keeps the inline layout — this module no-ops when the mobile query does not match.
 */

const MOBILE_SHEET_MQ = "(max-width: 900px), ((hover: none) and (pointer: coarse))";

/** @type {number | null} User-chosen snap offset (px translateY). Survives Firestore re-renders. */
let userSnapOffset = null;
/** One-shot expand after + New session before the user drags. */
let pendingAddPlayersSnap = false;
let boundRoot = null;
let dragState = null;

function isMobileSheet() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_SHEET_MQ).matches;
}

function sheetEl(root) {
  return root?.querySelector("[data-session-setup-sheet]") ?? null;
}

function measureSnapOffsets(sheet) {
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const safeBottom = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0",
  );
  const handle = sheet.querySelector(".session-setup-sheet__handle");
  const body = sheet.querySelector(".session-setup-window");
  const handleH = handle?.offsetHeight ?? 28;
  const bodyH = body?.scrollHeight ?? 200;
  const pills = sheet.querySelector(".session-action-pills");
  const pillsH = pills?.offsetHeight ?? 48;

  const peekVisible = handleH + pillsH + 12;
  const contentVisible = Math.min(
    handleH + bodyH + 16,
    Math.round(viewport * 0.62),
  );
  const expandedVisible = Math.min(
    handleH + bodyH + 16,
    Math.round(viewport * 0.88),
  );

  const toOffset = (visible) =>
    Math.max(0, sheet.offsetHeight - visible - safeBottom);

  return {
    peek: toOffset(peekVisible),
    content: toOffset(contentVisible),
    expanded: toOffset(expandedVisible),
  };
}

function nearestSnap(offsets, target) {
  const entries = [
    ["peek", offsets.peek],
    ["content", offsets.content],
    ["expanded", offsets.expanded],
  ];
  let best = entries[0];
  let bestDist = Math.abs(target - best[1]);
  for (const entry of entries) {
    const dist = Math.abs(target - entry[1]);
    if (dist < bestDist) {
      best = entry;
      bestDist = dist;
    }
  }
  return { name: best[0], offset: best[1] };
}

function applyOffset(sheet, offset, { animate = true } = {}) {
  sheet.style.setProperty("--sheet-offset", `${Math.round(offset)}px`);
  sheet.dataset.sheetAnimating = animate ? "true" : "false";
  if (!animate) {
    sheet.dataset.sheetAnimating = "false";
    return;
  }
  window.setTimeout(() => {
    if (sheet.isConnected) sheet.dataset.sheetAnimating = "false";
  }, 280);
}

function bindSheet(sheet) {
  if (sheet.dataset.sheetBound === "true") return;
  sheet.dataset.sheetBound = "true";

  const handle = sheet.querySelector(".session-setup-sheet__handle");
  const dragSurface = handle ?? sheet;

  const onPointerDown = (e) => {
    if (!isMobileSheet()) return;
    if (e.button != null && e.button !== 0) return;
    dragState = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startOffset: Number.parseFloat(
        getComputedStyle(sheet).getPropertyValue("--sheet-offset") || "0",
      ),
      sheet,
    };
    sheet.dataset.sheetDragging = "true";
    dragSurface.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const dy = e.clientY - dragState.startY;
    const next = Math.max(0, dragState.startOffset + dy);
    applyOffset(dragState.sheet, next, { animate: false });
  };

  const finishDrag = (e) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const { sheet: active } = dragState;
    dragState = null;
    active.dataset.sheetDragging = "false";
    try {
      dragSurface.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    const current = Number.parseFloat(
      getComputedStyle(active).getPropertyValue("--sheet-offset") || "0",
    );
    const snaps = measureSnapOffsets(active);
    const chosen = nearestSnap(snaps, current);
    userSnapOffset = chosen.offset;
    active.dataset.sheetSnap = chosen.name;
    applyOffset(active, chosen.offset, { animate: true });
  };

  dragSurface.addEventListener("pointerdown", onPointerDown);
  dragSurface.addEventListener("pointermove", onPointerMove);
  dragSurface.addEventListener("pointerup", finishDrag);
  dragSurface.addEventListener("pointercancel", finishDrag);
}

/**
 * Call after creating a regional session — opens the sheet to the content snap once.
 */
export function requestSessionSetupAddPlayersSnap() {
  pendingAddPlayersSnap = true;
  userSnapOffset = null;
}

/** Clear sheet position when leaving the room or switching away from setup. */
export function resetSessionSetupSheet() {
  userSnapOffset = null;
  pendingAddPlayersSnap = false;
  dragState = null;
}

/** Reset drag snap when switching regional session tabs (not a new-session expand). */
export function clearSessionSetupSheetSnap() {
  userSnapOffset = null;
  pendingAddPlayersSnap = false;
}

/**
 * Attach listeners on the room detail root (once).
 * @param {HTMLElement | null} root
 */
export function initSessionSetupSheet(root) {
  if (!root || boundRoot === root) return;
  boundRoot = root;
}

/**
 * Inline style for the sheet element so remounted markup does not flash expanded.
 */
export function sessionSetupSheetStyleAttr() {
  if (!isMobileSheet() || userSnapOffset == null) return "";
  return ` style="--sheet-offset:${Math.round(userSnapOffset)}px"`;
}

/**
 * Reconcile sheet position after renderRoomDetail rebuilds markup.
 * @param {HTMLElement | null} root
 */
export function syncSessionSetupSheet(root) {
  if (!root || !isMobileSheet()) return;

  const run = () => {
    const sheet = sheetEl(root);
    if (!sheet) return;

    bindSheet(sheet);

    const snaps = measureSnapOffsets(sheet);
    let targetOffset = userSnapOffset;
    let animate = false;

    if (pendingAddPlayersSnap) {
      pendingAddPlayersSnap = false;
      targetOffset = snaps.content;
      userSnapOffset = snaps.content;
      sheet.dataset.sheetSnap = "content";
      animate = true;
    } else if (targetOffset == null) {
      targetOffset = snaps.peek;
      userSnapOffset = snaps.peek;
      sheet.dataset.sheetSnap = "peek";
    }

    applyOffset(sheet, targetOffset, { animate });
  };

  window.requestAnimationFrame(run);
}

/**
 * Whether mobile sheet is active — used to skip scrollIntoView fighting.
 */
export function shouldUseSessionSetupSheet() {
  return isMobileSheet();
}
