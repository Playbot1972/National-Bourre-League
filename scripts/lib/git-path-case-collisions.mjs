/**
 * Detect case-insensitive path collisions among tracked git paths.
 * macOS default volumes collapse these into a single file — causes silent overwrites.
 */
import { spawnSync } from "node:child_process";

/**
 * @param {string[]} paths
 * @returns {{ lower: string, variants: string[] }[]}
 */
export function findCaseCollisions(paths) {
  /** @type {Map<string, string[]>} */
  const byLower = new Map();
  for (const path of paths) {
    const trimmed = path.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    const list = byLower.get(lower) ?? [];
    list.push(trimmed);
    byLower.set(lower, list);
  }
  return [...byLower.entries()]
    .filter(([, variants]) => variants.length > 1)
    .map(([lower, variants]) => ({ lower, variants: [...variants].sort() }));
}

/**
 * @param {{ prefix?: string, cwd?: string }} [options]
 * @returns {{ collisions: { lower: string, variants: string[] }[], paths: string[] }}
 */
export function scanGitPathCaseCollisions(options = {}) {
  const { prefix, cwd } = options;
  const args = ["ls-files"];
  if (prefix) args.push("--", prefix);

  const result = spawnSync("git", args, {
    cwd: cwd ?? process.cwd(),
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || "git ls-files failed");
  }

  const paths = result.stdout.split("\n").filter(Boolean);
  return { collisions: findCaseCollisions(paths), paths };
}

/**
 * @param {{ prefix?: string, cwd?: string }} [options]
 */
export function assertNoGitPathCaseCollisions(options = {}) {
  const { collisions } = scanGitPathCaseCollisions(options);
  if (collisions.length === 0) return;

  const scope = options.prefix ? ` under ${options.prefix}` : "";
  const lines = [`Git path case collisions detected${scope}:`];
  for (const { lower, variants } of collisions) {
    lines.push(`  ${lower}:`);
    for (const variant of variants) lines.push(`    - ${variant}`);
  }
  const err = new Error(lines.join("\n"));
  err.code = "GIT_PATH_CASE_COLLISION";
  throw err;
}
