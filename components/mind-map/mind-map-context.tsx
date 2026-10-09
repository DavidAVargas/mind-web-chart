import { createContext, useContext } from "react";

type MindMapContextValue = {
  openNotes: (nodeId: string) => void;
  /** Start a new connector thread from this bubble. */
  startLink: (nodeId: string) => void;
  /** Keep adding bubbles to an existing thread. */
  addToThread: (edgeId: string) => void;
  deleteThread: (edgeId: string) => void;
  /** The bubble the thread being drawn comes from, if any. */
  linkOrigin: string | null;
  /** The thread being hovered or selected; everything else fades back. */
  focusEdgeId: string | null;
  /** Bubbles in the focused thread. */
  focusNodeIds: Set<string> | null;
};

export const MindMapContext = createContext<MindMapContextValue | null>(null);

export function useMindMap() {
  const context = useContext(MindMapContext);
  if (!context) throw new Error("useMindMap must be used inside <MindMap>");
  return context;
}
