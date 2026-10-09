import type { Edge, Node } from "@xyflow/react";
import { BUBBLE_CLASSES, type BubbleClass } from "./bubble-classes";
import { BRANCH_EDGE, getBranchIds, getParentId, isBranch } from "./graph";
import { getChildPosition } from "./layout";

type ClassedNode = Node<{ bubbleClass: BubbleClass }>;

function getCenter(node: ClassedNode) {
  const size = BUBBLE_CLASSES[node.data.bubbleClass].size;
  return { x: node.position.x + size / 2, y: node.position.y + size / 2 };
}

/** Bubbles a branch can't be dropped on: itself and everything under it. */
export function getUndroppableIds(nodeId: string, edges: Edge[]) {
  return getBranchIds([nodeId], edges);
}

/** A bubble's class one level below its parent. "None" bubbles stay "None". */
function classUnder(parentClass: BubbleClass, current: BubbleClass) {
  if (current === "none") return current;
  if (parentClass === "none") return current;
  return BUBBLE_CLASSES[parentClass].childClass;
}

/**
 * Moves a bubble, and everything branching off it, under a new parent.
 * The bubble settles beside its new parent, its children keep their places
 * relative to it, and classes shift to match the new depth.
 */
export function moveBranch<N extends ClassedNode>(
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

  // New classes, walking down from the moved bubble.
  const newClasses = new Map<string, BubbleClass>();
  const queue: [string, BubbleClass][] = [[nodeId, newParent.data.bubbleClass]];
  while (queue.length) {
    const [id, parentClass] = queue.shift()!;
    const node = byId.get(id);
    if (!node) continue;
    const bubbleClass = classUnder(parentClass, node.data.bubbleClass);
    newClasses.set(id, bubbleClass);
    for (const edge of edges) {
      if (isBranch(edge) && edge.source === id) {
        queue.push([edge.target, bubbleClass]);
      }
    }
  }

  // Where the moved bubble lands, and how far its whole branch shifts.
  const grandparentId = getParentId(newParentId, edges);
  const grandparent = grandparentId ? byId.get(grandparentId) : undefined;
  const movedSize = BUBBLE_CLASSES[newClasses.get(nodeId)!].size;
  const landing = getChildPosition({
    parentCenter: getCenter(newParent),
    parentSize: BUBBLE_CLASSES[newParent.data.bubbleClass].size,
    grandparentCenter: grandparent ? getCenter(grandparent) : null,
    siblingCount: edges.filter(
      (edge) => isBranch(edge) && edge.source === newParentId,
    ).length,
    childSize: movedSize,
  });
  const oldCenter = getCenter(moving);
  const shift = {
    x: landing.x + movedSize / 2 - oldCenter.x,
    y: landing.y + movedSize / 2 - oldCenter.y,
  };

  return {
    nodes: nodes.map((node) => {
      if (!branchIds.has(node.id)) return node;
      const bubbleClass = newClasses.get(node.id) ?? node.data.bubbleClass;
      const center = getCenter(node);
      const size = BUBBLE_CLASSES[bubbleClass].size;
      return {
        ...node,
        position: {
          x: center.x + shift.x - size / 2,
          y: center.y + shift.y - size / 2,
        },
        data: { ...node.data, bubbleClass },
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
