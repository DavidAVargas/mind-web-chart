"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type OnNodeDrag,
  type OnBeforeDelete,
  type OnDelete,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import BubbleNodeView, { type BubbleNode } from "./bubble-node";
import ThreadEdge from "./thread-edge";
import FloatingEdge from "./floating-edge";
import { MindMapContext } from "./mind-map-context";
import LinkingChip from "./linking-chip";
import NotesPanel from "./notes-panel";
import ThreadPanel from "./thread-panel";
import Toolbar from "./toolbar";
import { useHistory } from "./use-history";
import {
  BUBBLE_KINDS,
  getBubbleCenter,
  getBubbleSize,
} from "@/lib/mind-map/bubble-kinds";
import {
  BRANCH_EDGE,
  THREAD_EDGE,
  getBranchIds,
  getParentId,
  getThreadMembers,
  getThreadNodeIds,
  isBranch,
  THREAD_COLORS,
} from "@/lib/mind-map/graph";
import { getUndroppableIds, moveBranch } from "@/lib/mind-map/move";
import { exportMap, importMap } from "@/lib/mind-map/backup";
import { DEFAULT_EMOJI, loadChart, saveChart } from "@/lib/mind-map/charts";
import { toSavedMap, type SavedMap } from "@/lib/mind-map/storage";
import { ROOT_ID } from "@/lib/mind-map/templates";
import Link from "next/link";
import ChartDialog from "@/components/charts/chart-dialog";
import ChartHeader from "./chart-header";
import { tidyLayout } from "@/lib/mind-map/tidy";
import { APP_NAME } from "@/lib/brand";

const nodeTypes = { bubble: BubbleNodeView };
const edgeTypes = {
  [BRANCH_EDGE]: FloatingEdge,
  [THREAD_EDGE]: ThreadEdge,
};

export default function MindMap({ chartId }: { chartId: string }) {
  const [initial] = useState(() => loadChart<BubbleNode>(chartId));

  if (!initial) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold">This chart doesn&apos;t exist</p>
        <p className="text-muted-foreground text-sm">
          It may have been deleted, or it was made in a different browser.
        </p>
        <Link
          href="/charts"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Back to all charts
        </Link>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <MindMapCanvas chartId={chartId} initial={initial} />
    </ReactFlowProvider>
  );
}

/** Wait this long after the last change before saving. */
const SAVE_DELAY_MS = 300;

/** How long the tidy-up animation takes. */
const TIDY_MS = 450;

type Details = { kind: "bubble" | "thread"; id: string };

type Linking = {
  /** The bubble the thread comes from. */
  originId: string;
  /** Set once the thread exists, so later taps add to it. */
  threadId?: string;
  /**
   * Keep adding until Done. Off for a fresh 🔗, which connects one bubble
   * and stops, so stray taps don't add links by mistake.
   */
  multi?: boolean;
  /** Bubbles added so far in this round. */
  added?: number;
  /** After a single link: the bubble it went to, while Add more / Done shows. */
  connectedTo?: string;
};

function MindMapCanvas({
  chartId,
  initial,
}: {
  chartId: string;
  initial: SavedMap<BubbleNode>;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const [renaming, setRenaming] = useState(false);
  const {
    getNode,
    getNodes,
    getEdge,
    getEdges,
    addNodes,
    addEdges,
    deleteElements,
    fitView,
  } = useReactFlow<BubbleNode, Edge>();
  const [details, setDetails] = useState<Details | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [linking, setLinking] = useState<Linking | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  // Threads that lose some (not all) of their bubbles in a delete, as they were before.
  const threadsBeforeDelete = useRef<Edge[]>([]);
  // The bubble a dragged bubble would move under if dropped now.
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const dragStart = useRef<{ nodes: BubbleNode[]; edges: Edge[] } | null>(null);

  const savedMap = useMemo(() => toSavedMap(nodes, edges), [nodes, edges]);
  const applyMap = useCallback(
    (map: SavedMap) => {
      setNodes(map.nodes as BubbleNode[]);
      setEdges(map.edges);
    },
    [setNodes, setEdges],
  );
  const { undo, redo, canUndo, canRedo } = useHistory(savedMap, applyMap);

  // Everything under a collapsed bubble is hidden.
  const hiddenIds = useMemo(() => {
    const ids = new Set<string>();
    for (const node of nodes) {
      if (!node.data.collapsed) continue;
      for (const id of getBranchIds([node.id], edges)) {
        if (id !== node.id) ids.add(id);
      }
    }
    return ids;
  }, [nodes, edges]);

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => {
        const hidden = hiddenIds.has(node.id);
        return Boolean(node.hidden) === hidden ? node : { ...node, hidden };
      }),
    [nodes, hiddenIds],
  );

  // A thread hides along with its target bubble, so point it at a member
  // that's still showing.
  const displayEdges = useMemo(
    () =>
      edges.map((edge) => {
        if (isBranch(edge) || !hiddenIds.has(edge.target)) return edge;
        const visible = getThreadMembers(edge).find((id) => !hiddenIds.has(id));
        return visible ? { ...edge, target: visible } : edge;
      }),
    [edges, hiddenIds],
  );

  const descendantCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const childrenOf = new Map<string, string[]>();
    for (const edge of edges) {
      if (isBranch(edge)) {
        childrenOf.set(edge.source, [
          ...(childrenOf.get(edge.source) ?? []),
          edge.target,
        ]);
      }
    }
    const count = (id: string): number => {
      const total = (childrenOf.get(id) ?? []).reduce(
        (sum, kid) => sum + 1 + count(kid),
        0,
      );
      counts.set(id, total);
      return total;
    };
    for (const node of nodes) if (!counts.has(node.id)) count(node.id);
    return counts;
  }, [nodes, edges]);

  const [selectedLink, setSelectedLink] = useState<{
    threadId: string;
    memberId: string;
  } | null>(null);

  // Hovering wins, then a selected thread, then the one being drawn.
  const focusEdge =
    edges.find((edge) => edge.id === hoveredEdgeId && !isBranch(edge)) ??
    edges.find((edge) => edge.selected && !isBranch(edge)) ??
    edges.find((edge) => edge.id === linking?.threadId);

  const context = useMemo(
    () => ({
      openNotes: (id: string) => setDetails({ kind: "bubble", id }),
      detailsOpen: details !== null,
      openThreadNotes: (id: string) => setDetails({ kind: "thread", id }),
      toggleCollapse: (id: string) =>
        setNodes((current) =>
          current.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: { ...node.data, collapsed: !node.data.collapsed },
                }
              : node,
          ),
        ),
      descendantCounts,
      startLink: (originId: string) => setLinking({ originId }),
      addToThread: (edgeId: string) => {
        const edge = getEdge(edgeId);
        if (edge) {
          setLinking({ originId: edge.source, threadId: edge.id, multi: true });
        }
      },
      deleteThread: (edgeId: string) =>
        deleteElements({ edges: [{ id: edgeId }] }),
      // Only while picking bubbles; not while the "Connected" chip waits.
      linkOrigin: linking && !linking.connectedTo ? linking.originId : null,
      threadSelected: edges.some((edge) => edge.selected && !isBranch(edge)),
      focusEdgeId: focusEdge?.id ?? null,
      focusNodeIds: !focusEdge
        ? null
        : focusEdge.selected && selectedLink?.threadId === focusEdge.id
          ? // One link picked: just its two ends stay bright.
            new Set([focusEdge.source, selectedLink.memberId])
          : new Set(getThreadNodeIds(focusEdge)),
      selectedLink,
      selectLink: (threadId: string, memberId: string | null) =>
        setSelectedLink(memberId ? { threadId, memberId } : null),
      removeLink: (threadId: string, memberId: string) => {
        const thread = getEdge(threadId);
        if (!thread) return;
        const members = getThreadMembers(thread).filter((m) => m !== memberId);
        setSelectedLink(null);
        if (!members.length) {
          deleteElements({ edges: [{ id: threadId }] });
          return;
        }
        setEdges((current) =>
          current.map((edge) =>
            edge.id === threadId
              ? {
                  ...edge,
                  target: members[0],
                  data: { ...edge.data, members },
                }
              : edge,
          ),
        );
        toast("Removed that link from the thread", {
          action: { label: "Undo", onClick: undo },
        });
      },
      dropTargetId,
    }),
    [
      linking,
      details,
      focusEdge,
      dropTargetId,
      descendantCounts,
      selectedLink,
      edges,
      undo,
      setEdges,
      getEdge,
      deleteElements,
      setNodes,
    ],
  );

  useEffect(() => {
    const timeout = setTimeout(
      () => saveChart(chartId, savedMap),
      SAVE_DELAY_MS,
    );
    return () => clearTimeout(timeout);
  }, [chartId, savedMap]);

  // ⌘Z / Ctrl+Z undo, ⇧⌘Z / Ctrl+Y redo, ⌘K or / to search. Typing in a text
  // box keeps the browser's own undo for that text.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement).closest(
        "input, textarea, select, [contenteditable='true']",
      );
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if ((mod && key === "k") || (!typing && key === "/")) {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (!typing && mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (!typing && mod && key === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    if (!linking) return;
    const stopOnEscape = (event: KeyboardEvent) =>
      (event.key === "Escape" || event.key === "Enter") && setLinking(null);
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

    if (
      details &&
      (deletedIds.has(details.id) ||
        deletedEdges.some((edge) => edge.id === details.id))
    ) {
      setDetails(null);
    }
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
      : "Deleted thread";

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
    // The "Connected" chip is waiting for Add more or Done; a tap elsewhere ends it.
    if (linking.connectedTo || nodeId === linking.originId) {
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
        type: THREAD_EDGE,
        data: {
          members: [nodeId],
          color: THREAD_COLORS[threadCount % THREAD_COLORS.length],
        },
      });
      setLinking({ ...linking, threadId, connectedTo: nodeId });
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
    setLinking({ ...linking, added: (linking.added ?? 0) + 1 });
  }

  // Dragging a bubble onto another one moves it, and its branch, under that bubble.
  const onNodeDragStart: OnNodeDrag<BubbleNode> = () => {
    dragStart.current = { nodes: getNodes(), edges: getEdges() };
  };

  const onNodeDrag: OnNodeDrag<BubbleNode> = (_, dragged, draggedNodes) => {
    if (draggedNodes.length !== 1 || dragged.data.kind === "root") {
      return;
    }
    const edges = getEdges();
    const undroppable = getUndroppableIds(dragged.id, edges);
    const currentParent = edges.find(
      (edge) => isBranch(edge) && edge.target === dragged.id,
    )?.source;
    const center = getBubbleCenter(dragged);

    const target = getNodes().find((node) => {
      if (node.hidden || undroppable.has(node.id) || node.id === currentParent)
        return false;
      const nodeCenter = getBubbleCenter(node);
      return (
        Math.hypot(nodeCenter.x - center.x, nodeCenter.y - center.y) <
        getBubbleSize(node.data) / 2
      );
    });
    setDropTargetId(target?.id ?? null);
  };

  const onNodeDragStop: OnNodeDrag<BubbleNode> = (_, dragged) => {
    const targetId = dropTargetId;
    const before = dragStart.current;
    setDropTargetId(null);
    dragStart.current = null;
    if (!targetId || !before) return;

    const moved = moveBranch(nodes, edges, dragged.id, targetId);
    setNodes(moved.nodes);
    setEdges(moved.edges);

    const targetLabel = getNode(targetId)?.data.label || "Untitled";
    toast(
      `Moved “${dragged.data.label || "Untitled"}” under “${targetLabel}”`,
      {
        action: {
          label: "Undo",
          onClick: () => {
            setNodes(before.nodes);
            setEdges(before.edges);
          },
        },
      },
    );
  };

  // Search: open any collapsed branch the bubble is in, then fly to it.
  function reveal(nodeId: string) {
    const ancestors = new Set<string>();
    for (let id = getParentId(nodeId, edges); id; id = getParentId(id, edges)) {
      ancestors.add(id);
    }
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        selected: node.id === nodeId,
        data:
          ancestors.has(node.id) && node.data.collapsed
            ? { ...node.data, collapsed: false }
            : node.data,
      })),
    );
    // Wait a frame so newly shown bubbles are measured before zooming.
    requestAnimationFrame(() =>
      fitView({ nodes: [{ id: nodeId }], duration: 500, maxZoom: 1.2 }),
    );
  }

  function tidy() {
    const targets = tidyLayout(nodes, edges, "root");
    const starts = new Map(nodes.map((node) => [node.id, node.position]));
    const startedAt = performance.now();

    const frame = (now: number) => {
      const t = Math.min(1, (now - startedAt) / TIDY_MS);
      const eased = 1 - (1 - t) ** 3;
      setNodes((current) =>
        current.map((node) => {
          const from = starts.get(node.id);
          const to = targets.get(node.id);
          if (!from || !to) return node;
          return {
            ...node,
            position: {
              x: from.x + (to.x - from.x) * eased,
              y: from.y + (to.y - from.y) * eased,
            },
          };
        }),
      );
      if (t < 1) requestAnimationFrame(frame);
      else fitView({ duration: 400, maxZoom: 1 });
    };
    requestAnimationFrame(frame);
  }

  function replaceMap(map: SavedMap<BubbleNode>, message: string) {
    setNodes(map.nodes);
    setEdges(map.edges);
    setDetails(null);
    setLinking(null);
    requestAnimationFrame(() => fitView({ duration: 400, maxZoom: 1 }));
    toast(message, { action: { label: "Undo", onClick: undo } });
  }

  async function handleImport(file: File) {
    const map = await importMap<BubbleNode>(file);
    if (map) replaceMap(map, "Backup imported");
    else toast.error(`That file isn't a ${APP_NAME} backup`);
  }

  // The center bubble carries the chart's name and emoji.
  const root = nodes.find((node) => node.id === ROOT_ID);
  const title = root?.data.label || "Untitled";
  const emoji = root?.data.emoji || DEFAULT_EMOJI;

  const linkOriginNode = linking
    ? nodes.find((node) => node.id === linking.originId)
    : undefined;

  return (
    <MindMapContext value={context}>
      <div className="flex h-full flex-col">
        <ChartHeader
          title={title}
          emoji={emoji}
          onRename={() => setRenaming(true)}
        />
        <div className="relative min-h-0 flex-1">
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onBeforeDelete={onBeforeDelete}
            onDelete={onDelete}
            onNodeClick={(event, node) => {
              // Clicks on a bubble's own buttons (+, ✓, …) aren't clicks on the bubble.
              if (
                (event.target as HTMLElement).closest(
                  "button, input, textarea, select",
                )
              ) {
                return;
              }
              if (linking) linkTo(node.id);
              // With the details panel open, clicking another bubble shows its details.
              else if (details) setDetails({ kind: "bubble", id: node.id });
            }}
            onEdgeClick={(_, edge) => {
              if (selectedLink && selectedLink.threadId !== edge.id) {
                setSelectedLink(null);
              }
              if (details && !isBranch(edge)) {
                setDetails({ kind: "thread", id: edge.id });
              }
            }}
            onPaneClick={() => {
              setLinking(null);
              setSelectedLink(null);
            }}
            onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
            onEdgeMouseLeave={() => setHoveredEdgeId(null)}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesConnectable={false}
            // A click with a little hand wobble still counts as a click, not a drag.
            nodeClickDistance={5}
            paneClickDistance={5}
            // No dragging while connecting, so every tap on a bubble picks it.
            nodesDraggable={!linking}
            fitView
            fitViewOptions={{ maxZoom: 1 }}
            minZoom={0.1}
            maxZoom={3}
            zoomOnDoubleClick={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} />
            <Controls showInteractive={false} />
            <MiniMap<BubbleNode>
              pannable
              zoomable
              nodeColor={(node) => BUBBLE_KINDS[node.data.kind].color}
              nodeStrokeWidth={0}
              nodeBorderRadius={9999}
              ariaLabel="Map overview"
              // Too cramped on phones; pinch and drag cover it there.
              className="max-sm:hidden"
            />
            {linking && linkOriginNode && (
              <LinkingChip
                origin={linkOriginNode}
                step={
                  linking.connectedTo
                    ? "connected"
                    : linking.multi
                      ? "multi"
                      : "pick"
                }
                targetLabel={
                  linking.connectedTo
                    ? getNode(linking.connectedTo)?.data.label
                    : undefined
                }
                added={linking.added}
                onAddMore={() =>
                  setLinking({
                    originId: linking.originId,
                    threadId: linking.threadId,
                    multi: true,
                  })
                }
                onDone={() => setLinking(null)}
              />
            )}
          </ReactFlow>

          <Toolbar
            nodes={nodes}
            searchRef={searchRef}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onPick={reveal}
            onTidy={tidy}
            onExport={() => exportMap(savedMap)}
            onImport={handleImport}
            onClear={() =>
              replaceMap(
                {
                  nodes: root
                    ? [
                        {
                          ...root,
                          position: {
                            x: -getBubbleSize(root.data) / 2,
                            y: -getBubbleSize(root.data) / 2,
                          },
                          selected: false,
                        },
                      ]
                    : [],
                  edges: [],
                },
                "Map cleared",
              )
            }
          />

          {details?.kind === "bubble" && (
            <NotesPanel
              key={details.id}
              nodeId={details.id}
              onClose={() => setDetails(null)}
            />
          )}
          {details?.kind === "thread" && (
            <ThreadPanel
              key={details.id}
              edgeId={details.id}
              onClose={() => setDetails(null)}
            />
          )}

          <Toaster position="bottom-center" />
        </div>
      </div>

      {renaming && (
        <ChartDialog
          mode="rename"
          initialTitle={title}
          initialEmoji={emoji}
          onClose={() => setRenaming(false)}
          onSubmit={(result) => {
            setRenaming(false);
            setNodes((current) =>
              current.map((node) =>
                node.id === ROOT_ID
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        label: result.title,
                        emoji: result.emoji,
                      },
                    }
                  : node,
              ),
            );
          }}
        />
      )}
    </MindMapContext>
  );
}
