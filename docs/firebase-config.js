// Firebase configuration — production web app (national-bourre-league).
// Local dev uses Auth + Firestore + Functions emulators (see useFirebaseEmulators below).

const PRODUCTION_HOSTS = new Set([
  "booray.win",
  "www.booray.win",
  "national-bourre-league.firebaseapp.com",
  "national-bourre-league.web.app",
]);

function isLoopbackHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isCapacitorNative() {
  try {
    return typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
}

/** Opt-in when the page is served on a forwarded dev host (not loopback). */
function emulatorOptInFromPage() {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage?.getItem("nbl-emulators") === "1") return true;
    return new URLSearchParams(window.location.search).has("emulators");
  } catch {
    return false;
  }
}

/**
 * Use Firebase emulators when:
 * - loopback (localhost / 127.0.0.1), or
 * - ?emulators=1 / localStorage nbl-emulators=1, or
 * - social dev port 8080 on a non-production host (VM port-forward, e.g. Cursor cloud).
 */
export function useFirebaseEmulators() {
  if (typeof location === "undefined") return false;
  // Capacitor serves the bundle from https://localhost — not a dev emulator session.
  if (isCapacitorNative()) return false;
  const host = location.hostname.toLowerCase();
  if (isLoopbackHost(host)) return true;
  if (emulatorOptInFromPage()) return true;
  if (
    location.port === "8080" &&
    !PRODUCTION_HOSTS.has(host) &&
    !host.endsWith(".firebaseapp.com") &&
    !host.endsWith(".web.app")
  ) {
    return true;
  }
  return false;
}

/** Emulator services bind to loopback on the machine running `npm run emulators`. */
function resolveEmulatorHost() {
  if (typeof location === "undefined") return "127.0.0.1";
  const host = location.hostname.toLowerCase();
  return isLoopbackHost(host) ? "127.0.0.1" : host;
}

const useEmulators = useFirebaseEmulators();
const emulatorHost = resolveEmulatorHost();

/** Match `npm run emulators` (--project demo-national-bourre-league) in dev. */
const firebaseProjectId = useEmulators
  ? "demo-national-bourre-league"
  : "national-bourre-league";

export const firebaseConfig = {
  apiKey: "AIzaSyCw7L81ETKGmvHo_GAUf_EuHYpfwTML6-c",
  authDomain: "booray.win",
  projectId: firebaseProjectId,
  appId: "1:693332013350:web:d76621abb03e309aee91e7",
};

export const FIREBASE_SDK_VERSION = "12.14.0";

export const AUTH_EMULATOR_URL = useEmulators
  ? `http://${emulatorHost}:9099`
  : null;

export const FIRESTORE_EMULATOR = useEmulators
  ? { host: emulatorHost, port: 8088 }
  : null;

/** Route deal/draw/play/settlement through Cloud Functions (required with locked Firestore rules). */
export const SERVER_HAND_AUTHORITY = true;

export const FUNCTIONS_EMULATOR = useEmulators
  ? { host: emulatorHost, port: 5001 }
  : null;

if (typeof location !== "undefined" && location.port === "8080" && !useEmulators) {
  console.warn(
    "[nbl-dev] Port 8080 but Firebase emulators are off — open http://localhost:8080 or add ?emulators=1",
  );
} else if (useEmulators && typeof console !== "undefined") {
  console.info("[nbl-dev] Firebase emulators", {
    projectId: firebaseProjectId,
    auth: AUTH_EMULATOR_URL,
    firestore: FIRESTORE_EMULATOR,
    functions: FUNCTIONS_EMULATOR,
  });
}
