import type { Node } from "@xyflow/react";
import type { SavedMap } from "./storage";
import { ROOT_ID } from "./templates";

export const DEFAULT_EMOJI = "🧠";

/** Free accounts can keep this many charts. */
export const FREE_CHART_LIMIT = 1;

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

/** Title, emoji and counts for the home page, read off the map itself. */
export function describe(
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
