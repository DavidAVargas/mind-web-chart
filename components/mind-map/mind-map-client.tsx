"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// The map loads from localStorage, which only exists in the browser,
// so skip server rendering instead of rendering an empty map first.
const MindMap = dynamic(() => import("./mind-map"), { ssr: false });

/** Opens the chart named in the address, e.g. /chart?id=…. */
export default function MindMapClient() {
  const chartId = useSearchParams().get("id") ?? "";
  // A new key per chart starts the editor fresh, with its own undo history.
  return <MindMap key={chartId} chartId={chartId} />;
}
