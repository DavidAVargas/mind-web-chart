import type { Node, NodeProps } from "@xyflow/react";
import { BUBBLE_CLASSES, type BubbleClass } from "@/lib/mind-map/bubble-classes";
import { cn } from "@/lib/utils";

export type BubbleData = {
  label: string;
  bubbleClass: BubbleClass;
};

export type BubbleNode = Node<BubbleData, "bubble">;

export default function BubbleNodeView({ data, selected }: NodeProps<BubbleNode>) {
  const config = BUBBLE_CLASSES[data.bubbleClass];

  return (
    <div
      style={{ width: config.size, height: config.size }}
      className={cn(
        "flex items-center justify-center rounded-full border-2 p-3 text-center leading-tight break-words transition-shadow",
        config.className,
        selected && "ring-4 ring-ring/50",
      )}
    >
      {data.label}
    </div>
  );
}
