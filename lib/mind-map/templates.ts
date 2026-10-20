import type { Edge, Node } from "@xyflow/react";
import { getBubbleSize, type BubbleKind } from "./bubble-kinds";
import { BRANCH_EDGE } from "./graph";
import type { SavedMap } from "./storage";
import { tidyLayout } from "./tidy";

export type TemplateId = "blank" | "life" | "problem";

type Outline = { label: string; kind: BubbleKind; children?: Outline[] };

export const TEMPLATES: Record<
  TemplateId,
  { label: string; description: string; outline: Outline[] }
> = {
  blank: {
    label: "Blank",
    description: "Just the center bubble",
    outline: [],
  },
  life: {
    label: "Life map",
    description: "Starts with the big areas of your life",
    outline: [
      { label: "Dreams", kind: "area" },
      { label: "Career", kind: "area" },
      { label: "Health", kind: "area" },
      { label: "Relationships", kind: "area" },
      { label: "Money", kind: "area" },
    ],
  },
  problem: {
    label: "Problem solver",
    description: "Goal → Blocker → Root cause → Action, ready to fill in",
    outline: [
      {
        label: "Your goal",
        kind: "goal",
        children: [
          {
            label: "What's blocking it",
            kind: "blocker",
            children: [
              {
                label: "Why it's happening",
                kind: "root-cause",
                children: [{ label: "First step", kind: "action" }],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const ROOT_ID = "root";

/** A new chart's map: the center bubble, plus the template's starter bubbles laid out around it. */
export function buildTemplate(
  template: TemplateId,
  title: string,
  emoji: string,
): SavedMap {
  const rootSize = getBubbleSize({ depth: 0 });
  const nodes: Node[] = [
    {
      id: ROOT_ID,
      type: "bubble",
      // Centered on 0,0.
      position: { x: -rootSize / 2, y: -rootSize / 2 },
      data: { label: title, kind: "root", depth: 0, emoji },
      deletable: false,
    },
  ];
  const edges: Edge[] = [];

  const add = (outline: Outline[], parentId: string, depth: number) => {
    for (const { label, kind, children } of outline) {
      const id = crypto.randomUUID();
      nodes.push({
        id,
        type: "bubble",
        position: { x: 0, y: 0 },
        data: { label, kind, depth },
      });
      edges.push({
        id: `${parentId}->${id}`,
        source: parentId,
        target: id,
        type: BRANCH_EDGE,
        selectable: false,
        focusable: false,
      });
      if (children) add(children, id, depth + 1);
    }
  };
  add(TEMPLATES[template].outline, ROOT_ID, 1);

  const positions = tidyLayout(
    nodes as Node<{ depth: number }>[],
    edges,
    ROOT_ID,
  );
  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position,
    })),
    edges,
  };
}
