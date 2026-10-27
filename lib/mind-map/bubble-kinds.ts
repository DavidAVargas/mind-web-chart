/**
 * Sizes and the center bubble's look. A bubble's color and icon come from its
 * type in the chart's key (see chart-key.ts); its size comes from how far out
 * it sits from the center, so types can be mixed freely.
 */

/** The center bubble: black in light mode, white in dark mode, so it stands apart from every type. */
export const ROOT_CLASS =
  "bg-foreground border-foreground text-background font-semibold shadow-lg";
export const ROOT_COLOR = "var(--foreground)";

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
