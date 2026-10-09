"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
} from "@xyflow/react";
import BubbleNodeView, { type BubbleNode } from "./bubble-node";
import FloatingEdge from "./floating-edge";
import { BUBBLE_CLASSES } from "@/lib/mind-map/bubble-classes";

const nodeTypes = { bubble: BubbleNodeView };
const edgeTypes = { floating: FloatingEdge };

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
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesConnectable={false}
      // Deleting comes in a later step, so the Delete key does nothing for now.
      deleteKeyCode={null}
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
