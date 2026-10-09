import type { Edge } from "@xyflow/react";

/** Edge type for the parent → child lines made with the + button. */
export const BRANCH_EDGE = "floating";
/** Edge type for the cross-links made with the link button. */
export const CONNECTOR_EDGE = "connector";

export function isBranch(edge: Edge) {
  return edge.type === BRANCH_EDGE;
}

/** The parent of a bubble along its branch, if it has one. */
export function getParentId(nodeId: string, edges: Edge[]) {
  return edges.find((edge) => isBranch(edge) && edge.target === nodeId)?.source;
}

/** The given bubbles plus everything branching off them. */
export function getBranchIds(nodeIds: string[], edges: Edge[]) {
  const ids = new Set(nodeIds);
  const queue = [...nodeIds];

  while (queue.length) {
    const id = queue.pop()!;
    for (const edge of edges) {
      if (isBranch(edge) && edge.source === id && !ids.has(edge.target)) {
        ids.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  return ids;
}

export type ThreadData = {
  /** Bubbles hanging off the thread, in the order they were added. */
  members?: string[];
  color?: string;
  /** Why these bubbles are connected. */
  note?: string;
};

/** Distinct colors so crossing threads stay easy to tell apart. */
export const THREAD_COLORS = [
  "#10b981",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#eab308",
];

/**
 * A connector is a "thread": it starts at its source bubble and can branch out
 * to any number of member bubbles. Older saves only have a target, which is
 * the same as a thread with one member.
 */
export function getThreadMembers(edge: Edge): string[] {
  return (edge.data as ThreadData | undefined)?.members ?? [edge.target];
}

/** Every bubble a thread touches, starting with where it comes from. */
export function getThreadNodeIds(edge: Edge) {
  return [edge.source, ...getThreadMembers(edge)];
}
