"use client";

import dynamic from "next/dynamic";

// The map loads from localStorage, which only exists in the browser,
// so skip server rendering instead of rendering an empty map first.
const MindMap = dynamic(() => import("./mind-map"), { ssr: false });

export default MindMap;
