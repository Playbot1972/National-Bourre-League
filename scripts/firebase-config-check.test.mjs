import assert from "node:assert/strict";
import { analyzeFirebaseConfig } from "./lib/firebase-config-check.mjs";

const productionLike = `
export const firebaseConfig = {
  apiKey: "AIzaSyCw7L81ETKGmvHo_GAUf_EuHYpfwTML6-c",
  authDomain: "booray.win",
  projectId: "national-bourre-league",
  appId: "1:693332013350:web:d76621abb03e309aee91e7",
};

/** Match npm run emulators (--project demo-national-bourre-league) in dev. */
const firebaseProjectId = useEmulators
  ? "demo-national-bourre-league"
  : "national-bourre-league";
`;

assert.equal(
  analyzeFirebaseConfig(productionLike).isProductionReady,
  true,
  "demo project id in emulator branch must not fail production check",
);

const placeholderKeys = `
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "booray.win",
  projectId: "national-bourre-league",
  appId: "REPLACE_WITH_YOUR_APP_ID",
};
`;
assert.equal(analyzeFirebaseConfig(placeholderKeys).isProductionReady, false);

const demoOnly = `
export const firebaseConfig = {
  apiKey: "test",
  authDomain: "localhost",
  projectId: "demo-national-bourre-league",
  appId: "1:123:web:abc",
};
`;
assert.equal(analyzeFirebaseConfig(demoOnly).isProductionReady, false);

console.log("firebase-config-check.test.mjs: ok");
