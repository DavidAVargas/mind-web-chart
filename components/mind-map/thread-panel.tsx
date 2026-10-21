import { useNodesData, useReactFlow, useStore } from "@xyflow/react";
import { X } from "lucide-react";
import {
  getThreadNodeIds,
  THREAD_COLORS,
  type ThreadData,
} from "@/lib/mind-map/graph";
import type { BubbleNode } from "./bubble-node";
import { PANEL_CLASS } from "./notes-panel";

/** Details for a thread: which bubbles it ties together, and why. */
export default function ThreadPanel({
  edgeId,
  onClose,
}: {
  edgeId: string;
  onClose: () => void;
}) {
  const edge = useStore((state) => state.edgeLookup.get(edgeId));
  const bubbles = useNodesData<BubbleNode>(edge ? getThreadNodeIds(edge) : []);
  const { updateEdgeData } = useReactFlow();

  if (!edge) return null;

  const data = edge.data as ThreadData | undefined;
  const [origin, ...members] = bubbles;
  const label = (bubble?: (typeof bubbles)[number]) =>
    bubble?.data.label || "Untitled";

  return (
    <aside
      aria-label="Thread details"
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className={PANEL_CLASS}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
          <span
            className="size-3 rounded-full"
            style={{ background: data?.color ?? THREAD_COLORS[0] }}
          />
          Thread
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

      <div className="text-sm">
        <p className="font-medium">From “{label(origin)}” to:</p>
        <ul className="text-muted-foreground mt-1 list-disc pl-5">
          {members.map((member) => (
            <li key={member.id}>{label(member)}</li>
          ))}
        </ul>
      </div>

      <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
        Why are these connected?
        <textarea
          autoFocus
          value={data?.note ?? ""}
          placeholder="e.g. Not being fit yet is holding me back from posting and traveling…"
          onChange={(event) =>
            updateEdgeData(edgeId, { note: event.target.value })
          }
          className="border-input bg-background min-h-40 flex-1 resize-none rounded-md border px-3 py-2 text-base leading-relaxed font-normal"
        />
      </label>
    </aside>
  );
}
