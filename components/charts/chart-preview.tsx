import type { Node } from "@xyflow/react";
import {
  getBubbleCenter,
  getBubbleSize,
  ROOT_COLOR,
} from "@/lib/mind-map/bubble-kinds";
import { getType, KEY_COLORS, ROOT_KIND } from "@/lib/mind-map/chart-key";
import { isBranch } from "@/lib/mind-map/graph";
import { getKey, type SavedMap } from "@/lib/mind-map/storage";

type PreviewData = { kind: string; depth: number };

/** A tiny drawing of a chart: bubbles as dots in their type colors, branches as lines. */
export default function ChartPreview({ map }: { map: SavedMap | null }) {
  const nodes = (map?.nodes ?? []) as Node<PreviewData>[];
  if (!nodes.length) return null;
  const key = getKey(map);

  const circles = new Map(
    nodes.map((node) => [
      node.id,
      {
        ...getBubbleCenter(node),
        r: getBubbleSize(node.data) / 2,
        color:
          node.data.kind === ROOT_KIND
            ? ROOT_COLOR
            : KEY_COLORS[getType(key, node.data.kind).color].hex,
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
