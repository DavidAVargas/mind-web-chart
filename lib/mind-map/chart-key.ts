import {
  Ban,
  BookOpen,
  Calendar,
  CircleDollarSign,
  CircleHelp,
  Flag,
  Footprints,
  Heart,
  House,
  Info,
  Layers,
  Lightbulb,
  ListChecks,
  MapPin,
  MessageCircle,
  Plane,
  Sparkles,
  Star,
  StickyNote,
  Target,
  ThumbsDown,
  ThumbsUp,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Edge, Node } from "@xyflow/react";
import { getParentId, isBranch } from "./graph";

/**
 * A chart's key: the kinds of bubble it uses, each with a name, color and
 * icon, like the key on a map. Every chart keeps its own. Size never comes
 * from the type; it comes from how far out a bubble sits.
 */

/** Colors a type can have. Class names are spelled out so Tailwind keeps them. */
export const KEY_COLORS = {
  purple: {
    hex: "#9e77ed",
    className:
      "bg-brand-100 border-brand-500 text-brand-900 dark:bg-brand-900 dark:border-brand-400 dark:text-brand-50",
  },
  sky: {
    hex: "#0ea5e9",
    className:
      "bg-sky-100 border-sky-500 text-sky-950 dark:bg-sky-950 dark:border-sky-400 dark:text-sky-50",
  },
  rose: {
    hex: "#f43f5e",
    className:
      "bg-rose-100 border-rose-500 text-rose-950 dark:bg-rose-950 dark:border-rose-400 dark:text-rose-50",
  },
  amber: {
    hex: "#f59e0b",
    className:
      "bg-amber-100 border-amber-500 text-amber-950 dark:bg-amber-950 dark:border-amber-400 dark:text-amber-50",
  },
  emerald: {
    hex: "#10b981",
    className:
      "bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-950 dark:border-emerald-400 dark:text-emerald-50",
  },
  indigo: {
    hex: "#6366f1",
    className:
      "bg-indigo-100 border-indigo-500 text-indigo-950 dark:bg-indigo-950 dark:border-indigo-400 dark:text-indigo-50",
  },
  pink: {
    hex: "#ec4899",
    className:
      "bg-pink-100 border-pink-500 text-pink-950 dark:bg-pink-950 dark:border-pink-400 dark:text-pink-50",
  },
  orange: {
    hex: "#f97316",
    className:
      "bg-orange-100 border-orange-500 text-orange-950 dark:bg-orange-950 dark:border-orange-400 dark:text-orange-50",
  },
  teal: {
    hex: "#14b8a6",
    className:
      "bg-teal-100 border-teal-500 text-teal-950 dark:bg-teal-950 dark:border-teal-400 dark:text-teal-50",
  },
  lime: {
    hex: "#84cc16",
    className:
      "bg-lime-100 border-lime-500 text-lime-950 dark:bg-lime-950 dark:border-lime-400 dark:text-lime-50",
  },
  slate: {
    hex: "#64748b",
    className:
      "bg-slate-100 border-slate-500 text-slate-950 dark:bg-slate-900 dark:border-slate-400 dark:text-slate-50",
  },
  /** Outlined and dashed, for loose thoughts. */
  outline: {
    hex: "#a3a3a3",
    className:
      "bg-background border-dashed border-muted-foreground text-foreground",
  },
} satisfies Record<string, { hex: string; className: string }>;

export type KeyColor = keyof typeof KEY_COLORS;

export const KEY_ICONS = {
  layers: Layers,
  target: Target,
  ban: Ban,
  question: CircleHelp,
  footprints: Footprints,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  info: Info,
  "thumbs-up": ThumbsUp,
  "thumbs-down": ThumbsDown,
  checks: ListChecks,
  note: StickyNote,
  money: CircleDollarSign,
  calendar: Calendar,
  pin: MapPin,
  plane: Plane,
  home: House,
  person: User,
  heart: Heart,
  star: Star,
  flag: Flag,
  book: BookOpen,
  chat: MessageCircle,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type KeyIcon = keyof typeof KEY_ICONS;

export type KeyType = {
  id: string;
  label: string;
  /** A short "use it for…" line. */
  hint?: string;
  color: KeyColor;
  icon: KeyIcon;
  /** Bubbles of this type get a ✓ to tick off, and count toward progress. */
  checkable?: boolean;
  /** The type suggested for a bubble added off one of these, when nothing nearby suggests better. */
  next?: string;
};

export type ChartKey = KeyType[];

/** The center bubble's kind. It's not part of any key. */
export const ROOT_KIND = "root";

export const MAX_KEY_TYPES = 12;
export const MAX_TYPE_LABEL = 20;

/** The Life map's key. Charts made before keys existed use it too. */
export const LIFE_KEY: ChartKey = [
  {
    id: "area",
    label: "Area",
    hint: "A part of your life, like Dreams, Career or Health",
    color: "purple",
    icon: "layers",
    next: "goal",
  },
  {
    id: "goal",
    label: "Goal",
    hint: "Something you want",
    color: "sky",
    icon: "target",
    next: "blocker",
  },
  {
    id: "blocker",
    label: "Blocker",
    hint: "What's in the way",
    color: "rose",
    icon: "ban",
    next: "root-cause",
  },
  {
    id: "root-cause",
    label: "Root cause",
    hint: "Why the blocker exists",
    color: "amber",
    icon: "question",
    next: "action",
  },
  {
    id: "action",
    label: "Action",
    hint: "A step you can take. Tick it off when it's done",
    color: "emerald",
    icon: "footprints",
    checkable: true,
  },
  {
    id: "thought",
    label: "Thought",
    hint: "Anything, for free brainstorming",
    color: "outline",
    icon: "lightbulb",
  },
];

/** The Problem solver's key: the Life map's, without Areas. */
export const PROBLEM_KEY: ChartKey = LIFE_KEY.filter(
  (type) => type.id !== "area",
);

/** A general key for blank charts: options to weigh, and what you find out about them. */
export const BLANK_KEY: ChartKey = [
  {
    id: "option",
    label: "Option",
    hint: "A choice you're weighing, like a place or a plan",
    color: "purple",
    icon: "sparkles",
    next: "detail",
  },
  {
    id: "detail",
    label: "Detail",
    hint: "A fact: cost, dates, how long",
    color: "sky",
    icon: "info",
  },
  {
    id: "pro",
    label: "Pro",
    hint: "A reason for",
    color: "emerald",
    icon: "thumbs-up",
  },
  {
    id: "con",
    label: "Con",
    hint: "A reason against",
    color: "rose",
    icon: "thumbs-down",
  },
  {
    id: "question",
    label: "Question",
    hint: "Something to find out",
    color: "amber",
    icon: "question",
  },
  {
    id: "todo",
    label: "To-do",
    hint: "Something to do. Tick it off when it's done",
    color: "indigo",
    icon: "checks",
    checkable: true,
  },
  {
    id: "note",
    label: "Note",
    hint: "Anything else",
    color: "outline",
    icon: "note",
  },
];

/** Shown for a bubble whose type was removed from the key. */
const MISSING_TYPE: KeyType = {
  id: "",
  label: "No type",
  color: "outline",
  icon: "lightbulb",
};

export function getType(key: ChartKey, kind: string): KeyType {
  return key.find((type) => type.id === kind) ?? MISSING_TYPE;
}

export function isCheckable(key: ChartKey, kind: string) {
  return Boolean(key.find((type) => type.id === kind)?.checkable);
}

export function newTypeId() {
  return `type-${crypto.randomUUID().slice(0, 8)}`;
}

const isString = (value: unknown): value is string => typeof value === "string";

/** Checks a key read from storage or a file; null if there isn't a usable one. */
export function parseKey(value: unknown): ChartKey | null {
  if (!Array.isArray(value)) return null;
  const key = value
    .filter(
      (type): type is KeyType =>
        Boolean(type) &&
        isString(type.id) &&
        type.id !== ROOT_KIND &&
        isString(type.label) &&
        type.color in KEY_COLORS &&
        type.icon in KEY_ICONS,
    )
    .slice(0, MAX_KEY_TYPES)
    .map(({ id, label, hint, color, icon, checkable, next }) => ({
      id,
      label: label.slice(0, MAX_TYPE_LABEL),
      ...(isString(hint) && { hint: hint.slice(0, 120) }),
      color,
      icon,
      ...(checkable === true && { checkable }),
      ...(isString(next) && { next }),
    }));
  return key.length ? key : null;
}

/**
 * The type for a bubble about to be added under `parentId`. Bubbles side by
 * side usually match, so it follows, in order: the parent's other children;
 * the children of bubbles next to the parent (so each option gets the same
 * kind of detail); the parent type's suggested next type; and the key's
 * first type.
 */
export function suggestKind(
  key: ChartKey,
  parentId: string,
  nodes: Node<{ kind: string }>[],
  edges: Edge[],
): string {
  const inKey = (kind: string | undefined) =>
    kind !== undefined && key.some((type) => type.id === kind)
      ? kind
      : undefined;
  const kindOf = (id: string) =>
    nodes.find((node) => node.id === id)?.data.kind;
  const childrenOf = (id: string) =>
    edges
      .filter((edge) => isBranch(edge) && edge.source === id)
      .map((edge) => edge.target);

  const siblings = childrenOf(parentId);
  const fromSiblings = inKey(kindOf(siblings.at(-1) ?? ""));
  if (fromSiblings) return fromSiblings;

  const grandparentId = getParentId(parentId, edges);
  if (grandparentId) {
    const cousins = childrenOf(grandparentId)
      .filter((id) => id !== parentId)
      .flatMap(childrenOf);
    const fromCousins = inKey(kindOf(cousins.at(-1) ?? ""));
    if (fromCousins) return fromCousins;
  }

  const parentKind = kindOf(parentId);
  const fromParent = inKey(key.find((type) => type.id === parentKind)?.next);
  if (fromParent) return fromParent;

  return key[0]?.id ?? "";
}
