/**
 * Validate named imports from ./firebase-config.js against generated config exports.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const NAMED_EXPORT_CONST_RE = /export\s+const\s+(\w+)/g;
const NAMED_EXPORT_FUNCTION_RE = /export\s+function\s+(\w+)/g;

function listJsFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsFiles(path));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(path);
    }
  }
  return files;
}

function parseImportBindings(importBlock) {
  return importBlock
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const asMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
      if (asMatch) return asMatch[1];
      return part.replace(/^type\s+/, "").split(/\s+/)[0];
    })
    .filter((name) => name && name !== "type");
}

export function extractFirebaseConfigImportBindings(src) {
  const bindings = new Set();
  const fromRe = /from\s*["']\.\/firebase-config\.js(?:\?v=[^"']+)?["']/g;
  for (const fromMatch of src.matchAll(fromRe)) {
    const before = src.slice(0, fromMatch.index);
    const importStart = before.lastIndexOf("import");
    if (importStart < 0) continue;
    const block = src.slice(importStart, fromMatch.index + fromMatch[0].length);
    const braceMatch = block.match(/import\s*\{([\s\S]*)\}\s*from/);
    if (!braceMatch) continue;
    for (const name of parseImportBindings(braceMatch[1])) {
      bindings.add(name);
    }
  }
  return bindings;
}

/**
 * @param {string} docsDir
 * @returns {Map<string, Set<string>>} relativePath -> imported binding names
 */
export function discoverFirebaseConfigImports(docsDir) {
  const byFile = new Map();
  for (const filePath of listJsFiles(docsDir)) {
    const src = readFileSync(filePath, "utf8");
    const rel = relative(docsDir, filePath).replace(/\\/g, "/");
    const bindings = extractFirebaseConfigImportBindings(src);
    if (bindings.size > 0) {
      byFile.set(rel, bindings);
    }
  }
  return byFile;
}

/** @param {string} configSrc */
export function parseFirebaseConfigNamedExports(configSrc) {
  const names = new Set();
  for (const match of configSrc.matchAll(NAMED_EXPORT_CONST_RE)) {
    names.add(match[1]);
  }
  for (const match of configSrc.matchAll(NAMED_EXPORT_FUNCTION_RE)) {
    names.add(match[1]);
  }
  return names;
}

/**
 * @param {{
 *   configPath: string;
 *   docsDir: string;
 * }} opts
 * @returns {{ ok: true } | { ok: false; failures: Array<{ importer: string; binding: string; configPath: string }> }}
 */
export function validateFirebaseConfigExportContract({ configPath, docsDir }) {
  const configSrc = readFileSync(configPath, "utf8");
  const exports = parseFirebaseConfigNamedExports(configSrc);
  const importsByFile = discoverFirebaseConfigImports(docsDir);
  const failures = [];

  for (const [importer, bindings] of importsByFile) {
    for (const binding of bindings) {
      if (!exports.has(binding)) {
        failures.push({ importer, binding, configPath });
      }
    }
  }

  if (failures.length > 0) {
    return { ok: false, failures };
  }
  return { ok: true };
}
