import { createContext, useContext } from "react";
import type { ChartKey } from "@/lib/mind-map/chart-key";

type MindMapContextValue = {
  /** The chart's key: the bubble types it uses. */
  chartKey: ChartKey;
  /** Open the chart key panel. */
  openKey: () => void;
  openNotes: (nodeId: string) => void;
  /** The details panel is showing, so a new bubble should take it over. */
  detailsOpen: boolean;
  openThreadNotes: (edgeId: string) => void;
  /** Hide or show everything branching off a bubble. */
  toggleCollapse: (nodeId: string) => void;
  /** How many bubbles branch off each bubble, at any depth. */
  descendantCounts: Map<string, number>;
  /** Start a new thread from this bubble. */
  startLink: (nodeId: string) => void;
  /** Keep adding bubbles to an existing thread. */
  addToThread: (edgeId: string) => void;
  deleteThread: (edgeId: string) => void;
  /** One link of a thread picked on its own, if any. */
  selectedLink: { threadId: string; memberId: string } | null;
  selectLink: (threadId: string, memberId: string | null) => void;
  /** Drop one bubble from a thread; the thread goes once it has none left. */
  removeLink: (threadId: string, memberId: string) => void;
  /** The bubble the thread being drawn comes from, if any. */
  linkOrigin: string | null;
  /** The thread being hovered or selected; everything else fades back. */
  focusEdgeId: string | null;
  /** Bubbles in the focused thread. */
  focusNodeIds: Set<string> | null;
  /** A thread is selected, so bubbles hold back their hover buttons. */
  threadSelected: boolean;
  /** The bubble a dragged bubble will move under if dropped now. */
  dropTargetId: string | null;
};

export const MindMapContext = createContext<MindMapContextValue | null>(null);

export function useMindMap() {
  const context = useContext(MindMapContext);
  if (!context) throw new Error("useMindMap must be used inside <MindMap>");
  return context;
}
