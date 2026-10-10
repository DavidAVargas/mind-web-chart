import type { Edge, Node } from "@xyflow/react";
import type { BubbleKind } from "./bubble-kinds";
import { isBranch } from "./graph";

/** Bubble classes from before kinds existed, and the kind each became. */
const LEGACY_CLASSES: Record<string, BubbleKind> = {
  root: "root",
  main: "area",
  "sub-main": "goal",
  problem: "blocker",
  "small-issue": "root-cause",
  none: "thought",
};

type AnyData = Record<string, unknown>;

/**
 * Brings maps saved by older versions up to date: old classes become kinds,
 * and every bubble gets a depth worked out from its branches.
 */
export function migrateNodes<N extends Node>(nodes: N[], edges: Edge[]): N[] {
  const parentOf = new Map<string, string>();
  for (const edge of edges) {
    if (isBranch(edge)) parentOf.set(edge.target, edge.source);
  }
  const depthOf = (id: string, seen = new Set<string>()): number => {
    const parent = parentOf.get(id);
    if (!parent || seen.has(parent)) return 0;
    seen.add(id);
    return depthOf(parent, seen) + 1;
  };

  return nodes.map((node) => {
    const data = node.data as AnyData;
    if (data.kind && typeof data.depth === "number") return node;

    const { bubbleClass, ...rest } = data;
    return {
      ...node,
      data: {
        ...rest,
        kind:
          data.kind ??
          LEGACY_CLASSES[String(bubbleClass)] ??
          ("thought" as const),
        depth: depthOf(node.id),
      },
    };
  });
}
