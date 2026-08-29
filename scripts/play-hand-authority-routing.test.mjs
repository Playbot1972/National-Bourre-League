/**
 * Server-authoritative play-card routing — no client Firestore fallback in production.
 * Run: node --test scripts/play-hand-authority-routing.test.mjs
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  PLAY_CARD_NOT_PLAYED_MESSAGE,
  enrichPlayHandCardError,
  formatPlayHandCardClientError,
  isCallableTransportUnavailable,
  isLegacyClientPlayEnabled,
  routePlayHandCard,
} from "../docs/game-play-routing.js";
import {
  isTablePlayDebugEnabled,
  logTablePlayDebug,
  sanitizeTablePlayDebugPayload,
} from "../docs/table-play-debug.js";

function makeErr(code, message = code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function baseRouteInput(overrides = {}) {
  const calls = { client: false, server: false };
  const debugLogs = [];
  const input = {
    roomId: "room-1",
    sessionId: "session-1",
    playerId: "human-1",
    cardIndex: 2,
    actorId: "human-1",
    serverHandAuthority: true,
    firestoreEmulator: "127.0.0.1:8088",
    legacyClientPlayFlag: null,
    serverFn: async () => {
      calls.server = true;
      return { ok: true, source: "server" };
    },
    clientFn: async () => {
      calls.client = true;
      return { ok: true, source: "client" };
    },
    logPlayDebug: (payload) => debugLogs.push(payload),
    ...overrides,
  };
  return { input, calls, debugLogs };
}

describe("isCallableTransportUnavailable", () => {
  it("treats genuine transport failures as unavailable", () => {
    assert.equal(isCallableTransportUnavailable(makeErr("functions/unavailable")), true);
    assert.equal(isCallableTransportUnavailable(makeErr("functions/deadline-exceeded")), true);
    assert.equal(isCallableTransportUnavailable(makeErr("functions/not-found")), true);
    assert.equal(isCallableTransportUnavailable(new Error("Failed to fetch")), true);
    assert.equal(isCallableTransportUnavailable(new Error("network error")), true);
  });

  it("does not treat internal or auth/precondition errors as transport unavailable", () => {
    assert.equal(isCallableTransportUnavailable(makeErr("functions/internal")), false);
    assert.equal(isCallableTransportUnavailable(new Error("Something internal broke")), false);
    assert.equal(isCallableTransportUnavailable(makeErr("functions/failed-precondition")), false);
    assert.equal(isCallableTransportUnavailable(makeErr("functions/permission-denied")), false);
    assert.equal(isCallableTransportUnavailable(makeErr("functions/unauthenticated")), false);
  });
});

describe("routePlayHandCard — server authority", () => {
  it("returns server result on success without client fallback", async () => {
    const { input, calls } = baseRouteInput();
    const result = await routePlayHandCard(input);
    assert.equal(result?.source, "server");
    assert.equal(calls.server, true);
    assert.equal(calls.client, false);
  });

  it("never calls client fallback on functions/internal", async () => {
    const { input, calls } = baseRouteInput({
      serverFn: async () => {
        throw makeErr("functions/internal", "INTERNAL");
      },
    });
    await assert.rejects(() => routePlayHandCard(input), (err) => {
      assert.equal(err.serverPlayAuthorityFailure, true);
      return true;
    });
    assert.equal(calls.client, false);
  });

  it("never calls client fallback on functions/failed-precondition", async () => {
    const { input, calls } = baseRouteInput({
      serverFn: async () => {
        throw makeErr("functions/failed-precondition", "Not your turn");
      },
    });
    await assert.rejects(() => routePlayHandCard(input), (err) => {
      assert.equal(err.serverPlayAuthorityFailure, true);
      return true;
    });
    assert.equal(calls.client, false);
  });

  it("never calls client fallback on functions/unavailable", async () => {
    const { input, calls } = baseRouteInput({
      serverFn: async () => {
        throw makeErr("functions/unavailable");
      },
    });
    await assert.rejects(() => routePlayHandCard(input));
    assert.equal(calls.client, false);
  });

  it("never calls client fallback on network/failed-fetch errors", async () => {
    const { input, calls } = baseRouteInput({
      serverFn: async () => {
        throw new Error("Failed to fetch");
      },
    });
    await assert.rejects(() => routePlayHandCard(input));
    assert.equal(calls.client, false);
  });

  it("logs callable-start, callable-reject, and fallback-disabled on failure", async () => {
    const { input, debugLogs } = baseRouteInput({
      serverFn: async () => {
        throw makeErr("functions/internal");
      },
    });
    await assert.rejects(() => routePlayHandCard(input));
    const events = debugLogs.map((e) => e.event);
    assert.ok(events.includes("callable-start"));
    assert.ok(events.includes("callable-reject"));
    assert.ok(events.includes("fallback-disabled"));
    assert.equal(debugLogs.every((e) => e.fallbackAttempted === false), true);
  });
});

describe("routePlayHandCard — legacy client mode", () => {
  it("does not call client play when authority is off and legacy flag is off", async () => {
    const { input, calls } = baseRouteInput({
      serverHandAuthority: false,
      legacyClientPlayFlag: null,
    });
    await assert.rejects(() => routePlayHandCard(input), (err) => {
      assert.equal(err.serverPlayAuthorityFailure, true);
      return true;
    });
    assert.equal(calls.client, false);
  });

  it("permits legacy client play only with explicit emulator + flag", async () => {
    assert.equal(
      isLegacyClientPlayEnabled({
        serverHandAuthority: false,
        firestoreEmulator: "127.0.0.1:8088",
        legacyClientPlayFlag: "1",
      }),
      true,
    );
    const { input, calls } = baseRouteInput({
      serverHandAuthority: false,
      legacyClientPlayFlag: "1",
    });
    const result = await routePlayHandCard(input);
    assert.equal(result?.source, "client");
    assert.equal(calls.client, true);
  });

  it("does not permit legacy client play in production-like config", async () => {
    assert.equal(
      isLegacyClientPlayEnabled({
        serverHandAuthority: true,
        firestoreEmulator: null,
        legacyClientPlayFlag: "1",
      }),
      false,
    );
  });
});

describe("formatPlayHandCardClientError", () => {
  const format = (err, fb) => {
    const code = String(err?.code ?? "");
    if (code === "functions/failed-precondition") return err.message;
    if (code === "functions/internal") {
      return "The server could not finish that table action. Refresh the page and try again.";
    }
    return fb;
  };

  it("uses not-played message for internal and transport failures", () => {
    assert.equal(
      formatPlayHandCardClientError(makeErr("functions/internal"), format),
      PLAY_CARD_NOT_PLAYED_MESSAGE,
    );
    assert.equal(
      formatPlayHandCardClientError(makeErr("functions/unavailable"), format),
      PLAY_CARD_NOT_PLAYED_MESSAGE,
    );
  });

  it("preserves friendly mapping for structured server errors", () => {
    assert.equal(
      formatPlayHandCardClientError(
        makeErr("functions/failed-precondition", "Not your turn"),
        format,
      ),
      "Not your turn",
    );
  });
});

describe("table play debug logging", () => {
  const originalGetItem = globalThis.localStorage?.getItem?.bind(globalThis.localStorage);
  const originalInfo = console.info;

  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, String(value));
      },
      removeItem: (key) => {
        store.delete(key);
      },
    };
    console.info = () => {};
  });

  afterEach(() => {
    if (originalGetItem) {
      globalThis.localStorage.getItem = originalGetItem;
    }
    console.info = originalInfo;
  });

  it("does not log when debug flag is off", () => {
    let called = false;
    console.info = () => {
      called = true;
    };
    logTablePlayDebug({
      event: "tap",
      roomId: "room-1",
      cards: [{ rank: "A", suit: "spades" }],
      privateHand: ["secret"],
    });
    assert.equal(called, false);
    assert.equal(isTablePlayDebugEnabled(), false);
  });

  it("logs metadata only when debug flag is on", () => {
    localStorage.setItem("nbl-table-play-debug", "1");
    assert.equal(isTablePlayDebugEnabled(), true);
    let payload = null;
    console.info = (_label, data) => {
      payload = data;
    };
    logTablePlayDebug({
      event: "tap",
      roomId: "room-1",
      sessionId: "session-1",
      displayIndex: 1,
      cards: [{ rank: "A", suit: "spades" }],
      privateHand: ["secret"],
      deckSeed: 12345,
      token: "abc",
    });
    assert.equal(payload?.event, "tap");
    assert.equal(payload?.roomId, "room-1");
    assert.equal(payload?.displayIndex, 1);
    assert.equal(payload?.cards, undefined);
    assert.equal(payload?.privateHand, undefined);
    assert.equal(payload?.deckSeed, undefined);
    assert.equal(payload?.token, undefined);
    const sanitized = sanitizeTablePlayDebugPayload({
      rank: "A",
      suit: "spades",
      event: "callable-reject",
      errorCode: "functions/internal",
    });
    assert.equal(sanitized.event, "callable-reject");
    assert.equal(sanitized.rank, undefined);
    assert.equal(sanitized.suit, undefined);
  });
});

describe("playHandCard static routing contract", () => {
  it("routes through routePlayHandCard without callGameServerOrClient fallback", () => {
    const src = readFileSync(
      fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
      "utf8",
    );
    const fnStart = src.indexOf("export async function playHandCard");
    assert.ok(fnStart >= 0);
    const fnBody = src.slice(fnStart, fnStart + 600);
    assert.match(fnBody, /routePlayHandCard\(/);
    assert.doesNotMatch(fnBody, /callGameServerOrClient\(/);
    assert.doesNotMatch(fnBody, /isCloudFunctionUnavailable/);
    assert.match(fnBody, /clientFn:\s*\(\)\s*=>\s*playHandCardClient/);
    const routeSrc = readFileSync(
      fileURLToPath(new URL("../docs/game-play-routing.js", import.meta.url)),
      "utf8",
    );
    const authorityBranch = routeSrc.slice(
      routeSrc.indexOf("if (serverHandAuthority === true)"),
      routeSrc.indexOf("if (\n    isLegacyClientPlayEnabled"),
    );
    assert.doesNotMatch(authorityBranch, /clientFn\(/);
  });

  it("enrichPlayHandCardError marks server authority failures", () => {
    const err = enrichPlayHandCardError(makeErr("functions/internal"));
    assert.equal(err.serverPlayAuthorityFailure, true);
  });
});
