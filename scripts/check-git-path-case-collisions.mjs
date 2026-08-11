#!/usr/bin/env node
/**
 * Fail when git tracks multiple paths that differ only by case.
 * Scans all tracked paths by default; pass a prefix to scope (e.g. public/sounds).
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertNoGitPathCaseCollisions } from "./lib/git-path-case-collisions.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const prefix = process.argv[2] || undefined;

try {
  assertNoGitPathCaseCollisions({ prefix, cwd: root });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const scope = prefix ? ` (${prefix})` : "";
console.log(`check-git-path-case-collisions: no case collisions${scope}`);
