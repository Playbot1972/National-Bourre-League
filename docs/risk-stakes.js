// US bill denominations — thematic stake labels only, no money movement.
export const RISK_STAKE_OPTIONS = [1, 2, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000];

export function riskStakeOptionsFor(current) {
  const options = [...RISK_STAKE_OPTIONS];
  if (typeof current === "number" && !options.includes(current)) {
    options.push(current);
    options.sort((a, b) => a - b);
  }
  return options;
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
