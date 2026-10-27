"use client";

import { HardDriveDownload } from "lucide-react";
import { useState } from "react";
import type { LocalChart } from "@/lib/mind-map/local-charts";

/** Offers to move charts saved in this browser (from before accounts) into the account. */
export default function ImportBanner({
  charts,
  onImport,
  onDismiss,
}: {
  charts: LocalChart[];
  onImport: () => Promise<void>;
  onDismiss: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const count = charts.length;
  const names = charts
    .slice(0, 3)
    .map((chart) => `${chart.emoji} ${chart.title}`)
    .join(", ");

  return (
    <section
      aria-label="Import charts from this browser"
      className="animate-in fade-in slide-in-from-top-2 border-border bg-card/90 mb-10 flex flex-col gap-4 rounded-3xl border p-5 shadow-sm backdrop-blur duration-500 sm:flex-row sm:items-center"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0ea5e9]/15 text-[#0284c7] dark:text-[#38bdf8]">
        <HardDriveDownload className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {count === 1
            ? "You have a chart saved in this browser"
            : `You have ${count} charts saved in this browser`}
        </p>
        <p className="text-muted-foreground truncate text-sm">
          Import {count === 1 ? "it" : "them"} to your account so{" "}
          {count === 1 ? "it's" : "they're"} with you everywhere: {names}
          {count > 3 ? "…" : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className="hover:bg-accent rounded-full px-4 py-2 text-sm font-medium"
        >
          Not now
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onImport();
            setBusy(false);
          }}
          className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-semibold shadow-sm disabled:opacity-60"
        >
          {busy ? "Importing…" : "Import"}
        </button>
      </div>
    </section>
  );
}
