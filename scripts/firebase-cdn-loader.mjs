/**
 * Redirect docs/* Firebase CDN dynamic imports to the local npm firebase package.
 * Preload with: node --import ./scripts/firebase-cdn-loader.mjs …
 */
import { register } from "node:module";

const CDN_PREFIX = "https://www.gstatic.com/firebasejs/";

const MODULE_MAP = {
  "firebase-app.js": "firebase/app",
  "firebase-auth.js": "firebase/auth",
  "firebase-firestore.js": "firebase/firestore",
  "firebase-functions.js": "firebase/functions",
};

register("./firebase-cdn-resolve.mjs", import.meta.url);
