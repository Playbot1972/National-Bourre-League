#!/usr/bin/env node
/**
 * Trace draw→play on live emulators — logs console for bot-orchestrator / nbl-flow.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:8080";

async function signUpHost(page) {
  await page.locator("#hero-signup").click();
  await page.waitForSelector("#auth-modal", { state: "visible" });
  const email = `trace-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill("Trace Host");
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();
  await page.waitForSelector("#auth-modal", { state: "hidden", timeout: 15_000 });
}

async function createRoom(page) {
  await page.locator('a.nav__link[href="#rooms"]').click();
  await page.waitForSelector("#view-rooms", { state: "visible" });
  await page.locator("#create-room").click();
  await page.locator("#create-room-name").fill("Trace Room");
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

async function readState(page) {
  const o = overlay(page);
  const phase =
    (await o.getByTestId("phase-tag").getAttribute("data-phase").catch(() => "")) ?? "";
  const phaseText = (await o.getByTestId("phase-tag").textContent().catch(() => "")) ?? "";
  const feedback =
    (await o.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
  const heroError =
    (await o.locator(".btable-hero__error").textContent().catch(() => "")) ?? "";
  const passVisible = await o.getByTestId("pass-draw-button").isVisible().catch(() => false);
  const drawVisible = await o.getByTestId("draw-button").isVisible().catch(() => false);
  const optInVisible = await o.getByTestId("seat-opt-in").first().isVisible().catch(() => false);
  return { phase, phaseText, feedback, heroError, passVisible, drawVisible, optInVisible };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const interesting = [];
  page.on("console", (msg) => {
    const t = msg.text();
    if (
      /\[bot-orchestrator\]|\[bot-advance\]|\[nbl-flow\]|\[session-orchestrator\]|advanceHandReveal|Could not|failed-precondition|network/i.test(
        t,
      )
    ) {
      interesting.push(t);
    }
  });

  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.setItem("nbl-game-flow-debug", "1");
    localStorage.setItem("nbl-invariants", "1");
  });
  await page.reload({ waitUntil: "networkidle" });

  await signUpHost(page);
  await createRoom(page);
  await openSessionWithBot(page);
  await goToTable(page);

  const deadline = Date.now() + 150_000;
  let lastLog = 0;
  while (Date.now() < deadline) {
    const s = await readState(page);
    if (Date.now() - lastLog > 3000) {
      console.log("STATE", JSON.stringify(s));
      lastLog = Date.now();
    }

    if (s.phase === "play") {
      console.log("SUCCESS: reached play phase");
      break;
    }

    if (s.optInVisible && (s.phase === "decision" || s.phaseText === "Choosing")) {
      await overlay(page).getByTestId("seat-opt-in").first().click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(800);
      continue;
    }

    if (s.passVisible || s.drawVisible) {
      const btn = s.passVisible
        ? overlay(page).getByTestId("pass-draw-button")
        : overlay(page).getByTestId("draw-button");
      await btn.click({ timeout: 5000 }).catch(() => btn.click({ force: true }));
      await page.waitForTimeout(1000);
      continue;
    }

    await page.waitForTimeout(500);
  }

  const final = await readState(page);
  console.log("FINAL", JSON.stringify(final));
  console.log("CONSOLE_TAIL");
  interesting.slice(-40).forEach((l) => console.log(l));
  await browser.close();
  process.exit(final.phase === "play" ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
