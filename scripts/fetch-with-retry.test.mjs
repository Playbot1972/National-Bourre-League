import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_BACKOFF_MS,
  DEFAULT_FETCH_TIMEOUT_MS,
  DEFAULT_MAX_ATTEMPTS,
  FetchPathError,
  fetchWithRetry,
  formatFetchPathFailure,
  isRetriableFetchError,
  isRetriableHttpStatus,
} from "./lib/fetch-with-retry.mjs";

describe("isRetriableFetchError", () => {
  it("retries timeout and abort errors", () => {
    assert.equal(isRetriableFetchError(new DOMException("timed out", "TimeoutError")), true);
    assert.equal(isRetriableFetchError(Object.assign(new Error("aborted"), { name: "AbortError" })), true);
  });

  it("retries network TypeError failures", () => {
    assert.equal(isRetriableFetchError(new TypeError("fetch failed")), true);
  });

  it("does not retry arbitrary errors", () => {
    assert.equal(isRetriableFetchError(new Error("bad config")), false);
  });
});

describe("isRetriableHttpStatus", () => {
  it("retries 5xx only", () => {
    assert.equal(isRetriableHttpStatus(500), true);
    assert.equal(isRetriableHttpStatus(503), true);
    assert.equal(isRetriableHttpStatus(404), false);
    assert.equal(isRetriableHttpStatus(200), false);
  });
});

describe("fetchWithRetry", () => {
  it("returns on first successful response", async () => {
    let calls = 0;
    const result = await fetchWithRetry("https://example.test/social/firebase-config.js", {
      maxAttempts: 3,
      backoffMs: [0, 0],
      timeoutMs: 1000,
      sleepImpl: async () => {},
      fetchImpl: async () => {
        calls += 1;
        return {
          ok: true,
          status: 200,
          text: async () => "ok",
        };
      },
    });
    assert.equal(calls, 1);
    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    assert.equal(result.body, "ok");
    assert.equal(result.attempts, 1);
  });

  it("retries transient timeout then succeeds", async () => {
    let calls = 0;
    const sleeps = [];
    const result = await fetchWithRetry("https://example.test/social/firebase-config.js", {
      maxAttempts: 3,
      backoffMs: [10, 20],
      timeoutMs: 1000,
      sleepImpl: async (ms) => {
        sleeps.push(ms);
      },
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          throw new DOMException("timed out", "TimeoutError");
        }
        return {
          ok: true,
          status: 200,
          text: async () => "firebase-config",
        };
      },
    });
    assert.equal(calls, 2);
    assert.deepEqual(sleeps, [10]);
    assert.equal(result.body, "firebase-config");
    assert.equal(result.attempts, 2);
  });

  it("retries HTTP 503 then succeeds", async () => {
    let calls = 0;
    const result = await fetchWithRetry("https://example.test/social/firebase-config.js", {
      maxAttempts: 3,
      backoffMs: [0, 0],
      timeoutMs: 1000,
      sleepImpl: async () => {},
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return {
            ok: false,
            status: 503,
            text: async () => "upstream error",
          };
        }
        return {
          ok: true,
          status: 200,
          text: async () => "ok",
        };
      },
    });
    assert.equal(calls, 2);
    assert.equal(result.status, 200);
    assert.equal(result.attempts, 2);
  });

  it("does not retry HTTP 404", async () => {
    let calls = 0;
    const result = await fetchWithRetry("https://example.test/missing.js", {
      maxAttempts: 3,
      backoffMs: [0, 0],
      timeoutMs: 1000,
      sleepImpl: async () => {},
      fetchImpl: async () => {
        calls += 1;
        return {
          ok: false,
          status: 404,
          text: async () => "not found",
        };
      },
    });
    assert.equal(calls, 1);
    assert.equal(result.ok, false);
    assert.equal(result.status, 404);
    assert.equal(result.body, "not found");
  });

  it("throws FetchPathError with attempt details after exhausting retries", async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        fetchWithRetry("https://example.test/social/firebase-config.js", {
          maxAttempts: 3,
          backoffMs: [0, 0],
          timeoutMs: 1000,
          sleepImpl: async () => {},
          fetchImpl: async () => {
            calls += 1;
            throw new DOMException("timed out", "TimeoutError");
          },
        }),
      (error) => {
        assert.ok(error instanceof FetchPathError);
        assert.equal(error.path, "/social/firebase-config.js");
        assert.equal(error.attempts, 3);
        assert.equal(error.maxAttempts, 3);
        assert.match(error.message, /Failed to fetch \/social\/firebase-config\.js after 3\/3 attempt\(s\)/);
        assert.match(error.message, /TimeoutError/);
        return true;
      },
    );
    assert.equal(calls, 3);
  });

  it("uses bounded defaults that cannot exceed three attempts", () => {
    assert.equal(DEFAULT_MAX_ATTEMPTS, 3);
    assert.deepEqual(DEFAULT_BACKOFF_MS, [1000, 2000]);
    assert.equal(DEFAULT_FETCH_TIMEOUT_MS, 30000);
    const worstCaseMs =
      DEFAULT_MAX_ATTEMPTS * DEFAULT_FETCH_TIMEOUT_MS +
      DEFAULT_BACKOFF_MS.reduce((sum, ms) => sum + ms, 0);
    assert.ok(worstCaseMs < 120000, "retry window must stay bounded below two minutes per path");
  });
});

describe("formatFetchPathFailure", () => {
  it("includes path, attempts, status, and error name", () => {
    const message = formatFetchPathFailure(
      "/social/firebase-config.js",
      3,
      3,
      undefined,
      new DOMException("timed out", "TimeoutError"),
    );
    assert.match(message, /\/social\/firebase-config\.js/);
    assert.match(message, /3\/3 attempt/);
    assert.match(message, /status=none/);
    assert.match(message, /TimeoutError/);
  });
});
