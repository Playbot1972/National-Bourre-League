#!/usr/bin/env node
/**
 * Production smoke: Gen2 callables must be publicly invokable at the Cloud Run layer.
 * A 403 HTML response means missing run.invoker (client httpsCallable never reaches handler).
 * A 401 JSON UNAUTHENTICATED is expected without a Firebase ID token.
 *
 * Usage:
 *   npm run verify:game-callables
 *   FIREBASE_PROJECT_ID=my-project npm run verify:game-callables
 */
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "national-bourre-league";
const REGION = process.env.FIREBASE_FUNCTIONS_REGION || "us-central1";
const BASE = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;

const CALLABLES = [
  "gameAdvanceBots",
  "gameSubmitDraw",
  "gameEnsureHandEnrollment",
  "gamePlayCard",
];

export function classifyCallableProbe(result) {
  if (result.status === 403) {
    return {
      ok: false,
      reason: "missing_cloud_run_invoker",
      hint: `Grant public invoker (onCall invoker:"public") and redeploy ${result.name}`,
    };
  }
  if (result.status === 401 && result.body?.error?.status === "UNAUTHENTICATED") {
    return { ok: true, reason: "callable_reachable" };
  }
  if (result.status === 400 && result.body?.error?.status === "INVALID_ARGUMENT") {
    return { ok: true, reason: "callable_reachable" };
  }
  return {
    ok: false,
    reason: "unexpected_status",
    hint: `Expected 401 UNAUTHENTICATED or 400 INVALID_ARGUMENT; got HTTP ${result.status}`,
  };
}

async function probeCallable(name) {
  const res = await fetch(`${BASE}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { roomId: "verify", sessionId: "verify" } }),
  });
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* HTML 403 page */
  }
  return { name, status: res.status, body };
}

async function main() {
  console.log(`Callable verify — ${BASE}\n`);
  let failed = false;
  for (const name of CALLABLES) {
    const result = await probeCallable(name);
    const verdict = classifyCallableProbe(result);
    const label = verdict.ok ? "PASS" : "FAIL";
    console.log(`${label}  ${name}  HTTP ${result.status}  (${verdict.reason})`);
    if (!verdict.ok) {
      failed = true;
      if (verdict.hint) console.log(`       ${verdict.hint}`);
      if (typeof result.body === "string" && result.body.includes("Forbidden")) {
        console.log("       Response was Cloud Run IAM HTML — not a CORS or callable/HTTP mismatch.");
      }
    }
  }
  console.log("");
  if (failed) {
    console.error("Callable verify failed.");
    process.exit(1);
  }
  console.log("Callable verify passed.");
}

const isMain =
  process.argv[1] &&
  new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}