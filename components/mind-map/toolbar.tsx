import {
  Download,
  Ellipsis,
  KeyRound,
  Redo2,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import { getType, ROOT_KIND, type ChartKey } from "@/lib/mind-map/chart-key";
import { cn } from "@/lib/utils";
import type { BubbleNode } from "./bubble-node";

const MAX_RESULTS = 8;

function ToolButton({
  label,
  children,
  className,
  ...props
}: ComponentProps<"button"> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "hover:bg-accent flex size-9 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-35",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  children,
  className,
  ...props
}: ComponentProps<"button"> & { icon: ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export default function Toolbar({
  nodes,
  searchRef,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPick,
  onTidy,
  onExport,
  onImport,
  onClear,
  chartKey,
  keyOpen,
  onToggleKey,
}: {
  nodes: BubbleNode[];
  searchRef: RefObject<HTMLInputElement | null>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPick: (nodeId: string) => void;
  onTidy: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
  chartKey: ChartKey;
  keyOpen: boolean;
  onToggleKey: () => void;
}) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when tapping anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [menuOpen]);

  const needle = query.trim().toLowerCase();
  const results = needle
    ? nodes
        .filter(
          (node) =>
            node.data.label.toLowerCase().includes(needle) ||
            node.data.note?.toLowerCase().includes(needle),
        )
        .slice(0, MAX_RESULTS)
    : [];

  function pick(nodeId: string) {
    onPick(nodeId);
    setQuery("");
    searchRef.current?.blur();
  }

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      <div className="border-border bg-card text-card-foreground flex items-center gap-0.5 rounded-xl border p-1 shadow-md">
        <ToolButton label="Undo (⌘Z)" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="size-4" aria-hidden="true" />
        </ToolButton>
        <ToolButton label="Redo (⇧⌘Z)" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="size-4" aria-hidden="true" />
        </ToolButton>
        <ToolButton label="Tidy up" onClick={onTidy}>
          <Sparkles className="size-4" aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label="Chart key"
          aria-expanded={keyOpen}
          onClick={onToggleKey}
          className={cn(keyOpen && "bg-accent")}
        >
          <KeyRound className="size-4" aria-hidden="true" />
        </ToolButton>

        <div ref={menuRef} className="relative">
          <ToolButton
            label="More"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Ellipsis className="size-4" aria-hidden="true" />
          </ToolButton>
          {menuOpen && (
            <div
              role="menu"
              onClick={() => setMenuOpen(false)}
              className="border-border bg-popover text-popover-foreground absolute top-full left-0 mt-2 w-52 rounded-xl border p-1 shadow-lg"
            >
              <MenuItem
                icon={<Download className="size-4" aria-hidden="true" />}
                onClick={onExport}
              >
                Export backup
              </MenuItem>
              <MenuItem
                icon={<Upload className="size-4" aria-hidden="true" />}
                onClick={() => fileRef.current?.click()}
              >
                Import backup
              </MenuItem>
              <MenuItem
                icon={<Trash2 className="size-4" aria-hidden="true" />}
                onClick={onClear}
                className="text-destructive"
              >
                Clear map
              </MenuItem>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = "";
          }}
        />

        <label className="relative ml-1 flex items-center">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-2.5 size-4"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Search…"
            aria-label="Search bubbles"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results[0]) pick(results[0].id);
              if (event.key === "Escape") {
                setQuery("");
                event.currentTarget.blur();
              }
            }}
            className="bg-background border-input w-36 rounded-lg border py-1.5 pr-2 pl-8 text-sm sm:w-48"
          />
        </label>
      </div>

      {needle && (
        <ul className="border-border bg-popover text-popover-foreground w-full max-w-sm rounded-xl border p-1 shadow-lg">
          {results.length ? (
            results.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => pick(node.id)}
                  className="hover:bg-accent flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm"
                >
                  <span className="truncate">
                    {node.data.label || "Untitled"}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {node.data.kind === ROOT_KIND
                      ? "Center"
                      : getType(chartKey, node.data.kind).label}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground px-3 py-2 text-sm">
              No bubbles match “{query.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
