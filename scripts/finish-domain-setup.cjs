#!/usr/bin/env node
/**
 * Fetch DNS records + set Auth authorized domains (steps 2–3 after domain registered).
 *
 * Usage:
 *   node scripts/finish-domain-setup.cjs [project-id] [domain] [site-id]
 *
 * Example:
 *   node scripts/finish-domain-setup.cjs national-bourre-league booray.win
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

/** @type {{ type: string, host: string, value: string }[]} */
const allRecords = [];

function hostLabel(domainName, apex) {
  if (!domainName) return "@";
  const d = domainName.replace(/\.$/, "");
  if (d === apex || d === "@") return "@";
  if (d.startsWith(`${apex}.`) || d.includes(apex)) {
    const sub = d.replace(`.${apex}`, "").replace(apex, "");
    return sub || "@";
  }
  return d;
}

function collectRecords(domainRecord, apex) {
  const rows = [];
  const desired = domainRecord?.requiredDnsUpdates?.desired;
  if (Array.isArray(desired)) {
    for (const set of desired) {
      for (const rec of set.records || []) {
        rows.push({
          type: rec.type,
          host: hostLabel(rec.domainName, apex),
          value: rec.rdata,
        });
      }
    }
  }
  const prov = domainRecord?.provisioning;
  if (prov?.dnsUpdates?.length) {
    for (const u of prov.dnsUpdates) {
      rows.push({
        type: u.type || u.recordType,
        host: hostLabel(u.host || u.domainName, apex),
        value: u.rdata || u.value || u.requiredValue,
      });
    }
  }
  return rows;
}

function printRegistrarTable(domainLabel, rows) {
  if (!rows.length) return false;
  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║  DNS for ${domainLabel.padEnd(50)}║`);
  console.log(`╠════════╤══════════════════╤════════════════════════════════╣`);
  console.log(`║  Type  │  Host / Name     │  Value / Points to             ║`);
  console.log(`╠════════╪══════════════════╪════════════════════════════════╣`);
  for (const r of rows) {
    const type = (r.type || "").padEnd(6);
    const host = (r.host || "@").padEnd(16);
    const val = (r.value || "").slice(0, 30);
    console.log(`║  ${type} │  ${host} │  ${val.padEnd(30)} ║`);
    if ((r.value || "").length > 30) {
      console.log(`║        │                  │  ${r.value.slice(30).padEnd(30)} ║`);
    }
    allRecords.push({ domain: domainLabel, ...r });
  }
  console.log(`╚════════╧══════════════════╧════════════════════════════════╝`);
  return true;
}

async function getCustomDomain(domainName) {
  try {
    const res = await hostingClient.get(
      `/projects/${projectId}/sites/${siteId}/customDomains/${domainName}`,
    );
    return res.body;
  } catch {
    return null;
  }
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

async function addAuthDomain(name) {
  const current = (await authGcp.getAuthDomains(projectId)) || [];
  if (current.includes(name)) {
    console.log(`    ✓ ${name} (already authorized)`);
    return;
  }
  await authGcp.updateAuthDomains(projectId, [...current, name]);
  console.log(`    ✓ ${name} (added)`);
}

async function main() {
  initFirebaseSession();
  console.log(`==> Project: ${projectId}  Domains: ${apexDomain}, ${wwwDomain}\n`);

  let foundDns = false;

  console.log("==> Step 2: DNS records from Firebase (add at your registrar)\n");

  for (const d of [apexDomain, wwwDomain]) {
    const detail = await getCustomDomain(d);
    if (detail) {
      const state = detail.hostState || detail.ownershipState || "pending";
      console.log(`    ${d} — ${state}`);
      if (printRegistrarTable(d, collectRecords(detail, apexDomain))) {
        foundDns = true;
      }
      continue;
    }
    const legacy = (await listLegacyDomains()).find((x) => x.domainName === d);
    if (legacy) {
      console.log(`    ${d} — ${legacy.status || "pending"}`);
      if (printRegistrarTable(d, collectRecords(legacy, apexDomain))) {
        foundDns = true;
      }
    } else {
      console.log(`    ${d} — not found in Hosting yet`);
    }
  }

  if (!foundDns) {
    const listed = await listCustomDomains();
    if (listed.length) {
      console.log("\n    Domains registered (fetching DNS…):"); 
      for (const d of listed) {
        const id = d.name?.split("/").pop();
        const detail = id ? await getCustomDomain(id) : d;
        const label = id || "custom";
        console.log(`    ${label} — ${detail?.hostState || "pending"}`);
        if (printRegistrarTable(label, collectRecords(detail || d, apexDomain))) {
          foundDns = true;
        }
      }
    }
  }

  if (!foundDns) {
    console.log("\n    DNS records not ready yet. Firebase may still be provisioning.");
    console.log(
      `    Open: https://console.firebase.google.com/project/${projectId}/hosting/sites/${siteId}/domains`,
    );
    console.log("    Re-run in a few minutes: npm run domain:finish");
  } else {
    console.log(`\n    At your registrar for ${apexDomain}, add each row above:`);
    console.log("      • Type = record type (A, TXT, CNAME)");
    console.log("      • Host = @ for root, or www for www subdomain");
    console.log("      • Value = exactly as shown");
  }

  console.log("\n==> Step 3: Firebase Auth authorized domains");
  await addAuthDomain(apexDomain);
  await addAuthDomain(wwwDomain);

  const authDomains = await authGcp.getAuthDomains(projectId);
  console.log("\n    Current authorized domains:");
  for (const d of authDomains) {
    console.log(`      • ${d}`);
  }

  console.log("\n==> Next");
  console.log("    1. Add DNS records at registrar → wait for Firebase green check");
  console.log(`    2. Redeploy with ${apexDomain} authDomain:`);
  console.log(`       npm run setup:webapp -- ${projectId} ${apexDomain}`);
  console.log("       npm run build:hosting && npx firebase deploy --only hosting");
  console.log(`\n    Live after DNS: https://${apexDomain}/ and https://${apexDomain}/social/`);
}

main().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exit(1);
});
