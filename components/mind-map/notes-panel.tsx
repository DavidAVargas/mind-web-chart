import { useNodesData, useReactFlow, type Edge } from "@xyflow/react";
import { KeyRound, X } from "lucide-react";
import type { BubbleNode } from "./bubble-node";
import { MAX_LABEL_LENGTH } from "@/lib/mind-map/bubble-kinds";
import { getType, isCheckable, ROOT_KIND } from "@/lib/mind-map/chart-key";
import { useMindMap } from "./mind-map-context";

/** Side panel on desktop, bottom sheet on phones. */
export const PANEL_CLASS =
  "border-border bg-card text-card-foreground absolute inset-x-0 bottom-0 z-20 flex max-h-[60%] flex-col gap-4 overflow-y-auto rounded-t-2xl border-t p-4 shadow-2xl sm:inset-x-auto sm:top-0 sm:right-0 sm:max-h-none sm:w-96 sm:rounded-none sm:border-t-0 sm:border-l";

/** Side panel on desktop, bottom sheet on phones, for a bubble's title, class and notes. */
export default function NotesPanel({
  nodeId,
  onClose,
}: {
  nodeId: string;
  onClose: () => void;
}) {
  const node = useNodesData<BubbleNode>(nodeId);
  const { updateNodeData } = useReactFlow<BubbleNode, Edge>();
  const { chartKey, openKey } = useMindMap();

  if (!node) return null;

  const { data } = node;
  const isRoot = data.kind === ROOT_KIND;
  const type = getType(chartKey, data.kind);

  return (
    <aside
      aria-label="Bubble details"
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className={PANEL_CLASS}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-sm font-semibold">
          {isRoot ? "Center" : type.label}
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
        {isRoot && (
          <span className="text-muted-foreground text-xs font-normal">
            This is the chart’s name. Rename it from the title at the top.
          </span>
        )}
      </label>

      {!isRoot && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span className="flex items-center justify-between">
            Type
            <button
              type="button"
              onClick={openKey}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium"
            >
              <KeyRound className="size-3.5" aria-hidden="true" />
              Chart key
            </button>
          </span>
          <select
            value={data.kind}
            onChange={(event) =>
              updateNodeData(nodeId, { kind: event.target.value })
            }
            className="border-input bg-background rounded-md border px-3 py-2 text-base font-normal"
          >
            {/* A bubble whose type was removed from the key keeps showing as "No type". */}
            {!chartKey.some((option) => option.id === data.kind) && (
              <option value={data.kind}>No type</option>
            )}
            {chartKey.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {type.hint && (
            <span className="text-muted-foreground text-xs font-normal">
              {type.hint}
            </span>
          )}
        </label>
      )}

      {isCheckable(chartKey, data.kind) && (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={Boolean(data.done)}
            onChange={(event) =>
              updateNodeData(nodeId, { done: event.target.checked })
            }
            className="size-4 accent-emerald-500"
          />
          Done
        </label>
      )}

      <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
        Notes
        <textarea
          // A brand-new bubble keeps the cursor so you can name it first.
          autoFocus={!data.isNew}
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
