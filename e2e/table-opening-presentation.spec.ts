import { test, expect } from "./fixtures/consoleGuard";
import { openTableFixture } from "./helpers/tableSmoke";

const REACT_310 = /Rendered more hooks than during the previous render|Minified React error #310/;
const MOTION_PATH_PLUGIN = /Invalid property motionPath|Missing plugin\? gsap\.registerPlugin/;

test.describe("Opening hand presentation — ante through trump reveal", () => {
  test("ante fly-in completes without crash; deal completes and trump reveal unblocks", async ({
    page,
  }) => {
    const hookErrors: string[] = [];
    const pageErrors: string[] = [];
    const presentationPhases: string[] = [];
    let lastLoggedPhase = "";
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
      if (REACT_310.test(err.message)) hookErrors.push(err.message);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        pageErrors.push(text);
        if (REACT_310.test(text)) hookErrors.push(text);
      }
    });

    await openTableFixture(page, { players: 4, bots: 1, phase: "reveal", tick: false });

    const root = page.getByTestId("table-root");
    await expect(root).toBeVisible();
    await expect(page.getByTestId("table-felt")).toBeVisible();
    await expect(page.getByTestId("pot-display")).toBeVisible();

    await expect
      .poll(async () => {
        const phase = await root.getAttribute("data-presentation-phase");
        if (phase && phase !== lastLoggedPhase) {
          presentationPhases.push(phase);
          lastLoggedPhase = phase;
        }
        return phase;
      }, { timeout: 20_000 })
      .not.toBe("ante");

    await expect(page.getByTestId("table-felt")).toBeVisible();

    await expect
      .poll(async () => root.getAttribute("data-presentation-phase"), { timeout: 15_000 })
      .toBe("deal");

    await expect
      .poll(async () => root.getAttribute("data-presentation-phase"), { timeout: 15_000 })
      .not.toBe("deal");

    await expect
      .poll(async () => root.getAttribute("data-presentation-phase"), { timeout: 15_000 })
      .toMatch(/^(trumpReveal|drawPlayer|drawReady|play|idle)$/);

    await expect(page.locator(".bseat")).toHaveCount(4);
    await expect(page.getByTestId("trump-button")).toBeVisible({ timeout: 15_000 });

    const motionPathErrors = pageErrors.filter((e) => MOTION_PATH_PLUGIN.test(e));
    expect(motionPathErrors, `GSAP MotionPathPlugin error: ${motionPathErrors.join("; ")}`).toHaveLength(
      0,
    );

    const anteReentryLoops = presentationPhases.reduce((count, phase, index) => {
      if (index > 0 && phase === "ante" && presentationPhases[index - 1] === "ante") {
        return count + 1;
      }
      return count;
    }, 0);
    expect(anteReentryLoops, `ante -> ante transitions: ${presentationPhases.join(" -> ")}`).toBe(0);

    expect(hookErrors, `React hook-order crash: ${hookErrors.join("; ")}`).toHaveLength(0);
    expect(
      pageErrors.filter((e) => !/favicon/i.test(e)),
      `Unexpected page errors: ${pageErrors.join("; ")}`,
    ).toHaveLength(0);
  });
});
