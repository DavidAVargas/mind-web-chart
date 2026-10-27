"use client";

import { Check, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { FREE_CHART_LIMIT } from "@/lib/mind-map/chart-meta";

const PAID_PERKS = [
  "Unlimited charts",
  "Make each chart's key your own",
  "Ask Claude for ideas",
];

/** What the person tried to do that the free plan doesn't include. */
export type UpgradeReason = "charts" | "key";

const COPY: Record<UpgradeReason, { title: string; body: string }> = {
  charts: {
    title: "Your free chart is in use",
    body: `The free plan includes ${FREE_CHART_LIMIT} chart. Keep building on it, or delete it to start fresh. More charts come with the full version, coming soon.`,
  },
  key: {
    title: "Make the key your own",
    body: "Renaming types, picking colors and icons, and adding your own types come with the full version, coming soon. On the free plan, each template's key is ready to use as it is.",
  },
};

/** Shown when a free account reaches for something in the full version. */
export default function UpgradeDialog({
  reason,
  onClose,
}: {
  reason: UpgradeReason;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { title, body } = COPY[reason];

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      aria-labelledby="upgrade-dialog-title"
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
          <h2
            id="upgrade-dialog-title"
            className="font-display text-2xl font-medium tracking-tight"
          >
            {title}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {body}
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-sm">
          {PAID_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <Check
                className="size-4 text-emerald-500"
                strokeWidth={3}
                aria-hidden="true"
              />
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
