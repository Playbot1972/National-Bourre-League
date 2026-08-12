/**
 * CI deploy workflow must deploy full functions,firestore:rules before Hosting.
 * gcOrphanRooms recovery may run as an interim targeted step only.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deployYaml = readFileSync(join(root, ".github/workflows/deploy.yml"), "utf8");
const functionsYaml = readFileSync(join(root, ".github/workflows/deploy-functions.yml"), "utf8");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function stepNames(yaml) {
  const names = [];
  for (const line of yaml.split("\n")) {
    const match = line.match(/^      - name: (.+)$/);
    if (match) names.push(match[1]);
  }
  return names;
}

function stepIndex(names, label) {
  const idx = names.indexOf(label);
  assert.ok(idx >= 0, `missing step: ${label}`);
  return idx;
}

describe("deploy.yml — scheduler exists path", () => {
  it("runs full functions,firestore:rules deploy before Hosting", () => {
    const names = stepNames(deployYaml);
    const fullDeploy = stepIndex(names, "Deploy Cloud Functions and Firestore rules");
    const verify = stepIndex(names, "Verify draw-mutating Cloud Functions");
    const buildHosting = stepIndex(names, "Build hosting bundle");
    const deployHosting = stepIndex(names, "Deploy Hosting");
    assert.ok(fullDeploy < verify);
    assert.ok(verify < buildHosting);
    assert.ok(buildHosting < deployHosting);
  });

  it("always invokes functions,firestore:rules in the full deploy step", () => {
    const block = deployYaml.split("- name: Deploy Cloud Functions and Firestore rules")[1]?.split(
      "- name: Verify draw-mutating",
    )[0];
    assert.ok(block, "full deploy step block missing");
    assert.match(block, /functions,firestore:rules/);
    assert.doesNotMatch(
      block,
      /if \[\[ "\$\{\{ steps\.gc_orphan\.outputs\.force_gc_orphan_deploy \}\}" == "true" \]\][\s\S]*ONLY="functions:gcOrphanRooms"/,
      "recovery must not replace full deploy in the same step",
    );
  });
});

describe("deploy.yml — scheduler missing path", () => {
  it("allows targeted gcOrphanRooms recovery before mandatory full deploy", () => {
    const names = stepNames(deployYaml);
    const recovery = stepIndex(names, "Recover gcOrphanRooms scheduler (targeted)");
    const fullDeploy = stepIndex(names, "Deploy Cloud Functions and Firestore rules");
    const verify = stepIndex(names, "Verify draw-mutating Cloud Functions");
    const buildHosting = stepIndex(names, "Build hosting bundle");
    assert.ok(recovery < fullDeploy, "recovery must precede full deploy");
    assert.ok(fullDeploy < verify);
    assert.ok(verify < buildHosting);
  });

  it("recovery step deploys only gcOrphanRooms when force flag is true", () => {
    const block = deployYaml.split("- name: Recover gcOrphanRooms scheduler (targeted)")[1]?.split(
      "- name: Deploy Cloud Functions",
    )[0];
    assert.ok(block);
    assert.match(block, /force_gc_orphan_deploy == 'true'/);
    assert.match(block, /functions:gcOrphanRooms/);
    assert.doesNotMatch(block, /functions,firestore:rules/);
  });
});

describe("deploy.yml production order", () => {
  it("builds Functions before Hosting", () => {
    const names = stepNames(deployYaml);
    assert.ok(
      stepIndex(names, "Build Cloud Functions bundle") <
        stepIndex(names, "Build hosting bundle"),
    );
  });

  it("does not deploy Firestore rules after Hosting", () => {
    assert.doesNotMatch(deployYaml, /- name: Deploy Firestore rules/);
  });
});

describe("deploy-functions.yml", () => {
  it("deploys Functions and Firestore rules together after optional recovery", () => {
    const names = stepNames(functionsYaml);
    const recovery = names.indexOf("Recover gcOrphanRooms scheduler (targeted)");
    const fullDeploy = stepIndex(names, "Deploy Cloud Functions and Firestore rules");
    assert.ok(recovery < fullDeploy);
    assert.match(functionsYaml, /functions,firestore:rules/);
    assert.match(functionsYaml, /workflow_dispatch/);
  });
});

describe("package.json local deploy safety", () => {
  it("deploy runs deploy:functions before deploy:hosting", () => {
    const deploy = packageJson.scripts.deploy;
    assert.match(deploy, /npm run deploy:functions/);
    assert.match(deploy, /npm run deploy:hosting/);
    const fnIdx = deploy.indexOf("deploy:functions");
    const hostIdx = deploy.indexOf("deploy:hosting");
    assert.ok(fnIdx < hostIdx, "deploy:functions must precede deploy:hosting in npm run deploy");
    assert.doesNotMatch(
      deploy,
      /firebase deploy --only hosting,firestore:rules,functions/,
      "npm run deploy must not use combined firebase deploy",
    );
  });

  it("documents combined unsafe deploy separately from approved deploy", () => {
    assert.ok(packageJson.scripts["deploy:combined-unsafe"]);
    assert.match(
      packageJson.scripts["deploy:combined-unsafe"],
      /firebase deploy --only hosting,firestore:rules,functions/,
    );
    assert.notEqual(packageJson.scripts.deploy, packageJson.scripts["deploy:combined-unsafe"]);
  });

  it("preserves explicit deploy:functions and deploy:hosting", () => {
    assert.match(packageJson.scripts["deploy:functions"], /functions,firestore:rules/);
    assert.match(packageJson.scripts["deploy:hosting"], /firebase deploy --only hosting/);
  });
});

console.log("deploy-workflow-order.test.mjs: ok");
