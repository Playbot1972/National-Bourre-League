/**
 * Server-authoritative play-card routing — no client Firestore fallback in production.
 */

/** Player-facing copy when a server-authority play attempt fails without confirmation. */
export const PLAY_CARD_NOT_PLAYED_MESSAGE =
  "Your card was not played. The table state has not changed.";

/**
 * Genuine transport / connectivity failures only — never server execution errors.
 * @param {unknown} err
 */
export function isCallableTransportUnavailable(err) {
  const code = String(err?.code ?? "");
  if (
    code === "functions/not-found" ||
    code === "functions/unavailable" ||
    code === "functions/deadline-exceeded"
  ) {
    return true;
  }
  const msg = String(err?.message ?? err).toLowerCase();
  if (msg.includes("failed to fetch")) return true;
  if (msg.includes("network error")) return true;
  if (/\b404\b/.test(msg) && msg.includes("not found")) return true;
  return false;
}

/** @deprecated Use isCallableTransportUnavailable — kept for draw/enrollment/settlement callers. */
export function isCloudFunctionUnavailable(err) {
  return isCallableTransportUnavailable(err);
}

/**
 * @param {{ serverHandAuthority?: boolean, firestoreEmulator?: unknown, legacyClientPlayFlag?: string | null }} config
 */
export function isLegacyClientPlayEnabled(config) {
  return (
    config.serverHandAuthority !== true &&
    config.firestoreEmulator != null &&
    config.legacyClientPlayFlag === "1"
  );
}

export function readLegacyClientPlayFlag() {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem("nbl-legacy-client-play");
  } catch {
    return null;
  }
}

/**
 * @param {unknown} err
 * @returns {Error & { serverPlayAuthorityFailure?: boolean }}
 */
export function enrichPlayHandCardError(err) {
  const base = err instanceof Error ? err : new Error(String(err ?? "Play failed"));
  /** @type {Error & { serverPlayAuthorityFailure?: boolean }} */
  const next = base;
  next.serverPlayAuthorityFailure = true;
  return next;
}

const STRUCTURED_PLAY_ERROR_CODES = new Set([
  "functions/failed-precondition",
  "functions/permission-denied",
  "functions/unauthenticated",
]);

/**
 * Player-facing copy for server-authority play failures.
 * @param {unknown} err
 * @param {(err: unknown, fallback: string) => string} formatClientGameError
 */
export function formatPlayHandCardClientError(err, formatClientGameError) {
  const code = String(err?.code ?? "");
  if (STRUCTURED_PLAY_ERROR_CODES.has(code)) {
    return formatClientGameError(err, PLAY_CARD_NOT_PLAYED_MESSAGE);
  }
  if (
    code === "functions/internal" ||
    code === "functions/unknown" ||
    isCallableTransportUnavailable(err)
  ) {
    return PLAY_CARD_NOT_PLAYED_MESSAGE;
  }
  const mapped = formatClientGameError(err, PLAY_CARD_NOT_PLAYED_MESSAGE);
  if (mapped.includes("server could not finish")) {
    return PLAY_CARD_NOT_PLAYED_MESSAGE;
  }
  return mapped || PLAY_CARD_NOT_PLAYED_MESSAGE;
}

/**
 * Route human play: server-only when SERVER_HAND_AUTHORITY is on.
 *
 * @param {object} input
 * @param {string} input.roomId
 * @param {string} input.sessionId
 * @param {string} input.playerId
 * @param {number} input.cardIndex
 * @param {string} input.actorId
 * @param {boolean} input.serverHandAuthority
 * @param {unknown} input.firestoreEmulator
 * @param {string | null} [input.legacyClientPlayFlag]
 * @param {() => Promise<unknown>} input.serverFn
 * @param {() => Promise<unknown>} input.clientFn
 * @param {(payload: object) => void} [input.logPlayDebug]
 */
export async function routePlayHandCard(input) {
  const {
    roomId,
    sessionId,
    playerId,
    cardIndex,
    actorId,
    serverHandAuthority,
    firestoreEmulator,
    legacyClientPlayFlag = readLegacyClientPlayFlag(),
    serverFn,
    clientFn,
    logPlayDebug,
  } = input;

  const baseMeta = {
    roomId,
    sessionId,
    currentUserId: playerId,
    callable: "gamePlayCard",
    displayIndex: cardIndex,
    effectiveIndex: cardIndex,
  };

  if (serverHandAuthority === true) {
    logPlayDebug?.({
      ...baseMeta,
      event: "callable-start",
      fallbackAttempted: false,
    });
    try {
      const result = await serverFn();
      logPlayDebug?.({
        ...baseMeta,
        event: "callable-ok",
        callableStatus: "ok",
        fallbackAttempted: false,
      });
      return result;
    } catch (serverErr) {
      const errorCode = serverErr?.code ?? null;
      logPlayDebug?.({
        ...baseMeta,
        event: "callable-reject",
        callableStatus: "error",
        errorCode,
        fallbackAttempted: false,
      });
      logPlayDebug?.({
        ...baseMeta,
        event: "fallback-disabled",
        errorCode,
        fallbackAttempted: false,
      });
      throw enrichPlayHandCardError(serverErr);
    }
  }

  if (
    isLegacyClientPlayEnabled({
      serverHandAuthority,
      firestoreEmulator,
      legacyClientPlayFlag,
    })
  ) {
    return clientFn();
  }

  throw enrichPlayHandCardError(
    new Error("Server hand authority is required to play cards"),
  );
}
