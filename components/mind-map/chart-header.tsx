import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import ModeToggle from "@/components/utility/mode-toggle";

/** The bar above a chart: back to all charts, the chart's name, the theme toggle and your profile. */
export default function ChartHeader({
  title,
  emoji,
  onRename,
}: {
  title: string;
  emoji: string;
  onRename: () => void;
}) {
  return (
    <header className="border-border flex h-12 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
      <Link
        href="/charts"
        className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <LogoMark className="size-5" />
        <span className="max-sm:sr-only">All charts</span>
      </Link>
      <span className="bg-border h-5 w-px" aria-hidden="true" />
      <button
        type="button"
        onClick={onRename}
        title="Rename chart"
        className="group hover:bg-accent flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 font-semibold"
      >
        <span aria-hidden="true">{emoji}</span>
        <span className="truncate">{title}</span>
        <Pencil
          className="text-muted-foreground size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <ModeToggle />
        <div className="flex size-7 items-center justify-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
