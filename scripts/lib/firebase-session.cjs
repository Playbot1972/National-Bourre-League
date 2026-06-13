// Load Firebase CLI login session for API scripts (requires: npx firebase login).
const { configstore } = require("firebase-tools/lib/configstore");
const apiv2 = require("firebase-tools/lib/apiv2");
const firebaseAuth = require("firebase-tools/lib/auth");

function initFirebaseSession() {
  const account = firebaseAuth.getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) {
    console.error("Not logged in to Firebase. Run: npx firebase login");
    process.exit(1);
  }
  apiv2.setRefreshToken(account.tokens.refresh_token);
  return account.user.email;
}

module.exports = { initFirebaseSession };
