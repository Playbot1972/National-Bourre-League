#!/usr/bin/env node
/**
 * Guard: npm scripts must run from the repo root (where package.json lives).
 * Prevents opaque ENOENT errors when `npm run social` is invoked from ~.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const pkgPath = resolve(process.cwd(), "package.json");

if (!existsSync(pkgPath)) {
  console.error(`
npm must be run from the National Bourré League project folder.

  cd ~/National-Bourre-League
  npm install          # first time only
  npm run dev:local    # emulators + social app (one command)

Or use two terminals from the repo root:
  npm run emulators    # terminal 1
  npm run social       # terminal 2 → http://localhost:8080

Current directory: ${process.cwd()}
`);
  process.exit(1);
}

try {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.name !== "national-bourre-league") {
    console.error(
      `Expected package "national-bourre-league" but found "${pkg.name ?? "unknown"}".\n` +
        `cd into the National Bourré League clone and retry.`,
    );
    process.exit(1);
  }
} catch {
  console.error(`Could not read ${pkgPath}. cd into the project folder and retry.`);
  process.exit(1);
}
