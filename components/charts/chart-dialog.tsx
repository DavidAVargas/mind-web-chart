"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MAX_LABEL_LENGTH } from "@/lib/mind-map/bubble-kinds";
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
};

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
  const dialogRef = useRef<HTMLDialogElement>(null);

  // A native modal dialog traps focus and closes on Escape.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, emoji: emoji || DEFAULT_EMOJI, template });
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
          <h2 id="chart-dialog-title" className="text-lg font-semibold">
            {mode === "create" ? "New chart" : "Rename chart"}
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

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          What&apos;s in the middle?
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
            <legend className="mb-1.5 text-sm font-medium">Start from</legend>
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
                  onChange={() => setTemplate(id)}
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

        <div className="flex justify-end gap-2">
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
            {mode === "create" ? "Create chart" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
