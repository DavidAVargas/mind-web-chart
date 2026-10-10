import {
  BaseEdge,
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type ReactFlowState,
} from "@xyflow/react";
import { Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { useCallback, useState } from "react";
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
/**
 * Thread buttons and badges sit above every bubble (selected bubbles go up
 * to 1000), so a bubble's own buttons never cover them.
 */
const ABOVE_BUBBLES = 2000;

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

/** Midpoint of a quadratic curve. */
function curveMid(start: Point, control: Point, end: Point): Point {
  return {
    x: 0.25 * start.x + 0.5 * control.x + 0.25 * end.x,
    y: 0.25 * start.y + 0.5 * control.y + 0.25 * end.y,
  };
}

type ThreadShape = {
  /** Origin to junction; empty for a single link. */
  trunk: string;
  /** One curve per member bubble, in thread order. */
  links: { path: string; mid: Point }[];
  /** Where the thread's buttons sit. */
  hub: Point;
  isJunction: boolean;
};

function getThreadShape(origin: Circle, members: Circle[]): ThreadShape {
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
    const mid = curveMid(start, control, end);
    return {
      trunk: "",
      links: [
        {
          path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
          mid,
        },
      ],
      hub: mid,
      isJunction: false,
    };
  }

  // Several links: a trunk from the origin to a junction in the middle of the
  // thread, then a curve out from the junction to each bubble.
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

  return {
    trunk: `M ${trunkStart.x} ${trunkStart.y} L ${junction.x} ${junction.y}`,
    links: members.map((member) => {
      const reach = Math.min(
        MAX_SPOKE_CURVE,
        Math.hypot(member.x - junction.x, member.y - junction.y) / 2,
      );
      const control = {
        x: junction.x + heading.x * reach,
        y: junction.y + heading.y * reach,
      };
      const end = pointOnCircle(member, control);
      return {
        path: `M ${junction.x} ${junction.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
        mid: curveMid(junction, control, end),
      };
    }),
    hub: junction,
    isJunction: true,
  };
}

type Action = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
};

/** Keeps buttons and badges the same size on screen when zoomed out. */
function useScreenScale() {
  const zoom = useStore((state) => state.transform[2]);
  return Math.max(1, 1 / zoom);
}

function ActionBar({ at, actions }: { at: Point; actions: Action[] }) {
  const scale = useScreenScale();
  return (
    <div
      style={{
        transform: `translate(-50%, -50%) translate(${at.x}px, ${at.y}px) scale(${scale})`,
        zIndex: ABOVE_BUBBLES,
      }}
      className="nodrag nopan pointer-events-auto absolute flex gap-1"
    >
      {actions.map(({ label, icon: Icon, onClick, className }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          aria-label={label}
          title={label}
          className={cn(
            "border-border bg-background text-foreground hover:bg-accent flex size-8 items-center justify-center rounded-full border shadow-md transition-colors",
            className,
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/** A connector thread: from one bubble, branching out to one or more others. */
export default function ConnectorEdge({
  id,
  source,
  target,
  data,
  selected,
}: EdgeProps) {
  const {
    focusEdgeId,
    selectedLink,
    selectLink,
    removeLink,
    addToThread,
    deleteThread,
    openThreadNotes,
  } = useMindMap();
  const members = getThreadMembers({ id, source, target, data });
  const threadData = data as ThreadData | undefined;
  const color = threadData?.color ?? THREAD_COLORS[0];
  const note = threadData?.note?.trim();
  const idsKey = [source, ...members].join(",");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const scale = useScreenScale();

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

  const [origin, ...memberCircles] = circles;
  const shown = members
    .map((memberId, i) => ({ memberId, circle: memberCircles[i] }))
    .filter(
      (member): member is { memberId: string; circle: Circle } =>
        member.circle !== null,
    );
  if (!origin || !shown.length) return null;

  const shape = getThreadShape(
    origin,
    shown.map((member) => member.circle),
  );
  const isFocused = focusEdgeId === id;
  const isDimmed = focusEdgeId !== null && !isFocused;
  const strokeWidth = isFocused ? 4.5 : 2.5;
  const glow = isFocused ? `drop-shadow(0 0 6px ${color})` : undefined;
  const transition = "opacity 150ms, stroke-width 150ms";
  // With a thread selected, one of its links can be picked on its own.
  const pickedIndex =
    selected && selectedLink?.threadId === id
      ? shown.findIndex((member) => member.memberId === selectedLink.memberId)
      : -1;
  const pickedLink = pickedIndex >= 0 ? shown[pickedIndex].memberId : null;
  const showLinks = selected && shape.links.length > 1;
  const linkOpacity = (memberId: string) =>
    isDimmed ? 0.15 : pickedLink && pickedLink !== memberId ? 0.25 : 1;
  // Hovering a link on a selected thread previews it before you pick it.
  const linkWidth = (memberId: string) =>
    showLinks && hoveredLink === memberId && !pickedLink
      ? strokeWidth + 2.5
      : strokeWidth;

  return (
    <>
      {/* One invisible path covering the whole thread, for hover and clicks. */}
      <BaseEdge
        id={id}
        path={[shape.trunk, ...shape.links.map((link) => link.path)].join(" ")}
        interactionWidth={24}
        style={{ stroke: "transparent", strokeWidth }}
      />

      {showLinks &&
        // An outline around each link so you can tell them apart.
        [shape.trunk, ...shape.links.map((link) => link.path)].map((path) => (
          <path
            key={`casing-${path}`}
            d={path}
            fill="none"
            stroke="var(--background)"
            strokeWidth={strokeWidth + 5}
            strokeLinecap="round"
          />
        ))}

      {shape.trunk && (
        <path
          d={shape.trunk}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ opacity: isDimmed ? 0.15 : 1, filter: glow, transition }}
        />
      )}
      {shape.links.map((link, i) => {
        const { memberId } = shown[i];
        return (
          <g key={memberId}>
            <path
              d={link.path}
              fill="none"
              stroke={color}
              strokeWidth={linkWidth(memberId)}
              strokeLinecap="round"
              style={{
                opacity: linkOpacity(memberId),
                filter: glow,
                transition,
              }}
            />
            {showLinks && (
              // Wider invisible stroke so a single link is easy to click.
              <path
                d={link.path}
                fill="none"
                stroke="transparent"
                strokeWidth={24 * scale}
                style={{ pointerEvents: "stroke", cursor: "pointer" }}
                onMouseEnter={() => setHoveredLink(memberId)}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => selectLink(id, memberId)}
              />
            )}
          </g>
        );
      })}

      {shape.isJunction && (
        <circle
          cx={shape.hub.x}
          cy={shape.hub.y}
          r={isFocused ? 7 : 5}
          fill={color}
          opacity={isDimmed ? 0.15 : 1}
        />
      )}

      {isFocused && note && !pickedLink && (
        <EdgeLabelRenderer>
          <p
            style={{
              transform: `translate(-50%, 0) translate(${shape.hub.x}px, ${shape.hub.y + (selected ? 24 : 12)}px)`,
              borderColor: color,
              zIndex: ABOVE_BUBBLES,
            }}
            className="bg-card text-card-foreground pointer-events-none absolute max-w-60 rounded-lg border-2 px-3 py-2 text-xs leading-snug shadow-lg"
          >
            {note}
          </p>
        </EdgeLabelRenderer>
      )}

      {showLinks && (
        <EdgeLabelRenderer>
          {shape.links.map((link, i) => {
            const { memberId } = shown[i];
            const isPicked = pickedLink === memberId;
            return (
              <button
                key={memberId}
                type="button"
                onClick={() => selectLink(id, isPicked ? null : memberId)}
                onMouseEnter={() => setHoveredLink(memberId)}
                onMouseLeave={() => setHoveredLink(null)}
                aria-label={`Link ${i + 1}`}
                aria-pressed={isPicked}
                title={isPicked ? "Back to the whole thread" : `Link ${i + 1}`}
                style={{
                  transform: `translate(-50%, -50%) translate(${link.mid.x}px, ${link.mid.y}px) scale(${scale})`,
                  zIndex: ABOVE_BUBBLES,
                  borderColor: color,
                  background: isPicked ? color : undefined,
                  opacity: linkOpacity(memberId) === 1 ? 1 : 0.6,
                }}
                className={cn(
                  "nodrag nopan bg-background pointer-events-auto absolute flex size-8 items-center justify-center rounded-full border-[3px] text-sm font-bold shadow-md",
                  isPicked ? "text-white" : "text-foreground",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </EdgeLabelRenderer>
      )}

      {selected && (
        <EdgeLabelRenderer>
          {pickedLink ? (
            <ActionBar
              at={{
                x: shape.links[pickedIndex].mid.x,
                y: shape.links[pickedIndex].mid.y + 34 * scale,
              }}
              actions={[
                {
                  label: "Add a bubble to this thread",
                  icon: Plus,
                  onClick: () => addToThread(id),
                },
                {
                  label: "Remove this link",
                  icon: Trash2,
                  onClick: () => removeLink(id, pickedLink),
                  className: "hover:text-destructive",
                },
              ]}
            />
          ) : (
            <ActionBar
              at={shape.hub}
              actions={[
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
              ]}
            />
          )}
        </EdgeLabelRenderer>
      )}
    </>
  );
}
