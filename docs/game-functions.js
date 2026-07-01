// game-functions.js — Callable Cloud Functions client for server-authoritative play.

import { app } from "./auth.js";
import {
  FIREBASE_SDK_VERSION,
  FUNCTIONS_EMULATOR,
  SERVER_HAND_AUTHORITY,
} from "./firebase-config.js";

const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

let functionsInstance = null;
let initPromise = null;

async function getFunctionsInstance() {
  if (!SERVER_HAND_AUTHORITY) return null;
  if (functionsInstance) return functionsInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const { getFunctions, connectFunctionsEmulator } = await import(
        `${CDN}/firebase-functions.js`
      );
      functionsInstance = getFunctions(app);
      if (FUNCTIONS_EMULATOR) {
        try {
          connectFunctionsEmulator(
            functionsInstance,
            FUNCTIONS_EMULATOR.host,
            FUNCTIONS_EMULATOR.port,
          );
        } catch (err) {
          console.warn("Could not connect to Functions emulator:", err);
        }
      }
      return functionsInstance;
    })();
  }
  return initPromise;
}

function logCallableFailure(name, data, err) {
  const payload = {
    function: name,
    roomId: data?.roomId ?? null,
    sessionId: data?.sessionId ?? null,
    code: err?.code ?? null,
    message: err?.message ?? String(err),
    details: err?.details ?? null,
  };
  if (payload.code === "functions/permission-denied" || /403|forbidden/i.test(payload.message)) {
    console.error(
      "[game-functions] Callable blocked before handler — likely missing Cloud Run invoker on",
      name,
      payload,
    );
  } else {
    console.warn("[game-functions] Callable failed:", payload);
  }
}

async function callGame(name, data) {
  const functions = await getFunctionsInstance();
  if (!functions) {
    throw new Error("Server hand authority is disabled");
  }
  const { httpsCallable } = await import(`${CDN}/firebase-functions.js`);
  const fn = httpsCallable(functions, name);
  try {
    const result = await fn(data);
    return result.data;
  } catch (err) {
    logCallableFailure(name, data, err);
    throw err;
  }
}

export function isServerHandAuthorityEnabled() {
  return SERVER_HAND_AUTHORITY === true;
}

export function gameEnsureHandEnrollment(roomId, sessionId) {
  return callGame("gameEnsureHandEnrollment", { roomId, sessionId });
}

export function gameTimeoutEnrollment(roomId, sessionId) {
  return callGame("gameTimeoutEnrollment", { roomId, sessionId });
}

export function gameAdvanceHandReveal(roomId, sessionId) {
  return callGame("gameAdvanceHandReveal", { roomId, sessionId });
}

export function gameSetHandParticipation(roomId, sessionId, payload) {
  return callGame("gameSetHandParticipation", { roomId, sessionId, ...payload });
}

export function gameSubmitDraw(roomId, sessionId, payload) {
  return callGame("gameSubmitDraw", { roomId, sessionId, ...payload });
}

export function gameFoldDraw(roomId, sessionId, payload) {
  return callGame("gameFoldDraw", { roomId, sessionId, ...payload });
}

export function gamePlayCard(roomId, sessionId, payload) {
  return callGame("gamePlayCard", { roomId, sessionId, ...payload });
}

export function gameRecordHand(roomId, sessionId, payload) {
  return callGame("gameRecordHand", { roomId, sessionId, ...payload });
}

export function gameVoteCoWinSettlement(roomId, sessionId, payload) {
  return callGame("gameVoteCoWinSettlement", { roomId, sessionId, ...payload });
}

export function gameAdvanceBots(roomId, sessionId) {
  return callGame("gameAdvanceBots", { roomId, sessionId });
}
