/**
 * Shared production Firebase web config validation for deploy and native release builds.
 */

/** @param {string} src */
export function analyzeFirebaseConfig(src) {
  const hasPlaceholderKeys =
    src.includes("REPLACE_WITH_YOUR_API_KEY") ||
    src.includes("REPLACE_WITH_YOUR_APP_ID");

  const hasStaticDemoProjectOnly =
    /export const firebaseConfig\s*=\s*\{[\s\S]*?projectId:\s*["']demo-national-bourre-league["']/.test(
      src,
    );

  const missingApiKey =
    /apiKey:\s*["']\s*["']/.test(src) ||
    /apiKey:\s*["']REPLACE_/.test(src);

  const missingAppId =
    /appId:\s*["']\s*["']/.test(src) ||
    /appId:\s*["']REPLACE_/.test(src);

  const reasons = [];
  if (hasPlaceholderKeys) reasons.push("placeholder API key or app ID markers");
  if (hasStaticDemoProjectOnly) reasons.push("firebaseConfig.projectId is demo-national-bourre-league");
  if (missingApiKey) reasons.push("firebaseConfig.apiKey is empty or placeholder");
  if (missingAppId) reasons.push("firebaseConfig.appId is empty or placeholder");

  return {
    isProductionReady: reasons.length === 0,
    reasons,
  };
}

/**
 * @param {string} src
 * @param {{ label?: string }} [options]
 */
export function assertProductionFirebaseConfig(src, options = {}) {
  const label = options.label ?? "docs/firebase-config.js";
  const { isProductionReady, reasons } = analyzeFirebaseConfig(src);
  if (isProductionReady) return;

  const detail = reasons.join("; ");
  const err = new Error(
    `${label} is not production-ready (${detail}).\n` +
      "Provide Firebase web keys via .env.firebase or export FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_APP_ID, then run:\n" +
      "  node scripts/ensure-firebase-config.js\n" +
      "Or: npm run setup:webapp -- national-bourre-league booray.win",
  );
  err.code = "FIREBASE_CONFIG_PLACEHOLDER";
  throw err;
}
