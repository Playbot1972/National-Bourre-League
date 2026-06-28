#!/usr/bin/env node
/**
 * Merge-gate smoke — Phase B1 (auth emulator + sign-up).
 * Run with emulators + social already up on localhost:8080.
 */
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

/** @type {string[]} */
const consoleLines = [];

function report(phase, step, expected, actual) {
  console.log(`Phase: ${phase}`);
  console.log(`Step: ${step}`);
  console.log(`Expected: ${expected}`);
  console.log(`Actual: ${actual}`);
  console.log("---");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    const line = `[${msg.type()}] ${msg.text()}`;
    consoleLines.push(line);
  });

  await page.goto("about:blank");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    localStorage.setItem("nbl-game-flow-debug", "1");
    localStorage.setItem("nbl-invariants", "1");
  });
  await page.reload({ waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(2000);

  const authConnected = consoleLines.some((l) =>
    /\[nbl-dev\] Auth emulator connected/i.test(l),
  );
  const firebaseEmulators = consoleLines.filter((l) => /\[nbl-dev\]/i.test(l));

  if (!authConnected) {
    report(
      "B",
      "B1 — page load emulator wiring",
      "[nbl-dev] Auth emulator connected in console",
      `${firebaseEmulators.join(" | ") || "no nbl-dev lines yet"}`,
    );
    await browser.close();
    process.exit(1);
  }

  report(
    "B",
    "B1 — page load emulator wiring",
    "[nbl-dev] Auth emulator connected",
    consoleLines.find((l) => /Auth emulator connected/i.test(l)) ?? "found",
  );

  await page.locator("#hero-signup").click();
  await page.waitForSelector("#auth-modal", { state: "visible", timeout: 10_000 });

  const email = `smoke-b1-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill("Smoke B1");
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();

  try {
    await page.waitForSelector("#auth-modal", { state: "hidden", timeout: 15_000 });
    report(
      "B",
      "B1 — email sign-up",
      "Auth modal closes; user signed in",
      `Signed up as ${email}; modal hidden`,
    );
    await browser.close();
    process.exit(0);
  } catch (err) {
    const errText =
      (await page.locator("#auth-error").textContent().catch(() => "")) ?? "";
    const nblDev = consoleLines.filter((l) => /\[nbl-dev\]|auth|network/i.test(l));
    report(
      "B",
      "B1 — email sign-up",
      "Auth modal closes; user signed in",
      `${errText || String(err)} | console: ${nblDev.slice(-5).join(" | ")}`,
    );
    await browser.close();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
