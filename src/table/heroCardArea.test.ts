import { describe, expect, it } from "vitest";
import { isHeroCardAreaEmpty } from "./heroCardArea";

describe("isHeroCardAreaEmpty", () => {
  it("is true with no cards", () => {
    expect(isHeroCardAreaEmpty([])).toBe(true);
    expect(isHeroCardAreaEmpty(undefined)).toBe(true);
  });

  it("is false when the hero has active cards", () => {
    expect(isHeroCardAreaEmpty([{ rank: "A", suit: "spades" }])).toBe(false);
  });
});
