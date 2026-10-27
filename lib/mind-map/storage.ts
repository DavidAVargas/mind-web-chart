import type { Edge, Node } from "@xyflow/react";
import { LIFE_KEY, parseKey, type ChartKey } from "./chart-key";
import { migrateNodes } from "./migrate";

export type SavedMap<N extends Node = Node> = {
  nodes: N[];
  edges: Edge[];
  /** The chart's key. Charts saved before keys existed use the Life map's. */
  key?: ChartKey;
};

export function getKey(map: { key?: ChartKey } | null | undefined): ChartKey {
  return map?.key?.length ? map.key : LIFE_KEY;
}

/** Checks that something read from storage or a file looks like a saved map. */
export function parseSavedMap<N extends Node>(
  value: unknown,
): SavedMap<N> | null {
  const saved = value as Partial<SavedMap<N>> | null;
  return saved && Array.isArray(saved.nodes) && Array.isArray(saved.edges)
    ? {
        nodes: migrateNodes(saved.nodes, saved.edges),
        edges: saved.edges,
        key: parseKey(saved.key) ?? LIFE_KEY,
      }
    : null;
}

/** Only what's needed to rebuild the map, not on-screen state like selection. */
export function toSavedMap<N extends Node<{ isNew?: boolean }>>(
  nodes: N[],
  edges: Edge[],
  key: ChartKey,
): SavedMap<N> {
  // A bubble still waiting for its first name isn't kept.
  const unnamed = new Set(
    nodes.filter((node) => node.data.isNew).map((node) => node.id),
  );

  return {
    nodes: nodes
      .filter((node) => !unnamed.has(node.id))
      .map(
        ({ id, type, position, data, deletable }) =>
          ({ id, type, position, data, deletable }) as N,
      ),
    edges: edges
      .filter((edge) => !unnamed.has(edge.source) && !unnamed.has(edge.target))
      .map(({ id, source, target, type, data, selectable, focusable }) => ({
        id,
        source,
        target,
        type,
        data,
        selectable,
        focusable,
      })),
    key,
  };
}
