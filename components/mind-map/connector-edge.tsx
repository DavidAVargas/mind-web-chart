import {
  BaseEdge,
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type ReactFlowState,
} from "@xyflow/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback } from "react";
import {
  getThreadMembers,
  THREAD_COLORS,
  type ThreadData,
} from "@/lib/mind-map/graph";
import { cn } from "@/lib/utils";
import { getCircle } from "./floating-edge";
import { useMindMap } from "./mind-map-context";

type Point = { x: number; y: number };
type Circle = Point & { radius: number };

/** How far a single link bows out, relative to its length. */
const BEND = 0.2;
/** How far a branch keeps heading the trunk's way before curving to its bubble. */
const MAX_SPOKE_CURVE = 60;

function sameCircles(a: (Circle | null)[], b: (Circle | null)[]) {
  return (
    a.length === b.length &&
    a.every((circle, i) => {
      const other = b[i];
      return circle && other
        ? circle.x === other.x &&
            circle.y === other.y &&
            circle.radius === other.radius
        : circle === other;
    })
  );
}

/** The point on a bubble's edge facing toward another point. */
function pointOnCircle(circle: Circle, toward: Point): Point {
  const dx = toward.x - circle.x;
  const dy = toward.y - circle.y;
  const d = Math.hypot(dx, dy) || 1;
  return {
    x: circle.x + (dx / d) * circle.radius,
    y: circle.y + (dy / d) * circle.radius,
  };
}

/** Lines for a thread, plus the hub point where its buttons sit. */
function getThreadPath(origin: Circle, members: Circle[]) {
  if (members.length === 1) {
    // One link: a gentle curve, so it stays visible beside a branch line.
    const [to] = members;
    const dx = to.x - origin.x;
    const dy = to.y - origin.y;
    const control = {
      x: (origin.x + to.x) / 2 - dy * BEND,
      y: (origin.y + to.y) / 2 + dx * BEND,
    };
    const start = pointOnCircle(origin, control);
    const end = pointOnCircle(to, control);
    return {
      path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      hub: {
        x: 0.25 * start.x + 0.5 * control.x + 0.25 * end.x,
        y: 0.25 * start.y + 0.5 * control.y + 0.25 * end.y,
      },
      isJunction: false,
    };
  }

  // Several links: a trunk from the origin to a junction in the middle of the
  // thread, then a branch curving out from the junction to each bubble.
  const all = [origin, ...members];
  const junction = {
    x: all.reduce((sum, c) => sum + c.x, 0) / all.length,
    y: all.reduce((sum, c) => sum + c.y, 0) / all.length,
  };
  const trunkLength =
    Math.hypot(junction.x - origin.x, junction.y - origin.y) || 1;
  const heading = {
    x: (junction.x - origin.x) / trunkLength,
    y: (junction.y - origin.y) / trunkLength,
  };

  const trunkStart = pointOnCircle(origin, junction);
  const spokes = members.map((member) => {
    const reach =
      Math.min(
        MAX_SPOKE_CURVE,
        Math.hypot(member.x - junction.x, member.y - junction.y) / 2,
      ) || 0;
    const control = {
      x: junction.x + heading.x * reach,
      y: junction.y + heading.y * reach,
    };
    const end = pointOnCircle(member, control);
    return `M ${junction.x} ${junction.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
  });

  return {
    path: [
      `M ${trunkStart.x} ${trunkStart.y} L ${junction.x} ${junction.y}`,
      ...spokes,
    ].join(" "),
    hub: junction,
    isJunction: true,
  };
}

/** A connector thread: from one bubble, branching out to one or more others. */
export default function ConnectorEdge({
  id,
  source,
  target,
  data,
  selected,
}: EdgeProps) {
  const { focusEdgeId, addToThread, deleteThread, openThreadNotes } =
    useMindMap();
  const members = getThreadMembers({ id, source, target, data });
  const threadData = data as ThreadData | undefined;
  const color = threadData?.color ?? THREAD_COLORS[0];
  const note = threadData?.note?.trim();
  const ids = [source, ...members];
  const idsKey = ids.join(",");

  const circles = useStore(
    useCallback(
      (state: ReactFlowState) =>
        idsKey.split(",").map((nodeId) => {
          const node = state.nodeLookup.get(nodeId);
          // Bubbles hidden in a collapsed branch drop out of the thread.
          return node?.measured.width && !node.hidden ? getCircle(node) : null;
        }),
      [idsKey],
    ),
    sameCircles,
  );

  const [origin, ...rest] = circles;
  const memberCircles = rest.filter((circle) => circle !== null);
  if (!origin || !memberCircles.length) return null;

  const { path, hub, isJunction } = getThreadPath(origin, memberCircles);
  const isFocused = focusEdgeId === id;
  const isDimmed = focusEdgeId !== null && !isFocused;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        interactionWidth={24}
        style={{
          stroke: color,
          strokeWidth: isFocused ? 4.5 : 2.5,
          opacity: isDimmed ? 0.15 : 1,
          filter: isFocused ? `drop-shadow(0 0 6px ${color})` : undefined,
          transition: "opacity 150ms, stroke-width 150ms",
        }}
      />
      {isJunction && (
        <circle
          cx={hub.x}
          cy={hub.y}
          r={isFocused ? 7 : 5}
          fill={color}
          opacity={isDimmed ? 0.15 : 1}
        />
      )}
      {isFocused && note && (
        <EdgeLabelRenderer>
          <p
            style={{
              transform: `translate(-50%, 0) translate(${hub.x}px, ${hub.y + (selected ? 24 : 12)}px)`,
              borderColor: color,
            }}
            className="bg-card text-card-foreground pointer-events-none absolute max-w-60 rounded-lg border-2 px-3 py-2 text-xs leading-snug shadow-lg"
          >
            {note}
          </p>
        </EdgeLabelRenderer>
      )}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${hub.x}px, ${hub.y}px)`,
            }}
            className="nodrag nopan pointer-events-auto absolute flex gap-1"
          >
            {[
              {
                label: "Add a bubble to this thread",
                icon: Plus,
                onClick: () => addToThread(id),
              },
              {
                label: "Why are these connected?",
                icon: Pencil,
                onClick: () => openThreadNotes(id),
              },
              {
                label: "Delete this thread",
                icon: Trash2,
                onClick: () => deleteThread(id),
                className: "hover:text-destructive",
              },
            ].map(({ label, icon: Icon, onClick, className }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                aria-label={label}
                title={label}
                className={cn(
                  "border-border bg-background text-foreground flex size-7 items-center justify-center rounded-full border shadow-md transition-transform hover:scale-110",
                  className,
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </button>
            ))}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
