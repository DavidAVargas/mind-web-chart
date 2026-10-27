"use client";

import { Check, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { FREE_CHART_LIMIT } from "@/lib/mind-map/charts";

const PLUS_PERKS = ["Unlimited charts", "Ask Claude for ideas", "Everything new as it lands"];

/** Shown instead of the new-chart dialog once a free account is full. */
export default function LimitDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      aria-labelledby="limit-dialog-title"
      className="bg-card text-card-foreground border-border m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#9e77ed]/15 text-[#7f56d9] dark:text-[#b692f6]">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:bg-accent rounded-full p-1"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div>
          <h2 id="limit-dialog-title" className="font-display text-2xl font-medium tracking-tight">
            Your free chart is in use
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            The free plan includes {FREE_CHART_LIMIT} chart. Keep building on it, or
            delete it to start fresh. More charts are coming soon with the full
            version.
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-sm">
          {PLUS_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <Check className="size-4 text-emerald-500" strokeWidth={3} aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          Got it
        </button>
      </div>
    </dialog>
  );
}
