import {
  BaseEdge,
  useInternalNode,
  type EdgeProps,
  type InternalNode,
} from "@xyflow/react";

function getCircle(node: InternalNode) {
  const radius = (node.measured.width ?? 0) / 2;
  return {
    x: node.internals.positionAbsolute.x + radius,
    y: node.internals.positionAbsolute.y + radius,
    radius,
  };
}

/** A straight line between the edges of two round bubbles, wherever they are. */
export default function FloatingEdge({ id, source, target }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) return null;

  const from = getCircle(sourceNode);
  const to = getCircle(targetNode);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;

  const path = `M ${from.x + ux * from.radius} ${from.y + uy * from.radius} L ${to.x - ux * to.radius} ${to.y - uy * to.radius}`;

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{ stroke: "var(--muted-foreground)", strokeWidth: 2 }}
    />
  );
}
