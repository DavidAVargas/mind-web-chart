import type { Edge, Node } from "@xyflow/react";
import { migrateNodes } from "./migrate";

/** Bump the version if the saved shape ever changes, so old saves can be migrated. */
const STORAGE_KEY = "mind-web-chart:v1";

export type SavedMap<N extends Node = Node> = { nodes: N[]; edges: Edge[] };

/** Checks that something read from storage or a file looks like a saved map. */
export function parseSavedMap<N extends Node>(
  value: unknown,
): SavedMap<N> | null {
  const saved = value as Partial<SavedMap<N>> | null;
  return saved && Array.isArray(saved.nodes) && Array.isArray(saved.edges)
    ? { nodes: migrateNodes(saved.nodes, saved.edges), edges: saved.edges }
    : null;
}

/** Only what's needed to rebuild the map, not on-screen state like selection. */
export function toSavedMap<N extends Node<{ isNew?: boolean }>>(
  nodes: N[],
  edges: Edge[],
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
  };
}

export function loadMap<N extends Node>(): SavedMap<N> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseSavedMap<N>(JSON.parse(raw)) : null;
  } catch {
    // Storage blocked or the save is corrupt: start fresh rather than crash.
    return null;
  }
}

export function saveMap(map: SavedMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or blocked; the map still works, it just won't persist.
  }
}
