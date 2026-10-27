import { KeyRound, X } from "lucide-react";
import KeyEditor from "@/components/charts/key-editor";
import type { ChartKey } from "@/lib/mind-map/chart-key";
import { PANEL_CLASS } from "./notes-panel";

/** The chart's key, in the side panel: see every type, and edit them on the full version. */
export default function KeyPanel({
  chartKey,
  onChange,
  locked,
  onLocked,
  usage,
  onClose,
}: {
  chartKey: ChartKey;
  onChange: (key: ChartKey) => void;
  locked: boolean;
  onLocked: () => void;
  usage: Map<string, number>;
  onClose: () => void;
}) {
  return (
    <aside
      aria-label="Chart key"
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className={PANEL_CLASS}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <KeyRound className="size-4" aria-hidden="true" />
          Chart key
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chart key"
          className="hover:bg-accent rounded-full p-1"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <p className="text-muted-foreground -mt-2 text-sm">
        The kinds of bubble this chart uses. Each one has its own color and
        icon. Bubbles get smaller the further they are from the center.
      </p>

      <KeyEditor
        value={chartKey}
        onChange={onChange}
        locked={locked}
        onLocked={onLocked}
        usage={usage}
      />

      {!locked && (
        <p className="text-muted-foreground border-border border-t pt-3 text-xs">
          Tap a dot to change its color and icon. The ✓ makes a type something
          you can tick off, and it counts toward the chart’s progress.
        </p>
      )}
    </aside>
  );
}
