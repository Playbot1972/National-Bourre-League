import { expect, type Page } from "@playwright/test";

export interface TableFlowsFixtureOptions {
  scenario?: string;
  handNumber?: number;
  roomOptedIn?: boolean;
  leftRoom?: boolean;
  phase?: "decision" | "reveal" | "draw" | "play" | "enrollment";
}

export function tableFlowsFixtureUrl(options: TableFlowsFixtureOptions = {}): string {
  const qs = new URLSearchParams({ scenario: options.scenario ?? "default" });
  if (options.handNumber != null) qs.set("handNumber", String(options.handNumber));
  if (options.roomOptedIn) qs.set("roomOptedIn", "1");
  if (options.leftRoom) qs.set("leftRoom", "1");
  if (options.phase) qs.set("phase", options.phase);
  return `/e2e-fixtures/table-flows?${qs}`;
}

export async function openTableFlowsFixture(
  page: Page,
  options: TableFlowsFixtureOptions = {},
) {
  await page.goto(tableFlowsFixtureUrl(options));
  await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });
}

export async function readFixtureState(page: Page) {
  return page.evaluate(() => window.__tableFlowsFixture?.readState?.() ?? null);
}

export async function advanceFixture(page: Page, action: string, payload?: unknown) {
  await page.evaluate(
    ([act, data]) => window.__tableFlowsFixture?.advance?.(act, data),
    [action, payload] as const,
  );
}
