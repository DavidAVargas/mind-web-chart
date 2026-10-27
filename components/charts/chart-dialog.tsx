"use client";

import { ArrowLeft, KeyRound, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePlan } from "@/components/auth/use-plan";
import { MAX_LABEL_LENGTH } from "@/lib/mind-map/bubble-kinds";
import type { ChartKey } from "@/lib/mind-map/chart-key";
import KeyEditor, { TypeSwatch } from "./key-editor";
import UpgradeDialog from "./upgrade-dialog";
import { DEFAULT_EMOJI } from "@/lib/mind-map/charts";
import { TEMPLATES, type TemplateId } from "@/lib/mind-map/templates";
import { cn } from "@/lib/utils";

const EMOJIS = [
  "🧠",
  "💭",
  "🎯",
  "🚀",
  "💼",
  "💪",
  "❤️",
  "🌍",
  "✈️",
  "💰",
  "📚",
  "🎨",
  "🏠",
  "🌱",
  "⚡",
  "🧩",
  "🎵",
  "🏆",
  "🔥",
  "🌙",
  "☀️",
  "🛠️",
  "📝",
  "🎬",
];

export type ChartDialogResult = {
  title: string;
  emoji: string;
  template: TemplateId;
  /** The key picked in the second step when creating. */
  key: ChartKey;
};

/** The new chart's center with its types around it, so the key reads like a web. */
function KeyPreview({
  emoji,
  chartKey,
}: {
  emoji: string;
  chartKey: ChartKey;
}) {
  const radius = 88;
  return (
    <div className="bg-paper bg-muted/50 relative mx-auto h-60 w-full overflow-hidden rounded-2xl">
      {chartKey.map((type, i) => {
        const angle = (i / chartKey.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius * 1.35;
        const y = Math.sin(angle) * radius;
        return (
          <div key={type.id}>
            <span
              aria-hidden="true"
              className="bg-muted-foreground/30 absolute top-1/2 left-1/2 h-0.5 origin-left"
              style={{
                width: Math.hypot(x, y),
                transform: `rotate(${Math.atan2(y, x)}rad)`,
              }}
            />
            <div
              className="animate-in fade-in zoom-in-50 absolute top-1/2 left-1/2 flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 duration-300"
              style={{
                marginLeft: x,
                marginTop: y,
                animationDelay: `${i * 40}ms`,
                animationFillMode: "both",
              }}
            >
              <TypeSwatch
                type={type}
                className="ring-background size-9 ring-4"
              />
              <span className="bg-background/80 max-w-full truncate rounded-full px-1.5 text-[11px] font-medium backdrop-blur">
                {type.label || "New type"}
              </span>
            </div>
          </div>
        );
      })}
      <span className="bg-foreground text-background ring-background absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl shadow-lg ring-4">
        {emoji}
      </span>
    </div>
  );
}

/** Create a chart (name, emoji, template) or rename one (name, emoji). */
export default function ChartDialog({
  mode,
  initialTitle = "",
  initialEmoji = DEFAULT_EMOJI,
  initialTemplate = "blank",
  onSubmit,
  onClose,
}: {
  mode: "create" | "rename";
  initialTitle?: string;
  initialEmoji?: string;
  initialTemplate?: TemplateId;
  onSubmit: (result: ChartDialogResult) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [chartKey, setChartKey] = useState<ChartKey>(
    TEMPLATES[initialTemplate].key,
  );
  /** Creating has two steps: the basics, then the chart key. */
  const [step, setStep] = useState<"basics" | "key">("basics");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { isPaid } = usePlan();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // A native modal dialog traps focus and closes on Escape.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (mode === "create" && step === "basics") {
      setStep("key");
      return;
    }
    onSubmit({
      title: trimmed,
      emoji: emoji || DEFAULT_EMOJI,
      template,
      key: chartKey,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      aria-labelledby="chart-dialog-title"
      className="bg-card text-card-foreground border-border m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50"
    >
      <form onSubmit={submit} className="flex flex-col gap-5 p-5">
        <div className="flex items-center justify-between">
          <h2
            id="chart-dialog-title"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            {step === "key" ? (
              <>
                <KeyRound className="size-4" aria-hidden="true" />
                Set up your chart key
              </>
            ) : mode === "create" ? (
              "New chart"
            ) : (
              "Rename chart"
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:bg-accent rounded-full p-1"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {step === "key" && (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground -mt-2 text-sm">
              {isPaid
                ? "The kinds of bubble this chart will use. Name them for what you’re working on, like Option, Cost or Character. You can change them anytime from 🔑 in the chart."
                : "The kinds of bubble this chart will use, each with its own color and icon."}
            </p>
            <KeyPreview emoji={emoji || DEFAULT_EMOJI} chartKey={chartKey} />
            <KeyEditor
              value={chartKey}
              onChange={setChartKey}
              locked={!isPaid}
              onLocked={() => setUpgradeOpen(true)}
            />
          </div>
        )}

        {step === "basics" && (
          <>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              What’s in the middle?
              <div className="flex items-center gap-2">
                <span className="bg-foreground text-background flex size-11 shrink-0 items-center justify-center rounded-full text-xl">
                  {emoji || DEFAULT_EMOJI}
                </span>
                <input
                  autoFocus
                  required
                  value={title}
                  maxLength={MAX_LABEL_LENGTH}
                  placeholder="My Mind, Startup idea, My novel…"
                  onChange={(event) => setTitle(event.target.value)}
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-base font-normal"
                />
              </div>
              <span className="text-muted-foreground text-xs font-normal">
                This is the center bubble everything branches out from.
              </span>
            </label>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm font-medium">Emoji</legend>
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setEmoji(option)}
                    aria-label={`Use ${option}`}
                    aria-pressed={emoji === option}
                    className={cn(
                      "hover:bg-accent flex aspect-square items-center justify-center rounded-lg text-xl",
                      emoji === option && "bg-accent ring-ring ring-2",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <label className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                Or type your own:
                <input
                  value={EMOJIS.includes(emoji) ? "" : emoji}
                  maxLength={8}
                  placeholder="🙂"
                  aria-label="Custom emoji"
                  onChange={(event) => setEmoji(event.target.value.trim())}
                  className="border-input bg-background w-16 rounded-md border px-2 py-1 text-center text-base"
                />
              </label>
            </fieldset>

            {mode === "create" && (
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-sm font-medium">
                  Start from
                </legend>
                {(Object.keys(TEMPLATES) as TemplateId[]).map((id) => (
                  <label
                    key={id}
                    className={cn(
                      "border-border hover:bg-accent flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5",
                      template === id && "border-ring bg-accent",
                    )}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={id}
                      checked={template === id}
                      onChange={() => {
                        setTemplate(id);
                        setChartKey(TEMPLATES[id].key);
                      }}
                      className="mt-1"
                    />
                    <span className="text-sm">
                      <span className="font-medium">{TEMPLATES[id].label}</span>
                      <span className="text-muted-foreground block text-xs">
                        {TEMPLATES[id].description}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
          </>
        )}

        <div className="flex justify-end gap-2">
          {step === "key" && (
            <button
              type="button"
              onClick={() => setStep("basics")}
              className="hover:bg-accent mr-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-accent rounded-lg px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {mode === "rename"
              ? "Save"
              : step === "basics"
                ? "Next: chart key"
                : "Create chart"}
          </button>
        </div>
      </form>

      {upgradeOpen && (
        <UpgradeDialog reason="key" onClose={() => setUpgradeOpen(false)} />
      )}
    </dialog>
  );
}
