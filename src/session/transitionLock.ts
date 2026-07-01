export interface TransitionLock {
  readonly current: string | null;
  runLockedTransition<T>(name: string, fn: () => T | Promise<T>): Promise<T | undefined>;
  isLocked(name?: string): boolean;
}

/** Per-hand transition guard — ignore duplicate calls while a transition is in flight. */
export function createTransitionLock(): TransitionLock {
  let current: string | null = null;

  async function runLockedTransition<T>(
    name: string,
    fn: () => T | Promise<T>,
  ): Promise<T | undefined> {
    if (current === name || current) return undefined;
    current = name;
    try {
      return await fn();
    } finally {
      current = null;
    }
  }

  return {
    get current() {
      return current;
    },
    runLockedTransition,
    isLocked(name?: string) {
      return name ? current === name : current !== null;
    },
  };
}
