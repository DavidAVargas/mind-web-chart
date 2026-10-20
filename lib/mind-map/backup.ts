import type { Node } from "@xyflow/react";
import { parseSavedMap, type SavedMap } from "./storage";

/** Downloads the map as a JSON file you can keep as a backup. */
export function exportMap(map: SavedMap) {
  const blob = new Blob([JSON.stringify(map, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `thoughtspun-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Reads a backup file; returns null if it isn't a mind map backup. */
export async function importMap<N extends Node>(
  file: File,
): Promise<SavedMap<N> | null> {
  try {
    return parseSavedMap<N>(JSON.parse(await file.text()));
  } catch {
    return null;
  }
}
