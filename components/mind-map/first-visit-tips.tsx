"use client";

import {
  ArrowLeft,
  Check,
  CircleHelp,
  KeyRound,
  Link2,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SEEN_KEY = "thoughtspun:tips-seen";

/** The toolbar buttons a tip can point at. */
export type TipTarget = "key" | "tidy" | "tips";

/** A toolbar button's icon, drawn inline so the tip shows what to look for. */
function Btn({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="border-border bg-background text-foreground mx-0.5 inline-flex size-5 translate-y-1 items-center justify-center rounded-md border">
      <Icon className="size-3" aria-hidden="true" />
    </span>
  );
}

const TIPS: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  target?: TipTarget;
}[] = [
  {
    icon: Plus,
    title: "Grow your web",
    body: (
      <>
        Tap a bubble to see its buttons. <Btn icon={Plus} /> adds a new idea off
        it.
      </>
    ),
  },
  {
    icon: Tag,
    title: "Give it a type",
    body: "As you name a new bubble, tap a type under it. Each type has its own color.",
  },
  {
    icon: KeyRound,
    title: "Your chart key",
    body: (
      <>
        <Btn icon={KeyRound} /> up top lists this chart’s types and what each
        color means.
      </>
    ),
    target: "key",
  },
  {
    icon: Check,
    title: "Make to-dos",
    body: (
      <>
        In the chart key, turn on <Btn icon={Check} /> for a type (Action and
        To-do already have it). Its bubbles get a little circle in the corner:
        tap it when that one’s done, and tap again to undo.
      </>
    ),
  },
  {
    icon: Pencil,
    title: "Notes",
    body: (
      <>
        <Btn icon={Pencil} /> on a bubble opens its notes. Double-tap a bubble
        to rename it.
      </>
    ),
  },
  {
    icon: Link2,
    title: "Tie ideas together",
    body: (
      <>
        <Btn icon={Link2} /> links two bubbles that belong together, even on
        different branches.
      </>
    ),
  },
  {
    icon: Sparkles,
    title: "Tidy up",
    body: (
      <>
        <Btn icon={Sparkles} /> neatly spaces out the whole web. Undo is right
        beside it.
      </>
    ),
    target: "tidy",
  },
  {
    icon: CircleHelp,
    title: "That’s it",
    body: (
      <>
        Tap <Btn icon={CircleHelp} /> up top any time to see these tips again.
      </>
    ),
    target: "tips",
  },
];

/** Whether this device has seen the tips; true if storage can't be read. */
export function hasSeenTips() {
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
 * Short tips, one at a time: shown the first time someone opens a chart, and
 * again from the toolbar's ? button. Closing them marks them seen on this
 * device. `onTargetChange` says which toolbar button the tip is about, so the
 * toolbar can point it out.
 */
export default function FirstVisitTips({
  onClose,
  onTargetChange,
}: {
  onClose: () => void;
  onTargetChange: (target: TipTarget | null) => void;
}) {
  const [step, setStep] = useState(0);
  const tip = TIPS[step];

  useEffect(() => {
    onTargetChange(tip.target ?? null);
    return () => onTargetChange(null);
  }, [tip, onTargetChange]);

  const last = step === TIPS.length - 1;
  const close = () => {
    markTipsSeen();
    onClose();
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
          key={step}
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
              key={item.title}
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
