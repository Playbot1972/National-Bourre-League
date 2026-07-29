/**
 * Extended isolation: real-click only, validation failures, UX false-positives.
 * Run: node scripts/isolate-create-room-page2-sequences.mjs
 */
import { chromium, devices } from "@playwright/test";

const BASE = process.env.SOCIAL_URL || "http://127.0.0.1:8080";

async function signUpAndOpenPage2(page, label) {
  await page.goto(`${BASE}/`);
  await page.waitForSelector("#app-version", { timeout: 15_000 });
  await page.locator("#hero-signup").click();
  const email = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill(label);
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();
  await page.waitForFunction(() => document.getElementById("auth-modal")?.hidden === true, null, {
    timeout: 15_000,
  });
  const navRooms = page.locator('a.nav__link[href="#rooms"]');
  if (await navRooms.isVisible().catch(() => false)) await navRooms.click();
  else await page.getByRole("link", { name: /go to your rooms/i }).click();
  await page.waitForSelector("#view-rooms:not([hidden])", { timeout: 15_000 });
  await page.locator("#create-room").click();
  await page.locator("#create-room-name").fill(`${label} Room`);
  await page.locator("#create-room-form").evaluate((f) => f.requestSubmit());
  await page.waitForSelector('#create-room-form[data-step="settings"]');
}

function snapshotState() {
  const buyIn = document.getElementById("create-room-buy-in");
  const error = document.getElementById("create-room-error");
  const submit = document.getElementById("create-room-submit");
  return {
    buyInValue: buyIn?.value ?? null,
    buyInValueAsNumber: buyIn instanceof HTMLInputElement ? buyIn.valueAsNumber : null,
    activeElement: document.activeElement?.id || document.activeElement?.tagName || null,
    errorText: error?.textContent ?? "",
    errorHidden: error?.hidden ?? true,
    modalHidden: document.getElementById("create-room-modal")?.hidden ?? true,
    submitBusy: submit?.getAttribute("aria-busy") ?? null,
    sessionTabs: document.querySelectorAll("button.session-tab[data-open-session]").length,
    anteValue: document.getElementById("create-room-ante")?.value ?? null,
    rebuyChecked: document.getElementById("create-room-rebuy-enabled")?.checked ?? false,
  };
}

async function runCase(page, { caseId, label, setup, clickMode, viewport }) {
  await signUpAndOpenPage2(page, `Case ${caseId}`);
  await page.evaluate(() => {
    window.__crtSubmitLog = [];
    document.getElementById("create-room-form")?.addEventListener(
      "submit",
      () => {
        const buyIn = document.getElementById("create-room-buy-in");
        window.__crtSubmitLog.push({
          step: document.getElementById("create-room-form")?.dataset.step,
          buyInValue: buyIn?.value,
          buyInValueAsNumber: buyIn instanceof HTMLInputElement ? buyIn.valueAsNumber : null,
          active: document.activeElement?.id || document.activeElement?.tagName,
        });
      },
      true,
    );
  });

  await setup(page);
  const beforeSubmit = await page.evaluate(snapshotState);

  let clickResult = { method: clickMode, fired: false, error: null };
  const submit = page.locator("#create-room-submit");
  await submit.scrollIntoViewIfNeeded().catch(() => {});

  if (clickMode === "real-click-only") {
    try {
      await submit.click({ timeout: 8_000, force: false });
      clickResult = { method: "real-click-only", fired: true, error: null };
    } catch (err) {
      clickResult = { method: "real-click-only", fired: false, error: String(err).slice(0, 120) };
    }
  } else if (clickMode === "requestSubmit") {
    await page.locator("#create-room-form").evaluate((f) => f.requestSubmit());
    clickResult = { method: "requestSubmit", fired: true, error: null };
  } else if (clickMode === "button-evaluate-click") {
    await submit.evaluate((el) => el.click());
    clickResult = { method: "button-evaluate-click", fired: true, error: null };
  }

  await page.waitForTimeout(150);
  const after150ms = await page.evaluate(() => {
    const buyIn = document.getElementById("create-room-buy-in");
    const error = document.getElementById("create-room-error");
    const submit = document.getElementById("create-room-submit");
    return {
      buyInValue: buyIn?.value ?? null,
      buyInValueAsNumber: buyIn instanceof HTMLInputElement ? buyIn.valueAsNumber : null,
      activeElement: document.activeElement?.id || document.activeElement?.tagName || null,
      errorText: error?.textContent ?? "",
      errorHidden: error?.hidden ?? true,
      modalHidden: document.getElementById("create-room-modal")?.hidden ?? true,
      submitBusy: submit?.getAttribute("aria-busy") ?? null,
      sessionTabs: document.querySelectorAll("button.session-tab[data-open-session]").length,
      submitLog: window.__crtSubmitLog ?? [],
    };
  });
  await page.waitForTimeout(3_000);
  const after3s = await page.evaluate(snapshotState);

  const submitEventFired = after150ms.submitLog.length > 0;
  const submitSucceeded =
    submitEventFired &&
    (after150ms.submitBusy === "true" || after3s.modalHidden === true || after3s.sessionTabs > 0);
  const validationFailed =
    after150ms.errorHidden === false && after150ms.errorText !== "" && after3s.modalHidden !== true;
  const focusBuyInAfter =
    after150ms.activeElement === "create-room-buy-in" ||
    (after3s.activeElement === "create-room-buy-in" && after3s.modalHidden !== true);

  return {
    caseId,
    label,
    viewport,
    clickResult,
    beforeSubmit,
    after150ms,
    after3s,
    submitEventFired,
    submitSucceeded,
    validationFailed,
    focusBuyInAfter,
    inlineError: validationFailed ? after150ms.errorText : null,
    creationStarted: after150ms.submitBusy === "true" || after3s.sessionTabs > 0 || after3s.modalHidden,
  };
}

const CASES = [
  {
    caseId: "1",
    label: "type 5, no rebuy",
    setup: async (page) => {
      const buyIn = page.locator("#create-room-buy-in");
      await buyIn.click();
      await buyIn.press("ControlOrMeta+a");
      await buyIn.type("5");
    },
  },
  {
    caseId: "2",
    label: "type 5, blur buy-in first",
    setup: async (page) => {
      const buyIn = page.locator("#create-room-buy-in");
      await buyIn.click();
      await buyIn.press("ControlOrMeta+a");
      await buyIn.type("5");
      await buyIn.blur();
    },
  },
  {
    caseId: "3",
    label: "keyboard/stepper only to 5",
    setup: async (page) => {
      const buyIn = page.locator("#create-room-buy-in");
      await buyIn.focus();
      for (let i = 0; i < 95; i += 1) await buyIn.press("ArrowDown");
    },
  },
  {
    caseId: "4",
    label: "type 5, change ante only",
    setup: async (page) => {
      const buyIn = page.locator("#create-room-buy-in");
      await buyIn.click();
      await buyIn.press("ControlOrMeta+a");
      await buyIn.type("5");
      await page.locator("#create-room-ante").selectOption({ index: 2 });
    },
  },
  {
    caseId: "5",
    label: "type 5, toggle rebuy (baseline)",
    setup: async (page) => {
      const buyIn = page.locator("#create-room-buy-in");
      await buyIn.click();
      await buyIn.press("ControlOrMeta+a");
      await buyIn.type("5");
      await page.locator("#create-room-rebuy-enabled").evaluate((el) => {
        el.checked = true;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    },
  },
  {
    caseId: "6",
    label: "clear buy-in to empty then submit (invalid)",
    setup: async (page) => {
      const buyIn = page.locator("#create-room-buy-in");
      await buyIn.click();
      await buyIn.press("ControlOrMeta+a");
      await buyIn.press("Backspace");
    },
  },
  {
    caseId: "7",
    label: "fill 5 then clear to empty, toggle rebuy, submit",
    setup: async (page) => {
      await page.locator("#create-room-buy-in").fill("5");
      await page.locator("#create-room-buy-in").fill("");
      await page.locator("#create-room-rebuy-enabled").evaluate((el) => {
        el.checked = true;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    },
  },
];

async function main() {
  const browser = await chromium.launch();
  const results = [];
  const matrix = [
    { viewport: "desktop", clickMode: "requestSubmit" },
    { viewport: "desktop", clickMode: "real-click-only" },
    { viewport: "desktop", clickMode: "button-evaluate-click" },
    { viewport: "iphone", clickMode: "real-click-only" },
  ];

  for (const { viewport, clickMode } of matrix) {
    for (const spec of CASES) {
      const context =
        viewport === "iphone"
          ? await browser.newContext({ ...devices["iPhone 13"], viewport: { width: 390, height: 844 } })
          : await browser.newContext({ viewport: { width: 1280, height: 720 } });
      const page = await context.newPage();
      try {
        results.push(await runCase(page, { ...spec, clickMode, viewport }));
      } catch (err) {
        results.push({ caseId: spec.caseId, viewport, clickMode, error: String(err) });
      } finally {
        await context.close();
      }
    }
  }
  await browser.close();

  console.log("\n=== ALL RESULTS ===");
  for (const r of results) {
    console.log(
      JSON.stringify(
        {
          case: r.caseId,
          label: r.label,
          viewport: r.viewport,
          click: r.clickResult,
          beforeSubmit: r.beforeSubmit,
          submitEventFired: r.submitEventFired,
          submitSucceeded: r.submitSucceeded,
          validationFailed: r.validationFailed,
          focusBuyInAfter: r.focusBuyInAfter,
          inlineError: r.inlineError,
          after150ms: r.after150ms
            ? {
                activeElement: r.after150ms.activeElement,
                buyInValue: r.after150ms.buyInValue,
                errorText: r.after150ms.errorText,
                submitBusy: r.after150ms.submitBusy,
                submitLog: r.after150ms.submitLog,
              }
            : null,
          after3s: r.after3s,
        },
        null,
        2,
      ),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
