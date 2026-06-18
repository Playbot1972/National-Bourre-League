import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeStageFit, isWithinViewport, landscapeStageShareForPlayers, stabilizeHeroHeight, tableAspectForMobileViewport } from "./stageFit";

describe("stageFit", () => {
  it("contain-fits stage inside viewport without exceeding width", () => {
    const fit = computeStageFit({
      availWidth: 800,
      availHeight: 600,
      aspect: 1.18,
      userScale: 1,
      padX: 16,
      padY: 12,
      heroMinHeight: 140,
      gap: 12,
    });
    assert.ok(fit.displayStageWidth <= 800 - 32);
    assert.ok(fit.displayStageHeight <= 600 - 24 - 140 - 12);
    assert.equal(fit.fitScale, 1);
    assert.equal(fit.effectiveScale, 1);
  });

  it("shrinks when user scale would overflow vertically", () => {
    const fit = computeStageFit({
      availWidth: 900,
      availHeight: 520,
      aspect: 1.18,
      userScale: 1.35,
      padX: 12,
      padY: 8,
      heroMinHeight: 160,
      gap: 10,
    });
    assert.ok(fit.effectiveScale <= 1.35);
    assert.ok(fit.fitScale < 1);
  });

  it("prefers height limit on wide short viewports (MacBook landscape)", () => {
    const fit = computeStageFit({
      availWidth: 1200,
      availHeight: 420,
      aspect: 1.18,
      userScale: 1,
      padX: 20,
      padY: 10,
      heroMinHeight: 150,
      gap: 8,
    });
    assert.ok(fit.stageWidth < 900);
    assert.ok(fit.stageHeight <= 420 - 20 - 150 - 8);
  });

  it("stabilizes hero height at peak to avoid draw-to-play shrink flicker", () => {
    const first = stabilizeHeroHeight(220, 0, 140);
    assert.equal(first.height, 220);
    assert.equal(first.peak, 220);

    const shrunk = stabilizeHeroHeight(150, first.peak, 140);
    assert.equal(shrunk.height, 220);
    assert.equal(shrunk.peak, 220);

    const reset = stabilizeHeroHeight(0, 0, 140);
    assert.equal(reset.height, 140);
    assert.equal(reset.peak, 0);
  });

  it("detects bounds inside viewport", () => {
    const viewport = { left: 0, top: 0, right: 400, bottom: 800, width: 400, height: 800 };
    const inner = { left: 20, top: 40, right: 380, bottom: 760, width: 360, height: 720 };
    assert.equal(isWithinViewport(inner, viewport), true);
    const clipped = { left: -4, top: 40, right: 380, bottom: 760, width: 384, height: 720 };
    assert.equal(isWithinViewport(clipped, viewport), false);
  });

  it("tightens mobile portrait aspect", () => {
    assert.equal(tableAspectForMobileViewport(1.2, { portrait: true }), 0.98);
    assert.equal(tableAspectForMobileViewport(1.2, { portrait: false }), 1.2);
  });

  it("allocates more landscape width to stage for 3–4 players", () => {
    assert.ok(landscapeStageShareForPlayers(3) > landscapeStageShareForPlayers(6));
    assert.equal(landscapeStageShareForPlayers(4), 0.68);
  });
});
