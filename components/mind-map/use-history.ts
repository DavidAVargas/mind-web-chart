import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedMap } from "@/lib/mind-map/storage";

/** Wait for changes to settle before recording a step, so a drag is one step. */
const SETTLE_MS = 300;
const MAX_STEPS = 100;

/**
 * Undo/redo for the whole map. Each settled change is one step, so it covers
 * everything: adding, moving, renaming, notes, classes, threads and deletes.
 */
export function useHistory(current: SavedMap, apply: (map: SavedMap) => void) {
  const past = useRef<string[]>([]);
  const future = useRef<string[]>([]);
  const last = useRef<string | null>(null);
  const [counts, setCounts] = useState({ past: 0, future: 0 });

  const syncCounts = useCallback(
    () =>
      setCounts({ past: past.current.length, future: future.current.length }),
    [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const json = JSON.stringify(current);
      if (last.current === null) {
        last.current = json;
        return;
      }
      if (json === last.current) return;
      past.current = [...past.current, last.current].slice(-MAX_STEPS);
      future.current = [];
      last.current = json;
      syncCounts();
    }, SETTLE_MS);
    return () => clearTimeout(timeout);
  }, [current, syncCounts]);

  const step = useCallback(
    (from: { current: string[] }, to: { current: string[] }) => {
      const target = from.current.at(-1);
      if (target === undefined || last.current === null) return;
      from.current = from.current.slice(0, -1);
      to.current = [...to.current, last.current];
      last.current = target;
      apply(JSON.parse(target));
      syncCounts();
    },
    [apply, syncCounts],
  );

  return {
    undo: useCallback(() => step(past, future), [step]),
    redo: useCallback(() => step(future, past), [step]),
    canUndo: counts.past > 0,
    canRedo: counts.future > 0,
  };
}
