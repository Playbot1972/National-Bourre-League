import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], browserName: "chromium" },
      testIgnore: [/table-smoke\.mobile\.spec\.ts$/, /table-overlay-mobile\.spec\.ts$/],
    },
    {
      name: "mobile-pixel5",
      use: { ...devices["Pixel 5 landscape"], browserName: "chromium", hasTouch: true },
      testMatch: [/table-smoke\.mobile\.spec\.ts$/, /table-card-play\.spec\.ts$/, /table-overlay-mobile\.spec\.ts$/, /table-overlay-enrollment\.spec\.ts$/],
    },
    {
      name: "mobile-iphone-portrait",
      use: { ...devices["iPhone 13"], browserName: "chromium", hasTouch: true },
      testMatch: [/table-smoke\.mobile\.spec\.ts$/, /table-overlay-mobile\.spec\.ts$/, /table-overlay-enrollment\.spec\.ts$/],
    },
    {
      name: "mobile-landscape",
      use: { ...devices["iPhone 13 landscape"], browserName: "chromium" },
      testMatch: [/table-players\.spec\.ts$/, /table-overlay-mobile\.spec\.ts$/],
    },
    {
      name: "tablet-landscape",
      use: { ...devices["iPad (gen 7) landscape"], browserName: "chromium" },
      testMatch: [/table-layout\.spec\.ts$/],
    },
  ],
  webServer: {
    command: "npm run social",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
