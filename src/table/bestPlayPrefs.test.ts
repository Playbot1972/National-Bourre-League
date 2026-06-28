import assert from "node:assert/strict";
import test from "node:test";
import { getBestPlayEnabled, saveBestPlayEnabled } from "./bestPlayPrefs";

test("bestPlayPrefs defaults to disabled when storage is empty", () => {
  const storage = new Map<string, string>();
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    },
    configurable: true,
  });
  try {
    assert.equal(getBestPlayEnabled(), false);
    saveBestPlayEnabled(true);
    assert.equal(getBestPlayEnabled(), true);
    saveBestPlayEnabled(false);
    assert.equal(getBestPlayEnabled(), false);
  } finally {
    Object.defineProperty(globalThis, "localStorage", {
      value: original,
      configurable: true,
    });
  }
});
