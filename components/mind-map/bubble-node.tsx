import {
  Handle,
  Position,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Check,
  ChevronsDownUp,
  Link2,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, type ComponentProps } from "react";
import {
  BUBBLE_KINDS,
  getBubbleCenter,
  getBubbleSize,
  getDepthStyle,
  MAX_LABEL_LENGTH,
  type BubbleKind,
} from "@/lib/mind-map/bubble-kinds";
import { BRANCH_EDGE, getParentId, isBranch } from "@/lib/mind-map/graph";
import { getChildPosition } from "@/lib/mind-map/layout";
import { cn } from "@/lib/utils";
import { useMindMap } from "./mind-map-context";

export type BubbleData = {
  label: string;
  kind: BubbleKind;
  /** Steps out from My Mind; sets the bubble's size. */
  depth: number;
  /** For actions: whether it's been done. */
  done?: boolean;
  /** For the center bubble: the chart's emoji. */
  emoji?: string;
  /** Longer, optional detail shown in the notes panel. */
  note?: string;
  /** Everything branching off this bubble is hidden. */
  collapsed?: boolean;
  /** True for a bubble that was just added and hasn't been named yet. */
  isNew?: boolean;
};

export type BubbleNode = Node<BubbleData, "bubble">;

/** How far outside the bubble's edge its buttons sit. */
const ARC_OFFSET = 20;
/** Room each button needs along the arc, in px. */
const ARC_SPACING = 36;
/** Big bubbles still spread their buttons at least this far apart. */
const MIN_ARC_STEP = Math.PI / 6;

function ActionButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "nodrag border-border bg-background text-foreground flex size-7 items-center justify-center rounded-full border shadow-md transition-transform hover:scale-110",
        className,
      )}
      {...props}
    />
  );
}

export default function BubbleNodeView({
  id,
  data,
  selected,
}: NodeProps<BubbleNode>) {
  const {
    getNode,
    getEdges,
    addNodes,
    addEdges,
    updateNodeData,
    deleteElements,
  } = useReactFlow<BubbleNode, Edge>();
  const {
    openNotes,
    startLink,
    toggleCollapse,
    descendantCounts,
    linkOrigin,
    focusNodeIds,
    dropTargetId,
    threadSelected,
  } = useMindMap();
  const descendants = descendantCounts.get(id) ?? 0;
  const [isEditing, setIsEditing] = useState(Boolean(data.isNew));
  const kind = BUBBLE_KINDS[data.kind];
  const depthStyle = getDepthStyle(data.depth);
  const Icon = kind.icon;
  const isRoot = data.kind === "root";
  const isAction = data.kind === "action";
  const hasNote = Boolean(data.note?.trim());
  const isLinkSource = linkOrigin === id;
  // While drawing or working on a thread, bubbles keep their buttons to themselves.
  const quiet = Boolean(linkOrigin) || threadSelected;

  function addChild() {
    const parent = getNode(id);
    if (!parent) return;
    // Open a collapsed branch so the new bubble shows up.
    if (data.collapsed) updateNodeData(id, { collapsed: false });

    const edges = getEdges();
    const grandparentId = getParentId(id, edges);
    const grandparent = grandparentId ? getNode(grandparentId) : undefined;
    const childDepth = data.depth + 1;
    const childId = crypto.randomUUID();

    addNodes({
      id: childId,
      type: "bubble",
      position: getChildPosition({
        parentCenter: getBubbleCenter(parent),
        parentSize: depthStyle.size,
        grandparentCenter: grandparent ? getBubbleCenter(grandparent) : null,
        siblingCount: edges.filter(
          (edge) => isBranch(edge) && edge.source === id,
        ).length,
        childSize: getBubbleSize({ depth: childDepth }),
      }),
      data: {
        label: "",
        kind: kind.childKind,
        depth: childDepth,
        isNew: true,
      },
    });
    addEdges({
      id: `${id}->${childId}`,
      source: id,
      target: childId,
      type: BRANCH_EDGE,
      // Branch lines go away with their bubble; they can't be picked on their own.
      selectable: false,
      focusable: false,
    });
  }

  const actions = [
    {
      key: "add",
      label: `Add a bubble to ${data.label}`,
      title: "Add a bubble",
      icon: Plus,
      onClick: addChild,
    },
    {
      key: "link",
      label: `Start a thread from ${data.label}`,
      title: "Start a thread",
      icon: Link2,
      onClick: () => startLink(id),
    },
    {
      key: "notes",
      label: `Edit details for ${data.label}`,
      title: "Notes and type",
      icon: Pencil,
      onClick: () => openNotes(id),
    },
    ...(descendants > 0 && !data.collapsed
      ? [
          {
            key: "collapse",
            label: `Hide everything under ${data.label}`,
            title: "Collapse branch",
            icon: ChevronsDownUp,
            onClick: () => toggleCollapse(id),
          },
        ]
      : []),
    ...(isRoot
      ? []
      : [
          {
            key: "delete",
            label: `Delete ${data.label}`,
            title: "Delete bubble",
            icon: Trash2,
            onClick: () => deleteElements({ nodes: [{ id }] }),
            className: "hover:text-destructive",
          },
        ]),
  ];
  // Buttons sit on an arc around the bottom of the bubble, just outside it.
  const arcRadius = depthStyle.size / 2 + ARC_OFFSET;
  const arcStep = Math.max(ARC_SPACING / arcRadius, MIN_ARC_STEP);

  function finishEditing(value: string) {
    setIsEditing(false);
    const label = value.trim();

    if (label) {
      updateNodeData(id, { label, isNew: false });
    } else if (data.isNew) {
      // A new bubble left blank (or cancelled) isn't worth keeping.
      deleteElements({ nodes: [{ id }] });
    }
  }

  return (
    <div
      style={{ width: depthStyle.size, height: depthStyle.size }}
      onDoubleClick={() => !isRoot && setIsEditing(true)}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-0.5 rounded-full border-2 p-3 text-center leading-tight break-words transition-[box-shadow,opacity,scale]",
        kind.className,
        depthStyle.text,
        isAction && data.done && "opacity-60",
        selected && "ring-ring/50 ring-4",
        isLinkSource && "ring-4 ring-emerald-500",
        focusNodeIds && !focusNodeIds.has(id) && "opacity-25",
        // While adding to a thread, the bubble under the cursor lights up white.
        linkOrigin &&
          !isLinkSource &&
          "cursor-crosshair hover:scale-105 hover:opacity-100 hover:shadow-[0_0_0_5px_white,0_0_28px_8px_rgba(255,255,255,0.85)]",
        dropTargetId === id && "ring-primary scale-110 ring-4",
      )}
    >
      {/* Edges need handles to attach to; the floating edge ignores where they sit. */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="opacity-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="opacity-0"
      />

      {isRoot && data.emoji && (
        <span className="text-3xl leading-none" aria-hidden="true">
          {data.emoji}
        </span>
      )}

      {Icon && (
        <Icon
          className={cn("shrink-0 opacity-70", depthStyle.icon)}
          aria-hidden="true"
        />
      )}

      {isEditing ? (
        <input
          autoFocus
          defaultValue={data.label}
          maxLength={MAX_LABEL_LENGTH}
          placeholder="Name it…"
          aria-label="Bubble label"
          className="nodrag w-full bg-transparent text-center outline-none placeholder:text-current placeholder:opacity-50"
          onFocus={(event) => event.currentTarget.select()}
          onBlur={(event) => finishEditing(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              // Cancel: restore the old label, then let blur finish up.
              event.currentTarget.value = data.label;
              event.currentTarget.blur();
            }
          }}
        />
      ) : (
        <span
          title={data.label}
          className={cn(
            "line-clamp-3",
            !data.label && "opacity-50",
            isAction && data.done && "line-through",
          )}
        >
          {data.label || "Untitled"}
        </span>
      )}

      {isAction && (
        <button
          type="button"
          role="checkbox"
          aria-checked={Boolean(data.done)}
          aria-label={`Mark ${data.label} as ${data.done ? "not done" : "done"}`}
          title={data.done ? "Done — tap to undo" : "Mark as done"}
          onClick={() => updateNodeData(id, { done: !data.done })}
          className={cn(
            "nodrag absolute top-[7%] left-[7%] flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-emerald-500 shadow-sm transition-colors",
            data.done
              ? "bg-emerald-500 text-white"
              : "bg-background text-transparent hover:text-emerald-500",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        </button>
      )}

      {!isRoot && Icon && dropTargetId !== id && !isEditing && !quiet && (
        <span
          className={cn(
            "bg-foreground text-background pointer-events-none absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shadow-md transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Icon className="size-3" aria-hidden="true" />
          {kind.label}
        </span>
      )}

      {dropTargetId === id && (
        <span className="bg-primary text-primary-foreground absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap shadow-md">
          Move here
        </span>
      )}

      {data.collapsed && descendants > 0 && (
        <button
          type="button"
          onClick={() => toggleCollapse(id)}
          aria-label={`Show ${descendants} hidden bubbles under ${data.label}`}
          title="Show branch"
          className="nodrag bg-foreground text-background absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-semibold shadow-md transition-transform hover:scale-110"
        >
          +{descendants}
        </button>
      )}

      {hasNote && (
        <ActionButton
          onClick={() => openNotes(id)}
          aria-label={`Open notes for ${data.label}`}
          title="Has notes"
          className="absolute top-[7%] right-[7%] size-6 translate-x-1/2 -translate-y-1/2 shadow-sm"
        >
          <NotebookPen className="size-3.5" aria-hidden="true" />
        </ActionButton>
      )}

      {!isEditing && !quiet && (
        <>
          {/* Widens the hover zone while hovered, so the cursor can reach the buttons. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 rounded-full group-hover:pointer-events-auto"
          />
          {actions.map(
            (
              { key, label, title, icon: ActionIcon, onClick, className },
              i,
            ) => {
              const angle =
                Math.PI / 2 + (i - (actions.length - 1) / 2) * arcStep;
              return (
                <ActionButton
                  key={key}
                  onClick={onClick}
                  aria-label={label}
                  title={title}
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * arcRadius}px)`,
                    top: `calc(50% + ${Math.sin(angle) * arcRadius}px)`,
                  }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 transition-[opacity,scale]",
                    // Hover on desktop; tap-to-select on touch screens, which have no hover.
                    selected
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-50 opacity-0 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100",
                    className,
                  )}
                >
                  <ActionIcon className="size-3.5" aria-hidden="true" />
                </ActionButton>
              );
            },
          )}
        </>
      )}
    </div>
  );
}
