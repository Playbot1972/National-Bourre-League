// Firebase configuration — production web app (national-bourre-league).
// Local dev on localhost still uses Auth + Firestore emulators below.

const isLocalhost =
  typeof location !== "undefined" &&
  (location.hostname === "localhost" || location.hostname === "127.0.0.1");

/** Match `npm run emulators` (--project demo-national-bourre-league) on localhost. */
const firebaseProjectId = isLocalhost
  ? "demo-national-bourre-league"
  : "national-bourre-league";

export const firebaseConfig = {
  apiKey: "AIzaSyCw7L81ETKGmvHo_GAUf_EuHYpfwTML6-c",
  authDomain: "booray.win",
  projectId: firebaseProjectId,
  appId: "1:693332013350:web:d76621abb03e309aee91e7",
};

export const FIREBASE_SDK_VERSION = "12.14.0";

export const AUTH_EMULATOR_URL = isLocalhost ? "http://127.0.0.1:9099" : null;

export const FIRESTORE_EMULATOR = isLocalhost
  ? { host: "127.0.0.1", port: 8088 }
  : null;

/** Route deal/draw/play/settlement through Cloud Functions (required with locked Firestore rules). */
export const SERVER_HAND_AUTHORITY = true;

export const FUNCTIONS_EMULATOR = isLocalhost
  ? { host: "127.0.0.1", port: 5001 }
  : null;
