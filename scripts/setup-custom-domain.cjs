#!/usr/bin/env node
/**
 * Steps 1–3 for booray.win: Firebase Hosting custom domain + Auth authorized domains.
 *
 * Requires: npx firebase login (same Google account as Firebase Console)
 *
 * Usage:
 *   node scripts/setup-custom-domain.cjs [project-id] [domain] [site-id]
 */

const { initFirebaseSession } = require("./lib/firebase-session.cjs");
const { Client } = require("firebase-tools/lib/apiv2");
const { hostingApiOrigin } = require("firebase-tools/lib/api");
const { pollOperation } = require("firebase-tools/lib/operation-poller");
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

function operationPath(name) {
  if (!name) return null;
  const idx = name.indexOf("/v1beta1/");
  return idx >= 0 ? name.slice(idx + "/v1beta1".length) : name;
}

async function listCustomDomains() {
  try {
    const res = await hostingClient.get(
      `/projects/${projectId}/sites/${siteId}/customDomains`,
    );
    return res.body.customDomains || [];
  } catch {
    return [];
  }
}

async function listLegacyDomains() {
  try {
    return await hostingApi.getSiteDomains(projectId, siteId);
  } catch {
    return [];
  }
}

async function createCustomDomain(domainName) {
  const res = await hostingClient.post(
    `/projects/${projectId}/sites/${siteId}/customDomains`,
    {},
    { queryParams: { customDomainId: domainName } },
  );
  let body = res.body;
  if (body?.name && body.done !== true) {
    const opPath = operationPath(body.name);
    if (opPath) {
      try {
        body = await pollOperation({
          apiOrigin: hostingApiOrigin(),
          apiVersion: "v1beta1",
          operationResourceName: opPath,
          masterTimeout: 300000,
        });
      } catch (err) {
        const msg = err?.message || String(err);
        if (/timed out/i.test(msg)) {
          console.log(`    ${domainName} provisioning still running — will fetch DNS next…`);
          return await getCustomDomainDetail(domainName);
        }
        throw err;
      }
    }
  }
  return body?.response || body;
}

async function getCustomDomainDetail(domainName) {
  try {
    const res = await hostingClient.get(
      `/projects/${projectId}/sites/${siteId}/customDomains/${domainName}`,
    );
    return res.body;
  } catch {
    return null;
  }
}

async function createLegacyDomain(domainName) {
  const res = await hostingClient.post(
    `/projects/${projectId}/sites/${siteId}/domains`,
    { domainName, site: siteId },
  );
  return res.body;
}

async function createDomain(domainName) {
  try {
    return await createCustomDomain(domainName);
  } catch (err) {
    const msg = err?.message || String(err);
    if (/already exists|ALREADY_EXISTS|409/i.test(msg)) {
      console.log(`    ${domainName} already registered in Hosting.`);
      return null;
    }
    console.log(`    customDomains API failed (${msg.slice(0, 80)}…), trying legacy API…`);
    try {
      return await createLegacyDomain(domainName);
    } catch (err2) {
      const msg2 = err2?.message || String(err2);
      if (/already exists|ALREADY_EXISTS|409/i.test(msg2)) {
        console.log(`    ${domainName} already registered in Hosting.`);
        return null;
      }
      throw err2;
    }
  }
}

function printDnsRecord(type, host, value) {
  console.log(`    ${type}  ${host || "@"}  →  ${value}`);
}

function printDns(domainRecord, label) {
  if (!domainRecord) return;
  const name =
    label ||
    domainRecord.domainName ||
    domainRecord.name?.split("/").pop() ||
    "domain";
  console.log(`\n--- DNS for ${name} ---`);

  const hostState = domainRecord.hostState || domainRecord.status;
  if (hostState) console.log(`    Status: ${hostState}`);

  const desired = domainRecord.requiredDnsUpdates?.desired;
  if (Array.isArray(desired)) {
    for (const set of desired) {
      for (const rec of set.records || []) {
        printDnsRecord(rec.type, rec.domainName?.replace(/\.$/, ""), rec.rdata);
      }
    }
    return;
  }

  const updates =
    domainRecord.requiredDnsUpdates ||
    domainRecord.provisioning?.dnsUpdates ||
    domainRecord.dnsUpdates;
  if (Array.isArray(updates)) {
    for (const u of updates) {
      printDnsRecord(
        u.type || u.recordType,
        u.host || u.domainName,
        u.rdata || u.value || u.requiredValue,
      );
    }
    return;
  }

  console.log("    Add at your registrar (or check Firebase Console for exact values):");
  printDnsRecord("A", "@", "199.36.158.100");
  printDnsRecord("CNAME", "www", `${siteId}.web.app`);
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
    if (created) printDns(created, d);
  }

  const custom = await listCustomDomains();
  const legacy = await listLegacyDomains();
  console.log("\n    Hosting domains on file:");
  for (const d of custom) {
    const id = d.name?.split("/").pop() || d.customDomainId || "custom";
    const detail = (await getCustomDomainDetail(id)) || d;
    console.log(`      • ${id} (${detail.hostState || detail.ownershipState || "pending"})`);
    printDns(detail, id);
  }
  for (const d of legacy) {
    console.log(`      • ${d.domainName} (${d.status || "pending"})`);
    if (d.domainName === apexDomain || d.domainName === wwwDomain) {
      printDns(d);
    }
  }

  console.log("\n==> Step 2: DNS at your registrar");
  console.log(`    Log in where you bought ${apexDomain} and add the records above.`);
  console.log(`    For a copy-paste table, run:`);
  console.log(`      npm run domain:finish -- ${projectId} ${apexDomain}`);
  console.log(
    `    Console: https://console.firebase.google.com/project/${projectId}/hosting/sites/${siteId}/domains`,
  );
  console.log("    SSL provisioning starts after DNS verifies (often 15 min–24 hr).");

  console.log("\n==> Step 3: Firebase Auth authorized domains");
  await addAuthDomain(apexDomain);
  await addAuthDomain(wwwDomain);

  console.log("\n==> Step 3b: Update client authDomain + redeploy (if not already on custom domain)");
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
