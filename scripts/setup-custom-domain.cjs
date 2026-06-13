#!/usr/bin/env node
/**
 * Steps 1–3 for booray.win: Firebase Hosting custom domain + Auth authorized domains.
 *
 * Requires: npx firebase login (same Google account as Firebase Console)
 *
 * Usage:
 *   node scripts/setup-custom-domain.cjs [project-id] [domain] [site-id]
 *
 * Example:
 *   node scripts/setup-custom-domain.cjs national-bourre-league booray.win
 */

const { initFirebaseSession } = require("./lib/firebase-session.cjs");
const { Client } = require("firebase-tools/lib/apiv2");
const { hostingApiOrigin } = require("firebase-tools/lib/api");
const authGcp = require("firebase-tools/lib/gcp/auth");
const hostingApi = require("firebase-tools/lib/hosting/api");

const projectId = process.argv[2] || "national-bourre-league";
const domain = process.argv[3] || "booray.win";
const wwwDomain = domain.startsWith("www.") ? domain : `www.${domain}`;
const apexDomain = domain.replace(/^www\./, "");
const siteId = process.argv[4] || projectId;

const hostingClient = new Client({
  urlPrefix: hostingApiOrigin(),
  apiVersion: "v1beta1",
  auth: true,
});

async function listDomains() {
  return hostingApi.getSiteDomains(projectId, siteId);
}

async function createDomain(domainName) {
  try {
    const res = await hostingClient.post(
      `/projects/${projectId}/sites/${siteId}/domains`,
      { domainName },
    );
    return res.body;
  } catch (err) {
    const msg = err?.message || String(err);
    if (/already exists|ALREADY_EXISTS|409/i.test(msg)) {
      console.log(`    ${domainName} already registered in Hosting.`);
      return null;
    }
    throw err;
  }
}

function printDns(domainRecord) {
  if (!domainRecord) return;
  console.log(`\n--- DNS for ${domainRecord.domainName || domainRecord} ---`);
  const status = domainRecord.status || domainRecord.provisioning?.certStatus;
  if (status) console.log(`    Status: ${status}`);

  const updates =
    domainRecord.requiredDnsUpdates ||
    domainRecord.provisioning?.dnsUpdates ||
    domainRecord.dnsUpdates;
  if (updates?.length) {
    for (const u of updates) {
      console.log(`    ${u.type || u.recordType}  ${u.host || u.domainName || "@"}  →  ${u.rdata || u.value || u.requiredValue}`);
    }
    return;
  }

  // Fallback: common Firebase Hosting A records (Quick Setup)
  console.log("    Add at your registrar (Firebase Quick Setup):");
  console.log(`    A     @     199.36.158.100`);
  console.log(`    TXT   @     (verification record from Firebase Console if shown)`);
  console.log(`    CNAME www   ${siteId}.web.app`);
}

async function addAuthDomain(name) {
  const current = (await authGcp.getAuthDomains(projectId)) || [];
  if (current.includes(name)) {
    console.log(`    Auth domain already authorized: ${name}`);
    return;
  }
  await authGcp.updateAuthDomains(projectId, [...current, name]);
  console.log(`    Authorized for sign-in: ${name}`);
}

async function main() {
  const email = initFirebaseSession();
  console.log(`==> Firebase account: ${email}`);
  console.log(`==> Project: ${projectId}  Site: ${siteId}`);
  console.log(`==> Domain: ${apexDomain} (+ ${wwwDomain})`);

  console.log("\n==> Step 1: Register custom domains in Firebase Hosting");
  for (const d of [apexDomain, wwwDomain]) {
    console.log(`    Adding ${d}…`);
    const created = await createDomain(d);
    if (created) printDns(created);
  }

  const domains = await listDomains();
  console.log("\n    Hosting domains on file:");
  for (const d of domains) {
    console.log(`      • ${d.domainName} (${d.status || "pending"})`);
    if (d.domainName === apexDomain || d.domainName === wwwDomain) {
      printDns(d);
    }
  }

  console.log("\n==> Step 2: DNS at your registrar");
  console.log(`    Log in where you bought ${apexDomain} and add the records above.`);
  console.log(
    `    Console: https://console.firebase.google.com/project/${projectId}/hosting/sites/${siteId}/domains`,
  );
  console.log("    SSL provisioning starts after DNS verifies (often 15 min–24 hr).");

  console.log("\n==> Step 3: Firebase Auth authorized domains");
  await addAuthDomain(apexDomain);
  await addAuthDomain(wwwDomain);

  console.log("\n==> Step 3b: Update client authDomain + redeploy (if not already booray.win)");
  console.log(`    npm run setup:webapp -- ${projectId} ${apexDomain}`);
  console.log("    npm run build:hosting && npx firebase deploy --only hosting");

  console.log("\n==> Done (pending DNS propagation).");
  console.log(`    https://${apexDomain}/`);
  console.log(`    https://${apexDomain}/social/`);
}

main().catch((err) => {
  console.error("\nSetup failed:", err.message || err);
  console.error(
    `\nManual fallback: https://console.firebase.google.com/project/${projectId}/hosting/sites/${siteId}`,
  );
  process.exit(1);
});
