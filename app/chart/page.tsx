import type { Metadata } from "next";
import { Suspense } from "react";
import MindMapClient from "@/components/mind-map/mind-map-client";

export const metadata: Metadata = {
  title: "Chart",
};

export default function ChartPage() {
  return (
    // Reading ?id= from the address needs a Suspense boundary to prerender.
    <Suspense>
      <MindMapClient />
    </Suspense>
  );
}
