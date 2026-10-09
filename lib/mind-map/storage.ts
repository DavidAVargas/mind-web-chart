import type { Edge, Node } from "@xyflow/react";

/** Bump the version if the saved shape ever changes, so old saves can be migrated. */
const STORAGE_KEY = "mind-web-chart:v1";

type SavedMap<N extends Node> = { nodes: N[]; edges: Edge[] };

export function loadMap<N extends Node>(): SavedMap<N> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedMap<N>;
    return Array.isArray(saved.nodes) && Array.isArray(saved.edges)
      ? saved
      : null;
  } catch {
    // Storage blocked or the save is corrupt: start fresh rather than crash.
    return null;
  }
}

/** Saves only what's needed to rebuild the map, not on-screen state like selection. */
export function saveMap<N extends Node<{ isNew?: boolean }>>(
  nodes: N[],
  edges: Edge[],
) {
  // A bubble still waiting for its first name isn't kept.
  const unnamed = new Set(
    nodes.filter((node) => node.data.isNew).map((node) => node.id),
  );

  const saved: SavedMap<Node> = {
    nodes: nodes
      .filter((node) => !unnamed.has(node.id))
      .map(({ id, type, position, data, deletable }) => ({
        id,
        type,
        position,
        data,
        deletable,
      })),
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

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage full or blocked; the map still works, it just won't persist.
  }
}
