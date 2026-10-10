import {
  Ban,
  CircleHelp,
  Footprints,
  Layers,
  Lightbulb,
  Target,
  type LucideIcon,
} from "lucide-react";

/**
 * What a bubble is. The kind sets a bubble's color and icon; its size comes
 * from how far out it sits from My Mind, so kinds can be mixed freely.
 */
export type BubbleKind =
  | "root"
  | "area"
  | "goal"
  | "blocker"
  | "root-cause"
  | "action"
  | "thought";

type BubbleKindConfig = {
  label: string;
  /** Short hint shown when picking a kind. */
  hint: string;
  icon: LucideIcon | null;
  /** Solid color for the mini-map and the types legend. */
  color: string;
  /** Tailwind classes for the bubble's fill, border and text. */
  className: string;
  /** Kind a new bubble gets when added off this one. */
  childKind: BubbleKind;
};

export const BUBBLE_KINDS: Record<BubbleKind, BubbleKindConfig> = {
  root: {
    label: "My Mind",
    hint: "The center of everything",
    icon: null,
    color: "var(--foreground)",
    // Black in light mode, white in dark mode, so it stands apart from every type.
    className:
      "bg-foreground border-foreground text-background font-semibold shadow-lg",
    childKind: "area",
  },
  area: {
    label: "Area",
    hint: "A part of your life, like Dreams, Career or Health",
    icon: Layers,
    color: "#9e77ed",
    className:
      "bg-brand-100 border-brand-500 text-brand-900 font-semibold dark:bg-brand-900 dark:border-brand-400 dark:text-brand-50",
    childKind: "goal",
  },
  goal: {
    label: "Goal",
    hint: "Something you want",
    icon: Target,
    color: "#0ea5e9",
    className:
      "bg-sky-100 border-sky-500 text-sky-950 font-medium dark:bg-sky-950 dark:border-sky-400 dark:text-sky-50",
    childKind: "blocker",
  },
  blocker: {
    label: "Blocker",
    hint: "What's in the way",
    icon: Ban,
    color: "#f43f5e",
    className:
      "bg-rose-100 border-rose-500 text-rose-950 font-medium dark:bg-rose-950 dark:border-rose-400 dark:text-rose-50",
    childKind: "root-cause",
  },
  "root-cause": {
    label: "Root cause",
    hint: "Why the blocker exists",
    icon: CircleHelp,
    color: "#f59e0b",
    className:
      "bg-amber-100 border-amber-500 text-amber-950 font-medium dark:bg-amber-950 dark:border-amber-400 dark:text-amber-50",
    childKind: "action",
  },
  action: {
    label: "Action",
    hint: "A step you can take — tick it off when it's done",
    icon: Footprints,
    color: "#10b981",
    className:
      "bg-emerald-100 border-emerald-500 text-emerald-950 font-medium dark:bg-emerald-950 dark:border-emerald-400 dark:text-emerald-50",
    childKind: "action",
  },
  thought: {
    label: "Thought",
    hint: "Anything — for free brainstorming",
    icon: Lightbulb,
    color: "#a3a3a3",
    className:
      "bg-background border-dashed border-muted-foreground text-foreground",
    childKind: "thought",
  },
};

/** Kinds you can pick for a bubble; "root" belongs to My Mind only. */
export const PICKABLE_KINDS = (
  Object.keys(BUBBLE_KINDS) as BubbleKind[]
).filter((kind) => kind !== "root");

/** Titles stay short so they fit in the bubble; longer thoughts go in the notes. */
export const MAX_LABEL_LENGTH = 40;

/** Bubbles get smaller the further they are from My Mind. */
const DEPTH_STYLES = [
  { size: 200, text: "text-xl", icon: "size-5" },
  { size: 150, text: "text-base", icon: "size-4" },
  { size: 120, text: "text-sm", icon: "size-4" },
  { size: 95, text: "text-xs", icon: "size-3.5" },
  { size: 80, text: "text-[11px]", icon: "size-3" },
  { size: 70, text: "text-[10px]", icon: "size-3" },
];

export function getDepthStyle(depth: number) {
  return DEPTH_STYLES[Math.min(Math.max(depth, 0), DEPTH_STYLES.length - 1)];
}

/** Diameter in px at 100% zoom. */
export function getBubbleSize(data: { depth: number }) {
  return getDepthStyle(data.depth).size;
}

export function getBubbleCenter(node: {
  position: { x: number; y: number };
  data: { depth: number };
}) {
  const size = getBubbleSize(node.data);
  return { x: node.position.x + size / 2, y: node.position.y + size / 2 };
}
