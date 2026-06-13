#!/usr/bin/env node
/**
 * Option A: Fix Google sign-in redirect_uri_mismatch for a custom domain.
 *
 * 1. Opens Firebase → Authentication → Google provider
 * 2. Fetches your OAuth Web client ID
 * 3. Opens Google Cloud → Credentials → that client
 * 4. Prints exact JavaScript origins + redirect URIs to add
 *
 * Usage:
 *   node scripts/setup-google-oauth.cjs [project-id] [domain] [--open]
 *
 * Requires: npx firebase login (same Google account as Firebase Console)
 */

const { execSync } = require("node:child_process");
const { initFirebaseSession } = require("./lib/firebase-session.cjs");
const {
  buildGoogleOAuthUris,
  firebaseGoogleProviderUrl,
  gcpOAuthClientUrl,
} = require("./lib/google-oauth-uris.cjs");
const firebaseAuth = require("firebase-tools/lib/auth");

const args = process.argv.slice(2).filter((a) => a !== "--open");
const shouldOpen = process.argv.includes("--open");
const projectId = args[0] || "national-bourre-league";
const domain = args[1] || "booray.win";

async function getAccessToken() {
  const account = firebaseAuth.getGlobalDefaultAccount();
  return firebaseAuth.getAccessToken(account.tokens.refresh_token, [
    "https://www.googleapis.com/auth/cloud-platform",
  ]);
}

async function fetchGoogleIdpConfig(projectId) {
  const token = await getAccessToken();
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs/google.com`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.error?.message || res.statusText;
    throw new Error(`Could not read Google sign-in config: ${msg}`);
  }
  return body;
}

async function ensureGoogleSignInEnabled(projectId, config) {
  if (config.enabled) return config;
  const token = await getAccessToken();
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs/google.com?updateMask=enabled`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enabled: true }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log("    ⚠ Could not enable Google sign-in via API — enable it in Firebase Console.");
    return config;
  }
  console.log("    ✓ Google sign-in enabled in Firebase");
  return body;
}

function openUrl(url) {
  try {
    if (process.platform === "darwin") {
      execSync(`open ${JSON.stringify(url)}`);
    } else if (process.platform === "win32") {
      execSync(`start "" ${JSON.stringify(url)}`, { shell: true });
    } else {
      execSync(`xdg-open ${JSON.stringify(url)}`);
    }
    return true;
  } catch {
    return false;
  }
}

function printList(title, items) {
  console.log(`\n${title}`);
  for (const item of items) {
    console.log(`  • ${item}`);
  }
}

async function main() {
  const email = initFirebaseSession();
  const { apex, javascriptOrigins, redirectUris } = buildGoogleOAuthUris(projectId, domain);

  console.log(`==> Firebase account: ${email}`);
  console.log(`==> Project: ${projectId}  Domain: ${apex}\n`);

  console.log("==> Step 1: Firebase → Google sign-in provider (Option A)");
  const firebaseUrl = firebaseGoogleProviderUrl(projectId);
  console.log(`    ${firebaseUrl}`);

  let idp;
  try {
    idp = await fetchGoogleIdpConfig(projectId);
    idp = await ensureGoogleSignInEnabled(projectId, idp);
  } catch (err) {
    console.error(`\n    ${err.message}`);
    console.log("\n    Enable Google in Firebase Console first:");
    console.log(`    ${firebaseUrl}`);
    idp = {};
  }

  const clientId = idp.clientId;
  if (clientId) {
    console.log(`\n    OAuth Web client ID: ${clientId}`);
  } else {
    console.log("\n    Open Firebase Google provider → expand Web SDK configuration for client ID.");
  }

  const gcpUrl = gcpOAuthClientUrl(projectId, clientId);
  console.log("\n==> Step 2: Google Cloud → OAuth Web client");
  console.log(`    ${gcpUrl}`);

  printList(
    "    Add these Authorized JavaScript origins (keep existing entries):",
    javascriptOrigins,
  );
  printList(
    "    Add these Authorized redirect URIs (keep existing entries):",
    redirectUris,
  );

  console.log("\n==> Step 3: Save in Google Cloud Console");
  console.log("    Click Save → wait 1–2 minutes → retry Google sign-in in incognito:");
  console.log(`    https://www.${apex}/social/`);

  if (shouldOpen) {
    console.log("\n==> Opening browser tabs…");
    if (openUrl(firebaseUrl)) console.log("    ✓ Firebase Google provider");
    if (openUrl(gcpUrl)) console.log("    ✓ Google Cloud OAuth client");
  } else {
    console.log("\n    Tip: re-run with --open to launch both console pages:");
    console.log(`      npm run setup:google-oauth -- ${projectId} ${apex} --open`);
  }
}

main().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exit(1);
});
