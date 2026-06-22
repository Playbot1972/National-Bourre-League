import { anteStakeOptionsFor } from "./risk-stakes.js";

/** Parse per-hand ante from a select/input value. */
export function parseAnteAmount(raw) {
  const n = parseFloat(String(raw));
  if (!Number.isFinite(n) || n <= 0) return 1;
  return n;
}

/** Float-safe selected check for ante option values. */
export function anteValueSelected(optionValue, current) {
  return Math.abs(Number(optionValue) - Number(current)) < 0.0001;
}

/**
 * Canonical room ante for Bourré settings + regional tables.
 * @param {number | null | undefined} pendingOverride In-flight local pick before snapshot confirms.
 * @param {number | null | undefined} savedAmount Persisted room bourreSettings.anteAmount.
 */
export function resolveRoomAnteAmount(pendingOverride, savedAmount) {
  if (pendingOverride != null && Number.isFinite(Number(pendingOverride))) {
    return parseAnteAmount(pendingOverride);
  }
  return parseAnteAmount(savedAmount);
}

/** Shared ante dropdown options for both mirrored controls. */
export function anteSelectOptionsForDisplay(current) {
  return anteStakeOptionsFor(parseAnteAmount(current));
}

/** Build <option> HTML for an ante select bound to `current`. */
export function renderAnteSelectOptionsHtml(current, escapeHtml) {
  return anteSelectOptionsForDisplay(current)
    .map(
      (opt) =>
        `<option value="${opt.value}" ${anteValueSelected(opt.value, current) ? "selected" : ""}>${escapeHtml(opt.label)}</option>`,
    )
    .join("");
}

/** Keep a live <select> in sync without re-rendering the whole room panel. */
export function syncAnteSelectToAmount(selectEl, amount) {
  if (!selectEl) return;
  const parsed = parseAnteAmount(amount);
  for (const opt of selectEl.options) {
    if (anteValueSelected(opt.value, parsed)) {
      selectEl.value = opt.value;
      return;
    }
  }
  selectEl.value = String(parsed);
}
