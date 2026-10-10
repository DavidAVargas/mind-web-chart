import { useStore, ViewportPortal } from "@xyflow/react";
import { Check, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { getBubbleCenter, getBubbleSize } from "@/lib/mind-map/bubble-kinds";
import type { BubbleNode } from "./bubble-node";

/** Space between the chip and the top of the bubble. */
const GAP = 14;

function ChipButton({
  onClick,
  primary,
  children,
}: {
  onClick: () => void;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "bg-primary text-primary-foreground flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold shadow-sm transition-opacity hover:opacity-90"
          : "hover:bg-accent flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-medium"
      }
    >
      {children}
    </button>
  );
}

/**
 * Floats above the bubble a connector starts from, so the prompt and its
 * buttons sit right where you're working instead of at the screen's edge.
 */
export default function LinkingChip({
  origin,
  step,
  targetLabel,
  added,
  onAddMore,
  onDone,
}: {
  origin: BubbleNode;
  /** pick: choosing the first bubble. connected: one link made. multi: adding several. */
  step: "pick" | "connected" | "multi";
  targetLabel?: string;
  added?: number;
  onAddMore: () => void;
  onDone: () => void;
}) {
  // Same size on screen at any zoom.
  const scale = useStore((state) => Math.max(1, 1 / state.transform[2]));
  const center = getBubbleCenter(origin);
  const top = center.y - getBubbleSize(origin.data) / 2 - GAP * scale;
  const originLabel = origin.data.label || "Untitled";

  return (
    <ViewportPortal>
      <div
        role="status"
        style={{
          transform: `translate(${center.x}px, ${top}px) translate(-50%, -100%) scale(${scale})`,
          transformOrigin: "bottom center",
        }}
        className="nodrag nopan border-border bg-card text-card-foreground pointer-events-auto absolute top-0 left-0 z-[2000] flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-4 text-sm whitespace-nowrap shadow-lg"
      >
        {step === "pick" && (
          <>
            <span>Tap a bubble to connect “{originLabel}”</span>
            <ChipButton onClick={onDone}>Cancel</ChipButton>
          </>
        )}
        {step === "connected" && (
          <>
            <span className="flex items-center gap-1.5">
              <Check
                className="size-4 text-emerald-500"
                strokeWidth={3}
                aria-hidden="true"
              />
              Connected to “{targetLabel || "Untitled"}”
            </span>
            <ChipButton onClick={onAddMore}>
              <Plus className="size-4" aria-hidden="true" />
              Add more
            </ChipButton>
            <ChipButton primary onClick={onDone}>
              Done
            </ChipButton>
          </>
        )}
        {step === "multi" && (
          <>
            <span>
              Tap bubbles to add them
              {added ? (
                <span className="text-muted-foreground"> · {added} added</span>
              ) : null}
            </span>
            <ChipButton primary onClick={onDone}>
              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
              Done
            </ChipButton>
          </>
        )}
      </div>
    </ViewportPortal>
  );
}
