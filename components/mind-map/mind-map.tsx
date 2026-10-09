"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type OnBeforeDelete,
  type OnDelete,
} from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import BubbleNodeView, { type BubbleNode } from "./bubble-node";
import ConnectorEdge from "./connector-edge";
import FloatingEdge from "./floating-edge";
import { MindMapContext } from "./mind-map-context";
import NotesPanel from "./notes-panel";
import { BUBBLE_CLASSES } from "@/lib/mind-map/bubble-classes";
import {
  BRANCH_EDGE,
  CONNECTOR_EDGE,
  getBranchIds,
  getThreadMembers,
  getThreadNodeIds,
  isBranch,
  THREAD_COLORS,
} from "@/lib/mind-map/graph";
import { loadMap, saveMap } from "@/lib/mind-map/storage";

const nodeTypes = { bubble: BubbleNodeView };
const edgeTypes = {
  [BRANCH_EDGE]: FloatingEdge,
  [CONNECTOR_EDGE]: ConnectorEdge,
};

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
  return (
    <ReactFlowProvider>
      <MindMapCanvas />
    </ReactFlowProvider>
  );
}

/** Wait this long after the last change before saving. */
const SAVE_DELAY_MS = 300;

type Linking = {
  /** The bubble the thread comes from. */
  originId: string;
  /** Set once the thread exists, so later taps add to it. */
  threadId?: string;
};

function MindMapCanvas() {
  const [saved] = useState(() => loadMap<BubbleNode>());
  const [nodes, , onNodesChange] = useNodesState(saved?.nodes ?? initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    saved?.edges ?? [],
  );
  const {
    getNode,
    getNodes,
    getEdge,
    getEdges,
    addNodes,
    addEdges,
    deleteElements,
  } = useReactFlow<BubbleNode, Edge>();
  const [notesNodeId, setNotesNodeId] = useState<string | null>(null);
  const [linking, setLinking] = useState<Linking | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  // Threads that lose some (not all) of their bubbles in a delete, as they were before.
  const threadsBeforeDelete = useRef<Edge[]>([]);

  // Hovering wins, then a selected thread, then the one being drawn.
  const focusEdge =
    edges.find((edge) => edge.id === hoveredEdgeId && !isBranch(edge)) ??
    edges.find((edge) => edge.selected && !isBranch(edge)) ??
    edges.find((edge) => edge.id === linking?.threadId);

  const context = useMemo(
    () => ({
      openNotes: setNotesNodeId,
      startLink: (originId: string) => setLinking({ originId }),
      addToThread: (edgeId: string) => {
        const edge = getEdge(edgeId);
        if (edge) setLinking({ originId: edge.source, threadId: edge.id });
      },
      deleteThread: (edgeId: string) =>
        deleteElements({ edges: [{ id: edgeId }] }),
      linkOrigin: linking?.originId ?? null,
      focusEdgeId: focusEdge?.id ?? null,
      focusNodeIds: focusEdge ? new Set(getThreadNodeIds(focusEdge)) : null,
    }),
    [linking, focusEdge, getEdge, deleteElements],
  );

  useEffect(() => {
    const timeout = setTimeout(() => saveMap(nodes, edges), SAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  useEffect(() => {
    if (!linking) return;
    const stopOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && setLinking(null);
    window.addEventListener("keydown", stopOnEscape);
    return () => window.removeEventListener("keydown", stopOnEscape);
  }, [linking]);

  // Deleting a bubble takes its whole branch with it. Branch lines only go
  // away with their bubbles, so a branch never ends up floating on its own.
  // A thread goes away with its origin or once it has no bubbles left;
  // otherwise it just lets go of the deleted ones.
  const onBeforeDelete: OnBeforeDelete<BubbleNode, Edge> = async (picked) => {
    const allEdges = getEdges();
    const ids = getBranchIds(
      picked.nodes.map((node) => node.id),
      allEdges,
    );
    const pickedEdgeIds = new Set(picked.edges.map((edge) => edge.id));
    const edgesToDelete: Edge[] = [];
    threadsBeforeDelete.current = [];

    for (const edge of allEdges) {
      if (isBranch(edge)) {
        if (ids.has(edge.source) || ids.has(edge.target)) {
          edgesToDelete.push(edge);
        }
        continue;
      }
      const members = getThreadMembers(edge);
      if (
        pickedEdgeIds.has(edge.id) ||
        ids.has(edge.source) ||
        members.every((member) => ids.has(member))
      ) {
        edgesToDelete.push(edge);
      } else if (members.some((member) => ids.has(member))) {
        threadsBeforeDelete.current.push(edge);
      }
    }

    return {
      nodes: getNodes().filter(
        (node) => ids.has(node.id) && node.deletable !== false,
      ),
      edges: edgesToDelete,
    };
  };

  const onDelete: OnDelete<BubbleNode, Edge> = ({
    nodes: deletedNodes,
    edges: deletedEdges,
  }) => {
    const deletedIds = new Set(deletedNodes.map((node) => node.id));
    const trimmedThreads = threadsBeforeDelete.current;
    const trimmedIds = new Set(trimmedThreads.map((edge) => edge.id));

    if (trimmedThreads.length) {
      setEdges((current) =>
        current.map((edge) => {
          if (!trimmedIds.has(edge.id)) return edge;
          const members = getThreadMembers(edge).filter(
            (member) => !deletedIds.has(member),
          );
          return {
            ...edge,
            target: members[0],
            data: { ...edge.data, members },
          };
        }),
      );
    }

    if (notesNodeId && deletedIds.has(notesNodeId)) setNotesNodeId(null);
    if (linking && deletedEdges.some((edge) => edge.id === linking.threadId)) {
      setLinking(null);
    }

    // A new bubble that was never named just disappears quietly.
    if (deletedNodes.length && deletedNodes.every((node) => node.data.isNew)) {
      return;
    }

    const [first] = deletedNodes;
    const message = first
      ? `Deleted “${first.data.label || "Untitled"}”` +
        (deletedNodes.length > 1 ? ` and ${deletedNodes.length - 1} more` : "")
      : "Deleted connector";

    toast(message, {
      action: {
        label: "Undo",
        onClick: () => {
          addNodes(deletedNodes.map((node) => ({ ...node, selected: false })));
          setEdges((current) => [
            ...current.filter((edge) => !trimmedIds.has(edge.id)),
            ...[...trimmedThreads, ...deletedEdges].map((edge) => ({
              ...edge,
              selected: false,
            })),
          ]);
        },
      },
    });
  };

  // Tapping bubbles while linking: the first tap starts the thread, every tap
  // after that hangs another bubble off it. Tapping the origin again finishes.
  function linkTo(nodeId: string) {
    if (!linking) return;
    if (nodeId === linking.originId) {
      setLinking(null);
      return;
    }

    const thread = linking.threadId ? getEdge(linking.threadId) : undefined;

    if (!thread) {
      const threadCount = getEdges().filter((edge) => !isBranch(edge)).length;
      const threadId = `thread:${crypto.randomUUID()}`;
      addEdges({
        id: threadId,
        source: linking.originId,
        target: nodeId,
        type: CONNECTOR_EDGE,
        data: {
          members: [nodeId],
          color: THREAD_COLORS[threadCount % THREAD_COLORS.length],
        },
      });
      setLinking({ ...linking, threadId });
      return;
    }

    const members = getThreadMembers(thread);
    if (members.includes(nodeId)) {
      toast("That bubble is already on this thread");
      return;
    }
    setEdges((current) =>
      current.map((edge) =>
        edge.id === thread.id
          ? { ...edge, data: { ...edge.data, members: [...members, nodeId] } }
          : edge,
      ),
    );
  }

  const originLabel = linking ? getNode(linking.originId)?.data.label : null;

  return (
    <MindMapContext value={context}>
      <div className="relative h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onBeforeDelete={onBeforeDelete}
          onDelete={onDelete}
          onNodeClick={(_, node) => linkTo(node.id)}
          onPaneClick={() => setLinking(null)}
          onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
          onEdgeMouseLeave={() => setHoveredEdgeId(null)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesConnectable={false}
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

        {linking && (
          <div
            role="status"
            className="border-border bg-card text-card-foreground absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border py-2 pr-2 pl-4 text-sm shadow-lg"
          >
            <span>
              {linking.threadId
                ? `Tap bubbles to add them to the “${originLabel || "Untitled"}” thread`
                : `Tap a bubble to connect it to “${originLabel || "Untitled"}”`}
            </span>
            <button
              type="button"
              onClick={() => setLinking(null)}
              className="hover:bg-accent rounded-full px-3 py-1 font-medium"
            >
              Done
            </button>
          </div>
        )}

        {notesNodeId && (
          <NotesPanel
            key={notesNodeId}
            nodeId={notesNodeId}
            onClose={() => setNotesNodeId(null)}
          />
        )}

        <Toaster position="bottom-center" />
      </div>
    </MindMapContext>
  );
}
