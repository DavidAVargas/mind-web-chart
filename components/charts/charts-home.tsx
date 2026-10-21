"use client";

import {
  ArrowDownWideNarrow,
  CircleCheck,
  Copy,
  Download,
  Ellipsis,
  Pencil,
  Plus,
  Search,
  Trash2,
  Waypoints,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import TemplateArt from "./template-art";
import GlowBackdrop from "@/components/brand/glow-backdrop";
import { LogoMark } from "@/components/brand/logo";
import { TEMPLATES, type TemplateId } from "@/lib/mind-map/templates";
import { cn } from "@/lib/utils";

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
    <div ref={ref} className="absolute top-3 right-3 z-10">
      <button
        type="button"
        aria-label="Chart options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="bg-card/90 hover:bg-accent border-border flex size-8 items-center justify-center rounded-full border shadow-sm backdrop-blur"
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

type SortBy = "edited" | "name" | "created";

const SORTS: Record<
  SortBy,
  { label: string; compare: (a: ChartMeta, b: ChartMeta) => number }
> = {
  edited: {
    label: "Recently edited",
    compare: (a, b) => b.updatedAt - a.updatedAt,
  },
  created: {
    label: "Newest first",
    compare: (a, b) => b.createdAt - a.createdAt,
  },
  name: {
    label: "Name A–Z",
    compare: (a, b) => a.title.localeCompare(b.title),
  },
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Each card and tile rises in a beat after the one before it. */
function rise(index: number) {
  return {
    className:
      "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 motion-reduce:animate-none",
    style: { animationDelay: `${Math.min(index, 12) * 45}ms` },
  };
}

function TemplateTiles({
  onPick,
  large,
}: {
  onPick: (template: TemplateId) => void;
  large?: boolean;
}) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {(Object.keys(TEMPLATES) as TemplateId[]).map((id, i) => {
        const { className, style } = rise(i);
        return (
          <li key={id} className={className} style={style}>
            <button
              type="button"
              onClick={() => onPick(id)}
              className={cn(
                "group border-border bg-card/70 hover:border-foreground/25 flex w-full items-center gap-4 rounded-2xl border p-3 text-left backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-col sm:items-stretch",
                large && "sm:p-4",
              )}
            >
              <span
                className={cn(
                  "bg-paper bg-muted/50 text-foreground flex h-16 w-24 shrink-0 items-center justify-center rounded-xl p-2 transition-transform group-hover:scale-[1.02] sm:h-24 sm:w-full",
                  large && "sm:h-32",
                )}
              >
                <TemplateArt template={id} />
              </span>
              <span>
                <span className="block font-medium">{TEMPLATES[id].label}</span>
                <span className="text-muted-foreground block text-xs leading-snug">
                  {TEMPLATES[id].description}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** The home page: every chart, plus a way to start a new one. */
export default function ChartsHome() {
  const router = useRouter();
  const [charts, setCharts] = useState<ChartMeta[]>(() => listCharts());
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("edited");
  const [dialog, setDialog] = useState<
    | { mode: "create"; template: TemplateId }
    | { mode: "rename"; chart: ChartMeta }
    | null
  >(null);
  const refresh = () => setCharts(listCharts());
  const startChart = (template: TemplateId = "blank") =>
    setDialog({ mode: "create", template });

  const totals = useMemo(
    () =>
      charts.reduce(
        (sum, chart) => ({
          bubbles: sum.bubbles + chart.bubbleCount,
          actions: sum.actions + chart.actionCount,
          done: sum.done + chart.doneCount,
        }),
        { bubbles: 0, actions: 0, done: 0 },
      ),
    [charts],
  );

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return charts
      .filter((chart) => !needle || chart.title.toLowerCase().includes(needle))
      .sort(SORTS[sortBy].compare);
  }, [charts, query, sortBy]);

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

  const isEmpty = charts.length === 0;

  return (
    <div className="bg-paper relative min-h-full">
      <GlowBackdrop />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-28 sm:px-6 sm:pt-14 sm:pb-16">
        {isEmpty ? (
          <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <LogoMark className="animate-in fade-in zoom-in-90 size-16 duration-700 motion-reduce:animate-none" />
            <h1 className="font-display mt-6 text-4xl font-medium tracking-tight sm:text-5xl">
              Every web starts with one thought.
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl text-base">
              Put what&apos;s on your mind in the middle, branch out into goals,
              blockers and actions, and tie it all together with threads.
            </p>
            <div className="mt-10 w-full">
              <TemplateTiles large onPick={startChart} />
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {greeting()}
                </p>
                <h1 className="font-display mt-1 text-4xl font-medium tracking-tight sm:text-5xl">
                  What&apos;s on your mind?
                </h1>
                <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span>
                    {charts.length} {charts.length === 1 ? "chart" : "charts"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Waypoints className="size-3.5" aria-hidden="true" />
                    {totals.bubbles} bubbles
                  </span>
                  {totals.actions > 0 && (
                    <span className="flex items-center gap-1.5">
                      <CircleCheck
                        className="size-3.5 text-emerald-500"
                        aria-hidden="true"
                      />
                      {totals.done} of {totals.actions} actions done
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startChart()}
                className="bg-primary text-primary-foreground hidden items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md sm:flex sm:self-auto"
              >
                <Plus className="size-4" aria-hidden="true" />
                New chart
              </button>
            </section>

            <section className="mt-12" aria-labelledby="start-heading">
              <h2
                id="start-heading"
                className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase"
              >
                Start something new
              </h2>
              <TemplateTiles onPick={startChart} />
            </section>

            <section className="mt-12" aria-labelledby="charts-heading">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2
                  id="charts-heading"
                  className="text-muted-foreground text-xs font-semibold tracking-widest uppercase"
                >
                  Your charts
                </h2>
                <div className="flex items-center gap-2">
                  <label className="relative flex-1 sm:flex-none">
                    <Search
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search charts"
                      aria-label="Search charts"
                      className="border-border bg-card/80 w-full rounded-full border py-2 pr-3 pl-9 text-sm backdrop-blur sm:w-56"
                    />
                  </label>
                  <label className="border-border bg-card/80 relative flex items-center rounded-full border backdrop-blur">
                    <ArrowDownWideNarrow
                      className="text-muted-foreground pointer-events-none absolute left-3 size-4"
                      aria-hidden="true"
                    />
                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(event.target.value as SortBy)
                      }
                      aria-label="Sort charts"
                      className="appearance-none bg-transparent py-2 pr-4 pl-9 text-sm"
                    >
                      {(Object.keys(SORTS) as SortBy[]).map((key) => (
                        <option key={key} value={key}>
                          {SORTS[key].label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {shown.length === 0 ? (
                <p className="text-muted-foreground border-border rounded-2xl border border-dashed py-12 text-center text-sm">
                  No charts match “{query.trim()}”
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((chart, i) => {
                    const { className, style } = rise(i);
                    const progress = chart.actionCount
                      ? chart.doneCount / chart.actionCount
                      : 0;
                    return (
                      <li
                        key={chart.id}
                        style={style}
                        className={cn(
                          "group border-border bg-card text-card-foreground relative rounded-3xl border shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl",
                          className,
                        )}
                      >
                        <Link
                          href={chartHref(chart.id)}
                          className="focus-visible:ring-ring block rounded-3xl focus-visible:ring-2 focus-visible:outline-none"
                        >
                          <div className="bg-paper bg-muted/40 relative m-2 aspect-[16/10] overflow-hidden rounded-[1.25rem] p-4">
                            <div className="size-full transition-transform duration-500 group-hover:scale-105">
                              <ChartPreview map={loadChart(chart.id)} />
                            </div>
                            <span className="bg-foreground text-background absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-full text-lg shadow-md ring-4 ring-[var(--card)]">
                              {chart.emoji}
                            </span>
                          </div>
                          <div className="px-5 pt-2 pb-5">
                            <h3 className="font-display truncate text-xl font-medium tracking-tight">
                              {chart.title}
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {chart.bubbleCount}{" "}
                              {chart.bubbleCount === 1 ? "bubble" : "bubbles"} ·
                              edited {editedAgo(chart.updatedAt)}
                            </p>
                            {chart.actionCount > 0 && (
                              <div className="mt-3 flex items-center gap-2">
                                <div
                                  className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
                                  role="progressbar"
                                  aria-label="Actions done"
                                  aria-valuemin={0}
                                  aria-valuemax={chart.actionCount}
                                  aria-valuenow={chart.doneCount}
                                >
                                  <div
                                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
                                    style={{ width: `${progress * 100}%` }}
                                  />
                                </div>
                                <span className="text-muted-foreground text-xs tabular-nums">
                                  {chart.doneCount}/{chart.actionCount}
                                </span>
                              </div>
                            )}
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
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>

      {/* On phones, a floating button like a native app. */}
      {!isEmpty && (
        <button
          type="button"
          onClick={() => startChart()}
          aria-label="New chart"
          className="bg-primary text-primary-foreground fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 flex size-14 items-center justify-center rounded-full shadow-xl transition-transform active:scale-95 sm:hidden"
        >
          <Plus className="size-6" aria-hidden="true" />
        </button>
      )}

      {dialog?.mode === "create" && (
        <ChartDialog
          mode="create"
          initialTemplate={dialog.template}
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
