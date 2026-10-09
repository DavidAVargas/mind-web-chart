import {
  Handle,
  Position,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { NotebookPen, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import {
  BUBBLE_CLASSES,
  MAX_LABEL_LENGTH,
  type BubbleClass,
} from "@/lib/mind-map/bubble-classes";
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
  const { openNotes } = useMindMap();
  const [isEditing, setIsEditing] = useState(Boolean(data.isNew));
  const config = BUBBLE_CLASSES[data.bubbleClass];
  const isRoot = data.bubbleClass === "root";
  const hasNote = Boolean(data.note?.trim());
  // Hover on desktop; tap-to-select on touch screens, which have no hover.
  const actionVisibility = selected
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100";

  function addChild() {
    const parent = getNode(id);
    if (!parent) return;

    const edges = getEdges();
    const grandparentId = edges.find((edge) => edge.target === id)?.source;
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
        siblingCount: edges.filter((edge) => edge.source === id).length,
        childSize: BUBBLE_CLASSES[childClass].size,
      }),
      data: { label: "", bubbleClass: childClass, isNew: true },
    });
    addEdges({
      id: `${id}->${childId}`,
      source: id,
      target: childId,
      type: "floating",
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
        "group relative flex items-center justify-center rounded-full border-2 p-3 text-center leading-tight break-words transition-shadow",
        config.className,
        selected && "ring-ring/50 ring-4",
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
        <button
          type="button"
          onClick={() => openNotes(id)}
          aria-label={`Open notes for ${data.label}`}
          title="Has notes"
          className="nodrag border-border bg-background text-foreground absolute top-[7%] right-[7%] flex size-6 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm"
        >
          <NotebookPen className="size-3.5" aria-hidden="true" />
        </button>
      )}

      {!isEditing && (
        <button
          type="button"
          onClick={() => openNotes(id)}
          aria-label={`Edit details for ${data.label}`}
          title="Notes and class"
          className={cn(
            "nodrag border-border bg-background text-foreground absolute bottom-[7%] left-[7%] flex size-7 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-opacity hover:scale-110",
            actionVisibility,
          )}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </button>
      )}

      {!isEditing && (
        <button
          type="button"
          onClick={addChild}
          aria-label={`Add a bubble to ${data.label}`}
          title="Add a bubble"
          className={cn(
            "nodrag border-border bg-background text-foreground absolute right-[7%] bottom-[7%] flex size-7 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-opacity hover:scale-110",
            actionVisibility,
          )}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
