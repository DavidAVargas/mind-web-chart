"use client";

import { Copy, Download, Ellipsis, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast, Toaster } from "sonner";
import { exportMap } from "@/lib/mind-map/backup";
import {
  chartHref,
  createChart,
  deleteChart,
  duplicateChart,
  listCharts,
  loadChart,
  renameChart,
  restoreChart,
  type ChartMeta,
} from "@/lib/mind-map/charts";
import ChartDialog from "./chart-dialog";
import ChartPreview from "./chart-preview";

const timeAgo = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function editedAgo(time: number) {
  const minutes = Math.round((time - Date.now()) / 60000);
  if (minutes > -1) return "just now";
  if (minutes > -60) return timeAgo.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return timeAgo.format(hours, "hour");
  return timeAgo.format(Math.round(hours / 24), "day");
}

function CardMenu({
  onRename,
  onDuplicate,
  onExport,
  onDelete,
}: {
  onRename: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const item = (
    icon: ReactNode,
    label: string,
    onClick: () => void,
    danger = false,
  ) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className={`hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${danger ? "text-destructive" : ""}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div ref={ref} className="absolute top-2 right-2 z-10">
      <button
        type="button"
        aria-label="Chart options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="bg-card/80 hover:bg-accent flex size-8 items-center justify-center rounded-full backdrop-blur"
      >
        <Ellipsis className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="border-border bg-popover text-popover-foreground absolute top-full right-0 mt-1 w-44 rounded-xl border p-1 shadow-lg"
        >
          {item(
            <Pencil className="size-4" aria-hidden="true" />,
            "Rename",
            onRename,
          )}
          {item(
            <Copy className="size-4" aria-hidden="true" />,
            "Duplicate",
            onDuplicate,
          )}
          {item(
            <Download className="size-4" aria-hidden="true" />,
            "Export backup",
            onExport,
          )}
          {item(
            <Trash2 className="size-4" aria-hidden="true" />,
            "Delete",
            onDelete,
            true,
          )}
        </div>
      )}
    </div>
  );
}

/** The home page: every chart, plus a way to start a new one. */
export default function ChartsHome() {
  const router = useRouter();
  const [charts, setCharts] = useState<ChartMeta[]>(() => listCharts());
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "rename"; chart: ChartMeta } | null
  >(null);
  const refresh = () => setCharts(listCharts());

  function remove(chart: ChartMeta) {
    const removed = deleteChart(chart.id);
    refresh();
    toast(`Deleted “${chart.title}”`, {
      duration: 8000,
      action: removed
        ? {
            label: "Undo",
            onClick: () => {
              restoreChart(removed);
              refresh();
            },
          }
        : undefined,
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Your charts</h1>
        <button
          type="button"
          onClick={() => setDialog({ mode: "create" })}
          className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
        >
          <Plus className="size-4" aria-hidden="true" />
          New chart
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {charts.map((chart) => (
          <li
            key={chart.id}
            className="border-border bg-card text-card-foreground relative overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={chartHref(chart.id)} className="block">
              <div className="bg-muted/40 aspect-[16/10] p-3">
                <ChartPreview map={loadChart(chart.id)} />
              </div>
              <div className="flex flex-col gap-1 p-4">
                <h2 className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true">{chart.emoji}</span>
                  <span className="truncate">{chart.title}</span>
                </h2>
                <p className="text-muted-foreground text-xs">
                  {chart.bubbleCount}{" "}
                  {chart.bubbleCount === 1 ? "bubble" : "bubbles"}
                  {chart.actionCount > 0 &&
                    ` · ${chart.doneCount}/${chart.actionCount} actions done`}
                  {` · edited ${editedAgo(chart.updatedAt)}`}
                </p>
              </div>
            </Link>
            <CardMenu
              onRename={() => setDialog({ mode: "rename", chart })}
              onDuplicate={() => {
                duplicateChart(chart.id);
                refresh();
              }}
              onExport={() => {
                const map = loadChart(chart.id);
                if (map) exportMap(map);
              }}
              onDelete={() => remove(chart)}
            />
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => setDialog({ mode: "create" })}
            className="border-border text-muted-foreground hover:text-foreground hover:border-ring flex size-full min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors"
          >
            <Plus className="size-8" aria-hidden="true" />
            <span className="font-medium">New chart</span>
          </button>
        </li>
      </ul>

      {dialog?.mode === "create" && (
        <ChartDialog
          mode="create"
          onClose={() => setDialog(null)}
          onSubmit={(result) => {
            const id = createChart(result);
            setDialog(null);
            router.push(chartHref(id));
          }}
        />
      )}
      {dialog?.mode === "rename" && (
        <ChartDialog
          mode="rename"
          initialTitle={dialog.chart.title}
          initialEmoji={dialog.chart.emoji}
          onClose={() => setDialog(null)}
          onSubmit={({ title, emoji }) => {
            renameChart(dialog.chart.id, title, emoji);
            setDialog(null);
            refresh();
          }}
        />
      )}

      <Toaster position="bottom-center" />
    </div>
  );
}
