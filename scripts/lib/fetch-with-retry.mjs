/** Bounded fetch with retry for transient production verification failures. */

export const DEFAULT_FETCH_TIMEOUT_MS = 30000;
export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_BACKOFF_MS = [1000, 2000];

/**
 * @param {unknown} error
 */
export function isRetriableFetchError(error) {
  if (!error) return false;
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") return true;
    if (error.name === "TypeError") return true;
  }
  const cause = /** @type {{ code?: string } | undefined} */ (error)?.cause;
  if (cause?.code) {
    const code = cause.code;
    if (
      code === "ECONNRESET" ||
      code === "ECONNREFUSED" ||
      code === "ETIMEDOUT" ||
      code === "ENOTFOUND" ||
      code === "EAI_AGAIN"
    ) {
      return true;
    }
  }
  return false;
}

/**
 * @param {number} status
 */
export function isRetriableHttpStatus(status) {
  return status >= 500;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} path
 * @param {number} attempts
 * @param {number} maxAttempts
 * @param {number | undefined} status
 * @param {unknown} error
 */
export function formatFetchPathFailure(path, attempts, maxAttempts, status, error) {
  const lines = [
    `Failed to fetch ${path} after ${attempts}/${maxAttempts} attempt(s).`,
    `status=${status ?? "none"}`,
  ];
  if (error instanceof Error) {
    lines.push(`error=${error.name}: ${error.message}`);
  } else if (error != null) {
    lines.push(`error=${String(error)}`);
  }
  return lines.join(" ");
}

export class FetchPathError extends Error {
  /**
   * @param {string} path
   * @param {number} attempts
   * @param {number} maxAttempts
   * @param {number | undefined} status
   * @param {unknown} cause
   */
  constructor(path, attempts, maxAttempts, status, cause) {
    super(formatFetchPathFailure(path, attempts, maxAttempts, status, cause));
    this.name = "FetchPathError";
    this.path = path;
    this.attempts = attempts;
    this.maxAttempts = maxAttempts;
    this.status = status;
    this.cause = cause;
  }
}

/**
 * @typedef {{
 *   timeoutMs?: number;
 *   maxAttempts?: number;
 *   backoffMs?: number[];
 *   fetchImpl?: typeof fetch;
 *   sleepImpl?: (ms: number) => Promise<void>;
 * }} FetchWithRetryOptions
 */

/**
 * Fetch a URL with bounded retry for transient failures.
 *
 * @param {string} url
 * @param {FetchWithRetryOptions} [options]
 * @returns {Promise<{ ok: boolean; status: number; body: string; attempts: number }>}
 */
export async function fetchWithRetry(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const backoffMs = options.backoffMs ?? DEFAULT_BACKOFF_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleepImpl = options.sleepImpl ?? sleep;

  const path = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  })();

  let lastStatus;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchImpl(url, {
        signal: AbortSignal.timeout(timeoutMs),
        redirect: "follow",
        cache: "no-store",
      });
      const body = await res.text();

      if (isRetriableHttpStatus(res.status) && attempt < maxAttempts) {
        lastStatus = res.status;
        lastError = undefined;
        await sleepImpl(backoffMs[attempt - 1] ?? backoffMs[backoffMs.length - 1] ?? 0);
        continue;
      }

      return { ok: res.ok, status: res.status, body, attempts: attempt };
    } catch (error) {
      lastError = error;
      lastStatus = undefined;
      if (attempt < maxAttempts && isRetriableFetchError(error)) {
        await sleepImpl(backoffMs[attempt - 1] ?? backoffMs[backoffMs.length - 1] ?? 0);
        continue;
      }
      throw new FetchPathError(path, attempt, maxAttempts, lastStatus, error);
    }
  }

  throw new FetchPathError(path, maxAttempts, maxAttempts, lastStatus, lastError);
}
