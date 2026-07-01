import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Subscribe to an external store with a selector — only rerenders when the
 * selected slice changes per `isEqual`.
 */
export function useExternalStoreSelector<TStore, TSelected>(
  subscribe: (listener: () => void) => () => void,
  getStore: () => TStore,
  selector: (store: TStore) => TSelected,
  isEqual: (prev: TSelected, next: TSelected) => boolean,
): TSelected {
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);
  selectorRef.current = selector;
  isEqualRef.current = isEqual;

  const sliceRef = useRef<TSelected>(selector(getStore()));

  const getSnapshot = useCallback(() => {
    const next = selectorRef.current(getStore());
    if (!isEqualRef.current(sliceRef.current, next)) {
      sliceRef.current = next;
    }
    return sliceRef.current;
  }, [getStore]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
