#!/usr/bin/env node
/**
 * Apply Firebase Hosting DNS records at your domain registrar.
 *
 * Usage:
 *   node scripts/apply-registrar-dns.cjs [project-id] [domain] [site-id] [options]
 *
 * Options:
 *   --provider cloudflare|namecheap|porkbun  (or REGISTRAR_DNS_PROVIDER)
 *   --apply-dns                              alias for running apply (used by domain:finish)
 *   --dry-run                                show changes without writing
 *
 * Examples:
 *   REGISTRAR_DNS_PROVIDER=cloudflare CLOUDFLARE_API_TOKEN=xxx \
 *     node scripts/apply-registrar-dns.cjs national-bourre-league booray.win
 *
 *   npm run domain:dns -- national-bourre-league booray.win --dry-run
 */

const { initFirebaseSession } = require("./lib/firebase-session.cjs");
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
  const flags = { dryRun: false, provider: process.env.REGISTRAR_DNS_PROVIDER || "" };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") flags.dryRun = true;
    else if (a === "--apply-dns") {
      /* no-op flag for domain:finish passthrough */
    } else if (a === "--provider") {
      flags.provider = argv[++i] || "";
    } else if (a.startsWith("--provider=")) {
      flags.provider = a.slice("--provider=".length);
    } else if (a.startsWith("-")) {
      console.error(`Unknown option: ${a}`);
      process.exit(1);
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const projectId = positional[0] || "national-bourre-league";
  const domain = positional[1] || "booray.win";
  const siteId = positional[2] || projectId;
  const apexDomain = domain.replace(/^www\./, "");
  const wwwDomain = domain.startsWith("www.") ? domain : `www.${apexDomain}`;

  initFirebaseSession();
  console.log(`==> Project: ${projectId}  Domain: ${apexDomain}\n`);
  console.log("==> Fetching DNS records from Firebase Hosting…\n");

  const { records, states } = await fetchFirebaseHostingDns({
    projectId,
    siteId,
    apexDomain,
    wwwDomain,
  });

  for (const [label, state] of Object.entries(states)) {
    console.log(`    ${label} — ${state}`);
  }

  const byDomain = new Map();
  for (const r of records) {
    if (!byDomain.has(r.domain)) byDomain.set(r.domain, []);
    byDomain.get(r.domain).push(r);
  }
  for (const [label, rows] of byDomain) {
    printRegistrarTable(label, rows);
  }

  if (!records.length) {
    console.error("\nNo DNS records from Firebase yet. Re-run in a few minutes.");
    process.exit(1);
  }

  if (!flags.provider) {
    console.log("\n==> Apply at registrar");
    console.log(providerHelp());
    console.log("\n    Example:");
    console.log(
      "      REGISTRAR_DNS_PROVIDER=cloudflare CLOUDFLARE_API_TOKEN=xxx npm run domain:dns -- national-bourre-league booray.win",
    );
    process.exit(0);
  }

  const applyRows = records.map(({ type, host, value }) => ({ type, host, value }));
  const results = await applyRegistrarDns(flags.provider, apexDomain, applyRows, {
    dryRun: flags.dryRun,
  });
  printApplyResults(results, { dryRun: flags.dryRun, provider: flags.provider });

  if (flags.dryRun) {
    console.log("\n    Re-run without --dry-run to apply.");
  } else {
    console.log("\n    DNS updated. Wait for Firebase Hosting green check, then redeploy.");
  }
}

main().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exit(1);
});
