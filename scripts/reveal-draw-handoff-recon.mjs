#!/usr/bin/env node
/**
 * Live recon: watch reveal→draw handoff through up to 5 hands on emulators.
 * Requires: npm run emulators + npm run social (localhost:8080)
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
const MAX_HANDS = 5;
const HAND_TIMEOUT_MS = 120_000;

async function signUpHost(page) {
  await page.locator("#hero-signup").click();
  await page.waitForSelector("#auth-modal", { state: "visible" });
  const email = `recon-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill("Recon Host");
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();
  await page.waitForSelector("#auth-modal", { state: "hidden", timeout: 15_000 });
}

async function createRoom(page) {
  await page.locator('a.nav__link[href="#rooms"]').click();
  await page.waitForSelector("#view-rooms", { state: "visible" });
  await page.locator("#create-room").click();
  await page.locator("#create-room-name").fill("Reveal Recon");
  await page.locator("#create-room-ante").selectOption({ index: 1 });
  await page.locator("#create-room-form").evaluate((f) => f.requestSubmit());
  await page.waitForSelector(".room-detail__title", { timeout: 15_000 });
}

async function openSessionWithBot(page) {
  await page.waitForTimeout(300);
  page.once("dialog", (d) => d.accept());
  await page.locator("#new-session").click({ force: true });
  await page.waitForSelector('[data-testid="session-setup-window"]', { timeout: 15_000 });
  await page.getByTestId("add-player-robot").check();
  await page.getByTestId("session-add-player-pill").click();
  await page.waitForSelector('.game-setup-roster__role:has-text("robot")', { timeout: 15_000 });
}

async function goToTable(page) {
  const goBtn = page.getByTestId("open-table-play").first();
  await goBtn.waitFor({ state: "visible", timeout: 15_000 });
  await goBtn.click();
  await page.waitForSelector("#table-play-overlay", { state: "visible" });
  await page.waitForSelector('[data-testid="table-root"]', { timeout: 30_000 });
}

function overlay(page) {
  return page.locator("#table-play-overlay");
}

async function readPhase(page) {
  const o = overlay(page);
  const phase = (await o.getByTestId("phase-tag").getAttribute("data-phase").catch(() => "")) ?? "";
  const handText = (await o.locator(".btable-session__title").textContent().catch(() => "")) ?? "";
  const handMatch = handText.match(/Hand #(\d+)/);
  return { phase, handNumber: handMatch ? Number(handMatch[1]) : null };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const advanceCalls = [];
  const phaseLog = [];

  page.on("console", (msg) => {
    const t = msg.text();
    if (t.includes("advanceHandReveal")) advanceCalls.push({ t: Date.now(), text: t });
  });

  await page.goto(`${BASE}/?gameFlowDebug=1`);
  await page.evaluate(() => localStorage.setItem("nbl-game-flow-debug", "1"));
  await page.reload({ waitUntil: "networkidle" });

  await signUpHost(page);
  await createRoom(page);
  await openSessionWithBot(page);
  await goToTable(page);

  const handoffs = [];
  let lastPhase = "";
  let lastHand = 0;
  const start = Date.now();

  while (Date.now() - start < MAX_HANDS * HAND_TIMEOUT_MS) {
    const { phase, handNumber } = await readPhase(page);
    if (phase !== lastPhase || handNumber !== lastHand) {
      phaseLog.push({ at: Date.now() - start, handNumber, phase });
      if (lastPhase === "reveal" && phase === "draw" && handNumber != null) {
        handoffs.push({ handNumber, ms: Date.now() - start });
      }
      lastPhase = phase;
      lastHand = handNumber ?? lastHand;
    }

    if (handoffs.length >= MAX_HANDS) break;

    const o = overlay(page);
    const optIn = await o.getByTestId("seat-opt-in").first().isVisible().catch(() => false);
    if (optIn && (phase === "decision" || phase === "reveal")) {
      await o.getByTestId("seat-opt-in").first().click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(500);
      continue;
    }

    const passBtn = o.getByTestId("pass-draw-button");
    const drawBtn = o.getByTestId("draw-button");
    if (await passBtn.isVisible().catch(() => false)) {
      await passBtn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(800);
      continue;
    }
    if (await drawBtn.isVisible().catch(() => false)) {
      await drawBtn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(800);
      continue;
    }

    await page.waitForTimeout(400);
  }

  await browser.close();

  console.log("\n=== Reveal→Draw Live Recon ===\n");
  console.log(`Handoffs observed (reveal→draw): ${handoffs.length}`);
  for (const h of handoffs) {
    console.log(`  Hand #${h.handNumber} at +${h.ms}ms`);
  }
  console.log(`\nPhase transitions (last 20):`);
  for (const p of phaseLog.slice(-20)) {
    console.log(`  +${p.at}ms hand=${p.handNumber} phase=${p.phase}`);
  }
  console.log(`\nadvanceHandReveal console lines: ${advanceCalls.length}`);

  const pass = handoffs.length >= 1;
  if (!pass) {
    console.error("\nFAIL: no reveal→draw handoff observed in live session");
    process.exit(1);
  }
  console.log("\nPASS: live reveal→draw handoff observed");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
