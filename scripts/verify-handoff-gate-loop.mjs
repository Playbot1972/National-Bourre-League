#!/usr/bin/env node
/**
 * 3-hand orchestration loop — validates handoff-recovery gate under nbl-game-flow-debug.
 *
 * Usage:
 *   VERIFY_BASE_URL=https://booray.win/social node scripts/verify-handoff-gate-loop.mjs
 *   VERIFY_BASE_URL=http://localhost:8080 node scripts/verify-handoff-gate-loop.mjs
 */
import { chromium } from "playwright";

const BASE = (process.env.VERIFY_BASE_URL ?? "https://booray.win/social").replace(/\/$/, "");
const TARGET_HANDS = Number(process.env.VERIFY_HAND_COUNT ?? 3);
const DEADLINE_MS = Number(process.env.VERIFY_DEADLINE_MS ?? 900_000);

/** @type {Array<{ ts: number; line: string; kind: string }>} */
const events = [];

function classify(line) {
  if (/\[HAND-TRANSITION[^\]]*\]\s*ROUND_ADVANCE/i.test(line)) return "round_advance";
  if (/robot-block-first-seen/i.test(line)) return "robot_block_first";
  if (/robot-force-unblock/i.test(line)) return "robot_force_unblock";
  if (/robot-block-soft-timeout/i.test(line)) return "robot_block_soft";
  if (/client-fallback/i.test(line)) return "client_fallback";
  if (/\[game-functions\] Callable failed:.*functions\/internal/i.test(line)) {
    return "callable_internal";
  }
  if (/\[game-functions\] Callable failed:.*gameRecordHand/i.test(line)) {
    return "callable_record_hand";
  }
  if (/advanceSessionBots: FirebaseError: INTERNAL/i.test(line)) return "callable_internal";
  if (/CORS|403 Forbidden/i.test(line)) return "callable_error";
  if (/\[bot-orchestrator\].*error/i.test(line) && /INTERNAL/i.test(line)) {
    return "callable_internal";
  }
  return null;
}

function parseRoundAdvance(line) {
  const m = line.match(/ROUND_ADVANCE[^\{]*(\{[\s\S]*\})?/);
  if (!m?.[1]) return {};
  try {
    return JSON.parse(m[1]);
  } catch {
    return { raw: m[1] };
  }
}

function overlay(page) {
  return page.locator("#table-play-overlay");
}

async function readHandNumber(page) {
  const title =
    (await page.locator("#table-play-overlay-title").textContent().catch(() => "")) ?? "";
  const tableHand =
    (await overlay(page)
      .locator(".btable-session__phase-tag")
      .first()
      .textContent()
      .catch(() => "")) ?? "";
  const combined = `${title} ${tableHand}`;
  const m = combined.match(/Hand\s*#(\d+)/i);
  return m ? Number(m[1]) : null;
}

async function readPhase(page) {
  const o = overlay(page);
  const header =
    (await o.getByTestId("phase-tag").first().getAttribute("data-phase").catch(() => "")) ?? "";
  const center =
    (await o.getByTestId("phase-tag-center").getAttribute("data-phase").catch(() => "")) ?? "";
  return header || center || "";
}

async function signUpHost(page) {
  await page.locator("#hero-signup").click();
  await page.waitForSelector("#auth-modal", { state: "visible" });
  const email = `handoff-loop-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill("Handoff Loop");
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();
  await page.waitForSelector("#auth-modal", { state: "hidden", timeout: 20_000 });
  return email;
}

async function createRoom(page) {
  await page.locator('a.nav__link[href="#rooms"]').click();
  await page.waitForSelector("#view-rooms", { state: "visible" });
  await page.locator("#create-room").click();
  await page.locator("#create-room-name").fill("Handoff Gate Loop");
  await page.locator("#create-room-ante").selectOption({ index: 1 });
  await page.locator("#create-room-form").evaluate((f) => f.requestSubmit());
  await page.waitForSelector(".room-detail__title", { timeout: 20_000 });
}

async function openSessionWithBot(page) {
  await page.waitForTimeout(300);
  page.once("dialog", (d) => d.accept());
  await page.locator("#new-session").click({ force: true });
  await page.waitForSelector('[data-testid="session-setup-window"]', { timeout: 20_000 });
  await page.getByTestId("add-player-robot").check();
  await page.getByTestId("session-add-player-pill").click();
  await page.waitForSelector('.game-setup-roster__role:has-text("robot")', { timeout: 20_000 });
}

async function goToTable(page) {
  const goBtn = page.getByTestId("open-table-play").first();
  await goBtn.waitFor({ state: "visible", timeout: 20_000 });
  await goBtn.click();
  await page.waitForSelector("#table-play-overlay", { state: "visible" });
  await page.waitForSelector('[data-testid="table-root"]', { timeout: 40_000 });
}

async function tryEnrollment(page, lastClick) {
  const o = overlay(page);
  const phase = await readPhase(page);
  if (phase === "draw" || phase === "play") return false;
  const optIn = o.getByTestId("seat-opt-in").first();
  if (!(await optIn.isVisible().catch(() => false))) return false;
  if (Date.now() - lastClick.at < 1500) return false;
  await optIn.click({ timeout: 5000 }).catch(() => optIn.click({ force: true }));
  lastClick.at = Date.now();
  await page.waitForTimeout(800);
  return true;
}

async function tryDrawPass(page, lastClick) {
  const o = overlay(page);
  const phase = await readPhase(page);
  if (phase === "play") return false;
  const pass = o.getByTestId("pass-draw-button");
  const draw = o.getByTestId("draw-button");
  const hasPass = await pass.isVisible().catch(() => false);
  const hasDraw = await draw.isVisible().catch(() => false);
  if (!hasPass && !hasDraw) return false;
  if (Date.now() - lastClick.at < 1200) return false;
  const btn = hasPass ? pass : draw;
  await btn.evaluate((el) => el.click()).catch(() => btn.click({ force: true }));
  lastClick.at = Date.now();
  await page.waitForTimeout(1000);
  return true;
}

async function tryPlayCard(page, lastClick) {
  const o = overlay(page);
  const phase = await readPhase(page);
  if (phase !== "play") return false;
  const playBtn = o.locator('[data-testid="play-button"]:visible').first();
  if (!(await playBtn.isVisible().catch(() => false))) return false;
  if (Date.now() - lastClick.at < 800) return false;
  await playBtn.evaluate((el) => el.click()).catch(() => playBtn.click({ force: true }));
  lastClick.at = Date.now();
  await page.waitForTimeout(700);
  return true;
}

async function trySettlementVote(page) {
  const agree = overlay(page).getByTestId("settlement-agree-btn");
  if (!(await agree.isVisible().catch(() => false))) return false;
  if (!(await agree.isEnabled().catch(() => false))) return false;
  await agree.click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(500);
  return true;
}

function analyze() {
  const roundAdvances = events.filter((e) => e.kind === "round_advance");
  const midHandNoise = [];
  const boundaryAdvances = [];

  for (const ev of roundAdvances) {
    const data = parseRoundAdvance(ev.line);
    const phase = data.handPhase ?? data.phase ?? null;
    const tricks = data.trickCount ?? data.tricks ?? null;
    const blocked = data.blocked === true;
    const isMidHand =
      !blocked &&
      (phase === "draw" ||
        phase === "play" ||
        (typeof tricks === "number" && tricks > 0 && tricks < 5));
    if (isMidHand) midHandNoise.push({ ...data, line: ev.line });
    else boundaryAdvances.push({ ...data, blocked, line: ev.line });
  }

  const robotFirst = events.filter((e) => e.kind === "robot_block_first");
  const robotForce = events.filter((e) => e.kind === "robot_force_unblock");
  const callableErrors = events.filter(
    (e) => e.kind === "callable_error" || e.kind === "callable_internal",
  );
  const clientFallbacks = events.filter((e) => e.kind === "client_fallback");

  const sustainedRobotChurn =
    robotForce.length >= 2 ||
    robotFirst.length >= 6 ||
    robotFirst.length + robotForce.length >= 8;

  return {
    roundAdvanceTotal: roundAdvances.length,
    midHandNoise,
    boundaryAdvances,
    robotBlockFirst: robotFirst.length,
    robotForceUnblock: robotForce.length,
    robotBlockSoft: events.filter((e) => e.kind === "robot_block_soft").length,
    sustainedRobotChurn,
    clientFallbackCount: clientFallbacks.length,
    callableInternalCount: events.filter((e) => e.kind === "callable_internal").length,
    gameRecordHandErrors: events.filter((e) => e.kind === "callable_record_hand").length,
    callableErrors: callableErrors.map((e) => e.line),
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    const line = msg.text();
    const kind = classify(line);
    if (kind) events.push({ ts: Date.now(), line, kind });
    if (/\[HAND-TRANSITION|\[nbl-flow\]|robot-block|ROUND_ADVANCE|FirebaseError|CORS/i.test(line)) {
      process.stderr.write(`${line}\n`);
    }
  });

  page.on("pageerror", (err) => {
    events.push({ ts: Date.now(), line: String(err), kind: "callable_error" });
    process.stderr.write(`PAGEERROR ${err}\n`);
  });

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60_000 });
  await page.evaluate(() => {
    localStorage.setItem("nbl-game-flow-debug", "1");
  });
  await page.reload({ waitUntil: "networkidle", timeout: 60_000 });

  const version =
    (await page.locator("#app-version").textContent().catch(() => "")) ?? "unknown";
  console.log(`BASE=${BASE} version=${version.trim()}`);

  await signUpHost(page);
  await createRoom(page);
  await openSessionWithBot(page);
  await goToTable(page);

  const lastClick = { at: 0 };
  let handsCompleted = 0;
  let lastHandNum = (await readHandNumber(page)) ?? 1;
  const deadline = Date.now() + DEADLINE_MS;
  let lastProgressLog = 0;

  while (handsCompleted < TARGET_HANDS && Date.now() < deadline) {
    const handNum = (await readHandNumber(page)) ?? lastHandNum;
    const phase = await readPhase(page);

    if (handNum > lastHandNum) {
      handsCompleted += 1;
      console.log(`HAND_COMPLETE ${handsCompleted}/${TARGET_HANDS} (now Hand #${handNum})`);
      lastHandNum = handNum;
    }

    if (Date.now() - lastProgressLog > 15_000) {
      console.log(`PROGRESS hands=${handsCompleted}/${TARGET_HANDS} handNum=${handNum} phase=${phase}`);
      lastProgressLog = Date.now();
    }

    if (await trySettlementVote(page)) continue;
    if (await tryEnrollment(page, lastClick)) continue;
    if (await tryDrawPass(page, lastClick)) continue;
    if (await tryPlayCard(page, lastClick)) continue;

    if (BASE.includes("localhost") || BASE.includes("127.0.0.1")) {
      await page.evaluate(() => window.__nblE2E?.nudgeBots?.()).catch(() => {});
    }

    await page.waitForTimeout(400);
  }

  const analysis = analyze();
  const timedOut = handsCompleted < TARGET_HANDS;

  const report = {
    ok:
      !timedOut &&
      analysis.midHandNoise.length === 0 &&
      !analysis.sustainedRobotChurn &&
      analysis.callableInternalCount === 0 &&
      analysis.gameRecordHandErrors === 0 &&
      analysis.clientFallbackCount === 0 &&
      analysis.callableErrors.length === 0,
    base: BASE,
    version: version.trim(),
    handsCompleted,
    targetHands: TARGET_HANDS,
    timedOut,
    ...analysis,
  };

  console.log("REPORT", JSON.stringify(report, null, 2));

  if (analysis.midHandNoise.length) {
    console.log("MID_HAND_ROUND_ADVANCE_SAMPLES");
    analysis.midHandNoise.slice(0, 5).forEach((x) => console.log(x.line ?? JSON.stringify(x)));
  }
  if (analysis.callableErrors.length) {
    console.log("CALLABLE_ERRORS");
    analysis.callableErrors.slice(0, 10).forEach((l) => console.log(l));
  }

  await browser.close();
  process.exit(report.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});