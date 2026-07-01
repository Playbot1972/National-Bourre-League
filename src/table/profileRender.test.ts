import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  isTableRenderProfileEnabled,
  onRenderProfile,
  setTableRenderProfileDevForTests,
  TABLE_RENDER_PROFILE_DEBUG_KEY,
  tableOnRenderProfile,
} from "./profileRender";

type StorageMock = {
  getItem: (key: string) => string | null;
};

function withMockWindow(
  setup: (win: {
    localStorage: StorageMock;
    location: { search: string };
  }) => void,
  run: () => void,
): void {
  const g = globalThis as typeof globalThis & { window?: unknown };
  const prev = g.window;
  const win = {
    localStorage: { getItem: () => null as string | null },
    location: { search: "" },
  };
  setup(win);
  g.window = win;
  try {
    run();
  } finally {
    if (prev === undefined) delete g.window;
    else g.window = prev;
  }
}

describe("isTableRenderProfileEnabled", () => {
  afterEach(() => {
    setTableRenderProfileDevForTests(undefined);
  });

  it("enables profiling in dev mode", () => {
    setTableRenderProfileDevForTests(true);
    assert.equal(isTableRenderProfileEnabled(), true);
  });

  it("disables profiling in production without flags", () => {
    setTableRenderProfileDevForTests(false);
    assert.equal(isTableRenderProfileEnabled(), false);
  });

  it("enables profiling when localStorage flag is set", () => {
    setTableRenderProfileDevForTests(false);
    withMockWindow(
      (win) => {
        win.localStorage.getItem = (key) =>
          key === TABLE_RENDER_PROFILE_DEBUG_KEY ? "1" : null;
      },
      () => assert.equal(isTableRenderProfileEnabled(), true),
    );
  });

  it("enables profiling when query param tableProfile=1 is set", () => {
    setTableRenderProfileDevForTests(false);
    withMockWindow(
      (win) => {
        win.location.search = "?tableProfile=1";
      },
      () => assert.equal(isTableRenderProfileEnabled(), true),
    );
  });

  it("fails safely when window/localStorage is unavailable", () => {
    setTableRenderProfileDevForTests(false);
    withMockWindow(
      (win) => {
        win.localStorage.getItem = () => {
          throw new Error("storage blocked");
        };
      },
      () => assert.equal(isTableRenderProfileEnabled(), false),
    );
  });
});

describe("onRenderProfile", () => {
  it("logs only when actualDuration exceeds threshold", () => {
    const lines: unknown[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      lines.push(args);
    };
    try {
      onRenderProfile("GameTable", "update", 8, 4, 100, 108);
      assert.equal(lines.length, 0);
      onRenderProfile("PlayerSeats", "mount", 12.345, 6.1, 50.2, 62.5);
      assert.equal(lines.length, 1);
    } finally {
      console.log = original;
    }
  });
});

describe("tableOnRenderProfile", () => {
  afterEach(() => {
    setTableRenderProfileDevForTests(undefined);
  });

  it("no-ops when profiling is disabled", () => {
    setTableRenderProfileDevForTests(false);
    const lines: unknown[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      lines.push(args);
    };
    try {
      tableOnRenderProfile("GameTable", "update", 12, 4, 100, 108);
      assert.equal(lines.length, 0);
    } finally {
      console.log = original;
    }
  });

  it("logs through onRenderProfile when profiling is enabled", () => {
    setTableRenderProfileDevForTests(true);
    const lines: unknown[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      lines.push(args);
    };
    try {
      tableOnRenderProfile("PlayerSeats", "mount", 12.345, 6.1, 50.2, 62.5);
      assert.equal(lines.length, 1);
    } finally {
      console.log = original;
    }
  });
});
