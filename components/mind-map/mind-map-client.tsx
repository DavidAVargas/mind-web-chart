"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// The map loads in the browser after sign-in, and React Flow needs the
// window, so skip server rendering.
const MindMap = dynamic(() => import("./mind-map"), { ssr: false });

/** Opens the chart named in the address, e.g. /chart?id=…. */
export default function MindMapClient() {
  const chartId = useSearchParams().get("id") ?? "";
  // A new key per chart starts the editor fresh, with its own undo history.
  return <MindMap key={chartId} chartId={chartId} />;
}
