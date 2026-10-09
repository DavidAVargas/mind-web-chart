export type BubbleClass =
  | "root"
  | "main"
  | "sub-main"
  | "problem"
  | "small-issue"
  | "none";

type BubbleClassConfig = {
  label: string;
  /** Diameter in px at 100% zoom. */
  size: number;
  /** Tailwind classes for the bubble's fill, border and text. */
  className: string;
  /** Class a new bubble gets when added off this one. */
  childClass: BubbleClass;
};

export const BUBBLE_CLASSES: Record<BubbleClass, BubbleClassConfig> = {
  root: {
    label: "My Mind",
    size: 200,
    className:
      "bg-brand-600 border-brand-700 text-white text-xl font-semibold shadow-lg",
    childClass: "main",
  },
  main: {
    label: "Main",
    size: 150,
    className:
      "bg-brand-100 border-brand-500 text-brand-900 text-base font-semibold dark:bg-brand-900 dark:border-brand-400 dark:text-brand-50",
    childClass: "sub-main",
  },
  "sub-main": {
    label: "Sub-main",
    size: 115,
    className:
      "bg-sky-100 border-sky-500 text-sky-950 text-sm font-medium dark:bg-sky-950 dark:border-sky-400 dark:text-sky-50",
    childClass: "problem",
  },
  problem: {
    label: "Problem",
    size: 90,
    className:
      "bg-amber-100 border-amber-500 text-amber-950 text-xs font-medium dark:bg-amber-950 dark:border-amber-400 dark:text-amber-50",
    childClass: "small-issue",
  },
  "small-issue": {
    label: "Small issue",
    size: 70,
    className:
      "bg-rose-100 border-rose-400 text-rose-950 text-[11px] dark:bg-rose-950 dark:border-rose-400 dark:text-rose-50",
    childClass: "small-issue",
  },
  none: {
    label: "None",
    size: 100,
    className:
      "bg-background border-dashed border-muted-foreground text-foreground text-sm",
    childClass: "none",
  },
};
