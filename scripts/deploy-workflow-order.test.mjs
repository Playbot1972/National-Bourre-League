/**
 * CI deploy workflow must deploy Cloud Functions before Hosting on main.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deployYaml = readFileSync(join(root, ".github/workflows/deploy.yml"), "utf8");
const functionsYaml = readFileSync(join(root, ".github/workflows/deploy-functions.yml"), "utf8");

function stepNames(yaml) {
  const names = [];
  for (const line of yaml.split("\n")) {
    const match = line.match(/^      - name: (.+)$/);
    if (match) names.push(match[1]);
  }
  return names;
}

describe("deploy.yml production order", () => {
  it("builds Functions before Hosting", () => {
    const names = stepNames(deployYaml);
    const buildFunctions = names.indexOf("Build Cloud Functions bundle");
    const buildHosting = names.indexOf("Build hosting bundle");
    assert.ok(buildFunctions >= 0, "missing Build Cloud Functions bundle step");
    assert.ok(buildHosting >= 0, "missing Build hosting bundle step");
    assert.ok(buildFunctions < buildHosting, "Functions build must precede Hosting build");
  });

  it("deploys Functions and rules before Hosting", () => {
    const names = stepNames(deployYaml);
    const deployFunctions = names.indexOf("Deploy Cloud Functions and Firestore rules");
    const deployHosting = names.indexOf("Deploy Hosting");
    assert.ok(deployFunctions >= 0);
    assert.ok(deployHosting >= 0);
    assert.ok(deployFunctions < deployHosting, "Functions deploy must precede Hosting deploy");
  });

  it("verifies draw-mutating functions before Hosting build", () => {
    const names = stepNames(deployYaml);
    const verify = names.indexOf("Verify draw-mutating Cloud Functions");
    const buildHosting = names.indexOf("Build hosting bundle");
    assert.ok(verify >= 0, "missing function verification step");
    assert.ok(verify < buildHosting, "function verification must precede Hosting build");
  });

  it("does not deploy Firestore rules after Hosting", () => {
    assert.doesNotMatch(deployYaml, /- name: Deploy Firestore rules/);
  });
});

describe("deploy-functions.yml", () => {
  it("deploys Functions and Firestore rules together", () => {
    assert.match(functionsYaml, /ONLY="functions,firestore:rules"/);
    assert.match(functionsYaml, /workflow_dispatch/);
  });
});

console.log("deploy-workflow-order.test.mjs: ok");
