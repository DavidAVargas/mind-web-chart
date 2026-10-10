import type { Edge, Node, XYPosition } from "@xyflow/react";
import { getBubbleSize } from "./bubble-kinds";
import { isBranch } from "./graph";

type TidyNode = Node<{ depth: number; collapsed?: boolean }>;

/** Space between rings of bubbles. */
const RING_GAP = 70;
/** Space kept between neighbouring bubbles on the same ring. */
const NEIGHBOUR_GAP = 30;

function sizeOf(node: TidyNode) {
  return getBubbleSize(node.data);
}

/**
 * Lays the map out in rings around the root, like a radial tree. Each branch
 * gets a slice of the circle sized by how many bubbles hang off it, and rings
 * grow outward until every bubble fits without overlapping. Bubbles hidden
 * inside a collapsed branch move along with the bubble they're collapsed into.
 * Returns new top-left positions by bubble id.
 */
export function tidyLayout(
  nodes: TidyNode[],
  edges: Edge[],
  rootId: string,
): Map<string, XYPosition> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const root = byId.get(rootId);
  const positions = new Map<string, XYPosition>();
  if (!root) return positions;

  const childrenOf = new Map<string, string[]>();
  for (const edge of edges) {
    if (!isBranch(edge) || !byId.has(edge.target)) continue;
    childrenOf.set(edge.source, [
      ...(childrenOf.get(edge.source) ?? []),
      edge.target,
    ]);
  }
  // A collapsed bubble is laid out as if it had no children.
  const visibleChildren = (id: string) =>
    byId.get(id)?.data.collapsed ? [] : (childrenOf.get(id) ?? []);

  const leaves = new Map<string, number>();
  const countLeaves = (id: string): number => {
    const kids = visibleChildren(id);
    const count = kids.length
      ? kids.reduce((sum, kid) => sum + countLeaves(kid), 0)
      : 1;
    leaves.set(id, count);
    return count;
  };
  countLeaves(rootId);

  // Give each bubble a slice of the circle, sized by its leaves.
  const placed: { id: string; depth: number; angle: number; slice: number }[] =
    [];
  const assign = (id: string, depth: number, start: number, slice: number) => {
    placed.push({ id, depth, angle: start + slice / 2, slice });
    let cursor = start;
    for (const kid of visibleChildren(id)) {
      const kidSlice = (slice * leaves.get(kid)!) / leaves.get(id)!;
      assign(kid, depth + 1, cursor, kidSlice);
      cursor += kidSlice;
    }
  };
  // Start at the top and go clockwise.
  assign(rootId, 0, -Math.PI / 2, Math.PI * 2);

  // Ring radius per depth: far enough out to clear the ring inside it, and
  // big enough that every bubble fits within its slice.
  const maxDepth = Math.max(...placed.map((p) => p.depth));
  const radii = [0];
  for (let depth = 1; depth <= maxDepth; depth++) {
    const ring = placed.filter((p) => p.depth === depth);
    const inner = placed.filter((p) => p.depth === depth - 1);
    const innerSize = Math.max(...inner.map((p) => sizeOf(byId.get(p.id)!)));
    const ringSize = Math.max(...ring.map((p) => sizeOf(byId.get(p.id)!)));
    const fitSlices = Math.max(
      ...ring.map(
        (p) =>
          (sizeOf(byId.get(p.id)!) + NEIGHBOUR_GAP) /
          Math.min(p.slice, Math.PI),
      ),
    );
    radii.push(
      Math.max(
        radii[depth - 1] + innerSize / 2 + RING_GAP + ringSize / 2,
        fitSlices,
      ),
    );
  }

  const rootCenter = {
    x: root.position.x + sizeOf(root) / 2,
    y: root.position.y + sizeOf(root) / 2,
  };
  for (const { id, depth, angle } of placed) {
    const size = sizeOf(byId.get(id)!);
    positions.set(id, {
      x: rootCenter.x + Math.cos(angle) * radii[depth] - size / 2,
      y: rootCenter.y + Math.sin(angle) * radii[depth] - size / 2,
    });
  }

  // Bubbles inside collapsed branches keep their place relative to the
  // bubble they're collapsed into.
  const carry = (id: string, shift: XYPosition) => {
    for (const kid of childrenOf.get(id) ?? []) {
      if (positions.has(kid)) continue;
      const node = byId.get(kid)!;
      positions.set(kid, {
        x: node.position.x + shift.x,
        y: node.position.y + shift.y,
      });
      carry(kid, shift);
    }
  };
  for (const { id } of placed) {
    const node = byId.get(id)!;
    if (!node.data.collapsed) continue;
    const next = positions.get(id)!;
    carry(id, { x: next.x - node.position.x, y: next.y - node.position.y });
  }

  return positions;
}
