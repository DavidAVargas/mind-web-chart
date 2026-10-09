import { useNodesData, useReactFlow, type Edge } from "@xyflow/react";
import { X } from "lucide-react";
import type { BubbleNode } from "./bubble-node";
import {
  BUBBLE_CLASSES,
  MAX_LABEL_LENGTH,
  PICKABLE_CLASSES,
  type BubbleClass,
} from "@/lib/mind-map/bubble-classes";

/** Side panel on desktop, bottom sheet on phones, for a bubble's title, class and notes. */
export default function NotesPanel({
  nodeId,
  onClose,
}: {
  nodeId: string;
  onClose: () => void;
}) {
  const node = useNodesData<BubbleNode>(nodeId);
  const { updateNodeData, updateNode } = useReactFlow<BubbleNode, Edge>();

  if (!node) return null;

  const { data } = node;
  const isRoot = data.bubbleClass === "root";

  function changeClass(bubbleClass: BubbleClass) {
    // Keep the bubble centered where it is while its size changes.
    const shift =
      (BUBBLE_CLASSES[data.bubbleClass].size -
        BUBBLE_CLASSES[bubbleClass].size) /
      2;
    updateNode(nodeId, (current) => ({
      position: {
        x: current.position.x + shift,
        y: current.position.y + shift,
      },
      data: { ...current.data, bubbleClass },
    }));
  }

  return (
    <aside
      aria-label="Bubble details"
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="border-border bg-card text-card-foreground absolute inset-x-0 bottom-0 z-10 flex max-h-[60%] flex-col gap-4 overflow-y-auto rounded-t-2xl border-t p-4 shadow-2xl sm:inset-x-auto sm:top-0 sm:right-0 sm:max-h-none sm:w-96 sm:rounded-none sm:border-t-0 sm:border-l"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-sm font-semibold">
          {BUBBLE_CLASSES[data.bubbleClass].label}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="hover:bg-accent rounded-full p-1"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Title
        <input
          value={data.label}
          disabled={isRoot}
          maxLength={MAX_LABEL_LENGTH}
          onChange={(event) =>
            updateNodeData(nodeId, { label: event.target.value })
          }
          className="border-input bg-background rounded-md border px-3 py-2 text-base font-normal disabled:opacity-60"
        />
      </label>

      {!isRoot && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Class
          <select
            value={data.bubbleClass}
            onChange={(event) => changeClass(event.target.value as BubbleClass)}
            className="border-input bg-background rounded-md border px-3 py-2 text-base font-normal"
          >
            {PICKABLE_CLASSES.map((bubbleClass) => (
              <option key={bubbleClass} value={bubbleClass}>
                {BUBBLE_CLASSES[bubbleClass].label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
        Notes
        <textarea
          autoFocus
          value={data.note ?? ""}
          placeholder="Go deeper on this thought…"
          onChange={(event) =>
            updateNodeData(nodeId, { note: event.target.value })
          }
          className="border-input bg-background min-h-40 flex-1 resize-none rounded-md border px-3 py-2 text-base leading-relaxed font-normal"
        />
      </label>
    </aside>
  );
}
