import { test as base, expect } from "@playwright/test";

/** Benign browser noise that should not fail smoke tests. */
const IGNORE_CONSOLE = [
  /favicon\.ico/i,
  /Failed to load resource: the server responded with a status of 404/i,
  /Null value error/i,
  /evaluation error at L119/i,
];

function ignorableConsole(text: string): boolean {
  return IGNORE_CONSOLE.some((pattern) => pattern.test(text));
}

/**
 * Playwright test base that fails when console.error or uncaught page errors occur.
 * Use for Bourré table smoke specs.
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (ignorableConsole(text)) return;
      errors.push(`console.error: ${text}`);
    });

    page.on("pageerror", (err) => {
      const msg = err.message;
      if (IGNORE_CONSOLE.some((pattern) => pattern.test(msg))) return;
      errors.push(`pageerror: ${msg}`);
    });

    await use(page);

    if (errors.length > 0) {
      throw new Error(
        `Browser runtime errors during "${testInfo.title}":\n${errors.map((e) => `  • ${e}`).join("\n")}`,
      );
    }
  },
});

export { expect };
