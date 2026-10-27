import type { ChartMeta } from "./chart-meta";
import { parseSavedMap, type SavedMap } from "./storage";
import { buildTemplate, ROOT_ID, type TemplateId } from "./templates";
import type { Node } from "@xyflow/react";

export { DEFAULT_EMOJI, FREE_CHART_LIMIT, type ChartMeta } from "./chart-meta";

/** Charts open at /chart?id=…, which works when the site is exported as static files. */
export function chartHref(id: string) {
  return `/chart?id=${encodeURIComponent(id)}`;
}

export type Chart = ChartMeta & { map: SavedMap };

/** Thrown when a free account already has as many charts as it can. */
export class ChartLimitError extends Error {
  constructor() {
    super("The free plan's chart limit is reached.");
  }
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/charts${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (response.status === 403) throw new ChartLimitError();
  if (!response.ok) throw new Error(`Chart request failed (${response.status})`);
  return response;
}

/** All of the signed-in user's charts, most recently edited first. */
export async function listCharts(): Promise<Chart[]> {
  const charts = (await (await request("")).json()) as Chart[];
  return charts.map((chart) => ({
    ...chart,
    map: parseSavedMap(chart.map) ?? { nodes: [], edges: [] },
  }));
}

/** A chart's map, or null if it doesn't exist or belongs to someone else. */
export async function loadChart<N extends Node>(
  id: string,
): Promise<SavedMap<N> | null> {
  const response = await fetch(`/api/charts/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Chart request failed (${response.status})`);
  return parseSavedMap<N>(await response.json());
}

/** `keepalive` lets the last save finish even if the page is closing. */
export async function saveChart(id: string, map: SavedMap) {
  await request(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ map }),
    keepalive: true,
  });
}

/** Adds a chart to the account; keeps the id and created date when given. */
export async function addChart(
  map: SavedMap,
  options: { id?: string; createdAt?: number } = {},
): Promise<ChartMeta> {
  const response = await request("", {
    method: "POST",
    body: JSON.stringify({ map, ...options }),
  });
  return (await response.json()) as ChartMeta;
}

export async function createChart({
  title,
  emoji,
  template,
}: {
  title: string;
  emoji: string;
  template: TemplateId;
}) {
  const { id } = await addChart(buildTemplate(template, title, emoji));
  return id;
}

/** The center bubble carries the chart's name and emoji. */
function withRoot(map: SavedMap, data: { label: string; emoji?: string }) {
  return {
    ...map,
    nodes: map.nodes.map((node) =>
      node.id === ROOT_ID ? { ...node, data: { ...node.data, ...data } } : node,
    ),
  };
}

export async function renameChart(chart: Chart, title: string, emoji: string) {
  await saveChart(chart.id, withRoot(chart.map, { label: title, emoji }));
}

export async function duplicateChart(chart: Chart) {
  return addChart(withRoot(chart.map, { label: `${chart.title} (copy)` }));
}

export async function deleteChart(id: string) {
  await request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Brings back a deleted chart with Undo, at the same address. */
export async function restoreChart(chart: Chart) {
  await addChart(chart.map, { id: chart.id, createdAt: chart.createdAt });
}
