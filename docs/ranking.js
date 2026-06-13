// ranking.js — TrueSkill-inspired skill ranking ("Ape Score").
//
// Entertainment / skill-only. This module is pure (no Firebase, no DOM) so it is
// easy to test and reuse. Nothing here relates to money, payouts, or rewards.
//
// ===========================================================================
// MODEL
// ===========================================================================
// Each player carries a Gaussian skill belief:
//   mu            — estimated skill (mean)
//   sigma         — uncertainty (standard deviation)
//   matchesPlayed — number of completed sessions counted
//
// New players start at:
//   mu = 25,  sigma = 25 / 3  (≈ 8.333)
//
// PUBLIC APE SCORE (the conservative, shown-to-users number):
//   apeScore = round( max(0, mu - 3 * sigma) )
// i.e. we only "credit" skill we are confident about (mu minus 3 std-devs).
// A brand-new player therefore starts at round(max(0, 25 - 3*8.333)) = 0 and
// climbs as mu rises and sigma (uncertainty) shrinks with more matches.
//
// ===========================================================================
// UPDATE (TrueSkill concepts, multiplayer free-for-all)
// ===========================================================================
// A Bourré session is a multiplayer match. Players are ranked by tricks won
// (more tricks = better placement; equal tricks = a draw/tie).
//
// We use the standard TrueSkill 2-player update equations and extend them to N
// players by averaging each player's update across all pairwise comparisons
// with the rest of the table (a well-known, stable TrueSkill approximation):
//
//   c   = sqrt(2*BETA^2 + sigma_i^2 + sigma_j^2)
//   t   = (mu_winner - mu_loser) / c
//   v(t)= pdf(t) / cdf(t)          (mean-shift multiplier for a win/loss)
//   w(t)= v(t) * (v(t) + t)        (variance-shrink multiplier)
//   mu     += sign * (sigma^2 / c) * v
//   sigma^2 *= (1 - (sigma^2 / c^2) * w)
//
// Draws use the symmetric vDraw/wDraw functions with a draw margin epsilon.
// Before each match we inflate sigma by TAU (dynamics) so skill can keep moving.
//
// Constants follow the TrueSkill defaults scaled to mu0 = 25.
// ===========================================================================

export const INITIAL_MU = 25;
export const INITIAL_SIGMA = 25 / 3; // ≈ 8.3333
export const BETA = 25 / 6; // ≈ 4.1667 — skill-class width
export const TAU = 25 / 300; // ≈ 0.0833 — additive dynamics per match
export const DRAW_PROBABILITY = 0.1;
const MIN_SIGMA = 0.5; // floor so uncertainty never collapses to 0

// Ape Status thresholds.
const PROVISIONAL_MATCHES = 5; // < 5 matches → still figuring you out
const LOCKED_MATCHES = 10; // established sample size
const LOCKED_SIGMA = 4.0; // low-uncertainty threshold

export function newRating() {
  return { mu: INITIAL_MU, sigma: INITIAL_SIGMA, matchesPlayed: 0 };
}

// ----- Public score + labels ----------------------------------------------

/** Conservative public score: round(max(0, mu - 3*sigma)). */
export function apeScore(rating) {
  return Math.round(Math.max(0, rating.mu - 3 * rating.sigma));
}

/** Ape Class tier from the public Ape Score. */
export function apeClass(score) {
  if (score >= 25) return "Silverback";
  if (score >= 20) return "Gorilla";
  if (score >= 15) return "Orangutan";
  if (score >= 10) return "Chimp";
  if (score >= 5) return "Bonobo";
  return "Gibbon";
}

/**
 * Ape Status from sample size + uncertainty:
 *   Provisional  — new players (few matches)
 *   Heating Up   — mid-sample players
 *   Locked In    — established players with low uncertainty
 */
export function apeStatus(rating) {
  if (rating.matchesPlayed < PROVISIONAL_MATCHES) return "Provisional";
  if (rating.matchesPlayed >= LOCKED_MATCHES && rating.sigma <= LOCKED_SIGMA) {
    return "Locked In";
  }
  return "Heating Up";
}

// ----- Gaussian helpers -----------------------------------------------------

function pdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Abramowitz & Stegun 7.1.26 error-function approximation.
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

function cdf(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

// Acklam's inverse normal CDF approximation (for the draw margin).
function inverseCdf(p) {
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q;
  let r;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= phigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

// v/w for a win (loser perspective uses -t); guarded against tail underflow.
function vWin(t) {
  const denom = cdf(t);
  if (denom < 1e-9) return -t; // extreme upset; clamp
  return pdf(t) / denom;
}
function wWin(t) {
  const v = vWin(t);
  return v * (v + t);
}

// v/w for a draw, with draw margin eps.
function vDraw(t, eps) {
  const denom = cdf(eps - t) - cdf(-eps - t);
  if (denom < 1e-9) return t < 0 ? -t - eps : -t + eps;
  return (pdf(-eps - t) - pdf(eps - t)) / denom;
}
function wDraw(t, eps) {
  const denom = cdf(eps - t) - cdf(-eps - t);
  if (denom < 1e-9) return 1;
  const v = vDraw(t, eps);
  return (
    v * v +
    ((eps - t) * pdf(eps - t) - (-eps - t) * pdf(-eps - t)) / denom
  );
}

function drawMargin(drawProbability, beta) {
  // Two participants per pairwise comparison → sqrt(1 + 1) = sqrt(2).
  return inverseCdf(0.5 * (drawProbability + 1)) * Math.SQRT2 * beta;
}

// ----- Multiplayer update ---------------------------------------------------

/**
 * Rank a completed multiplayer session and return updated ratings.
 *
 * @param {{id:string, displayName?:string, rating:{mu:number,sigma:number,matchesPlayed:number}, score:number}[]} players
 *        score = tricks won (higher is better).
 * @returns {{id:string, displayName?:string, placement:number,
 *            mu:number, sigma:number, matchesPlayed:number,
 *            apeScore:number, momentum:number}[]}
 *        momentum = new Ape Score − previous Ape Score.
 */
export function rankMatch(players) {
  const n = players.length;
  const eps = drawMargin(DRAW_PROBABILITY, BETA);

  // Placement: 1 = best. Equal score = same placement (a draw).
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const placementOf = new Map();
  sorted.forEach((p, i) => {
    if (i > 0 && p.score === sorted[i - 1].score) {
      placementOf.set(p.id, placementOf.get(sorted[i - 1].id));
    } else {
      placementOf.set(p.id, i + 1);
    }
  });

  // Pre-inflate sigma by the dynamics factor (skill drifts over time).
  const pre = players.map((p) => {
    const r = p.rating || newRating();
    return {
      ...p,
      mu: r.mu,
      sigma: Math.sqrt(r.sigma * r.sigma + TAU * TAU),
      matchesPlayed: r.matchesPlayed || 0,
      prevApeScore: apeScore(r),
      placement: placementOf.get(p.id),
    };
  });

  return pre.map((p) => {
    if (n < 2) {
      // Solo session: only the dynamics inflation applies; no comparison.
      const rating = { mu: p.mu, sigma: clampSigma(p.sigma), matchesPlayed: p.matchesPlayed + 1 };
      const score = apeScore(rating);
      return result(p, rating, score);
    }

    let sumDeltaMu = 0;
    let sumShrink = 0;
    let count = 0;

    for (const o of pre) {
      if (o.id === p.id) continue;
      const c = Math.sqrt(2 * BETA * BETA + p.sigma * p.sigma + o.sigma * o.sigma);
      let dMu;
      let shrink;
      if (p.placement < o.placement) {
        // p won this pairing
        const t = (p.mu - o.mu) / c;
        dMu = (p.sigma * p.sigma / c) * vWin(t);
        shrink = (p.sigma * p.sigma / (c * c)) * wWin(t);
      } else if (p.placement > o.placement) {
        // p lost this pairing
        const t = (o.mu - p.mu) / c;
        dMu = -(p.sigma * p.sigma / c) * vWin(t);
        shrink = (p.sigma * p.sigma / (c * c)) * wWin(t);
      } else {
        // draw
        const t = (p.mu - o.mu) / c;
        dMu = (p.sigma * p.sigma / c) * vDraw(t, eps);
        shrink = (p.sigma * p.sigma / (c * c)) * wDraw(t, eps);
      }
      sumDeltaMu += dMu;
      sumShrink += shrink;
      count += 1;
    }

    const newMu = p.mu + sumDeltaMu / count;
    const shrinkFactor = Math.max(0.0001, 1 - sumShrink / count);
    const newSigma = clampSigma(Math.sqrt(p.sigma * p.sigma * shrinkFactor));
    const rating = { mu: newMu, sigma: newSigma, matchesPlayed: p.matchesPlayed + 1 };
    return result(p, rating, apeScore(rating));
  });
}

function clampSigma(s) {
  return Math.max(MIN_SIGMA, s);
}

function result(p, rating, score) {
  return {
    id: p.id,
    displayName: p.displayName,
    placement: p.placement,
    mu: rating.mu,
    sigma: rating.sigma,
    matchesPlayed: rating.matchesPlayed,
    apeScore: score,
    momentum: score - p.prevApeScore,
  };
}
