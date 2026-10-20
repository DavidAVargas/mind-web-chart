import type { Node } from "@xyflow/react";
import { parseSavedMap, type SavedMap } from "./storage";
import { buildTemplate, ROOT_ID, type TemplateId } from "./templates";

/**
 * Charts are saved one per key, plus a small index for the home page. The same
 * shape maps onto a database table later (one row per chart).
 */
const INDEX_KEY = "mind-web-chart:charts";
const chartKey = (id: string) => `mind-web-chart:chart:${id}`;
/** Where the single map lived before there were multiple charts. */
const LEGACY_KEY = "mind-web-chart:v1";

export const DEFAULT_EMOJI = "🧠";

/** Charts open at /chart?id=…, which works when the site is exported as static files. */
export function chartHref(id: string) {
  return `/chart?id=${encodeURIComponent(id)}`;
}

export type ChartMeta = {
  id: string;
  title: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  bubbleCount: number;
  actionCount: number;
  doneCount: number;
};

type ChartData = {
  label?: string;
  emoji?: string;
  kind?: string;
  done?: boolean;
};

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked; the app still works, it just won't persist.
  }
}

/** Title, emoji and counts for the home page, read off the map itself. */
function describe(
  map: SavedMap,
): Omit<ChartMeta, "id" | "createdAt" | "updatedAt"> {
  const nodes = map.nodes as Node<ChartData>[];
  const root = nodes.find((node) => node.id === ROOT_ID);
  const actions = nodes.filter((node) => node.data.kind === "action");
  return {
    title: root?.data.label || "Untitled",
    emoji: root?.data.emoji || DEFAULT_EMOJI,
    bubbleCount: Math.max(0, nodes.length - 1),
    actionCount: actions.length,
    doneCount: actions.filter((node) => node.data.done).length,
  };
}

function writeIndex(charts: ChartMeta[]) {
  write(INDEX_KEY, charts);
}

/** The single map from before charts existed becomes the first chart. */
function migrateLegacy(): ChartMeta[] {
  const legacy = parseSavedMap(read(LEGACY_KEY));
  if (!legacy) return [];
  const id = crypto.randomUUID();
  const now = Date.now();
  write(chartKey(id), legacy);
  const meta = { id, createdAt: now, updatedAt: now, ...describe(legacy) };
  writeIndex([meta]);
  // The old key is left in place as a safety net; the index stops it migrating twice.
  return [meta];
}

/** All charts, most recently edited first. */
export function listCharts(): ChartMeta[] {
  const charts = read<ChartMeta[]>(INDEX_KEY) ?? migrateLegacy();
  return [...charts].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getChartMeta(id: string) {
  return listCharts().find((chart) => chart.id === id) ?? null;
}

export function loadChart<N extends Node>(id: string): SavedMap<N> | null {
  return parseSavedMap<N>(read(chartKey(id)));
}

export function saveChart(id: string, map: SavedMap) {
  write(chartKey(id), map);
  const charts = read<ChartMeta[]>(INDEX_KEY) ?? [];
  writeIndex(
    charts.map((chart) =>
      chart.id === id
        ? { ...chart, ...describe(map), updatedAt: Date.now() }
        : chart,
    ),
  );
}

export function createChart({
  title,
  emoji,
  template,
}: {
  title: string;
  emoji: string;
  template: TemplateId;
}) {
  const id = crypto.randomUUID();
  const now = Date.now();
  const map = buildTemplate(template, title, emoji);
  write(chartKey(id), map);
  writeIndex([
    ...listCharts(),
    { id, createdAt: now, updatedAt: now, ...describe(map) },
  ]);
  return id;
}

/** Renames a chart from the home page; the center bubble carries the name. */
export function renameChart(id: string, title: string, emoji: string) {
  const map = loadChart(id);
  if (!map) return;
  saveChart(id, {
    ...map,
    nodes: map.nodes.map((node) =>
      node.id === ROOT_ID
        ? { ...node, data: { ...node.data, label: title, emoji } }
        : node,
    ),
  });
}

export function duplicateChart(id: string) {
  const map = loadChart(id);
  const meta = getChartMeta(id);
  if (!map || !meta) return null;
  const copyId = crypto.randomUUID();
  const now = Date.now();
  const title = `${meta.title} (copy)`;
  const copy = {
    ...map,
    nodes: map.nodes.map((node) =>
      node.id === ROOT_ID
        ? { ...node, data: { ...node.data, label: title } }
        : node,
    ),
  };
  write(chartKey(copyId), copy);
  writeIndex([
    ...listCharts(),
    { id: copyId, createdAt: now, updatedAt: now, ...describe(copy) },
  ]);
  return copyId;
}

/** Removes a chart; returns what's needed to bring it back with Undo. */
export function deleteChart(id: string) {
  const map = loadChart(id);
  const meta = getChartMeta(id);
  writeIndex(listCharts().filter((chart) => chart.id !== id));
  try {
    window.localStorage.removeItem(chartKey(id));
  } catch {
    // Nothing to clean up if storage is blocked.
  }
  return map && meta ? { meta, map } : null;
}

export function restoreChart({
  meta,
  map,
}: {
  meta: ChartMeta;
  map: SavedMap;
}) {
  write(chartKey(meta.id), map);
  writeIndex([...listCharts().filter((chart) => chart.id !== meta.id), meta]);
}
