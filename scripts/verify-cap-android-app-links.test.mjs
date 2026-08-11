import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const manifest = readFileSync(
  join(root, "android", "app", "src", "main", "AndroidManifest.xml"),
  "utf8",
);

assert.match(manifest, /android:autoVerify="true"/, "App Links intent filter must auto-verify");
assert.match(manifest, /android:host="www\.booray\.win"/, "App Links host must be www.booray.win");
assert.match(
  manifest,
  /android:pathPrefix="\/social"/,
  "App Links pathPrefix must cover /social routes",
);
assert.match(
  manifest,
  /android\.intent\.action\.VIEW/,
  "App Links intent filter must handle VIEW action",
);

const assetlinksExample = readFileSync(
  join(root, "public", ".well-known", "assetlinks.json.example"),
  "utf8",
);
const assetlinks = JSON.parse(assetlinksExample);
assert.equal(assetlinks[0].target.package_name, "win.booray.app");
assert.equal(
  assetlinks[0].target.sha256_cert_fingerprints[0],
  "REPLACE_WITH_PLAY_APP_SIGNING_SHA256",
);

const androidGitignore = readFileSync(join(root, "android", ".gitignore"), "utf8");
assert.match(androidGitignore, /^google-services\.json$/m, "google-services.json must be gitignored");
assert.match(androidGitignore, /^keystore\.properties$/m, "keystore.properties must be gitignored");
assert.match(androidGitignore, /^\*\.jks$/m, "*.jks must be gitignored");
assert.match(androidGitignore, /^\*\.keystore$/m, "*.keystore must be gitignored");

console.log("verify-cap-android-app-links.test.mjs: ok");
