// Firebase configuration — PLACEHOLDER.
//
// Replace the values below with your own Firebase web app config from the
// Firebase console (Project settings → General → Your apps → SDK setup).
// These values are safe to expose in a static, client-side app.
//
// This app is static-friendly (GitHub Pages): the Firebase SDK is loaded from
// the gstatic CDN in auth.js, so no bundler is required.

export const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  // projectId is kept as a "demo-" project so the local Auth emulator works
  // out of the box. For production, replace it with your real project id.
  projectId: "demo-national-bourre-league",
  appId: "REPLACE_WITH_YOUR_APP_ID",
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
