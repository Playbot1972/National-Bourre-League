// house-rules.js — room house-rule fields (informational; not scoring logic).

export const HOUSE_RULE_FIELDS = [
  {
    id: "ante",
    label: "Ante",
    hint: "How players post antes each hand.",
  },
  {
    id: "forcedPlay",
    label: "Forced play",
    hint: "When a player must stay in (e.g. dealer on ace trump).",
  },
  {
    id: "ties",
    label: "Ties",
    hint: "What happens when trick counts tie for the pot.",
  },
  {
    id: "dealing",
    label: "Dealing & draw",
    hint: "Deal, trump, and discard/draw limits.",
  },
];

export const DEFAULT_HOUSE_RULES = {
  ante: "Equal ante each hand (set in room Bourré settings)",
  forcedPlay: "Dealer must play when turned trump is an ace",
  ties: "Tie for most tricks — pot carries; no split",
  dealing: "5 cards each; dealer's last card face up is trump · draw up to 4",
};

const MAX_RULE_LENGTH = 400;

/** Trim and fill missing fields from app defaults. */
export function normalizeHouseRules(raw = {}) {
  const out = {};
  for (const { id } of HOUSE_RULE_FIELDS) {
    const val = raw[id];
    out[id] =
      typeof val === "string" && val.trim()
        ? val.trim().slice(0, MAX_RULE_LENGTH)
        : DEFAULT_HOUSE_RULES[id];
  }
  return out;
}

/** Read house-rule textareas from a form root. */
export function readHouseRulesFromForm(root, idPrefix = "house-rule-") {
  const out = {};
  for (const { id } of HOUSE_RULE_FIELDS) {
    const el = root.querySelector(`#${idPrefix}${id}`);
    out[id] = el instanceof HTMLTextAreaElement ? el.value : "";
  }
  return out;
}
