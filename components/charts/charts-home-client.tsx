"use client";

import dynamic from "next/dynamic";

// Charts are listed from localStorage, which only exists in the browser.
const ChartsHome = dynamic(() => import("./charts-home"), { ssr: false });

export default ChartsHome;
