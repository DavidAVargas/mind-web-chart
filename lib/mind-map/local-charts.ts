import type { Node } from "@xyflow/react";
import { describe, type ChartMeta } from "./chart-meta";
import { parseSavedMap, type SavedMap } from "./storage";

/**
 * Before accounts, charts were saved in the browser: one key per chart plus a
 * small index. They're only read now, to offer importing them into an account.
 */
const INDEX_KEY = "mind-web-chart:charts";
const chartKey = (id: string) => `mind-web-chart:chart:${id}`;
/** Where the single map lived before there were multiple charts. */
const LEGACY_KEY = "mind-web-chart:v1";
/** Set once they've been imported or dismissed, so the offer shows only once per browser. */
const IMPORTED_KEY = "mind-web-chart:imported";

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export type LocalChart = ChartMeta & { map: SavedMap };

/** Charts saved in this browser that haven't been imported yet. */
export function listLocalCharts(): LocalChart[] {
  if (read(IMPORTED_KEY)) return [];

  const index = read<ChartMeta[]>(INDEX_KEY);
  if (!index) {
    // The single map from before charts existed.
    const legacy = parseSavedMap(read(LEGACY_KEY));
    if (!legacy) return [];
    const now = Date.now();
    return [
      {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...describe(legacy),
        map: legacy,
      },
    ];
  }

  return index
    .map((meta) => {
      const map = parseSavedMap<Node>(read(chartKey(meta.id)));
      return map ? { ...meta, map } : null;
    })
    .filter((chart): chart is LocalChart => chart !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Stops offering the import. The charts themselves stay put as a backup. */
export function markLocalChartsImported() {
  try {
    window.localStorage.setItem(IMPORTED_KEY, JSON.stringify(Date.now()));
  } catch {
    // Storage blocked; the offer just shows again next time.
  }
}
