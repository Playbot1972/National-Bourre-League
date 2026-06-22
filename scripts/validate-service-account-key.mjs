#!/usr/bin/env node
/**
 * Validate a Google service account JSON key (FIREBASE_SERVICE_ACCOUNT).
 * Never prints private_key or other secrets — only client_email and project_id.
 *
 * Usage:
 *   node scripts/validate-service-account-key.mjs .firebase-sa-key.json
 *   node scripts/validate-service-account-key.mjs --stdin [--project national-bourre-league]
 */

import { readFileSync } from "node:fs";

function usage() {
  console.error(`Usage: node scripts/validate-service-account-key.mjs <path|--stdin> [--project PROJECT_ID]`);
  process.exit(2);
}

const args = process.argv.slice(2);
let path = null;
let expectedProject = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--stdin") {
    path = "-";
  } else if (arg === "--project") {
    expectedProject = args[++i];
  } else if (!arg.startsWith("-") && path == null) {
    path = arg;
  } else {
    usage();
  }
}

if (path == null) usage();

let raw;
try {
  raw = path === "-" ? readFileSync(0, "utf8") : readFileSync(path, "utf8");
} catch (err) {
  console.error(`::error::Cannot read service account key: ${err.message}`);
  process.exit(1);
}

const trimmed = raw.trim();
if (!trimmed.startsWith("{")) {
  console.error(
    "::error::FIREBASE_SERVICE_ACCOUNT is not valid JSON (must start with '{'). " +
      "Re-upload the raw .firebase-sa-key.json file: gh secret set FIREBASE_SERVICE_ACCOUNT < .firebase-sa-key.json",
  );
  process.exit(1);
}

let key;
try {
  key = JSON.parse(trimmed);
} catch (err) {
  console.error(`::error::FIREBASE_SERVICE_ACCOUNT JSON parse failed: ${err.message}`);
  console.error(
    "Fix from repo root: npm run sync:github-sa-secret  (requires .firebase-sa-key.json and gh auth)",
  );
  process.exit(1);
}

const required = ["type", "project_id", "private_key_id", "private_key", "client_email", "client_id"];
const missing = required.filter((field) => !key[field] || String(key[field]).trim() === "");
if (key.type !== "service_account") {
  console.error(`::error::Expected type "service_account", got "${key.type ?? "missing"}"`);
  process.exit(1);
}
if (missing.length > 0) {
  console.error(`::error::Service account JSON missing fields: ${missing.join(", ")}`);
  process.exit(1);
}
if (!String(key.private_key).includes("BEGIN PRIVATE KEY")) {
  console.error("::error::private_key does not look like a PEM private key");
  process.exit(1);
}
if (expectedProject && key.project_id !== expectedProject) {
  console.error(
    `::error::project_id "${key.project_id}" does not match expected "${expectedProject}"`,
  );
  process.exit(1);
}

console.log(`client_email=${key.client_email}`);
console.log(`project_id=${key.project_id}`);
console.log("OK: service account key is valid JSON");
