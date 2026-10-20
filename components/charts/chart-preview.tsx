import type { Node } from "@xyflow/react";
import {
  BUBBLE_KINDS,
  getBubbleCenter,
  getBubbleSize,
  type BubbleKind,
} from "@/lib/mind-map/bubble-kinds";
import { isBranch } from "@/lib/mind-map/graph";
import type { SavedMap } from "@/lib/mind-map/storage";

type PreviewData = { kind: BubbleKind; depth: number };

/** A tiny drawing of a chart: bubbles as dots in their type colors, branches as lines. */
export default function ChartPreview({ map }: { map: SavedMap | null }) {
  const nodes = (map?.nodes ?? []) as Node<PreviewData>[];
  if (!nodes.length) return null;

  const circles = new Map(
    nodes.map((node) => [
      node.id,
      {
        ...getBubbleCenter(node),
        r: getBubbleSize(node.data) / 2,
        color: BUBBLE_KINDS[node.data.kind]?.color ?? "#a3a3a3",
      },
    ]),
  );
  const all = [...circles.values()];
  const pad = 40;
  const minX = Math.min(...all.map((c) => c.x - c.r)) - pad;
  const minY = Math.min(...all.map((c) => c.y - c.r)) - pad;
  const width = Math.max(...all.map((c) => c.x + c.r)) - minX + pad;
  const height = Math.max(...all.map((c) => c.y + c.r)) - minY + pad;

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      className="size-full"
      aria-hidden="true"
    >
      {map?.edges.filter(isBranch).map((edge) => {
        const from = circles.get(edge.source);
        const to = circles.get(edge.target);
        return from && to ? (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.5}
            strokeWidth={Math.max(width, height) / 150}
          />
        ) : null;
      })}
      {all.map((circle, i) => (
        <circle
          key={i}
          cx={circle.x}
          cy={circle.y}
          r={circle.r}
          fill={circle.color}
        />
      ))}
    </svg>
  );
}
