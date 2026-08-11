import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findCaseCollisions,
  scanGitPathCaseCollisions,
  assertNoGitPathCaseCollisions,
} from "./lib/git-path-case-collisions.mjs";

assert.deepEqual(
  findCaseCollisions(["public/sounds/draw2.mp3", "public/sounds/Draw2.mp3"]),
  [{ lower: "public/sounds/draw2.mp3", variants: ["public/sounds/Draw2.mp3", "public/sounds/draw2.mp3"] }],
);

assert.deepEqual(findCaseCollisions(["public/sounds/draw2.mp3"]), []);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const drawPaths = spawnSync("git", ["ls-files", "public/sounds"], {
  cwd: root,
  encoding: "utf8",
})
  .stdout.split("\n")
  .filter((p) => /^public\/sounds\/draw[2-5]\.mp3$/i.test(p))
  .sort();

assert.deepEqual(drawPaths, [
  "public/sounds/draw2.mp3",
  "public/sounds/draw3.mp3",
  "public/sounds/draw4.mp3",
  "public/sounds/draw5.mp3",
]);

for (const base of ["draw", "fahhh", "shotgun"]) {
  const paths = spawnSync("git", ["ls-files", "public/sounds"], {
    cwd: root,
    encoding: "utf8",
  })
    .stdout.split("\n")
    .filter((p) => new RegExp(`^public/sounds/${base}\\.mp3$`, "i").test(p))
    .sort();
  assert.deepEqual(paths, [`public/sounds/${base}.mp3`], `${base}.mp3 must be tracked once (lowercase)`);
}

assert.doesNotThrow(
  () => assertNoGitPathCaseCollisions({ prefix: "public/sounds", cwd: root }),
  /Git path case collisions/,
);

console.log("check-git-path-case-collisions.test.mjs: ok");
