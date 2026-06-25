#!/usr/bin/env node
/**
 * Mint a short-lived OAuth access token from a service account key file.
 * Used when firebase-tools ignores GOOGLE_APPLICATION_CREDENTIALS.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("usage: firebase-ci-access-token.mjs <service-account.json>");
  process.exit(2);
}

readFileSync(keyPath, "utf8"); // fail fast if missing

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "functions/package.json"));
const { GoogleAuth } = require("google-auth-library");

const auth = new GoogleAuth({
  keyFile: keyPath,
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/firebase",
  ],
});
const client = await auth.getClient();
const token = await client.getAccessToken();
if (!token.token) {
  console.error("failed to mint access token");
  process.exit(1);
}
process.stdout.write(token.token);
