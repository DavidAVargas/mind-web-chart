import { createContext, useContext } from "react";

type MindMapContextValue = {
  openNotes: (nodeId: string) => void;
};

export const MindMapContext = createContext<MindMapContextValue | null>(null);

export function useMindMap() {
  const context = useContext(MindMapContext);
  if (!context) throw new Error("useMindMap must be used inside <MindMap>");
  return context;
}
