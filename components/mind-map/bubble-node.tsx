import {
  Handle,
  Position,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Link2, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ComponentProps } from "react";
import {
  BUBBLE_CLASSES,
  MAX_LABEL_LENGTH,
  type BubbleClass,
} from "@/lib/mind-map/bubble-classes";
import { BRANCH_EDGE, getParentId, isBranch } from "@/lib/mind-map/graph";
import { getChildPosition } from "@/lib/mind-map/layout";
import { cn } from "@/lib/utils";
import { useMindMap } from "./mind-map-context";

export type BubbleData = {
  label: string;
  bubbleClass: BubbleClass;
  /** Longer, optional detail shown in the notes panel. */
  note?: string;
  /** True for a bubble that was just added and hasn't been named yet. */
  isNew?: boolean;
};

export type BubbleNode = Node<BubbleData, "bubble">;

function getCenter(node: BubbleNode) {
  const size = BUBBLE_CLASSES[node.data.bubbleClass].size;
  return { x: node.position.x + size / 2, y: node.position.y + size / 2 };
}

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
  const { openNotes, startLink, linkOrigin, focusNodeIds } = useMindMap();
  const [isEditing, setIsEditing] = useState(Boolean(data.isNew));
  const config = BUBBLE_CLASSES[data.bubbleClass];
  const isRoot = data.bubbleClass === "root";
  const hasNote = Boolean(data.note?.trim());
  const isLinkSource = linkOrigin === id;

  function addChild() {
    const parent = getNode(id);
    if (!parent) return;

    const edges = getEdges();
    const grandparentId = getParentId(id, edges);
    const grandparent = grandparentId ? getNode(grandparentId) : undefined;
    const childClass = config.childClass;
    const childId = crypto.randomUUID();

    addNodes({
      id: childId,
      type: "bubble",
      position: getChildPosition({
        parentCenter: getCenter(parent),
        parentSize: config.size,
        grandparentCenter: grandparent ? getCenter(grandparent) : null,
        siblingCount: edges.filter(
          (edge) => isBranch(edge) && edge.source === id,
        ).length,
        childSize: BUBBLE_CLASSES[childClass].size,
      }),
      data: { label: "", bubbleClass: childClass, isNew: true },
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
      style={{ width: config.size, height: config.size }}
      onDoubleClick={() => !isRoot && setIsEditing(true)}
      className={cn(
        "group relative flex items-center justify-center rounded-full border-2 p-3 text-center leading-tight break-words transition-[box-shadow,opacity]",
        config.className,
        selected && "ring-ring/50 ring-4",
        isLinkSource && "ring-4 ring-emerald-500",
        linkOrigin && !isLinkSource && "cursor-crosshair",
        focusNodeIds && !focusNodeIds.has(id) && "opacity-25",
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
          className={cn("line-clamp-3", !data.label && "opacity-50")}
        >
          {data.label || "Untitled"}
        </span>
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

      {!isEditing && !linkOrigin && (
        <div
          className={cn(
            "absolute top-full left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1 transition-opacity",
            // Hover on desktop; tap-to-select on touch screens, which have no hover.
            selected
              ? "opacity-100"
              : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
          )}
        >
          <ActionButton
            onClick={addChild}
            aria-label={`Add a bubble to ${data.label}`}
            title="Add a bubble"
          >
            <Plus className="size-4" aria-hidden="true" />
          </ActionButton>
          <ActionButton
            onClick={() => startLink(id)}
            aria-label={`Connect ${data.label} to another bubble`}
            title="Connect to another bubble"
          >
            <Link2 className="size-4" aria-hidden="true" />
          </ActionButton>
          <ActionButton
            onClick={() => openNotes(id)}
            aria-label={`Edit details for ${data.label}`}
            title="Notes and class"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </ActionButton>
          {!isRoot && (
            <ActionButton
              onClick={() => deleteElements({ nodes: [{ id }] })}
              aria-label={`Delete ${data.label}`}
              title="Delete bubble"
              className="hover:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}
