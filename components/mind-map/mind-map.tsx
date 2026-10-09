"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useNodesState,
} from "@xyflow/react";
import BubbleNodeView, { type BubbleNode } from "./bubble-node";
import { BUBBLE_CLASSES } from "@/lib/mind-map/bubble-classes";

const nodeTypes = { bubble: BubbleNodeView };

const ROOT_SIZE = BUBBLE_CLASSES.root.size;

const initialNodes: BubbleNode[] = [
  {
    id: "root",
    type: "bubble",
    // Positions are top-left corners, so offset by half the size to center it on 0,0.
    position: { x: -ROOT_SIZE / 2, y: -ROOT_SIZE / 2 },
    data: { label: "My Mind", bubbleClass: "root" },
    deletable: false,
  },
];

export default function MindMap() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ maxZoom: 1 }}
      minZoom={0.1}
      maxZoom={3}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
