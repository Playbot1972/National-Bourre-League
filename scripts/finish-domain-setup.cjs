#!/usr/bin/env node
/**
 * Fetch DNS records + set Auth authorized domains (steps 2–3 after domain registered).
 * Optionally apply DNS at registrar with --apply-dns (see domain:dns).
 *
 * Usage:
 *   node scripts/finish-domain-setup.cjs [project-id] [domain] [site-id] [options]
 *
 * Options:
 *   --apply-dns              push DNS to registrar (needs REGISTRAR_DNS_PROVIDER + creds)
 *   --provider <name>        cloudflare | namecheap | porkbun
 *   --dry-run                with --apply-dns, preview registrar changes only
 *
 * Example:
 *   node scripts/finish-domain-setup.cjs national-bourre-league booray.win
 *   REGISTRAR_DNS_PROVIDER=cloudflare CLOUDFLARE_API_TOKEN=xxx \
 *     node scripts/finish-domain-setup.cjs national-bourre-league booray.win --apply-dns
 */

const { initFirebaseSession } = require("./lib/firebase-session.cjs");
const authGcp = require("firebase-tools/lib/gcp/auth");
const {
  fetchFirebaseHostingDns,
  printRegistrarTable,
} = require("./lib/firebase-hosting-dns.cjs");
const {
  applyRegistrarDns,
  printApplyResults,
  providerHelp,
} = require("./lib/registrar-dns.cjs");

function parseArgs(argv) {
  const flags = {
    applyDns: false,
    dryRun: false,
    provider: process.env.REGISTRAR_DNS_PROVIDER || "",
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply-dns") flags.applyDns = true;
    else if (a === "--dry-run") flags.dryRun = true;
    else if (a === "--provider") flags.provider = argv[++i] || "";
    else if (a.startsWith("--provider=")) flags.provider = a.slice("--provider=".length);
    else if (a.startsWith("-")) {
      console.error(`Unknown option: ${a}`);
      process.exit(1);
    } else {
      positional.push(a);
    }
  }
  if (flags.applyDns && !flags.provider && process.env.REGISTRAR_DNS_PROVIDER) {
    flags.provider = process.env.REGISTRAR_DNS_PROVIDER;
  }
  return { flags, positional };
}

async function addAuthDomain(projectId, name) {
  const current = (await authGcp.getAuthDomains(projectId)) || [];
  if (current.includes(name)) {
    console.log(`    ✓ ${name} (already authorized)`);
    return;
  }
  await authGcp.updateAuthDomains(projectId, [...current, name]);
  console.log(`    ✓ ${name} (added)`);
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const projectId = positional[0] || "national-bourre-league";
  const domain = positional[1] || "booray.win";
  const siteId = positional[2] || projectId;
  const apexDomain = domain.replace(/^www\./, "");
  const wwwDomain = domain.startsWith("www.") ? domain : `www.${apexDomain}`;

  initFirebaseSession();
  console.log(`==> Project: ${projectId}  Domains: ${apexDomain}, ${wwwDomain}\n`);

  console.log("==> Step 2: DNS records from Firebase\n");

  const { records, states } = await fetchFirebaseHostingDns({
    projectId,
    siteId,
    apexDomain,
    wwwDomain,
  });

  let foundDns = false;
  for (const [label, state] of Object.entries(states)) {
    console.log(`    ${label} — ${state}`);
  }

  const byDomain = new Map();
  for (const r of records) {
    if (!byDomain.has(r.domain)) byDomain.set(r.domain, []);
    byDomain.get(r.domain).push(r);
  }
  for (const [label, rows] of byDomain) {
    if (printRegistrarTable(label, rows)) foundDns = true;
  }

  if (!foundDns) {
    console.log("\n    DNS records not ready yet. Firebase may still be provisioning.");
    console.log(
      `    Open: https://console.firebase.google.com/project/${projectId}/hosting/sites/${siteId}/domains`,
    );
    console.log("    Re-run in a few minutes: npm run domain:finish");
  } else if (flags.applyDns) {
    if (!flags.provider) {
      console.error("\n--apply-dns requires REGISTRAR_DNS_PROVIDER or --provider.");
      console.error(providerHelp());
      process.exit(1);
    }
    console.log(`\n==> Step 2b: Apply DNS at registrar (${flags.provider})`);
    const applyRows = records.map(({ type, host, value }) => ({ type, host, value }));
    const results = await applyRegistrarDns(flags.provider, apexDomain, applyRows, {
      dryRun: flags.dryRun,
    });
    printApplyResults(results, { dryRun: flags.dryRun, provider: flags.provider });
    if (flags.dryRun) {
      console.log("\n    Re-run with --apply-dns (no --dry-run) to write records.");
    }
  } else {
    console.log(`\n    Add at your registrar for ${apexDomain}, or automate:`);
    console.log(
      `      REGISTRAR_DNS_PROVIDER=cloudflare CLOUDFLARE_API_TOKEN=xxx npm run domain:dns -- ${projectId} ${apexDomain}`,
    );
    console.log("      • Type = record type (A, TXT, CNAME)");
    console.log("      • Host = @ for root, or www for www subdomain");
    console.log("      • Value = exactly as shown");
  }

  console.log("\n==> Step 3: Firebase Auth authorized domains");
  await addAuthDomain(projectId, apexDomain);
  await addAuthDomain(projectId, wwwDomain);

  const authDomains = await authGcp.getAuthDomains(projectId);
  console.log("\n    Current authorized domains:");
  for (const d of authDomains) {
    console.log(`      • ${d}`);
  }

  console.log("\n==> Next");
  console.log("    1. DNS at registrar → wait for Firebase green check");
  console.log(`    2. Google sign-in: npm run setup:google-oauth -- ${projectId} ${apexDomain} --open`);
  console.log(`    3. Redeploy with ${apexDomain} authDomain:`);
  console.log(`       npm run setup:webapp -- ${projectId} ${apexDomain}`);
  console.log("       npm run build:hosting && npx firebase deploy --only hosting");
  console.log(`\n    Live after DNS: https://${apexDomain}/ and https://${apexDomain}/social/`);
}

main().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exit(1);
});
