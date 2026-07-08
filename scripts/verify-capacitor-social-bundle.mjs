#!/usr/bin/env node
/**
 * Verify dist/social is a complete Capacitor webDir bundle.
 * Usage: node scripts/verify-capacitor-social-bundle.mjs [--deep] [--fresh]
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const docsDir = join(root, "docs");
const socialDir = join(root, "dist", "social");
const indexPath = join(socialDir, "index.html");
const deep = process.argv.includes("--deep");
const requireFresh = process.argv.includes("--fresh");

const ATTR_RE = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const CSS_URL_RE = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
const FRESHNESS_SOURCES = [
  "app.js",
  "auth.js",
  "table-session.js",
  "game-engine.js",
  "capacitor-native-bridge.js",
];

function isRemote(url) {
  return /^(https?:|data:|mailto:|javascript:|#)/i.test(url);
}

function isHashOnly(url) {
  return url.startsWith("#");
}

function isNavOnlyRef(raw) {
  return raw === "/" || raw === "/social/" || raw === "/social";
}

function collectHtmlRefs(html, baseDir) {
  const refs = [];
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(html))) {
    const raw = m[1].trim();
    if (!raw || isRemote(raw) || isHashOnly(raw) || isNavOnlyRef(raw)) continue;
    refs.push({ raw, from: "html", resolved: resolve(baseDir, raw.split("?")[0]) });
  }
  return refs;
}

function collectCssUrls(cssPath) {
  if (!existsSync(cssPath)) return [];
  const css = readFileSync(cssPath, "utf8");
  const baseDir = dirname(cssPath);
  const refs = [];
  let m;
  CSS_URL_RE.lastIndex = 0;
  while ((m = CSS_URL_RE.exec(css))) {
    const raw = m[1].trim();
    if (!raw || isRemote(raw) || raw.startsWith("#")) continue;
    refs.push({ raw, from: `css:${cssPath}`, resolved: resolve(baseDir, raw.split("?")[0]) });
  }
  return refs;
}

function collectManifestRefs(manifestPath) {
  if (!existsSync(manifestPath)) return [];
  const data = JSON.parse(readFileSync(manifestPath, "utf8"));
  const refs = [];
  for (const icon of data.icons ?? []) {
    if (icon.src && !isRemote(icon.src)) {
      refs.push({
        raw: icon.src,
        from: "manifest.icons",
        resolved: icon.src.startsWith("/")
          ? join(socialDir, icon.src.replace(/^\//, ""))
          : resolve(socialDir, icon.src),
      });
    }
  }
  if (data.start_url && !isRemote(data.start_url) && !isHashOnly(data.start_url)) {
    refs.push({
      raw: data.start_url,
      from: "manifest.start_url",
      note: "PWA hosting path (/social/) — not used for Capacitor index.html entry",
    });
  }
  return refs;
}

function collectJsStaticImports(jsPath, seen = new Set()) {
  if (!existsSync(jsPath) || seen.has(jsPath)) return [];
  seen.add(jsPath);
  const text = readFileSync(jsPath, "utf8");
  const baseDir = dirname(jsPath);
  const refs = [];
  const patterns = [
    /from\s+["'](\.[^"']+\.js[^"']*)["']/g,
    /import\s*\(\s*["'](\.[^"']+\.js[^"']*)["']\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      const raw = m[1];
      const clean = raw.split("?")[0];
      const resolved = resolve(baseDir, clean);
      refs.push({ raw, from: `js:${jsPath}`, resolved });
      refs.push(...collectJsStaticImports(resolved, seen));
    }
  }
  return refs;
}

function checkFreshness() {
  const stale = [];
  for (const name of FRESHNESS_SOURCES) {
    const src = join(docsDir, name);
    const dest = join(socialDir, name);
    if (!existsSync(src) || !existsSync(dest)) continue;
    if (statSync(src).mtimeMs > statSync(dest).mtimeMs) stale.push(name);
  }
  return stale;
}

function flagCapacitorRisks(indexHtml) {
  const risks = [];
  if (indexHtml.includes('href="/"') || indexHtml.includes("href='/'")) {
    risks.push({
      kind: "absolute-nav",
      detail: 'index.html links to href="/" (tutorial) — escapes dist/social root in Capacitor',
      severity: "info",
    });
  }
  const manifestPath = join(socialDir, "manifest.webmanifest");
  if (existsSync(manifestPath)) {
    const manifest = readFileSync(manifestPath, "utf8");
    if (manifest.includes('"/social/')) {
      risks.push({
        kind: "manifest-hosting-path",
        detail: 'manifest.webmanifest start_url uses /social/ (Firebase hosting layout)',
        severity: "info",
      });
    }
  }
  return risks;
}

function verify() {
  const result = {
    socialDirExists: existsSync(socialDir),
    indexExists: existsSync(indexPath),
    indexNonEmpty: false,
    indexBytes: 0,
    staleSources: [],
    refs: [],
    missing: [],
    risks: [],
    ok: false,
  };

  if (!result.socialDirExists || !result.indexExists) {
    result.risks.push({
      kind: "missing-bundle",
      detail: "dist/social/index.html not found — run npm run build:cap:web",
      severity: "error",
    });
    return result;
  }

  const indexHtml = readFileSync(indexPath, "utf8");
  result.indexBytes = Buffer.byteLength(indexHtml, "utf8");
  result.indexNonEmpty = result.indexBytes > 0;

  if (requireFresh) {
    result.staleSources = checkFreshness();
    if (result.staleSources.length) {
      result.risks.push({
        kind: "stale-bundle",
        detail: `docs/ is newer than dist/social for: ${result.staleSources.join(", ")} — run npm run build:cap:web`,
        severity: "error",
      });
    }
  }

  const refs = [
    ...collectHtmlRefs(indexHtml, socialDir),
    ...collectManifestRefs(join(socialDir, "manifest.webmanifest")),
  ];

  const cssFiles = refs
    .filter((r) => r.resolved?.endsWith(".css") && existsSync(r.resolved))
    .map((r) => r.resolved);
  for (const cssPath of [...new Set(cssFiles)]) {
    refs.push(...collectCssUrls(cssPath));
  }

  if (deep) {
    refs.push(...collectJsStaticImports(join(socialDir, "app.js")));
  }

  const deduped = new Map();
  for (const ref of refs) {
    if (!ref.resolved) continue;
    const key = `${ref.raw}|${ref.resolved}`;
    if (!deduped.has(key)) deduped.set(key, ref);
  }

  for (const ref of deduped.values()) {
    const exists = existsSync(ref.resolved);
    const insideBundle =
      ref.resolved === socialDir ||
      ref.resolved.startsWith(socialDir + "/") ||
      ref.resolved.startsWith(socialDir + "\\");
    const entry = { ...ref, exists, insideBundle };
    result.refs.push(entry);
    if (!exists && !ref.note) result.missing.push(entry);
  }

  result.risks.push(...flagCapacitorRisks(indexHtml));
  result.ok =
    result.socialDirExists &&
    result.indexExists &&
    result.indexNonEmpty &&
    result.missing.length === 0 &&
    result.staleSources.length === 0;

  return result;
}

const out = verify();
console.log(JSON.stringify(out, null, 2));
process.exit(out.ok ? 0 : 1);
