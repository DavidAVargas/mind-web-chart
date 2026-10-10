import type { Edge, Node } from "@xyflow/react";
import { getBubbleCenter, getBubbleSize } from "./bubble-kinds";
import { BRANCH_EDGE, getBranchIds, getParentId, isBranch } from "./graph";
import { getChildPosition } from "./layout";

type DepthNode = Node<{ depth: number }>;

/** Bubbles a branch can't be dropped on: itself and everything under it. */
export function getUndroppableIds(nodeId: string, edges: Edge[]) {
  return getBranchIds([nodeId], edges);
}

/**
 * Moves a bubble, and everything branching off it, under a new parent.
 * The bubble settles beside its new parent, its children keep their places
 * relative to it, and sizes follow the branch's new depth. Kinds stay as
 * they are.
 */
export function moveBranch<N extends DepthNode>(
  nodes: N[],
  edges: Edge[],
  nodeId: string,
  newParentId: string,
): { nodes: N[]; edges: Edge[] } {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const moving = byId.get(nodeId);
  const newParent = byId.get(newParentId);
  if (!moving || !newParent) return { nodes, edges };

  const branchIds = getBranchIds([nodeId], edges);
  const depthShift = newParent.data.depth + 1 - moving.data.depth;

  // Where the moved bubble lands, and how far its whole branch shifts.
  const grandparentId = getParentId(newParentId, edges);
  const grandparent = grandparentId ? byId.get(grandparentId) : undefined;
  const movedSize = getBubbleSize({ depth: newParent.data.depth + 1 });
  const landing = getChildPosition({
    parentCenter: getBubbleCenter(newParent),
    parentSize: getBubbleSize(newParent.data),
    grandparentCenter: grandparent ? getBubbleCenter(grandparent) : null,
    siblingCount: edges.filter(
      (edge) => isBranch(edge) && edge.source === newParentId,
    ).length,
    childSize: movedSize,
  });
  const oldCenter = getBubbleCenter(moving);
  const shift = {
    x: landing.x + movedSize / 2 - oldCenter.x,
    y: landing.y + movedSize / 2 - oldCenter.y,
  };

  return {
    nodes: nodes.map((node) => {
      if (!branchIds.has(node.id)) return node;
      const depth = node.data.depth + depthShift;
      const center = getBubbleCenter(node);
      const size = getBubbleSize({ depth });
      return {
        ...node,
        position: {
          x: center.x + shift.x - size / 2,
          y: center.y + shift.y - size / 2,
        },
        data: { ...node.data, depth },
      };
    }),
    edges: [
      ...edges.filter((edge) => !(isBranch(edge) && edge.target === nodeId)),
      {
        id: `${newParentId}->${nodeId}`,
        source: newParentId,
        target: nodeId,
        type: BRANCH_EDGE,
        selectable: false,
        focusable: false,
      },
    ],
  };
}
