#!/usr/bin/env node
/**
 * Serve docs/ (social app) with WAV assets from public/sounds/ at /sounds/*.
 * Replaces `serve docs` so runtime /sounds/*.wav URLs resolve during local dev.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const SOUNDS = join(ROOT, "public", "sounds");
const PORT = Number(process.env.SOCIAL_PORT ?? 8080);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".wav": "audio/wav",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function safePath(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const resolved = normalize(join(root, decoded));
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  let pathname = url.pathname;

  if (pathname.startsWith("/sounds/")) {
    const filePath = safePath(SOUNDS, pathname.slice("/sounds".length));
    if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
      send(res, 404, "Not found");
      return;
    }
    const ext = extname(filePath).toLowerCase();
    send(res, 200, readFileSync(filePath), {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    return;
  }

  if (pathname === "/") pathname = "/index.html";
  if (pathname.endsWith("/")) pathname += "index.html";

  let filePath = safePath(DOCS, pathname);
  if (
    (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) &&
    !extname(pathname)
  ) {
    const htmlPath = safePath(DOCS, `${pathname}.html`);
    if (htmlPath && existsSync(htmlPath) && !statSync(htmlPath).isDirectory()) {
      filePath = htmlPath;
    }
  }

  if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    send(res, 404, "Not found");
    return;
  }

  const ext = extname(filePath).toLowerCase();
  send(res, 200, readFileSync(filePath), {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": ext === ".html" || ext === ".js" ? "no-cache" : "public, max-age=3600",
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Social app: http://127.0.0.1:${PORT}/`);
  console.log(`Sounds:     http://127.0.0.1:${PORT}/sounds/`);
});
