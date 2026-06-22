// US bill denominations — thematic stake labels only, no money movement.
export const RISK_STAKE_OPTIONS = [1, 2, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000];

/** Per-hand ante choices — cents plus bill denominations. Default room ante is $1. */
export const ANTE_STAKE_OPTIONS = [
  { value: 0.01, label: "1 cent ($0.01)" },
  { value: 0.05, label: "5 cents ($0.05)" },
  { value: 0.1, label: "10 cents ($0.10)" },
  { value: 0.25, label: "25 cents ($0.25)" },
  { value: 0.5, label: "50 cents ($0.50)" },
  ...RISK_STAKE_OPTIONS.map((n) => ({
    value: n,
    label: `$${n.toLocaleString("en-US")} ($${n.toFixed(2)})`,
  })),
];

export const DEFAULT_ANTE_AMOUNT = 1;

export function riskStakeOptionsFor(current) {
  const options = [...RISK_STAKE_OPTIONS];
  if (typeof current === "number" && !options.includes(current)) {
    options.push(current);
    options.sort((a, b) => a - b);
  }
  return options;
}

function anteValuesMatch(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.0001;
}

/** Ante dropdown options — includes current value when not in the preset list. */
export function anteStakeOptionsFor(current) {
  const options = [...ANTE_STAKE_OPTIONS];
  const cur = Number(current);
  if (Number.isFinite(cur) && !options.some((o) => anteValuesMatch(o.value, cur))) {
    options.push({
      value: cur,
      label: cur < 1 ? `$${cur.toFixed(2)}` : formatRiskStake(cur),
    });
    options.sort((a, b) => a.value - b.value);
  }
  return options;
}

/** Read-only ante label — single dollar amount, no parenthetical duplicate. */
export function formatAnteStake(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return formatRiskStake(0);
  if (n < 1) return `$${n.toFixed(2)}`;
  return formatRiskStake(n);
}

export function formatRiskStake(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

/** Signed ledger display for session net +/-. */
export function formatNet(amount) {
  const n = Number(amount) || 0;
  if (n > 0) return `+${formatRiskStake(n)}`;
  if (n < 0) return `−${formatRiskStake(Math.abs(n))}`;
  return formatRiskStake(0);
}

/** Next bill denomination up from the current hand stake (cap at max). */
export function nextRiskStake(amount) {
  const idx = RISK_STAKE_OPTIONS.indexOf(amount);
  if (idx >= 0 && idx < RISK_STAKE_OPTIONS.length - 1) {
    return RISK_STAKE_OPTIONS[idx + 1];
  }
  return amount;
}
