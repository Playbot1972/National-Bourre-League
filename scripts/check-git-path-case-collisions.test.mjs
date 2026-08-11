import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findCaseCollisions,
  scanGitPathCaseCollisions,
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

const { collisions } = scanGitPathCaseCollisions({ prefix: "public/sounds", cwd: root });
const drawCollisions = collisions.filter((c) => /draw[2-5]\.mp3$/.test(c.lower));
assert.equal(drawCollisions.length, 0, `draw2-5 collisions remain: ${JSON.stringify(drawCollisions)}`);

console.log("check-git-path-case-collisions.test.mjs: ok");
