// Firebase configuration — PLACEHOLDER.
//
// Replace the values below with your own Firebase web app config from the
// Firebase console (Project settings → General → Your apps → SDK setup).
// These values are safe to expose in a static, client-side app.
//
// This app is static-friendly (GitHub Pages): the Firebase SDK is loaded from
// the gstatic CDN in auth.js, so no bundler is required.

export const firebaseConfig = {
  apiKey: "AIzaSyCw7L81ETKGmvHo_GAUf_EuHYpfwTML6-c",
  authDomain: "national-bourre-league.firebaseapp.com",
  
  // projectId is kept as a "demo-" project so the local Auth emulator works
  // out of the box. For production, replace it with your real project id.
  projectId: "national-bourre-league",
  appId: "1:693332013350:web:d76621abb03e309aee91e7",
};

// Version of the Firebase Web SDK to load from the CDN.
export const FIREBASE_SDK_VERSION = "12.14.0";

// Local development: when served from localhost we connect to the Firebase
// Auth emulator so you can sign up / sign in without real credentials.
// In production (e.g. GitHub Pages) this is null and the real Firebase Auth
// backend is used.
const isLocalhost =
  typeof location !== "undefined" &&
  (location.hostname === "localhost" || location.hostname === "127.0.0.1");

export const AUTH_EMULATOR_URL = isLocalhost ? "http://127.0.0.1:9099" : null;

// Firestore emulator (local dev only). Port 8088 to avoid clashing with the
// static dev server on 8080. In production this is null and the real Firestore
// backend is used.
export const FIRESTORE_EMULATOR = isLocalhost
  ? { host: "127.0.0.1", port: 8088 }
  : null;
grep -E 'apiKey|authDomain|projectId|appId|measurementId' docs/firebase-config.js
npm install
git status

npm install
git status
curl -s https://booray.win/social/firebase-config.js | grep apiKey

