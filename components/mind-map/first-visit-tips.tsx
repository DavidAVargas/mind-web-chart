"use client";

import {
  ArrowLeft,
  KeyRound,
  Link2,
  Pencil,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SEEN_KEY = "thoughtspun:tips-seen";

export type TipId = "add" | "name" | "key" | "thread";

const TIPS: { id: TipId; icon: LucideIcon; title: string; body: string }[] = [
  {
    id: "add",
    icon: Plus,
    title: "Grow your web",
    body: "Tap a bubble to see its buttons (on a computer, just hover). The + adds a new bubble off it.",
  },
  {
    id: "name",
    icon: Pencil,
    title: "Name it, pick its type",
    body: "A new bubble shows its types underneath while you name it. Tap one to set it. Double-tap any bubble to rename it, and the pencil holds its notes.",
  },
  {
    id: "key",
    icon: KeyRound,
    title: "Your chart key",
    body: "The key button up top shows what each color and icon means in this chart.",
  },
  {
    id: "thread",
    icon: Link2,
    title: "Tie ideas together",
    body: "The link button starts a thread between two bubbles that belong together, even on different branches.",
  },
];

function hasSeenTips() {
  try {
    return window.localStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

function markTipsSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(Date.now()));
  } catch {
    // Without storage the tips may show again next time; that's all.
  }
}

/**
 * A few tips the first time someone opens a chart, one at a time. Finishing
 * or skipping them hides them for good on this device. `onTipChange` tells
 * the editor which tip is showing, so it can point at what the tip is about.
 */
export default function FirstVisitTips({
  onTipChange,
}: {
  onTipChange: (tip: TipId | null) => void;
}) {
  // The editor only renders in the browser, so storage can be read right away.
  const [step, setStep] = useState<number | null>(() =>
    hasSeenTips() ? null : 0,
  );
  const tip = step === null ? null : TIPS[step];

  useEffect(() => {
    onTipChange(tip?.id ?? null);
  }, [tip, onTipChange]);

  if (!tip || step === null) return null;

  const last = step === TIPS.length - 1;
  const close = () => {
    markTipsSeen();
    setStep(null);
  };
  const Icon = tip.icon;

  return (
    <div
      role="dialog"
      aria-label="Tips"
      aria-live="polite"
      onKeyDown={(event) => event.key === "Escape" && close()}
      className="border-border bg-card text-card-foreground animate-in fade-in slide-in-from-bottom-4 absolute bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border p-4 shadow-xl duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200 flex size-9 shrink-0 items-center justify-center rounded-full">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div
          key={tip.id}
          className="animate-in fade-in min-w-0 flex-1 duration-200"
        >
          <h2 className="font-semibold">{tip.title}</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{tip.body}</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Skip tips"
          title="Skip tips"
          className="text-muted-foreground hover:bg-accent -mt-1 -mr-1 rounded-full p-1"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div
          className="flex gap-1.5"
          aria-label={`Tip ${step + 1} of ${TIPS.length}`}
        >
          {TIPS.map((item, index) => (
            <span
              key={item.id}
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === step
                  ? "bg-foreground w-4"
                  : "bg-muted-foreground/30 w-1.5",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              aria-label="Previous tip"
              className="hover:bg-accent flex size-8 items-center justify-center rounded-full"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? close() : setStep(step + 1))}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-1.5 text-sm font-medium"
          >
            {last ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
