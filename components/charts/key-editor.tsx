"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  KEY_COLORS,
  KEY_ICONS,
  MAX_KEY_TYPES,
  MAX_TYPE_LABEL,
  newTypeId,
  type ChartKey,
  type KeyColor,
  type KeyIcon,
  type KeyType,
} from "@/lib/mind-map/chart-key";
import { cn } from "@/lib/utils";

const COLORS = Object.keys(KEY_COLORS) as KeyColor[];
const ICONS = Object.keys(KEY_ICONS) as KeyIcon[];

/** Three rows of eight. KEY_ICONS holds whole pages, so none is left half full. */
const ICONS_PER_PAGE = 24;
const ICON_PAGES = Array.from(
  { length: Math.ceil(ICONS.length / ICONS_PER_PAGE) },
  (_, page) => ICONS.slice(page * ICONS_PER_PAGE, (page + 1) * ICONS_PER_PAGE),
);
const pageOf = (icon: KeyIcon) =>
  Math.floor(ICONS.indexOf(icon) / ICONS_PER_PAGE);

/** A type's dot: its color, with its icon inside. */
export function TypeSwatch({
  type,
  className,
}: {
  type: Pick<KeyType, "color" | "icon">;
  className?: string;
}) {
  const Icon = KEY_ICONS[type.icon];
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
        type.color === "outline" &&
          "border-muted-foreground text-foreground border-2 border-dashed",
        className,
      )}
      style={
        type.color === "outline"
          ? undefined
          : { background: KEY_COLORS[type.color].hex }
      }
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

/**
 * Edits a chart's key: each type's name, color and icon, whether it can be
 * ticked off, plus adding and removing types. Locked shows it read-only and
 * hands any edit to `onLocked`, for the free plan.
 */
export default function KeyEditor({
  value,
  onChange,
  locked,
  onLocked,
  usage,
}: {
  value: ChartKey;
  onChange: (key: ChartKey) => void;
  locked: boolean;
  onLocked: () => void;
  /** How many bubbles use each type; types in use can't be removed. */
  usage?: Map<string, number>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [iconPage, setIconPage] = useState(0);

  const update = (id: string, change: Partial<KeyType>) =>
    onChange(
      value.map((type) => (type.id === id ? { ...type, ...change } : type)),
    );

  function addType() {
    const used = new Set(value.map((type) => type.color));
    const type: KeyType = {
      id: newTypeId(),
      label: "",
      color: COLORS.find((color) => !used.has(color)) ?? "slate",
      icon: "star",
    };
    onChange([...value, type]);
    setOpenId(type.id);
    setIconPage(pageOf(type.icon));
  }

  if (locked) {
    return (
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {value.map((type) => (
            <li key={type.id} className="flex items-center gap-3">
              <TypeSwatch type={type} />
              <span className="min-w-0 text-sm leading-snug">
                <span className="flex items-center gap-1.5 font-medium">
                  {type.label}
                  {type.checkable && (
                    <Check
                      className="size-3.5 text-emerald-500"
                      strokeWidth={3}
                      aria-label="Can be ticked off"
                    />
                  )}
                </span>
                {type.hint && (
                  <span className="text-muted-foreground block text-xs">
                    {type.hint}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onLocked}
          className="border-border hover:bg-accent flex items-center justify-center gap-2 rounded-full border border-dashed px-4 py-2 text-sm font-medium"
        >
          <Lock className="size-3.5" aria-hidden="true" />
          Edit the key with the full version
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {value.map((type) => {
          const inUse = usage?.get(type.id) ?? 0;
          const open = openId === type.id;
          return (
            <li
              key={type.id}
              className={cn(
                "border-border rounded-2xl border p-2 transition-colors",
                open ? "bg-muted/50" : "border-transparent",
              )}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(open ? null : type.id);
                    setIconPage(pageOf(type.icon));
                  }}
                  aria-label={`Color and icon for ${type.label || "this type"}`}
                  aria-expanded={open}
                  title="Color and icon"
                  className="rounded-full transition-transform hover:scale-110"
                >
                  <TypeSwatch type={type} />
                </button>
                <input
                  value={type.label}
                  // A type that was just added starts with the cursor in its name.
                  autoFocus={!type.label}
                  maxLength={MAX_TYPE_LABEL}
                  placeholder="Name this type"
                  aria-label="Type name"
                  onChange={(event) =>
                    update(type.id, { label: event.target.value })
                  }
                  onBlur={(event) =>
                    !event.target.value.trim() &&
                    update(type.id, { label: "Untitled type" })
                  }
                  className="border-input bg-background min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-sm"
                />
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(type.checkable)}
                  aria-label={`${type.label}: can be ticked off`}
                  title={
                    type.checkable
                      ? "Can be ticked off ✓"
                      : "Make it something you can tick off"
                  }
                  onClick={() =>
                    update(type.id, { checkable: !type.checkable })
                  }
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    type.checkable
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500",
                  )}
                >
                  <Check
                    className="size-4"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(value.filter((item) => item.id !== type.id))
                  }
                  disabled={inUse > 0 || value.length === 1}
                  aria-label={`Remove ${type.label}`}
                  title={
                    inUse > 0
                      ? `Used by ${inUse} ${inUse === 1 ? "bubble" : "bubbles"}. Change their type first`
                      : "Remove type"
                  }
                  className="text-muted-foreground hover:text-destructive hover:bg-accent flex size-8 shrink-0 items-center justify-center rounded-full disabled:pointer-events-none disabled:opacity-30"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              {open && (
                <div className="animate-in fade-in slide-in-from-top-1 mt-3 flex flex-col gap-3 px-1 pb-1 duration-200">
                  <div
                    role="radiogroup"
                    aria-label="Color"
                    className="flex flex-wrap gap-1.5"
                  >
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        role="radio"
                        aria-checked={type.color === color}
                        aria-label={color}
                        onClick={() => update(type.id, { color })}
                        className={cn(
                          "size-7 rounded-full transition-transform hover:scale-110",
                          color === "outline" &&
                            "border-muted-foreground border-2 border-dashed",
                          type.color === color &&
                            "ring-ring ring-offset-background ring-2 ring-offset-2",
                        )}
                        style={
                          color === "outline"
                            ? undefined
                            : { background: KEY_COLORS[color].hex }
                        }
                      />
                    ))}
                  </div>
                  <div
                    role="radiogroup"
                    aria-label={`Icon, page ${iconPage + 1} of ${ICON_PAGES.length}`}
                    className="grid grid-cols-8 gap-1"
                  >
                    {ICON_PAGES[iconPage].map((icon) => {
                      const Icon = KEY_ICONS[icon];
                      return (
                        <button
                          key={icon}
                          type="button"
                          role="radio"
                          aria-checked={type.icon === icon}
                          aria-label={icon}
                          onClick={() => update(type.id, { icon })}
                          className={cn(
                            "hover:bg-accent flex aspect-square items-center justify-center rounded-lg",
                            type.icon === icon && "bg-accent ring-ring ring-2",
                          )}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                  {ICON_PAGES.length > 1 && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIconPage(iconPage - 1)}
                        disabled={iconPage === 0}
                        aria-label="Previous icons"
                        className="hover:bg-accent flex size-7 items-center justify-center rounded-full disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                      </button>
                      <div className="flex gap-1.5" aria-hidden="true">
                        {ICON_PAGES.map((_, page) => (
                          <span
                            key={page}
                            className={cn(
                              "size-1.5 rounded-full transition-colors",
                              page === iconPage
                                ? "bg-foreground"
                                : "bg-muted-foreground/30",
                            )}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIconPage(iconPage + 1)}
                        disabled={iconPage === ICON_PAGES.length - 1}
                        aria-label="More icons"
                        className="hover:bg-accent flex size-7 items-center justify-center rounded-full disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {value.length < MAX_KEY_TYPES && (
        <button
          type="button"
          onClick={addType}
          className="border-border hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-2.5 text-sm font-medium"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add a type
        </button>
      )}
    </div>
  );
}
